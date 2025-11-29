# 🚀 Quick Start Guide - Ticket Creation Workflow

## Demo Credentials

```
Customer:  customer@demo.com  / demo123
Employee:  employee@demo.com  / demo123
Admin:     admin@demo.com     / demo123
```

## 🎯 Test the Complete Workflow

### 1. Customer Creates Ticket
1. Go to `http://localhost:3000/mobile-login`
2. Click "🚗 Customer Dashboard" (or login with customer@demo.com)
3. Click "Raise Ticket" button on dashboard
4. **Step 1:** Confirm customer info → Click "Continue"
5. **Step 2:** Select a vehicle or add new → Click "Continue"
6. **Step 3:** Select services (try "Service Not Listed" option) → Click "Continue"
7. **Step 4:** Review and set pickup preferences → Click "Submit Ticket"
8. ✅ Ticket created with status: `pending-admin-review`

### 2. Employee Creates Ticket (Walk-in)
1. Go to `http://localhost:3000/mobile-login`
2. Click "🔧 Employee Dashboard" (or login with employee@demo.com)
3. Click "New Ticket" button in top bar
4. **Step 1:** Search for customer (try "Sarah") or create new → Select customer
5. **Step 2:** Select vehicle or add new with photos → Click "Add Vehicle"
6. **Step 3:** Document issue with symptoms and photos → Click "Continue"
7. **Step 4:** Optionally select services → Click "Continue"
8. **Step 5:** Review all information → Click "Submit Ticket"
9. ✅ Ticket created and appears in Admin Inbox

### 3. Admin Reviews & Assigns Ticket
1. Go to `http://localhost:3000/mobile-login`
2. Click "👨‍💼 Admin Dashboard" (or login with admin@demo.com)
3. Click "View All" in Ticket Inbox section
4. Filter by "pending admin review"
5. Click "Assign to Mechanic" on any ticket
6. Select a mechanic → Click "Assign"
7. ✅ Ticket status updated to `assigned`

### 4. Mechanic Requests Return Visit
1. Login as Employee
2. Go to "Work Orders" from bottom nav
3. Open any work order with status `in-progress`
4. Scroll to bottom
5. Click "Request Return Visit" button
6. Enter reason: "Need to order replacement brake pads"
7. Optionally upload photos of worn parts
8. Click "Submit Request"
9. ✅ Ticket status updated to `return-visit-required`

### 5. Admin Sets Reschedule Date
1. Login as Admin
2. Go to Ticket Inbox (`/admin/tickets/inbox`)
3. Filter by "return visit required"
4. Find ticket with orange "🔄 Needs Reschedule" badge
5. Click "Set Return Date" button
6. Select date and time window
7. Add instructions for customer (optional)
8. Click "Set Return Date & Notify Customer"
9. ✅ Ticket status updated to `rescheduled-awaiting-vehicle`
10. ✅ Customer receives notification (simulated in console)

## 📸 Test Photo Upload

### Upload Photos with Categories
1. In any ticket creation flow (customer or employee)
2. Click "Upload Photos" button
3. Select multiple images from your device
4. Click on any photo to:
   - Change category (damage, warning lights, VIN, etc.)
   - Add description
   - Remove photo
5. Photos are automatically compressed
6. On mobile: Use camera button to take photos directly

### Photo Categories Available:
- 🔧 Damage
- ⚠️ Warning Lights
- 🏷️ VIN Sticker
- ⚙️ Engine Bay
- 🛞 Tires
- 🪑 Interior
- 🚗 Exterior
- 📷 Other

## 🔍 Test Customer Lookup (Employee Flow)

1. Login as Employee
2. Click "New Ticket"
3. Try searching for:
   - **Name:** "Sarah" or "Johnson"
   - **Email:** "sarah" or "@email"
   - **Phone:** "555" or "123"
   - **License Plate:** "ABC" or "1234"
4. Results filter in real-time
5. Click customer to select
6. Or click "Create New Customer" to add new

## 📊 Test Status Filters (Admin Inbox)

1. Login as Admin
2. Go to Ticket Inbox
3. Click different status filters:
   - **all** - Show everything
   - **pending admin review** - New tickets
   - **assigned** - Assigned to mechanic
   - **in progress** - Being worked on
   - **return visit required** - Needs reschedule
   - **rescheduled awaiting vehicle** - Date set
   - **work completed** - Finished

## 🎨 Test Responsive Design

### Mobile View (< 768px)
- Bottom navigation visible
- Single column layouts
- Touch-friendly buttons
- Mobile camera access
- Swipe-friendly cards

### Desktop View (≥ 768px)
- Sidebar navigation
- Multi-column grids
- Hover effects
- Larger modals
- More whitespace

## 🧪 Test Multi-Step Navigation

### In Customer or Employee Ticket Flow:
1. Start creating a ticket
2. Fill out Step 1 → Click "Continue"
3. Fill out Step 2 → Click "Continue"
4. Click "Back" button
5. ✅ Data persists from Step 2
6. Navigate forward again
7. ✅ All data maintained

## 💡 Pro Tips

### Customer Flow:
- Pre-filled customer info is editable
- Can add multiple photos per service
- "Service Not Listed" allows custom descriptions
- Scheduling preferences are optional

### Employee Flow:
- Search is real-time and multi-field
- Can create customer and vehicle in one flow
- Service selection is optional (mechanic can diagnose)
- All photos are categorized and compressed

### Admin Flow:
- Filter tickets by any status
- Assign mechanics from dropdown
- View all customer and vehicle details
- Reschedule requests show mechanic's reason and photos

### Reschedule Flow:
- Same ticket ID maintained (no duplicates)
- Mechanic provides reason and photos
- Admin sets date and notifies customer
- Ticket continues with same history

## 🐛 Troubleshooting

### Photos not uploading?
- Check file size (should auto-compress)
- Ensure image format is supported (jpg, png, gif, webp)
- Try fewer photos at once

### Customer search not working?
- Try partial matches (first few letters)
- Search works across name, email, phone, and plate
- Results update as you type

### Back button not working?
- Data should persist across steps
- If not, check browser console for errors

### Modal not closing?
- Click outside modal or X button
- Press Escape key
- Check for validation errors

## 📱 Mobile Testing

### iOS Safari:
1. Open `http://localhost:3000/mobile-login`
2. Add to Home Screen for app-like experience
3. Test camera access in photo upload
4. Test touch gestures

### Android Chrome:
1. Open `http://localhost:3000/mobile-login`
2. Test camera access
3. Test responsive layouts
4. Test bottom navigation

## 🎯 Key Features to Test

- [x] Customer ticket creation (4 steps)
- [x] Employee ticket creation (5 steps)
- [x] Photo upload with categories
- [x] Image compression
- [x] Mobile camera access
- [x] Customer lookup and creation
- [x] Vehicle selection and registration
- [x] Service selection
- [x] Scheduling preferences
- [x] Admin ticket inbox
- [x] Status filtering
- [x] Mechanic assignment
- [x] Reschedule request (mechanic)
- [x] Set reschedule date (admin)
- [x] Multi-step navigation
- [x] Data persistence
- [x] Form validation
- [x] Responsive design
- [x] Animations and transitions

## 🚀 All Systems Go!

Everything is implemented and ready to test. Start with the customer flow, then try the employee flow, and finally test the admin and reschedule features.

---

**Happy Testing!** 🎉

