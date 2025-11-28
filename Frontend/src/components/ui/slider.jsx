import React from 'react';
import { cn } from '@/lib/utils';

const Slider = ({ value, onValueChange, min = 0, max = 100, step = 1, className, ...props }) => {
  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    if (Array.isArray(value)) {
      // For range slider, we'll use two inputs
      onValueChange([newValue, value[1]]);
    } else {
      onValueChange(newValue);
    }
  };

  const handleMaxChange = (e) => {
    const newValue = Number(e.target.value);
    onValueChange([value[0], newValue]);
  };

  if (Array.isArray(value)) {
    // Range slider with two inputs
    return (
      <div className={cn("relative flex items-center gap-2", className)} {...props}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={handleChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={handleMaxChange}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
    );
  }

  // Single value slider
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700",
        className
      )}
      {...props}
    />
  );
};

export { Slider };