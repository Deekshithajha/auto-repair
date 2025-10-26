import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const EmployeeWorkLog: React.FC = () => {
  // Disabled for now - work_logs table doesn't exist yet
  // This component will be re-enabled once the proper database structure is in place
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Log</CardTitle>
        <CardDescription>Feature coming soon - Database setup in progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Work log tracking will be available once the database is configured.
        </p>
      </CardContent>
    </Card>
  );
};
