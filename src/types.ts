import { Dayjs } from "dayjs";

export interface Aircraft {
  id: number;
  tail_number: string;
  current_hobbs: number;
  current_landings: number;
  last_maintenance_date: string;
}
export interface MaintenanceType {
  id: number;
  description: string;
  hobbs_interval: number;
  landings_interval: number;
  calendar_days_interval: number;
}
export interface MaintenanceEvent {
  id: number;
  aircraft_id: number;
  maintenance_type_id: number;
  next_due_hobbs: number;
  next_due_landings: number;
  next_due_date: string;
}
export interface MaintenanceSchedule {
  id: number;
  aircraft_id: number;
  maintenance_type_id: number;
  start_date: string;
  end_date: string;
}
export interface Trip {
  id: number;
  aircraft_id: number;
  start_date: string;
  end_date: string;
  flying_time: number;
  landing_count: number;
}

export interface AircraftAvailability{
  id: number;
  tail_number: string;
  status: "AVAILABLE" | "UNAVAILABLE";
}

export interface SearchFormData{
  date_range: Dayjs[];
  landing_count: number;
  flying_time: number;
}