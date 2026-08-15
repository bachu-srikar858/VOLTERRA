import { useEffect } from 'react'

const DEFAULT_DESCRIPTION =
  'VOLTERRA — premium performance sportswear engineered for every version of you. Running, training, basketball and lifestyle gear built to move without limits.'

export function useSEO(title?: string, description?: string) {
  useEffect(() => {
    if (title) {
      document.title = `${title} — VOLTERRA`
    } else {
      document.title = 'VOLTERRA — Move Without Limits'
    }
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', description ?? DEFAULT_DESCRIPTION)
    }
    const og = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (og) og.setAttribute('content', title ? `${title} — VOLTERRA` : 'VOLTERRA — Move Without Limits')
  }, [title, description])
}
