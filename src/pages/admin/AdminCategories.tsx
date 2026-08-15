import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { slugify } from '@/lib/utils'
import type { Category } from '@/lib/types'

export default function AdminCategories() {
  const { toast } = useStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')

  const refresh = useCallback(async () => {
    setCategories(await api.getCategories())
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openNew = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setImage('')
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setName(c.name)
    setDescription(c.description)
    setImage(c.image)
  }

  const save = async () => {
    if (!name.trim()) {
      toast('Category name is required', 'error')
      return
    }
    try {
      if (editing) {
        await api.updateCategory(editing.id, { name: name.trim(), description, image })
        toast('Category updated')
      } else {
        await api.createCategory({ name: name.trim(), slug: slugify(name), description, image, sortOrder: categories.length + 1 })
        toast('Category created')
      }
      setEditing(null)
      await refresh()
    } catch (e) {
      toast('Could not save category', 'error')
      console.error(e)
    }
  }

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete category "${c.name}"? Products in it will keep their name but lose the link.`)) return
    try {
      await api.deleteCategory(c.id)
      toast('Category deleted', 'info')
      await refresh()
    } catch (e) {
      toast('Could not delete category', 'error')
      console.error(e)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold uppercase tracking-[0.08em]">Categories ({categories.length})</h2>
        <Button size="sm" onClick={openNew}><Plus className="size-4" /> New category</Button>
      </div>

      <ul className="mt-6 space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-4 border border-volt-line p-4">
            <img src={c.image} alt="" className="h-12 w-12 bg-volt-mist object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-volt-graphite/60">{c.description}</p>
            </div>
            <span className="text-xs font-mono text-volt-graphite/40">/{c.slug}</span>
            <button type="button" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="flex size-8 items-center justify-center text-volt-graphite/60 hover:bg-volt-mist">
              <Pencil className="size-4" />
            </button>
            <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="flex size-8 items-center justify-center text-volt-graphite/60 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      {(editing || name || description) && (
        <div className="mt-8 max-w-lg border border-volt-line p-6">
          <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">{editing ? 'Edit category' : 'New category'}</h3>
          <div className="mt-4 space-y-4">
            <Field label="Name" id="cat-name">
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description" id="cat-desc">
              <Textarea id="cat-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-16" />
            </Field>
            <Field label="Image URL" id="cat-img">
              <Input id="cat-img" value={image} onChange={(e) => setImage(e.target.value)} className="font-mono text-xs" />
            </Field>
            <div className="flex gap-2">
              <Button size="sm" onClick={save}>{editing ? 'Save' : 'Create'}</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
