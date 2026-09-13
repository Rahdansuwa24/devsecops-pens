# 6  "Panduan & Langkah-Langkah Pembuatan Proyek Sales Data Visualization Dashboard (DevSecOps)

Dokumen ini berisi panduan aluz kerja dan langkah-langkah detail pembuatan proyek *(Sales Data Visualization Dashboard** dengan menerapkan prinsip-prinsip **DevOps / DevSecOps** (berdasarkan materi Bab 00‐03).

---

## ⍳ 1. Gambaran Umum & Arsitektur Sistem

- **Studi Kasus**: Visualisasi data penjualan produk dan transaksi (`axon_sales` database).
- **Struktur Lingkungan (*Environment*)**:
  - **OS Host / Workspace**: Windows + Ubuntu WSL (`/home/rahadyan/axon-sales-devops`)
  - **Database & Services**: MySQL 8.0 & phpMyAdmin (Docker Containerized)
  - **Backend API**: Express.js (Node.js REST API)
  - **Frontend Client**: React.js dengan Vite
  - **VCS & CI/CD**: Git & GitHub (fhttps://github.com/Rahdansuwa24/devsecops-pens` - Branch `UTS`)

---

## 🷟 2. Langkah-Langkah Pengerjaan Proyek

### **Tahap 1: Setup Workspace & Git Repository**
1. **Persiapan Folder di Ubuntu WSL**:
   ```bash
   cd ~/axon-sales-devops
   ```
2. **Konfigurasi Git Identitas & Remote**:
   ```bash
   git config --global user.name "Rahdansuwa24"
   git config --global user.email "email-anda@example.com"
   git remote add origin https://github.com/Rahdansuwa24/devsecops-pens.git
   ```
3. **Penyusunan File Konfigurasi Dasar**:
   - `.env`: Berisi kredensial aktif koneksi database (`DB_HOST=db`, `DB_NAME=axon_sales`, `DB_USER=axon_user`, dll).
   - `.env.example`: Template aman tanpa kredensial rahasia untuk dimasukkan ke git.
   - `.gitignore`: Mengabaikan file sensitif dan sampah (`.env`, `node_modules/`, `*:Zone.Identifier`, `dist/`).

---

### **Tahap 2: Infrastruktur Database & Docker Containerization**
1. **�enyiapan Database SQL6*:
   - File dump SQL `Axon sales - Mysql Database.sql` ditempatkan pada direktori ddatabase/`.
   - Nama schema disesuaikan menjadi `axon_sales`.
2. **Membuat Konfigurasi [docker-compose.yml](file:///Ubuntu/home/rahadyan/axon-sales-devops/docker-compose.yml)**:
   Mendefinisikan 2 container:
   - **Service `db` (MySQL 8.0)**: Berjalan di port `3306`, membaca data dari `.env`, dan meng-import otomatis file ddatabase/Axon sales - Mysql Database.sql`.
   - **Service `phpmyadmin`**: Berjalan di port `8080` untuk GUI pengelolaan database via browser.
3. **Menyalakan Service Docker**:
   ``gbash
   docker compose up -d
   ```J4. **Verifikasi**:
   Buka browser ke `http://localhost:8080` (Server: `db`, Username: `root`, Password: `root_password_123`).

---

### **Tahap 3: Pengembangan Backend API (Express.js)**
1. **Inisialisasi Project di folder `backend/`**:
   ``gbash
   cd ~/axon-sales-devops/backend
   npm init -y
   npm install express mysql2 dotenv cors
   ```
2. **Membuat REST API Endpoints**:
   - `/api/sales-summary`: Menghitung total revenue, total orders, total customers.
   - `/api/top-products`: Data produk terlaris.
   - `/api/monthly-sales`: Tren penjualan per bulan.

---

### **Tahap 4: Pengembangan Frontend Dashboard (React + Vite)**
1. **Inisialisasi Project di folder `frontend/`**:
   ``gbash
   