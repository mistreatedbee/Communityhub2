import React from 'react';
import { ArrowUpRight, ArrowDownRight, BoxIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
interface StatsCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: BoxIcon;
  color?: 'primary' | 'secondary' | 'blue' | 'green' | 'purple' | 'orange';
}
export function StatsCard({
  label,
  value,
  trend,
  icon: Icon,
  color = 'primary'
}: StatsCardProps) {
  const colorStyles = {
    primary: 'bg-blue-50 text-blue-600',
    secondary: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {trend &&
          <div
            className={`flex items-center mt-2 text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>

              {trend.isPositive ?
            <ArrowUpRight className="w-3 h-3 mr-1" /> :

            <ArrowDownRight className="w-3 h-3 mr-1" />
            }
              <span>{trend.value}</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          }
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardContent>
    </Card>);

}