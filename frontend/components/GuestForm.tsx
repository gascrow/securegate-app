import React, { useState, useRef } from 'react';
import { GuestStatus, UserRole, GuestEntry, VisitType } from '../types';
import CameraCapture from './CameraCapture';
import { User, Building, Phone, CreditCard, Target, MapPin, Info, ChevronRight, Users, Upload, ClipboardList, Smartphone, X, HardHat, FileText, Trash2, Check, Briefcase } from 'lucide-react';

interface GuestFormProps {
  onSubmit: (entry: Omit<GuestEntry, 'id' | 'jamKeluar' | 'status'>) => void;
  role: UserRole;
}

const GuestForm: React.FC<GuestFormProps> = ({ onSubmit, role }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // PERBAIKAN BARIS 17-21: Manual YYYY-MM-DD (Paling Akurat)
  const getLocalDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    tanggal: getLocalDate(), // PERBAIKAN BARIS 23
    visitType: VisitType.UMUM,
    isGroup: false,

    groupMembers: [] as string[],
    currentMember: '',
    namaLengkap: '',
    asalInstansi: '',
    keperluan: '',
    nomorHp: '',
    nomorKtp: '',
    fotoTamu: '',
    fotoKTP: '',
    suratUndangan: '',
    k3Pdf: '',
    tujuan: '', 
    divisi: '',
    nomorHpPJ: '', 
    lokasiPekerjaan: '',
    deskripsiPekerjaan: '',
    jamMasuk: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (field: 'nomorHp' | 'nomorHpPJ', value: string) => {
    let clean = value.replace(/[^+0-9]/g, '');
    if (!clean.startsWith('+62') && clean.length > 0) {
      if (clean.startsWith('0')) clean = clean.slice(1);
      clean = '+62' + clean;
    }
    setFormData(prev => ({ ...prev, [field]: clean }));
  };

  const addMember = () => {
    if (formData.currentMember.trim()) {
      setFormData({
        ...formData,
        groupMembers: [...formData.groupMembers, formData.currentMember.trim()],
        currentMember: ''
      });
    }
  };

  const removeMember = (index: number) => {
    const updated = [...formData.groupMembers];
    updated.splice(index, 1);
    setFormData({ ...formData, groupMembers: updated });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (formData.visitType === VisitType.VENDOR) {
          setFormData({ ...formData, k3Pdf: reader.result as string });
        } else {
          setFormData({ ...formData, suratUndangan: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.namaLengkap.trim()) newErrors.namaLengkap = 'Wajib diisi';
    if (!formData.asalInstansi.trim()) newErrors.asalInstansi = 'Wajib diisi';
    if (!formData.nomorHp.trim() || formData.nomorHp === '+62') newErrors.nomorHp = 'Wajib diisi';
    if (!formData.nomorKtp.trim() || formData.nomorKtp.length < 16) newErrors.nomorKtp = 'NIK 16 Digit';
    if (!formData.tujuan.trim()) newErrors.tujuan = 'Wajib diisi';
    if (!formData.divisi.trim()) newErrors.divisi = 'Wajib diisi';
    if (!formData.nomorHpPJ.trim() || formData.nomorHpPJ === '+62') newErrors.nomorHpPJ = 'Wajib diisi';
    if (!formData.keperluan.trim()) newErrors.keperluan = 'Wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ ...formData, penanggungJawab: formData.tujuan });
    }
  };

  const labelClasses = "text-[10px] font-black text-[#00339a] uppercase tracking-widest flex items-center gap-2 mb-3 px-1";
  const inputClasses = (error?: string) => `w-full px-5 py-4 rounded-xl border border-slate-200 transition-all outline-none text-[13px] font-bold bg-[#f8fafc] text-slate-700 placeholder:text-slate-300 focus:border-[#00339a] focus:bg-white shadow-sm`;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      <div className="bg-[#00339a] w-full pt-12 pb-24 rounded-b-[4.5rem] flex flex-col items-center">
        <div className="w-full max-w-4xl px-8 flex items-center gap-6">
          <div className="h-16 w-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center shadow-lg shrink-0">
            <ClipboardList size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[24px] md:text-[32px] font-black italic tracking-tighter text-white uppercase leading-none">
              BUKU TAMU DIGITAL
            </h1>
            <p className="text-[9px] md:text-[11px] font-bold text-white/40 uppercase tracking-[0.5em] mt-3">
              LOBBY KALTIM KARIANGAU TERMINAL
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-16 px-4 md:px-0">
        <form onSubmit={handleSubmit} className="bg-white px-8 py-10 md:px-8 md:py-14 space-y-16 rounded-[4rem] shadow-2xl border border-white relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button type="button" onClick={() => setFormData({...formData, visitType: VisitType.UMUM})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center ${formData.visitType === VisitType.UMUM ? 'bg-[#00339a] text-white shadow-lg' : 'text-slate-400 hover:text-[#00339a]'}`}>
                <User size={14} /> TAMU UMUM
              </button>
              <button type="button" onClick={() => setFormData({...formData, visitType: VisitType.VENDOR})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center ${formData.visitType === VisitType.VENDOR ? 'bg-[#00339a] text-white shadow-lg' : 'text-slate-400 hover:text-[#00339a]'}`}>
                <Building size={14} /> VENDOR
              </button>
            </div>

            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <button type="button" onClick={() => setFormData({...formData, isGroup: false})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center ${!formData.isGroup ? 'bg-[#00339a] text-white shadow-lg' : 'text-slate-400 hover:text-[#00339a]'}`}>
                <User size={14} /> INDIVIDU
              </button>
              <button type="button" onClick={() => setFormData({...formData, isGroup: true})} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center ${formData.isGroup ? 'bg-[#00339a] text-white shadow-lg' : 'text-slate-400 hover:text-[#00339a]'}`}>
                <Users size={14} /> ROMBONGAN
              </button>
            </div>
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h4 className="text-[14px] font-black text-[#00339a] uppercase tracking-[0.2em] italic shrink-0">IDENTITAS TAMU</h4>
              <div className="h-[1px] bg-slate-100 grow"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <CameraCapture label="FOTO WAJAH" onCapture={(img) => setFormData({...formData, fotoTamu: img})} />
              <CameraCapture label="FOTO KTP / ID CARD" onCapture={(img) => setFormData({...formData, fotoKTP: img})} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-1">
                <label className={labelClasses}><User size={14} /> NAMA LENGKAP TAMU</label>
                <input type="text" className={inputClasses(errors.namaLengkap)} placeholder="Nama sesuai KTP" value={formData.namaLengkap} onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Building size={14} /> ASAL INSTANSI / PERUSAHAAN</label>
                <input type="text" className={inputClasses(errors.asalInstansi)} placeholder="Nama perusahaan asal" value={formData.asalInstansi} onChange={(e) => setFormData({ ...formData, asalInstansi: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Phone size={14} /> NOMOR AKTIF</label>
                <input type="text" className={inputClasses(errors.nomorHp)} placeholder="+628..." value={formData.nomorHp} onChange={(e) => handlePhoneChange('nomorHp', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><CreditCard size={14} /> NIK KTP</label>
                <input type="text" maxLength={16} className={inputClasses(errors.nomorKtp)} placeholder="16 digit NIK" value={formData.nomorKtp} onChange={(e) => setFormData({ ...formData, nomorKtp: e.target.value.replace(/[^0-9]/g, '') })} />
              </div>
            </div>

            {formData.isGroup && (
              <div className="bg-[#f8fafc] p-8 md:p-10 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-[#00339a]" />
                    <h5 className="text-[11px] font-black text-[#00339a] uppercase tracking-widest">DAFTAR ANGGOTA</h5>
                  </div>
                  <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400">
                    {formData.groupMembers.length} Peserta
                  </span>
                </div>
                
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Ketik nama anggota..." 
                    className="flex-grow px-6 py-4 bg-white rounded-2xl border border-slate-100 focus:border-[#00339a] outline-none text-[13px] font-bold shadow-sm transition-all"
                    value={formData.currentMember}
                    onChange={(e) => setFormData({...formData, currentMember: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  />
                  <button type="button" onClick={addMember} className="bg-[#00339a] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#002673] shadow-lg">
                    TAMBAH
                  </button>
                </div>

                {formData.groupMembers.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    {formData.groupMembers.map((name, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-slate-50 flex items-center justify-between group shadow-sm hover:border-blue-100">
                        <span className="text-[12px] font-bold text-slate-600">{idx + 1}. {name}</span>
                        <button type="button" onClick={() => removeMember(idx)} className="text-slate-300 hover:text-red-500 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h4 className="text-[14px] font-black text-[#00339a] uppercase tracking-[0.2em] italic shrink-0">KONFIRMASI PEGAWAI</h4>
              <div className="h-[1px] bg-slate-100 grow"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              <div className="space-y-1">
                <label className={labelClasses}><Target size={14} /> PEGAWAI YANG DITUJU</label>
                <input type="text" className={inputClasses(errors.tujuan)} placeholder="Input nama pegawai KKT" value={formData.tujuan} onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Building size={14} /> DIVISI / UNIT KERJA</label>
                <input type="text" className={inputClasses(errors.divisi)} placeholder="Input divisi pegawai" value={formData.divisi} onChange={(e) => setFormData({ ...formData, divisi: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Smartphone size={14} /> WHATSAPP PEGAWAI</label>
                <input type="text" className={inputClasses(errors.nomorHpPJ)} placeholder="+628..." value={formData.nomorHpPJ} onChange={(e) => handlePhoneChange('nomorHpPJ', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className={labelClasses}><Info size={14} /> KEPERLUAN</label>
                <input type="text" className={inputClasses(errors.keperluan)} placeholder="Contoh: Meeting Proyek, Audit, dsb." value={formData.keperluan} onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })} />
              </div>
            </div>
          </div>

          {formData.visitType === VisitType.VENDOR && (
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <h4 className="text-[14px] font-black text-[#00339a] uppercase tracking-[0.2em] italic shrink-0">DETAIL PEKERJAAN</h4>
                <div className="h-[1px] bg-slate-100 grow"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="space-y-1">
                  <label className={labelClasses}><MapPin size={14} /> LOKASI PENGERJAAN</label>
                  <input type="text" className={inputClasses()} placeholder="Contoh: Site Dermaga, Gudang" value={formData.lokasiPekerjaan} onChange={(e) => setFormData({ ...formData, lokasiPekerjaan: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelClasses}><HardHat size={14} /> JENIS PEKERJAAN</label>
                  <input type="text" className={inputClasses()} placeholder="Contoh: Maintenance, Sipil" value={formData.deskripsiPekerjaan} onChange={(e) => setFormData({ ...formData, deskripsiPekerjaan: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
             <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#00339a]" />
                <label className="text-[10px] font-black text-[#00339a] uppercase tracking-widest">
                   {formData.visitType === VisitType.VENDOR ? 'DOKUMEN K3 / IZIN KERJA' : 'SURAT PENGANTAR / UNDANGAN'}
                </label>
             </div>
             
             <div onClick={() => fileInputRef.current?.click()} className="w-full py-16 border-2 border-dashed border-slate-100 rounded-[3rem] bg-[#f8fafc] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-[#00339a] transition-all group shadow-inner">
                <div className={`p-8 rounded-full ${((formData.visitType === VisitType.VENDOR && formData.k3Pdf) || (formData.visitType === VisitType.UMUM && formData.suratUndangan)) ? 'bg-emerald-500 text-white' : 'bg-white text-slate-200 shadow-md'}`}>
                   {((formData.visitType === VisitType.VENDOR && formData.k3Pdf) || (formData.visitType === VisitType.UMUM && formData.suratUndangan)) ? <Check size={40} /> : <Upload size={40} />}
                </div>
                <div className="text-center">
                   <p className="text-[16px] font-black text-[#00339a] uppercase tracking-widest">
                      {((formData.visitType === VisitType.VENDOR && formData.k3Pdf) || (formData.visitType === VisitType.UMUM && formData.suratUndangan)) ? 'BERKAS TERPILIH' : (formData.visitType === VisitType.VENDOR ? 'UNGGAH DOKUMEN K3' : 'UNGGAH SURAT')}
                   </p>
                   <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">PDF / JPG / PNG (MAKSIMAL 5MB)</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
             </div>
          </div>

          <button type="submit" className="w-full bg-[#00339a] hover:bg-[#002673] text-white py-6 rounded-3xl font-black text-[16px] uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-4 group">
            DAFTARKAN KUNJUNGAN <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestForm;
