import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useKanbanAuth } from '@/features/kanban-tv/context/KanbanAuthContext';
import { kanbanTVApi } from '@/features/kanban-tv/api/kanban-tv.api';
import { BoardManager } from '@/features/kanban-tv/components/admin/BoardManager';
import { ColumnManager } from '@/features/kanban-tv/components/admin/ColumnManager';
import { UserManager } from '@/features/kanban-tv/components/admin/UserManager';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Monitor } from 'lucide-react';

export default function KanbanTVAdmin() {
  const navigate = useNavigate();
  const { user, signOut, hasRole } = useKanbanAuth();
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  const { data: boards } = useQuery({
    queryKey: ['kanban-tv', 'boards'],
    queryFn: () => kanbanTVApi.getBoards(),
  });

  // Redirect non-admins
  if (!hasRole('KANBAN_ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You must be a KANBAN_ADMIN to access this page.</p>
          <Button onClick={() => navigate('/kanban-tv/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  // Auto-select first board
  if (boards && boards.length > 0 && !selectedBoardId) {
    setSelectedBoardId(boards[0].id);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/kanban-tv/login')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Kanban TV Admin</h1>
                <p className="text-sm text-muted-foreground">Manage boards, columns, and users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.role.replace('KANBAN_', '')}</p>
              </div>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="boards" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="boards">Boards</TabsTrigger>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="boards" className="space-y-4">
            <BoardManager />
          </TabsContent>

          <TabsContent value="columns" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Select value={selectedBoardId} onValueChange={setSelectedBoardId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards?.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBoardId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const board = boards?.find(b => b.id === selectedBoardId);
                    if (board) navigate(`/kanban-tv/${board.slug}`);
                  }}
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  View TV Display
                </Button>
              )}
            </div>
            {selectedBoardId ? (
              <ColumnManager boardId={selectedBoardId} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a board to manage its columns
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
