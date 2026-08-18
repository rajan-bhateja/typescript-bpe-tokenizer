'use client'
import { useEffect, useState } from 'react'
import About from './About'
import Encode from './Encode'
import Decode from './Decode'
import Train from './Train'
import ThemeToggle from './ThemeToggle'
import { applyTheme } from '../lib/theme'
import { TokenizerProvider } from '../lib/TokenizerContext'

type Tab = 'about' | 'encode' | 'decode' | 'train'

const TABS: { key: Tab; label: string }[] = [
  { key: 'about', label: 'About' },
  { key: 'encode', label: 'Encode' },
  { key: 'decode', label: 'Decode' },
  { key: 'train', label: 'Advanced Options' },
]

export default function TokenizerApp() {
  const [tab, setTab] = useState<Tab>('about')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(applyTheme('get') === 'dark')
  }, [])

  const toggleDark = () => setDark(applyTheme('toggle') === 'dark')

  return (
    <TokenizerProvider>
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            BPE
          </span>
          <div>
            <h1>Byte-level BPE Tokenizer</h1>
            <p className="subtitle">Encode · Decode · Advanced Options — entirely in your browser</p>
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
        {tab === 'about' && <About />}
        {tab === 'encode' && <Encode />}
        {tab === 'decode' && <Decode />}
        {tab === 'train' && <Train />}
      </main>
    </div>
    </TokenizerProvider>
  )
}
