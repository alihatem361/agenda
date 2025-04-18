
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from '@/contexts/TimeTrackContext';
import { cn } from '@/lib/utils';

interface TimeStatsCardProps {
  title: string;
  time: number;
  icon: React.ReactNode;
  className?: string;
}

const TimeStatsCard: React.FC<TimeStatsCardProps> = ({ 
  title, 
  time, 
  icon,
  className 
}) => {
  return (
    <Card className={cn("h-full dark:border-slate-800", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {formatTime(time)}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeStatsCard;
