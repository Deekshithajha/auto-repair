# Revenue Tracker - Visual Demonstration

## Page Overview
This document shows how the Revenue Tracker page works with dummy data.

---

## 📊 KPI Cards Section

### Today's Metrics (Top Row)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  💵 Today's Revenue  │  │  🛒 Today's COGS    │  │  📊 Today's Margin  │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│    $837.55          │  │    $90.00           │  │    $747.55          │
│                     │  │                     │  │                     │
│  Jan 17, 2025       │  │  Cost of goods sold │  │  89.3% margin        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Data Example**:
- **Today (Jan 17)**: 2 invoices paid
  - Invoice 1: $495.00 (Card)
  - Invoice 2: $342.55 (Cash)
  - **Total Revenue**: $837.55
  - **COGS**: $90.00 (Brake Pads used)
  - **Gross Margin**: $747.55 (89.3%)

### Month to Date (MTD) Metrics (Second Row)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  💵 MTD Revenue     │  │  🛒 MTD COGS        │  │  📊 MTD Margin      │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤
│                     │  │                     │  │                     │
│    $12,450.00       │  │    $1,350.00        │  │    $11,100.00       │
│                     │  │                     │  │                     │
│  Month to date      │  │  Cost of goods sold │  │  89.2% margin       │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

**Data Example**:
- **17 invoices** paid this month (Jan 1 - Jan 17)
- **Total Revenue**: $12,450.00
- **Total COGS**: $1,350.00
- **Gross Margin**: $11,100.00 (89.2%)

---

## 📈 Charts Section

### Daily Revenue Chart (Last 30 Days) - Line Chart

```
Revenue & COGS Trend (Last 30 Days)
─────────────────────────────────────────────────────────
$3k │                                         
    │                         ●                        
$2k │                     ●   ●                        
    │                 ●       ●                        
$1k │     ●       ●       ●   ●       ●                
    │ ●   ●   ●   ●   ●   ●   ●   ●   ●                
  $0 └─────────────────────────────────────────
    Dec 18  25   Jan 1    8    15   17
            Revenue (Green) ───
            COGS (Red)     ───
            Margin (Blue)  ───
```

**Key Points**:
- **Green Line**: Revenue trend (higher = better)
- **Red Line**: COGS trend (lower = better margin)
- **Blue Line**: Margin trend (gap between revenue and COGS)
- **Hover**: Shows exact values for any date
- **Data Points**: 30 days of daily financial metrics

**Example Daily Values** (from dummy data):
- Jan 17: Revenue $837.55, COGS $90.00, Margin $747.55
- Jan 16: Revenue $2,508.33, COGS $180.00, Margin $2,328.33
- Jan 13: Revenue $1,520.55, COGS $12.50, Margin $1,508.05
- Jan 10: Revenue $979.00, COGS $125.00, Margin $854.00

### Monthly Revenue Chart (Last 12 Months) - Bar Chart

```
Monthly Revenue (Last 12 Months)
─────────────────────────────────────────────────────────
$40k │                             ████                
     │                         ████                    
$30k │                     ████                        
     │                 ████                            
$20k │             ████                                
     │         ████                                    
$10k │     ████                                        
     │ ████                                            
  $0 └─────────────────────────────────────────
      Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec  Jan
       ████ = Revenue (Green)  ████ = COGS (Red)  ████ = Margin (Blue)
```

**Key Points**:
- **Grouped Bars**: Compare Revenue, COGS, and Margin side-by-side
- **12 Months**: Full year of monthly data
- **Hover**: Shows full month name and year with exact values
- **Visual Comparison**: Easy to spot trends and seasonal patterns

**Example Monthly Values** (from dummy data):
- January 2025: Revenue $12,450.00, COGS $1,350.00, Margin $11,100.00
- December 2024: Revenue $35,200.00, COGS $3,800.00, Margin $31,400.00
- November 2024: Revenue $28,750.00, COGS $3,200.00, Margin $25,550.00

---

## 🔍 Filters Section

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Filters                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Date From: [2024-12-18]  Date To: [2025-01-17]              │
│                                                                 │
│  Mechanic:    [All Mechanics ▼]                                 │
│  Service:     [All Services ▼]                                 │
│  Payment:     [All Methods ▼]                                  │
│                                                                 │
│  [Reset Filters]                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Filter Options**:
1. **Date From/To**: Pick date range (default: last 30 days)
2. **Mechanic**: Filter by assigned mechanic (from active employees list)
3. **Service Type**: Standard or Non-Standard services
4. **Payment Method**: Cash, Card, Check, Online, Other

**Example Filter Scenarios**:
- **Last 7 Days**: Shows only invoices paid in the last week
- **This Month**: Shows current month's data
- **Cash Payments Only**: Filters to show only cash transactions
- **Card Payments**: Shows only card payments
- **Standard Services**: Filters by standard service type

---

## 📋 Detailed Revenue Breakdown Table

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  Detailed Revenue Breakdown                                                  │
│  Daily financial summary with drilldown                                      │
├──────────────┬─────────────┬──────────┬──────────┬───────────────┬──────────┤
│ Date         │ Invoice Cnt │ Revenue  │ COGS     │ Gross Margin  │ Margin % │
├──────────────┼─────────────┼──────────┼──────────┼───────────────┼──────────┤
│ Jan 17, 2025 │     2       │ $837.55  │ $90.00   │ $747.55       │ 89.3% ✓  │
│ Jan 16, 2025 │     3       │ $2,508.33│ $180.00  │ $2,328.33     │ 92.8% ✓  │
│ Jan 13, 2025 │     2       │ $1,520.55│ $12.50  │ $1,508.05     │ 99.2% ✓  │
│ Jan 10, 2025 │     1       │ $979.00  │ $125.00  │ $854.00       │ 87.2% ✓  │
│ Jan 03, 2025 │     2       │ $1,037.55│ $25.00   │ $1,012.55     │ 97.6% ✓  │
│ Dec 28, 2024│     1       │ $715.00  │ $90.00   │ $625.00       │ 87.4% ✓  │
│ Dec 25, 2024│     2       │ $1,520.55│ $12.50   │ $1,508.05     │ 99.2% ✓  │
│ ...         │ ...        │ ...      │ ...      │ ...           │ ...      │
└──────────────┴─────────────┴──────────┴──────────┴───────────────┴──────────┘
```

**Table Features**:
- **Sorting**: Default by date (newest first)
- **Color Coding**: 
  - ✓ Green for positive margins
  - ✗ Red for negative margins
- **Hover**: Row highlights on hover
- **Scrollable**: Horizontal scroll on mobile devices
- **Clickable** (future): Click row to drill down into invoice details

**Example Table Data** (from dummy data):

| Date | Invoice Count | Revenue | COGS | Gross Margin | Margin % |
|------|---------------|---------|------|--------------|----------|
| Jan 17, 2025 | 2 | $837.55 | $90.00 | $747.55 | 89.3% |
| Jan 16, 2025 | 3 | $2,508.33 | $180.00 | $2,328.33 | 92.8% |
| Jan 13, 2025 | 2 | $1,520.55 | $12.50 | $1,508.05 | 99.2% |
| Jan 10, 2025 | 1 | $979.00 | $125.00 | $854.00 | 87.2% |
| Jan 03, 2025 | 2 | $1,037.55 | $25.00 | $1,012.55 | 97.6% |

---

## 💡 Interactive Features

### 1. Chart Interactions
- **Hover over line/bar**: Shows tooltip with exact values
- **Legend click**: Toggle series visibility
- **Zoom**: Future enhancement for date range zooming

### 2. Filter Interactions
- **Change date range**: Table and charts update automatically
- **Select filter options**: Data filters in real-time
- **Reset filters**: Returns to default (last 30 days)

### 3. Table Interactions
- **Hover row**: Row highlights
- **Scroll**: Horizontal scroll on mobile
- **Click row** (future): Drill down to invoice details

---

## 📱 Responsive Behavior

### Desktop View (≥1024px)
```
┌─────────────────────────────────────────────────────────────────┐
│  Revenue Tracker                                    [Export]    │
├─────────────────────────────────────────────────────────────────┤
│  [Today KPIs - 3 cards in row]                                 │
│  [MTD KPIs - 3 cards in row]                                    │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │ Daily Chart        │  │ Monthly Chart      │               │
│  │ (Line)             │  │ (Bar)              │               │
│  └────────────────────┘  └────────────────────┘               │
│  [Filters - 5 columns]                                        │
│  [Table - Full width]                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile View (≤640px)
```
┌─────────────────────┐
│ Revenue Tracker     │
│      [Export]       │
├─────────────────────┤
│ [Today KPI - Card]  │
│ [Today KPI - Card]  │
│ [Today KPI - Card]  │
│ [MTD KPI - Card]    │
│ [MTD KPI - Card]    │
│ [MTD KPI - Card]    │
│ [Daily Chart]       │
│ [Monthly Chart]     │
│ [Filters - Stacked] │
│ [Table - Scroll]    │
└─────────────────────┘
```

---

## 🎯 Example Scenarios

### Scenario 1: Viewing Today's Performance
1. **Open Revenue Tracker**: Navigate to `/admin/revenue`
2. **See Today's KPIs**: 
   - Revenue: $837.55
   - COGS: $90.00
   - Margin: $747.55 (89.3%)
3. **View Daily Chart**: Today's point shows on the line chart
4. **Check Table**: Jan 17 row shows today's breakdown

### Scenario 2: Analyzing Monthly Trends
1. **View MTD KPIs**: See month-to-date totals
2. **Check Monthly Chart**: See bar chart comparing last 12 months
3. **Identify Trends**: Spot if revenue is increasing/decreasing
4. **Compare Months**: See which months had highest revenue

### Scenario 3: Filtering by Payment Method
1. **Select Filter**: Choose "Card" from Payment Method dropdown
2. **See Updated Data**: Only card transactions shown
3. **Check KPIs**: Updated to show only card payments
4. **View Table**: Filtered rows showing only card transactions
5. **Reset**: Click "Reset Filters" to see all data again

### Scenario 4: Analyzing Date Range
1. **Set Date Range**: Change "Date From" to 7 days ago
2. **View Last Week**: See only last 7 days of data
3. **Check Charts**: Charts update to show selected range
4. **Analyze Trend**: See if revenue is trending up or down

---

## 🔢 Sample Calculations

### Today's Example:
- **Invoice 1**: $495.00 (Brake Job)
- **Invoice 2**: $342.55 (Oil Change)
- **Total Revenue**: $837.55
- **Parts Used**: 
  - Brake Pads: 2 × $45.00 = $90.00
- **COGS**: $90.00
- **Gross Margin**: $837.55 - $90.00 = $747.55
- **Margin %**: ($747.55 / $837.55) × 100 = 89.3%

### Monthly Example:
- **17 invoices** in January
- **Total Revenue**: $12,450.00
- **Parts Used**: Various (Brake Pads, Oil Filter, Air Filter, etc.)
- **Total COGS**: $1,350.00
- **Gross Margin**: $12,450.00 - $1,350.00 = $11,100.00
- **Margin %**: ($11,100.00 / $12,450.00) × 100 = 89.2%

---

## 🚀 Getting Started with Dummy Data

1. **Run Migration 1**: Add `paid_at` and `payment_method` fields
   ```sql
   -- Migration: 20250117000000_add_invoice_payment_fields.sql
   ```

2. **Run Migration 2**: Insert dummy revenue data
   ```sql
   -- Migration: 20250117000001_insert_revenue_tracker_dummy_data.sql
   ```

3. **Navigate to Revenue Tracker**:
   - Admin Dashboard → Revenue Tab (💰)
   - Or: `/admin/revenue`

4. **View Your Data**:
   - KPI cards show today's and MTD metrics
   - Charts display trends
   - Table shows detailed breakdown

---

## ✨ Key Features Summary

✅ **Real-time Data**: Live data from Supabase  
✅ **Interactive Charts**: Hover, zoom, toggle series  
✅ **Flexible Filtering**: Date range, mechanic, service type, payment method  
✅ **Detailed Drill-down**: Daily financial breakdown table  
✅ **Responsive Design**: Works on mobile, tablet, desktop  
✅ **Visual Indicators**: Color-coded margins, trend lines  
✅ **Export Ready**: Export button (future enhancement)  

---

This Revenue Tracker provides comprehensive financial insights for administrators to monitor and analyze business performance!

