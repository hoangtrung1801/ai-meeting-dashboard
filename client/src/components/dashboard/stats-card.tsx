import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  additionalText?: string;
}

export function StatsCard({ title, value, icon, iconBgColor, additionalText }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <i className={cn(icon, "text-white")}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {additionalText && (
                  <span className="ml-2 text-sm font-medium text-green-600">{additionalText}</span>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
