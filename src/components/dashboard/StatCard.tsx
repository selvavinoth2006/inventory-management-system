'use client'

import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  iconName: keyof typeof Icons
  description?: string
  trend?: {
    value: number
    positive: boolean
  }
  color: string
}

export default function StatCard({ title, value, iconName, description, trend, color }: StatCardProps) {
  const Icon = (Icons[iconName] as Icons.LucideIcon) || Icons.HelpCircle
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="glass-card p-8 rounded-[2.5rem] group transition-all relative overflow-hidden h-full flex flex-col justify-between"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className={cn("p-4 rounded-2xl shadow-lg transition-all group-hover:rotate-6", color)}>
          <Icon className="text-white" size={28} />
        </div>
        {trend && (
          <div className={cn(
            "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm",
            trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend.positive ? '↑' : '↓'} {trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-8 relative z-10">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</p>
        <h3 className="text-4xl font-black mt-3 text-slate-900 tracking-tight">{value}</h3>
        {description && <p className="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          {description}
        </p>}
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-slate-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
    </motion.div>
  )
}
