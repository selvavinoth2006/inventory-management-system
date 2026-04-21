'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, UserPlus, Loader2, Users, Mail, Shield, ShieldCheck } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'
import { Profile } from '@/lib/types'
import { createStaffAction, deleteStaffAction } from '@/app/actions/staff'

export default function StaffPage() {
  const [staff, setStaff] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to fetch staff list')
    } else {
      setStaff(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    const res = await createStaffAction(formData.email, formData.password)
    
    if (res.success) {
      toast.success('Staff account created successfully')
      setIsModalOpen(false)
      setFormData({ email: '', password: '' })
      fetchStaff()
    } else {
      toast.error(res.error || 'Failed to create staff')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return

    const res = await deleteStaffAction(id)
    if (res.success) {
      toast.success('Staff deleted')
      fetchStaff()
    } else {
      toast.error(res.error || 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and system permissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          <UserPlus size={20} />
          Create New Staff
        </button>
      </div>

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-primary" size={32} />
                    <p className="mt-2 text-muted-foreground text-sm">Loading users...</p>
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="text-muted-foreground" size={24} />
                    </div>
                    <p className="text-muted-foreground">No staff members found.</p>
                  </td>
                </tr>
              ) : (
                staff.map((profile) => (
                  <tr key={profile.id} className="hover:bg-accent/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold">
                          {profile.email[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{profile.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        profile.role === 'admin' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {profile.role === 'admin' ? <ShieldCheck size={14}/> : <Shield size={14}/>}
                        {profile.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-sm font-medium">
                      {formatDate(profile.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {profile.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(profile.id, profile.email)}
                          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors text-muted-foreground"
                          title="Delete Account"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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
        title="Create New Staff Account"
      >
        <form onSubmit={handleCreateStaff} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="staff@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Temporary Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Note: New accounts are automatically assigned the <strong>STAFF</strong> role. 
              Staff can manage products and transactions but cannot manage other users.
            </p>
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
              className="bg-primary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
