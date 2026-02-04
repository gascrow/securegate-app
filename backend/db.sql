-- =========================
-- Buat Database
-- =========================
CREATE DATABASE IF NOT EXISTS securegate
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE securegate;

-- =========================
-- Tabel: employees
-- =========================
CREATE TABLE employees (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    divisi VARCHAR(255) NOT NULL,
    nomorHp VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- Tabel: guests
-- =========================
CREATE TABLE guests (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    visitType ENUM('UMUM', 'VENDOR') NOT NULL,
    isGroup TINYINT(1) DEFAULT 0,
    groupMembers LONGTEXT COLLATE utf8mb4_bin DEFAULT NULL,
    namaLengkap VARCHAR(255) NOT NULL,
    asalInstansi VARCHAR(255) DEFAULT NULL,
    keperluan TEXT DEFAULT NULL,
    nomorHp VARCHAR(20) DEFAULT NULL,
    nomorKtp VARCHAR(20) DEFAULT NULL,
    fotoTamu LONGTEXT DEFAULT NULL,
    fotoKTP LONGTEXT DEFAULT NULL,
    k3Pdf LONGTEXT DEFAULT NULL,
    suratUndangan LONGTEXT DEFAULT NULL,
    tujuan VARCHAR(255) DEFAULT NULL,
    divisi VARCHAR(100) DEFAULT NULL,
    nomorHpPegawai VARCHAR(20) DEFAULT NULL,
    namaPegawai VARCHAR(255) DEFAULT NULL,
    deskripsiPekerjaan TEXT DEFAULT NULL,
    lokasiPekerjaan VARCHAR(255) DEFAULT NULL,
    jamMasuk VARCHAR(10) DEFAULT NULL,
    jamKeluar VARCHAR(10) DEFAULT NULL,
    status ENUM('PENDING', 'DIIZINKAN', 'DITOLAK', 'LOGGED') DEFAULT 'PENDING',
    catatan TEXT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- Tabel: users
-- =========================
CREATE TABLE users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'SEKURITI', 'STAF') NOT NULL,
    division VARCHAR(100) DEFAULT NULL,
    phoneNumber VARCHAR(20) DEFAULT NULL,
    isActive TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================
-- Index Tambahan (Opsional)
-- =========================
CREATE UNIQUE INDEX idx_users_username ON users(username);
