
export enum GuestStatus {
  PENDING = 'PENDING',
  DIIZINKAN = 'DIIZINKAN',
  DITOLAK = 'DITOLAK',
  LOGGED = 'LOGGED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  SEKURITI = 'SEKURITI',
  TAMU = 'TAMU',
  STAF = 'STAF'
}

export enum VisitType {
  UMUM = 'UMUM',
  VENDOR = 'VENDOR'
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  division: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt?: string;
}

export interface GuestEntry {
  id: string;
  tanggal: string;
  visitType: VisitType;
  isGroup: boolean;
  groupMembers: string[]; 
  namaLengkap: string; 
  asalInstansi: string;
  keperluan: string;
  nomorHp: string;
  nomorKtp: string;
  
  fotoTamu?: string;
  fotoKTP?: string;
  k3Pdf?: string; 
  suratUndangan?: string;

  tujuan: string;
  divisi: string;
  nomorHpPegawai: string;
  penanggungJawab: string;
  
  deskripsiPekerjaan?: string;
  lokasiPekerjaan?: string;
  
  jamMasuk: string;
  jamKeluar: string | null;
  status: GuestStatus;
  catatan?: string;
  authorizedBy?: string;
}

export interface Notification {
  id: string;
  guestId: string;
  message: string;
  timestamp: Date;
  isActioned: boolean;
}
