import React, { useState, useEffect } from 'react';
import { GuestEntry, GuestStatus, VisitType } from '../types';
import { getGuests, getPendingGuests } from '../services/api/guests';
import { Check, Ban, MessageSquare, Clock, User, Building, Target, Users, X, Info, AlertTriangle, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface StaffApprovalViewProps {
  guest: GuestEntry | undefined;
  onAction: (guestId: string, status: GuestStatus, catatan: string) => void;
}

const StaffApprovalView: React.FC<StaffApprovalViewProps> = ({ guest, onAction }) => {
  const [note, setNote] = useState('');
  const [localGuest, setLocalGuest] = useState<GuestEntry | undefined>(guest);
  const [showDoc, setShowDoc] = useState<{url: string, title: string} | null>(null);
  const [isSearching, setIsSearching] = useState(!guest);

  useEffect(() => {
    const fetchSpecificGuest = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('approval');
      
      if (!guest && id) {
        setIsSearching(true);
        try {
          // Gunakan endpoint pending guests untuk approval
          const pendingGuests = await getPendingGuests();
          const found = pendingGuests.find((g: any) => String(g.id) === String(id));
          if (found) setLocalGuest(found);
        } catch (e) {
          console.error("Gagal memuat data", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLocalGuest(guest);
        setIsSearching(false);
      }
    };

    fetchSpecificGuest();
  }, [guest]);
  
  if (isSearching) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Loader2 className="animate-spin text-brand-navy mx-auto mb-4" size={48} />
        <h2 className="text-[18px] font-black text-brand-navy uppercase tracking-widest">Mencari Data...</h2>
      </div>
    );
  }

  if (!localGuest) {
    return (
      <div className="max-w-xl w-full mx-auto px-4 mt-16 animate-in zoom-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-2xl text-center overflow-hidden border-t-[10px] border-brand-red relative">
           <div className="p-12 flex flex-col items-center">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-8">
                 <AlertTriangle size={40} className="text-brand-red" strokeWidth={2.5} />
              </div>
              <h2 className="text-[22px] font-[900] text-brand-navy tracking-tight uppercase mb-4">DATA TIDAK DITEMUKAN</h2>
              <p className="text-slate-500 text-[14px] font-bold leading-relaxed mb-10">Link persetujuan tidak valid atau data telah terhapus dari perangkat ini.</p>
              <button onClick={() => window.location.href = window.location.origin + window.location.pathname} className="w-full py-4 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">KEMBALI KE BERANDA</button>
           </div>
        </div>
      </div>
    );
  }

  const handleActionClick = (status: GuestStatus) => {
    if (status === GuestStatus.DITOLAK && !note.trim()) {
      alert("Alasan penolakan wajib diisi!");
      return;
    }
    onAction(localGuest.id, status, note);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-w-2xl w-full mx-auto border border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-700 mt-6">
      {showDoc && (
        <div className="fixed inset-0 bg-brand-navy/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6" onClick={() => setShowDoc(null)}>
           <div className="relative w-full max-w-4xl h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowDoc(null)} className="absolute -top-10 right-0 text-white bg-white/10 p-2 rounded-full"><X size={20} /></button>
              <div className="bg-white w-full h-[75vh] rounded-2xl shadow-2xl overflow-hidden p-2">
                 {showDoc.url.startsWith('data:application/pdf') ? (
                   <iframe src={showDoc.url} className="w-full h-full border-none rounded-xl" title={showDoc.title} />
                 ) : (
                   <img src={showDoc.url} className="w-full h-full object-contain rounded-xl" alt={showDoc.title} />
                 )}
              </div>
           </div>
        </div>
      )}

      <div className="bg-brand-navy p-10 text-white text-center">
         <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
            <Target size={32} className="text-white" />
         </div>
         <h2 className="text-[20px] font-black tracking-tighter italic">Persetujuan Kedatangan Tamu</h2>
         <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.4em] mt-2">SECUREGATE KKT PEGAWAI</p>
      </div>

      <div className="p-10 space-y-8">
         <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="h-32 w-32 rounded-[1.5rem] bg-slate-100 border-2 border-slate-100 overflow-hidden shadow-lg shrink-0">
               {localGuest.fotoTamu ? <img src={localGuest.fotoTamu} className="w-full h-full object-cover" /> : <User size={48} className="m-auto mt-8 text-slate-300" />}
            </div>
            <div className="flex-grow space-y-3 pt-1">
               <h3 className="text-[22px] font-black text-brand-navy tracking-tight">{localGuest.namaLengkap}</h3>
               <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${localGuest.visitType === VisitType.VENDOR ? 'bg-red-50 text-brand-red border border-red-100' : 'bg-blue-50 text-brand-navy border border-blue-100'}`}>{localGuest.visitType}</span>
                  {localGuest.isGroup && <span className="bg-emerald-50 text-brand-green border border-emerald-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Users size={10} /> ROMBONGAN</span>}
               </div>
               <p className="text-[13px] font-bold text-slate-600 flex items-center justify-center md:justify-start gap-2"><Building size={16} className="text-slate-400" /> {localGuest.asalInstansi || 'Perorangan'}</p>
               <p className="text-[13px] font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2 italic">"{localGuest.keperluan}"</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
               <Clock size={20} className="text-amber-500" />
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Waktu Tiba</p>
                  <p className="text-[14px] font-black text-slate-900">{localGuest.jamMasuk} WITA</p>
               </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
               <Target size={20} className="text-brand-navy" />
               <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tujuan</p>
                  <p className="text-[14px] font-black text-slate-900">{localGuest.penanggungJawab}</p>
               </div>
            </div>
         </div>

         <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><MessageSquare size={14} /> Pesan / Instruksi Staf *</label>
            <textarea className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-brand-navy focus:bg-white transition-all outline-none font-bold text-[13px]" rows={3} placeholder="Instruksi tambahan..." value={note} onChange={(e) => setNote(e.target.value)} />
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button onClick={() => handleActionClick(GuestStatus.DIIZINKAN)} className="bg-brand-green text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"><Check size={20} /> IZINKAN</button>
            <button onClick={() => handleActionClick(GuestStatus.DITOLAK)} className="bg-white border-2 border-slate-100 text-slate-400 hover:text-brand-red py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-3"><Ban size={20} /> TOLAK</button>
         </div>
      </div>
    </div>
  );
};

export default StaffApprovalView;
