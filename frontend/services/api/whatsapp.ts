import { GuestEntry } from '../../types';

export const generateGuestMessage = (guest: GuestEntry) => {
  const baseUrl = window.location.origin + window.location.pathname;
  const approvalLink = `${baseUrl}?approval=${guest.id}`;
  
  if (guest.isGroup) {
    const totalAnggota = guest.groupMembers?.length || 0;
    const totalOrang = 1 + totalAnggota;
    const daftarAnggota = guest.groupMembers?.join(', ') || '-';

    return `NOTIFIKASI TAMU ROMBONGAN 
SECUREGATE

Halo Bapak/Ibu ${guest.penanggungJawab},
Tamu ROMBONGAN Anda telah tiba di Lobby (Total: ${totalOrang} Orang):

PJ Rombongan: ${guest.namaLengkap}
Anggota: ${daftarAnggota}
Asal: ${guest.asalInstansi || 'Pribadi'}
Keperluan: ${guest.keperluan}
Waktu: ${guest.jamMasuk} WITA

Mohon kesediaannya untuk memberikan konfirmasi melalui link di bawah ini:
${approvalLink}`;

  } else {
    return `NOTIFIKASI TAMU
SECUREGATE

Halo Bapak/Ibu ${guest.penanggungJawab},
Tamu Anda telah tiba di Lobby:

Nama: ${guest.namaLengkap}
Asal: ${guest.asalInstansi || 'Pribadi'}
Keperluan: ${guest.keperluan}
Waktu Tiba: ${guest.jamMasuk} WITA

Mohon segera berikan konfirmasi melalui link di bawah ini:
${approvalLink}

Terima Kasih.`;
  }
};

export const getManualWALink = (phone: string, message: string) => {
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '62' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('8')) {
    formattedPhone = '62' + formattedPhone;
  }
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

export const sendWAAuto = async (phone: string, message: string) => {
  return { success: true }; 
};
