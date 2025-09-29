import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ChartSkeleton: React.FC = () => {
  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart axes skeleton */}
          <div className="flex justify-between items-end h-64">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className={`w-8 bg-gradient-to-t from-primary/20 to-transparent`} style={{ height: `${Math.random() * 150 + 50}px` }} />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          {/* Legend skeleton */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center">
              <Skeleton className="w-3 h-3 mr-2" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-3 h-3 mr-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;