
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TimeTrackProvider } from "@/contexts/TimeTrackContext";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TasksList from "./pages/TasksList";
import CreateTask from "./pages/CreateTask";
import TaskDetails from "./pages/TaskDetails";
import EditTask from "./pages/EditTask";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TimeTrackProvider>
        <div className="dark">
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout><Dashboard /></Layout>} />
                <Route path="/tasks" element={<Layout><TasksList /></Layout>} />
                <Route path="/new-task" element={<Layout><CreateTask /></Layout>} />
                <Route path="/tasks/:id" element={<Layout><TaskDetails /></Layout>} />
                <Route path="/tasks/:id/edit" element={<Layout><EditTask /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </TimeTrackProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
