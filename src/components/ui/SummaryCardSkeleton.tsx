import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SummaryCardSkeleton: React.FC = () => {
  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <Skeleton className="w-4 h-4 mr-2 rounded" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-4 w-16 mt-2" />
      </CardContent>
    </Card>
  );
};

export default SummaryCardSkeleton;