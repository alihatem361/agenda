
import React from 'react';
import { cn } from '@/lib/utils';
import { useTimeTrack, CategoryType } from '@/contexts/TimeTrackContext';

interface CategoryBadgeProps {
  category: CategoryType;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  const { categories } = useTimeTrack();
  
  const categoryData = categories.find(c => c.name === category);
  const categoryColor = categoryData?.color || '#808080';
  
  return (
    <span
      className={cn(
        "category-badge whitespace-nowrap text-center",
        "dark:text-white dark:bg-opacity-90",
        "text-xs sm:text-sm",
        className
      )}
      style={{ backgroundColor: categoryColor }}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
