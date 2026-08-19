'use client'
import { useTokenizer } from '../lib/TokenizerContext'

export default function Stats() {
  const { activeId, activeTokenizer } = useTokenizer()

  const vocabSize = activeTokenizer.vocabSize
  const mergeCount = Object.values(activeTokenizer.vocab).filter(
    (t) => t.merges !== null
  ).length

  return (
    <>
      <h3 className="stats-heading">Stats</h3>
      <div className="stats">
        <div className="stats-row">
        <div className="stats-cell">
          <span className="stats-label">Tokenizer</span>
          <span className="stats-value">{activeId === 'default' ? 'Default' : 'Trained'}</span>
        </div>
        <div className="stats-cell">
          <span className="stats-label">Vocabulary Size</span>
          <span className="stats-value">{vocabSize}</span>
        </div>
        <div className="stats-cell">
          <span className="stats-label">BPE Merges</span>
          <span className="stats-value">{mergeCount}</span>
        </div>
        </div>
      </div>
    </>
  )
}
