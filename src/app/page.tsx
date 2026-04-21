'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogIn, Package, ShieldCheck, Zap, BarChart3, ChevronRight } from 'lucide-react'

const quotes = [
  { text: "Inventory is money sitting on your shelf.", author: "Anonymous" },
  { text: "The goal is not to have more, but to manage better.", author: "InvCentral" },
  { text: "Precision in stock is clarity in business.", author: "Modern Commerce" }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 h-24 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 rotate-3">
            <Package size={28} />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent italic">
            InvCentral
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/login/worker" 
            className="text-slate-500 hover:text-primary px-6 py-3 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest border border-transparent hover:border-slate-200 hover:bg-white shadow-sm"
          >
            Worker Portal
          </Link>
          <Link 
            href="/login/admin" 
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
          >
            Admin Portal
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/50 border border-blue-200 rounded-full text-blue-700 text-xs font-black uppercase tracking-widest mb-8">
              <Zap size={14} className="fill-current" />
              Next-Gen Inventory Control
            </div>
            
            <h1 className="text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
              Manage with <br />
              <span className="text-primary italic">Absolute</span> Precision.
            </h1>
            
            <p className="mt-8 text-xl text-slate-500 leading-relaxed font-medium max-w-xl">
              The smartest way to track stock, manage categories, and audit transitions for small businesses and modern commerce.
            </p>

            <div className="mt-12 flex items-center gap-6">
              <Link href="/login/worker" className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-slate-800 transition-all flex items-center gap-3 group">
                Get Started Now
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-6 relative z-10">
              {quotes.map((quote, i) => (
                <div 
                  key={i} 
                  className={`p-10 rounded-[3rem] shadow-2xl ${i === 2 ? 'col-span-2 bg-primary text-white' : 'bg-white text-slate-700'} relative overflow-hidden group`}
                >
                  <div className="relative z-10">
                    <p className="text-2xl font-black italic leading-tight">"{quote.text}"</p>
                    <p className={`mt-6 text-sm font-bold uppercase tracking-widest ${i === 2 ? 'text-white/60' : 'text-slate-400'}`}>
                      — {quote.author}
                    </p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-100/10 rounded-full blur-3xl"></div>
                </div>
              ))}
            </div>
            
            {/* Decorative background blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {[
            { title: "Real-time Tracking", desc: "Automated stock movements with instant transaction history.", icon: BarChart3 },
            { title: "Role-Based Access", desc: "Admin and Staff roles to protect your business data.", icon: ShieldCheck },
            { title: "Low Stock Alerts", desc: "Never run out of items with smart threshold notifications.", icon: Zap }
          ].map((f, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:y-[-5px] transition-all">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-primary mb-6">
                <f.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{f.title}</h3>
              <p className="mt-4 text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-20 border-t border-slate-200 mt-20 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-xs">
          InvCentral &copy; 2026 Powering Modern Inventory
        </p>
      </footer>
    </div>
  )
}
