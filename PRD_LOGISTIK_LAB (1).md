# PRD LOGISTIK LAB

**Product Requirements Document untuk implementasi oleh agen Antigravity**

| Atribut | Nilai |
| --- | --- |
| Versi | 1.1 |
| Tanggal | 22 Oktober 2026 |
| Produk | LOGISTIK LAB |
| Jenis produk | Website praktik manajemen logistik untuk siswa |
| Target rilis | MVP fungsional berbasis web dengan pendekatan mobile first |
| Stack yang diminta pemilik proyek | Laravel dan React versi stabil terbaru |
| Sumber kebutuhan bisnis | Deskripsi Website LOGISTIK LAB.pdf, 9 halaman, dan arahan revisi pemilik proyek |
| Status | Siap menjadi acuan implementasi MVP dengan keputusan implementasi pada bagian 3 |

Dokumen ini menerjemahkan deskripsi client menjadi kebutuhan yang dapat diimplementasikan dan diuji. Hasil yang diminta adalah aplikasi yang menyimpan data, menghitung stok, mencatat pengiriman, menghasilkan barcode, dan mengekspor Excel. Seluruh modul harus berfungsi dari antarmuka hingga database.

Ketentuan jurnal dan template TEKNIKA yang pernah dilampirkan tidak digunakan sebagai sumber kebutuhan aplikasi ini. Keputusan yang melengkapi hal yang belum dijelaskan client ditandai pada bagian 3; keputusan tersebut merupakan baseline pengerjaan, bukan pernyataan bahwa client sudah menyetujuinya.

**Arahan revisi versi 1.1:** pengecualian fitur ditetapkan hanya untuk GPS realtime. Fitur lain disesuaikan dengan tujuan praktik manajemen logistik. Pengalaman utama harus dirancang untuk ponsel sejak awal. Arahan terbaru ini menggantikan daftar pengecualian pada versi 1.0 dan halaman 9 sumber awal. Login siswa dan scan barcode dimasukkan sebagai keputusan implementasi karena mendukung penyimpanan hasil praktik lintas perangkat dan pemilihan barang melalui kamera ponsel; keduanya bukan kutipan persyaratan baru dari client.

## 1. Ringkasan produk dan tujuan

LOGISTIK LAB merupakan media pembelajaran untuk melatih pencatatan dan pengelolaan kegiatan logistik secara digital. Guru memberikan kasus atau instruksi praktik di luar aplikasi. Siswa menggunakan website untuk menyiapkan data barang, mencatat penerimaan dan pengeluaran, mengelola data pengiriman, lalu menghasilkan laporan, katalog, dan barcode.

Tujuan MVP:

1. Memungkinkan siswa menyelesaikan satu rangkaian praktik logistik dengan nyaman melalui ponsel; tampilan tablet dan komputer menyesuaikan.
2. Menjaga hubungan antara data barang, transaksi, dan stok agar hasil praktik konsisten.
3. Menyediakan pencatatan transportasi yang mencakup moda, muatan, jadwal, dokumen, serta simulasi ekspor dan impor.
4. Menghasilkan laporan Excel yang bisa dikumpulkan kepada guru.
5. Menyimpan hasil praktik pada akun siswa agar dapat dilanjutkan dari ponsel atau perangkat lain tanpa biaya penggunaan di dalam aplikasi.

Keberhasilan produk pada tahap ini dinilai dari selesainya skenario praktik dan ketepatan hasil pencatatan. Hasil Excel menjadi keluaran yang dapat diperiksa guru; kebutuhan penilaian otomatis dapat dikembangkan bila tersedia rubrik pembelajarannya.

### 1.1 Pengguna dan konteks penggunaan

| Pengguna | Kebutuhan | Hak akses MVP |
| --- | --- | --- |
| Siswa | Mengerjakan kasus logistik dan mengunduh hasil praktik | Login dan mengelola seluruh data di ruang praktik milik akunnya |
| Guru | Memberikan instruksi dan memeriksa hasil praktik | Alur awal melalui instruksi pembelajaran dan laporan yang dikumpulkan siswa; kebutuhan akses guru mengikuti skenario pembelajaran berikutnya |
| Pengelola teknis | Menjalankan dan memelihara aplikasi | Konfigurasi server dan CLI untuk menjalankan baseline produk |

Label pengguna di antarmuka adalah **Siswa**. Baseline menyediakan registrasi, login, logout, pemulihan password, dan profil sederhana. Akun ini bertujuan menyimpan hasil latihan; aplikasi tetap berfokus pada praktik logistik. Kebutuhan portal guru atau administrasi sekolah diturunkan dari skenario pembelajaran yang tersedia, bukan ditambahkan otomatis hanya karena login sudah ada.

### 1.2 Definisi selesai pada tingkat produk

Siswa dapat membuka website di ponsel, masuk ke akun, memulai atau melanjutkan praktik, membuat barang, mencatat barang masuk dan keluar, mencatat pengiriman, melihat stok yang benar, menampilkan katalog, membuat dan memindai barcode, serta mengunduh lima jenis laporan Excel. Data tetap tersedia setelah refresh, logout, dan login kembali. Akun yang sama dapat melanjutkan hasil praktik dari perangkat lain; akun berbeda mempunyai ruang yang terpisah.

## 2. Ruang lingkup dan prioritas

### 2.1 Fitur wajib MVP

Semua fitur berikut adalah P0 dan wajib selesai sebelum MVP dinyatakan siap.

| ID | Modul | Cakupan |
| --- | --- | --- |
| FR-01 | Akun dan ruang praktik | Registrasi/login siswa, logout, pemulihan password, profil, ruang tersimpan per akun, akses lintas perangkat |
| FR-02 | Beranda | Sambutan, Mulai Praktik, statistik yang dihitung dari data |
| FR-03 | Data Barang | Daftar, pencarian, tambah, detail, ubah, hapus atau arsipkan, foto, stok |
| FR-04 | Barang Masuk | Form penerimaan, riwayat, detail, perhitungan nilai, pembaruan stok |
| FR-05 | Barang Keluar | Form pengeluaran, riwayat, detail, validasi stok, pembaruan stok |
| FR-06 | Konsistensi stok | Saldo awal, ledger, pemisahan kondisi, pembatalan tercatat, pencegahan stok negatif |
| FR-07 | Transportasi | Lima kelompok data pengiriman, alokasi barang, status, dan dokumen |
| FR-08 | Katalog Barang | Kartu produk, pencarian, filter kategori, detail produk |
| FR-09 | Barcode | Generate, pratinjau, download, cetak, scan kamera ponsel, dan pencarian kode manual |
| FR-10 | Laporan | Pratinjau dan ekspor Excel Data Barang, Barang Masuk, Barang Keluar, Stok, Pengiriman |
| FR-11 | Mobile first | Alur utama untuk ponsel: navigasi bawah, daftar kartu, form bertahap, kamera, unduhan; tablet/desktop menyesuaikan |
| FR-12 | Ketahanan aplikasi | Validasi server, isolasi data, keamanan berkas, penanganan kegagalan, pengujian inti |

Riwayat transaksi, pembatalan, ruang praktik, dan ledger merupakan keputusan implementasi untuk membuat alur pada dokumen client dapat digunakan secara utuh. Tidak diperlukan modul bisnis tambahan untuk mengaksesnya.

### 2.2 Pengecualian fitur

- **GPS realtime:** pelacakan posisi kendaraan, pengemudi, atau barang secara langsung tidak diimplementasikan pada tahap ini. Aplikasi tidak meminta izin lokasi untuk melacak pengiriman. Status pengiriman dicatat melalui perubahan status operasional.

Ini adalah satu-satunya fitur yang ditetapkan sebagai pengecualian. Fitur lain dinilai berdasarkan hubungan langsung dengan tujuan pembelajaran dan alur logistik, lalu dijelaskan sebagai kebutuhan wajib atau pendukung. Tidak adanya pengecualian tidak membuat seluruh fitur yang mungkin ada menjadi wajib dibangun sekaligus.

### 2.3 Penyesuaian fitur pendukung dengan fungsi utama

| Area | Penyesuaian pada baseline | Dasar fungsi |
| --- | --- | --- |
| Login siswa | Masuk dalam FR-01: akun sederhana dan hasil praktik tersimpan lintas perangkat | Mencegah hasil latihan bergantung pada satu browser dan memisahkan kepemilikan data |
| Scan barcode | Masuk dalam FR-09: kamera ponsel dan fallback input kode | Mempercepat pemilihan barang pada latihan penerimaan/pengeluaran |
| Jasa ekspedisi | Nama pengangkut dan nomor resi dapat dicatat pada pengiriman; integrasi API mengikuti provider yang benar-benar dipilih | Mendukung dokumentasi pengiriman tanpa ketergantungan provider yang belum ditentukan |
| Nilai transaksi/pembayaran | Harga pokok, harga jual, total nilai, ongkir, bea, dan pajak dicatat sebagai latihan; integrasi pembayaran mengikuti kebutuhan transaksi nyata bila nantinya ada | Produk saat ini adalah media praktik manajemen logistik |
| Gudang dan visualisasi | Lokasi penyimpanan serta penanganan muatan sudah dicatat; visualisasi 2D/3D dapat ditambahkan bila menjadi bagian kasus atau materi praktik | Visual harus membantu pemahaman logistik dan tetap nyaman di ponsel |
| Guru dan evaluasi | Instruksi kasus dan pemeriksaan laporan menjadi alur awal; portal guru, kelas, atau penilaian mengikuti kebutuhan pembelajaran yang dirinci kemudian | Menjaga fitur pendidikan terkait langsung dengan cara produk digunakan |
| Fitur pendukung lainnya | Import, notifikasi, PWA, dan fitur lain dapat dikembangkan bila mempunyai skenario serta acceptance criteria yang jelas | Prioritas ditentukan manfaat praktik, bukan daftar larangan tetap |

Agen menuntaskan FR-01 sampai FR-12 sebagai baseline yang terukur. Kebutuhan pendukung yang belum mempunyai provider, data, atau skenario dicatat dengan dependensinya; jangan membuat integrasi palsu atau mengklaim fitur tersebut sudah berfungsi. Semua fitur yang ditambahkan harus mengikuti desain mobile first.

## 3. Keputusan implementasi untuk hal yang belum dirinci client

Gunakan keputusan berikut langsung saat implementasi. Jika perlu diubah, catat dampaknya di `docs/decisions.md`; jangan diam-diam mengubah perilaku bisnis.

| ID | Hal yang belum jelas | Baseline yang digunakan |
| --- | --- | --- |
| D-01 | Akun dan kepemilikan data | Login siswa dimasukkan sebagai keputusan implementasi revisi. Satu akun mempunyai satu ruang praktik persisten; server menentukan pemilik melalui pengguna terautentikasi. |
| D-02 | Sesi dan akses lintas perangkat | Sesi tidak aktif berakhir setelah 120 menit. Login kembali, termasuk di perangkat lain, membuka ruang milik akun yang sama. Pilihan Ingat Saya bersifat opsional melalui mekanisme Laravel dan dapat dimatikan pada perangkat bersama. |
| D-03 | Menu Keluar | Logout mengakhiri autentikasi, menginvalidasi sesi aktif dan token CSRF, lalu kembali ke sambutan. Data praktik tidak dihapus dan dapat dilanjutkan sesudah login lagi. |
| D-04 | Jumlah barang pada satu transaksi | Satu catatan barang masuk atau keluar berisi satu SKU. Pengiriman dapat berisi beberapa baris barang. |
| D-05 | Satuan | Satu SKU mempunyai satu satuan dasar. Transaksi menyalin satuan master; tidak ada konversi box ke pcs. Jumlah harus bilangan bulat. |
| D-06 | Stok awal | Diisi saat membuat barang, dianggap berkondisi baik, dan menghasilkan ledger saldo awal. Sesudah itu stok tidak dapat diedit melalui master barang. |
| D-07 | Barang rusak | Menambah stok fisik rusak, tetapi tidak menambah stok baik yang tersedia untuk penjualan/pemakaian. Pengeluaran rusak diperbolehkan hanya untuk alasan retur. |
| D-08 | Harga transaksi | Mengambil nilai awal dari master dan dapat diubah pada form. Nilai tersimpan sebagai snapshot; transaksi tidak otomatis mengubah harga master. |
| D-09 | Koreksi transaksi | Transaksi tersimpan tidak diedit atau dihapus langsung. Koreksi dilakukan dengan pembatalan tercatat, lalu membuat transaksi baru bila diperlukan. |
| D-10 | Dampak pengiriman | Pengiriman tidak pernah mengubah stok. Domestik/ekspor mengacu pada Barang Keluar; impor mencatat rencana barang dari master dan penerimaannya dicatat melalui Barang Masuk. |
| D-11 | Stok per lokasi | Lokasi penyimpanan adalah atribut transaksi. Saldo dihitung per barang dan kondisi dalam satu ruang praktik, bukan per gudang. |
| D-12 | Barcode dan scan | Code 128, berisi kode barang, unduhan SVG dan cetak. Scan melalui kamera ponsel atau gambar memilih barang setelah konfirmasi, tanpa otomatis mengubah stok. Input kode manual selalu tersedia. |
| D-13 | Dokumen pengiriman | Metadata nomor dan jenis dokumen dengan lampiran opsional. Tidak membuat template surat jalan/invoice resmi atau mewajibkan siswa memiliki dokumen asli. |
| D-14 | Retensi server | Data praktik terkait akun dan tidak dihapus ketika logout atau sesi habis. Penghapusan/retensi server mengikuti kebijakan pengelola yang dikonfigurasi kemudian. |
| D-15 | Branding | Gunakan wordmark LOGISTIK LAB dan tema biru/teal yang sederhana. Warna, logo, dan identitas sekolah belum disediakan client. |
| D-16 | Prioritas revisi | Arahan terbaru pemilik proyek mengutamakan mobile first dan hanya mengecualikan GPS realtime. Daftar pengecualian lama tidak lagi menjadi larangan implementasi. |

**Identitas praktik:** nama siswa pada profil digunakan sebagai identitas keluaran laporan. Akun dengan email yang sama hanya mempunyai satu ruang, walaupun dibuka di beberapa perangkat. Semua perubahan stok tetap melalui server dan pemeriksaan konkurensi, sehingga dua perangkat tidak dapat mengeluarkan saldo yang sama dua kali.

Tampilkan keterangan singkat: “Hasil praktik tersimpan di akunmu dan dapat dilanjutkan dari perangkat lain.” Pada perangkat bersama, pengguna harus memakai akun masing-masing dan menekan Keluar setelah praktik.

## 4. Arsitektur dan stack teknis

### 4.1 Stack baseline

Versi mayor/minor berikut diverifikasi melalui dokumentasi resmi pada 22 Oktober 2026. Patch tepat ditentukan ketika proyek diinisialisasi.

| Lapisan | Pilihan |
| --- | --- |
| Backend | Laravel 13.x, patch stabil terbaru yang kompatibel |
| PHP | PHP 8.4 sebagai target development; Laravel 13 memerlukan minimal PHP 8.3 |
| Frontend | React 19.3.x dan React DOM pada versi yang sama |
| Integrasi | Inertia 3.x dengan routing dan controller Laravel |
| Bahasa frontend | TypeScript dengan pemeriksaan tipe |
| Build | Vite versi stabil yang kompatibel dengan starter kit |
| Styling | Tailwind CSS 4.x dan shadcn/ui |
| Database | MySQL 8.4 LTS dengan InnoDB dan utf8mb4 |
| Session | Laravel database session, timeout tidak aktif 120 menit, dukungan Ingat Saya melalui autentikasi Laravel |
| Autentikasi | Laravel session authentication/Fortify dari React starter kit resmi; password disimpan dengan hashing Laravel |
| Berkas | Laravel private storage; disk dapat diganti melalui konfigurasi |
| Excel | Library PHP pembentuk XLSX yang terawat dan kompatibel; Laravel Excel bila mendukung stack, PhpSpreadsheet bila diperlukan |
| Barcode | Generator Code 128 server-side yang kompatibel, misalnya Picqer PHP Barcode Generator |
| Scan barcode | Decoder browser seperti @zxing/browser dengan dukungan Code 128; lazy load pada layar scan dan fallback input kode |
| Backend tests | PHPUnit atau Pest; pilih satu secara konsisten |
| Browser tests | Playwright untuk skenario inti dan viewport ponsel |
| Node.js | LTS aktif yang memenuhi `engines` dari dependency build yang dipilih |

Referensi versi resmi:

- Laravel release notes: https://laravel.com/docs/13.x/releases
- Laravel React starter kit: https://laravel.com/docs/13.x/starter-kits
- React versions: https://react.dev/versions
- Akses kamera browser: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Decoder browser: https://github.com/zxing-js/browser

Sebelum instalasi, periksa rilis stabil dan `peerDependencies` terkini. Jangan memakai beta/canary, mengabaikan konflik dengan `--force`, atau menurunkan Laravel/React tanpa alasan yang dicatat. Jika rilis stabil baru tersedia saat pengerjaan, gunakan versi terbaru yang didukung seluruh dependency dan dokumentasikan pilihan akhirnya. Simpan `composer.lock` dan satu lockfile package manager frontend.

### 4.2 Pola aplikasi

Bangun satu aplikasi Laravel dengan React melalui Inertia dalam satu repository dan satu origin. Backend menangani validasi, kepemilikan data, transaksi database, stok, pembuatan Excel, barcode, dan akses berkas. React menangani tampilan dan interaksi form.

Tidak diperlukan backend Node terpisah, Next.js, React Router, API publik, JWT, Sanctum token, Redis, atau WebSocket untuk baseline ini. Inertia SSR juga tidak diperlukan. Gunakan autentikasi session dari React starter kit resmi untuk registrasi, login, logout, dan pemulihan password. Middleware auth melindungi seluruh data praktik; jangan mengganti pemeriksaan akses server dengan state login frontend.

Gunakan Form Request untuk validasi, action/service untuk posting dan pembatalan transaksi, serta query/report service yang dapat digunakan bersama oleh pratinjau dan ekspor. Controller harus tetap ringkas. Jangan menambah repository layer generik tanpa kebutuhan nyata.

### 4.3 Alur penyimpanan

1. Middleware memverifikasi pengguna login dan mengambil ruang praktik milik akunnya dari server.
2. Form mengirim payload dan token idempotensi untuk operasi yang mengubah stok.
3. Backend memvalidasi payload, kepemilikan semua referensi, serta aturan bisnis.
4. Service mengunci baris yang relevan dan menjalankan satu transaksi database.
5. Backend mengembalikan hasil; UI memperbarui daftar, statistik, dan panel stok.

Database adalah sumber data persisten. Jangan menyimpan data bisnis utama hanya di array frontend atau `localStorage`.

## 5. Navigasi dan perjalanan pengguna

### 5.1 Struktur halaman

| Route konseptual | Halaman | Isi utama |
| --- | --- | --- |
| `/` | Sambutan | Identitas produk dan CTA Mulai Praktik atau Lanjutkan Praktik |
| `/login`, `/register` | Akses akun | Masuk atau daftar siswa, dengan tampilan ponsel sederhana |
| `/forgot-password`, `/reset-password/...` | Pemulihan akun | Alur reset password melalui email |
| `/praktik` | Beranda | Sambutan ringkas, empat statistik, akses cepat modul |
| `/praktik/barang` | Data Barang | Daftar, pencarian, filter, tambah, detail, ubah, hapus/arsip |
| `/praktik/barang-masuk` | Barang Masuk | Riwayat, form tambah, detail, pembatalan |
| `/praktik/barang-keluar` | Barang Keluar | Riwayat, form tambah, detail, pembatalan |
| `/praktik/transportasi` | Transportasi | Daftar, detail, wizard, status, dokumen |
| `/praktik/katalog` | Katalog Barang | Grid kartu dan detail produk |
| `/praktik/barcode` | Barcode | Pilih barang, generate, pratinjau, download, cetak, scan |
| `/praktik/laporan` | Laporan | Lima tab, filter, pratinjau, Download Excel |
| `/praktik/profil` | Profil | Nama siswa dan ringkasan akun, perubahan password melalui alur autentikasi |

Seluruh menu sumber tetap dapat diakses. Pada ponsel, kelompokkan ke lima menu bawah: **Beranda, Barang, Transaksi, Pengiriman, Lainnya**. Transaksi membuka pilihan Barang Masuk/Barang Keluar; Lainnya memuat Katalog Barang, Barcode, Laporan, Profil, dan Keluar. Desktop boleh memakai sidebar. Path detail/create/edit mengikuti konvensi resource Laravel dengan named routes dan URL yang dapat dimuat ulang.

Mulai Praktik mengarahkan pengguna yang belum login ke akses akun. Setelah autentikasi berhasil, backend membuat ruang bila belum ada secara idempoten dan membuka Beranda. Akun yang sudah mempunyai ruang melanjutkan ruang tersebut. Keluar menggunakan POST yang dilindungi CSRF, menginvalidasi autentikasi/sesi, dan kembali ke `/`.

### 5.2 Alur praktik utama

1. Siswa menerima instruksi dari guru.
2. Siswa membuka LOGISTIK LAB di ponsel, menekan Mulai Praktik, lalu daftar atau login ke akunnya.
3. Siswa membuat data barang beserta satuan dan saldo awal bila ada.
4. Siswa memilih barang melalui pencarian atau scan barcode, mencatat Barang Masuk, dan memeriksa panel stok sebelum/sesudah.
5. Siswa mencatat Barang Keluar dan memeriksa stok tersedia.
6. Siswa membuat pengiriman domestik/ekspor dari transaksi Barang Keluar yang sesuai.
7. Siswa melengkapi muatan, jadwal, dokumen, dan memperbarui status pengiriman.
8. Siswa memeriksa katalog, membuat barcode, dan mengunduh laporan Excel.

Untuk latihan impor, siswa dapat mencatat rencana pengiriman dari barang master sebelum penerimaan. Setelah barang diterima, siswa tetap membuat Barang Masuk secara eksplisit. Mengubah status pengiriman menjadi Diterima tidak otomatis menambah stok.

## 6. Spesifikasi fitur

### 6.1 FR-01 Akun siswa dan ruang praktik

- Registrasi menerima nama 2-150 karakter, email valid yang unik, password minimal 8 karakter, dan konfirmasi password. Email dinormalisasi; nomor induk atau kelas boleh ditambahkan sebagai profil jika dibutuhkan sekolah, bukan identitas login wajib baseline.
- Login memakai email dan password, pesan kesalahan yang tidak membocorkan keberadaan akun, dan pembatasan percobaan. Regenerasi session ID setelah autentikasi berhasil.
- Nama dan email ditampilkan di Profil. Perubahan nama tersedia pada baseline. Password diubah melalui alur yang memverifikasi password saat ini atau token reset yang valid.
- Pemulihan password menggunakan mekanisme token dan email Laravel. Development memakai mail capture; production memerlukan konfigurasi pengiriman email. Jangan menampilkan token reset di layar siswa atau mengklaim email sudah terkirim bila layanan gagal.
- Satu akun mempunyai satu ruang praktik persisten. Buat ruang secara atomik dengan unique constraint pemilik agar login bersamaan dari dua perangkat tidak membuat dua ruang.
- Backend mengambil `workspace_id` dari relasi akun terautentikasi, lalu memakainya untuk seluruh query, file, dan mutasi. Nilai pemilik atau ruang dari client tidak dipercaya.
- Siswa hanya dapat mengakses data, dokumen, gambar, barcode, dan laporan ruang miliknya. Akun siswa lain tidak boleh membaca maupun menulis data tersebut.
- Refresh, membuka tab, logout/login, dan login pada perangkat lain tetap membuka hasil praktik akun yang sama. Jangan memakai sesi browser sebagai identitas permanen data.
- Modul praktik tanpa login diarahkan ke halaman Masuk. Setelah sesi habis, jelaskan bahwa pengguna perlu login kembali; data tidak direset.
- Logout benar-benar mengakhiri sesi aktif. Tombol Back atau URL berkas privat tidak boleh membuka kembali data dari server tanpa login; hindari cache publik untuk konten privat.
- Profil, login, register, dan reset password mengikuti form mobile first. Kebijakan verifikasi email dapat diaktifkan melalui konfigurasi sekolah; baseline tidak menahan seluruh praktik pada verifikasi email sebelum kebutuhan pengirim email tersedia.

### 6.2 FR-02 Beranda

Gunakan teks dari dokumen client:

- Judul: **Selamat Datang di LOGISTIK LAB**.
- Subjudul: **Website Praktik Manajemen Logistik**.
- Deskripsi: “Latih keterampilanmu dalam pencatatan dan pengelolaan barang, mulai dari gudang hingga pengiriman.”
- CTA: **Mulai Praktik** pada sambutan; **Lanjutkan Praktik** bila pengguna sudah login dan mempunyai ruang.

Empat statistik beranda dihitung untuk seluruh ruang praktik, tanpa filter tanggal:

| Statistik | Definisi |
| --- | --- |
| Jumlah Barang | Jumlah SKU aktif; bukan total unit barang |
| Total Barang Masuk | Jumlah unit dari transaksi masuk yang belum dibatalkan; tidak termasuk saldo awal |
| Total Barang Keluar | Jumlah unit dari transaksi keluar yang belum dibatalkan |
| Total Stok | Jumlah stok fisik baik dan rusak dari seluruh SKU, termasuk yang diarsipkan |

Jika satuan SKU beragam, statistik unit diberi keterangan **unit sesuai satuan masing-masing barang**, bukan diklaim sebagai jumlah pcs. Pada kartu Total Stok tampilkan rincian baik dan rusak. Angka pada PDF adalah contoh UI dan tidak boleh di-hardcode.

### 6.3 FR-03 Data Barang

Tabel desktop menampilkan foto, kode, nama, kategori, satuan, harga pokok, harga jual, stok fisik, dan aksi. Detail memisahkan stok baik, rusak, dan total. Pada ponsel, gunakan kartu dengan informasi utama dan menu aksi yang mudah disentuh.

| Field | Wajib | Aturan |
| --- | --- | --- |
| Kode barang | Ya | Default otomatis BRG001, BRG002, dan seterusnya; boleh diisi manual sebelum dipakai; 3-32 karakter A-Z, 0-9, dan tanda hubung; unik per ruang praktik |
| Nama barang | Ya | 2-150 karakter |
| Kategori | Ya | 2-80 karakter; combobox dengan pilihan yang pernah digunakan, termasuk ATK dan Elektronik |
| Spesifikasi | Tidak | Maksimal 500 karakter; merek, tipe, ukuran, warna, atau bahan |
| Satuan dasar | Ya | Pilihan awal pcs, box, rim, dus, unit; input lain diizinkan hingga 30 karakter |
| Harga pokok | Ya | Rupiah per satuan, tidak negatif, maksimal dua angka desimal |
| Harga jual | Ya | Rupiah per satuan, tidak negatif; tidak wajib lebih besar dari harga pokok |
| Stok awal baik | Ya saat tambah | Bilangan bulat >= 0; default 0; bukan field edit saldo berjalan |
| Tanggal saldo awal | Kondisional | Wajib bila stok awal > 0; tidak melewati hari ini |
| Foto | Tidak | JPEG/PNG/WebP, maksimal 2 MB; placeholder bila tidak ada |

Perilaku:

- Cari berdasarkan kode/nama; filter kategori dan status aktif/arsip; pagination default 10, pilihan 10/25/50.
- Perubahan nama, kategori, spesifikasi, foto, atau harga master tidak mengubah snapshot transaksi lama.
- Kode dan satuan hanya dapat diubah bila belum direferensikan transaksi atau pengiriman. Barcode selalu mengikuti kode master yang berlaku.
- Barang tanpa riwayat dapat dihapus setelah konfirmasi. Barang yang sudah direferensikan tidak dihapus permanen; tawarkan **Arsipkan** dengan penjelasan.
- Barang diarsipkan tetap masuk histori, ledger, dan laporan stok. Tidak dapat dipilih untuk transaksi/pengiriman baru, tetapi dapat diaktifkan kembali.
- Tidak ada menu CRUD kategori, supplier, pelanggan, satuan, atau gudang yang terpisah pada MVP.

Saldo awal 0 tidak membuat transaksi atau ledger saldo awal bernilai nol. Bila saldo awal > 0, pembuatan barang dan posting saldo awal berada dalam satu transaksi database yang idempoten.

### 6.4 FR-04 Barang Masuk

Halaman berisi daftar penerimaan, pencarian, filter tanggal/barang/status, tombol Tambah Barang Masuk, dan detail penerimaan.

Pada pemilihan barang, sediakan aksi **Scan Barcode** yang membuka pemindai FR-09 lalu mengisi barang yang telah dikonfirmasi. Dropdown/pencarian tetap dapat digunakan bila kamera tidak tersedia.

| Kelompok | Field | Wajib dan perilaku |
| --- | --- | --- |
| Barang | Nama barang | Wajib memilih barang aktif dari master |
| Barang | Kode, kategori, spesifikasi, satuan | Terisi dari master dan read-only; disimpan sebagai snapshot |
| Penerimaan | Tanggal masuk | Wajib, default hari ini, mengikuti aturan tanggal ledger |
| Penerimaan | Nomor dokumen penerimaan | Wajib, maksimal 100 karakter; nomor eksternal supplier |
| Penerimaan | Supplier | Wajib, maksimal 150 karakter |
| Penerimaan | Jumlah | Wajib, bilangan bulat > 0 |
| Penerimaan | Kondisi barang | Wajib: Baik atau Rusak |
| Penerimaan | Lokasi penyimpanan | Wajib, maksimal 150 karakter |
| Harga | Harga pokok | Wajib, default dari master, dapat diubah, >= 0 |
| Harga | Total nilai | Read-only, jumlah × harga pokok; dihitung ulang server |
| Lainnya | Keterangan | Opsional, maksimal 1000 karakter |

Setelah Simpan berhasil, tampilkan nomor transaksi internal, total nilai, dan panel stok sebelum/perubahan/sesudah. Contoh: stok baik 20, masuk 30, menjadi 50. Jika kondisi Rusak, panel harus menyebut perubahan pada stok rusak dan total fisik.

Harga transaksi tidak mengubah harga pokok master. Nomor internal otomatis berbeda dari nomor dokumen supplier; satu surat jalan dapat dipakai untuk beberapa catatan barang sehingga nomor dokumen eksternal tidak wajib unik.

### 6.5 FR-05 Barang Keluar

Halaman berisi daftar pengeluaran, pencarian, filter tanggal/barang/alasan/status, tombol Tambah Barang Keluar, dan detail pengeluaran.

Sediakan aksi **Scan Barcode** pada pilihan barang. Hasil scan hanya memilih produk dan memuat stok terbaru; pengguna tetap mengisi jumlah serta menekan Simpan untuk mencatat pengeluaran.

| Kelompok | Field | Wajib dan perilaku |
| --- | --- | --- |
| Barang | Nama barang | Wajib memilih barang aktif |
| Barang | Kode, kategori, spesifikasi, satuan | Otomatis dari master, read-only, disimpan sebagai snapshot |
| Pengeluaran | Tanggal keluar | Wajib, default hari ini, mengikuti aturan tanggal ledger |
| Pengeluaran | Nomor dokumen pengeluaran | Wajib, maksimal 100 karakter |
| Pengeluaran | Alasan keluar | Wajib: Penjualan, Pemakaian, atau Retur |
| Pengeluaran | Kondisi stok yang dikeluarkan | Default Baik; pilihan Rusak hanya muncul untuk Retur |
| Pengeluaran | Stok tersedia | Otomatis untuk kondisi yang dipilih; read-only |
| Pengeluaran | Jumlah | Wajib, bilangan bulat > 0 dan <= stok tersedia |
| Pengeluaran | Tujuan/pelanggan | Wajib, maksimal 150 karakter |
| Harga | Harga jual | Wajib, default master, dapat diubah, >= 0; boleh 0 untuk pemakaian/retur |
| Harga | Total nilai | Read-only, jumlah × harga jual, diverifikasi server |
| Lainnya | Keterangan | Opsional, maksimal 1000 karakter |

Setelah Simpan berhasil, tampilkan panel stok. Contoh: stok baik 50, keluar 10, menjadi 40. Jika stok berubah sejak form dibuka, server memeriksa saldo terbaru dan menampilkan pesan “Stok tersedia saat ini X [satuan]. Sesuaikan jumlah barang keluar.” Input lain tetap dipertahankan.

### 6.6 FR-06 Aturan stok dan koreksi

**INV-01 Sumber stok.** Semua perubahan saldo harus mempunyai `inventory_movements`. Saldo pada produk adalah cache yang diperbarui dalam transaksi database yang sama. Untuk setiap barang dan kondisi, saldo harus selalu sama dengan jumlah delta ledger.

**INV-02 Dampak operasi.**

| Operasi | Stok baik | Stok rusak | Catatan |
| --- | --- | --- | --- |
| Saldo awal | +jumlah | 0 | Hanya ketika membuat produk |
| Masuk Baik | +jumlah | 0 | Penerimaan |
| Masuk Rusak | 0 | +jumlah | Tidak dapat dijual/dipakai |
| Keluar Baik | -jumlah | 0 | Penjualan, pemakaian, atau retur |
| Keluar Rusak | 0 | -jumlah | Hanya retur |
| Pembatalan | Kebalikan delta asli | Kebalikan delta asli | Mengikuti kondisi transaksi asli |
| Buat/ubah status pengiriman | 0 | 0 | Tidak ada posting ledger |

**INV-03 Atomisitas.** Posting/pembatalan menggunakan database transaction dan row lock pada produk. Validasi saldo, penulisan transaksi, ledger, dan pembaruan cache harus atomik. Kegagalan salah satu langkah membatalkan semuanya. Uji konkurensi memakai MySQL/InnoDB, bukan hanya SQLite. Pembatalan Barang Keluar juga mengunci catatan transaksi keluar sebelum memeriksa alokasinya. Operasi pengiriman mengunci catatan yang sama, lalu membaca ulang status dan jumlah alokasi, sehingga pembatalan keluar dan pembuatan pengiriman tidak dapat lolos bersamaan. Pertahankan urutan lock konsisten: produk bila diperlukan, transaksi keluar terurut ID, lalu pengiriman. Service pengiriman tidak mengambil lock produk sesudah lock transaksi keluar.

**INV-04 Idempotensi.** Setiap form yang mengubah stok mempunyai token idempotensi. Retry atau double click dengan token dan payload sama mengembalikan hasil transaksi sebelumnya. Token sama dengan payload berbeda ditolak sebagai konflik. Tambahkan unique constraint dan jangan hanya mengandalkan tombol disabled.

**INV-05 Tidak negatif.** Stok baik maupun rusak tidak boleh negatif. Total fisik = baik + rusak. Validasi dilakukan pada server dalam lock, bukan sekadar pada React.

**INV-06 Tanggal.** Gunakan zona waktu Asia/Jakarta untuk tanggal bisnis. Tanggal transaksi tidak melewati hari ini dan tidak lebih awal dari tanggal gerakan terakhir produk. Transaksi pada hari yang sama diurutkan berdasarkan waktu pencatatan dan ID. Aturan ini adalah penyederhanaan MVP agar histori tidak menghasilkan saldo masa lalu negatif. Bila saldo awal > 0, tanggalnya menjadi awal ledger produk.

**INV-07 Pembatalan.** Catatan masuk/keluar memiliki status Tersimpan atau Dibatalkan. Pembatalan membutuhkan alasan 5-500 karakter dan konfirmasi. Catatan asli serta ledger asli tetap ada; tambahkan satu ledger reversal bertanggal hari pembatalan. Tanggal dan total transaksi asli tidak ditulis ulang. Pembatalan kedua ditolak tanpa mengubah saldo.

- Pembatalan Barang Masuk ditolak jika pengurangan balik membuat saldo kondisi terkait negatif.
- Pembatalan Barang Keluar ditolak selama masih memiliki alokasi pengiriman yang belum dibatalkan.
- Pembatalan tidak mengedit harga, jumlah, atau penerima; buat transaksi pengganti bila perlu.
- Saldo awal tidak dibatalkan melalui UI MVP. Barang yang masih tanpa referensi selain saldo awal tetap diperlakukan sebagai memiliki riwayat dan dapat diarsipkan.

**INV-08 Nomor.** Buat nomor internal unik per ruang praktik dan jenis, misalnya `BM-20261022-0001`, `BK-20261022-0001`, dan `KRM-20261022-0001`. Gunakan penomoran atomik atau unique constraint dengan retry terbatas. Nomor dokumen eksternal tidak menggantikan ID internal.

**INV-09 Nilai uang.** Simpan uang sebagai DECIMAL, jangan binary float. Server menghitung total hingga dua angka desimal. Tampilan menggunakan format Indonesia/Rupiah. Jumlah per catatan dibatasi 1-1.000.000 unit dan harga satuan maksimal Rp999.999.999,99; saldo awal boleh 0. Validasi total agar tetap dalam kapasitas DECIMAL(18,2). Nilai transaksi adalah latihan pencatatan, bukan laporan laba atau valuasi persediaan.

### 6.7 FR-07 Transportasi

Daftar pengiriman menampilkan nomor, jenis pengiriman, asal, tujuan, moda, tanggal, status, dan aksi. Sediakan pencarian nomor/tujuan, filter jenis/moda/status/tanggal, detail, ubah pengiriman terjadwal, serta aksi perubahan status.

Pada ponsel gunakan wizard lima langkah sesuai lima kelompok client. Nilai form tidak hilang ketika berpindah langkah. Penyimpanan dilakukan setelah validasi akhir; draft server dan autosave bukan MVP. Jenis pengiriman dipilih di awal agar field impor/ekspor yang relevan dapat disiapkan.

Pembuatan pengiriman juga memakai token idempotensi dan request hash, sehingga retry tidak membuat dua pengiriman dengan alokasi ganda. Satu nomor transaksi keluar hanya boleh muncul sekali di dalam satu pengiriman; jumlah alokasi dihitung kembali oleh server ketika menyimpan atau mengubah pengiriman. Pembatalan, edit item, dan perubahan status harus diserialkan dengan lock yang konsisten.

#### A. Pemilihan moda

| Field | Aturan |
| --- | --- |
| Nomor pengiriman | Otomatis, read-only |
| Jenis pengiriman | Wajib: Domestik, Ekspor, Impor |
| Barang dan jumlah | Wajib, minimal satu baris; mengikuti aturan alokasi di bawah |
| Asal | Wajib, maksimal 150 karakter |
| Tujuan | Wajib, maksimal 150 karakter |
| Moda | Wajib: Darat, Laut, Udara |
| Jenis kendaraan/armada | Wajib, maksimal 100 karakter |
| Pengemudi/operator | Opsional, maksimal 150 karakter |
| Jasa pengangkut/ekspedisi | Opsional, maksimal 150 karakter; boleh pengangkut internal sekolah pada simulasi |
| Nomor resi/referensi pengangkut | Opsional, maksimal 100 karakter |
| Dasar pemilihan moda | Wajib, maksimal 1000 karakter; jarak, biaya, waktu tempuh, dan sifat barang |
| Estimasi biaya | Wajib, rupiah >= 0; default 0 |

#### B. Penanganan muatan

| Field | Aturan |
| --- | --- |
| Jenis muatan | Wajib: Umum, Mudah Pecah, Cair, Mudah Rusak, Lainnya |
| Rincian jenis lainnya | Wajib bila memilih Lainnya |
| Berat total | Wajib, kg > 0, maksimal tiga angka desimal |
| Volume | Opsional, m3 > 0 bila diisi, maksimal tiga angka desimal |
| Jenis kemasan | Wajib: Dus, Palet, Peti, Kontainer, Lainnya; rincian bila lainnya |
| Cara penanganan | Wajib, maksimal 1000 karakter |
| Catatan khusus | Opsional, maksimal 1000 karakter |

#### C. Jadwal dan status

| Field | Aturan |
| --- | --- |
| Tanggal pengiriman | Wajib; rencana berangkat boleh tanggal mendatang |
| Estimasi tiba | Wajib, tidak sebelum tanggal pengiriman |
| Tanggal diterima | Kosong sebelum status Diterima; wajib ketika Diterima; >= tanggal pengiriman dan <= hari ini |
| Status | Saat create selalu Dijadwalkan; perubahan melalui aksi status khusus |

Transisi status normal:

| Dari | Ke | Syarat |
| --- | --- | --- |
| Dijadwalkan | Dikirim | Tanggal pengiriman tidak di masa depan; alokasi tetap valid |
| Dikirim | Dalam Perjalanan | Pengiriman belum dibatalkan |
| Dalam Perjalanan | Diterima | Tanggal diterima valid |

Tidak ada transisi mundur atau lompat status pada MVP. Simpan histori status beserta waktu perubahan. Data moda, barang, jumlah, dan jadwal hanya dapat diedit saat Dijadwalkan. Sesudah Dikirim, pengguna masih dapat menambah dokumen dan memperbarui status/tanggal diterima melalui aksi yang diizinkan.

Pembatalan pengiriman hanya boleh saat Dijadwalkan, membutuhkan alasan, dan ditandai **Dibatalkan** sebagai badge tambahan di luar empat status alur normal. Pembatalan melepas alokasi; tidak memulihkan stok karena modul transportasi tidak pernah mengurangi stok. Pengiriman yang sudah berjalan tidak memiliki pembatalan operasional pada MVP.

Nama pengangkut dan nomor resi merupakan data referensi yang dapat dilengkapi sampai status Dikirim. Status baseline diperbarui oleh siswa sesuai kasus praktik. Jika integrasi ekspedisi ditambahkan setelah provider ditentukan, perubahan status dari provider harus mengikuti aturan status dan tidak mengubah stok. Jangan menampilkan pelacakan GPS atau membuat lokasi kendaraan simulasi yang seolah-olah merupakan data realtime.

#### D. Dokumen pengiriman

Jenis dokumen yang tersedia:

- Surat Jalan.
- Faktur/Invoice.
- Packing List.
- Bukti Terima.
- Bill of Lading untuk moda Laut.
- Airway Bill untuk moda Udara.
- PEB, PIB, Commercial Invoice, Certificate of Origin, dan Dokumen Pendukung Lain untuk ekspor/impor.

Setiap catatan dokumen memiliki jenis, nomor dokumen wajib, tanggal opsional, catatan opsional, dan lampiran opsional. Lampiran dibatasi PDF/JPEG/PNG, maksimal 5 MB per berkas, maksimal 10 berkas per pengiriman. Nomor dokumen cukup untuk latihan; lampiran asli tidak wajib.

Jenis dokumen yang tidak sesuai moda/jenis pengiriman tidak ditawarkan dan ditolak server jika dipaksakan. Dokumen tidak harus lengkap untuk menyimpan pengiriman atau mengubah status; tampilkan checklist kelengkapan sebagai informasi pembelajaran, bukan validasi administratif resmi. Bukti Terima boleh ditambahkan setelah Diterima.

#### E. Ekspor dan impor

| Field | Domestik | Ekspor/Impor |
| --- | --- | --- |
| Negara asal dan negara tujuan | Diset Indonesia | Keduanya wajib; minimal satu berbeda dari Indonesia |
| Syarat penyerahan/Incoterms | Tidak digunakan | Input teks wajib, misalnya FOB atau CIF; maksimal 30 karakter |
| Dokumen kepabeanan | Tidak digunakan | Pilihan PEB untuk Ekspor atau PIB untuk Impor; metadata opsional |
| Dokumen pendukung | Opsional sesuai daftar | Commercial Invoice, Packing List, Certificate of Origin, lainnya |
| Bea dan pajak | 0 atau tidak ditampilkan | Input manual rupiah >= 0; default 0 |

Untuk Ekspor, negara asal harus Indonesia dan tujuan negara lain. Untuk Impor, negara asal negara lain dan tujuan Indonesia. Ini batas simulasi MVP. Tidak ada kurs, penetapan tarif, validasi Incoterms secara hukum, atau integrasi pemerintah.

#### F. Hubungan dengan barang dan transaksi

Domestik dan Ekspor:

1. Setiap baris memilih transaksi Barang Keluar yang masih aktif dari ruang yang sama.
2. Barang, kondisi, dan satuan mengikuti snapshot transaksi tersebut.
3. Jumlah alokasi harus > 0 dan tidak melebihi jumlah transaksi keluar dikurangi alokasi seluruh pengiriman yang belum dibatalkan. Ketika mengedit, keluarkan alokasi pengiriman yang sedang diedit dari perhitungan pemakaian sebelumnya, lalu validasi seluruh nilai penggantinya secara atomik. Tanggal rencana pengiriman tidak boleh lebih awal dari tanggal transaksi keluar yang dirujuk.
4. Satu pengiriman boleh berisi beberapa transaksi keluar, tetapi seluruhnya harus memiliki tujuan/pelanggan yang sama. Tujuan awal disalin dari transaksi pertama.
5. Satu transaksi keluar dapat dibagi ke beberapa pengiriman. Pengiriman Diterima tetap mengonsumsi alokasi; hanya pembatalan pengiriman terjadwal yang melepasnya.
6. Validasi alokasi dijalankan dalam transaksi database dengan lock pada transaksi keluar, urut ID untuk mengurangi deadlock.

Impor:

1. Setiap baris memilih barang aktif dari master dan jumlah > 0.
2. Tidak memerlukan Barang Keluar dan tidak mengonsumsi alokasi keluar.
3. Status Diterima tidak membuat Barang Masuk. Tampilkan penjelasan dan tautan ke form Barang Masuk agar penerimaan dicatat secara eksplisit.
4. Rekonsiliasi otomatis antara kuantitas impor dan penerimaan bukan MVP. Sistem tidak mengklaim telah mencatat penerimaan hanya karena pengiriman diterima.

### 6.8 FR-08 Katalog Barang

- Tampilkan barang aktif milik ruang praktik dalam kartu: foto, nama, kode, kategori, harga jual, dan tombol Lihat Detail.
- Sediakan pencarian kode/nama, filter kategori, dan pagination.
- Detail memuat spesifikasi, satuan, harga jual, serta stok baik tersedia; tampilkan status Habis bila stok baik 0.
- Foto yang tidak ada memakai placeholder konsisten.
- Katalog menampilkan produk dari ruang praktik siswa. Aksi utamanya adalah Lihat Detail; nilai harga digunakan untuk latihan logistik. Akses katalog tetap memeriksa pemilik akun.
- Grid: satu kolom pada ponsel sempit, dua kolom bila ruang cukup, tiga sampai empat pada desktop.

### 6.9 FR-09 Barcode dan pemindai mobile

- Pengguna memilih barang aktif, menekan Generate Barcode, lalu melihat pratinjau Code 128.
- Payload persis kode barang, misalnya `BRG001`. Cetak nama dan kode sebagai teks di luar area garis barcode.
- Kode sama menghasilkan payload barcode yang sama; tidak menulis data stok atau membuat transaksi.
- Download mengunduh SVG valid dengan nama aman, misalnya `barcode-BRG001.svg`.
- Cetak membuka tampilan cetak yang hanya memuat label, tanpa sidebar dan tombol. Gunakan label default 60 x 35 mm untuk kode pendek seperti BRG001, dengan quiet zone dan kontras hitam-putih yang memadai. Kode panjang memakai label yang lebih lebar; jangan memampatkan garis barcode agar dipaksakan masuk ke ukuran tetap.
- Ponsel menggunakan dialog cetak/simpan sistem bila didukung browser. Ketersediaan printer fisik bukan syarat aplikasi berfungsi.

Pemindai barcode:

1. Tombol **Scan Barcode** tersedia pada modul Barcode serta pilihan barang di Barang Masuk/Barang Keluar. Kamera hanya aktif setelah pengguna menekan tombol dan menyetujui izin browser.
2. Gunakan kamera belakang bila tersedia, area pratinjau yang jelas, tombol tutup, dan petunjuk singkat. Tidak meminta mikrofon atau lokasi. Akses kamera membutuhkan secure context; gunakan HTTPS pada server dan localhost pada development.
3. Decoder harus mendukung Code 128 yang dihasilkan aplikasi. Gunakan library browser yang kompatibel dan lazy load; jangan bergantung hanya pada API BarcodeDetector yang dukungannya tidak seragam.
4. Setelah kode terbaca, hentikan pembacaan berulang, tampilkan kode/nama barang dari ruang pengguna, lalu minta konfirmasi **Gunakan Barang Ini**. Scan di modul Barcode membuka detail barang; scan di form transaksi mengisi pilihan barang tanpa mengirim form.
5. Hasil scan divalidasi dan dicari pada server di ruang akun aktif. Barcode berisi kode barang, bukan token akses. Kode yang sama pada akun berbeda selalu merujuk barang akun yang sedang login.
6. Bila barang tidak ditemukan, tampilkan pesan dan pilihan pencarian manual atau Tambah Barang. Jangan membuat produk otomatis, membuka URL dari payload, atau mengubah stok.
7. Bila izin ditolak, kamera tidak tersedia, atau kode gagal terbaca, pengguna tetap dapat mengetik kode/memilih barang. Sediakan opsi membaca barcode dari gambar lokal JPEG/PNG/WebP sebagai bantuan; gambar diproses di browser dan tidak disimpan sebagai data praktik.
8. Kamera dan seluruh media track harus dihentikan ketika scan berhasil, dialog ditutup, halaman ditinggalkan, atau komponen dilepas. Hentikan stream juga bila izin baru diberikan setelah dialog sudah ditutup. Frame kamera tidak direkam atau dikirim sebagai upload aplikasi.
9. Pindai berkali-kali tidak boleh membuat transaksi stok. Penambahan/pengurangan stok hanya dilakukan melalui form dan aturan FR-06.

### 6.10 FR-10 Laporan dan Excel

Halaman Laporan memiliki lima tab, pratinjau server-side, ringkasan jumlah baris, dan tombol Download Excel. File harus XLSX asli yang dapat dibuka di Excel/LibreOffice, bukan CSV/HTML dengan ekstensi yang diganti.

| Tab | Kolom minimal | Filter utama |
| --- | --- | --- |
| Data Barang | Kode, nama, kategori, spesifikasi, satuan, harga pokok, harga jual, stok baik, stok rusak, stok fisik, status barang | Kata kunci, kategori, aktif/arsip |
| Barang Masuk | Nomor internal, tanggal masuk, nomor dokumen, kode/nama/kategori/satuan snapshot, jumlah, kondisi, supplier, lokasi, harga pokok, total nilai, keterangan, status, waktu/alasan pembatalan | Rentang tanggal transaksi, barang, kategori snapshot, kondisi, status |
| Barang Keluar | Nomor internal, tanggal keluar, nomor dokumen, kode/nama/kategori/satuan snapshot, jumlah, kondisi, tujuan, alasan, harga jual, total nilai, keterangan, status, waktu/alasan pembatalan | Rentang tanggal transaksi, barang, kategori snapshot, alasan, kondisi, status |
| Stok | Kode, nama, satuan, saldo sebelum periode baik/rusak, saldo awal produk dalam periode baik/rusak, masuk baik/rusak, keluar baik/rusak, koreksi pembatalan baik/rusak bertanda +/-, saldo akhir baik/rusak/fisik | Rentang tanggal ledger, barang, kategori master, status barang |
| Pengiriman | Nomor, jenis, asal, tujuan, negara asal/tujuan, moda, armada, operator, jasa pengangkut, nomor resi, dasar pemilihan, muatan, berat, volume, kemasan, penanganan, catatan, tanggal kirim, estimasi, diterima, status, biaya, Incoterms, bea/pajak, pembatalan | Rentang tanggal kirim, jenis, moda, status |

Laporan Pengiriman menggunakan tiga sheet: **Pengiriman** untuk header, **Detail Barang** untuk nomor pengiriman, referensi keluar bila ada, kode/nama/satuan/kondisi/jumlah; dan **Dokumen** untuk nomor pengiriman, jenis, nomor, tanggal, serta ada/tidak lampiran. Jangan menaruh tautan akses privat permanen di Excel.

Aturan laporan:

1. Filter dan hasil query digunakan bersama untuk pratinjau dan ekspor. Ekspor mencakup seluruh baris yang memenuhi filter, bukan hanya halaman pagination yang terlihat.
2. Tanggal default tab transaksi/pengiriman/stok adalah awal bulan sampai hari ini. Data Barang adalah kondisi saat ekspor dan tidak mempunyai filter tanggal historis.
3. Tab Stok memakai tanggal efektif ledger: saldo sebelum awal periode + gerakan selama periode = saldo akhir. Reversal dihitung pada hari pembatalan, bukan ditarik mundur ke tanggal transaksi asli.
   Saldo awal produk yang dibuat di dalam rentang laporan muncul sebagai kolom tambahan **Saldo Awal Produk dalam Periode** per kondisi. Kolom ini terpisah dari penerimaan supplier. Perhitungan lengkap adalah saldo sebelum periode + saldo awal produk dalam periode + masuk - keluar + reversal. Barang yang belum memiliki gerakan pada tanggal akhir mempunyai saldo historis 0; tab Stok tidak mengambil cache saldo saat ini untuk tanggal lampau.
4. Laporan masuk/keluar menunjukkan status terkini dari transaksi bertanggal dalam filter. Default semua status, dengan ringkasan aktif dan dibatalkan dipisah. Jumlah awal baris yang dibatalkan tetap ditampilkan tetapi tidak dimasukkan sebagai transaksi aktif.
5. Ringkasan transaksi berdasarkan status terkini tidak diklaim sebagai saldo historis. Rekonsiliasi stok per periode memakai tab Stok yang memasukkan reversal pada tanggalnya.
6. Master memakai harga saat ini; transaksi memakai harga snapshot. Tidak ada nilai persediaan FIFO/average pada laporan stok.
7. XLSX memuat judul, nama siswa dari profil akun, waktu ekspor, dan ringkasan filter; header tebal, autofilter, freeze header, lebar kolom terbaca, format tanggal/numerik/Rupiah yang sesuai. Angka tersimpan sebagai angka.
8. Teks dari pengguna yang diawali `=`, `+`, `-`, atau `@` ditulis eksplisit sebagai string agar tidak menjadi formula Excel. Angka negatif yang memang numerik tetap bertipe angka.
9. Data kosong tetap dapat diekspor sebagai workbook valid dengan header dan keterangan tidak ada data.
10. Nama file aman, misalnya `logistik-lab-barang-masuk-20261001-20261022.xlsx`.

## 7. Desain UI mobile first

Ponsel adalah perangkat utama dan dasar pengambilan keputusan desain. Rancang alur, urutan informasi, form, dan navigasi pada lebar 360-390 px terlebih dahulu, kemudian perluas ke tablet dan desktop. Hasilnya tetap website Laravel/React yang dibuka melalui browser ponsel; pilihan teknologi distribusi tambahan mengikuti kebutuhan produk.

### 7.1 Arah visual

Gunakan tampilan aplikasi pembelajaran yang bersih: latar abu muda, panel putih, teks gelap, aksen biru/teal, dan tipografi sans-serif yang terbaca. Pakai font sistem agar tidak bergantung pada layanan font eksternal. Wordmark LOGISTIK LAB boleh berupa teks; jangan menambahkan logo sekolah yang belum diberikan.

Gunakan bahasa Indonesia pada semua label, pesan validasi, empty state, dan notifikasi. Jangan menampilkan nama framework atau istilah database pada layar siswa. Istilah logistik seperti supplier, invoice, dan Incoterms dapat digunakan dengan bantuan singkat.

### 7.2 Tata letak

| Ukuran | Perilaku |
| --- | --- |
| Mobile 320-767 px | Header ringkas, lima menu bawah tetap, bottom sheet untuk submenu, form satu kolom, daftar kartu, CTA utama dalam jangkauan ibu jari |
| Tablet 768-1023 px | Navigasi compact; form dapat dua kolom bila label terbaca |
| Desktop >= 1024 px | Sidebar tetap, area konten utama, tabel dengan pagination |

- Tidak boleh ada horizontal scroll pada keseluruhan halaman di lebar 320 px. Pratinjau laporan/tabel yang benar-benar lebar boleh memiliki scroll di kontainer berlabel.
- Menu bawah: Beranda, Barang, Transaksi, Pengiriman, Lainnya. Highlight menu aktif, tampilkan teks bersama ikon, dan pertahankan akses ke semua modul sumber. Transaksi menampilkan aksi Masuk dan Keluar; Lainnya menyediakan Katalog, Barcode, Laporan, Profil, dan Keluar.
- Gunakan padding bawah untuk tinggi navigasi dan safe area perangkat (`env(safe-area-inset-bottom)`). Konten terakhir, tombol Simpan, dan dialog tidak boleh tertutup menu bawah.
- Target sentuh minimal 44 x 44 px. Input ponsel minimal 16 px; keyboard numerik untuk angka tanpa menghilangkan kemampuan memasukkan desimal yang sah.
- Form Barang Masuk/Barang Keluar dibagi ke kelompok Barang, Rincian Transaksi, dan Ringkasan. Panel stok serta total nilai mudah ditemukan sebelum Simpan; informasi inti tidak tersembunyi di tabel lebar.
- Form transportasi menggunakan stepper, tombol Sebelumnya/Berikutnya, ringkasan kesalahan, dan review sebelum Simpan Pengiriman.
- Tombol simpan disabled saat mengirim. Tampilkan loading/success/error, tetapi status berhasil hanya setelah server mengonfirmasi.
- Filter dapat diringkas dalam drawer ponsel. Nilai filter ada pada URL agar refresh dan tombol kembali tetap konsisten.
- Sticky action tidak menutup input, notifikasi, atau bagian bawah konten ketika keyboard ponsel terbuka.
- Tombol Back mengikuti urutan halaman/dialog yang wajar. Menutup scan kembali ke form dengan input tetap ada. Rotasi layar tidak menghapus form atau menggandakan pengiriman request.
- Foto dan file dapat dipilih dari penyimpanan ponsel; kamera pengambilan foto merupakan pilihan bila didukung browser. Scan barcode mempunyai izin kamera terpisah yang diminta saat dipakai.
- Download Excel/SVG menggunakan respons berkas yang benar untuk browser ponsel. Sediakan status proses dan pesan jika browser menolak membuka/menyimpan hasil; jangan membuat fungsi unduh hanya bekerja di desktop.
- Prioritas pemeriksaan adalah Chrome Android dan Safari iOS. Uji mobile menggunakan emulasi serta perangkat nyata bila tersedia; dokumentasikan jika pengujian perangkat nyata belum dilakukan.

### 7.3 State antarmuka yang wajib

| State | Perilaku |
| --- | --- |
| Belum ada barang | Penjelasan singkat dan CTA Tambah Barang; form transaksi tidak menampilkan pilihan palsu |
| Hasil pencarian kosong | Jelaskan tidak ada hasil dan sediakan hapus filter |
| Mengirim form | Indikator proses, cegah double click, pertahankan input |
| Validasi gagal | Pesan per field, fokus ke error pertama, pertahankan semua input yang aman |
| Gangguan jaringan/server | Pesan jelas, opsi coba lagi, tidak mengaku data sudah tersimpan |
| Stok/alokasi berubah | Tampilkan nilai terbaru dan minta penyesuaian jumlah |
| Perubahan belum disimpan | Konfirmasi sebelum meninggalkan form yang berubah |
| Gambar gagal | Placeholder dengan teks alternatif |
| Aksi berisiko | Konfirmasi hapus/arsip/batal dengan nama atau nomor catatan |
| Sesi berakhir | Penjelasan dan CTA login kembali ke akun yang sama; data praktik tidak direset |
| Kamera ditolak/tidak tersedia | Jelaskan keadaan dan tawarkan input kode/pilih barang manual |
| Barcode tidak dikenal | Tampilkan kode yang terbaca dan opsi pencarian/tambah barang, tanpa mengubah stok |

Semua input mempunyai label terhubung, navigasi keyboard berfungsi, fokus terlihat, dialog dapat ditutup secara wajar, dan status tidak dibedakan hanya berdasarkan warna. Target kontras teks normal minimal 4,5:1.

## 8. Model data konseptual

Nama tabel boleh disesuaikan dengan konvensi repository, tetapi hubungan, atribut wajib, dan invariant berikut harus dipertahankan. Gunakan migration, foreign key, index, dan constraint yang sesuai.

| Entitas | Atribut inti |
| --- | --- |
| `users` | id, name, email unik, email_verified_at nullable, password hash, remember_token, timestamps; NIS/kelas opsional bila kebutuhan sekolah sudah dirinci |
| `password_reset_tokens` | Tabel token reset password mengikuti mekanisme Laravel; token disimpan dalam bentuk hash dan mempunyai masa berlaku |
| `practice_workspaces` | id, user_id unik, created_at, last_activity_at |
| `sessions` | Tabel session Laravel terkait user_id; session bukan sumber kepemilikan permanen ruang |
| `products` | id, workspace_id, code, name, category, specification, base_unit, cost_price, selling_price, photo_path, stock_good, stock_damaged, archived_at, timestamps |
| `stock_transactions` | id, workspace_id, product_id, transaction_number, type opening/inbound/outbound, transaction_date, external_document_number, supplier, recipient, reason, storage_location, stock_condition, quantity, unit_price, total_amount, notes, product_snapshot, idempotency_key, request_hash, voided_at, void_reason, timestamps |
| `inventory_movements` | id, workspace_id, product_id, stock_transaction_id, movement_kind original/reversal, stock_condition, quantity_delta, effective_date, created_at |
| `shipments` | id, workspace_id, shipment_number, shipment_type, origin, destination, origin_country, destination_country, mode, vehicle_type, operator_name, carrier_name, tracking_number, mode_reason, estimated_cost, cargo_type, cargo_other, total_weight_kg, volume_m3, packaging_type, packaging_other, handling_method, special_notes, departure_date, estimated_arrival_date, received_date, status, incoterms, duties_taxes, idempotency_key, request_hash, cancelled_at, cancellation_reason, timestamps |
| `shipment_items` | id, workspace_id, shipment_id, product_id, outbound_transaction_id nullable, quantity, product_snapshot, stock_condition nullable untuk impor |
| `shipment_documents` | id, workspace_id, shipment_id, document_type, document_number, document_date, notes, file_path nullable, original_name nullable, mime_type nullable, size_bytes nullable, timestamps |
| `shipment_status_events` | id, workspace_id, shipment_id, from_status, to_status, occurred_at |
| `workspace_counters` atau mekanisme setara | workspace_id, counter_type, periode jika digunakan, next_number; untuk penomoran yang aman saat konkuren |

Catatan implementasi:

- `workspace_id` wajib pada data bisnis. `practice_workspaces.user_id` merupakan foreign key unik ke pengguna, sehingga kepemilikan tetap sama lintas perangkat. Foreign key, scope query, dan pemeriksaan server mencegah referensi lintas ruang; jangan mengandalkan ID yang sukar ditebak.
- Tambahkan unique index `(workspace_id, code)` pada produk serta nomor transaksi/pengiriman sesuai lingkupnya.
- `idempotency_key` unik per ruang praktik pada masing-masing resource transaksi stok dan pembuatan pengiriman; reversal unik per transaksi. Gunakan request hash untuk membedakan retry dari payload yang berubah.
- Snapshot produk menyimpan minimal kode, nama, kategori, spesifikasi, dan satuan saat transaksi/pengiriman dibuat. JSON terstruktur boleh dipakai untuk snapshot, bukan untuk menggantikan relasi barang.
- Nominal menggunakan DECIMAL(18,2), berat dan volume DECIMAL(15,3), kuantitas bilangan bulat. Terapkan batas UI/server yang tidak melampaui kapasitas database.
- Index minimal pada `(workspace_id, transaction_date)`, `(workspace_id, product_id)`, `(workspace_id, departure_date)`, dan status pengiriman. Index ledger mencakup ruang, barang, kondisi, dan tanggal efektif.
- Tanggal bisnis menggunakan DATE. Timestamp disimpan konsisten dalam UTC dan ditampilkan sebagai Asia/Jakarta.
- Penghapusan produk bersejarah dibatasi oleh relasi. Penghapusan/ubah berkas terjadwal tidak menghapus transaksi stok.
- Mutasi pengiriman harus atomik untuk header, item, dan alokasi. Kegagalan upload harus dibersihkan atau direkonsiliasi agar tidak meninggalkan file tanpa catatan.

## 9. Kontrak backend dan akses data

Gunakan route web Laravel/Inertia. Endpoint download/media mengembalikan berkas, bukan halaman React.

| Resource/aksi | Operasi minimal |
| --- | --- |
| Akun | Register, login, logout, forgot/reset password, profil, ubah nama/password |
| Praktik | Start/resume milik akun terautentikasi |
| Produk | Index, create/store, show, edit/update, destroy bila belum terpakai, archive/reactivate |
| Barang Masuk | Index, create/store, show, void |
| Barang Keluar | Index, create/store, show, void |
| Pengiriman | Index, create/store, show, edit/update saat terjadwal, transition-status, cancel |
| Dokumen pengiriman | Store metadata/upload, show/download, update/delete hanya saat Dijadwalkan; sesudah dikirim bersifat tambahan saja |
| Katalog | Index dan detail dari query produk aktif |
| Barcode | Preview, download SVG, print view, lookup kode hasil scan/input manual pada ruang akun aktif |
| Laporan | Preview dan download XLSX untuk lima tipe yang diizinkan |
| Media produk | Serve foto setelah memeriksa ruang praktik |

Semua request memvalidasi daftar field yang boleh diubah. Abaikan/tolak field internal seperti `user_id`, `workspace_id`, role, saldo, harga total kiriman client, dan status yang tidak dapat diubah melalui aksi tersebut. Pilih respons 404 untuk resource milik ruang lain agar keberadaannya tidak dibocorkan. Request tanpa autentikasi diarahkan ke login untuk navigasi halaman atau menerima respons belum terautentikasi yang sesuai untuk endpoint data.

Gunakan respons validasi yang sesuai pola Inertia untuk form. Untuk endpoint JSON khusus, gunakan 422 pada field tidak valid dan 409 pada konflik stok/alokasi/idempotensi. Jangan mengembalikan pesan SQL atau stack trace kepada siswa.

## 10. Keamanan, performa, dan operasional

### 10.1 Keamanan akun, data praktik, dan kamera

- Gunakan HTTPS, cookie session HttpOnly, SameSite, dan Secure pada production; lindungi semua mutasi dengan CSRF.
- Gunakan pengguna terautentikasi dan relasi ruang miliknya di setiap query, termasuk foto, dokumen, barcode, lookup hasil scan, laporan, dan relasi nested.
- Simpan upload pada disk privat dengan nama acak. Jangan mengandalkan folder publik `/storage` untuk dokumen/foto milik ruang praktik.
- Validasi isi MIME dan ukuran berkas. Jangan menerima HTML, SVG upload, executable, atau nama path dari client. SVG barcode dihasilkan aplikasi sendiri dengan payload tervalidasi.
- Jangan merender catatan pengguna sebagai HTML mentah. Terapkan perlindungan formula injection pada Excel.
- Konfigurasikan batas upload dan rate limit yang wajar pada registrasi, login, reset password, lookup barcode, mutasi, dan ekspor; jadikan nilainya konfigurasi agar cocok dengan jaringan sekolah.
- Password menggunakan hashing Laravel; token reset tidak disimpan sebagai teks biasa. Login meregenerasi sesi dan logout menginvalidasi sesi aktif serta token CSRF.
- Profil baseline hanya meminta nama dan email untuk akun; NIS/kelas mengikuti kebutuhan sekolah. Jangan mencetak password, token sesi/reset, atau isi dokumen ke log aplikasi.
- Hanya minta kamera ketika Scan Barcode dipakai. Matikan track setelah selesai; frame diproses di browser. GPS realtime dikecualikan dan aplikasi tidak meminta izin lokasi pengiriman.
- `APP_DEBUG=false`, secret hanya di environment, dan `.env` tidak masuk repository.

### 10.2 Target kualitas

| Aspek | Kriteria |
| --- | --- |
| Pengalaman mobile | Alur inti termasuk login, scan/fallback, form, navigasi bawah, dan download selesai pada 360 x 800 serta 390 x 844; desktop 1440 px tetap dapat dipakai |
| Integritas | Tidak ada stok negatif, ledger ganda akibat retry, atau alokasi pengiriman berlebih |
| Persistensi | Data tetap sama setelah refresh, logout/login, dan login akun yang sama dari perangkat lain |
| Konsistensi laporan | Angka pratinjau dan Excel sesuai filter dan database yang sama |
| Skalabilitas dasar | Daftar memakai pagination/query server; hindari mengambil seluruh korpus data untuk sekadar menampilkan satu halaman |
| Kecepatan | Target respons server operasi biasa p95 <= 1 detik pada dataset 500 SKU dan 5.000 transaksi per ruang di staging; ukur dan laporkan lingkungan uji |
| Ekspor | Target XLSX 5.000 baris selesai <= 10 detik pada staging; jelaskan bila lingkungan tidak memenuhi |
| Frontend | Tidak ada error console pada alur inti dan tidak ada layout yang menutup aksi penting |

Target performa adalah sasaran implementasi, bukan hasil pengujian yang sudah dicapai. Lampirkan spesifikasi mesin dan jumlah request saat melaporkan hasil; jangan mengarang angka. Redis/queue khusus baru dibutuhkan bila pengukuran menunjukkan kebutuhan nyata.

### 10.3 Kebutuhan deployment

- Hosting harus mendukung PHP yang dipilih, ekstensi Laravel/library XLSX, MySQL, HTTPS, dan akses konfigurasi environment.
- Frontend dapat dibuild pada development/CI; production menyajikan hasil Vite build melalui Laravel. Server Node persisten tidak diperlukan pada baseline ini.
- Document root mengarah ke direktori `public`; file environment dan source privat tidak disajikan web server.
- Session database, storage privat, log, dan konfigurasi timezone tersedia. Konfigurasikan timeout sesi tidak aktif 120 menit dan pilihan Ingat Saya melalui autentikasi Laravel; data praktik tidak bergantung pada umur sesi.
- Konfigurasikan mail untuk pemulihan password; gunakan mail capture pada development dan provider SMTP/API email yang dipilih pengelola pada production. Token reset tidak boleh tersedia melalui endpoint publik atau log production.
- HTTPS wajib pada akses kamera production. Pastikan kebijakan browser/server mengizinkan kamera untuk origin aplikasi sendiri, lalu uji penolakan izin dan fallback manual.
- Sediakan backup database dan storage melalui mekanisme hosting; jelaskan langkah pemulihan di README. Jangan membuat UI backup admin pada MVP.
- Migrasi production harus dijalankan terkontrol. Jangan memakai `migrate:fresh` pada data yang sudah digunakan.
- Tempat hosting/domain belum dipilih dan tidak menghalangi implementasi lokal. Rincian production diselesaikan ketika target hosting tersedia.

## 11. Skenario uji dan acceptance criteria

Setiap AC harus dapat ditunjukkan dengan UI atau tes otomatis yang relevan. Test untuk stok dan alokasi memverifikasi efek database, bukan hanya keberadaan tombol atau teks.

| ID | Skenario | Hasil yang diterima |
| --- | --- | --- |
| AC-01 | Register dan login siswa | Akun valid dapat mengakses praktik; ruang dibuat satu kali; tamu tidak dapat mengakses data privat; login salah ditolak |
| AC-02 | Refresh, logout, login lintas perangkat | Data tetap ada pada akun yang sama; logout mencabut sesi aktif; login dari perangkat lain melanjutkan ruang yang sama |
| AC-03 | Dua akun berbeda | Data akun A tidak terlihat pada akun B; akses paksa ID, media, dokumen, lookup barcode, atau ekspor A ditolak walaupun browser/perangkat sama |
| AC-04 | Membuat barang | Kode unik, foto opsional, satuan dan harga valid; stok awal masuk ledger tepat satu kali |
| AC-05 | Ubah/hapus/arsip | Master berubah sesuai aturan; histori tidak berubah; barang terpakai tidak terhapus permanen |
| AC-06 | Masuk baik | Saldo awal 20 + masuk 30 = baik 50; total 30 x Rp3.000 = Rp90.000 |
| AC-07 | Keluar baik | Dari baik 50 keluar 10 menjadi 40; total 10 x Rp5.000 = Rp50.000 |
| AC-08 | Keluar melebihi saldo | Dari 40 diminta 41 ditolak; tidak ada transaksi/ledger/saldo parsial |
| AC-09 | Kondisi rusak | Baik 40 + masuk rusak 5 = fisik 45, tersedia baik 40; penjualan rusak ditolak; retur rusak 2 menyisakan rusak 3 |
| AC-10 | Submit diulang | Dua request token/payload sama menghasilkan satu transaksi dan satu perubahan saldo |
| AC-11 | Dua pengeluaran bersamaan | Saldo 10, dua request independen masing-masing 8: hanya satu berhasil, saldo akhir 2 |
| AC-12 | Pembatalan | Satu reversal, alasan tersimpan; pembatalan ulang tidak mengubah saldo; pembatalan masuk yang menyebabkan negatif ditolak |
| AC-13 | Pengiriman domestik/ekspor | Referensi transaksi keluar aktif valid; seluruh lima kelompok form tersimpan dan dapat dibaca kembali |
| AC-14 | Tidak ada pengurangan stok ganda | Membuat pengiriman dan melewati seluruh status mempertahankan saldo setelah Barang Keluar |
| AC-15 | Batas alokasi | Transaksi keluar 10 dialokasikan 6 dan 4; alokasi tambahan 1 ditolak, termasuk pada dua request konkuren |
| AC-16 | Pembatalan dan alokasi | Pengiriman terjadwal dibatalkan melepas alokasi tanpa mengubah stok; Barang Keluar dengan pengiriman aktif tidak dapat dibatalkan |
| AC-17 | Status dan tanggal | Urutan sah berhasil; transisi mundur/lompat, keberangkatan belum waktunya, dan tanggal diterima tidak valid ditolak |
| AC-18 | Impor | Rencana impor dapat dicatat tanpa Barang Keluar; status Diterima tidak mengubah stok; Barang Masuk manual menambah stok sekali |
| AC-19 | Dokumen kondisional | Laut menawarkan B/L, udara AWB, ekspor PEB, impor PIB; jenis salah ditolak dan upload invalid tidak tersimpan |
| AC-20 | Katalog | Foto/kode/kategori/harga dan detail benar; barang arsip tidak muncul; tidak ada checkout |
| AC-21 | Barcode | Payload Code 128 sama dengan kode; SVG terunduh dan tampilan cetak hanya memuat label; stok tetap sama |
| AC-22 | Lima laporan | Masing-masing menghasilkan XLSX valid; filter berlaku pada seluruh baris, bukan hanya halaman aktif |
| AC-23 | Stok historis dan reversal | Pembatalan pada periode berikutnya muncul sebagai koreksi di periode itu; saldo akhir periode sebelumnya tidak ditulis ulang |
| AC-24 | Keamanan ekspor | Teks seperti `=1+1` tetap teks; angka harga/jumlah bertipe numerik; berkas kosong tetap valid |
| AC-25 | Ponsel | Seluruh alur praktik dapat diselesaikan di viewport wajib tanpa overflow halaman dan tanpa tombol tertutup |
| AC-26 | Validasi dan kegagalan | Field error jelas, input dipertahankan, request gagal tidak menampilkan sukses; data internal/lintas ruang ditolak |
| AC-27 | Data contoh dan statistik | Statistik dihitung dari fixture konsisten; angka contoh PDF tidak di-hardcode |
| AC-28 | Scan kode barang | Barcode Code 128 terbaca dari kamera/gambar, ditemukan hanya pada ruang akun aktif, dikonfirmasi, lalu mengisi pilihan barang tanpa mengubah stok |
| AC-29 | Izin kamera dan fallback | Izin ditolak/kamera tidak ada/kode tidak dikenal tetap memungkinkan input manual; tidak ada produk atau transaksi otomatis; track berhenti setelah dialog ditutup |
| AC-30 | Pemulihan akun | Token valid dapat mengganti password sekali, token tidak valid/kedaluwarsa ditolak; data praktik tetap sama dan kegagalan mail dilaporkan dengan benar |
| AC-31 | Navigasi mobile | Lima menu bawah dan submenu membuka semua modul; safe area, keyboard, rotasi, dan tombol Back tidak menutup aksi atau menghapus isian |
| AC-32 | Batas GPS | Tidak ada pelacakan kendaraan realtime atau permintaan izin lokasi pengiriman; status manual dan data pengangkut/resi tetap dapat dicatat |

### 11.1 Fixture demo yang konsisten

Data berikut untuk development/test, bukan data wajib pada setiap ruang produksi. Akun baru mendapat ruang kosong. Demo seeder harus menerima akun/ruang target secara eksplisit atau membuat akun demo lokal yang dijelaskan di README; jangan mencampurkannya dengan akun pengguna nyata atau menambahkan kredensial demo ke production.

| Kode | Barang | Kategori | Satuan | Harga pokok | Harga jual | Saldo awal baik | Masuk baik | Keluar baik | Saldo akhir baik |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BRG001 | Pulpen | ATK | pcs | 3000 | 5000 | 20 | 30 | 10 | 40 |
| BRG002 | Buku Tulis | ATK | pcs | 4000 | 6000 | 50 | 0 | 0 | 50 |
| BRG003 | Map File | ATK | pcs | 2000 | 3500 | 30 | 0 | 0 | 30 |
| BRG004 | Stapler | ATK | unit | 15000 | 20000 | 15 | 0 | 0 | 15 |
| BRG005 | Tinta Printer | Elektronik | unit | 50000 | 75000 | 10 | 0 | 0 | 10 |

Dashboard fixture: **5 SKU aktif, masuk 30, keluar 10, total stok fisik 145, rusak 0**. Campuran satuan diberi keterangan sesuai bagian 6.2. Buat satu pengiriman domestik dari pengeluaran Pulpen 10; saldo tetap 145 setelah pengiriman dibuat.

Contoh tanggal PDF boleh digunakan pada fixture dengan urutan saldo awal lebih dulu. Untuk tes otomatis, gunakan clock yang dikendalikan agar hasil tidak bergantung pada tanggal mesin. Test kondisi rusak, reversal, impor, dan konkurensi menggunakan fixture terpisah supaya tidak mengubah ekspektasi dashboard demo dasar.

### 11.2 Verifikasi yang harus dijalankan agen

- Backend tests untuk autentikasi, pemulihan password, kepemilikan ruang akun, posting/reversal, snapshot harga, tanggal, dan ekspor.
- Uji integrasi MySQL untuk row lock, pengeluaran bersamaan, idempotensi, dan alokasi bersamaan.
- Browser smoke test dari registrasi/login hingga Excel dan barcode, dengan viewport mobile sebagai skenario utama serta pemeriksaan adaptasi desktop.
- Pemeriksaan TypeScript, lint sesuai konfigurasi proyek, dan production build.
- Buka hasil XLSX dengan parser spreadsheet dan verifikasi tipe sel, filter, serta seluruh baris yang diharapkan.
- Periksa screenshot/layout mobile, navigasi bawah, safe area, keyboard, dan print view barcode. Verifikasi decoder dengan fixture barcode; gunakan mock kamera pada otomasi untuk alur izin/cleanup, lalu uji kamera ponsel nyata bila perangkat tersedia.
- Verifikasi login lintas dua sesi/perangkat untuk akun yang sama dan isolasi dua akun berbeda. Uji logout, URL privat sesudah logout, serta pengiriman ulang form setelah sesi berakhir.

Jika suatu check tidak dapat dijalankan karena lingkungan tidak tersedia, nyatakan check tersebut belum dijalankan beserta alasannya. Jangan melaporkan semua test lolos hanya berdasarkan build frontend.

## 12. Tahapan implementasi dan hasil setiap tahap

| Tahap | Pengerjaan | Gate sebelum lanjut |
| --- | --- | --- |
| 1 | Periksa repo dan instruksi lokal; pilih versi; scaffold Laravel/React/Inertia dengan auth siswa; konfigurasi DB/session/mail dan kepemilikan ruang | Build berjalan, login/logout dan ruang akun berfungsi, keputusan dependency tercatat |
| 2 | Migration, produk, ledger, saldo awal, masuk/keluar, idempotensi, pembatalan | AC-04 sampai AC-12 lulus, termasuk MySQL concurrency |
| 3 | Beranda mobile, navigasi bawah, daftar kartu dan form Data Barang/Barang Masuk/Barang Keluar | Statistik nyata, state form jelas, alur stok nyaman di ponsel sebelum adaptasi desktop |
| 4 | Pengiriman, alokasi, status, dokumen, ekspor/impor | AC-13 sampai AC-19 lulus, stok tidak berubah oleh transportasi |
| 5 | Katalog, barcode generate/scan, lima laporan, referensi pengangkut/resi | AC-20 sampai AC-24 serta AC-28/AC-29 lulus, XLSX/SVG dan fallback scan berfungsi |
| 6 | QA mobile utama, adaptasi desktop, pemulihan akun, isolasi file, smoke test, build, README | Seluruh P0 dan AC-01 sampai AC-32 dapat didemonstrasikan; keterbatasan uji ditulis |

Tahap boleh dipecah menjadi commit yang dapat ditinjau. Selesaikan satu alur fungsional sebelum memperluas dekorasi UI. Jangan berhenti pada scaffold, halaman statis, atau data mock.

## 13. Hasil kerja yang wajib diserahkan agen

1. Source code aplikasi yang dapat dijalankan, migration, dan lockfile dependency.
2. Seluruh halaman MVP berbahasa Indonesia dengan mobile first, navigasi bawah, daftar kartu, dan form yang dapat dipakai satu tangan.
3. Akun siswa, kepemilikan ruang, service stok, alokasi pengiriman, generator/pemindai barcode, ekspor XLSX, serta akses berkas privat.
4. Demo seeder terisolasi dan fixture pengujian yang konsisten.
5. Test inti dan ringkasan hasilnya, termasuk pemeriksaan yang belum dapat dijalankan.
6. `README.md`: kebutuhan runtime, setup, env contoh, migration, build, menjalankan aplikasi, test, demo, serta langkah deployment/backup.
7. `.env.example` tanpa secret; jelaskan timeout sesi, mail pemulihan password, HTTPS kamera, dan akses lintas perangkat berdasarkan akun.
8. `docs/decisions.md`: versi final dan alasan pilihan library, keputusan D-01 sampai D-16 yang diubah bila ada, kesesuaian fitur pendukung, serta keterbatasan nyata.
9. Ringkasan implementasi yang memetakan FR dan AC ke fitur/check yang selesai. Jangan mengklaim persetujuan client atau deployment production bila belum terjadi.

## 14. Definition of Done

- [ ] Semua FR-01 sampai FR-12 berfungsi dengan data persisten.
- [ ] Registrasi, login, logout, profil, dan pemulihan password bekerja dengan kepemilikan ruang per akun.
- [ ] Akun yang sama melanjutkan praktik lintas perangkat; akun berbeda terisolasi sampai level file dan ekspor.
- [ ] Saldo awal, masuk, keluar, reversal, dan ledger konsisten.
- [ ] Stok negatif, retry ganda, dan alokasi pengiriman berlebih dicegah server.
- [ ] Transportasi tidak mengubah stok dan latihan impor mempunyai alur penerimaan eksplisit.
- [ ] Lima jenis laporan menghasilkan XLSX valid sesuai filter.
- [ ] Barcode Code 128 dapat dibuat, dipratinjau, diunduh, dicetak, serta dipindai melalui kamera/gambar dengan fallback manual.
- [ ] Form transportasi, pencarian, filter, katalog, unduhan, serta lima menu bawah dapat dipakai dengan nyaman dari ponsel.
- [ ] GPS realtime menjadi satu-satunya pengecualian fitur; fitur pendukung mengikuti kesesuaian praktik dan dependensi yang nyata.
- [ ] Build, pemeriksaan tipe, dan test yang tersedia dijalankan; hasil dan kendala ditulis jujur.
- [ ] Tidak ada tombol tanpa aksi, angka statistik hardcoded, data bisnis hanya di frontend, atau halaman placeholder.
- [ ] README memungkinkan pengembang lain menjalankan aplikasi dari clone baru.

## 15. Ketertelusuran ke dokumen client

Nomor halaman menggunakan urutan PDF 1-9.

| Kebutuhan sumber | Halaman | Bagian PRD |
| --- | --- | --- |
| Nama, tujuan, pola guru memberi kasus, pengguna Siswa | 1 | 1, 1.1, 3 |
| Tujuh fitur utama | 1-2 | 2.1 dan 6.3-6.10 |
| Urutan praktik | 2 | 5.2 |
| Menu Beranda sampai Keluar | 3 | 5.1 dan 6.1 |
| Sambutan dan statistik | 3-4 | 6.2 dan 11.1 |
| CRUD Data Barang dan foto | 4 | 6.3 |
| Field Barang Masuk dan panel stok | 4-5 | 6.4 dan 6.6 |
| Field Barang Keluar dan batas stok | 5-6 | 6.5 dan 6.6 |
| Moda transportasi | 6 | 6.7 A |
| Penanganan muatan, jadwal, empat status, dokumen | 7 | 6.7 B-D |
| Ekspor dan impor | 8 | 6.7 E-F |
| Kartu katalog dan pembuatan barcode | 8 | 6.8-6.9 |
| Lima tab laporan dan Download Excel | 9 | 6.10 |
| Kemudahan praktik dan penggunaan tanpa biaya | 9 | 1 dan 7 |
| Daftar pengecualian awal | 9 | Digantikan arahan revisi pemilik proyek; lihat 2.2-2.3 |
| Hanya GPS realtime dikecualikan dan fokus mobile | Arahan revisi pemilik proyek | 2.2-2.3, D-16, 7, AC-32 |
| Login siswa dan scan barcode | Keputusan implementasi revisi, untuk mendukung praktik di ponsel | D-01/D-12, 6.1/6.9, AC-01/AC-28/AC-29 |
| Laravel/React terbaru dan mobile first | Instruksi pemilik proyek | 4 dan 7 |
| Rincian yang belum dijelaskan sumber | Keputusan implementasi | 3 dan aturan teknis terkait |

## 16. Prompt siap diberikan kepada Antigravity

Salin prompt berikut dan sertakan dokumen PRD ini pada konteks agen.

```text
Bangun aplikasi web LOGISTIK LAB berdasarkan PRD_LOGISTIK_LAB.md yang dilampirkan.

Baca seluruh PRD, instruksi repository, dan source yang sudah ada sebelum mengubah kode. Gunakan Laravel dan React versi stabil terbaru yang kompatibel; baseline terverifikasi PRD adalah Laravel 13 dan React 19.3, dengan TypeScript, Inertia 3, Tailwind 4, dan MySQL. Verifikasi kembali versi dan peer dependencies saat instalasi, simpan lockfile, serta catat versi akhirnya.

Hasil harus berupa aplikasi fungsional dengan database, bukan mockup. Gunakan PRD versi 1.1 ini sebagai acuan terbaru; daftar pengecualian versi 1.0 tidak lagi berlaku. Ikuti tahap 1-6 sampai semua fitur P0 selesai. Gunakan keputusan D-01 sampai D-16 sebagai baseline tanpa perlu menanyakan ulang keputusan rutin. Bila ada konflik nyata dengan repo atau dependency, jelaskan bukti dan gunakan perubahan minimum yang dicatat di docs/decisions.md.

Pertahankan batas produk:
- Sediakan akun siswa: register, login, logout, profil, dan pemulihan password. Satu akun mempunyai satu ruang praktik persisten yang dapat dilanjutkan lintas perangkat; data antar akun terisolasi.
- Pengecualian fitur hanya GPS realtime. Fitur pendukung lain dipilih menurut fungsi praktik logistik dan dependensi yang tersedia; tidak otomatis semuanya dibangun sekaligus.
- Data barang, barang masuk/keluar, transportasi, katalog, barcode, dan lima laporan Excel harus berfungsi.
- Semua perubahan stok menggunakan transaksi database, lock, ledger, validasi server, dan idempotensi.
- Pengiriman tidak boleh mengurangi stok lagi. Alokasi pengiriman domestik/ekspor dibatasi transaksi Barang Keluar. Impor diterima melalui Barang Masuk yang dicatat eksplisit.
- Harga transaksi dan identitas barang menggunakan snapshot sesuai PRD.
- Barcode mencakup generate, download, cetak, dan scan kamera/gambar. Scan hanya membantu memilih barang setelah konfirmasi; stok tetap berubah lewat transaksi yang disimpan. Sediakan fallback input manual dan hentikan kamera setelah selesai.
- Semua UI berbahasa Indonesia dan mobile first: rancang alur ponsel dahulu, lima menu bawah, daftar kartu, safe area, form bertahap, keyboard, serta unduhan mobile; desktop menyesuaikan.
- Catat jasa pengangkut dan nomor resi pada pengiriman. Jangan membuat integrasi provider palsu, meminta izin lokasi, atau menampilkan kendaraan dengan posisi realtime.

Jalankan test akun/pemulihan password, isolasi ruang per akun, stok, konkurensi MySQL, alokasi, ekspor, scan/fallback/cleanup kamera, dan smoke test UI mobile. Jalankan typecheck serta production build. Tunjukkan hasil nyata dan tuliskan pemeriksaan yang belum dapat dijalankan, termasuk kamera pada perangkat nyata bila belum tersedia. Lengkapi README, env example, demo seeder terisolasi, dan catatan keputusan.

Pada akhir pengerjaan, laporkan fitur selesai, hasil verifikasi, cara menjalankan, dan kendala yang masih ada. Jangan menyatakan selesai jika baru membuat scaffold, halaman statis, tombol dummy, atau statistik hardcoded.
```
