
import React from 'react';
import { Play, Square } from 'lucide-react';
import { useTimeTrack, formatTime } from '@/contexts/TimeTrackContext';
import { cn } from '@/lib/utils';

interface TimeTrackerProps {
  taskId: string;
  size?: 'sm' | 'md' | 'lg';
  showTime?: boolean;
  className?: string;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ 
  taskId, 
  size = 'md', 
  showTime = true,
  className
}) => {
  const { 
    startTimer, 
    stopTimer, 
    isTimerRunning, 
    activeTask, 
    currentSession 
  } = useTimeTrack();
  
  const isActive = isTimerRunning && activeTask?.id === taskId;
  
  const handleTimerToggle = () => {
    if (isActive) {
      stopTimer();
    } else {
      startTimer(taskId);
    }
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
  };
  
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={handleTimerToggle}
        className={cn(
          "timer-button",
          isActive ? "timer-button-stop animate-pulse-light" : "timer-button-start",
          sizeClasses[size]
        )}
        aria-label={isActive ? "Stop timer" : "Start timer"}
      >
        {isActive ? <Square size={size === 'sm' ? 16 : 24} /> : <Play size={size === 'sm' ? 16 : 24} />}
      </button>
      
      {showTime && (
        <div className="font-mono text-lg">
          {isActive && currentSession
            ? formatTime(currentSession.duration)
            : "--:--:--"}
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
