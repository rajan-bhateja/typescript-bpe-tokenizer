'use client'
import { useState } from 'react'
import type { ByteBPE } from '../lib/bpe'
import { tokenLabel } from '../lib/bpe'

export interface VocabSource {
  id: string
  label: string
  bpe: ByteBPE
}

export default function VocabExplorer({ sources }: { sources: VocabSource[] }) {
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '')
  const [idInput, setIdInput] = useState('')

  const source = sources.find((s) => s.id === sourceId) ?? sources[0]
  const bpe = source?.bpe

  const parsed = Number(idInput)
  const valid = bpe && Number.isInteger(parsed) && parsed >= 0 && parsed < bpe.vocabSize
  const entry = valid && bpe ? bpe.vocab[parsed] : null
  const content = entry ? tokenLabel(entry) : ''
  const bytes = entry ? entry.bytes : []

  return (
    <div className="vocab-explorer">
      <h3>Vocabulary explorer</h3>
      <p>Look up a token by its id to inspect the byte sequence it stores.</p>
      <div className="vocab-controls">
        {sources.length > 1 && (
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            aria-label="Vocabulary source"
          >
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          min={0}
          max={bpe ? bpe.vocabSize - 1 : 0}
          placeholder={`Token id (0–${bpe ? bpe.vocabSize - 1 : 0})`}
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
        />
      </div>
      {entry && (
        <div className="vocab-result">
          <div className="vocab-row">
            <span className="label">Token id</span>
            <code>{parsed}</code>
          </div>
          <div className="vocab-row">
            <span className="label">Content</span>
            <code className="vocab-content">{content === '\n' ? '\\n' : content}</code>
          </div>
          <div className="vocab-row">
            <span className="label">Byte sequence ({bytes.length})</span>
            <code className="vocab-bytes">[{bytes.join(', ')}]</code>
          </div>
          {entry.merges && (
            <div className="vocab-row">
              <span className="label">Merges</span>
              <code>
                [{entry.merges.join(' + ')}] · rank {entry.merge_rank}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
