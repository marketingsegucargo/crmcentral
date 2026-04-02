import React, { useState, useMemo } from 'react'
import {
  Plus, Package, Edit2, Trash2, Copy, CheckCircle,
  XCircle, MoreHorizontal, TrendingUp, DollarSign,
  ToggleLeft, ToggleRight, Search,
} from 'lucide-react'
import {
  Button, Badge, Modal, Input, Textarea, Select,
  EmptyState, Dropdown, SearchInput,
} from '../components/ui'
import { useProductStore, useUIStore } from '../store'
import { formatCurrency, formatDate, generateId, cn } from '../utils'
import type { Product, BillingFrequency } from '../types'

// ─── Constants ────────────────────────────────────────────

const BILLING_LABELS: Record<BillingFrequency, string> = {
  one_time: 'Pago único',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  annually: 'Anual',
}

const BILLING_OPTIONS = (Object.keys(BILLING_LABELS) as BillingFrequency[]).map(v => ({
  label: BILLING_LABELS[v],
  value: v,
}))

const BILLING_COLOR: Record<BillingFrequency, string> = {
  one_time: 'bg-gray-100 text-gray-600',
  monthly: 'bg-blue-50 text-blue-700',
  quarterly: 'bg-purple-50 text-purple-700',
  annually: 'bg-teal-50 text-teal-700',
}

const CATEGORIES = [
  { label: 'Planes', value: 'Planes' },
  { label: 'Módulos', value: 'Módulos' },
  { label: 'Servicios', value: 'Servicios' },
  { label: 'Add-ons', value: 'Add-ons' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Planes: 'bg-indigo-50 text-indigo-700',
  Módulos: 'bg-orange-50 text-orange-700',
  Servicios: 'bg-teal-50 text-teal-700',
  'Add-ons': 'bg-purple-50 text-purple-700',
}

// ─── Product Form Modal ───────────────────────────────────

interface ProductFormProps {
  open: boolean
  product: Product | null
  onClose: () => void
}

function ProductFormModal({ open, product, onClose }: ProductFormProps) {
  const { addProduct, updateProduct } = useProductStore()
  const { addToast } = useUIStore()
  const isEdit = !!product

  const blank = {
    name: '',
    description: '',
    sku: '',
    price: 0,
    currency: 'MXN',
    billingFrequency: 'monthly' as BillingFrequency,
    unit: '',
    category: '',
    isActive: true,
  }

  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>(blank)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  React.useEffect(() => {
    if (open) {
      setErrors({})
      if (product) {
        setForm({
          name: product.name,
          description: product.description ?? '',
          sku: product.sku ?? '',
          price: product.price,
          currency: product.currency,
          billingFrequency: product.billingFrequency,
          unit: product.unit ?? '',
          category: product.category ?? '',
          isActive: product.isActive,
        })
      } else {
        setForm(blank)
      }
    }
  }, [open, product])

  const set = (key: keyof typeof form, val: unknown) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'El nombre es requerido'
    if (form.price < 0) e.price = 'El precio no puede ser negativo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (evt: React.FormEvent) => {
    evt.preventDefault()
    if (!validate()) return
    if (isEdit && product) {
      updateProduct(product.id, form)
      addToast({ type: 'success', title: 'Producto actualizado', message: `"${form.name}" fue actualizado correctamente.` })
    } else {
      addProduct(form)
      addToast({ type: 'success', title: 'Producto creado', message: `"${form.name}" fue agregado al catálogo.` })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del producto"
          required
          value={form.name}
          onChange={e => set('name', e.target.value)}
          error={errors.name}
          placeholder="CRM Professional Plan"
        />
        <Textarea
          label="Descripción"
          value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Descripción detallada del producto o servicio..."
          rows={3}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="SKU"
            value={form.sku ?? ''}
            onChange={e => set('sku', e.target.value)}
            placeholder="CRM-PRO-001"
          />
          <Select
            label="Categoría"
            value={form.category ?? ''}
            onChange={e => set('category', e.target.value)}
            options={[{ label: 'Sin categoría', value: '' }, ...CATEGORIES]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Precio"
            required
            type="number"
            value={form.price}
            onChange={e => set('price', parseFloat(e.target.value) || 0)}
            error={errors.price}
            min={0}
            step={0.01}
          />
          <Select
            label="Moneda"
            value={form.currency}
            onChange={e => set('currency', e.target.value)}
            options={[
              { label: 'MXN — Peso Mexicano', value: 'MXN' },
              { label: 'USD — Dólar', value: 'USD' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Frecuencia de facturación"
            value={form.billingFrequency}
            onChange={e => set('billingFrequency', e.target.value as BillingFrequency)}
            options={BILLING_OPTIONS}
          />
          <Input
            label="Unidad"
            value={form.unit ?? ''}
            onChange={e => set('unit', e.target.value)}
            placeholder="usuario, licencia, hora..."
          />
        </div>
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={e => set('isActive', e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">Producto activo</p>
            <p className="text-xs text-gray-500">Disponible para agregar a cotizaciones</p>
          </div>
        </label>
      </form>
    </Modal>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────

interface DeleteModalProps {
  open: boolean
  name: string
  onConfirm: () => void
  onClose: () => void
}

function DeleteModal({ open, name, onConfirm, onClose }: DeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Eliminar Producto"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Eliminar</Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        ¿Estás seguro de que deseas eliminar{' '}
        <span className="font-semibold text-gray-900">"{name}"</span>?
        Esta acción no se puede deshacer.
      </p>
    </Modal>
  )
}

// ─── Products Page ────────────────────────────────────────

export default function Products() {
  const { products, searchQuery, setSearch, updateProduct, deleteProduct } = useProductStore()
  const { addToast } = useUIStore()

  const [filterCategory, setFilterCategory] = useState('')
  const [filterBilling, setFilterBilling] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  // ── Filtered list ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = products
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
    if (filterCategory) list = list.filter(p => p.category === filterCategory)
    if (filterBilling) list = list.filter(p => p.billingFrequency === filterBilling)
    return list
  }, [products, searchQuery, filterCategory, filterBilling])

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = products.filter(p => p.isActive)
    const mrr = active
      .filter(p => p.billingFrequency === 'monthly')
      .reduce((s, p) => s + p.price, 0)
    const oneTime = active
      .filter(p => p.billingFrequency === 'one_time')
      .reduce((s, p) => s + p.price, 0)
    return { total: products.length, active: active.length, mrr, oneTime }
  }, [products])

  const handleNew = () => { setEditingProduct(null); setFormOpen(true) }
  const handleEdit = (p: Product) => { setEditingProduct(p); setFormOpen(true) }

  const handleDuplicate = (p: Product) => {
    const { addProduct } = useProductStore.getState()
    addProduct({
      ...p,
      name: `${p.name} (copia)`,
      sku: p.sku ? `${p.sku}-COPY` : undefined,
      isActive: false,
    })
    addToast({ type: 'success', title: 'Producto duplicado', message: `Se creó una copia de "${p.name}".` })
  }

  const handleToggle = (p: Product) => {
    updateProduct(p.id, { isActive: !p.isActive })
    addToast({
      type: 'success',
      title: p.isActive ? 'Producto desactivado' : 'Producto activado',
      message: `"${p.name}" fue ${p.isActive ? 'desactivado' : 'activado'}.`,
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteProduct(deleteTarget.id)
    addToast({ type: 'success', title: 'Producto eliminado', message: `"${deleteTarget.name}" fue eliminado del catálogo.` })
    setDeleteTarget(null)
  }

  const clearFilters = () => { setSearch(''); setFilterCategory(''); setFilterBilling('') }
  const hasFilters = searchQuery || filterCategory || filterBilling

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Productos & Catálogo</h1>
          <span className="badge bg-primary/10 text-primary font-semibold">{products.length}</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleNew}
        >
          Nuevo Producto
        </Button>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Total productos',
              value: stats.total,
              icon: <Package className="w-5 h-5" />,
              color: 'text-gray-900',
              bg: 'bg-gray-100',
              iconColor: 'text-gray-500',
            },
            {
              label: 'Activos',
              value: stats.active,
              icon: <CheckCircle className="w-5 h-5" />,
              color: 'text-teal-700',
              bg: 'bg-teal-50',
              iconColor: 'text-teal-500',
            },
            {
              label: 'MRR potencial',
              value: formatCurrency(stats.mrr, 'MXN'),
              icon: <TrendingUp className="w-5 h-5" />,
              color: 'text-primary',
              bg: 'bg-primary/10',
              iconColor: 'text-primary',
            },
            {
              label: 'Pago único disponible',
              value: formatCurrency(stats.oneTime, 'MXN'),
              icon: <DollarSign className="w-5 h-5" />,
              color: 'text-purple-700',
              bg: 'bg-purple-50',
              iconColor: 'text-purple-500',
            },
          ].map(s => (
            <div key={s.label} className="card p-4 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <span className={s.iconColor}>{s.icon}</span>
              </div>
              <div className="min-w-0">
                <p className={cn('text-xl font-bold leading-tight truncate', s.color)}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────── */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearch}
            placeholder="Buscar por nombre, SKU, descripción..."
            className="w-72"
          />

          {/* Category filter chips */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterCategory('')}
              className={cn('filter-chip text-xs', filterCategory === '' && 'active')}
            >
              Todos
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setFilterCategory(c.value)}
                className={cn('filter-chip text-xs', filterCategory === c.value && 'active')}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Billing filter */}
          <select
            value={filterBilling}
            onChange={e => setFilterBilling(e.target.value)}
            className="input-field text-sm w-auto"
          >
            <option value="">Frecuencia: Todas</option>
            {BILLING_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} de {products.length} productos
          </span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title="Sin productos"
            description={
              hasFilters
                ? 'No se encontraron productos con los filtros aplicados.'
                : 'Crea tu primer producto para comenzar a cotizar.'
            }
            action={
              !hasFilters
                ? { label: 'Nuevo Producto', onClick: handleNew }
                : undefined
            }
          />
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-gray-100">
                <th className="table-header pl-6">Producto</th>
                <th className="table-header">Descripción</th>
                <th className="table-header">Categoría</th>
                <th className="table-header text-right pr-4">Precio</th>
                <th className="table-header">Frecuencia</th>
                <th className="table-header">Unidad</th>
                <th className="table-header text-center">Activo</th>
                <th className="table-header w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  className={cn(
                    'border-b border-gray-50 hover:bg-gray-50/60 transition-colors group',
                    !p.isActive && 'opacity-60'
                  )}
                >
                  {/* Name + SKU */}
                  <td className="table-cell pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        {p.sku && (
                          <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="table-cell max-w-[200px]">
                    <p className="text-sm text-gray-500 truncate">
                      {p.description || <span className="text-gray-300">—</span>}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="table-cell">
                    {p.category ? (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        CATEGORY_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'
                      )}>
                        {p.category}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="table-cell text-right pr-4">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(p.price, p.currency)}
                    </span>
                  </td>

                  {/* Billing Frequency */}
                  <td className="table-cell">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      BILLING_COLOR[p.billingFrequency]
                    )}>
                      {BILLING_LABELS[p.billingFrequency]}
                    </span>
                  </td>

                  {/* Unit */}
                  <td className="table-cell">
                    <span className="text-sm text-gray-500">{p.unit || <span className="text-gray-300">—</span>}</span>
                  </td>

                  {/* Active toggle */}
                  <td className="table-cell text-center">
                    <button
                      onClick={() => handleToggle(p)}
                      title={p.isActive ? 'Desactivar' : 'Activar'}
                      className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                    >
                      {p.isActive
                        ? <ToggleRight className="w-6 h-6 text-teal-500" />
                        : <ToggleLeft className="w-6 h-6 text-gray-300" />
                      }
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="table-cell pr-4" onClick={e => e.stopPropagation()}>
                    <Dropdown
                      trigger={
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        {
                          label: 'Editar',
                          icon: <Edit2 className="w-4 h-4" />,
                          onClick: () => handleEdit(p),
                        },
                        {
                          label: 'Duplicar',
                          icon: <Copy className="w-4 h-4" />,
                          onClick: () => handleDuplicate(p),
                        },
                        {
                          label: p.isActive ? 'Desactivar' : 'Activar',
                          icon: p.isActive
                            ? <XCircle className="w-4 h-4" />
                            : <CheckCircle className="w-4 h-4" />,
                          onClick: () => handleToggle(p),
                        },
                        {
                          label: 'Eliminar',
                          icon: <Trash2 className="w-4 h-4" />,
                          onClick: () => setDeleteTarget(p),
                          danger: true,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────── */}
      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        onClose={() => { setFormOpen(false); setEditingProduct(null) }}
      />

      <DeleteModal
        open={!!deleteTarget}
        name={deleteTarget?.name ?? ''}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
