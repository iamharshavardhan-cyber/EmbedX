export type UserRole = 'student' | 'scanner' | 'admin' | 'super_admin';

export type BranchCode =
  | 'cse'
  | 'ece'
  | 'bme'
  | 'mee'
  | 'ei'
  | 'es'
  | 'cps'
  | 'aiml'
  | 'ccb'
  | 'sct';

export type PinPrefix =
  | 'cs'
  | 'ec'
  | 'bm'
  | 'mee'
  | 'ei'
  | 'es'
  | 'cps'
  | 'ai'
  | 'ccb'
  | 'sct';

export type PriorKnowledgeLevel = 'none' | 'basic' | 'intermediate' | 'advanced';

export type PaymentStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export type RegistrationStatus = 'pending' | 'verified' | 'rejected' | 'cancelled';

export type TicketStatus = 'unissued' | 'issued' | 'revoked';

export interface DayAttendance {
  checkedIn: boolean;
  timestamp?: string | null;
  scannerUid?: string | null;
}

export interface AttendanceRecord {
  day1: DayAttendance;
  day2: DayAttendance;
}

export interface Registration {
  id: string; // auth uid
  fullName: string;
  pin: string; // e.g. 26054-cs-038
  phoneNumber: string;
  branch: BranchCode;
  priorKnowledge: PriorKnowledgeLevel;
  learningExpectations: string;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  ticketStatus: TicketStatus;
  ticketId: string | null;
  attendance: AttendanceRecord;
  createdAt: any;
  updatedAt: any;
  lastPaymentSubmittedAt?: any;
  rejectionReason?: string;
}

export interface PaymentAttempt {
  id: string;
  utr: string;
  screenshotRef: string;
  expectedAmount: number;
  status: 'submitted';
  submittedAt: any;
}

export interface UserRoleDoc {
  role: UserRole;
  updatedAt?: any;
}

export interface PaymentConfig {
  upiId: string;
  payeeName?: string;
  amount: number;
  expectedAmount?: number;
  qrImageUrl?: string;
  currency?: string;
  note?: string;
}

export const BRANCH_TO_PIN_PREFIX: Record<BranchCode, PinPrefix> = {
  cse: 'cs',
  ece: 'ec',
  bme: 'bm',
  mee: 'mee',
  ei: 'ei',
  es: 'es',
  cps: 'cps',
  aiml: 'ai',
  ccb: 'ccb',
  sct: 'sct',
};

export const WORKSHOP_FEE = 70; // FIXED AT 70
