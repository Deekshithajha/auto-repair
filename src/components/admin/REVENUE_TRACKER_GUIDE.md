# Revenue Tracker - User Guide & Functionality

## Overview
The Revenue Tracker page provides comprehensive financial insights for administrators. It displays daily and monthly revenue, COGS (Cost of Goods Sold), and gross margin metrics with interactive charts and detailed drill-down capabilities.

## Access
- **Route**: `/admin/revenue`
- **Role Required**: Admin only
- **Navigation**: Admin Dashboard → Revenue Tab (💰)

---

## Page Layout & Features

### 1. KPI Cards - Today's Metrics
**Location**: Top of page, 3 cards in a row

#### Card 1: Today's Revenue 💵
- **Shows**: Total revenue collected today
- **Calculation**: Sum of all `invoices.total_amount` where `payment_status = 'paid'` and `paid_at` is today
- **Example Display**: `$837.55`
- **Subtitle**: Today's date (e.g., "Jan 17, 2025")

#### Card 2: Today's COGS 🛒
- **Shows**: Cost of goods sold today
- **Calculation**: Sum of `parts.quantity × parts.unit_price` for tickets with invoices paid today
- **Example Display**: `$90.00`
- **Subtitle**: "Cost of goods sold"

#### Card 3: Today's Gross Margin 📊
- **Shows**: Gross margin for today
- **Calculation**: `Today's Revenue - Today's COGS`
- **Example Display**: `$747.55`
- **Subtitle**: Margin percentage (e.g., "89.3% margin")

### 2. KPI Cards - Month to Date (MTD)
**Location**: Below Today's metrics, 3 cards in a row

#### Card 1: MTD Revenue 💵
- **Shows**: Total revenue collected this month
- **Calculation**: Sum of all paid invoices from the 1st of the current month to today
- **Example Display**: `$12,450.00`

#### Card 2: MTD COGS 🛒
- **Shows**: Total COGS this month
- **Calculation**: Sum of all parts costs for tickets with invoices paid this month
- **Example Display**: `$1,350.00`

#### Card 3: MTD Gross Margin 📊
- **Shows**: Total gross margin this month
- **Calculation**: `MTD Revenue - MTD COGS`
- **Example Display**: `$11,100.00`
- **Subtitle**: Margin percentage (e.g., "89.2% margin")

---

### 3. Charts Section
**Location**: Below KPI cards, 2 side-by-side charts

#### Chart 1: Daily Revenue (Last 30 Days) - Line Chart
- **Type**: Multi-line chart
- **Data**: Daily revenue, COGS, and margin for the last 30 days
- **X-Axis**: Dates (e.g., "Dec 18", "Dec 19", ... "Jan 17")
- **Y-Axis**: Amount in thousands (e.g., "$1k", "$2k")
- **Lines**:
  - 🟢 **Green Line**: Revenue trend
  - 🔴 **Red Line**: COGS trend
  - 🔵 **Blue Line**: Margin trend
- **Interactivity**:
  - Hover over any point to see exact values
  - Tooltip shows formatted currency and date
  - Legend to toggle lines on/off

**Example Data Points**:
```
Date       | Revenue  | COGS  | Margin
-----------|----------|-------|--------
Jan 17     | $837.55  | $90.00| $747.55
Jan 16     | $2,508.33| $180.00| $2,328.33
Jan 13     | $1,520.55| $12.50| $1,508.05
Jan 10     | $979.00  | $125.00| $854.00
Jan 03     | $1,037.55| $25.00| $1,012.55
```

#### Chart 2: Monthly Revenue (Last 12 Months) - Bar Chart
- **Type**: Grouped bar chart
- **Data**: Monthly revenue, COGS, and margin for the last 12 months
- **X-Axis**: Month abbreviations (e.g., "Jan", "Feb", "Mar")
- **Y-Axis**: Amount in thousands
- **Bars**:
  - 🟢 **Green Bar**: Revenue per month
  - 🔴 **Red Bar**: COGS per month
  - 🔵 **Blue Bar**: Margin per month
- **Interactivity**:
  - Hover to see exact values
  - Tooltip shows full month name and year
  - Grouped bars for easy comparison

**Example Data Points**:
```
Month | Revenue   | COGS    | Margin
------|-----------|---------|----------
Jan   | $12,450.00| $1,350.00| $11,100.00
Dec   | $35,200.00| $3,800.00| $31,400.00
Nov   | $28,750.00| $3,200.00| $25,550.00
```

---

### 4. Filters Section
**Location**: Above detailed table, card with filter controls

#### Available Filters:
1. **Date From** 📅
   - Input type: Date picker
   - Default: 30 days ago
   - Allows filtering by start date

2. **Date To** 📅
   - Input type: Date picker
   - Default: Today
   - Allows filtering by end date

3. **Mechanic** 👤
   - Dropdown select
   - Options: "All Mechanics" + list of active employees
   - Filters by assigned mechanic (future enhancement)

4. **Service Type** 🔧
   - Dropdown select
   - Options:
     - All Services
     - Standard (common services like oil changes, brake jobs)
     - Non-Standard (custom/unique services)

5. **Payment Method** 💳
   - Dropdown select
   - Options:
     - All Methods
     - Cash
     - Card
     - Check
     - Online
     - Other

#### Filter Actions:
- **Reset Filters** button: Clears all filters and sets defaults (last 30 days)

---

### 5. Detailed Revenue Breakdown Table
**Location**: Bottom of page, scrollable table

#### Table Columns:

| Column | Description | Example |
|--------|------------|---------|
| **Date** | Invoice payment date | "Jan 17, 2025" |
| **Invoice Count** | Number of invoices paid on this date | `2` |
| **Revenue** | Total revenue for the day | `$837.55` |
| **COGS** | Total cost of goods sold | `$90.00` |
| **Gross Margin** | Revenue minus COGS | `$747.55` |
| **Margin %** | Gross margin as percentage | `89.3%` (green if positive, red if negative) |

#### Table Features:
- **Sorting**: Default sorted by date (newest first)
- **Color Coding**: 
  - Positive margin %: Green text
  - Negative margin %: Red text
- **Hover Effect**: Row highlights on hover
- **Responsive**: Horizontal scroll on mobile

**Example Table Data**:
```
Date          | Invoices | Revenue   | COGS    | Gross Margin | Margin %
--------------|----------|-----------|---------|--------------|----------
Jan 17, 2025  | 2        | $837.55   | $90.00  | $747.55      | 89.3%
Jan 16, 2025  | 3        | $2,508.33 | $180.00 | $2,328.33    | 92.8%
Jan 13, 2025  | 2        | $1,520.55 | $12.50  | $1,508.05    | 99.2%
Jan 10, 2025  | 1        | $979.00   | $125.00 | $854.00      | 87.2%
Jan 03, 2025  | 2        | $1,037.55 | $25.00  | $1,012.55    | 97.6%
```

---

## User Interactions

### 1. Filtering Data
1. Select a date range using "Date From" and "Date To"
2. Optionally filter by Mechanic, Service Type, or Payment Method
3. Table and charts update automatically
4. Click "Reset Filters" to restore defaults

### 2. Viewing Charts
1. Hover over chart lines/bars to see exact values
2. Click legend items to toggle series visibility
3. Zoom in/out on date ranges (future enhancement)

### 3. Exporting Data
1. Click "Export" button (top right)
2. Downloads filtered data as CSV/Excel (future enhancement)

---

## Data Calculations Explained

### Revenue Calculation
```sql
SELECT SUM(total_amount)
FROM invoices
WHERE payment_status = 'paid'
  AND paid_at BETWEEN :date_from AND :date_to
```

### COGS Calculation
```sql
SELECT SUM(parts.quantity * parts.unit_price)
FROM parts
INNER JOIN invoices ON parts.ticket_id = invoices.ticket_id
WHERE invoices.payment_status = 'paid'
  AND invoices.paid_at BETWEEN :date_from AND :date_to
```

### Gross Margin Calculation
```
Gross Margin = Revenue - COGS
Margin % = (Gross Margin / Revenue) × 100
```

---

## Sample Data Scenarios

### Scenario 1: Today's Performance
- **2 invoices paid today**
- **Total Revenue**: $837.55
- **Parts Used**: Brake Pads ($90.00)
- **COGS**: $90.00
- **Gross Margin**: $747.55 (89.3%)

### Scenario 2: Yesterday's High Volume
- **3 invoices paid**
- **Total Revenue**: $2,508.33
- **Parts Used**: Multiple (Oil Filter, Air Filter, Spark Plugs)
- **COGS**: $180.00
- **Gross Margin**: $2,328.33 (92.8%)

### Scenario 3: Monthly Overview
- **17 invoices paid this month**
- **MTD Revenue**: $12,450.00
- **MTD COGS**: $1,350.00
- **MTD Gross Margin**: $11,100.00 (89.2%)

---

## Responsive Design

### Desktop (≥1024px)
- Full-width layout
- Side-by-side charts
- All filters visible in one row
- Full table width

### Tablet (641px - 1023px)
- Stacked charts
- Filters in 2-3 columns
- Scrollable table

### Mobile (≤640px)
- Stacked KPI cards
- Stacked charts
- Filters stacked vertically
- Horizontal scroll for table

---

## Error States

### No Data Available
- Message: "No data available for the selected filters"
- Suggestion: Adjust date range or filters

### Loading State
- Spinner animation
- Message: "Loading revenue data..."

### Error State
- Toast notification with error message
- Retry option (future enhancement)

---

## Future Enhancements (Planned)

1. **Export Functionality**
   - CSV export
   - PDF reports
   - Excel export

2. **Advanced Filtering**
   - Filter by customer
   - Filter by vehicle make/model
   - Multiple date range presets (This Week, This Month, Last Month, etc.)

3. **Drill-Down Capability**
   - Click table row to see invoice details
   - Click chart point to see day's invoices
   - Expand/collapse monthly details

4. **Comparative Analytics**
   - Compare periods (YoY, MoM)
   - Trend indicators (↑↓)
   - Percentage change indicators

5. **Forecasting**
   - Revenue projections based on trends
   - COGS estimates

---

## Technical Notes

- **Data Refresh**: Real-time from Supabase
- **Performance**: Indexed queries for fast loading
- **Caching**: TanStack Query for efficient data fetching
- **Chart Library**: Recharts (responsive and interactive)
- **Date Handling**: date-fns for accurate date calculations

---

## Getting Started

1. **Run the migration** to add `paid_at` and `payment_method` fields:
   ```sql
   -- Migration: 20250117000000_add_invoice_payment_fields.sql
   ```

2. **Insert dummy data** (optional, for testing):
   ```sql
   -- Migration: 20250117000001_insert_revenue_tracker_dummy_data.sql
   ```

3. **Navigate to Revenue Tracker**:
   - Admin Dashboard → Revenue Tab
   - Or directly: `/admin/revenue`

4. **View your data**:
   - KPI cards show today and MTD metrics
   - Charts visualize trends
   - Table provides detailed breakdown

---

## Troubleshooting

### Issue: No data showing
**Solution**: 
- Check if invoices have `payment_status = 'paid'`
- Verify invoices have `paid_at` timestamp set
- Ensure date range includes invoice dates

### Issue: COGS showing as $0
**Solution**:
- Verify parts are linked to tickets that have paid invoices
- Check that `parts.quantity` and `parts.unit_price` are set

### Issue: Charts not loading
**Solution**:
- Check browser console for errors
- Verify Recharts library is installed
- Ensure data format matches expected structure

---

## Support

For issues or questions:
- Check console logs for errors
- Verify database schema matches migrations
- Ensure admin role is properly set
- Check Supabase connection

