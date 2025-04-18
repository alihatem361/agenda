
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTimeTrack, CategoryType } from '@/contexts/TimeTrackContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

// Form schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Task name must be at least 2 characters' }).max(50),
  category: z.string().min(1, { message: 'Please select a category' }),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getTaskById, updateTask, categories } = useTimeTrack();
  const navigate = useNavigate();
  
  const task = getTaskById(id!);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
    },
  });
  
  // Populate form with task data
  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        category: task.category,
        description: task.description,
      });
    }
  }, [task, form]);
  
  if (!task) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Task Not Found</h2>
        <p className="text-muted-foreground mb-6">The task you're trying to edit doesn't exist.</p>
        <Button onClick={() => navigate('/tasks')}>
          Go to Tasks
        </Button>
      </div>
    );
  }
  
  const onSubmit = (values: FormValues) => {
    updateTask(task.id, {
      name: values.name,
      category: values.category as CategoryType,
      description: values.description || '',
    });
    
    navigate(`/tasks/${task.id}`);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Task</CardTitle>
          <CardDescription>
            Update the details of your task
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categorize your task for better organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add additional details about this task" 
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Save size={16} className="mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTask;
