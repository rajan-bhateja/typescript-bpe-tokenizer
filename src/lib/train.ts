import { pretokenize, textToBytes } from './bpe'
import type { TokenEntry, TokenizerData } from './types'

export type ProgressFn = (done: number, total: number) => void

const pairKey = (a: number, b: number) => `${a},${b}`

function bytesToTextLocal(bytes: number[]): string {
  return new TextDecoder('utf-8').decode(new Uint8Array(bytes))
}

export function trainBPE(corpora: string[], targetVocabSize: number, onProgress: ProgressFn): TokenizerData {
  const tokenBytes = new Map<number, number[]>()
  const tokenEntries = new Map<number, TokenEntry>()
  for (let b = 0; b < 256; b++) {
    tokenBytes.set(b, [b])
    tokenEntries.set(b, { content: bytesToTextLocal([b]), bytes: [b], merges: null, merge_rank: null })
  }

  const words: number[][] = []
  for (const text of corpora) {
    for (const word of pretokenize(text)) {
      words.push(textToBytes(word))
    }
  }

  const pairCounts = new Map<string, number>()
  const inc = (k: string, d = 1) => pairCounts.set(k, (pairCounts.get(k) ?? 0) + d)

  for (const w of words) {
    for (let i = 0; i < w.length - 1; i++) inc(pairKey(w[i], w[i + 1]))
  }

  let nextId = 256
  const maxIters = targetVocabSize - 256
  let rank = 0

  while (nextId < targetVocabSize) {
    let bestKey: string | null = null
    let bestCount = 0
    for (const [k, c] of pairCounts) {
      if (c > bestCount) {
        bestCount = c
        bestKey = k
      }
    }
    if (!bestKey || bestCount === 0) break

    const [a, b] = bestKey.split(',').map(Number)
    const newId = nextId++
    const newBytes = [...tokenBytes.get(a)!, ...tokenBytes.get(b)!]
    tokenBytes.set(newId, newBytes)
    tokenEntries.set(newId, {
      content: bytesToTextLocal(newBytes),
      bytes: newBytes,
      merges: [a, b],
      merge_rank: rank,
    })

    // Apply this single merge everywhere in the corpus, updating pair counts around each occurrence.
    for (const w of words) {
      let i = 0
      while (i < w.length - 1) {
        if (w[i] === a && w[i + 1] === b) {
          inc(pairKey(a, b), -1)
          const left = i > 0 ? w[i - 1] : null
          const right = i + 2 < w.length ? w[i + 2] : null
          if (left !== null) {
            inc(pairKey(left, a), -1)
            inc(pairKey(left, newId))
          }
          if (right !== null) {
            inc(pairKey(b, right), -1)
            inc(pairKey(newId, right))
          }
          w.splice(i, 2, newId)
        }
        i++
      }
    }

    if (rank % 40 === 0 || rank >= maxIters) onProgress(rank, maxIters)
  }
  onProgress(rank, maxIters)

  const tokens: Record<string, TokenEntry> = {}
  for (const [id, entry] of tokenEntries) tokens[String(id)] = entry
  return { vocab_size: tokenEntries.size, tokens }
}
