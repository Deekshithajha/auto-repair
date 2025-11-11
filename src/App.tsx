import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { KanbanAuthProvider } from "@/features/kanban-tv";
import { MainLayout } from "@/components/layout/MainLayout";
import { KanbanTVLogin } from "@/pages/KanbanTVLogin";
import { KanbanTVViewer } from "@/pages/KanbanTVViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Kanban TV Routes - Separate Auth System */}
          <Route path="/kanban-tv/login" element={
            <KanbanAuthProvider>
              <KanbanTVLogin />
            </KanbanAuthProvider>
          } />
          <Route path="/kanban-tv/:boardSlug" element={
            <KanbanAuthProvider>
              <KanbanTVViewer />
            </KanbanAuthProvider>
          } />
          
          {/* Main App Routes */}
          <Route path="/*" element={
            <AuthProvider>
              <MainLayout />
            </AuthProvider>
          } />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;