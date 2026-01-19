import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TrendIndicator = ({ value, trend, label }) => {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (trend > 0) return 'text-green-600 bg-green-50';
    if (trend < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-xs font-semibold">
            {Math.abs(trend)}%
          </span>
        </div>
      )}
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
};

export default TrendIndicator;
