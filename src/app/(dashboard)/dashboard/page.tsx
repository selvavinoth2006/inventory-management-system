import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/dashboard/StatCard'
import { 
  Package, 
  Tags, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  Shield
} from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()

  // Fetch Stats & User
  const [
    { data: { user } },
    { count: productCount }, 
    { count: categoryCount }, 
    { data: products }, 
    { data: recentTransactions }
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('quantity, price, low_stock_threshold'),
    supabase.from('stock_transactions')
      .select('*, products(name)')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  // Fetch role separately to determine quick actions visibility
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const totalStock = products?.reduce((acc, p) => acc + p.quantity, 0) || 0
  const lowStockItems = products?.filter(p => p.quantity <= p.low_stock_threshold).length || 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] p-8 text-slate-900 shadow-sm group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Welcome back, <span className="text-primary">{user?.email?.split('@')[0]}</span>!
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium max-w-xl">
              Monitor your stock and team performance from one central command.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/products" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover transition-all">
              Manage Items
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={productCount || 0} 
          iconName="Package" 
          color="bg-blue-500 shadow-blue-200 shadow-lg"
          description="Total items in catalog"
        />
        <StatCard 
          title="Categories" 
          value={categoryCount || 0} 
          iconName="Tags" 
          color="bg-purple-500 shadow-purple-200 shadow-lg"
        />
        <StatCard 
          title="Total Stock" 
          value={totalStock.toLocaleString()} 
          iconName="BarChart3" 
          color="bg-indigo-500 shadow-indigo-200 shadow-lg"
          description="Total physical quantity"
        />
        <StatCard 
          title="Low Stock" 
          value={lowStockItems} 
          iconName="AlertTriangle" 
          color="bg-amber-500 shadow-amber-200 shadow-lg"
          description="Items below threshold"
          trend={lowStockItems > 0 ? { value: lowStockItems, positive: false } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-slate-100/50 flex items-center justify-between">
            <h2 className="font-black text-xl text-slate-900 tracking-tight">Recent Transactions</h2>
            <Link href="/transactions" className="text-primary text-sm font-black hover:underline uppercase tracking-widest">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Type</th>
                  <th className="px-8 py-5">Quantity</th>
                  <th className="px-8 py-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {recentTransactions?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-900">{t.products?.name}</td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm",
                        t.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        {t.type === 'IN' ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                        {t.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-slate-700">{t.quantity}</td>
                    <td className="px-8 py-5 text-slate-400 text-xs font-bold">{formatDate(t.created_at)}</td>
                  </tr>
                ))}
                {recentTransactions?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold italic">
                      No recent activity recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8">
          <h2 className="font-black text-xl text-slate-900 tracking-tight mb-8">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/dashboard" 
              className="flex items-center justify-between p-5 rounded-[1.5rem] bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100/30 transition-all group scale-100 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm">
                  <Package size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">Add Product</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">New item</p>
                </div>
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link 
              href="/transactions" 
              className="flex items-center justify-between p-5 rounded-[1.5rem] bg-green-50/50 hover:bg-green-100/50 border border-green-100/30 transition-all group scale-100 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600 shadow-sm">
                  <ArrowUpRight size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">Stock In</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Incoming</p>
                </div>
              </div>
              <ArrowUpRight size={20} className="text-slate-300 group-hover:text-green-600 transition-colors" />
            </Link>

            {isAdmin && (
              <Link 
                href="/staff" 
                className="flex items-center justify-between p-5 rounded-[1.5rem] bg-purple-50/50 hover:bg-purple-100/50 border border-purple-100/30 transition-all group scale-100 hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-sm tracking-tight">Manage Staff</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Team accounts</p>
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
