import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanTVApi } from '../../api/kanban-tv.api';
import { kanbanAdminApi } from '../../api/kanban-tv-admin.api';
import { useKanbanAuth } from '../../context/KanbanAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function BoardManager() {
  const { user } = useKanbanAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', is_active: true });

  const { data: boards, isLoading } = useQuery({
    queryKey: ['kanban-tv', 'boards'],
    queryFn: () => kanbanTVApi.getBoards(),
  });

  const createMutation = useMutation({
    mutationFn: (params: { name: string; slug: string }) =>
      kanbanAdminApi.createBoard({ ...params, created_by: user?.id || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'boards'] });
      toast({ title: 'Board created successfully' });
      setIsCreateOpen(false);
      setFormData({ name: '', slug: '', is_active: true });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create board', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...params }: any) => kanbanAdminApi.updateBoard(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'boards'] });
      toast({ title: 'Board updated successfully' });
      setEditingBoard(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update board', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => kanbanAdminApi.deleteBoard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'boards'] });
      toast({ title: 'Board deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete board', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBoard) {
      updateMutation.mutate({ id: editingBoard.id, ...formData });
    } else {
      createMutation.mutate({ name: formData.name, slug: formData.slug });
    }
  };

  if (isLoading) return <div>Loading boards...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Boards</CardTitle>
            <CardDescription>Manage Kanban boards</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData({ name: '', slug: '', is_active: true }); setEditingBoard(null); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Board
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingBoard ? 'Edit Board' : 'Create Board'}</DialogTitle>
                  <DialogDescription>Add a new Kanban board for your team</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Board Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Shop Floor"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="shop-floor"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingBoard ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {boards?.map((board) => (
            <div key={board.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{board.name}</h3>
                <p className="text-sm text-muted-foreground">/kanban-tv/{board.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={board.is_active}
                  onCheckedChange={(checked) => updateMutation.mutate({ id: board.id, is_active: checked })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingBoard(board);
                    setFormData({ name: board.name, slug: board.slug, is_active: board.is_active });
                    setIsCreateOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this board? All columns and cards will be removed.')) {
                      deleteMutation.mutate(board.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
