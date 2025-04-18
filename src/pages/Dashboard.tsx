
import React from 'react';
import { useTimeTrack, formatTime } from '@/contexts/TimeTrackContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TimeStatsCard from '@/components/TimeStatsCard';
import CategoryBadge from '@/components/CategoryBadge';
import { Calendar, Clock, Layers, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const { 
    tasks, 
    categories,
    getMostActiveTask,
    getMostActiveCategory,
    getTotalTimeByCategory,
    getWeeklyTotal,
    getMonthlyTotal
  } = useTimeTrack();
  
  const mostActiveTask = getMostActiveTask();
  const mostActiveCategory = getMostActiveCategory();
  const weeklyTotal = getWeeklyTotal();
  const monthlyTotal = getMonthlyTotal();
  
  // Data for the category pie chart
  const categoryTimes = getTotalTimeByCategory();
  const pieData = Object.keys(categoryTimes).map(category => ({
    name: category,
    value: categoryTimes[category],
    color: categories.find(c => c.name === category)?.color || '#gray'
  }));
  
  // Data for the daily activity chart
  const getDayData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayTotals = Array(7).fill(0);
    
    tasks.forEach(task => {
      task.sessions.forEach(session => {
        if (session.startTime) {
          const dayIndex = session.startTime.getDay();
          dayTotals[dayIndex] += session.duration;
        }
      });
    });
    
    return daysOfWeek.map((day, index) => ({
      day,
      time: dayTotals[index]
    }));
  };
  
  const dayData = getDayData();
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Track your productivity and time usage</p>
      </div>
      
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h3 className="text-xl font-semibold mb-2">Welcome to TimeTrack!</h3>
            <p className="text-center text-muted-foreground mb-4">
              Start tracking your time by creating your first task.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TimeStatsCard 
              title="Weekly Total" 
              time={weeklyTotal} 
              icon={<Calendar size={16} />} 
            />
            <TimeStatsCard 
              title="Monthly Total" 
              time={monthlyTotal} 
              icon={<Calendar size={16} />} 
            />
            
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Task</CardTitle>
                <Target size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {mostActiveTask ? (
                  <>
                    <div className="font-medium line-clamp-1">{mostActiveTask.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryBadge category={mostActiveTask.category} />
                      <span className="text-sm text-muted-foreground font-mono">{formatTime(mostActiveTask.totalTime)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No tasks yet</div>
                )}
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Active Category</CardTitle>
                <Layers size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {mostActiveCategory ? (
                  <>
                    <div className="flex items-center">
                      <CategoryBadge category={mostActiveCategory.category} className="mr-2" />
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground font-mono">
                      {formatTime(mostActiveCategory.time)}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No data yet</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Time by Category</CardTitle>
                <CardDescription>Distribution of your time across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatTime(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Time spent each day of the week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dayData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" />
                      <YAxis tickFormatter={(seconds) => {
                        const hours = Math.floor(seconds / 3600);
                        return `${hours}h`;
                      }} />
                      <Tooltip formatter={(value) => formatTime(value as number)} />
                      <Bar dataKey="time" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
