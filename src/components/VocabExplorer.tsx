'use client'
import { useState } from 'react'
import { Info } from 'lucide-react'
import type { ByteBPE } from '../lib/bpe'
import { tokenLabel } from '../lib/bpe'
import { useTokenizer } from '../lib/TokenizerContext'

function FieldLabel({ text, hint }: { text: string; hint: string }) {
  return (
    <span className="label">
      {text}
      <span className="field-tooltip" tabIndex={0}>
        <Info size={12} aria-hidden="true" />
        <span className="field-tooltip-text">{hint}</span>
      </span>
    </span>
  )
}

export default function VocabExplorer() {
  const { tokenizers, activeId, setActiveId } = useTokenizer()
  const [idInput, setIdInput] = useState('')

  const sources: { id: string; label: string; bpe: ByteBPE }[] = [
    { id: 'default', label: 'Default (prebuilt)', bpe: tokenizers.default! },
    ...(tokenizers.trained ? [{ id: 'trained', label: 'Trained', bpe: tokenizers.trained }] : []),
  ]

  const source = sources.find((s) => s.id === activeId) ?? sources[0]
  const bpe = source?.bpe

  const parsed = Number(idInput)
  const valid = bpe && Number.isInteger(parsed) && parsed >= 0 && parsed < bpe.vocabSize
  const tooHigh = bpe && idInput.trim() !== '' && Number.isInteger(parsed) && parsed >= bpe.vocabSize
  const entry = valid && bpe ? bpe.vocab[parsed] : null
  const content = entry ? tokenLabel(entry) : ''
  const bytes = entry ? entry.bytes : []
  const mergeRules = bpe
    ? Object.entries(bpe.vocab)
        .filter(([, t]) => t.merges !== null)
        .sort((a, b) => a[1].merge_rank! - b[1].merge_rank!)
    : []

  return (
    <div className="vocab-explorer">
      <h3>Vocabulary explorer</h3>
      <p>Look up a token by its ID to inspect the byte sequence it stores.</p>
      <div className="vocab-controls">
        {sources.length > 1 && (
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value as 'default' | 'trained')}
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
          placeholder="Token ID"
          value={idInput}
          onChange={(e) => {
            const v = e.target.value
            if (v !== '' && (Number(v) < 0 || Number.isNaN(Number(v)))) return
            setIdInput(v)
          }}
        />
      </div>
      {tooHigh && bpe && (
        <div className="vocab-warning" role="alert">
          <p>
            The Token ID entered is greater than the Selected Tokenizer&apos;s Vocabulary Size. Please
            enter a Token ID within the Selected Tokenizer&apos;s Vocabulary Size.
          </p>
          <p className="vocab-warning-size">
            Selected Tokenizer&apos;s Size: <strong>{bpe.vocabSize}</strong>
          </p>
        </div>
      )}
      {entry && (
        <div className="vocab-result">
          <div className="vocab-row">
            <FieldLabel
              text="Token id"
              hint="The numeric id assigned to this token in the vocabulary."
            />
            <code>{parsed}</code>
          </div>
          <div className="vocab-row">
            <FieldLabel
              text="Content"
              hint="The text this token represents in the vocabulary."
            />
            <code className="vocab-content">{content === '\n' ? '\\n' : content}</code>
          </div>
          <div className="vocab-row">
            <FieldLabel
              text={`Byte sequence (${bytes.length})`}
              hint="The raw UTF-8 byte values this token's content is stored as."
            />
            <code className="vocab-bytes">[{bytes.join(', ')}]</code>
          </div>
          {entry.merge_rank != null && (
            <div className="vocab-row">
              <FieldLabel
                text="Rank"
                hint="The order in which this token was created during training. Lower ranks merge first."
              />
              <code>{entry.merge_rank}</code>
            </div>
          )}
          {entry.merges && (
            <div className="vocab-row">
              <FieldLabel
                text="Merges"
                hint="The two tokens that were merged together to create this token during training."
              />
              <code>[{entry.merges.join(' + ')}]</code>
            </div>
          )}
        </div>
      )}
      <div className="merge-rules">
        <h3>Merge rules</h3>
        <p>The learned merge rules for the active tokenizer, in the order they were applied.</p>
        <div className="merge-rules-scroll">
          <table>
            <thead>
              <tr>
                <th>S. No.</th>
                <th>Left Token ID</th>
                <th>Right Token ID</th>
                <th>New Token ID</th>
                <th>Token</th>
                <th>Bytes</th>
              </tr>
            </thead>
            <tbody>
              {mergeRules.map(([id, t], i) => (
                <tr key={id}>
                  <td>{i + 1}</td>
                  <td>{t.merges![0]}</td>
                  <td>{t.merges![1]}</td>
                  <td>{id}</td>
                  <td className="merge-token">{t.content === '\n' ? '\\n' : t.content}</td>
                  <td className="merge-bytes">[{t.bytes.join(', ')}]</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
