
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

// Define types for our data structures
export type CategoryType = 'work' | 'study' | 'leisure' | 'other' | string;

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TimeSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
}

export interface Task {
  id: string;
  name: string;
  description: string;
  category: CategoryType;
  sessions: TimeSession[];
  totalTime: number; // in seconds
  createdAt: Date;
}

// Context type definition
interface TimeTrackContextType {
  tasks: Task[];
  categories: Category[];
  activeTask: Task | null;
  isTimerRunning: boolean;
  currentSession: TimeSession | null;
  addTask: (task: Omit<Task, 'id' | 'sessions' | 'totalTime' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'sessions' | 'totalTime'>>) => void;
  deleteTask: (id: string) => void;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  addCategory: (name: string, color: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTotalTimeByCategory: () => Record<CategoryType, number>;
  getMostActiveTask: () => Task | null;
  getMostActiveCategory: () => { category: CategoryType; time: number } | null;
  getWeeklyTotal: () => number;
  getMonthlyTotal: () => number;
}

// Default categories
const defaultCategories: Category[] = [
  { id: '1', name: 'work', color: '#4361EE' },
  { id: '2', name: 'study', color: '#7209B7' },
  { id: '3', name: 'leisure', color: '#F72585' },
  { id: '4', name: 'other', color: '#4CC9F0' },
];

// Create context with default values
const TimeTrackContext = createContext<TimeTrackContextType | undefined>(undefined);

// Provider component
export const TimeTrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for tasks and active task
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('timetrack-tasks');
    const savedCategories = localStorage.getItem('timetrack-categories');
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        
        // Convert string dates back to Date objects
        const formattedTasks = parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          sessions: task.sessions.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : null,
          })),
        }));
        
        setTasks(formattedTasks);
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
      }
    }
    
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error parsing saved categories:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timetrack-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('timetrack-categories', JSON.stringify(categories));
  }, [categories]);

  // Check for any running timer on load and resume it
  useEffect(() => {
    const runningTaskId = localStorage.getItem('timetrack-running-task');
    const sessionStart = localStorage.getItem('timetrack-session-start');
    
    if (runningTaskId && sessionStart) {
      const taskToResume = tasks.find(task => task.id === runningTaskId);
      if (taskToResume) {
        const startTime = new Date(sessionStart);
        const sessionId = `session-${Date.now()}`;
        
        setActiveTask(taskToResume);
        setIsTimerRunning(true);
        setCurrentSession({
          id: sessionId,
          startTime,
          endTime: null,
          duration: 0,
        });
        
        // Start the timer
        const interval = setInterval(() => {
          setCurrentSession(prev => {
            if (!prev) return null;
            
            const now = new Date();
            const durationInSeconds = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000);
            
            return {
              ...prev,
              duration: durationInSeconds,
            };
          });
        }, 1000);
        
        setTimerInterval(interval);
        
        // Clean up
        return () => {
          if (interval) clearInterval(interval);
        };
      }
    }
  }, [tasks]);

  // Add a new task
  const addTask = (taskData: Omit<Task, 'id' | 'sessions' | 'totalTime' | 'createdAt'>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...taskData,
      sessions: [],
      totalTime: 0,
      createdAt: new Date(),
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    toast({
      title: "Task created",
      description: `"${newTask.name}" has been added.`,
    });
  };

  // Update an existing task
  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'sessions' | 'totalTime'>>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
    
    // Update active task if it's the one being updated
    if (activeTask && activeTask.id === id) {
      setActiveTask(prev => prev ? { ...prev, ...updates } : null);
    }
    
    toast({
      title: "Task updated",
      description: "The task has been updated successfully.",
    });
  };

  // Delete a task
  const deleteTask = (id: string) => {
    // If this task has an active timer, stop it first
    if (activeTask && activeTask.id === id) {
      stopTimer();
    }
    
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
    });
  };

  // Start timer for a task
  const startTimer = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // If another task is active, stop that timer first
    if (isTimerRunning && activeTask && activeTask.id !== taskId) {
      stopTimer();
    }
    
    const startTime = new Date();
    const sessionId = `session-${Date.now()}`;
    
    setActiveTask(task);
    setIsTimerRunning(true);
    setCurrentSession({
      id: sessionId,
      startTime,
      endTime: null,
      duration: 0,
    });
    
    // Save to localStorage
    localStorage.setItem('timetrack-running-task', taskId);
    localStorage.setItem('timetrack-session-start', startTime.toISOString());
    
    // Start the timer
    const interval = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const now = new Date();
        const durationInSeconds = Math.floor((now.getTime() - prev.startTime.getTime()) / 1000);
        
        return {
          ...prev,
          duration: durationInSeconds,
        };
      });
    }, 1000);
    
    setTimerInterval(interval);
    
    toast({
      title: "Timer started",
      description: `Tracking time for "${task.name}".`,
    });
  };

  // Stop the current timer
  const stopTimer = () => {
    if (!isTimerRunning || !activeTask || !currentSession) return;
    
    // Clear interval
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
    
    const endTime = new Date();
    const durationInSeconds = Math.floor(
      (endTime.getTime() - currentSession.startTime.getTime()) / 1000
    );
    
    // Create the completed session
    const completedSession: TimeSession = {
      ...currentSession,
      endTime,
      duration: durationInSeconds,
    };
    
    // Update the task with the new session
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === activeTask.id) {
          const updatedSessions = [...task.sessions, completedSession];
          const newTotalTime = task.totalTime + durationInSeconds;
          
          return {
            ...task,
            sessions: updatedSessions,
            totalTime: newTotalTime,
          };
        }
        return task;
      })
    );
    
    // Clear active state
    setActiveTask(null);
    setIsTimerRunning(false);
    setCurrentSession(null);
    
    // Clear localStorage
    localStorage.removeItem('timetrack-running-task');
    localStorage.removeItem('timetrack-session-start');
    
    toast({
      title: "Timer stopped",
      description: `Recorded ${formatTime(durationInSeconds)} for "${activeTask.name}".`,
    });
  };

  // Add a new category
  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: name.toLowerCase(),
      color,
    };
    
    setCategories(prev => [...prev, newCategory]);
    
    toast({
      title: "Category added",
      description: `"${name}" has been added to categories.`,
    });
  };

  // Get a task by ID
  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  // Get total time grouped by category
  const getTotalTimeByCategory = (): Record<CategoryType, number> => {
    return tasks.reduce((acc, task) => {
      const category = task.category as CategoryType;
      acc[category] = (acc[category] || 0) + task.totalTime;
      return acc;
    }, {} as Record<CategoryType, number>);
  };

  // Get the most active task (with most time)
  const getMostActiveTask = (): Task | null => {
    if (tasks.length === 0) return null;
    
    return tasks.reduce((max, task) => 
      task.totalTime > max.totalTime ? task : max
    , tasks[0]);
  };

  // Get the most active category
  const getMostActiveCategory = (): { category: CategoryType; time: number } | null => {
    const categoryTimes = getTotalTimeByCategory();
    const categories = Object.keys(categoryTimes) as CategoryType[];
    
    if (categories.length === 0) return null;
    
    const mostActive = categories.reduce((max, category) => 
      categoryTimes[category] > categoryTimes[max] ? category : max
    , categories[0]);
    
    return {
      category: mostActive,
      time: categoryTimes[mostActive],
    };
  };

  // Get total time for current week
  const getWeeklyTotal = (): number => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    return tasks.reduce((total, task) => {
      const taskTime = task.sessions.reduce((sessionTotal, session) => {
        if (session.startTime >= startOfWeek) {
          return sessionTotal + session.duration;
        }
        return sessionTotal;
      }, 0);
      
      return total + taskTime;
    }, 0);
  };

  // Get total time for current month
  const getMonthlyTotal = (): number => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return tasks.reduce((total, task) => {
      const taskTime = task.sessions.reduce((sessionTotal, session) => {
        if (session.startTime >= startOfMonth) {
          return sessionTotal + session.duration;
        }
        return sessionTotal;
      }, 0);
      
      return total + taskTime;
    }, 0);
  };

  const contextValue: TimeTrackContextType = {
    tasks,
    categories,
    activeTask,
    isTimerRunning,
    currentSession,
    addTask,
    updateTask,
    deleteTask,
    startTimer,
    stopTimer,
    addCategory,
    getTaskById,
    getTotalTimeByCategory,
    getMostActiveTask,
    getMostActiveCategory,
    getWeeklyTotal,
    getMonthlyTotal,
  };

  return (
    <TimeTrackContext.Provider value={contextValue}>
      {children}
    </TimeTrackContext.Provider>
  );
};

// Custom hook to use the TimeTrack context
export const useTimeTrack = (): TimeTrackContextType => {
  const context = useContext(TimeTrackContext);
  if (context === undefined) {
    throw new Error('useTimeTrack must be used within a TimeTrackProvider');
  }
  return context;
};

// Helper function to format time
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].join(':');
};

// Helper function to format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};
