import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'bg-blue-500', 
  trend = null,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  loading = false,
  onClick = null,
  className = ''
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trendType) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500 mr-1" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500 mr-1" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trendType) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const CardContent = () => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {trend && (
          <div className="flex items-center">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {trend}
            </span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 text-left w-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      >
        <CardContent />
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <CardContent />
    </div>
  );
};

export default StatsCard;