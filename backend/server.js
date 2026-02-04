console.log("JWT secret backend:", process.env.JWT_SECRET);
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 3002;

// Secret JWT (ubah ini ke string random di production)
const JWT_SECRET = 'rahasia_super_sulit';

// KONFIGURASI KONEKSI MYSQL
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '', 
  database: 'securegate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// =======================
// FUNGSI LOGIN
// =======================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ success: false, error: 'Username dan password wajib diisi' });

    // Ambil user dari database
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, error: 'Username atau password salah' });

    const user = rows[0];

    // Jika password di-hash di DB, gunakan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, error: 'Username atau password salah' });

    // Buat JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ success: true, "role" : user.role ,token });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// =======================
// FUNGSI LOGOUT
// =======================
// Logout sebenarnya di JWT stateless biasanya cukup di frontend:
// Hapus token di localStorage / cookie.
// Tapi kita buat endpoint dummy biar konsisten:
app.post('/api/logout', (req, res) => {
  // Bisa implement blacklisting token jika perlu, tapi sederhana cukup:
  res.json({ success: true, message: 'Logged out' });
});

// =======================
// MIDDLEWARE PROTEKSI ROUTE
// =======================
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ success: false, error: 'Token tidak ditemukan' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Tambahkan info user ke req
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token tidak valid atau kadaluarsa' });
  }
};

const uploadDir = './uploads/tamu';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Fix __dirname untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expose folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// CONTOH ROUTE TERPROTEKSI
// =======================
app.get('/api/profile', authenticateJWT, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// =======================
// DASHBOARD Endpoint (JWT Protected)
// =======================
app.get('/api/dashboard', authenticateJWT, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause = 'WHERE 1';
    const params = [];

    // Filter tanggal jika diberikan
    if (startDate && endDate) {
      whereClause += ' AND DATE(tanggal) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Query LOG (total)
    const [logRows] = await pool.execute(
      `SELECT COUNT(*) as totalLog FROM guests ${whereClause}`,
      params
    );

    // Query IN (jamMasuk terisi, jamKeluar null)
    const [inRows] = await pool.execute(
      `SELECT COUNT(*) as totalIn FROM guests ${whereClause} AND jamMasuk IS NOT NULL AND jamKeluar IS NULL`,
      params
    );

    // Query OUT (jamKeluar terisi)
    const [outRows] = await pool.execute(
      `SELECT COUNT(*) as totalOut FROM guests ${whereClause} AND jamKeluar IS NOT NULL`,
      params
    );

    res.json({
      success: true,
      data: {
        LOG: logRows[0].totalLog,
        IN: inRows[0].totalIn,
        OUT: outRows[0].totalOut
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =======================
// DASHBOARD - DATA TAMU SUDAH KELUAR
// =======================
app.post('/api/dashboard', authenticateJWT, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    let whereClause = 'WHERE jamKeluar IS NOT NULL';
    const params = [];

    // Filter tanggal (aman untuk DATETIME)
    if (startDate && endDate) {
      whereClause += ' AND DATE(tanggal) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const query = `
      SELECT 
        id,
        namaLengkap,
        asalInstansi,
        tujuan,
        keperluan,
        jamMasuk,
        jamKeluar,
        tanggal,
        status,
        catatanStaf
      FROM guests
      ${whereClause}
      ORDER BY jamKeluar DESC
    `;

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Dashboard OUT Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =======================
// CREATE NEW GUEST (Authenticated route - for admin/staff)
// =======================
app.post('/api/guests', authenticateJWT, upload.fields([
  { name: 'fotoTamu', maxCount: 1 },
  { name: 'fotoKTP', maxCount: 1 },
  { name: 'k3Pdf', maxCount: 1 },
  { name: 'suratUndangan', maxCount: 1 }
]), async (req, res) => {
  try {
    // Map frontend fields and provide default values if undefined
    const {
      tanggal = null,
      visitType = null,
      isGroup = false,
      groupMembers = null,
      namaLengkap = null,
      asalInstansi = null,
      keperluan = null,
      nomorHp = null,
      nomorKtp = null,
      tujuan = null,
      divisi = null,
      jamMasuk = null,
      jamKeluar = null,
      status = 'PENDING',
      catatan = null,
      // Map frontend field names
      nomorHpPJ,
      penanggungJawab
    } = req.body;

    const processedGroupMembers = groupMembers
      ? JSON.stringify(Array.isArray(groupMembers) ? groupMembers : [groupMembers])
      : null;

    const fotoTamu = req.files?.fotoTamu?.[0]?.path || null;
    const fotoKTP = req.files?.fotoKTP?.[0]?.path || null;
    const k3Pdf = req.files?.k3Pdf?.[0]?.path || null;
    const suratUndangan = req.files?.suratUndangan?.[0]?.path || null;

    // Map frontend names to backend DB columns
    const nomorHpPegawai = nomorHpPJ || null;
    const namaPegawai = penanggungJawab || null;

    console.log('Body guest:', req.body);
    console.log('Files:', req.files);

    const [result] = await pool.execute(
      `
      INSERT INTO guests (
        tanggal,
        visitType,
        isGroup,
        groupMembers,
        namaLengkap,
        asalInstansi,
        keperluan,
        nomorHp,
        nomorKtp,
        fotoTamu,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        tujuan,
        divisi,
        nomorHpPegawai,
        namaPegawai,
        deskripsiPekerjaan,
        lokasiPekerjaan,
        jamMasuk,
        jamKeluar,
        status,
        catatan,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        tanggal,
        visitType,
        isGroup ? 1 : 0,
        processedGroupMembers,
        namaLengkap,
        asalInstansi,
        keperluan,
        nomorHp,
        nomorKtp,
        fotoTamu,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        tujuan,
        divisi,
        nomorHpPegawai,
        namaPegawai,
        req.body.deskripsiPekerjaan || null,
        req.body.lokasiPekerjaan || null,
        jamMasuk || null,
        jamKeluar || null,
        status || 'PENDING',
        catatan || null
      ]
    );

    res.json({
      success: true,
      message: 'Guest berhasil ditambahkan',
      guestId: result.insertId
    });

  } catch (error) {
    console.error('Create Guest Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan tamu',
      error: error.message
    });
  }
});

// =======================
// CREATE NEW GUEST (Public route - for unauthenticated guests)
// =======================
app.post('/api/guests/public', upload.fields([
  { name: 'fotoTamu', maxCount: 1 },
  { name: 'fotoKTP', maxCount: 1 },
  { name: 'k3Pdf', maxCount: 1 },
  { name: 'suratUndangan', maxCount: 1 }
]), async (req, res) => {
  try {
    // Map frontend fields and provide default values if undefined
    const {
      tanggal = null,
      visitType = null,
      isGroup = false,
      groupMembers = null,
      namaLengkap = null,
      asalInstansi = null,
      keperluan = null,
      nomorHp = null,
      nomorKtp = null,
      tujuan = null,
      divisi = null,
      jamMasuk = null,
      jamKeluar = null,
      status = 'PENDING',
      catatan = null,
      // Map frontend field names
      nomorHpPJ,
      penanggungJawab
    } = req.body;

    const processedGroupMembers = groupMembers
      ? JSON.stringify(Array.isArray(groupMembers) ? groupMembers : [groupMembers])
      : null;

    const fotoTamu = req.files?.fotoTamu?.[0]?.path || null;
    const fotoKTP = req.files?.fotoKTP?.[0]?.path || null;
    const k3Pdf = req.files?.k3Pdf?.[0]?.path || null;
    const suratUndangan = req.files?.suratUndangan?.[0]?.path || null;

    // Map frontend names to backend DB columns
    const nomorHpPegawai = nomorHpPJ || null;
    const namaPegawai = penanggungJawab || null;

    // Jika tanggal tidak dikirim dari frontend, gunakan tanggal hari ini
    const tanggalFinal = tanggal || new Date().toISOString().split('T')[0];

    console.log('Body guest (public):', req.body);
    console.log('Files (public):', req.files);
    console.log('Tanggal yang akan disimpan:', tanggalFinal);

    const [result] = await pool.execute(
      `
      INSERT INTO guests (
        tanggal,
        visitType,
        isGroup,
        groupMembers,
        namaLengkap,
        asalInstansi,
        keperluan,
        nomorHp,
        nomorKtp,
        fotoTamu,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        tujuan,
        divisi,
        nomorHpPegawai,
        namaPegawai,
        deskripsiPekerjaan,
        lokasiPekerjaan,
        jamMasuk,
        jamKeluar,
        status,
        catatan,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        tanggalFinal,
        visitType,
        isGroup ? 1 : 0,
        processedGroupMembers,
        namaLengkap,
        asalInstansi,
        keperluan,
        nomorHp,
        nomorKtp,
        fotoTamu,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        tujuan,
        divisi,
        nomorHpPegawai,
        namaPegawai,
        req.body.deskripsiPekerjaan || null,
        req.body.lokasiPekerjaan || null,
        jamMasuk || null,
        jamKeluar || null,
        status || 'PENDING',
        catatan || null
      ]
    );

    res.json({
      success: true,
      message: 'Guest berhasil ditambahkan',
      guestId: result.insertId
    });

  } catch (error) {
    console.error('Create Guest (Public) Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan tamu',
      error: error.message
    });
  }
});

app.post('/api/dashboard/delete-guest', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID guest wajib dikirim'
      });
    }

    // 1️⃣ Ambil data guest dulu (buat hapus file)
    const [rows] = await pool.execute(
      `SELECT fotoTamu, fotoKTP, k3Pdf, suratUndangan FROM guests WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tamu tidak ditemukan'
      });
    }

    const files = [
      rows[0].fotoTamu,
      rows[0].fotoKTP,
      rows[0].k3Pdf,
      rows[0].suratUndangan
    ];

    // 2️⃣ Hapus file satu per satu (jika ada)
    files.forEach(filePath => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // 3️⃣ Hapus data dari database
    await pool.execute(
      `DELETE FROM guests WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Data tamu berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete Guest Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data tamu',
      error: error.message
    });
  }
});

app.post('/api/dashboard/checkout', authenticateJWT, async (req, res) => {
  try {
    const { id, jamKeluar } = req.body;

    if (!id || !jamKeluar) {
      return res.status(400).json({
        success: false,
        message: 'ID dan jamKeluar wajib diisi'
      });
    }

    // Validasi format HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(jamKeluar)) {
      return res.status(400).json({
        success: false,
        message: 'Format jamKeluar harus HH:mm'
      });
    }

    // Update jamKeluar dan set status ke LOGGED (sudah checkout)
    const [result] = await pool.execute(
      `
      UPDATE guests
      SET jamKeluar = ?, status = 'LOGGED'
      WHERE id = ?
      `,
      [jamKeluar, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tamu tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Checkout berhasil'
    });

  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan checkout',
      error: error.message
    });
  }
});

app.get('/api/dashboard/list-guest', authenticateJWT, async (req, res) => {
  try {
    const { startDate, endDate, search } = req.query;
    console.log('LIST GUEST REQUEST:', { startDate, endDate, search });

    let whereClause = 'WHERE 1';
    const params = [];

    // Filter tanggal
    if (startDate && endDate) {
      whereClause += ' AND DATE(tanggal) BETWEEN ? AND ?';
      params.push(startDate, endDate);
      console.log('Adding date filter:', { startDate, endDate });
    }

    // Search namaLengkap atau asalInstansi
    if (search) {
      whereClause += ' AND (namaLengkap LIKE ? OR asalInstansi LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        namaLengkap,
        fotoTamu,
        asalInstansi,
        tanggal,
        jamMasuk,
        jamKeluar,
        tujuan,
        keperluan,
        catatan,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        status,
        nomorHpPegawai
      FROM guests
      ${whereClause}
      ORDER BY tanggal DESC, jamMasuk DESC
      `,
      params
    );

    console.log('LIST GUEST RESPONSE:', { total: rows.length, rowSample: rows.length > 0 ? rows[0] : 'empty' });

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('List Guest Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tamu',
      error: error.message
    });
  }
});

app.get('/api/konfirmasi-staf/list-guest', authenticateJWT, async (req, res) => {
  try {
    // 1️⃣ Ambil seluruh data PENDING
    const [pendingRows] = await pool.execute(
      `
      SELECT
        id,
        namaLengkap,
        asalInstansi,
        tanggal,
        tujuan,
        keperluan,
        fotoTamu,
        fotoKTP,
        k3Pdf,
        suratUndangan,
        status,
        jamMasuk,
        jamKeluar
      FROM guests
      WHERE status = 'PENDING'
      ORDER BY tanggal DESC
      `
    );

    // 2️⃣ Hitung total PENDING
    const [[pendingCount]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalPending
      FROM guests
      WHERE status = 'PENDING'
      `
    );

    // 3️⃣ Hitung total DIIZINKAN
    const [[diizinkanCount]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalDiizinkan
      FROM guests
      WHERE status = 'DIIZINKAN'
      `
    );

    // 4️⃣ Hitung total DIIZINKAN & sedang di lokasi
    const [[aktifCount]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalAktif
      FROM guests
      WHERE status = 'DIIZINKAN'
        AND jamMasuk IS NOT NULL
        AND jamKeluar IS NULL
      `
    );

    res.json({
      success: true,
      summary: {
        pending: pendingCount.totalPending,
        diizinkan: diizinkanCount.totalDiizinkan,
        aktifDiLokasi: aktifCount.totalAktif
      },
      data: pendingRows
    });

  } catch (error) {
    console.error('Konfirmasi Staf Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data konfirmasi staf',
      error: error.message
    });
  }
});

app.post('/api/konfirmasi-staf', authenticateJWT, async (req, res) => {
  try {
    const { id, status, catatan } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: 'ID dan status wajib dikirim'
      });
    }

    const allowedStatus = ['DIIZINKAN', 'DITOLAK'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    // Ambil jam sekarang GMT+8 (HH:mm)
    const now = new Date();
    const gmt8 = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const jamMasuk = gmt8.toISOString().substring(11, 16); // HH:mm

    let query = `
      UPDATE guests
      SET status = ?, catatan = ?, jamMasuk = ?
      WHERE id = ?
    `;

    let params = [
      status,
      catatan || null,
      status === 'DIIZINKAN' ? jamMasuk : null,
      id
    ];

    const [result] = await pool.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data tamu tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: `Status tamu berhasil diubah menjadi ${status}`,
      jamMasuk: status === 'DIIZINKAN' ? jamMasuk : null
    });

  } catch (error) {
    console.error('Konfirmasi Staf Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengubah status tamu',
      error: error.message
    });
  }
});

// Create daftar pegawai
app.post('/api/daftar-pegawai', async (req, res) => {
  try {
    const { nama, divisi, nomorHp } = req.body;
    console.log('CREATE EMPLOYEE REQUEST:', { nama, divisi, nomorHp });

    if (!nama || !divisi || !nomorHp) {
      return res.status(400).json({
        success: false,
        message: 'nama, divisi, dan nomorHp wajib diisi'
      });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO employees (nama, divisi, nomorHp)
      VALUES (?, ?, ?)
      `,
      [nama, divisi, nomorHp]
    );

    console.log('CREATE EMPLOYEE SUCCESS:', result.insertId);
    res.json({
      success: true,
      message: 'Pegawai berhasil ditambahkan',
      id: result.insertId
    });

  } catch (error) {
    console.error('CREATE EMPLOYEE ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reat daftar pegawai
app.get('/api/daftar-pegawai', async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = 'WHERE 1';
    const params = [];

    if (search) {
      whereClause += `
        AND (
          nama LIKE ?
          OR divisi LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        nama,
        divisi,
        nomorHp
      FROM employees
      ${whereClause}
      ORDER BY nama ASC
      `,
      params
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('LIST EMPLOYEE ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//Update
app.post('/api/daftar-pegawai/update', async (req, res) => {
  try {
    const { id, nama, divisi, nomorHp } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib dikirim'
      });
    }

    const [result] = await pool.execute(
      `
      UPDATE employees
      SET nama = ?, divisi = ?, nomorHp = ?
      WHERE id = ?
      `,
      [nama || null, divisi || null, nomorHp || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data pegawai berhasil diperbarui'
    });

  } catch (error) {
    console.error('UPDATE EMPLOYEE ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


//delete
app.post('/api/daftar-pegawai/delete', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib dikirim'
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM employees WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pegawai tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Pegawai berhasil dihapus'
    });

  } catch (error) {
    console.error('DELETE EMPLOYEE ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE USER
app.post('/api/manajemen-user', async (req, res) => {
  try {
    const { username, password, role, division, phoneNumber, isActive } = req.body;

    if (!username || !password || !role || !division) {
      return res.status(400).json({
        success: false,
        message: 'username, password, role, dan division wajib diisi'
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `
      INSERT INTO users
      (username, password, role, division, phoneNumber, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        username,
        hashedPassword,
        role,
        division,
        phoneNumber || null,
        isActive ?? 1
      ]
    );

    res.json({
      success: true,
      message: 'User berhasil ditambahkan',
      id: result.insertId
    });

  } catch (error) {
    console.error('CREATE USER ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// READ USER
app.get('/api/manajemen-user', async (req, res) => {
  try {
    const { search } = req.query;

    let whereClause = 'WHERE 1';
    const params = [];

    if (search) {
      whereClause += `
        AND (
          username LIKE ?
          OR role LIKE ?
          OR division LIKE ?
        )
      `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        username,
        role,
        division,
        phoneNumber,
        isActive,
        createdAt
      FROM users
      ${whereClause}
      ORDER BY createdAt DESC
      `,
      params
    );

    res.json({
      success: true,
      total: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('LIST USER ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE USER
app.post('/api/manajemen-user/update', async (req, res) => {
  try {
    const body = req.body;
    console.log('UPDATE USER RAW BODY:', JSON.stringify(body));
    
    const id = body.id;
    const username = body.username;
    const password = body.password;
    const role = body.role;
    const division = body.division;
    const phoneNumber = body.phoneNumber;
    const isActive = body.isActive;
    
    console.log('UPDATE USER PARSED:', { id, username, role, division, phoneNumber, isActive, passwordProvided: !!password });

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib dikirim'
      });
    }

    // Build dynamic query untuk partial updates
    const updateFields = [];
    const params = [];

    // Check each field with explicit type checking
    if (typeof username === 'string' && username.trim()) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (typeof role === 'string' && role.trim()) {
      updateFields.push('role = ?');
      params.push(role);
    }
    if (typeof division === 'string' && division.trim()) {
      updateFields.push('division = ?');
      params.push(division);
    }
    if (typeof phoneNumber === 'string') {
      updateFields.push('phoneNumber = ?');
      params.push(phoneNumber || null);
    }
    if (typeof isActive === 'boolean') {
      updateFields.push('isActive = ?');
      params.push(isActive ? 1 : 0);
      console.log('Setting isActive:', { isActive, convertedTo: isActive ? 1 : 0 });
    }
    if (typeof password === 'string' && password.trim()) {
      updateFields.push('password = ?');
      const hashedPassword = await bcrypt.hash(password, 10);
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      console.log('WARNING: No valid fields to update!', { body, updateFields, params });
      return res.status(400).json({
        success: false,
        message: 'Tidak ada field yang diupdate'
      });
    }

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    params.push(id);

    console.log('EXECUTING QUERY:', { query, paramsCount: params.length, paramsPreview: params.slice(0, -1) });
    const [result] = await pool.execute(query, params);

    console.log('UPDATE RESULT:', { affectedRows: result.affectedRows, changedRows: result.changedRows });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Data user berhasil diperbarui'
    });

  } catch (error) {
    console.error('UPDATE USER ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE USER
app.post('/api/manajemen-user/delete', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID wajib dikirim'
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM users WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// =======================
// START SERVER
// =======================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SECUREGATE Backend JWT jalan di http://0.0.0.0:${PORT}`);
});

