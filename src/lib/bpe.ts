import tokenizerData from '../../tokenizer.json'
import type { TokenEntry, TokenizerData } from './types'

const GPT2_PATTERN =
  /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder('utf-8')

let defaultBPE: ByteBPE | null = null

export function pretokenize(text: string): string[] {
  return text.match(GPT2_PATTERN) ?? []
}

export function textToBytes(text: string): number[] {
  return Array.from(textEncoder.encode(text))
}

export function bytesToText(bytes: number[]): string {
  return textDecoder.decode(new Uint8Array(bytes))
}

export interface ByteBPE {
  vocab: Record<number, TokenEntry>
  merges: Map<string, { id: number; rank: number }>
  vocabSize: number
}

export function createByteBPE(data: TokenizerData): ByteBPE {
  const tokens = data.tokens
  const merges = new Map<string, { id: number; rank: number }>()
  const vocab: Record<number, TokenEntry> = {}
  for (const key of Object.keys(tokens)) {
    const t = tokens[key]
    const id = Number(key)
    vocab[id] = t
    if (t.merges && t.merge_rank != null) {
      merges.set(`${t.merges[0]},${t.merges[1]}`, { id, rank: t.merge_rank })
    }
  }
  return { vocab, merges, vocabSize: data.vocab_size }
}

export function loadDefaultTokenizer(): ByteBPE {
  if (!defaultBPE) {
    defaultBPE = createByteBPE(tokenizerData as TokenizerData)
  }
  return defaultBPE
}

function mergeBytes(ids: number[], merges: Map<string, { id: number; rank: number }>): number[] {
  let result = ids
  for (;;) {
    let bestIndex = -1
    let bestRank = Infinity
    let bestId = -1
    for (let i = 0; i < result.length - 1; i++) {
      const m = merges.get(`${result[i]},${result[i + 1]}`)
      if (m && m.rank < bestRank) {
        bestRank = m.rank
        bestIndex = i
        bestId = m.id
      }
    }
    if (bestIndex < 0) break
    result = result.slice(0, bestIndex).concat([bestId], result.slice(bestIndex + 2))
  }
  return result
}

export function encode(text: string, bpe: ByteBPE): number[] {
  const out: number[] = []
  for (const word of pretokenize(text)) {
    out.push(...mergeBytes(textToBytes(word), bpe.merges))
  }
  return out
}

export function decode(ids: number[], bpe: ByteBPE): string {
  const bytes: number[] = []
  for (const id of ids) {
    const t = bpe.vocab[id]
    if (t) bytes.push(...t.bytes)
  }
  return bytesToText(bytes)
}

export function tokenLabel(t: TokenEntry): string {
  return bytesToText(t.bytes)
}
