'use client'
import { useRef, useState } from 'react'
import { Info } from 'lucide-react'
import type { TokenizerData } from '../lib/types'
import { createByteBPE } from '../lib/bpe'
import { useTokenizer } from '../lib/TokenizerContext'
import VocabExplorer from './VocabExplorer'
import Stats from './Stats'

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
  const [vocabSize, setVocabSize] = useState('')
  const [status, setStatus] = useState<Status>({ phase: 'idle' })
  const workerRef = useRef<Worker | null>(null)
  const { setTrained, setActiveId } = useTokenizer()

  const startTraining = async () => {
    if (!files.length) return
    const target = Number(vocabSize) || 3500
    setStatus({ phase: 'training', progress: { done: 0, total: target - 256 } })
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
        setTrained(createByteBPE(msg.data))
        setActiveId('trained')
        worker.terminate()
      } else if (msg.type === 'error') {
        setStatus({ phase: 'error', message: msg.message })
        worker.terminate()
      }
    }
    worker.postMessage({ texts, vocabSize: target })
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

  return (
    <div className="view">
      <Stats />
      <div className="divider" />
      <h2>Train your own tokenizer</h2>
      <p>Upload one or more .txt files. Training runs entirely in your browser.</p>
      <label className="file-button">
        Choose Files
        <input
          type="file"
          accept=".txt,text/plain"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </label>
      {files.length > 0 && (
        <p className="files">
          Loaded {files.length} file(s): {files.map((f) => f.name).join(', ')}
        </p>
      )}
      <div className="field">
        <label htmlFor="vocab">
          Target vocab size
          <span className="field-tooltip" tabIndex={0}>
            <Info size={12} aria-hidden="true" />
            <span className="field-tooltip-text">
              Number of tokens to create, including base UTF-8 tokens
            </span>
          </span>
        </label>
        <input
          id="vocab"
          type="number"
          min={256}
          max={100000}
          value={vocabSize}
          onChange={(e) => {
            const v = e.target.value
            if (v !== '' && (Number(v) < 0 || Number.isNaN(Number(v)))) return
            setVocabSize(v)
          }}
        />
      </div>
      <button onClick={startTraining} disabled={!files.length || status.phase === 'training'}>
        {status.phase === 'training' ? 'Training...' : 'Train'}
      </button>

      {status.phase === 'done' && (
        <p className="success">Training complete. Vocab: {status.data.vocab_size} tokens.</p>
      )}
      {status.phase === 'done' && (
        <button onClick={download}>Download tokenizer.json</button>
      )}

      <VocabExplorer />
      <div className="divider" />

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

      {status.phase === 'error' && <p className="error">{status.message}</p>}
    </div>
  )
}
