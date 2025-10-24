import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

const getColorClasses = (color: string) => {
  switch (color) {
    case 'primary':
      return 'bg-primary text-white';
    case 'secondary':
      return 'bg-secondary text-white';
    case 'accent':
      return 'bg-accent text-text';
    case 'success':
      return 'bg-green-500 text-white';
    case 'warning':
      return 'bg-yellow-500 text-white';
    case 'danger':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function StatsCard({ title, value, icon, color, trend, subtitle }: StatsCardProps) {
  return (
    <div className={`rounded-xl shadow-lg p-6 ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.isPositive ? 'text-green-200' : 'text-red-200'
          }`}>
            <span>{trend.isPositive ? '↗️' : '↘️'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm opacity-90">{title}</div>
      </div>
      
      {subtitle && (
        <div className="text-xs opacity-75">{subtitle}</div>
      )}
    </div>
  );
}
