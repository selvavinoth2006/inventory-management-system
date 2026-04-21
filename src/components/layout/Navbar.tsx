'use client'

import { Bell, Search, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email || null)
    })
  }, [supabase.auth])

  return (
    <header className="h-20 bg-transparent px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md border border-white/40 px-6 py-2.5 rounded-2xl w-96 group focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
        <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search for items, categories..." 
          className="bg-transparent border-none outline-none text-sm w-full font-medium"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2.5 bg-white/50 backdrop-blur-md border border-white/40 hover:bg-white rounded-xl transition-all shadow-sm group">
          <Bell size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white shadow-[0_0_8px_rgba(var(--primary),0.5)]"></span>
        </button>
        
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">{email?.split('@')[0] || 'Admin'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{email || 'admin@example.com'}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black shadow-xl shadow-primary/25 border-2 border-white/50 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            {email?.[0].toUpperCase() || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
