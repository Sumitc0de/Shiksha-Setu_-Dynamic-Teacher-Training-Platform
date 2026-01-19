import React from 'react';

const SimplePieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
      
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const previousPercentages = data
                .slice(0, index)
                .reduce((sum, prev) => sum + (prev.value / total) * 100, 0);
              
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -previousPercentages;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={`var(--${colors[index % colors.length].replace('bg-', 'color-')})`}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                  style={{
                    stroke: index === 0 ? '#3B82F6' : 
                           index === 1 ? '#10B981' : 
                           index === 2 ? '#8B5CF6' : 
                           index === 3 ? '#F59E0B' : 
                           index === 4 ? '#EF4444' : '#F59E0B'
                  }}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${colors[index % colors.length]}`} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 truncate">{item.label}</div>
              <div className="text-sm font-semibold text-gray-900">
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePieChart;
