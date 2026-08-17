'use client'
import { useState } from 'react'
import Encode from './Encode'
import Decode from './Decode'
import Train from './Train'
import ThemeToggle from './ThemeToggle'
import { applyTheme } from '../lib/theme'

type Tab = 'encode' | 'decode' | 'train'

const TABS: { key: Tab; label: string }[] = [
  { key: 'encode', label: 'Encode' },
  { key: 'decode', label: 'Decode' },
  { key: 'train', label: 'Train' },
]

export default function TokenizerApp() {
  const [tab, setTab] = useState<Tab>('encode')
  const [dark, setDark] = useState(() => applyTheme('get') === 'dark')

  const toggleDark = () => setDark(applyTheme('toggle') === 'dark')

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BPE
          </span>
          <div>
            <h1>Byte-level BPE Tokenizer</h1>
            <p className="subtitle">Encode · Decode · Train — entirely in your browser</p>
          </div>
        </div>
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
