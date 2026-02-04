import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, UserRole } from '../types';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api/users';
import { Search, Phone, Building, User, Copy, Check, Loader2, Contact, UserPlus, X, Save, Briefcase, Edit2, Trash2, UserCheck } from 'lucide-react';

interface StaffDirectoryProps {
  role?: UserRole;
}

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ role }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // State untuk Modal (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    division: '',
    phoneNumber: '',
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getEmployees();
      // Menampilkan semua employee yang aktif
      setUsers(data.filter(u => u.isActive));
    } catch (error) {
      console.error("Gagal memuat direktori:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredStaff = useMemo(() => {
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.division && u.division.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ username: '', division: '', phoneNumber: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: UserAccount) => {
    setEditingId(staff.id);
    setFormData({
      username: staff.username,
      division: staff.division || '',
      phoneNumber: staff.phoneNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus pegawai ini dari direktori?")) {
      setIsLoading(true);
      try {
        await deleteEmployee(id);
        await loadUsers();
      } catch (error) {
        alert("Gagal menghapus data.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.division || !formData.phoneNumber) {
      alert("Mohon lengkapi semua data!");
      return;
    }

    setIsSaving(true);
    try {
      let result;
      if (editingId) {
        result = await updateEmployee(editingId, formData);
      } else {
        result = await createEmployee({
          ...formData,
          isActive: true
        } as any);
      }

      if (result.success) {
        setIsModalOpen(false);
        await loadUsers();
      }
    } catch (error) {
      console.error("Save staff error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = role === UserRole.ADMIN;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 h-full overflow-hidden relative">
      
      {/* MODAL TAMBAH/EDIT (ADMIN ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-brand-navy/90 backdrop-blur-md z-[500] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-brand-navy p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                  {editingId ? <Edit2 size={20} /> : <UserPlus size={20} />}
                </div>
                <h3 className="text-[18px] font-black tracking-tighter uppercase italic">
                  {editingId ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSaveStaff} className="p-10 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" 
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Divisi</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" 
                    value={formData.division} 
                    onChange={e => setFormData({...formData, division: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nomor WhatsApp</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="+628..."
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-navy outline-none font-bold text-[14px]" 
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})} 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSaving} 
                className="w-full bg-brand-navy text-white py-4 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 hover:bg-brand-dark transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                SIMPAN DATA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-1">
        <div className="relative flex-grow w-full max-w-xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama pegawai atau divisi..." 
            className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-100 focus:border-brand-navy outline-none font-bold text-[14px] shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button 
            onClick={handleOpenCreate}
            className="bg-brand-navy text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-brand-dark transition-all shadow-lg whitespace-nowrap"
          >
            <UserPlus size={18} /> TAMBAH PEGAWAI
          </button>
        )}
      </div>

      {/* TABLE VIEW (SERAGAM DENGAN USER MANAGEMENT) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">IDENTITAS PEGAWAI</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">DIVISI / UNIT KERJA</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">KONTAK WHATSAPP</th>
                {isAdmin && <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">AKSI KONTROL</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="py-20 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-navy" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</p>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="py-20 text-center text-slate-300 font-black uppercase text-[12px] tracking-widest">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-brand-navy/5 rounded-2xl flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <p className="font-black text-brand-navy text-[15px] leading-tight uppercase tracking-tight">{staff.username}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: {staff.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-slate-300" />
                        <p className="text-[13px] font-black text-slate-600 uppercase tracking-wide">{staff.division || 'UMUM'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col items-start">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mobile</p>
                          <span className="text-[13px] font-black text-slate-700 leading-none">{staff.phoneNumber || '---'}</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(staff.phoneNumber || '', staff.id)}
                          className="p-2 text-slate-300 hover:text-brand-navy hover:bg-white rounded-lg transition-all"
                          title="Salin Nomor"
                        >
                          {copiedId === staff.id ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleOpenEdit(staff)} 
                            className="p-2.5 text-slate-300 hover:text-brand-navy bg-slate-50 rounded-xl transition-all"
                            title="Edit Data"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(staff.id)} 
                            className="p-2.5 text-slate-300 hover:text-brand-red bg-slate-50 rounded-xl transition-all"
                            title="Hapus Pegawai"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDirectory;
