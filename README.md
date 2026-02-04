# README - SecureGate KKT

Panduan instalasi dan penggunaan aplikasi **SecureGate** - Sistem Informasi Tamu Digital untuk PT Kaltim Kariangau Terminal.

## 📋 Daftar Isi
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Folder](#struktur-folder)
- [Fitur Utama](#fitur-utama)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prasyarat

Sebelum memulai, pastikan sudah install:

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** v9+ (biasanya sudah tersedia dengan Node.js)
- **MySQL** v8+ ([download](https://www.mysql.com/downloads/))
- **Git** ([download](https://git-scm.com/))

Verifikasi instalasi:
```bash
node --version
npm --version
mysql --version
```

---

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone https://github.com/gascrow/securegate-app.git
cd securegate-app
```

### 2. Setup Database

#### a. Buat Database MySQL
```bash
mysql -u root -p
```

Di dalam MySQL console:
```sql
SOURCE backend/db.sql;
EXIT;
```

Atau copy-paste seluruh isi file `backend/db.sql` ke MySQL client.

#### b. Verifikasi Database
```bash
mysql -u root -p securegate -e "SHOW TABLES;"
```

Seharusnya ada tabel: `employees`, `guests`, `users`

---

## ⚙️ Konfigurasi

### 1. Setup Backend

#### a. Navigasi ke folder backend
```bash
cd backend
```

#### b. Install dependencies
```bash
npm install
```

#### c. Buat file `.env`
```bash
cp .env.example .env
# Atau buat manual file .env dengan isi berikut:
```

**Isi `backend/.env`:**
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=securegate
JWT_SECRET=rahasia_super_sulit
PORT=5000
```

> **⚠️ Penting**: Sesuaikan `DB_USER`, `DB_PASSWORD`, dan `DB_HOST` dengan konfigurasi MySQL Anda.

#### d. Generate Token Admin (Opsional)
```bash
node generateToken.js
```

Catat token yang dihasilkan untuk testing API.

---

### 2. Setup Frontend

#### a. Navigasi ke folder frontend
```bash
cd ../frontend
```

#### b. Install dependencies
```bash
npm install
```

#### c. Konfigurasi API (jika diperlukan)

Edit `frontend/services/api/index.ts`:
```typescript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});
```

---

## 🚀 Menjalankan Aplikasi

### Opsi 1: Development Mode (Recommended)

#### Terminal 1 - Jalankan Backend
```bash
cd backend
npm run dev
# Server akan berjalan di http://localhost:5000
```

#### Terminal 2 - Jalankan Frontend
```bash
cd frontend
npm run dev
# Aplikasi akan berjalan di http://localhost:5173
# Browser akan otomatis membuka halaman
```

### Opsi 2: Production Build

#### Build Frontend
```bash
cd frontend
npm run build
# Output akan di folder `dist/`
```

#### Run Backend (Production)
```bash
cd backend
npm start
```

---

## 📂 Struktur Folder

```
securegate-app/
├── backend/
│   ├── db.sql                 # Schema database
│   ├── server.js              # Express server
│   ├── generateToken.js       # JWT token generator
│   ├── package.json
│   ├── .env                   # Konfigurasi (create manually)
│   └── uploads/
│       └── tamu/              # Folder tempat menyimpan file uploads
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── index.tsx          # Entry point
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── components/        # React components
│   │   └── services/
│   │       └── api/           # API integration
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
└── README.md
```

---

## ✨ Fitur Utama

### 👥 Roles & Permissions

| Role | Akses |
|------|-------|
| **TAMU (Guest)** | Buku tamu, input data, foto, dokumen |
| **SEKURITI (Security)** | Dashboard, approve/reject, QR code, checkout |
| **STAF (Staff)** | Notifikasi persetujuan tamu |
| **ADMIN** | Semua fitur + manajemen user & pegawai |

### 🎯 Fitur Aplikasi

- ✅ **Buku Tamu Digital** - Input data tamu dengan foto & dokumen
- ✅ **QR Code Registration** - Scan untuk pendaftaran mandiri
- ✅ **Approval System** - Persetujuan via WhatsApp
- ✅ **Dashboard Monitoring** - Real-time tracking guest
- ✅ **Staff Directory** - Database pegawai KKT
- ✅ **User Management** - Kontrol akses login
- ✅ **Checkout System** - Tracking waktu keluar
- ✅ **Export Reports** - CSV & PDF

---

## 🔐 Login Default

Setelah install database, buat user pertama:

```bash
cd backend
node generateToken.js
```

Atau langsung query:

```sql
INSERT INTO users (username, password, role, division, isActive, createdAt)
VALUES ('admin', '$2b$10$...', 'ADMIN', 'Direktorat', 1, NOW());
```

> Password default bisa di-set manual atau gunakan script di `backend/generateToken.js`

---

## 📝 API Endpoints

### Authentication
```
POST   /api/login                      # Login user
GET    /api/profile                    # Get user profile
POST   /api/logout                     # Logout
```

### Guests
```
POST   /api/guests                     # Create guest (authenticated)
POST   /api/guests/public              # Create guest (public)
GET    /api/guests                     # List guests
GET    /api/dashboard/list-guest       # Get guest list
POST   /api/dashboard/checkout         # Checkout guest
POST   /api/dashboard/delete-guest     # Delete guest
```

### Staff Approval
```
GET    /api/konfirmasi-staf/list-guest # List pending guests
POST   /api/konfirmasi-staf            # Approve/reject guest
```

### Staff Management
```
GET    /api/pegawai                    # List employees
POST   /api/pegawai                    # Create employee
PUT    /api/pegawai/:id                # Update employee
DELETE /api/pegawai/:id                # Delete employee
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'mysql2'"
```bash
cd backend
npm install mysql2
```

### Error: "ECONNREFUSED 127.0.0.1:5000"
- Backend tidak berjalan. Jalankan `npm run dev` di folder backend
- Cek apakah port 5000 sudah terpakai: `lsof -i :5000`

### Error: "Database connection failed"
- Cek konfigurasi `.env` di backend
- Verifikasi MySQL running: `mysql -u root -p`
- Pastikan database `securegate` sudah dibuat

### Error: "Token tidak valid"
- Token sudah expire, silakan login ulang
- Cek `JWT_SECRET` di `.env` sama dengan yang digunakan saat generate token

### File uploads tidak tampil
- Cek folder `backend/uploads/tamu/` sudah ada
- Verifikasi path di `server.js` line 124-125

### Frontend blank/tidak load
```bash
cd frontend
npm install
npm run dev
# Tunggu sampai "ready in XXms"
```

---
