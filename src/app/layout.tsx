import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Byte-level BPE Tokenizer',
  description: 'Encode, decode, and train byte-level BPE tokenizers entirely in your browser.',
}

// Sets the theme class before React hydrates to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var s=localStorage.getItem('bpe-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
