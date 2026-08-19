'use client'
import { useMemo, useState } from 'react'
import { encode, tokenLabel } from '../lib/bpe'
import { useTokenizer } from '../lib/TokenizerContext'
import ActiveTokenizerSwitcher from './ActiveTokenizerSwitcher'

interface TokenView {
  id: number
  label: string
}

export default function Encode() {
  const [text, setText] = useState('')
  const { activeTokenizer } = useTokenizer()

  const result = useMemo(() => {
    if (!text) return { ids: [] as number[], tokens: [] as TokenView[], chars: 0 }
    const ids = encode(text, activeTokenizer)
    const tokens = ids.map((id) => ({ id, label: tokenLabel(activeTokenizer.vocab[id]) }))
    return { ids, tokens, chars: text.length }
  }, [text, activeTokenizer])

  return (
    <div className="view">
      <h2>Encode</h2>
      <ActiveTokenizerSwitcher />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste text to tokenize..."
        rows={8}
      />
      <div className="token-bar">
        <div className="token-bar-top">
          <span className="token-bar-count">
            <strong>{result.ids.length}</strong> tokens
          </span>
          <span className="token-bar-chars">{result.chars} chars</span>
        </div>
        <div className="token-bar-track">
          <div
            className="token-bar-fill"
            style={{ width: `${Math.min(100, result.ids.length)}%` }}
          />
        </div>
      </div>
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
