import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  title?: string;
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  title = "Carregando...", 
  rows = 3, 
  columns = 4 
}) => {
  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {/* Table rows */}
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 py-2">
              {[...Array(columns)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableSkeleton;