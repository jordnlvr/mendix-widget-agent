
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

// Types for the Data Grid
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string; // Simple key or dot notation
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataGridAction {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: (id: string, e: React.MouseEvent) => void;
  isDanger?: boolean;
}

interface UniversalDataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  viewMode: 'table' | 'grid';
  onRowClick?: (item: T) => void;
  renderGridCard?: (item: T) => React.ReactNode;
  keyField?: string;
  actionRenderer?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  variant?: 'default' | 'clean'; // Added variant prop
}

export function UniversalDataGrid<T extends { id: string | number }>({ 
  data, 
  columns, 
  viewMode, 
  onRowClick, 
  renderGridCard,
  keyField = 'id',
  actionRenderer,
  emptyMessage = "No items found.",
  variant = 'default'
}: UniversalDataGridProps<T>) {

  // --- GRID VIEW ---
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {data.length === 0 ? (
           <div className="col-span-full text-center py-10 text-slate-400">{emptyMessage}</div>
        ) : (
           data.map((item) => (
             <React.Fragment key={String(item[keyField as keyof T])}>
                {renderGridCard ? renderGridCard(item) : (
                   // Fallback card if no renderer provided
                   <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <pre>{JSON.stringify(item, null, 2)}</pre>
                   </div>
                )}
             </React.Fragment>
           ))
        )}
      </div>
    );
  }

  // --- TABLE VIEW ---
  const containerClasses = variant === 'default' 
    ? "bg-app-surface rounded-app border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden" 
    : "bg-transparent overflow-hidden"; // Clean variant removes borders/shadows/bg

  return (
    <div className={`${containerClasses} animate-in fade-in duration-500`}>
      <div className="overflow-x-auto min-h-[150px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {actionRenderer && <th className="px-6 py-4"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {data.length === 0 ? (
               <tr>
                  <td colSpan={columns.length + (actionRenderer ? 1 : 0)} className="px-6 py-10 text-center text-slate-400">
                     {emptyMessage}
                  </td>
               </tr>
            ) : (
               data.map((item) => (
                 <tr 
                   key={String(item[keyField as keyof T])} 
                   onClick={() => onRowClick && onRowClick(item)}
                   className={`group transition-colors ${onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer' : ''}`}
                 >
                   {columns.map((col, idx) => (
                     <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                       {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T])}
                     </td>
                   ))}
                   {actionRenderer && (
                     <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                       {actionRenderer(item)}
                     </td>
                   )}
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Default Pagination Footer (Mock) */}
      {data.length > 0 && (
         <div className={`px-6 py-4 flex justify-between items-center text-xs text-slate-500 ${variant === 'default' ? 'border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30' : 'border-t border-slate-200 dark:border-slate-800'}`}>
            <span>Showing <strong>1</strong> to <strong>{data.length}</strong> of <strong>{data.length}</strong> results</span>
            <div className="flex gap-2">
               <button disabled className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">Previous</button>
               <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50">Next</button>
            </div>
         </div>
      )}
    </div>
  );
}
