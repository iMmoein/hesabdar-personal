import React from 'react'
import { TrendingUp, TrendingDown, BarChart3, Users, Settings } from 'lucide-react'

const TABS = [
  { key: 'revenue', label: 'درآمد', icon: TrendingUp },
  { key: 'expenses', label: 'هزینه‌ها', icon: TrendingDown },
  { key: 'reports', label: 'گزارشات', icon: BarChart3 },
  { key: 'customers', label: 'مشتریان', icon: Users },
  { key: 'settings', label: 'تنظیمات', icon: Settings },
]

export function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="safe-bottom flex-shrink-0 px-3 pb-2 pt-1 bg-transparent">
      <nav className="glass rounded-3xl shadow-elevated border border-white/40 dark:border-slate-700/40">
        <div className="flex items-stretch h-14">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative"
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-l from-brand-800 to-brand-600" />
                )}
                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 scale-110'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] transition-all duration-200 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
