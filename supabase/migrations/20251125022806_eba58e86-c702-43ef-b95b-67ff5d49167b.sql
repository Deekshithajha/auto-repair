-- Fix security warnings: Set search_path on trigger functions
-- This prevents search_path hijacking attacks

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS update_employee_details_updated_at ON public.employee_details;
DROP TRIGGER IF EXISTS update_attendance_updated_at ON public.attendance;
DROP TRIGGER IF EXISTS update_work_sessions_updated_at ON public.work_sessions;
DROP TRIGGER IF EXISTS update_damage_log_updated_at ON public.damage_log;
DROP TRIGGER IF EXISTS update_vehicle_photos_updated_at ON public.vehicle_photos;

-- Recreate triggers with proper search_path
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_details_updated_at
  BEFORE UPDATE ON public.employee_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON public.work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_damage_log_updated_at
  BEFORE UPDATE ON public.damage_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_photos_updated_at
  BEFORE UPDATE ON public.vehicle_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();