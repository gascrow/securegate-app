import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, UserRole } from '../types';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/api/users';
import { UserPlus, Search, Edit2, Trash2, Power, Shield, Briefcase, Phone, X, Save, Key, UserCheck, Loader2 } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [formData, setFormData] = useState<Omit<UserAccount, 'id'>>({
    username: '',
    password: '',
    role: UserRole.SEKURITI,
    division: '',
    phoneNumber: '',
    isActive: true
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((u.division || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const handleOpenModal = (user: UserAccount | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', 
        role: user.role,
        division: user.division || '',
        phoneNumber: user.phoneNumber || '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        role: UserRole.SEKURITI,
        division: '',
        phoneNumber: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let result;
      if (editingUser) {
      result = await updateUser(editingUser.id, formData);
      } else {
      result = await createUser(formData);
      } 

      if (result.success) {
        setIsModalOpen(false);
        await loadUsers();
      } else {
        alert("Gagal menyimpan data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus akun user ini secara permanen?")) {
      await deleteUser(id);
      await loadUsers();
    }
  };

  const toggleStatus = async (user: UserAccount) => {
    setIsLoading(true);
    try {
      const newStatus = !user.isActive;
      console.log('Toggling status:', { userId: user.id, oldStatus: user.isActive, newStatus });
      const result = await updateUser(user.id, { isActive: newStatus });
      if (result.success) {
        await loadUsers();
      } else {
        alert('Gagal mengubah status user');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      alert('Error: ' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full overflow-hidden">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-1">
        <div className="relative flex-grow w-full max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Cari user atau divisi..." 
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-100 focus:border-brand-navy outline-none font-bold text-[14px] shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-navy text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-dark transition-all shadow-lg active:scale-95"
        >
          <UserPlus size={18} /> TAMBAH USER BARU
        </button>
      </div>

      {/* TABLE VIEW */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">IDENTITAS USER</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ROLE & DIVISI</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">STATUS AKSES</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AKSI KONTROL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && users.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-300 uppercase font-black text-[12px]"><Loader2 size={32} className="animate-spin mx-auto mb-4" /> Sinkronisasi Data...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-slate-200 font-black uppercase text-[12px]">Data tidak ditemukan</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-brand-navy/5 rounded-2xl flex items-center justify-center text-brand-navy">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="font-black text-brand-navy text-[15px] leading-tight uppercase tracking-tight">{user.username}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black w-fit uppercase tracking-widest ${
                          user.role === UserRole.ADMIN ? 'bg-red-50 text-brand-red border border-red-100' :
                          user.role === UserRole.SEKURITI ? 'bg-blue-50 text-brand-navy border border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-[12px] font-bold text-slate-600 italic leading-none">{user.division || 'UMUM'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => toggleStatus(user)}
                        className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                          user.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-50 text-slate-300 border-slate-100 opacity-50'
                        }`}
                      >
                        <Power size={12} /> {user.isActive ? 'AKTIF' : 'NON-AKTIF'}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenModal(user)} className="p-2.5 text-slate-300 hover:text-brand-navy bg-slate-50 rounded-xl transition-all"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2.5 text-slate-300 hover:text-brand-red bg-slate-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MODERASI AKSES */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-brand-navy p-10 text-white flex justify-between items-center relative">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20"><Shield size={24} /></div>
                <div>
                   <h3 className="text-[20px] font-black tracking-tight uppercase italic leading-none">{editingUser ? 'EDIT AKSES USER' : 'BUAT AKSES BARU'}</h3>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">Moderasi Akun Petugas KKT</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username / ID Login</label>
                  <input required type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                  <input required={!editingUser} type="password" placeholder={editingUser ? "Kosongkan jika tetap" : "••••"} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role Jabatan</label>
                  <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px] appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.SEKURITI}>SEKURITI (LOBBY)</option>
                    <option value={UserRole.STAF}>PEGAWAI / STAF</option>
                    <option value={UserRole.ADMIN}>SUPER ADMIN</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Divisi / Unit</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WA Kontak</label>
                  <input type="text" placeholder="+62..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <input type="checkbox" id="user-active" className="w-6 h-6 accent-brand-navy rounded-lg" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <label htmlFor="user-active" className="text-[11px] font-black text-slate-600 uppercase tracking-widest cursor-pointer select-none">Berikan Izin Akses Login</label>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-brand-navy text-white py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 hover:bg-brand-dark transition-all active:scale-95">
                {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                SIMPAN KONFIGURASI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
