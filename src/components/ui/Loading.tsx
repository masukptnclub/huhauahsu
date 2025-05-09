import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  fullScreen = false,
  message,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-t-2 border-b-2',
    lg: 'h-20 w-20 border-4',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen fixed inset-0 bg-white/80 dark:bg-gray-900/80'
    : 'w-full';

  return (
    <div className={cn('flex flex-col items-center justify-center', containerClasses, className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-primary-600 border-r-transparent border-solid',
          sizeClasses[size]
        )}
      />
      {message && (
        <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
      )}
    </div>
  );
};

export default Loading; 