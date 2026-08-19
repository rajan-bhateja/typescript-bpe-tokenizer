'use client'
import { useTokenizer } from '../lib/TokenizerContext'

export default function ActiveTokenizerSwitcher() {
  const { activeId, setActiveId, tokenizers } = useTokenizer()
  const hasTrained = Boolean(tokenizers.trained)

  return (
    <div className="tokenizer-switcher">
      <span className="tokenizer-switcher-label">Active tokenizer</span>
      <select
        value={activeId}
        onChange={(e) => setActiveId(e.target.value as 'default' | 'trained')}
        aria-label="Active tokenizer"
      >
        <option value="default">Default</option>
        {hasTrained && <option value="trained">Trained</option>}
      </select>
    </div>
  )
}
