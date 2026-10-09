export interface PersonalEmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface MedicineReminder {
  id: string;
  name: string;
  dosage: string;
  time: string; // e.g., "08:00"
  foodRelation: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  frequency: 'Once Daily' | 'Twice Daily' | 'Thrice Daily' | 'As Needed';
  takenToday: boolean;
  notes?: string;
  color?: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  availableStatus: 'Available Now' | 'On Emergency Duty' | 'In Surgery' | 'On Call';
  consultationHours: string;
  languages: string[];
}

export interface EmergencyContacts {
  traumaHelpline: string;
  ambulanceDirect: string;
  bloodBank: string;
  receptionDesk: string;
}

export interface LiveHospital {
  id: number;
  name: string;
  city: string;
  distanceKm: number;
  phone: string;
  address: string;
  verifiedLive: boolean;
  totalBeds: number;
  availableBeds: number;
  icuAvailable: number;
  oxygenAvailable: number;
  emergencyAvailable: number;
  ventilatorAvailable: number;
  generalAvailable: number;
  maternityAvailable: number;
  lastUpdatedMinutesAgo: number;
  doctorOnCall: string;
  emergencyContacts: EmergencyContacts;
  doctors: DoctorProfile[];
}

export interface ClinicRecommendation {
  id: string;
  name: string;
  type: 'Urgent Care Clinic' | 'Trauma & Emergency' | 'Burn Care Center' | 'Orthopedic Center';
  distanceKm: number;
  phone: string;
  address: string;
  openHours: string;
}

export interface LabTestItem {
  testName: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  simpleExplanation: string;
  advice: string;
}

export interface LabReportResult {
  isLabReport: boolean;
  patientName?: string | null;
  reportDate?: string | null;
  labName?: string | null;
  tests: LabTestItem[];
  overallSummary: string;
  dietaryRecommendations: string[];
  doctorQuestions: string[];
  urgentAlerts: string[];
}
