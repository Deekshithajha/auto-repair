/**
 * Kanban toolbar with filters and controls
 */
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, X, RefreshCw } from "lucide-react";
import type { KanbanFilters, Priority } from "../types/kanban.types";

interface KanbanToolbarProps {
  filters: KanbanFilters;
  onFiltersChange: (filters: KanbanFilters) => void;
  onResetFilters: () => void;
  compactMode: boolean;
  onCompactModeChange: (compact: boolean) => void;
  totalCards: number;
  employees?: Array<{ id: string; name: string }>;
}

export const KanbanToolbar: React.FC<KanbanToolbarProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  compactMode,
  onCompactModeChange,
  totalCards,
  employees = [],
}) => {
  const hasActiveFilters =
    filters.mechanic_id ||
    filters.priority?.length ||
    filters.vehicle_make ||
    filters.search ||
    filters.date_from ||
    filters.date_to;

  const priorityOptions: Priority[] = ["low", "normal", "high", "urgent"];

  const updateFilter = (key: keyof KanbanFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const togglePriority = (priority: Priority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    updateFilter("priority", updated.length > 0 ? updated : undefined);
  };

  const handleQuickDatePreset = (preset: "today" | "week" | "month") => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let from: string | undefined;

    if (preset === "today") {
      from = today.toISOString().split("T")[0];
    } else if (preset === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      from = weekAgo.toISOString().split("T")[0];
    } else if (preset === "month") {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      from = monthAgo.toISOString().split("T")[0];
    }

    onFiltersChange({
      ...filters,
      date_from: from,
      date_to: undefined,
    });
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket, vehicle, mechanic..."
            value={filters.search || ""}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <Button
            variant={compactMode ? "default" : "outline"}
            size="sm"
            onClick={() => onCompactModeChange(!compactMode)}
          >
            {compactMode ? "Comfortable" : "Compact"}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Mechanic filter */}
        <div className="space-y-2 min-w-[180px]">
          <Label htmlFor="mechanic-filter" className="text-xs">
            Mechanic
          </Label>
          <Select
            value={filters.mechanic_id || ""}
            onValueChange={(value) =>
              updateFilter("mechanic_id", value || undefined)
            }
          >
            <SelectTrigger id="mechanic-filter" className="h-9">
              <SelectValue placeholder="All mechanics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All mechanics</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div className="space-y-2">
          <Label className="text-xs">Priority</Label>
          <div className="flex gap-2">
            {priorityOptions.map((priority) => {
              const isSelected = filters.priority?.includes(priority);
              return (
                <Button
                  key={priority}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => togglePriority(priority)}
                >
                  {priority}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Vehicle make */}
        <div className="space-y-2 min-w-[150px]">
          <Label htmlFor="make-filter" className="text-xs">
            Vehicle Make
          </Label>
          <Input
            id="make-filter"
            placeholder="e.g., Toyota"
            value={filters.vehicle_make || ""}
            onChange={(e) => updateFilter("vehicle_make", e.target.value || undefined)}
            className="h-9"
          />
        </div>

        {/* Date presets */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Presets</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickDatePreset("today")}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickDatePreset("week")}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleQuickDatePreset("month")}
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.mechanic_id && (
              <Badge variant="secondary" className="text-xs">
                Mechanic: {employees.find((e) => e.id === filters.mechanic_id)?.name || filters.mechanic_id}
                <button
                  onClick={() => updateFilter("mechanic_id", undefined)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.priority && filters.priority.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Priority: {filters.priority.join(", ")}
                <button
                  onClick={() => updateFilter("priority", undefined)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.vehicle_make && (
              <Badge variant="secondary" className="text-xs">
                Make: {filters.vehicle_make}
                <button
                  onClick={() => updateFilter("vehicle_make", undefined)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="secondary" className="text-xs">
                Search: {filters.search}
                <button
                  onClick={() => updateFilter("search", undefined)}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total: {totalCards} work orders</span>
        <Button variant="ghost" size="sm" asChild>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

