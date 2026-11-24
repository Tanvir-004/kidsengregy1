import React from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: LucideIcon
  tint?: 'emerald' | 'amber' | 'blue' | 'purple' | 'forest'
  badge?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tint = 'emerald',
  badge,
}: MetricCardProps) {
  const tintClasses = {
    forest: 'bg-emerald-900/10 text-emerald-950 border-emerald-900/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }

  const iconTintClasses = {
    forest: 'bg-emerald-950 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-500 text-white',
    blue: 'bg-blue-600 text-white',
    purple: 'bg-purple-600 text-white',
  }

  return (
    <div className="bg-white rounded-xl border border-emerald-950/10 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 font-english">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${iconTintClasses[tint]} shrink-0 shadow-xs`}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100 pt-2.5">
        <span>{subtitle}</span>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-medium ${tintClasses[tint]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
