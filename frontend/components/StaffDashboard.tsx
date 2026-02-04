import React, { useState, useEffect } from 'react';
import { GuestEntry, GuestStatus, Notification, VisitType } from '../types';
import { Check, Ban, MessageSquare, Clock, User, Building, MapPin, Search, LayoutDashboard, Target, Camera, CreditCard, Eye, X, FileText, AlertCircle } from 'lucide-react';
import { getDashboardSummary, getPendingGuests } from '../services/api/guests';

interface StaffDashboardProps {
  guests: GuestEntry[];
  notifications: Notification[];
  onAction: (guestId: string, status: GuestStatus, catatan: string, notifId?: string) => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ guests, notifications, onAction }) => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [selectedDoc, setSelectedDoc] = useState<{url: string, isPdf: boolean} | null>(null);
  const [summary, setSummary] = useState({ LOG: 0, IN: 0, OUT: 0 });
  
  const pendingRequests = guests.filter(g => g.status === GuestStatus.PENDING);

  // Fetch pending guests for staff dashboard
  useEffect(() => {
    const fetchPendingGuests = async () => {
      try {
        const pendingGuests = await getPendingGuests();
        // Update local state if needed, but we'll use the props for now
        console.log('Pending guests for dashboard:', pendingGuests);
      } catch (error) {
        console.error("Gagal memuat data pending:", error);
      }
    };
    fetchPendingGuests();
  }, []);

  // Fetch dashboard summary on mount and when guests change
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (error) {
        console.error("Gagal memuat ringkasan dashboard:", error);
      }
    };
    fetchSummary();
  }, [guests]);

  const getNotifId = (guestId: string) => {
    return notifications.find(n => n.guestId === guestId)?.id || '';
  };

  const handleActionClick = (guestId: string, status: GuestStatus, notifId: string) => {
    const note = notes[guestId]?.trim() || '';
    if (status === GuestStatus.DITOLAK && !note) {
      alert("Catatan/Alasan wajib diisi jika menolak tamu!");
      return;
    }
    onAction(guestId, status, note, notifId);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/90 z-[300] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setSelectedDoc(null)}>
          <div className="relative w-full max-w-4xl h-[80vh] bg-white p-2 rounded-[2rem]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedDoc(null)} className="absolute -top-10 right-0 text-white"><X size={24} /></button>
            {selectedDoc.isPdf ? (
              <iframe src={selectedDoc.url} className="w-full h-full rounded-xl border-none" />
            ) : (
              <img src={selectedDoc.url} className="w-full h-full object-contain rounded-xl" />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl">
          <LayoutDashboard className="mb-4 opacity-40" size={32} />
          <h3 className="text-[25px] font-black tracking-tighter">{summary.LOG}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Total Log</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
          <Check className="mb-4 text-emerald-500" size={32} />
          <h3 className="text-[25px] font-black tracking-tighter text-slate-900">{summary.IN}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-slate-400">Guests In Area</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
          <Clock className="mb-4 text-amber-500" size={32} />
          <h3 className="text-[25px] font-black tracking-tighter text-slate-900">{summary.OUT}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-slate-400">Guests Out</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-[18px] font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">Antrean Persetujuan Staf</h2>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{pendingRequests.length} Tamu</span>
        </div>

        <div className="p-8">
          {pendingRequests.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Belum ada permintaan masuk</div>
          ) : (
            <div className="space-y-6">
              {pendingRequests.map((guest) => (
                <div key={guest.id} className="bg-white border-2 border-slate-50 p-6 rounded-[2rem] hover:border-indigo-100 transition-all shadow-sm">
                   <div className="flex flex-col lg:flex-row justify-between gap-6">
                      <div className="flex-grow flex items-center gap-5">
                        <div className="h-16 w-16 bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md">
                            {guest.fotoTamu ? <img src={guest.fotoTamu} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-4 text-white" />}
                        </div>
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900">{guest.namaLengkap}</h3>
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">{guest.asalInstansi || 'Perorangan'}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">Keperluan: {guest.keperluan}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                         <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 w-full sm:w-64">
                            <MessageSquare size={14} className="text-slate-400" />
                            <input type="text" placeholder="Catatan/Alasan..." className="bg-transparent border-none outline-none text-[12px] w-full font-bold" value={notes[guest.id] || ''} onChange={(e) => setNotes({...notes, [guest.id]: e.target.value})} />
                         </div>
                         <div className="flex gap-2 w-full sm:w-auto">
                            <button onClick={() => handleActionClick(guest.id, GuestStatus.DIIZINKAN, getNotifId(guest.id))} className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">APPROVE</button>
                            <button onClick={() => handleActionClick(guest.id, GuestStatus.DITOLAK, getNotifId(guest.id))} className="flex-1 sm:flex-none bg-brand-red text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">REJECT</button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
