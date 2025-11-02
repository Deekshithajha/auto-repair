/**
 * Loading skeleton for Kanban board
 */
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const KanbanSkeleton: React.FC = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex flex-col h-full min-w-[280px] max-w-[320px]">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="flex-1 p-2 space-y-2">
              {[1, 2, 3].map((card) => (
                <Card key={card} className="p-3">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

