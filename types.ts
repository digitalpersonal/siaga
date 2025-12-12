
export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  locationType?: 'local' | 'external'; // external = outra cidade
}

export interface Specialty {
  name: string;
  price: number;
}

export interface ProfessionalSettings {
  workHours: { 
    start: string; 
    end: string; 
    lunchStart: string; // Fim do expediente da manhã
    lunchEnd: string;   // Início do expediente da tarde
  };
  workDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  blockedDays: string[]; // YYYY-MM-DD
  blockedTimeSlots: { [date: string]: string[] };
  assignedUnit?: string; // Moved here from top level
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
  healthUnit?: string; // Nome da Unidade de Saúde (Ex: UBS Centro)
  hasCompanion?: boolean;
  transportStatus?: 'pending' | 'present' | 'absent';
  assignedVehicle?: string; // ID ou Nome do veículo alocado para o dia
}
