import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { KanbanBoard } from '@/features/kanban';

export const LiveMonitor: React.FC = () => {
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Fetch employees for the toolbar filter
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select(`
            id,
            profiles:user_id(id, name)
          `)
          .eq('employment_status', 'active');

        if (error) throw error;

        const empList = (data || [])
          .map((emp: any) => {
            const profile = Array.isArray(emp.profiles) ? emp.profiles[0] : emp.profiles;
            return profile ? { id: profile.id, name: profile.name || 'Unknown' } : null;
          })
          .filter(Boolean) as Array<{ id: string; name: string }>;

        setEmployees(empList);
      } catch (error: any) {
        console.error('Error fetching employees:', error);
        // Fallback to dummy employees in error case
        setEmployees([
          { id: '66666666-6666-6666-6666-666666666666', name: 'Alex Rodriguez' },
          { id: '77777777-7777-7777-7777-777777777777', name: 'Lisa Chen' },
          { id: '88888888-8888-8888-8888-888888888888', name: 'Tom Wilson' },
          { id: '99999999-9999-9999-9999-999999999999', name: 'Maria Garcia' },
        ]);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Work Order Kanban Board</h2>
        <p className="text-muted-foreground">Drag and drop work orders across statuses. Updates in real-time.</p>
      </div>
      <KanbanBoard employees={employees} />
    </div>
  );
};
