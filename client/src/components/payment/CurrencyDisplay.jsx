import React from 'react';

export const CurrencyDisplay = ({ usdAmount, inrAmount, rate, className = "" }) => {
  const finalInr = inrAmount || (usdAmount * (rate || 84.00));
  
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="font-bold text-white">₹{finalInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
      <span className="text-sm text-gray-400">(${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
    </div>
  );
};
