import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTimeTrack, formatTime, formatDate, TimeSession } from '@/contexts/TimeTrackContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, Clock, Edit, FileText, Trash2 } from 'lucide-react';
import CategoryBadge from '@/components/CategoryBadge';
import TimeTracker from '@/components/TimeTracker';

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTaskById, deleteTask } = useTimeTrack();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const task = getTaskById(id!);
  
  if (!task) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">The task you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tasks')}>
          Go to Tasks
        </Button>
      </div>
    );
  }
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    toast({
      title: "Task deleted",
      description: `"${task.name}" has been deleted.`,
    });
    navigate('/tasks');
  };
  
  const exportToCSV = () => {
    if (!task || task.sessions.length === 0) return;
    
    const headers = ['التاريخ', 'وقت البدء', 'وقت الانتهاء', 'المدة'];
    const rows = sortedSessions.map(session => [
      formatDate(session.startTime),
      session.startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      session.endTime ? session.endTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '-',
      formatTime(session.duration)
    ]);
    
    const csvContent = [
      `اسم المهمة: ${task.name}`,
      `التصنيف: ${task.category}`,
      `الوقت الكلي: ${formatTime(task.totalTime)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${task.name}-sessions.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "تم تصدير البيانات",
      description: `تم تصدير جلسات "${task.name}" بنجاح`,
    });
  };
  
  const sessionsCount = task.sessions.length;
  const averageSessionTime = sessionsCount > 0 
    ? Math.floor(task.totalTime / sessionsCount)
    : 0;
  
  const sortedSessions = [...task.sessions].sort((a, b) => 
    b.startTime.getTime() - a.startTime.getTime()
  );
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Task</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{task.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteTask}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{task.name}</CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={task.category} />
                    <span className="text-xs">Created on {formatDate(task.createdAt)}</span>
                  </div>
                </CardDescription>
              </div>
              <TimeTracker taskId={task.id} size="lg" />
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-2">Description</h3>
            {task.description ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description provided</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center text-muted-foreground mb-1">
                  <Clock size={16} className="mr-1" />
                  <span className="text-xs">Total Time</span>
                </div>
                <div className="font-mono text-xl">{formatTime(task.totalTime)}</div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center text-muted-foreground mb-1">
                  <Calendar size={16} className="mr-1" />
                  <span className="text-xs">Sessions</span>
                </div>
                <div className="text-xl">{sessionsCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList>
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
          <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الجلسات</CardTitle>
                <CardDescription>
                  سجل جميع جلسات العمل على هذه المهمة
                </CardDescription>
              </div>
              {task.sessions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="gap-2"
                >
                  <FileText size={16} />
                  تصدير CSV
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {sessionsCount > 0 ? (
                <Table>
                  <TableCaption>A list of your time sessions for {task.name}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead className="text-right">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{formatDate(session.startTime)}</TableCell>
                        <TableCell>
                          {session.startTime.toLocaleTimeString('ar-EG', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          {session.endTime ? session.endTime.toLocaleTimeString('ar-EG', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          }) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatTime(session.duration)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No time sessions recorded yet.</p>
                  <p className="mt-2">Use the timer above to start tracking time for this task.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Task Statistics</CardTitle>
              <CardDescription>
                Overview of time usage patterns for this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Total Time Spent</h4>
                  <p className="text-2xl font-mono">{formatTime(task.totalTime)}</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Number of Sessions</h4>
                  <p className="text-2xl">{sessionsCount}</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Average Session Length</h4>
                  <p className="text-2xl font-mono">{formatTime(averageSessionTime)}</p>
                </div>
              </div>
              
              {sessionsCount === 0 && (
                <div className="text-center py-6 mt-4">
                  <p className="text-muted-foreground">Start tracking time to see more detailed statistics.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskDetails;
