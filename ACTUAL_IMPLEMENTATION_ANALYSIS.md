# Actual Ticket Workflow Implementation Analysis

**Analysis Date:** Based on codebase review  
**Analyst:** Senior Engineer Code Review  
**Scope:** Complete ticket creation workflow as implemented in code

---

## 1. CUSTOMER TICKET CREATION

### Route
- **File:** `src/App.tsx` (line 58)
- **Route:** `/customer/tickets/new`
- **Component:** `NewTicketFlow` (`src/pages/customer/tickets/new/NewTicketFlow.tsx`)

### UI Steps/Screens

**4-Step Multi-Step Form:**

1. **Step 1: Customer Info** (`CustomerInfoStep.tsx`)
   - **File:** `src/pages/customer/tickets/new/CustomerInfoStep.tsx`
   - **Data Collected:**
     - Full Name (required)
     - Email Address (required)
     - Phone Number (required)
     - Full Address (required, textarea)
     - Notification Preference (radio: 'text' | 'call' | 'email')
   - **UI:** Pre-filled with dummy data ('Sarah Johnson', etc.)
   - **Validation:** All fields required

2. **Step 2: Vehicle Selection** (`VehicleStep.tsx`)
   - **File:** `src/pages/customer/tickets/new/VehicleStep.tsx`
   - **Modes:**
     - **Select Existing:** Shows customer's vehicles from `vehicles` data filtered by `customerId: 'c1'`
     - **Add New Vehicle:**
       - License Plate * (required)
       - Make * (required)
       - Model * (required)
       - Year * (required, number input)
       - Exterior Photos (optional, up to 4, stored as base64 strings in `photos` state)
       - VIN Sticker Photo (optional, single photo, stored in `vinPhoto` state)
       - Damage Description (optional, textarea)
       - Damage Photos (optional, up to 3, stored in `damagePhotos` state)
   - **Photo Handling:** Uses native FileReader API, converts to base64 data URLs
   - **Mobile:** `capture="environment"` attribute on file inputs

3. **Step 3: Service Selection** (`ServiceSelectionStep.tsx`)
   - **File:** `src/pages/customer/tickets/new/ServiceSelectionStep.tsx`
   - **Data Collected:**
     - **Standard Services:** From `services` data (category: 'standard')
       - Can expand to see sub-options
       - Checkbox selection
       - Optional symptoms textarea per service
       - Optional photos per service (up to 5, max 5MB each, stored as base64)
     - **Custom Services:** From `services` data (category: 'custom')
       - Checkbox selection
       - Optional description textarea
       - Optional photos (up to 5)
     - **"Service Not Listed" Option:**
       - Checkbox to enable
       - Description textarea (required if enabled)
       - Optional photos (up to 5)
       - Creates `SelectedService` with `id: 'custom-service'`
   - **Service Data Structure:**
     ```typescript
     interface SelectedService {
       id: string;
       name: string;
       price?: number;
       subOptionId?: string;
       subOptionName?: string;
       symptoms?: string;
       photos?: string[]; // base64 URLs
     }
     ```
   - **Validation:** At least one service must be selected; if custom service enabled, description required

4. **Step 4: Review & Submit** (`ReviewStep.tsx`)
   - **File:** `src/pages/customer/tickets/new/ReviewStep.tsx`
   - **Data Collected:**
     - **Car Status:** Radio button ('in-shop' | 'not-in-shop')
     - **Drop-off Date:** Date input (required if carStatus === 'not-in-shop')
     - **Preferred Pickup Time:** Time input (required)
   - **Displays:**
     - Customer info summary
     - Vehicle summary
     - Selected services with photos
     - Total price calculation (sum of service prices)
   - **Submit Action:**
     - Generates ticket number: `TKT-${Date.now().toString().slice(-6)}`
     - **Does NOT create Ticket object** - only navigates to success page
     - Navigates to `/customer/tickets/submitted` with state containing ticketNumber and formData
     - **Status Assignment:** **NONE** - No ticket is actually created in the code

### Ticket Status on Submit
- **ACTUAL:** No ticket is created. The flow only:
  1. Generates a ticket number string
  2. Navigates to success page (`TicketSubmitted.tsx`)
  3. Displays confirmation message
- **Expected (per spec):** Should create Ticket with status `'pending-admin-review'`
- **Gap:** No API call or state management to persist ticket

### Form Data Structure
```typescript
interface TicketFormData {
  customerInfo: CustomerInfo;
  selectedVehicle: Vehicle | null;
  selectedServices: SelectedService[];
  pickupTime: string;
  carStatus: 'in-shop' | 'not-in-shop';
  dropOffDate: string;
}
```

---

## 2. EMPLOYEE TICKET CREATION

### Route
- **File:** `src/App.tsx` (line 74)
- **Route:** `/employee/tickets/new`
- **Component:** `EmployeeNewTicket` (`src/pages/employee/tickets/EmployeeNewTicket.tsx`)

### UI Steps/Screens

**5-Step Multi-Step Form:**

1. **Step 1: Customer Lookup** (`currentStep === 'customer-lookup'`)
   - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 215-290)
   - **Search Functionality:**
     - Real-time search as user types
     - Searches across: `customer.firstName`, `customer.lastName`, `customer.email`, `customer.phone`, and vehicle plates (via `vehicles` array)
     - Filtered results displayed as clickable cards
   - **Create New Customer:**
     - Button toggles `isCreatingCustomer` state
     - Form fields:
       - First Name * (required)
       - Last Name * (required)
       - Email * (required)
       - Phone * (required)
       - Phone 2 (optional)
       - Address (optional)
       - City (optional)
       - State (optional, 2 chars max)
       - Preferred Notification Method (radio: 'text' | 'call' | 'email')
     - Creates Customer object in-memory (not persisted)
     - Customer ID generated: `c${Date.now()}`

2. **Step 2: Vehicle Selection** (`currentStep === 'vehicle-selection'`)
   - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 292-450)
   - **Select Existing:**
     - Shows vehicles filtered by `selectedCustomer.id`
     - Click to select
   - **Add New Vehicle:**
     - License Plate * (required)
     - Make * (required)
     - Model * (required)
     - Year * (required, number, defaults to current year)
     - Color (optional)
     - VIN (optional, max 17 chars, uppercase)
     - **Vehicle Photos:** Uses `PhotoUpload` component
       - Max 10 photos
       - Categorized photos (8 categories)
       - Photos stored in `vehiclePhotos` state array
   - Vehicle ID generated: `v${Date.now()}`
   - Photos mapped to `VehiclePhoto[]` format with `uploadedBy: 'e1'`

3. **Step 3: Issue Description** (`currentStep === 'issue-description'`)
   - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 452-520)
   - **Data Collected:**
     - **Symptoms/Concerns:** Textarea (required) - "Customer's Symptoms / Concerns"
     - **Additional Notes:** Textarea (optional) - "Additional Notes / Observations"
     - **Issue Photos:** Uses `PhotoUpload` component
       - Max 10 photos
       - Categorized photos
       - Stored in `issuePhotos` state

4. **Step 4: Service Selection** (`currentStep === 'service-selection'`)
   - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 522-600)
   - **Optional:** Can skip (no validation requiring services)
   - **UI:** Checkbox list of services from `services` data
   - **Selection:** Multiple services can be selected
   - **No per-service details:** Unlike customer flow, no symptoms or photos per service

5. **Step 5: Review** (`currentStep === 'review'`)
   - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 602-700)
   - **Displays:**
     - Customer info
     - Vehicle info
     - Issue description
     - Selected services (if any)
     - Photos attached
   - **Submit Action:**
     - **File:** `src/pages/employee/tickets/EmployeeNewTicket.tsx` (lines 122-141)
     - Generates ticket ID: `t${Date.now()}`
     - **Console.log only** - logs ticket object to console:
       ```typescript
       {
         id: ticketId,
         customerId: selectedCustomer!.id,
         vehicleId: selectedVehicle!.id,
         status: 'pending-admin-review',
         symptoms,
         description: additionalNotes,
         services: selectedServices,
         createdBy: 'e1',
         createdByType: 'employee',
         photos: issuePhotos,
         createdAt: new Date().toISOString(),
       }
       ```
     - Navigates to `/employee` dashboard
     - **Status Assignment:** Logs `'pending-admin-review'` but **does NOT create actual ticket**

### Ticket Status on Submit
- **ACTUAL:** Console.log only - no ticket creation
- **Expected:** Should create Ticket with status `'pending-admin-review'`
- **Gap:** No persistence mechanism

---

## 3. PHOTO UPLOADS

### Component
- **File:** `src/components/ui/PhotoUpload.tsx`
- **Exported:** `PhotoUpload`

### Features Implemented

**Photo Categories (8 types):**
```typescript
type PhotoCategory = 
  | 'damage' 
  | 'dashboard-warning' 
  | 'vin-sticker' 
  | 'engine-bay' 
  | 'tires' 
  | 'interior' 
  | 'exterior'
  | 'other';
```

**Component Props:**
```typescript
interface PhotoUploadProps {
  photos: Array<{
    id: string;
    file?: File;
    url: string; // base64 data URL
    category: PhotoCategory;
    description?: string;
  }>;
  onPhotosChange: (photos: Array<...>) => void;
  maxPhotos?: number; // default 10
  allowMultiple?: boolean; // default true
}
```

**Compression:**
- **File:** `src/components/ui/PhotoUpload.tsx` (lines 44-84)
- **Algorithm:** Canvas-based compression
- **Max Dimensions:** 1200x1200px
- **Quality:** 80% JPEG
- **Output:** Base64 data URL string

**Mobile Support:**
- `capture="environment"` attribute on file input
- Touch-friendly UI

**Photo Management:**
- Upload multiple photos
- Click photo to edit (modal opens)
- Change category per photo
- Add description per photo
- Remove photos
- Grid display (2 cols mobile, 3 cols desktop)

### Where Photos Are Used

**Customer Flow:**
- **VehicleStep.tsx:** 
  - Exterior photos (up to 4, stored as `string[]` in `photos` state)
  - VIN photo (single, stored as `string | null` in `vinPhoto` state)
  - Damage photos (up to 3, stored as `string[]` in `damagePhotos` state)
  - **Note:** NOT using `PhotoUpload` component - uses native file inputs
- **ServiceSelectionStep.tsx:**
  - Per-service photos (up to 5 per service, stored as `string[]` in `servicePhotos` state object)
  - **Note:** NOT using `PhotoUpload` component - uses native file inputs

**Employee Flow:**
- **EmployeeNewTicket.tsx:**
  - Vehicle photos: Uses `PhotoUpload` component (categorized)
  - Issue photos: Uses `PhotoUpload` component (categorized)

**Reschedule Flow:**
- **RescheduleRequest.tsx:**
  - Supporting photos: Uses `PhotoUpload` component (categorized)

### Photo Attachment to Ticket/Vehicle

**Customer Flow:**
- Vehicle photos stored in component state, NOT attached to Vehicle object
- Service photos stored in `SelectedService.photos` array (base64 strings)
- **Gap:** Photos not persisted or attached to ticket/vehicle objects

**Employee Flow:**
- Vehicle photos: Mapped to `VehiclePhoto[]` format when creating vehicle:
  ```typescript
  photos: vehiclePhotos.map((photo) => ({
    id: photo.id,
    url: photo.url,
    category: photo.category,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'e1',
    description: photo.description,
  }))
  ```
- Issue photos: Stored in `issuePhotos` state, logged in console but not attached to ticket

**Type Definitions:**
- `TicketPhoto` interface exists in `src/types/index.ts` (lines 73-80)
- `VehiclePhoto` interface exists in `src/types/index.ts` (lines 27-34)
- `Ticket.photos?: TicketPhoto[]` field exists
- `Vehicle.photos?: VehiclePhoto[]` field exists

---

## 4. RESCHEDULE / RETURN-VISIT

### Implementation Files

**Mechanic Request Component:**
- **File:** `src/components/tickets/RescheduleRequest.tsx`
- **Used In:** `src/pages/employee/EmployeeWorkOrderDetail.tsx` (line 189)

**Admin Management Component:**
- **File:** `src/components/tickets/RescheduleManagement.tsx`
- **Used In:** `src/pages/admin/AdminTicketInbox.tsx` (line 7, line 338)

### Ticket Type Fields for Reschedule

**File:** `src/types/index.ts` (lines 82-90, 112)

```typescript
interface RescheduleInfo {
  requestedBy: string;        // employeeId
  requestedAt: string;        // ISO timestamp
  reason: string;             // required
  scheduledDate?: string;     // optional, set by admin
  scheduledTime?: string;     // optional, set by admin
  notes?: string;             // optional, admin notes for customer
  photos?: TicketPhoto[];     // optional, supporting evidence
}

interface Ticket {
  // ... other fields
  rescheduleInfo?: RescheduleInfo;  // optional field
}
```

**Note:** No `rescheduleRequired` boolean flag - uses `rescheduleInfo` existence and `status` instead.

### Who Can Trigger Reschedule

**Mechanic (Employee):**
- **File:** `src/pages/employee/EmployeeWorkOrderDetail.tsx` (lines 163-177)
- **Condition:** Only visible when `ticket.status === 'in-progress'`
- **Action:** "Request Return Visit" button opens `RescheduleRequest` modal
- **What It Does:**
  - Collects reason (required textarea)
  - Collects additional notes (optional textarea)
  - Collects supporting photos (optional, via `PhotoUpload` component)
  - **On Submit:** Calls `onSubmit` callback which:
     - Logs to console: `'Reschedule request submitted:'` with data
     - Comment says: "In real app: API call to update ticket"
     - Comment says: "Update ticket status to 'return-visit-required'"
     - **ACTUAL:** Only closes modal, no status update

**Admin:**
- **File:** `src/pages/admin/AdminTicketInbox.tsx` (lines 200-210)
- **Condition:** Button visible when `ticket.status === 'return-visit-required' && !ticket.rescheduleInfo?.scheduledDate`
- **Action:** "Set Return Date" button opens `RescheduleManagement` modal
- **What It Does:**
  - Displays mechanic's reschedule request (reason, notes, photos)
  - Collects scheduled date (required date input)
  - Collects time window (radio: 'Morning (8AM-12PM)' | 'Afternoon (12PM-5PM)' or custom time input)
  - Collects instructions for customer (optional textarea)
  - Shows notification preview
  - **On Submit:** Calls `handleSetReschedule` which:
     - Logs to console: `'Setting reschedule for ticket'` with data
     - Comment says: "In real app: API call to update ticket"
     - Comment says: "Update ticket status to 'rescheduled-awaiting-vehicle'"
     - Comment says: "Send notification to customer"
     - **ACTUAL:** Only closes modal, no status update

### Status Changes

**Mechanic Request:**
- **Expected:** `'in-progress'` → `'return-visit-required'`
- **ACTUAL:** No status change - only console.log

**Admin Sets Date:**
- **Expected:** `'return-visit-required'` → `'rescheduled-awaiting-vehicle'`
- **ACTUAL:** No status change - only console.log

### Same Ticket ID Maintained?

- **Code Evidence:** Yes, the reschedule flow works on existing ticket objects
- **RescheduleRequest:** Takes `ticketId` as prop, operates on same ticket
- **RescheduleManagement:** Takes `ticketId` and `rescheduleInfo` as props, updates same ticket
- **No New Ticket Creation:** No code creates duplicate tickets
- **Gap:** Since no actual persistence exists, this is theoretical - but the code structure maintains same ID

---

## 5. ADMIN TICKET INBOX

### Route
- **File:** `src/App.tsx` (line 84)
- **Route:** `/admin/tickets/inbox`
- **Component:** `AdminTicketInbox` (`src/pages/admin/AdminTicketInbox.tsx`)

### Filters/Statuses Supported

**File:** `src/pages/admin/AdminTicketInbox.tsx` (lines 22-30)

```typescript
const statusFilters = [
  'all',
  'pending-admin-review',
  'assigned',
  'in-progress',
  'return-visit-required',
  'rescheduled-awaiting-vehicle',
  'work-completed',
];
```

**Filtering Logic:**
- **File:** `src/pages/admin/AdminTicketInbox.tsx` (lines 32-35)
- Filters `tickets` array from `src/data/tickets.ts`
- If filter === 'all', shows all tickets
- Otherwise filters by `ticket.status === statusFilter`

### Admin Actions

**1. Assign Mechanic:**
- **File:** `src/pages/admin/AdminTicketInbox.tsx` (lines 37-47, 200-240)
- **Condition:** Button visible when `ticket.status === 'pending-admin-review'`
- **UI:** Modal with dropdown of mechanics (filtered from `employees` where `role === 'mechanic'`)
- **Action:** `handleAssignMechanic` function:
  - Logs to console: `'Assigning ticket'` with ticket ID and mechanic ID
  - Comment says: "In real app: API call to assign ticket"
  - Comment says: "Update ticket status to 'assigned'"
  - **ACTUAL:** Only closes modal, no assignment or status update

**2. Set Reschedule Date:**
- **File:** `src/pages/admin/AdminTicketInbox.tsx` (lines 49-63, 200-210)
- **Condition:** Button visible when `ticket.status === 'return-visit-required' && !ticket.rescheduleInfo?.scheduledDate`
- **UI:** Opens `RescheduleManagement` modal
- **Action:** See "Reschedule / Return-Visit" section above

**3. View Details:**
- **File:** `src/pages/admin/AdminTicketInbox.tsx` (line 220)
- **Action:** Navigates to `/admin/tickets/:id` (uses `CustomerTicketDetail` component)

### Displayed Information

**Per Ticket Card:**
- Ticket ID (uppercase)
- Status badge
- "Needs Reschedule" badge (if status === 'return-visit-required')
- Created date
- Customer info (name, email, phone)
- Vehicle info (year/make/model, plate)
- Issue description
- Selected services (if any)
- Assigned mechanic (if any)
- Reschedule info (if exists, shows reason and scheduled date)

---

## 6. TICKET STATUSES (ACTUAL USAGE)

### Defined Statuses

**File:** `src/types/index.ts` (lines 1-12)

```typescript
export type TicketStatus = 
  | 'pending-admin-review' 
  | 'open' 
  | 'assigned' 
  | 'in-progress' 
  | 'return-visit-required'
  | 'rescheduled-awaiting-vehicle'
  | 'work-completed'
  | 'invoice-generated'
  | 'completed' 
  | 'waiting-pickup'
  | 'closed-paid';
```

**Total: 11 statuses**

### Status Usage in Code

**Customer Flow:**
- **None** - No ticket created, no status assigned

**Employee Flow:**
- **Logged:** `'pending-admin-review'` (line 129 of EmployeeNewTicket.tsx)
- **Not Applied:** Only in console.log, not on actual ticket

**Admin Inbox:**
- **Filtered By:** All 11 statuses can be filtered
- **Displayed:** Status badge shown for each ticket
- **Actions Based On:**
  - `'pending-admin-review'` → Shows "Assign to Mechanic" button
  - `'return-visit-required'` → Shows "Set Return Date" button and "🔄 Needs Reschedule" badge

**Employee Work Order Detail:**
- **Actions Based On:**
  - `'open'` → Shows "Start Working" button
  - `'in-progress'` → Shows "Mark as Completed" and "Request Return Visit" buttons
  - `'completed'` → Shows "Create Follow-up Quote" button

---

## 7. ROUTING & NAVIGATION

### Customer Routes
- `/customer/tickets/new` → `NewTicketFlow`
- `/customer/tickets/submitted` → `TicketSubmitted` (success page)
- `/customer/tickets` → `CustomerTickets` (list view)
- `/customer/tickets/:id` → `CustomerTicketDetail`

### Employee Routes
- `/employee/tickets/new` → `EmployeeNewTicket`
- `/employee/work-orders` → `EmployeeWorkOrders` (list)
- `/employee/work-orders/:id` → `EmployeeWorkOrderDetail` (with reschedule button)

### Admin Routes
- `/admin/tickets/inbox` → `AdminTicketInbox`
- `/admin/tickets` → `AdminTickets` (general tickets view)
- `/admin/tickets/:id` → `CustomerTicketDetail` (reused component)

### Access Points

**Customer:**
- "Raise Ticket" button on `CustomerDashboard` → `/customer/tickets/new`

**Employee:**
- "New Ticket" button in `EmployeeDashboard` top bar → `/employee/tickets/new`
- Work order detail page → Reschedule button

**Admin:**
- "View All" link in `AdminDashboard` "Ticket Inbox" section → `/admin/tickets/inbox`

---

## 8. DATA PERSISTENCE

### Current State
- **NO PERSISTENCE:** All ticket creation flows use `console.log` only
- **NO API CALLS:** Comments indicate "In real app: API call" but no actual calls
- **NO STATE MANAGEMENT:** No Redux, Context, or global state for tickets
- **DATA SOURCE:** Tickets read from `src/data/tickets.ts` (static JSON)

### What Gets Created (In-Memory Only)

**Customer Flow:**
- Generates ticket number string
- Stores form data in React state
- Passes data via navigation state to success page
- **No Ticket object created**

**Employee Flow:**
- Creates Customer object in-memory (if new customer)
- Creates Vehicle object in-memory (if new vehicle)
- Logs Ticket object to console
- **No persistence**

---

## 9. GAPS & DIFFERENCES FROM SPEC

### Major Gaps

1. **No Ticket Creation:**
   - Customer flow: No ticket object created
   - Employee flow: Only console.log, no persistence
   - **Impact:** Tickets never actually enter system

2. **No Status Updates:**
   - Reschedule requests: No status change
   - Admin assignment: No status change
   - Admin reschedule: No status change
   - **Impact:** Workflow cannot progress

3. **Photo Storage:**
   - Customer flow: Photos stored as base64 in component state, not attached to ticket
   - Employee flow: Photos logged but not persisted
   - **Impact:** Photos lost on page refresh

4. **No Backend Integration:**
   - All "API calls" are commented placeholders
   - No actual HTTP requests
   - **Impact:** Cannot persist any data

### Implementation vs. Spec

**Matches Spec:**
- ✅ Multi-step form structure
- ✅ Photo upload with categories
- ✅ Image compression
- ✅ Customer lookup/search
- ✅ Vehicle selection/creation
- ✅ Service selection
- ✅ Reschedule UI components
- ✅ Status type definitions
- ✅ TypeScript interfaces

**Does NOT Match Spec:**
- ❌ No actual ticket creation
- ❌ No status assignment on submit
- ❌ No status updates on actions
- ❌ No data persistence
- ❌ Customer flow doesn't use `PhotoUpload` component (uses native inputs)
- ❌ No notification system (even simulated)

---

## 10. FILE STRUCTURE SUMMARY

### Customer Ticket Flow
```
src/pages/customer/tickets/new/
  ├── NewTicketFlow.tsx          (main orchestrator, 4 steps)
  ├── CustomerInfoStep.tsx       (step 1)
  ├── VehicleStep.tsx            (step 2, native photo inputs)
  ├── ServiceSelectionStep.tsx   (step 3, native photo inputs)
  └── ReviewStep.tsx             (step 4, submit → success page)
```

### Employee Ticket Flow
```
src/pages/employee/tickets/
  └── EmployeeNewTicket.tsx      (5-step flow, uses PhotoUpload component)
```

### Reschedule Components
```
src/components/tickets/
  ├── RescheduleRequest.tsx      (mechanic request modal)
  └── RescheduleManagement.tsx   (admin set date modal)
```

### Photo Upload
```
src/components/ui/
  └── PhotoUpload.tsx            (reusable component with compression)
```

### Admin
```
src/pages/admin/
  └── AdminTicketInbox.tsx       (inbox with filters and actions)
```

### Types
```
src/types/
  └── index.ts                   (all TypeScript interfaces)
```

---

## CONCLUSION

**What's Implemented:**
- Complete UI flows for customer and employee ticket creation
- Photo upload component with compression and categories
- Reschedule request and management UI
- Admin ticket inbox with filtering
- Comprehensive TypeScript type definitions
- Multi-step form navigation with progress indicators

**What's Missing:**
- Actual ticket creation/persistence
- Status updates on actions
- Backend API integration
- Data persistence mechanism
- Notification system (even simulated)

**Code Quality:**
- Well-structured components
- Type-safe TypeScript
- Reusable components
- Mobile-responsive design
- Good separation of concerns

**Status:** **UI-Complete, Backend-Pending** - All user interfaces are implemented, but no data persistence or state management exists. The application is a frontend prototype only.

