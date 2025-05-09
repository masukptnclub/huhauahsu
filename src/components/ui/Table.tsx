import React from 'react';
import { cn } from '../../utils/cn';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn(
          'w-full caption-bottom text-sm',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <thead
      className={cn(
        'bg-gray-50 [&_tr]:border-b',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <tbody
      className={cn(
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    >
      {children}
    </tbody>
  );
};

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableFooter: React.FC<TableFooterProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <tfoot
      className={cn(
        'bg-gray-50 border-t font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
};

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <tr
      className={cn(
        'border-b border-gray-200 hover:bg-gray-50 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <td
      className={cn(
        'p-4 align-middle',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};