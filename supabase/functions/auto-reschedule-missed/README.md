# Auto-Reschedule Missed Appointments

This Edge Function automatically reschedules vehicles to the next day if customers don't show up on their scheduled reschedule date.

## How It Works

1. The function runs daily (should be configured as a cron job)
2. It checks for tickets with `reschedule_date` that was today
3. For tickets where the vehicle is not in shop (customer didn't show up), it:
   - Updates the `reschedule_date` to the next day
   - Sends a notification to the customer informing them of the new date

## Setup

### 1. Deploy the Function

```bash
supabase functions deploy auto-reschedule-missed
```

### 2. Configure Cron Job

In your Supabase dashboard:
1. Go to Database → Cron Jobs
2. Create a new cron job with:
   - **Name**: `auto_reschedule_missed`
   - **Schedule**: `0 0 * * *` (runs daily at midnight)
   - **Function**: `auto-reschedule-missed`
   - **Enabled**: `true`

Or use SQL:

```sql
SELECT cron.schedule(
  'auto-reschedule-missed',
  '0 0 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-reschedule-missed',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

### 3. Manual Trigger

You can also manually trigger the function:

```bash
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-reschedule-missed' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

## Response Format

```json
{
  "message": "Processed 3 tickets",
  "processed": 2,
  "results": [
    {
      "ticket_id": "uuid",
      "ticket_number": "TKT-000001",
      "customer_name": "John Doe",
      "vehicle": "Toyota Camry",
      "old_date": "2024-01-15T10:00:00Z",
      "new_date": "2024-01-16T10:00:00Z",
      "success": true
    }
  ]
}
```

## Notes

- The function only reschedules vehicles that are not in shop (location_status != 'in_shop')
- If a vehicle is already in shop, it means the customer showed up, so no rescheduling is needed
- Customers receive a notification when their vehicle is automatically rescheduled

