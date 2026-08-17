'use client'
import { useMemo, useState } from 'react'
import { decode, loadDefaultTokenizer } from '../lib/bpe'

export default function Decode() {
  const [input, setInput] = useState('')

  const result = useMemo(() => {
    const ids = input
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number)
      .filter(Number.isInteger)
    if (!ids.length) return { text: '', count: 0 }
    return { text: decode(ids, loadDefaultTokenizer()), count: ids.length }
  }, [input])

  return (
    <div className="view">
      <h2>Decode</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste token IDs, space or comma separated..."
        rows={4}
      />
      <div className="output-row">
        <span className="label">Decoded text ({result.count} tokens)</span>
      </div>
      <pre className="decoded">{result.text}</pre>
    </div>
  )
}
