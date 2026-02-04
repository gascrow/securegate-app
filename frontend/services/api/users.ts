import api from './index';
import { UserAccount } from '../../types';

// GET USERS (LOGIN ACCOUNTS) - untuk UserManagement
export const getUsers = async (): Promise<UserAccount[]> => {
  const res = await api.get('/manajemen-user');
  return res.data.data;
};

// CREATE USER (LOGIN ACCOUNT) - untuk UserManagement
export const createUser = async (payload: Omit<UserAccount, 'id'>) => {
  const res = await api.post('/manajemen-user', payload);
  return res.data;
};

// UPDATE USER (LOGIN ACCOUNT) - untuk UserManagement
export const updateUser = async (id: string, payload: Partial<UserAccount>) => {
  const res = await api.post('/manajemen-user/update', { id, ...payload });
  return res.data;
};

// DELETE USER (LOGIN ACCOUNT) - untuk UserManagement
export const deleteUser = async (id: string) => {
  const res = await api.post('/manajemen-user/delete', { id });
  return res.data;
};

// ===== EMPLOYEES ENDPOINTS (untuk StaffDirectory) =====

// GET EMPLOYEES (Daftar Pegawai)
export const getEmployees = async (): Promise<UserAccount[]> => {
  const res = await api.get('/daftar-pegawai');
  // Map employees response to UserAccount format
  return res.data.data.map((emp: any) => ({
    id: String(emp.id),
    username: emp.nama,
    role: 'STAF' as any,
    division: emp.divisi,
    phoneNumber: emp.nomorHp,
    isActive: true,
    createdAt: emp.createdAt
  }));
};

// CREATE EMPLOYEE (Daftar Pegawai)
export const createEmployee = async (payload: Omit<UserAccount, 'id'>) => {
  const employeePayload = {
    nama: payload.username,
    divisi: payload.division,
    nomorHp: payload.phoneNumber
  };
  const res = await api.post('/daftar-pegawai', employeePayload);
  return res.data;
};

// UPDATE EMPLOYEE (Daftar Pegawai)
export const updateEmployee = async (id: string, payload: Partial<UserAccount>) => {
  const employeePayload: any = { id };
  if (payload.username) employeePayload.nama = payload.username;
  if (payload.division) employeePayload.divisi = payload.division;
  if (payload.phoneNumber) employeePayload.nomorHp = payload.phoneNumber;
  
  const res = await api.post('/daftar-pegawai/update', employeePayload);
  return res.data;
};

// DELETE EMPLOYEE (Daftar Pegawai)
export const deleteEmployee = async (id: string) => {
  const res = await api.post('/daftar-pegawai/delete', { id });
  return res.data;
};
