# Submission

## What I Built and Why

- I built a tokenizer from scratch in TypeScript using a custom dataset that allows the user to encode text into token IDs, decode token IDs back to text, and let's the user train their own tokenizer by uploading `.txt` file(s).

- I decided to build it because I wanted to know how sub-word tokenization, especially the Byte-Pair Encoding (BPE) algorithm, works in detail.


## Architecture and Design

**Stack:** Next.js

**What it does:**

- **Encode:** tokenizes user-input text, shows each token and its ID.

- **Decode:** reverses a list of token IDs back into text.

- **Train:** trains a tokenizer client-side from uploaded `.txt` file(s), includes a vocabulary explorer showing individual tokens and their merge history.

**Key design decisions:**

- **Runs entirely client-side / in-browser:** Since it's a simple training algorithm and state management, there's no need for a backend so, no API calls. It also makes it easy to deploy on Vercel.

- **Web Worker:** Uses a web worker to avoid freezing UI during custom tokenizer training.

- **No limits on vocab size:** No limits put on vocabulary size so, theoretically, the entire uploaded `.txt` file(s) content could be a single token. Default vocabulary size is set to `3500` with `256` base tokens representing basic characters in UTF-8 encoding, preventing 'infinite token learning'.

- **Initial Python implementation:** Initially written in Python for understanding and implementation (as I'm more comfortable with Python). Ported to TypeScript for easier deployment.


## Decision-Making

- Initial `256` characters are represented as individual tokens in UTF-8 encoding, following standard in-production tokenization practice.

- Python implementation is converted to TypeScript for easier deployment.

- Added training and downloading custom tokenizer for user uploaded `.txt` file(s) for better demonstration of tokenization. The downloaded file is a JSON.

- Added a `merge_rank` key in the `tokenizer.json` while building the project in Python to keep the order of the merged rules. Maintained it in TypeScript.

- Added Vocabulary Explorer and Merge Rules section to explore the tokenizer's content and merge rules.

- Had an afterthought about adding comparison with production tokenizers like o200k_base (used by older GPT models), but it would increase the complexity without significant improvements. For reference, that tokenizer can be found [here](https://tiktokenizer.vercel.app/): 


## First-Principles Reasoning

- A fixed vocabulary size or pass a vocabulary size as a parameter if training your own because BPE requires a stopping condition. Otherwise, it would go on indefinitely. It is also required because the language model outputs logits over the entire tokenizer's vocabulary, not just some selected tokens.

- Didn't went with character-level tokenization as it would create a token for each character present. So, it wouldn't be efficient and would fill up the context window quickly.

- Didn't went with word-level tokenization as it would create a token for each word, which is fine, but if an unseen word is entered by the user, the language model would crash as it hasn't seen that word.

- BPE guarantees a middle ground between the two. Reasonable vocabulary size along with breaking down unseen words into sub-words, managing Out-Of-Vocabulary (OOV) words, preventing the language model from crashing.


## UI/UX Improvements

- In `Settings`, option values in selectors aren't vertically centered in their row — slightly top-aligned. Minor, but the kind of polish miss that's noticeable on a product this deliberately designed.

- In `Chat`, the model is sometimes too literal with placeholder-style instructions — e.g. asking it to replace a value with "something like this" gets taken as the literal replacement text instead of being interpreted as an instruction to generate something appropriate.

- `Chat` doesn't reopen to the last conversation by default — a preference, but one worth considering.


## Thoughts on IDE and TokenFold

- Love that it's a fork of VS Code - making it familiar instantly.

- Everything is working as expected - no issues.

- Token usage was noticably lower compared to your usual AI IDEs like Cursor or AntiGravity.

- The `Chat` problem where the agent takes something too literally is, I believe, worth looking into. It could be improved by either the agent asking the use about what to put in the placeholder (or any other place), or generating something appropriate itself, given it has the context.


## Links

- **GitHub repository:** https://github.com/rajan-bhateja/typescript-bpe-tokenizer
- **Deployed application:** https://typescript-bpe-tokenizer.vercel.app/


---

*Some parts of this markdown file were enhanced using Claude.*