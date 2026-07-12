import { Wallet, TrendingDown, ChartBar as BarChart3, Users, Settings, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'revenue', label: 'درآمد', icon: TrendingUp },
  { id: 'expenses', label: 'هزینه‌ها', icon: TrendingDown },
  { id: 'reports', label: 'گزارشات', icon: BarChart3 },
  { id: 'customers', label: 'مشتریان', icon: Users },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
]

export function TabNav({ active, onChange }) {
  return (
    <nav className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-slate-200 dark:border-slate-700 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-sm">
              <Wallet size={20} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 hidden sm:block">حسابدار</span>
          </div>
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = active === t.id
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition
                  ${isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Icon size={17} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
