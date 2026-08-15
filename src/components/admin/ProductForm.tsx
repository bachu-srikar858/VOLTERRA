import { useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, Upload } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { SHOE_SIZES, APPAREL_SIZES, KIDS_SIZES } from '@/lib/constants'
import { slugify } from '@/lib/utils'
import type { Gender, Product, ProductColor, ProductSize } from '@/lib/types'

export interface ProductFormData {
  name: string
  slug: string
  categoryId: string
  categoryName: string
  gender: Gender
  price: number
  compareAtPrice: number | null
  description: string
  images: string[]
  colors: ProductColor[]
  sizes: ProductSize[]
  sku: string
  technology: string[]
  materials: string
  fit: string
  care: string[]
  featured: boolean
  trending: boolean
  isNew: boolean
  collectionIds: string[]
  tags: string[]
}

const MIN_IMAGES = 4
const MIN_DESCRIPTION = 40

/* Curated sample imagery so admins can fill the gallery quickly in demo mode */
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
]

export function toFormData(p: Product): ProductFormData {
  return {
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    gender: p.gender,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    description: p.description,
    images: p.images,
    colors: p.colors,
    sizes: p.sizes,
    sku: p.sku,
    technology: p.technology,
    materials: p.materials,
    fit: p.fit,
    care: p.care,
    featured: p.featured,
    trending: p.trending,
    isNew: p.isNew,
    collectionIds: p.collectionIds,
    tags: p.tags,
  }
}

export function emptyFormData(categoryName = 'Running', categoryId = 'cat-running'): ProductFormData {
  return {
    name: '',
    slug: '',
    categoryId,
    categoryName,
    gender: 'unisex',
    price: 0,
    compareAtPrice: null,
    description: '',
    images: Array.from({ length: MIN_IMAGES }, () => ''),
    colors: [{ name: 'Black', hex: '#0a0a0a' }],
    sizes: [],
    sku: '',
    technology: [],
    materials: '',
    fit: '',
    care: [],
    featured: false,
    trending: false,
    isNew: true,
    collectionIds: [],
    tags: [],
  }
}

/* Downscale an uploaded image to a data URL so it fits comfortably in storage */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 1000
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => resolve(String(reader.result))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export function ProductForm({
  open,
  initial,
  categories,
  onClose,
  onSave,
  saving,
}: {
  open: boolean
  initial: ProductFormData
  categories: { id: string; name: string }[]
  onClose: () => void
  onSave: (data: ProductFormData) => void
  saving: boolean
}) {
  const [f, setF] = useState<ProductFormData>(initial)
  const [techText, setTechText] = useState(initial.technology.join(', '))
  const [careText, setCareText] = useState(initial.care.join('\n'))
  const [tagsText, setTagsText] = useState(initial.tags.join(', '))
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug))
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const sizePool = useMemo(() => {
    if (f.gender === 'kids') return KIDS_SIZES
    if (f.categoryName === 'Running' || f.categoryName === 'Basketball' || f.categoryName === 'Lifestyle' || f.name.toLowerCase().includes('shoe') || f.name.toLowerCase().includes('runner')) {
      return SHOE_SIZES
    }
    return APPAREL_SIZES
  }, [f.gender, f.categoryName, f.name])

  const set = (patch: Partial<ProductFormData>) => setF((prev) => ({ ...prev, ...patch }))

  const filledImages = f.images.filter((s) => s.trim())
  const descRemaining = Math.max(0, MIN_DESCRIPTION - f.description.trim().length)

  const setImage = (i: number, value: string) => {
    set({ images: f.images.map((img, idx) => (idx === i ? value : img)) })
    setError('')
  }

  const removeImage = (i: number) => set({ images: f.images.filter((_, idx) => idx !== i) })
  const addImage = () => set({ images: [...f.images, ''] })

  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= f.images.length) return
    const next = [...f.images]
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ images: next })
  }

  const useSamples = () => set({ images: [...SAMPLE_IMAGES] })

  const handleFile = async (i: number, file?: File | null) => {
    if (!file) return
    setUploading(i)
    try {
      const dataUrl = await fileToDataUrl(file)
      setImage(i, dataUrl)
    } catch {
      setError('Could not read that image file.')
    } finally {
      setUploading(null)
    }
  }

  const submit = () => {
    if (!f.name.trim()) {
      setError('Product name is required.')
      return
    }
    if (!f.price || f.price <= 0) {
      setError('Enter a valid price.')
      return
    }
    if (!f.categoryName) {
      setError('Select a category.')
      return
    }
    const description = f.description.trim()
    if (description.length < MIN_DESCRIPTION) {
      setError(`Write a proper product description (at least ${MIN_DESCRIPTION} characters — currently ${description.length}).`)
      return
    }
    const images = f.images.map((s) => s.trim()).filter(Boolean)
    if (images.length < MIN_IMAGES) {
      setError(`Add at least ${MIN_IMAGES} product pictures (currently ${images.length}). Upload files or paste image URLs, then reorder the first one as your cover.`)
      return
    }
    const sizes = f.sizes.filter((s) => s.size && s.stock >= 0)
    if (sizes.length === 0) {
      setError('Add at least one size with stock.')
      return
    }
    const colors = f.colors.filter((c) => c.name.trim())
    if (colors.length === 0) {
      setError('Add at least one color.')
      return
    }
    onSave({
      ...f,
      name: f.name.trim(),
      slug: f.slug.trim() || slugify(f.name),
      description,
      images,
      technology: techText.split(',').map((s) => s.trim()).filter(Boolean),
      care: careText.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean),
      colors,
      sizes,
    })
  }

  const addSizeRow = () => {
    const pool = sizePool.filter((s) => !f.sizes.some((x) => x.size === s))
    const next = pool[0] ?? `SIZE ${f.sizes.length + 1}`
    set({ sizes: [...f.sizes, { size: next, stock: 0 }] })
  }

  const updateSize = (i: number, patch: Partial<ProductSize>) => {
    set({ sizes: f.sizes.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) })
  }

  const removeSize = (i: number) => set({ sizes: f.sizes.filter((_, idx) => idx !== i) })

  const setColorName = (i: number, name: string) => {
    set({ colors: f.colors.map((c, idx) => (idx === i ? { ...c, name } : c)) })
  }
  const setColorHex = (i: number, hex: string) => {
    set({ colors: f.colors.map((c, idx) => (idx === i ? { ...c, hex } : c)) })
  }
  const addColor = () => set({ colors: [...f.colors, { name: '', hex: '#0a0a0a' }] })
  const removeColor = (i: number) => set({ colors: f.colors.filter((_, idx) => idx !== i) })

  return (
    <Modal open={open} onClose={onClose} title={initial.slug ? 'Edit product' : 'Add product'} panelClassName="max-w-4xl">
      <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name" id="pf-name" className="sm:col-span-2">
            <Input
              id="pf-name"
              value={f.name}
              onChange={(e) => set({ name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) })}
              placeholder="Volt Air Runner"
            />
          </Field>
          <Field
            label="Slug (URL)"
            id="pf-slug"
            className="sm:col-span-2"
            hint={slugTouched ? 'Manual slug — it will not auto-update with the name.' : 'Auto-generated from the product name. Type to override.'}
          >
            <Input
              id="pf-slug"
              value={f.slug}
              onChange={(e) => { setSlugTouched(true); set({ slug: e.target.value }) }}
              placeholder="volt-air-runner"
            />
          </Field>
          <Field label="Category" id="pf-cat">
            <Select
              id="pf-cat"
              value={f.categoryId}
              onChange={(e) => {
                const cat = categories.find((c) => c.id === e.target.value)
                set({ categoryId: e.target.value, categoryName: cat?.name ?? f.categoryName })
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Gender" id="pf-gender">
            <Select id="pf-gender" value={f.gender} onChange={(e) => set({ gender: e.target.value as Gender })}>
              {['men', 'women', 'unisex', 'kids'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Price ($)" id="pf-price">
            <Input id="pf-price" type="number" min={0} value={f.price || ''} onChange={(e) => set({ price: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="Compare-at price ($, optional)" id="pf-compare">
            <Input id="pf-compare" type="number" min={0} value={f.compareAtPrice ?? ''} onChange={(e) => set({ compareAtPrice: e.target.value ? Number(e.target.value) : null })} />
          </Field>
          <Field label="SKU" id="pf-sku" className="sm:col-span-2">
            <Input id="pf-sku" value={f.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="VT-RN-1001" />
          </Field>
          <Field
            label="Description"
            id="pf-desc"
            className="sm:col-span-2"
            hint={`Write a rich description: materials, feel, intended use. ${descRemaining > 0 ? `${descRemaining} more characters to go.` : 'Looks good.'}`}
          >
            <Textarea
              id="pf-desc"
              value={f.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="Describe the product in detail — what it is, what it's made of, how it feels, who it's for…"
              className="min-h-32"
            />
          </Field>
        </div>

        {/* Product pictures — minimum 4 */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-display font-bold uppercase tracking-[0.12em]">
                Product pictures <span className="text-volt-orange-dark">({filledImages.length}/{MIN_IMAGES} minimum)</span>
              </p>
              <p className="mt-1 text-xs text-volt-graphite/70">
                First image is the cover. Upload files or paste image URLs.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={useSamples}>Use sample images</Button>
              <Button size="sm" variant="outline" onClick={addImage}><Plus className="size-3.5" /> Add image</Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {f.images.map((img, i) => (
              <div key={i} className="group relative border border-volt-line bg-volt-mist p-2">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                  {img ? (
                    <img src={img} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.25' }} />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-volt-graphite/50">
                      <ImagePlus className="size-6" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">Image {i + 1}</span>
                    </div>
                  )}
                  {i === 0 && filledImages[0] && (
                    <span className="absolute left-1 top-1 bg-volt-black px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Cover</span>
                  )}
                  {uploading === i && (
                    <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-semibold text-volt-black">Uploading…</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label={`Move image ${i + 1} up`} className="flex size-6 items-center justify-center text-volt-graphite/60 transition-colors hover:text-volt-black disabled:opacity-30">
                    <ChevronUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === f.images.length - 1} aria-label={`Move image ${i + 1} down`} className="flex size-6 items-center justify-center text-volt-graphite/60 transition-colors hover:text-volt-black disabled:opacity-30">
                    <ChevronDown className="size-4" />
                  </button>
                  <span className="ml-1 text-[10px] font-semibold uppercase text-volt-graphite/50">#{i + 1}</span>
                  {f.images.length > MIN_IMAGES && (
                    <button type="button" onClick={() => removeImage(i)} aria-label={`Remove image ${i + 1}`} className="ml-auto flex size-6 items-center justify-center text-volt-graphite/50 transition-colors hover:text-volt-orange-dark">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  <Input
                    value={img.startsWith('data:') ? '(uploaded file)' : img}
                    onChange={(e) => setImage(i, e.target.value)}
                    placeholder={`Image URL ${i + 1}`}
                    aria-label={`Image ${i + 1} URL`}
                    className="min-w-0 flex-1 px-2.5 py-1.5 text-xs"
                    readOnly={img.startsWith('data:')}
                  />
                  <input
                    ref={(el) => { fileRefs.current[i] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-hidden
                    onChange={(e) => { void handleFile(i, e.target.files?.[0]); e.target.value = '' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[i]?.click()}
                    aria-label={`Upload image ${i + 1}`}
                    className="flex shrink-0 items-center gap-1 border border-volt-line px-2 text-[11px] font-semibold text-volt-graphite transition-colors hover:border-volt-black hover:text-volt-black"
                  >
                    <Upload className="size-3.5" /> Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filledImages.length < MIN_IMAGES && (
            <p className="mt-2 text-[11px] text-volt-graphite/60">
              {MIN_IMAGES - filledImages.length} more picture{MIN_IMAGES - filledImages.length === 1 ? '' : 's'} needed.
            </p>
          )}
        </div>

        {/* Sizes + stock */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-display font-bold uppercase tracking-[0.12em]">Sizes & stock</p>
            <Button size="sm" variant="outline" onClick={addSizeRow}><Plus className="size-3.5" /> Add size</Button>
          </div>
          <div className="mt-2 space-y-2">
            {f.sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={s.size} onChange={(e) => updateSize(i, { size: e.target.value })} aria-label="Size" className="w-32 px-3 py-2 text-xs" />
                <Input type="number" min={0} value={s.stock} onChange={(e) => updateSize(i, { stock: Number(e.target.value) || 0 })} aria-label="Stock" className="w-28 px-3 py-2 text-xs" />
                <span className="text-xs text-volt-graphite/60">stock</span>
                <button type="button" onClick={() => removeSize(i)} aria-label="Remove size" className="ml-auto text-volt-graphite/50 hover:text-volt-orange-dark">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-volt-graphite/50">Stock 0 = out of stock · 1–10 = low stock warning.</p>
        </div>

        {/* Colors */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-display font-bold uppercase tracking-[0.12em]">Colors</p>
            <Button size="sm" variant="outline" onClick={addColor}><Plus className="size-3.5" /> Add color</Button>
          </div>
          <div className="mt-2 space-y-2">
            {f.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={c.name} onChange={(e) => setColorName(i, e.target.value)} aria-label="Color name" className="flex-1 px-3 py-2 text-xs" />
                <input type="color" value={c.hex} onChange={(e) => setColorHex(i, e.target.value)} aria-label="Color hex" className="h-9 w-12 cursor-pointer border border-volt-line bg-white" />
                <button type="button" onClick={() => removeColor(i)} aria-label="Remove color" className="text-volt-graphite/50 hover:text-volt-orange-dark">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Technology (comma separated)" id="pf-tech">
            <Input id="pf-tech" value={techText} onChange={(e) => setTechText(e.target.value)} placeholder="NitroFoam+, Mesh upper" />
          </Field>
          <Field label="Fit" id="pf-fit">
            <Input id="pf-fit" value={f.fit} onChange={(e) => set({ fit: e.target.value })} placeholder="True to size" />
          </Field>
          <Field label="Materials" id="pf-materials" className="sm:col-span-2">
            <Input id="pf-materials" value={f.materials} onChange={(e) => set({ materials: e.target.value })} placeholder="Upper: recycled mesh…" />
          </Field>
          <Field label="Care instructions (one per line)" id="pf-care" className="sm:col-span-2">
            <Textarea id="pf-care" value={careText} onChange={(e) => setCareText(e.target.value)} className="min-h-16" />
          </Field>
          <Field label="Tags (comma separated)" id="pf-tags" className="sm:col-span-2">
            <Input id="pf-tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="running, trail, breathable" />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={f.featured} onChange={(e) => set({ featured: e.target.checked })} className="size-4 accent-volt-black" /> Featured
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={f.trending} onChange={(e) => set({ trending: e.target.checked })} className="size-4 accent-volt-black" /> Trending
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={f.isNew} onChange={(e) => set({ isNew: e.target.checked })} className="size-4 accent-volt-black" /> New
          </label>
        </div>

        {error && <p role="alert" className="mt-4 rounded-sm bg-volt-orange-soft px-4 py-3 text-sm font-medium text-volt-orange-dark">{error}</p>}

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving || uploading !== null}>{initial.slug ? 'Save changes' : 'Create product'}</Button>
        </div>
      </div>
    </Modal>
  )
}
