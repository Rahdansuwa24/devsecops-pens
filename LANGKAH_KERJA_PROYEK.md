# Panduan & Langkah-Langkah Pembuatan Proyek Sales Data Visualization Dashboard (DevSecOps)

Dokumen ini berisi panduan alur kerja dan langkah-langkah detail pembuatan proyek **Sales Data Visualization Dashboard** dengan menerapkan prinsip-prinsip **DevOps / DevSecOps** (berdasarkan materi Bab 01–03).

---

## 1. Gambaran Umum & Arsitektur Sistem

- **Studi Kasus**: Visualisasi data penjualan produk dan transaksi (`axon_sales` database).
- **Struktur Lingkungan (*Environment*)**:
  - **OS Host / Workspace**: Windows + Ubuntu WSL (`/home/rahadyan/axon-sales-devops`)
  - **Database & Services**: MySQL 8.0 & phpMyAdmin (Docker Containerized)
  - **Backend API**: Express.js (Node.js REST API Containerized)
  - **Frontend Client**: React.js dengan Vite (Containerized)
  - **VCS & CI/CD**: Git & GitHub (`https://github.com/Rahdansuwa24/devsecops-pens` - Branch `UTS`)

- **Arsitektur Docker Network**:
  ```
  [Browser]
      |
      |---> http://localhost:5173  --> Container: frontend  (React + Vite)
      |                                     | VITE_API_URL -> localhost:5000
      |                                     v
      |---> http://localhost:5000  --> Container: backend   (Express.js Node.js)
      |                                     | DB_HOST=db
      |                                     v
      |---> http://localhost:8080  --> Container: phpmyadmin
                                           |
                                      Container: db (MySQL 8.0)
                                           |
                                      Volume: db_data
  ```
  Semua container berada dalam satu internal Docker network. Backend dan database berkomunikasi via **nama service** (bukan `localhost`). Frontend berkomunikasi ke backend menggunakan `localhost` karena permintaan dibuat oleh **browser**, bukan oleh container.

---

## 2. Langkah-Langkah Pengerjaan Proyek

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
1. **Penyiapan Database SQL**:
   - File dump SQL `Axon sales - Mysql Database.sql` ditempatkan pada direktori `database/`.
   - Nama schema disesuaikan menjadi `axon_sales`.
2. **Membuat Konfigurasi Initial `docker-compose.yml`**:
   Mendefinisikan container pendukung:
   - **Service `db` (MySQL 8.0)**: Berjalan di port `3306`, membaca data dari `.env`, dan meng-import otomatis file `database/Axon sales - Mysql Database.sql`.
   - **Service `phpmyadmin`**: Berjalan di port `8080` untuk GUI pengelolaan database via browser.
3. **Verifikasi Database**:
   Akses `http://localhost:8080` (Server: `db`, Username: `root`, Password: `root_password_123`).

---

### **Tahap 3: Pengembangan & Kontainerisasi Backend API (Express.js)**
1. **Inisialisasi Project di folder `backend/`**:
   ```bash
   cd ~/axon-sales-devops/backend
   npm init -y
   npm install express mysql2 dotenv cors nodemon
   ```
2. **Membuat REST API Endpoints (`server.js`)**:
   - `/api/sales-summary`: Menghitung total revenue, total orders, total customers.
   - `/api/top-products`: Data produk terlaris.
   - `/api/monthly-sales`: Tren penjualan per bulan.
3. **Membuat File `Dockerfile` Backend**:
   Buat file `backend/Dockerfile` untuk mengkontainerisasi aplikasi Node.js Express:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```
4. **Konfigurasi Environment Backend (`backend/.env`)**:
   ```dotenv
   DB_HOST=db
   DB_PORT=3306
   DB_NAME=axon_sales
   DB_USER=axon_user
   DB_PASSWORD=axon_password_123
   PORT=5000
   ```
   > **Catatan**: `DB_HOST=db` menggunakan **nama service Docker** (bukan `localhost`), karena backend dan database berada dalam satu Docker network internal.
5. **Membuat `backend/.dockerignore`**:
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   Dockerfile
   *.md
   ```
6. **Pengintegrasian Service Backend ke `docker-compose.yml`**:
   Tambahkan service `backend` dengan:
   - `build.context: ./backend` — membangun image dari folder `backend/`.
   - `volumes: ./backend:/app` — live reload via volume mount (kode host disinkronisasi ke container).
   - `command: npm run dev` — menjalankan `nodemon` untuk hot-reload saat pengembangan.
   - `depends_on: db: condition: service_healthy` — backend baru dimulai setelah database benar-benar siap.
7. **Menyalakan Stack Services**:
   ```bash
   docker compose up -d --build
   ```
8. **Verifikasi Endpoints**:
   Uji akses API via browser atau curl:
   ```bash
   curl http://localhost:5000/api/sales-summary
   ```

---

### **Tahap 4: Pengembangan & Kontainerisasi Frontend Dashboard (React + Vite)**
1. **Inisialisasi Project di folder `frontend/`**:
   ```bash
   cd ~/axon-sales-devops/frontend
   npm create vite@latest . -- --template react
   npm install axios lucide-react recharts
   ```
2. **Pengembangan Komponen Visualisasi**:
   - Membuat komponen Dashboard UI untuk menampilkan ringkasan data penjualan (*Sales Summary cards*).
   - Menambahkan grafik tren penjualan bulanan (*Monthly Sales chart* via Recharts).
   - Menampilkan tabel/daftar produk terlaris (*Top Products*).
   - Menghubungkan Frontend dengan API Backend menggunakan environment variable `VITE_API_URL`.
3. **Konfigurasi Environment Frontend**:
   Variabel environment Vite **harus diawali dengan `VITE_`** agar dapat diakses di dalam kode React via `import.meta.env`.
   - Di `frontend/src/App.jsx`, gunakan pola berikut:
     ```js
     const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
     ```
   - Variabel `VITE_API_URL` didefinisikan di `docker-compose.yml` pada bagian environment service `frontend`:
     ```yaml
     environment:
       - VITE_API_URL=http://localhost:5000/api
     ```
   > **Mengapa `localhost` (bukan nama service `backend`)?**
   > Karena `VITE_API_URL` digunakan oleh **browser pengguna** (bukan oleh container frontend itu sendiri). Browser selalu mengakses dari luar Docker network, sehingga harus menggunakan `localhost` dan port yang di-expose (`5000`).
4. **Konfigurasi `vite.config.js` untuk Docker**:
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       host: '0.0.0.0',    // Wajib agar Vite dapat diakses dari luar container
       port: 5173,
       watch: {
         usePolling: true, // Diperlukan agar hot-reload berfungsi di Docker volume mount
       },
     },
   })
   ```
5. **Membuat `frontend/Dockerfile`**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 5173
   CMD ["npm", "run", "dev"]
   ```
6. **Membuat `frontend/.dockerignore`**:
   ```
   node_modules
   dist
   npm-debug.log
   .env
   ```
7. **Pengintegrasian Service Frontend ke `docker-compose.yml`**:
   Tambahkan service `frontend` dengan:
   - `build.context: ./frontend` — membangun image dari folder `frontend/`.
   - `volumes: ./frontend:/app` — live reload via volume mount.
   - `command: npm run dev` — menjalankan Vite dev server.
   - `depends_on: backend` — frontend dimulai setelah backend siap.
8. **Build & Jalankan Stack Lengkap**:
   ```bash
   docker compose up -d --build
   ```
   Akses dashboard melalui browser di `http://localhost:5173`.

---

### **Tahap 5: Pengujian Terintegrasi & Verifikasi Aplikasi**
1. **Pengujian Alur Data (End-to-End)**:
   - Pastikan seluruh container berjalan: `docker compose ps` (semua status harus `Up`).
   - Buka `http://localhost:5173` — dashboard harus menampilkan data dari database.
2. **Verifikasi Konektivitas & Data**:
   - Backend terhubung ke MySQL via internal network (`DB_HOST=db`).
   - Frontend dapat memanggil endpoint backend (`http://localhost:5000/api/...`) tanpa error CORS.
3. **Melihat Log Container** (jika ada error):
   ```bash
   docker compose logs -f backend    # log Node.js / Express
   docker compose logs -f frontend   # log Vite dev server
   docker compose logs -f db         # log MySQL
   ```

---

### **Tahap 6: Penerapan DevSecOps, Version Control & Push ke Repository**
1. **Penerapan Keamanan & Clean-up (DevSecOps Best Practices)**:
   - Memastikan rahasia/kredensial sensitif tidak di-commit ke Git (menggunakan `.env.example` dan mendaftarkan `.env` ke `.gitignore`).
   - Mengabaikan file hasil build dan dependency (`node_modules/`, `dist/`, file sementara OS).
2. **Commit & Push ke GitHub Repository**:
   ```bash
   git add .
   git commit -m "Integrate backend & frontend containers into Docker Compose and complete documentation"
   git push origin UTS
   ```
3. **Verifikasi Akhir pada Remote Repository**:
   - Memastikan seluruh kode program, `Dockerfile`, `docker-compose.yml`, dan dokumentasi (`LANGKAH_KERJA_PROYEK.md`) terunggah secara rapi pada branch `UTS` di repository GitHub.

---

## 3. Panduan Setup untuk Kontributor Baru (Setelah Clone / Pull)

Bagian ini ditujukan bagi siapa saja yang ingin menjalankan proyek ini dari awal di mesin mereka sendiri.

### Prasyarat

Pastikan perangkat lunak berikut sudah terinstall di sistem Anda:

| Perangkat Lunak | Versi Minimum | Cek Instalasi |
|---|---|---|
| **Docker** | 20.x | `docker --version` |
| **Docker Compose** | v2.x (plugin) | `docker compose version` |
| **Git** | 2.x | `git --version` |

> **Catatan untuk pengguna Windows**: Jalankan semua perintah di dalam **Ubuntu WSL** (Windows Subsystem for Linux), bukan di Command Prompt atau PowerShell.

---

### Langkah 1 - Clone Repository

```bash
git clone https://github.com/Rahdansuwa24/devsecops-pens.git axon-sales-devops
cd axon-sales-devops
git checkout UTS
```

---

### Langkah 2 - Buat File `.env` dari Template

File `.env` **tidak disertakan** di repository (untuk alasan keamanan). Salin dari template yang tersedia:

```bash
cp .env.example .env
```

Kemudian buka file `.env` dan sesuaikan nilainya jika diperlukan:

```dotenv
# .env - Sesuaikan nilai berikut jika diperlukan
MYSQL_ROOT_PASSWORD=root_password_123
DB_NAME=axon_sales
DB_USER=axon_user
DB_PASSWORD=axon_password_123

# Digunakan oleh backend/server.js
DB_HOST=db
DB_PORT=3306
PORT=5000
```

> **Penting**: Nilai `DB_HOST=db` **jangan diubah** - `db` adalah nama service MySQL di Docker Compose, bukan `localhost`.

---

### Langkah 3 - Jalankan Seluruh Stack dengan Docker Compose

```bash
docker compose up -d --build
```

Perintah ini akan secara otomatis:
- Membangun image Docker untuk `backend` dan `frontend`.
- Menjalankan container `db` (MySQL), `backend` (Express.js), `frontend` (React Vite), dan `phpmyadmin`.
- Mengimpor database awal dari file `database/Axon sales - Mysql Database.sql` ke MySQL.

> **Flag `--build`** wajib digunakan pada saat pertama kali setup atau setelah ada perubahan pada `Dockerfile` / dependensi (penambahan package npm baru).

---

### Langkah 4 - Verifikasi Semua Container Berjalan

```bash
docker compose ps
```

Output yang diharapkan (semua status `Up`):

```
NAME                    STATUS          PORTS
axon_sales_db           Up (healthy)    0.0.0.0:3306->3306/tcp
axon_sales_backend      Up              0.0.0.0:5000->5000/tcp
axon_sales_frontend     Up              0.0.0.0:5173->5173/tcp
axon_sales_phpmyadmin   Up              0.0.0.0:8080->80/tcp
```

---

### Langkah 5 - Akses Aplikasi

| Layanan | URL | Keterangan |
|---|---|---|
| **Dashboard Frontend** | `http://localhost:5173` | Halaman utama visualisasi data |
| **Backend API** | `http://localhost:5000/api/sales-summary` | Cek respons JSON dari API |
| **phpMyAdmin** | `http://localhost:8080` | GUI Database (login: `root` / `root_password_123`) |

---

### Perintah Docker Berguna Lainnya

```bash
# Melihat log real-time semua service
docker compose logs -f

# Melihat log service tertentu
docker compose logs -f backend
docker compose logs -f frontend

# Menghentikan semua container (data tetap tersimpan)
docker compose down

# Menghentikan + menghapus semua data volume (HATI-HATI: data DB akan hilang)
docker compose down -v

# Merestart container tertentu
docker compose restart backend

# Masuk ke dalam shell container (untuk debugging)
docker compose exec backend sh
docker compose exec db sh
```

---

### Catatan Penting: Menambahkan Package npm Baru

Jika Anda menambahkan dependensi baru ke backend atau frontend (via `npm install`), Anda harus **rebuild image** Docker agar package tersebut tersedia di dalam container:

```bash
# Setelah menambahkan package baru di backend atau frontend
docker compose up -d --build
```

> Tanpa `--build`, container masih menggunakan image lama yang tidak memiliki package baru tersebut.

---

### Troubleshooting Umum

| Masalah | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Frontend tidak bisa load data | Backend belum siap / CORS error | Tunggu ~10 detik lalu refresh. Cek `docker compose logs backend`. |
| `Error: connect ECONNREFUSED` di backend | Database belum siap | Tunggu healthcheck DB selesai. Cek `docker compose ps`. |
| Port sudah dipakai (`bind: address already in use`) | Port 3306/5000/5173 dipakai proses lain | Stop proses lokal yang memakai port tersebut, lalu ulangi `docker compose up`. |
| Perubahan kode tidak ter-update | Volume mount tidak berjalan | Pastikan path `volumes` di `docker-compose.yml` benar. Cek dengan `docker compose logs -f`. |
| Hot-reload Vite tidak berfungsi | `usePolling` tidak aktif | Pastikan `vite.config.js` sudah mengandung `watch: { usePolling: true }`. |
