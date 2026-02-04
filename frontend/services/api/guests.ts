import api from "./index";
import { GuestEntry } from "@/types";

// Fetch all guests for admin dashboard with optional date filter
export const getGuests = async (startDate?: string, endDate?: string) => {
  console.log('Fetching guests from /dashboard/list-guest', { startDate, endDate });
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const url = `/dashboard/list-guest${params.toString() ? '?' + params.toString() : ''}`;
  const res = await api.get(url);
  console.log('Guests response:', res.data);
  return res.data.data;
};

// Fetch dashboard summary (LOG, IN, OUT counts)
export const getDashboardSummary = async () => {
  const res = await api.get("/dashboard");
  return res.data.data;
};

// Create new guest (with text + optional files handled in FormData)
export const createGuest = async (data: Partial<GuestEntry>) => {
  const res = await api.post("/guests/public", data);
  return res.data;
};

// Approve or reject guest (for staff approval)
export const approveGuest = async (id: string, status: string, catatan: string) => {
  const res = await api.post("/konfirmasi-staf", { id, status, catatan });
  return res.data;
};

// Fetch guests for dashboard (includes PENDING, DIIZINKAN, and logged guests)
export const getDashboardGuests = async () => {
  const res = await api.get("/dashboard/list-guest");
  return res.data.data;
};

// Fetch pending guests for staff approval
export const getPendingGuests = async () => {
  console.log('Fetching pending guests from /konfirmasi-staf/list-guest');
  const res = await api.get("/konfirmasi-staf/list-guest");
  console.log('Pending guests response:', res.data);
  return res.data.data;
};

// Update existing guest (checkout - only update jamKeluar)
export const updateGuest = async (id: string, data: Partial<GuestEntry>) => {
  // Format jamKeluar ke HH:mm untuk memenuhi validasi backend
  const formatTime = (timeString: string) => {
    // Jika sudah format HH:mm, return as is
    if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString)) {
      return timeString;
    }
    // Jika dari toLocaleTimeString, extract HH:mm
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      const hour = match[1].padStart(2, '0');
      const minute = match[2];
      return `${hour}:${minute}`;
    }
    // Fallback: buat format baru
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const jamKeluar = data.jamKeluar 
    ? formatTime(data.jamKeluar) 
    : (() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      })();

  const res = await api.post(`/dashboard/checkout`, { 
    id, 
    jamKeluar,
    status: data.status
  });
  return res.data;
};

// Delete guest
export const deleteGuest = async (id: string) => {
  const res = await api.delete(`/guests/${id}`);
  return res.data;
};