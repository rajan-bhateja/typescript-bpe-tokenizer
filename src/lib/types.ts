export interface TokenEntry {
  content: string
  bytes: number[]
  merges: number[] | null
  merge_rank: number | null
}

export interface TokenizerData {
  vocab_size: number
  tokens: Record<string, TokenEntry>
}
