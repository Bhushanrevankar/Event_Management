'use client';

import { TrendUp01, TrendDown01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'error';
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  className?: string;
}

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    text: 'text-primary-600'
  },
  success: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-600'
  },
  error: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-600'
  }
};

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  change,
  className 
}: StatsCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div className={cx(
      "bg-white p-6 rounded-lg border border-gray-200 shadow-sm",
      className
    )}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              {change.type === 'increase' ? (
                <TrendUp01 className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendDown01 className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={cx(
                "text-sm font-medium",
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              )}>
                {change.value}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                {change.period}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cx(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            colors.bg
          )}>
            <Icon className={cx("w-6 h-6", colors.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}