import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useKanbanColumns } from '../../hooks/useKanbanQueries';
import { kanbanAdminApi } from '../../api/kanban-tv-admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ColumnManagerProps {
  boardId: string;
}

function SortableColumn({ column, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-4 border rounded-lg bg-background">
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: column.color }} />
          <h3 className="font-medium">{column.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Position: {column.position} {column.wip_limit && `• WIP Limit: ${column.wip_limit}`}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(column)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(column.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function ColumnManager({ boardId }: ColumnManagerProps) {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', color: '#374151', wip_limit: '' });

  const { data: columns, isLoading } = useKanbanColumns(boardId);
  const [localColumns, setLocalColumns] = useState<any[]>([]);

  // Sync local state with fetched columns
  useEffect(() => {
    if (columns) setLocalColumns([...columns].sort((a, b) => a.position - b.position));
  }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const createMutation = useMutation({
    mutationFn: (params: any) => kanbanAdminApi.createColumn({ board_id: boardId, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'columns'] });
      toast({ title: 'Column created successfully' });
      setIsCreateOpen(false);
      setFormData({ name: '', color: '#374151', wip_limit: '' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create column', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...params }: any) => kanbanAdminApi.updateColumn(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'columns'] });
      toast({ title: 'Column updated successfully' });
      setEditingColumn(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => kanbanAdminApi.deleteColumn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'columns'] });
      toast({ title: 'Column deleted successfully' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (updates: { id: string; position: number }[]) => kanbanAdminApi.reorderColumns(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-tv', 'columns'] });
      toast({ title: 'Columns reordered' });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sortedColumns = [...(columns || [])].sort((a, b) => a.position - b.position);
    const oldIndex = sortedColumns.findIndex((col) => col.id === active.id);
    const newIndex = sortedColumns.findIndex((col) => col.id === over.id);

    const reordered = arrayMove(sortedColumns, oldIndex, newIndex);
    const updates = reordered.map((col, idx) => ({ id: col.id, position: idx }));

    setLocalColumns(reordered);
    reorderMutation.mutate(updates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextPosition = columns ? Math.max(...columns.map(c => c.position)) + 1 : 0;
    const wipLimit = formData.wip_limit ? parseInt(formData.wip_limit) : null;

    if (editingColumn) {
      updateMutation.mutate({
        id: editingColumn.id,
        name: formData.name,
        color: formData.color,
        wip_limit: wipLimit,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        color: formData.color,
        wip_limit: wipLimit,
        position: nextPosition,
      });
    }
  };

  if (isLoading) return <div>Loading columns...</div>;

  const sortedColumns = [...(columns || [])].sort((a, b) => a.position - b.position);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Columns</CardTitle>
            <CardDescription>Manage board columns and their order</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setFormData({ name: '', color: '#374151', wip_limit: '' }); setEditingColumn(null); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Column
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingColumn ? 'Edit Column' : 'Create Column'}</DialogTitle>
                  <DialogDescription>Configure column settings</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Column Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="In Progress"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wip_limit">WIP Limit (optional)</Label>
                    <Input
                      id="wip_limit"
                      type="number"
                      value={formData.wip_limit}
                      onChange={(e) => setFormData({ ...formData, wip_limit: e.target.value })}
                      placeholder="Leave empty for no limit"
                      min="1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingColumn ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedColumns.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sortedColumns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  onEdit={(col: any) => {
                    setEditingColumn(col);
                    setFormData({ name: col.name, color: col.color, wip_limit: col.wip_limit?.toString() || '' });
                    setIsCreateOpen(true);
                  }}
                  onDelete={(id: string) => {
                    if (confirm('Delete this column? All cards in it will be removed.')) {
                      deleteMutation.mutate(id);
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
