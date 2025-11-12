import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { kanbanAdminApi } from '../../api/kanban-tv-admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export function UserManager() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'KANBAN_VIEWER' as any });

  const { data: users, isLoading } = useQuery({
    queryKey: ['kanban-tv', 'admin', 'users'],
    queryFn: () => kanbanAdminApi.getUsers(),
  });

  const createMutation = useMutation({
    mutationFn: (params: any) => kanbanAdminApi.createUser({ ...params, password_hash: params.password }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'admin', 'users'] });
      toast({ title: 'User created successfully' });
      setIsCreateOpen(false);
      setFormData({ email: '', password: '', role: 'KANBAN_VIEWER' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create user', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...params }: any) => {
      const updateData: any = { role: params.role, is_active: params.is_active };
      if (params.password) {
        updateData.password_hash = params.password;
      }
      return kanbanAdminApi.updateUser(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'admin', 'users'] });
      toast({ title: 'User updated successfully' });
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => kanbanAdminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'admin', 'users'] });
      toast({ title: 'User deleted successfully' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      KANBAN_ADMIN: 'destructive',
      KANBAN_EDITOR: 'default',
      KANBAN_VIEWER: 'secondary',
    };
    return <Badge variant={variants[role]}>{role.replace('KANBAN_', '')}</Badge>;
  };

  if (isLoading) return <div>Loading users...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage Kanban TV users and their access</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData({ email: '', password: '', role: 'KANBAN_VIEWER' }); setEditingUser(null); }}>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user details' : 'Add a new Kanban TV user'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password {editingUser && '(leave empty to keep current)'}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required={!editingUser}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KANBAN_VIEWER">Viewer (Read-only)</SelectItem>
                        <SelectItem value="KANBAN_EDITOR">Editor (Edit cards)</SelectItem>
                        <SelectItem value="KANBAN_ADMIN">Admin (Full access)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingUser ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.email}</h3>
                  {getRoleBadge(user.role)}
                  {!user.is_active && <Badge variant="outline">Inactive</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={user.is_active}
                  onCheckedChange={(checked) => updateMutation.mutate({ id: user.id, is_active: checked, role: user.role })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingUser(user);
                    setFormData({ email: user.email, password: '', role: user.role });
                    setIsCreateOpen(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this user? They will lose access immediately.')) {
                      deleteMutation.mutate(user.id);
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
