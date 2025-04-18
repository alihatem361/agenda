
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTimeTrack, CategoryType } from '@/contexts/TimeTrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import TaskCard from '@/components/TaskCard';

const TasksList: React.FC = () => {
  const { tasks, categories } = useTimeTrack();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">المهام</h2>
          <p className="text-muted-foreground">إدارة وتتبع المهام الخاصة بك</p>
        </div>
        
        <Link to="/new-task">
          <Button className="w-full sm:w-auto">
            <Plus size={16} className="ml-2" />
            مهمة جديدة
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="البحث في المهام..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl font-medium mb-2">لم يتم العثور على مهام</h3>
          <p className="text-muted-foreground mb-6">
            {tasks.length === 0 
              ? "لم تقم بإنشاء أي مهام بعد." 
              : "لا توجد مهام تطابق عوامل التصفية الحالية."}
          </p>
          
          {tasks.length === 0 && (
            <Link to="/new-task">
              <Button>
                <Plus size={16} className="ml-2" />
                أنشئ مهمتك الأولى
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksList;
