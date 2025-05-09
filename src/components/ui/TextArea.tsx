import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    containerClassName,
    ...props 
  }, ref) => {
    return (
      <div className={cn('space-y-1', containerClassName)}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          <textarea
            className={cn(
              'block w-full rounded-md sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px]',
              error
                ? 'border-error-300 focus:border-error-500 focus:ring-error-500 text-error-900 placeholder-error-300'
                : 'border-gray-300 focus:border-primary-500 placeholder-gray-400',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-error-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';