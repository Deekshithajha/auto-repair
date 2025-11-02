/**
 * Adapter layer for Kanban - supports both dummy and live data
 */
import { supabase } from "@/integrations/supabase/client";
import type {
  WorkOrderCard,
  KanbanFilters,
  MoveWorkOrderParams,
  WorkOrderStatus,
} from "../types/kanban.types";

// Feature flag - toggle between dummy and live
const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === "true" || false;

// In-memory store for dummy mode
let dummyStore: WorkOrderCard[] = [];

// Initialize dummy store with sample data
function initDummyStore() {
  if (dummyStore.length > 0) return;

  dummyStore = [
    {
      id: "tkt-11111111-1111-1111-1111-111111111111",
      ticket_id: "WO-001",
      vehicle_plate: "ABC-1234",
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2020,
      priority: "high",
      assigned_mechanic_id: "66666666-6666-6666-6666-666666666666",
      assigned_mechanic_name: "Alex Rodriguez",
      status: "in_progress",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T08:00:00Z",
      started_at: "2024-01-15T11:00:00Z",
      est_complete_at: "2024-01-18T16:00:00Z",
      description: "Engine making strange noise, needs diagnostic check",
      notes_count: 2,
      attachments_count: 1,
    },
    {
      id: "tkt-22222222-2222-2222-2222-222222222222",
      ticket_id: "WO-002",
      vehicle_plate: "XYZ-5678",
      vehicle_make: "Honda",
      vehicle_model: "Civic",
      vehicle_year: 2019,
      priority: "normal",
      assigned_mechanic_id: "77777777-7777-7777-7777-777777777777",
      assigned_mechanic_name: "Lisa Chen",
      status: "completed",
      created_at: "2024-01-12T09:15:00Z",
      updated_at: "2024-01-15T15:30:00Z",
      started_at: "2024-01-13T09:00:00Z",
      description: "AC not blowing cold air properly",
      notes_count: 1,
      attachments_count: 0,
    },
    {
      id: "tkt-33333333-3333-3333-3333-333333333333",
      ticket_id: "WO-003",
      vehicle_plate: "DEF-9012",
      vehicle_make: "Ford",
      vehicle_model: "Focus",
      vehicle_year: 2021,
      priority: "low",
      status: "pending",
      created_at: "2024-01-14T14:20:00Z",
      updated_at: "2024-01-14T14:20:00Z",
      description: "Brake squeaking and oil change needed",
      notes_count: 0,
      attachments_count: 0,
    },
    {
      id: "tkt-44444444-4444-4444-4444-444444444444",
      ticket_id: "WO-004",
      vehicle_plate: "GHI-3456",
      vehicle_make: "BMW",
      vehicle_model: "X5",
      vehicle_year: 2022,
      priority: "urgent",
      status: "approved",
      created_at: "2024-01-16T11:45:00Z",
      updated_at: "2024-01-16T12:00:00Z",
      description: "Transmission issues - car jerks when shifting gears",
      notes_count: 3,
      attachments_count: 2,
    },
    {
      id: "tkt-55555555-5555-5555-5555-555555555555",
      ticket_id: "WO-005",
      vehicle_plate: "JKL-7890",
      vehicle_make: "Mercedes",
      vehicle_model: "C-Class",
      vehicle_year: 2021,
      priority: "high",
      assigned_mechanic_id: "88888888-8888-8888-8888-888888888888",
      assigned_mechanic_name: "Tom Wilson",
      status: "assigned",
      created_at: "2024-01-17T08:30:00Z",
      updated_at: "2024-01-17T09:00:00Z",
      description: "Engine oil leak detected",
      notes_count: 1,
      attachments_count: 1,
    },
    {
      id: "tkt-66666666-6666-6666-6666-666666666666",
      ticket_id: "WO-006",
      vehicle_plate: "MNO-1234",
      vehicle_make: "Toyota",
      vehicle_model: "Prius",
      vehicle_year: 2020,
      priority: "normal",
      status: "ready_for_pickup",
      created_at: "2024-01-10T09:00:00Z",
      updated_at: "2024-01-15T14:00:00Z",
      started_at: "2024-01-10T10:00:00Z",
      description: "Regular maintenance service",
      notes_count: 0,
      attachments_count: 0,
    },
  ];
}

// Simulate network delay
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to transform ticket to WorkOrderCard (for live mode)
function transformTicketToCard(ticket: any): WorkOrderCard {
  const now = Date.now();
  const updatedAt = new Date(ticket.updated_at || ticket.created_at).getTime();
  const statusChangedAt = updatedAt; // Simplified - in production, track status_changed_at

  // Support both old nested structure and new flat structure
  const vehicle = Array.isArray(ticket.vehicles)
    ? ticket.vehicles[0]
    : ticket.vehicles;
  const mechanicProfile =
    ticket.mechanic_profile ||
    ticket.primary_mechanic?.name ||
    ticket.primary_mechanic?.profiles?.name ||
    null;

  return {
    id: ticket.id,
    ticket_id: ticket.ticket_number || ticket.id.slice(-8),
    vehicle_plate: vehicle?.reg_no || vehicle?.license_no || null,
    vehicle_make: vehicle?.make || null,
    vehicle_model: vehicle?.model || null,
    vehicle_year: vehicle?.year || null,
    priority: ticket.priority || "normal",
    assigned_mechanic_id: ticket.primary_mechanic_id || null,
    assigned_mechanic_name: mechanicProfile,
    status: ticket.status,
    created_at: ticket.created_at,
    updated_at: ticket.updated_at || ticket.created_at,
    started_at: ticket.work_started_at || null,
    est_complete_at: ticket.estimated_completion_date || null,
    time_in_status_seconds: Math.floor((now - statusChangedAt) / 1000),
    description: ticket.description || null,
    notes_count: 0, // TODO: join with notes table
    attachments_count: 0, // TODO: join with attachments table
  };
}

// Filter helpers
function matchesFilters(card: WorkOrderCard, filters: KanbanFilters): boolean {
  if (filters.mechanic_id && card.assigned_mechanic_id !== filters.mechanic_id) {
    return false;
  }
  if (
    filters.priority &&
    filters.priority.length > 0 &&
    card.priority &&
    !filters.priority.includes(card.priority)
  ) {
    return false;
  }
  if (filters.vehicle_make && card.vehicle_make !== filters.vehicle_make) {
    return false;
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    const searchableText = [
      card.ticket_id,
      card.vehicle_plate,
      card.vehicle_make,
      card.vehicle_model,
      card.description,
      card.assigned_mechanic_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!searchableText.includes(searchLower)) {
      return false;
    }
  }
  if (filters.date_from) {
    const created = new Date(card.created_at);
    if (created < new Date(filters.date_from)) {
      return false;
    }
  }
  if (filters.date_to) {
    const created = new Date(card.created_at);
    if (created > new Date(filters.date_to)) {
      return false;
    }
  }
  return true;
}

// DUMMY IMPLEMENTATION
async function getWorkOrdersDummy(
  filters?: KanbanFilters
): Promise<WorkOrderCard[]> {
  await delay(200);
  initDummyStore();

  let filtered = [...dummyStore];
  if (filters) {
    filtered = filtered.filter((card) => matchesFilters(card, filters));
  }

  // Simulate random failure (very low probability)
  if (Math.random() < 0.01) {
    throw new Error("Simulated network error");
  }

  return filtered;
}

async function moveWorkOrderDummy(
  params: MoveWorkOrderParams
): Promise<WorkOrderCard> {
  await delay(150);

  initDummyStore();
  const card = dummyStore.find((c) => c.id === params.id);
  if (!card) {
    throw new Error(`Work order ${params.id} not found`);
  }

  const now = new Date().toISOString();
  const updated: WorkOrderCard = {
    ...card,
    status: params.toStatus,
    updated_at: now,
    time_in_status_seconds: 0,
  };

  const index = dummyStore.findIndex((c) => c.id === params.id);
  dummyStore[index] = updated;

  // Simulate random failure (very low probability)
  if (Math.random() < 0.01) {
    throw new Error("Simulated update error");
  }

  return updated;
}

async function patchWorkOrderDummy(
  id: string,
  partial: Partial<WorkOrderCard>
): Promise<WorkOrderCard> {
  await delay(150);

  initDummyStore();
  const card = dummyStore.find((c) => c.id === id);
  if (!card) {
    throw new Error(`Work order ${id} not found`);
  }

  const updated: WorkOrderCard = {
    ...card,
    ...partial,
    updated_at: new Date().toISOString(),
  };

  const index = dummyStore.findIndex((c) => c.id === id);
  dummyStore[index] = updated;

  return updated;
}

function subscribeWorkOrdersDummy(
  onUpsert: (card: WorkOrderCard) => void,
  onDelete: (id: string) => void
): () => void {
  // Simulate realtime updates (optional - for testing)
  const interval = setInterval(() => {
    if (Math.random() < 0.1) {
      // 10% chance of update
      const card = dummyStore[Math.floor(Math.random() * dummyStore.length)];
      if (card) {
        onUpsert({ ...card, updated_at: new Date().toISOString() });
      }
    }
  }, 5000);

  return () => clearInterval(interval);
}

// LIVE IMPLEMENTATION
async function getWorkOrdersLive(
  filters?: KanbanFilters
): Promise<WorkOrderCard[]> {
  // Query tickets first without joins to avoid RLS recursion
  let query = supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters on tickets table only
  if (filters?.mechanic_id) {
    query = query.eq("primary_mechanic_id", filters.mechanic_id);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  const { data: tickets, error } = await query;
  if (error) throw error;

  if (!tickets || tickets.length === 0) {
    return [];
  }

  // Collect vehicle IDs and profile IDs for separate queries
  const vehicleIds = new Set<string>();
  const userIds = new Set<string>();
  const mechanicIds = new Set<string>();

  tickets.forEach((ticket: any) => {
    if (ticket.vehicle_id) vehicleIds.add(ticket.vehicle_id);
    if (ticket.user_id) userIds.add(ticket.user_id);
    if (ticket.primary_mechanic_id) mechanicIds.add(ticket.primary_mechanic_id);
    if (ticket.secondary_mechanic_id) mechanicIds.add(ticket.secondary_mechanic_id);
  });

  // Fetch vehicles separately to avoid RLS recursion
  let vehicles: Record<string, any> = {};
  if (vehicleIds.size > 0) {
    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id, make, model, year, reg_no, license_no")
      .in("id", Array.from(vehicleIds));

    if (!vehiclesError && vehiclesData) {
      vehiclesData.forEach((vehicle: any) => {
        vehicles[vehicle.id] = vehicle;
      });
    }
  }

  // Fetch customer profiles
  let customerProfiles: Record<string, { name: string; phone?: string }> = {};
  if (userIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, phone")
      .in("id", Array.from(userIds));

    if (!profilesError && profiles) {
      profiles.forEach((profile: any) => {
        customerProfiles[profile.id] = {
          name: profile.name,
          phone: profile.phone,
        };
      });
    }
  }

  // Fetch mechanic profiles
  let mechanicProfiles: Record<string, { name: string }> = {};
  if (mechanicIds.size > 0) {
    const { data: mechanics, error: mechanicsError } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", Array.from(mechanicIds));

    if (!mechanicsError && mechanics) {
      mechanics.forEach((mechanic: any) => {
        mechanicProfiles[mechanic.id] = {
          name: mechanic.name,
        };
      });
    }
  }

  // Transform tickets to cards with joined data
  let cards = tickets.map((ticket: any) => {
    const vehicle = ticket.vehicle_id ? vehicles[ticket.vehicle_id] : null;
    const mechanic = ticket.primary_mechanic_id
      ? mechanicProfiles[ticket.primary_mechanic_id]
      : null;

    // Apply vehicle make filter client-side
    if (filters?.vehicle_make && vehicle?.make !== filters.vehicle_make) {
      return null;
    }

    return transformTicketToCard({
      ...ticket,
      vehicles: vehicle,
      mechanic_profile: mechanic?.name || null,
    });
  }).filter(Boolean) as WorkOrderCard[];

  // Client-side filtering for search and priority
  if (filters?.search || filters?.priority) {
    cards = cards.filter((card) => matchesFilters(card, filters!));
  }

  return cards;
}

async function moveWorkOrderLive(
  params: MoveWorkOrderParams
): Promise<WorkOrderCard> {
  const now = new Date().toISOString();
  const update: any = {
    status: params.toStatus,
    updated_at: now,
  };

  // Track when work started
  if (
    params.toStatus === "in_progress" &&
    params.fromStatus !== "in_progress"
  ) {
    update.work_started_at = now;
  }

  // Track when work completed
  if (params.toStatus === "completed") {
    update.work_completed_at = now;
  }

  // Update ticket without joins to avoid RLS recursion
  const { data: ticket, error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) throw error;

  // Fetch vehicle and mechanic separately
  let vehicle: any = null;
  let mechanicName: string | null = null;

  if (ticket.vehicle_id) {
    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("id, make, model, year, reg_no, license_no")
      .eq("id", ticket.vehicle_id)
      .single();

    if (vehicleData) {
      vehicle = vehicleData;
    }
  }

  if (ticket.primary_mechanic_id) {
    const { data: mechanic } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", ticket.primary_mechanic_id)
      .single();

    if (mechanic) {
      mechanicName = mechanic.name;
    }
  }

  return transformTicketToCard({
    ...ticket,
    vehicles: vehicle,
    mechanic_profile: mechanicName,
  });
}

async function patchWorkOrderLive(
  id: string,
  partial: Partial<WorkOrderCard>
): Promise<WorkOrderCard> {
  const update: any = {
    ...partial,
    updated_at: new Date().toISOString(),
  };

  // Map WorkOrderCard fields to ticket fields
  if (partial.assigned_mechanic_id !== undefined) {
    update.primary_mechanic_id = partial.assigned_mechanic_id;
  }

  // Update ticket without joins to avoid RLS recursion
  const { data: ticket, error } = await supabase
    .from("tickets")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  // Fetch vehicle and mechanic separately
  let vehicle: any = null;
  let mechanicName: string | null = null;

  if (ticket.vehicle_id) {
    const { data: vehicleData } = await supabase
      .from("vehicles")
      .select("id, make, model, year, reg_no, license_no")
      .eq("id", ticket.vehicle_id)
      .single();

    if (vehicleData) {
      vehicle = vehicleData;
    }
  }

  if (ticket.primary_mechanic_id) {
    const { data: mechanic } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", ticket.primary_mechanic_id)
      .single();

    if (mechanic) {
      mechanicName = mechanic.name;
    }
  }

  return transformTicketToCard({
    ...ticket,
    vehicles: vehicle,
    mechanic_profile: mechanicName,
  });
}

function subscribeWorkOrdersLive(
  onUpsert: (card: WorkOrderCard) => void,
  onDelete: (id: string) => void
): () => void {
  const channel = supabase
    .channel("kanban-tickets")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tickets",
      },
      async (payload) => {
        if (payload.eventType === "DELETE") {
          onDelete(payload.old.id);
          return;
        }

        // Fetch ticket without joins to avoid RLS recursion
        const { data: ticket, error } = await supabase
          .from("tickets")
          .select("*")
          .eq("id", payload.new.id)
          .single();

        if (!error && ticket) {
          // Fetch vehicle and mechanic separately
          let vehicle: any = null;
          let mechanicName: string | null = null;

          if (ticket.vehicle_id) {
            const { data: vehicleData } = await supabase
              .from("vehicles")
              .select("id, make, model, year, reg_no, license_no")
              .eq("id", ticket.vehicle_id)
              .single();

            if (vehicleData) {
              vehicle = vehicleData;
            }
          }

          if (ticket.primary_mechanic_id) {
            const { data: mechanic } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", ticket.primary_mechanic_id)
              .single();

            if (mechanic) {
              mechanicName = mechanic.name;
            }
          }

          onUpsert(
            transformTicketToCard({
              ...ticket,
              vehicles: vehicle,
              mechanic_profile: mechanicName,
            })
          );
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// EXPORT ADAPTER INTERFACE
export const adapters = {
  async getWorkOrders(filters?: KanbanFilters): Promise<WorkOrderCard[]> {
    return USE_DUMMY_DATA
      ? getWorkOrdersDummy(filters)
      : getWorkOrdersLive(filters);
  },

  async moveWorkOrder(
    params: MoveWorkOrderParams
  ): Promise<WorkOrderCard> {
    return USE_DUMMY_DATA
      ? moveWorkOrderDummy(params)
      : moveWorkOrderLive(params);
  },

  async patchWorkOrder(
    id: string,
    partial: Partial<WorkOrderCard>
  ): Promise<WorkOrderCard> {
    return USE_DUMMY_DATA
      ? patchWorkOrderDummy(id, partial)
      : patchWorkOrderLive(id, partial);
  },

  subscribeWorkOrders(
    onUpsert: (card: WorkOrderCard) => void,
    onDelete: (id: string) => void
  ): () => void {
    return USE_DUMMY_DATA
      ? subscribeWorkOrdersDummy(onUpsert, onDelete)
      : subscribeWorkOrdersLive(onUpsert, onDelete);
  },
};

