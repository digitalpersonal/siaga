
export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  locationType?: 'local' | 'external'; // external = outra cidade
  destinationCity?: string; // Ex: "Poços de Caldas" (Only for external)
}

export interface Specialty {
  name: string;
  price: number;
}

export interface WorkSchedule {
  unitId: string;
  unitName: string;
  workDays: number[]; // 0=Dom, 1=Seg, ...
  start: string; // "08:00"
  end: string;   // "12:00"
}

export interface ProfessionalSettings {
  // Legacy fields (kept for type safety, but logic will move to 'schedule')
  workHours?: { 
    start: string; 
    end: string; 
    lunchStart: string; 
    lunchEnd: string;   
  };
  workDays?: number[]; 
  assignedUnit?: string; 
  
  // New Multi-Unit Schedule
  schedule: WorkSchedule[]; 
  
  blockedDays: string[]; // YYYY-MM-DD
  blockedTimeSlots: { [date: string]: string[] };
}

export interface Professional {
  id: string;
  name: string;
  specialties: Specialty[];
  rating?: number;
  imageUrl: string;
  services: Service[];
  settings?: ProfessionalSettings;
  bio?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  imageUrl: string;
}

export interface Plan {
  id:string;
  name: string;
  price: string;
  features: string[];
  highlight: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: 'client' | 'professional' | 'admin' | 'attendant' | 'driver';
  whatsapp?: string;
  address?: string;
  susCardNumber?: string;
  permanentCompanion?: string;
  // Novos campos cadastrais completos
  cpf?: string;
  rg?: string;
  birthDate?: string; // YYYY-MM-DD
  motherName?: string;
}

export interface ProfessionalUser extends User {
  role: 'professional';
  specialties: Specialty[];
  services: Service[];
  settings: ProfessionalSettings;
  bio?: string;
}

export interface AdminUser extends User {
  role: 'admin';
}

export interface AttendantUser extends User {
  role: 'attendant';
}

export interface DriverUser extends User {
  role: 'driver';
}

// --- Novas Entidades de Logística e Infra ---

export interface Vehicle {
  id: string;
  name: string; // Ex: Van Ducato 01
  plate: string; // Placa
  capacity: number; // Lugares
  type: 'car' | 'van' | 'bus' | 'ambulance';
}

export interface HealthUnit {
  id: string;
  name: string; // Ex: UBS Centro
  address?: string;
  whatsapp: string; // Contato oficial da unidade
  type: 'ubs' | 'hospital' | 'caps' | 'specialty_center' | 'lab';
}

export interface DestinationCity {
  id: string;
  name: string; // Ex: Poços de Caldas
  distanceKm: number;
  estimatedTime: string; // Ex: "1h 30m"
}

export interface Trip {
  id: string;
  date: string;
  time: string; // Horário de saída
  destination_id: string;
  vehicle_id: string;
  driver_id: string;
  destination_name: string; // Denormalized for UI
  vehicle_name: string;     // Denormalized for UI
  driver_name: string;      // Denormalized for UI
  capacity: number;
  passengers_count: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Appointment {
  id: string;
  client_id: string; // Added for joining
  service_name: string;
  professional_name: string;
  professional_image_url: string;
  client_name: string;
  client_address?: string; // Added field for Driver
  client_whatsapp?: string; // Added field for Driver
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  pet_name?: string;
  pet_breed?: string;
  notes?: string;
  // Transport fields
  locationType?: 'local' | 'external';
  healthUnit?: string; // Nome da Unidade Local OU Nome do Hospital Externo
  destinationCity?: string; // Cidade destino (para externos)
  externalProfessional?: string; // Nome do médico na outra cidade
  hasCompanion?: boolean;
  transportStatus?: 'pending' | 'present' | 'absent';
  assignedVehicle?: string; // Legacy field (optional)
  trip_id?: string; // Link to the specific Trip
}
