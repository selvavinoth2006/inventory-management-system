'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  History, 
  LogOut,
  ChevronLeft,
  Menu,
  Users,
  ShieldCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { label: 'Products', href: '/products', icon: Package, roles: ['admin', 'staff'] },
  { label: 'Categories', href: '/categories', icon: Tags, roles: ['admin', 'staff'] },
  { label: 'Transactions', href: '/transactions', icon: History, roles: ['admin', 'staff'] },
  { label: 'Staff Management', href: '/staff', icon: Users, roles: ['admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setRole(data?.role || 'staff')
      }
    }
    fetchRole()
  }, [supabase])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Logout failed')
    } else {
      toast.success('Logged out')
      router.push('/')
    }
  }

  const filteredNavItems = navItems.filter(item => {
    // While loading role, only show common items (staff role)
    if (!role) return item.roles.includes('staff') && item.label !== 'Staff Management'
    return item.roles.includes(role)
  })

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-2rem)] sticky top-4 m-4 glass-card rounded-[2rem] transition-all duration-300 flex flex-col z-20",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-8 flex items-center justify-between border-b border-slate-100/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Package size={18} />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent">
              InvCentral
            </span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2.5 hover:bg-slate-100 rounded-xl transition-all active:scale-95 text-slate-500",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-10 space-y-3">
        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 mb-6">
            <span className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
              role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-slate-50 text-slate-500 border-slate-100"
            )}>
              <ShieldCheck size={12} className={role === 'admin' ? "text-purple-600" : "text-slate-400"} />
              {role || 'Loading...'}
            </span>
          </div>
        )}

        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/25 nav-active-glow" 
                  : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn(isActive ? "" : "group-hover:scale-110 transition-transform")} />
              {!collapsed && <span className="font-bold tracking-tight">{item.label}</span>}
              {isActive && !collapsed && (
                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-slate-100/50">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-4 p-4 w-full rounded-2xl transition-all duration-300 text-red-500 hover:bg-red-50 font-bold",
            collapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
