
import React, { useState, useMemo } from 'react';
import { GuestEntry, GuestStatus, UserRole } from '../types';
import { Search, X, User, ArrowUpRight, ArrowDownRight, FileSpreadsheet, FileText, CreditCard, LogOut, Trash2, Calendar, MessageSquare } from 'lucide-react';
import { generateGuestMessage, getManualWALink } from '../services/api/whatsapp';
// import { ASSET_BASE_URL } from '../services/api';

interface GuestListProps {
  guests: GuestEntry[];
  onCheckout: (id: string) => void;
  onDelete?: (id: string) => void;
  role?: UserRole;
  isSecurity?: boolean;
}

const GuestList: React.FC<GuestListProps> = ({ guests = [], onCheckout, onDelete, role, isSecurity }) => {
  const getLocalDate = () => {
    // Get today's date in YYYY-MM-DD format (local timezone)
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const todayStr = getLocalDate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(todayStr); // Default ke tanggal hari ini
  const [endDate, setEndDate] = useState(todayStr); // Default ke tanggal hari ini
  const [selectedDoc, setSelectedDoc] = useState<{url: string, title: string, isPdf: boolean} | null>(null);

  // Filter data secara lokal dari props guests
  const filteredGuests = useMemo(() => {
    if (!Array.isArray(guests)) return [];
    
    const filtered = guests.filter(g => {
      // Ambil tanggal dari field tanggal (format YYYY-MM-DD atau ISO string)
      const guestDate = g.tanggal ? g.tanggal.split('T')[0] : '';
      
      // Perbandingan tanggal (string format YYYY-MM-DD)
      const isInRange = (!startDate || !endDate || !guestDate) || (guestDate >= startDate && guestDate <= endDate);
      
      const matchesSearch = 
        g.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (g.asalInstansi && g.asalInstansi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (g.tujuan && g.tujuan.toLowerCase().includes(searchTerm.toLowerCase()));

      // Log untuk debug jika ada mismatch
      if (guestDate && startDate && endDate && !isInRange) {
        console.warn('Date mismatch:', { guestDate, startDate, endDate, name: g.namaLengkap });
      }

      return isInRange && matchesSearch;
    });
    
    console.log('Filtered guests:', { total: guests.length, filtered: filtered.length, startDate, endDate });
    return filtered;
  }, [guests, startDate, endDate, searchTerm]);

  // Hitung statistik secara lokal
  const dashboardStats = useMemo(() => {
    return {
      LOG: filteredGuests.length,
      IN: filteredGuests.filter(g => !g.jamKeluar && g.status === GuestStatus.DIIZINKAN).length,
      OUT: filteredGuests.filter(g => !!g.jamKeluar).length
    };
  }, [filteredGuests]);

  const handlePrintPdf = () => window.print();

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const handleExportExcel = () => {
    const headers = [
      'Tanggal', 
      'Tipe', 
      'Nama Tamu', 
      'Individu/Kelompok', 
      'Rombongan', 
      'Nomor HP', 
      'Instansi/Pribadi', 
      'NIK KTP', 
      'Nama Peg', 
      'Divisi', 
      'Keperluan', 
      'Jam Masuk', 
      'Jam Keluar',
      'Status'
    ];

    const rows = filteredGuests.map(g => [
      formatDate(g.tanggal),
      g.visitType,
      g.namaLengkap,
      g.isGroup ? 'KELOMPOK' : 'INDIVIDU',
      g.isGroup ? (g.groupMembers?.join('; ') || '-') : '-',
      g.nomorHp,
      g.asalInstansi || 'PRIBADI',
      g.nomorKtp || '-',
      g.penanggungJawab,
      g.divisi,
      g.keperluan,
      g.jamMasuk,
      g.jamKeluar || '-',
      g.status
    ]);

    // Menggunakan pemisah koma (,) dan membungkus dengan kutipan agar kolom terpisah dengan benar di Excel
    // Kita tambahkan UTF-8 BOM (\uFEFF) agar Excel mengenali karakter khusus dan delimiter
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `LOG_TAMU_KKT_${startDate}_${endDate}.csv`);
    link.click();
  };

  const handleSendNotification = (guest: GuestEntry) => {
    // Validasi nomor HP pegawai sebelum generate link
    if (!guest.nomorHpPegawai) {
      alert('Nomor HP pegawai tidak tersedia');
      return;
    }
    
    const message = generateGuestMessage(guest);
    const link = getManualWALink(guest.nomorHpPegawai, message);
    window.open(link, '_blank');
  };

  const formatAssetUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    // return `${ASSET_BASE_URL}${cleanPath}`;
  };

  const now = new Date();
  const printDateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}, ${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')} WITA`;

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in duration-700 overflow-hidden">
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[500] flex items-center justify-center p-6" onClick={() => setSelectedDoc(null)}>
           <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-[2rem] overflow-hidden p-2" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedDoc(null)} className="absolute top-4 right-4 text-slate-400 bg-white p-2 rounded-full shadow-lg hover:text-red-500 z-10 transition-colors"><X size={20} /></button>
              {selectedDoc.isPdf ? (
                <iframe src={selectedDoc.url} className="w-full h-full border-none rounded-2xl" />
              ) : (
                <img src={selectedDoc.url} className="w-full h-full object-contain rounded-2xl" />
              )}
           </div>
        </div>
      )}

      {/* PRINT LAYOUT (HIDDEN IN UI - VISIBLE IN PDF) */}
      <div id="full-log-print" className="hidden print:block p-10 bg-white font-sans text-slate-900 min-h-screen">
        <div className="flex justify-between items-start border-b-4 border-brand-navy pb-6 mb-8">
          <div>
            <h1 className="text-[32px] font-black text-brand-navy uppercase italic leading-none">SECUREGATE</h1>
            <p className="text-[14px] font-black text-slate-800 uppercase tracking-[0.2em] mt-2">LOG LAPORAN KUNJUNGAN TAMU DIGITAL</p>
          </div>
          <div className="text-right">
            <h2 className="text-[18px] font-black text-brand-navy uppercase italic">KALTIM KARIANGAU TERMINAL</h2>
            <p className="text-[11px] font-bold text-slate-500 italic">Handal, Tepat waktu dan Efisien</p>
            <p className="text-[10px] font-black text-slate-800 mt-4 uppercase tracking-tighter">DICETAK: {printDateStr}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-300 text-[9px]">
          <thead className="bg-slate-50 uppercase">
            <tr>
              <th className="border px-2 py-3 w-[30px]">NO</th>
              <th className="border px-2 py-3 w-[90px]">TANGGAL / WAKTU</th>
              <th className="border px-2 py-3">NAMA TAMU</th>
              <th className="border px-2 py-3 w-[100px]">NIK</th>
              <th className="border px-2 py-3">INSTANSI</th>
              <th className="border px-2 py-3">KEPERLUAN</th>
              <th className="border px-2 py-3 w-[100px]">TUJUAN</th>
              <th className="border px-2 py-3 w-[80px]">STATUS</th>
              <th className="border px-2 py-3 w-[70px]">K3/IZIN</th>
              <th className="border px-2 py-3 w-[70px]">UNDANGAN</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((g, i) => (
              <tr key={g.id}>
                <td className="border px-2 py-2 text-center">{i + 1}</td>
                <td className="border px-2 py-2">
                  <p className="font-bold">{formatDate(g.tanggal)}</p>
                  <p className="text-emerald-600 font-bold">IN: {g.jamMasuk || '--:--'}</p>
                  <p className="text-red-500 font-bold">OUT: {g.jamKeluar || '--:--'}</p>
                </td>
                <td className="border px-2 py-2 font-bold uppercase">{g.namaLengkap}</td>
                <td className="border px-2 py-2 font-mono">{g.nomorKtp || '-'}</td>
                <td className="border px-2 py-2 uppercase text-[8px]">{g.asalInstansi || 'PERORANGAN'}</td>
                <td className="border px-2 py-2 italic">"{g.keperluan}"</td>
                <td className="border px-2 py-2 font-bold uppercase">{g.tujuan}</td>
                <td className="border px-2 py-2 text-center">
                  <span className="font-black uppercase text-[8px]">{g.status}</span>
                </td>
                <td className="border px-2 py-2 text-center font-bold">
                  {g.k3Pdf ? 'ADA' : '-'}
                </td>
                <td className="border px-2 py-2 text-center font-bold">
                  {g.suratUndangan ? 'ADA' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 flex justify-end">
          <div className="text-center w-64 border-t-2 border-slate-300 pt-3">
            <p className="text-[12px] font-black uppercase">PETUGAS KEAMANAN</p>
            <div className="h-24" />
            <p className="text-[11px] font-bold text-slate-400 italic">( Nama Lengkap & Stempel )</p>
          </div>
        </div>
      </div>

      {/* STATS AREA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0 print:hidden">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">TOTAL LOG</p>
            <h4 className="text-[42px] font-black text-brand-navy leading-none">{dashboardStats.LOG}</h4>
          </div>
          <div className="bg-slate-50 p-5 rounded-[1.5rem] text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-all">
            <FileSpreadsheet size={32} />
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">DI DALAM AREA</p>
            <h4 className="text-[42px] font-black text-emerald-600 leading-none">{dashboardStats.IN}</h4>
          </div>
          <div className="bg-emerald-50 p-5 rounded-[1.5rem] text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <ArrowUpRight size={32} />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">TELAH KELUAR</p>
            <h4 className="text-[42px] font-black text-red-500 leading-none">{dashboardStats.OUT}</h4>
          </div>
          <div className="bg-red-50 p-5 rounded-[1.5rem] text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
            <ArrowDownRight size={32} />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col xl:flex-row gap-4 mb-6 shrink-0 print:hidden items-center px-1">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau instansi..." 
            className="w-full pl-14 pr-6 py-4 bg-white rounded-full border border-slate-100 focus:border-brand-navy outline-none font-bold text-[14px] shadow-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex gap-4">
          <div className="relative flex items-center">
            <Calendar className="absolute left-4 text-slate-300" size={16} />
            <input type="date" className="bg-white pl-10 pr-4 py-3.5 rounded-2xl border border-slate-100 font-black text-[11px] text-brand-navy outline-none shadow-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="relative flex items-center">
            <Calendar className="absolute left-4 text-slate-300" size={16} />
            <input type="date" className="bg-white pl-10 pr-4 py-3.5 rounded-2xl border border-slate-100 font-black text-[11px] text-brand-navy outline-none shadow-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button onClick={handlePrintPdf} className="bg-brand-navy text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-dark shadow-lg">PDF</button>
          <button onClick={handleExportExcel} className="bg-white border border-slate-100 text-brand-navy px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">EXCEL</button>
        </div>
        {/* DEBUG INFO */}
        <div className="text-[8px] text-slate-400 ml-auto print:hidden">
          <span>Filter: {startDate} → {endDate} | Total: {guests.length} | Hasil: {filteredGuests.length}</span>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="flex-grow bg-white rounded-t-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative mt-4 print:hidden">
        <div className="overflow-auto flex-grow">
          <table className="w-full text-left border-collapse min-w-[1500px] table-fixed">
            <thead className="bg-brand-navy text-white sticky top-0 z-10">
              <tr>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest w-[160px]">WAKTU</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest w-[250px]">PROFIL TAMU</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest w-[180px]">TUJUAN</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest w-[200px]">KEPERLUAN</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest w-[180px]">CATATAN STAF</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-center w-[150px]">DOKUMEN</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-center w-[140px]">STATUS</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-center w-[220px]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr><td colSpan={8} className="py-32 text-center text-slate-300 font-black uppercase text-[12px] tracking-[0.3em]">Tidak ada data kunjungan ditemukan</td></tr>
              ) : (
                filteredGuests.map(guest => (
                  <tr key={guest.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-6 align-top">
                      <p className="text-[14px] font-black text-brand-navy italic">IN: {guest.jamMasuk || '---'}</p>
                      <p className="text-[12px] font-bold text-red-500">OUT: {guest.jamKeluar || '---'}</p>
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase">{formatDate(guest.tanggal)}</p>
                    </td>
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner flex items-center justify-center border border-slate-200">
                          {formatAssetUrl(guest.fotoTamu) ? (
                            <img src={formatAssetUrl(guest.fotoTamu)!} className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} className="text-slate-300" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="font-black text-slate-800 text-[15px] uppercase truncate tracking-tight">{guest.namaLengkap}</p>
                          <p className="text-[10px] font-bold text-brand-navy uppercase truncate italic mt-0.5">{guest.asalInstansi || 'Perorangan'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top">
                      <p className="font-black text-slate-800 text-[13px] uppercase truncate">{guest.tujuan || '---'}</p>
                    </td>
                    <td className="px-8 py-6 align-top">
                      <p className="text-[11px] text-slate-500 italic leading-snug font-medium line-clamp-2">"{guest.keperluan}"</p>
                    </td>
                    <td className="px-8 py-6 align-top">
                       <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 min-h-[48px] flex items-center">
                          <p className="text-[11px] text-slate-500 italic font-bold leading-relaxed">{guest.catatan || '---'}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6 align-top text-center">
                      <div className="flex justify-center gap-2">
                        {guest.fotoKTP && (
                          <button onClick={() => setSelectedDoc({url: formatAssetUrl(guest.fotoKTP)!, title: 'KTP', isPdf: false})} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-navy hover:bg-white rounded-lg transition-all shadow-sm">
                            <CreditCard size={18} />
                          </button>
                        )}
                        {guest.k3Pdf && (
                          <button onClick={() => setSelectedDoc({ url: formatAssetUrl(guest.k3Pdf)!, title: 'K3 PDF', isPdf: true })} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-navy hover:bg-white rounded-lg transition-all shadow-sm">
                            <FileText size={18} />
                          </button>
                        )}
                        {guest.suratUndangan && (
                          <button onClick={() => setSelectedDoc({ url: formatAssetUrl(guest.suratUndangan)!, title: 'Undangan', isPdf: false })} className="p-2.5 bg-slate-50 text-slate-400 hover:text-brand-navy hover:bg-white rounded-lg transition-all shadow-sm">
                            <FileText size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 align-top text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest shadow-sm ${
                        guest.status === GuestStatus.DIIZINKAN ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        guest.status === GuestStatus.DITOLAK ? 'bg-red-50 text-red-500 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 align-top">
                      <div className="flex items-center justify-center gap-2">
                        {isSecurity && guest.status === GuestStatus.PENDING && (
                          <button onClick={() => handleSendNotification(guest)} className="bg-brand-navy text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-brand-dark shadow-lg flex items-center gap-2 transition-all">
                            <MessageSquare size={14} /> KIRIM KE STAF
                          </button>
                        )}
                        {isSecurity && guest.status === GuestStatus.DIIZINKAN && !guest.jamKeluar && (
                          <button onClick={() => onCheckout(guest.id)} className="bg-brand-red text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase hover:bg-red-700 shadow-xl flex items-center gap-2 transition-all">
                            <LogOut size={14} /> CHECKOUT
                          </button>
                        )}
                        {onDelete && (role === UserRole.ADMIN) && (
                          <button onClick={() => onDelete(guest.id)} className="text-slate-200 hover:text-brand-red p-2.5 transition-colors">
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
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

export default GuestList;