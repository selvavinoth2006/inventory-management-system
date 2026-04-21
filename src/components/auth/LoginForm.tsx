'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, Loader2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface LoginFormProps {
  type: 'admin' | 'worker'
  title: string
  subtitle: string
}

export default function LoginForm({ type, title, subtitle }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          await supabase.auth.signOut()
          toast.error(`Profile Error: ${profileError.message}`)
          setLoading(false)
          return
        }

        const requiredRole = type === 'admin' ? 'admin' : 'staff'
        
        if (profile.role !== requiredRole) {
          await supabase.auth.signOut()
          toast.error(`Access Denied. This portal is for ${type === 'admin' ? 'Admins' : 'Workers'} only.`)
          setLoading(false)
          return
        }

        toast.success(`Welcome back, ${type === 'admin' ? 'Administrator' : 'Staff Member'}!`)
        router.refresh()
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isPrimary = type === 'admin'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-200 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${isPrimary ? 'bg-primary' : 'bg-slate-900'}`} />
          
          <div className="text-center mb-10">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-transform hover:rotate-12 ${isPrimary ? 'bg-primary shadow-primary/20' : 'bg-slate-900 shadow-slate-900/20'}`}>
              <LogIn className="text-white" size={36} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
            <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${isPrimary ? 'text-primary' : 'text-slate-900'} transition-colors`} size={20} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-${isPrimary ? 'primary' : 'slate-900'}/10 focus:border-${isPrimary ? 'primary' : 'slate-900'} transition-all font-semibold text-slate-900`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Security Password</label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:${isPrimary ? 'text-primary' : 'text-slate-900'} transition-colors`} size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-${isPrimary ? 'primary' : 'slate-900'}/10 focus:border-${isPrimary ? 'primary' : 'slate-900'} transition-all font-semibold text-slate-900`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 ${isPrimary ? 'bg-primary hover:bg-primary-hover shadow-primary/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'} text-white font-black rounded-2xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 group`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Authenticate Access
                  <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <ShieldAlert size={12} />
            Secure Encrypted Session
          </p>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-8 w-full text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-colors text-center"
        >
          &larr; Return to Intelligence Hub
        </button>
      </motion.div>
    </div>
  )
}
