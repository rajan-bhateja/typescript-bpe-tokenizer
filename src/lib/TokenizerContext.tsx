'use client'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { loadDefaultTokenizer } from './bpe'
import type { ByteBPE } from './bpe'

export type TokenizerId = 'default' | 'trained'

interface TokenizerContextValue {
  tokenizers: Record<TokenizerId, ByteBPE | undefined>
  activeId: TokenizerId
  activeTokenizer: ByteBPE
  setActiveId: (id: TokenizerId) => void
  setTrained: (bpe: ByteBPE) => void
}

const TokenizerContext = createContext<TokenizerContextValue | null>(null)

export function TokenizerProvider({ children }: { children: ReactNode }) {
  const [tokenizers, setTokenizers] = useState<Record<TokenizerId, ByteBPE | undefined>>(() => ({
    default: loadDefaultTokenizer(),
    trained: undefined,
  }))
  const [activeId, setActiveId] = useState<TokenizerId>('default')

  const activeTokenizer = tokenizers[activeId] ?? tokenizers.default!

  const setTrained = (bpe: ByteBPE) =>
    setTokenizers((prev) => ({ ...prev, trained: bpe }))

  return (
    <TokenizerContext.Provider
      value={{ tokenizers, activeId, activeTokenizer, setActiveId, setTrained }}
    >
      {children}
    </TokenizerContext.Provider>
  )
}

export function useTokenizer(): TokenizerContextValue {
  const ctx = useContext(TokenizerContext)
  if (!ctx) throw new Error('useTokenizer must be used within a TokenizerProvider')
  return ctx
}
