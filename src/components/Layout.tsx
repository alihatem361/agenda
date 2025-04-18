
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Home, ListChecks, Plus, Settings, Menu } from 'lucide-react';
import { useTimeTrack, formatTime } from '@/contexts/TimeTrackContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { activeTask, currentSession, isTimerRunning } = useTimeTrack();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: '/', name: 'الرئيسية', icon: <Home size={20} /> },
    { path: '/tasks', name: 'المهام', icon: <ListChecks size={20} /> },
    { path: '/new-task', name: 'مهمة جديدة', icon: <Plus size={20} /> },
    { path: '/settings', name: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center border-b border-border">
        <div className="text-primary mr-2">
          <Clock size={24} />
        </div>
        <h1 className="text-xl font-bold">تايم تراك</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="block">
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.path ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        {isTimerRunning && activeTask ? (
          <div className="bg-primary/10 rounded-lg p-3">
            <p className="text-sm font-medium mb-1">جاري تتبع:</p>
            <div className="font-medium line-clamp-1">{activeTask.name}</div>
            <div className="flex items-center mt-2">
              <Clock size={18} className="text-primary mr-1" />
              <span className="font-mono text-primary">
                {currentSession ? formatTime(currentSession.duration) : '00:00:00'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm">
            <p>لا يوجد مؤقت نشط</p>
            <Link to="/tasks">
              <Button variant="link" size="sm" className="mt-1">
                ابدأ التتبع
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {isMobile ? (
        <>
          <div className="sticky top-0 z-50 w-full bg-background border-b border-border p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Clock size={24} className="text-primary mr-2" />
              <h1 className="text-xl font-bold">Agenda</h1>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px]">
                <nav className="h-full flex flex-col">
                  <SidebarContent />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <main className="flex-1 p-4">{children}</main>
        </>
      ) : (
        <>
          <aside className="w-64 fixed h-screen bg-sidebar border-r border-border flex flex-col overflow-y-auto">
            <SidebarContent />
          </aside>
          <main className="flex-1 md:mr-64">
            <div className="p-6 max-w-7xl mx-auto">{children}</div>
          </main>
        </>
      )}
    </div>
  );
};

export default Layout;
