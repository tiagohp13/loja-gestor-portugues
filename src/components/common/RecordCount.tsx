
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface RecordCountProps {
  title: string;
  count: number;
  icon?: LucideIcon;
}

const RecordCount: React.FC<RecordCountProps> = ({ title, count, icon: Icon }) => {
  return (
    <Card className="mb-4">
      <CardContent className="flex items-center gap-3 py-3">
        {Icon && <Icon className="h-5 w-5 text-blue-600" />}
        <span className="text-sm text-muted-foreground">
          {title}: <span className="font-medium text-foreground">{count}</span>
        </span>
      </CardContent>
    </Card>
  );
};

export default RecordCount;
