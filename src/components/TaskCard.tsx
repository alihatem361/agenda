
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task, formatTime } from '@/contexts/TimeTrackContext';
import CategoryBadge from '@/components/CategoryBadge';
import TimeTracker from '@/components/TimeTracker';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const navigate = useNavigate();
  
  const goToTaskDetails = () => {
    navigate(`/tasks/${task.id}`);
  };
  
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">{task.name}</CardTitle>
          <CategoryBadge category={task.category} className="self-start" />
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {task.description ? (
          <p className="text-muted-foreground line-clamp-2 text-sm">{task.description}</p>
        ) : (
          <p className="text-muted-foreground italic text-sm">لا يوجد وصف</p>
        )}
        
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={16} />
          <span className="font-mono">{formatTime(task.totalTime)}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-0">
        <TimeTracker taskId={task.id} size="sm" showTime={false} />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto text-primary hover:text-primary"
          onClick={goToTaskDetails}
        >
          التفاصيل <ArrowRight size={14} className="ms-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
