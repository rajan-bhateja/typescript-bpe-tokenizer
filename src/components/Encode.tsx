import { useMemo, useState } from 'react'
import { encode, loadDefaultTokenizer, tokenLabel } from '../lib/bpe'

interface TokenView {
  id: number
  label: string
}

export default function Encode() {
  const [text, setText] = useState('')

  const result = useMemo(() => {
    if (!text) return { ids: [] as number[], tokens: [] as TokenView[] }
    const bpe = loadDefaultTokenizer()
    const ids = encode(text, bpe)
    const tokens = ids.map((id) => ({ id, label: tokenLabel(bpe.vocab[id]) }))
    return { ids, tokens }
  }, [text])

  return (
    <div className="view">
      <h2>Encode</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to tokenize..."
        rows={8}
      />
      <div className="output-row">
        <span className="label">Token IDs ({result.ids.length})</span>
        <code className="ids">{result.ids.join(' ')}</code>
      </div>
      <div className="tokens">
        {result.tokens.map((t, i) => (
          <span key={i} className="token" title={`id ${t.id}`}>
            <span className="token-content">{t.label === '\n' ? '\\n' : t.label}</span>
            <span className="token-id">{t.id}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
