const KEY = 'bpe-theme'

export type Theme = 'light' | 'dark'

export function getTheme(): Theme {
  const stored = localStorage.getItem(KEY)
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export function applyTheme(op: 'get' | 'toggle'): Theme {
  const current = getTheme()
  const next: Theme = op === 'toggle' ? (current === 'dark' ? 'light' : 'dark') : current
  document.documentElement.classList.toggle('dark', next === 'dark')
  localStorage.setItem(KEY, next)
  return next
}

export function initTheme(): void {
  applyTheme('get')
}
