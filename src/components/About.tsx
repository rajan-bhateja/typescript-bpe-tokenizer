'use client'

export default function About() {
  return (
    <div className="view">
      <h2>About this project</h2>
      <p>
        This is a byte-level BPE (Byte Pair Encoding) tokenizer that runs entirely in your browser.
        It lets you encode text into tokens, decode tokens back into text, and even train your own
        tokenizer from your own .txt files.
      </p>

      <h3>What is BPE tokenization?</h3>
      <p>
        BPE tokenization is the technique used by many modern language models to split text into a
        fixed-size vocabulary of reusable pieces. Instead of operating on words (which don&apos;t
        cover misspellings or rare names) or single characters (which are wasteful), BPE learns a
        vocabulary of frequently occurring subword units.
      </p>

      <h3>How it works</h3>
      <p>
        <strong>1. Byte-level base.</strong> Text is first converted into raw UTF-8 bytes, giving a
        base vocabulary of 256 byte values. Every possible input can be represented, so nothing is
        ever unknown.
      </p>
      <p>
        <strong>2. Pretokenization.</strong> The byte stream is split into rough chunks (roughly by
        whitespace and punctuation) so that merges happen within meaningful units rather than across
        random boundaries.
      </p>
      <p>
        <strong>3. Counting pairs.</strong> The tokenizer scans the training corpus and counts how
        often each pair of adjacent tokens appears together.
      </p>
      <p>
        <strong>4. Merging.</strong> The most frequent pair is merged into a single new token. The
        pair is counted again, and the process repeats until the target vocabulary size is reached.
        Each merged token is assigned a <em>rank</em> reflecting the order in which it was created.
      </p>
      <p>
        <strong>5. Encoding &amp; Decoding.</strong> Encoding repeatedly applies the learned merges
        to the input bytes to build tokens. Decoding reverses this: each token ID maps back to its
        byte sequence, which is reassembled and converted back to text.
      </p>

      <h3>What you can do here</h3>
      <p>
        The <strong>Encode</strong> tab tokenizes any text you type, showing each token and its ID.
      </p>
      <p>
        The <strong>Decode</strong> tab reverses a list of token IDs back into text.</p>
      <p>
        The{' '}<strong>Train</strong> tab builds your own tokenizer from uploaded files and includes a
        vocabulary explorer to inspect individual tokens and their merge history.
      </p>
    </div>
  )
}
