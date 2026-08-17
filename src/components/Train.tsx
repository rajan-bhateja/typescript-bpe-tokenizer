'use client'
import { useMemo, useRef, useState } from 'react'
import type { TokenizerData } from '../lib/types'
import { createByteBPE, decode, encode, loadDefaultTokenizer, tokenLabel } from '../lib/bpe'
import VocabExplorer, { type VocabSource } from './VocabExplorer'

interface Progress {
  done: number
  total: number
}

type Status =
  | { phase: 'idle' }
  | { phase: 'training'; progress: Progress }
  | { phase: 'done'; data: TokenizerData }
  | { phase: 'error'; message: string }

export default function Train() {
  const [files, setFiles] = useState<File[]>([])
  const [vocabSize, setVocabSize] = useState(3500)
  const [status, setStatus] = useState<Status>({ phase: 'idle' })
  const [testText, setTestText] = useState('')
  const workerRef = useRef<Worker | null>(null)

  const defaultBpe = useMemo(() => loadDefaultTokenizer(), [])
  const trainedBpe = useMemo(
    () => (status.phase === 'done' ? createByteBPE(status.data) : null),
    [status]
  )
  const vocabSources: VocabSource[] = [
    { id: 'default', label: 'Default (prebuilt)', bpe: defaultBpe },
    ...(trainedBpe ? [{ id: 'trained', label: 'Trained', bpe: trainedBpe }] : []),
  ]

  const startTraining = async () => {
    if (!files.length) return
    setStatus({ phase: 'training', progress: { done: 0, total: vocabSize - 256 } })
    const texts: string[] = []
    for (const f of files) texts.push(await f.text())

    const worker = new Worker(new URL('../workers/train.worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    worker.onmessage = (e) => {
      const msg = e.data
      if (msg.type === 'progress') {
        setStatus({ phase: 'training', progress: { done: msg.done, total: msg.total } })
      } else if (msg.type === 'done') {
        setStatus({ phase: 'done', data: msg.data })
        worker.terminate()
      } else if (msg.type === 'error') {
        setStatus({ phase: 'error', message: msg.message })
        worker.terminate()
      }
    }
    worker.postMessage({ texts, vocabSize })
  }

  const download = () => {
    if (status.phase !== 'done') return
    const blob = new Blob([JSON.stringify(status.data)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'trained-tokenizer.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const testResult = (() => {
    if (status.phase !== 'done' || !testText) return null
    const bpe = createByteBPE(status.data)
    const ids = encode(testText, bpe)
    return { bpe, ids, roundtrip: decode(ids, bpe), matches: decode(ids, bpe) === testText }
  })()

  return (
    <div className="view">
      <h2>Train your own tokenizer</h2>
      <p>Upload one or more .txt files. Training runs entirely in your browser.</p>
      <input
        type="file"
        accept=".txt,text/plain"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
      />
      {files.length > 0 && (
        <p className="files">
          Loaded {files.length} file(s): {files.map((f) => f.name).join(', ')}
        </p>
      )}
      <div className="field">
        <label htmlFor="vocab">Target vocab size</label>
        <input
          id="vocab"
          type="number"
          min={256}
          max={100000}
          value={vocabSize}
          onChange={(e) => setVocabSize(Number(e.target.value))}
        />
      </div>
      <button onClick={startTraining} disabled={!files.length || status.phase === 'training'}>
        {status.phase === 'training' ? 'Training...' : 'Train'}
      </button>

      <VocabExplorer sources={vocabSources} />

      {status.phase === 'training' && (
        <div className="progress">
          <div className="progress-track">
            <div
              className="progress-bar"
              style={{ width: `${(status.progress.done / Math.max(1, status.progress.total)) * 100}%` }}
            />
          </div>
          <span>
            {status.progress.done} / {status.progress.total} merges
          </span>
        </div>
      )}

      {status.phase === 'done' && (
        <>
          <p className="success">Training complete. Vocab: {status.data.vocab_size} tokens.</p>
          <button onClick={download}>Download tokenizer.json</button>

          <h3>Test your tokenizer</h3>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            placeholder="Type text to encode/decode with your trained tokenizer..."
          />
          {testResult && (
            <div className="test-output">
              <p>
                <span className="label">Token IDs:</span> {testResult.ids.join(' ')}
              </p>
              <p>
                <span className="label">Round-trip matches:</span>{' '}
                {testResult.matches ? 'yes' : 'no'}
              </p>
              <p className="label">Tokens:</p>
              <div className="tokens">
                {testResult.ids.map((id, i) => {
                  const t = testResult.bpe.vocab[id]
                  const label = t ? tokenLabel(t) : '?'
                  return (
                    <span key={i} className="token" title={`id ${id}`}>
                      <span className="token-content">{label === '\n' ? '\\n' : label}</span>
                      <span className="token-id">{id}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {status.phase === 'error' && <p className="error">{status.message}</p>}
    </div>
  )
}
