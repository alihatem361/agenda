
import React, { useState } from 'react';
import { useTimeTrack, Category } from '@/contexts/TimeTrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { categories, addCategory } = useTimeTrack();
  const { toast } = useToast();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  
  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    if (categories.some(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
      toast({
        title: "Error",
        description: "A category with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    addCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('#3B82F6');
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your categories and preferences</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            Manage task categories for better organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Category</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoryColor">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="categoryColor"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: newCategoryColor }}
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleAddCategory}>
              <PlusCircle size={16} className="mr-2" />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
