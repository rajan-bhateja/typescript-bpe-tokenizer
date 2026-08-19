import { trainBPE } from '../lib/train'
import type { TokenizerData } from '../lib/types'

interface TrainRequest {
  texts: string[]
  vocabSize: number
}

self.onmessage = (e: MessageEvent<TrainRequest>) => {
  const { texts, vocabSize } = e.data
  try {
    const data = trainBPE(texts, vocabSize, (done, total) => {
      self.postMessage({ type: 'progress', done, total })
    })
    self.postMessage({ type: 'done', data })
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) })
  }
}

export {}
