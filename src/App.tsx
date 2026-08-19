import { useState } from 'react'
import Encode from './components/Encode'
import Decode from './components/Decode'
import Train from './components/Train'
import ThemeToggle from './components/ThemeToggle'
import { applyTheme } from './lib/theme'

type Tab = 'encode' | 'decode' | 'train'

const TABS: { key: Tab; label: string }[] = [
  { key: 'encode', label: 'Encode' },
  { key: 'decode', label: 'Decode' },
  { key: 'train', label: 'Train' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('encode')
  const [dark, setDark] = useState(() => applyTheme('get') === 'dark')

  const toggleDark = () => setDark(applyTheme('toggle') === 'dark')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Byte-level BPE Tokenizer</h1>
        <ThemeToggle dark={dark} onToggle={toggleDark} />
      </header>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="content">
        {tab === 'encode' && <Encode />}
        {tab === 'decode' && <Decode />}
        {tab === 'train' && <Train />}
      </main>
    </div>
  )
}
