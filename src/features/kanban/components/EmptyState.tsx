/**
 * Empty state component for Kanban
 */
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

interface EmptyStateProps {
  hasFilters?: boolean;
  onResetFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasFilters,
  onResetFilters,
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold mb-2">
          {hasFilters ? "No work orders match your filters" : "No work orders"}
        </h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          {hasFilters
            ? "Try adjusting your filters to see more results."
            : "Work orders will appear here once they are created."}
        </p>
        {hasFilters && onResetFilters && (
          <Button variant="outline" onClick={onResetFilters}>
            Reset Filters
          </Button>
        )}
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <HelpCircle className="h-4 w-4" />
          <span>Need help? Check the documentation</span>
        </div>
      </CardContent>
    </Card>
  );
};

