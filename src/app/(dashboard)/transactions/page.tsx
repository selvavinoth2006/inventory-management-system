'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, History, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { formatDate, cn } from '@/lib/utils'
import { StockTransaction, Product } from '@/lib/types'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'IN',
    quantity: '',
    note: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [transRes, prodRes] = await Promise.all([
      supabase.from('stock_transactions').select('*, products(name)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('name')
    ])
    
    if (transRes.error) toast.error('Failed to fetch transactions')
    else setTransactions(transRes.data || [])

    if (prodRes.error) toast.error('Failed to fetch products')
    else setProducts(prodRes.data || [])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleOpenModal = (type: 'IN' | 'OUT' = 'IN') => {
    setFormData({
      product_id: '',
      type,
      quantity: '',
      note: ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.product_id) {
      toast.error('Please select a product')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('stock_transactions')
        .insert([{
          product_id: formData.product_id,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          note: formData.note
        }])
      
      if (error) {
        // This might be the 'Insufficient stock' error from our DB trigger
        throw error
      }
      
      toast.success('Transaction recorded')
      setIsModalOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to record transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    const productName = t.products?.name?.toLowerCase() || ''
    const matchesSearch = productName.includes(searchTerm.toLowerCase()) || 
                         t.note?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Transactions</h1>
          <p className="text-muted-foreground mt-1">Track every item moving in and out of your inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal('IN')}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-[0.98] transition-all"
          >
            <ArrowUpRight size={20} />
            Stock In
          </button>
          <button
            onClick={() => handleOpenModal('OUT')}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            <ArrowDownRight size={20} />
            Stock Out
          </button>
        </div>
      </div>

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search by product or note..."
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-muted-foreground" />
            <select
              className="bg-background border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-primary" size={32} />
                    <p className="mt-2 text-muted-foreground text-sm">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <History className="text-muted-foreground" size={24} />
                    </div>
                    <p className="text-muted-foreground">No transactions found.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {t.products?.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight",
                        t.type === 'IN' 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {t.type === 'IN' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                        {t.type === 'IN' ? 'Stock In' : 'Stock Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700">
                      {t.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                      {t.note || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Stock ${formData.type === 'IN' ? 'In' : 'Out'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Select Product</label>
            <select
              required
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
            >
              <option value="">Choose a product...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Quantity</label>
            <input
              type="number"
              required
              min="1"
              placeholder="0"
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Notes (Optional)</label>
            <textarea
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none h-24"
              placeholder="Reason for movement..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-sm font-bold hover:bg-accent rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transition-all disabled:opacity-50",
                formData.type === 'IN' ? "bg-green-600 shadow-green-600/20 hover:bg-green-700" : "bg-red-600 shadow-red-600/20 hover:bg-red-700"
              )}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : `Confirm Stock ${formData.type === 'IN' ? 'In' : 'Out'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
