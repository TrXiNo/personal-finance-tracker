# Personal Finance Tracker — Project Context

> Bu dosya, projeyi yeni bir sohbette veya başka bir yapay zekâya anlatmak için hazırlanmıştır.
>
> Repository: `https://github.com/TrXiNo/personal-finance-tracker`
>
> Not: Bağlı GitHub entegrasyonu özel repo içeriğini şu anda okuyamadığı için bu doküman, bu sohbette birlikte ulaştığımız en güncel proje durumunu temel alır. Bir çelişki olursa repository dosyaları kaynak doğruluk olarak kabul edilmelidir.

---

## 1. Projenin Amacı

Personal Finance Tracker, tek kullanıcılı ve self-hosted çalışan kişisel finans takip uygulamasıdır.

Ana hedefler:

- Gelir eklemek
- Gider eklemek
- Güncel bakiyeyi görmek
- Aylık gelir ve giderleri görmek
- İşlem geçmişini görüntülemek
- Kullanıcı adını değiştirmek
- Şifre değiştirmek
- Yeni ay başlatıp önceki ayı arşivlemek
- Mobilde, özellikle iPhone Safari'de iyi çalışmak
- Ev sunucusunda 7/24 çalışmak
- Tailscale üzerinden özel erişim sağlamak
- Kişisel finans verilerini GitHub'a göndermemek

Proje şu anda **tek kullanıcı / kişisel kullanım** için tasarlanmıştır.

---

## 2. Teknoloji Yığını

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- Standart Python modülleri:
  - `json`
  - `hashlib`
  - `datetime`
  - `pathlib`

### Frontend

- HTML
- CSS
- Vanilla JavaScript
- Responsive / mobile-first tasarım

### Veri Saklama

Şu anda:

- `backend/finance.json`

SQL veritabanı kullanılmıyor.

İleride PostgreSQL'e geçmek düşünülebilir.

### Uzak Erişim / Deployment

Planlanan kullanım:

- Home server
- Tailscale
- Tailscale Serve
- FastAPI yalnızca localhost'ta
- Router port forwarding yok

---

## 3. Proje Yapısı

Beklenen yapı:

```text
personal-finance-tracker/
│
├── backend/
│   ├── main.py
│   └── finance.json       # sadece lokal, Git tarafından ignore edilir
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── .gitignore
├── requirements.txt
└── start_finance_tracker.bat   # lokal olarak bulunabilir
```

`backend/finance.json` kişisel veri içerdiği için GitHub'a gönderilmemelidir.

---

## 4. Git / Gizlilik Kuralları

`.gitignore` en azından şunları içermelidir:

```gitignore
backend/finance.json

__pycache__/
*.pyc

.venv/
venv/

.vscode/
.idea/

.DS_Store
Thumbs.db
```

Asla commit edilmemesi gereken veriler:

- Kullanıcı adı / parola bilgileri
- Parola hash'i
- Gelir-gider kayıtları
- Arşivlenmiş finans verileri

---

## 5. JSON Veri Modeli

Örnek:

```json
{
    "user": {
        "username": "example-user",
        "password": "SHA256_HASH"
    },
    "transactions": [
        {
            "type": "income",
            "amount": 6000.0,
            "description": "Aylık harçlık",
            "date": "2026-08-17",
            "time": "10:20:30"
        },
        {
            "type": "expense",
            "amount": 300.0,
            "description": "Akşam yemeği",
            "date": "2026-08-17",
            "time": "19:42:15"
        }
    ],
    "archives": [
        {
            "month": "2026-08",
            "closed_at": "2026-08-31 23:59:00",
            "summary": {
                "income": 6000.0,
                "expense": 3000.0,
                "balance": 3000.0
            },
            "transactions": []
        }
    ]
}
```

Kod, eski JSON formatlarında eksik alanları mümkün olduğunca tamamlayacak şekilde geliştirildi.

---

## 6. Parola Sistemi

Parolalar düz metin olarak tutulmamalıdır.

Mevcut yaklaşım:

```python
hashlib.sha256(password.encode("utf-8")).hexdigest()
```

JSON'da yalnızca hash tutulur.

Önemli:

- SHA-256 tek başına production-grade password hashing değildir.
- Uygulama public veya multi-user hale gelirse Argon2 ya da bcrypt'e geçilmelidir.
- Şu anki tek kullanıcı + özel Tailscale ağı senaryosunda geçici olarak kabul edilmiştir.

---

## 7. Backend'in Sorumlulukları

`backend/main.py` şunları yönetir:

- FastAPI uygulaması
- `finance.json` okuma/yazma
- Parola hashleme
- Login doğrulama
- Bakiye hesaplama
- Aylık gelir/gider hesaplama
- Yeni işlem oluşturma
- İşlemleri listeleme
- Kullanıcı bilgisi
- Kullanıcı adı değiştirme
- Şifre değiştirme
- Yeni ay oluşturma / arşivleme
- En güncel hedef mimaride frontend'i de sunma

---

## 8. Ana Backend Fonksiyonları

Temel mantık:

```python
load_data()
save_data(data)

hash_password(password)

calculate_balance(data)
calculate_monthly(data)
```

Bakiye:

```text
toplam gelir - toplam gider
```

Aylık hesaplama:

```python
datetime.now().strftime("%Y-%m")
```

ile aktif aya göre filtrelenir.

---

## 9. API Endpoint'leri

### Durum

```http
GET /api/status
```

Örnek cevap:

```json
{
    "status": "ok",
    "message": "Personal Finance API çalışıyor!"
}
```

### Login

```http
POST /api/login
```

Request:

```json
{
    "username": "arda",
    "password": "example-password"
}
```

Başarılı cevap:

```json
{
    "success": true,
    "message": "Giriş başarılı.",
    "username": "arda"
}
```

Önemli güvenlik sınırlaması:

Şu an gerçek JWT/session tabanlı route protection yoktur. Login doğrulaması vardır ancak tüm API endpoint'leri gerçek session ile korunmamaktadır.

Bu nedenle uygulama **public internete doğrudan açılmamalıdır**.

### Dashboard

```http
GET /api/dashboard
```

Yaklaşık cevap:

```json
{
    "username": "arda",
    "balance": 3000.0,
    "monthly_income": 6000.0,
    "monthly_expense": 3000.0,
    "recent_transactions": []
}
```

Son 5 işlem en yeni üstte olacak şekilde döner.

### Tüm İşlemler

```http
GET /api/transactions
```

```json
{
    "transactions": []
}
```

### İşlem Ekle

```http
POST /api/transactions
```

Request:

```json
{
    "type": "expense",
    "amount": 350,
    "description": "Akşam yemeği"
}
```

Desteklenen türler:

```text
income
expense
```

Backend tarih ve saati otomatik ekler.

### Kullanıcıyı Getir

```http
GET /api/user
```

### Kullanıcı Adını Güncelle

```http
PUT /api/user
```

```json
{
    "username": "new-name"
}
```

### Şifre Değiştir

```http
PUT /api/password
```

```json
{
    "current_password": "old-password",
    "new_password": "new-password"
}
```

Backend:

1. Mevcut şifreyi hashler.
2. Kayıtlı hash ile karşılaştırır.
3. Yanlışsa reddeder.
4. Yeni şifreyi doğrular.
5. Eskiyle aynıysa reddeder.
6. Yeni şifreyi hashleyip JSON'a yazar.

### Yeni Ay Başlat

```http
POST /api/new-month
```

İşleyiş:

1. Aktif işlemleri alır.
2. Gelir/gider/bakiye hesaplar.
3. Aktif ayı `archives` içine kopyalar.
4. Ay, kapanış zamanı ve özet bilgisini saklar.
5. Aktif `transactions` listesini temizler.

Eski veriler silinmez.

---

## 10. Frontend Yapısı

Dosyalar:

```text
frontend/index.html
frontend/style.css
frontend/app.js
```

Ana ekranlar:

```text
Login
  ↓
Uygulama
  ├── Ana Sayfa
  ├── İşlemler
  ├── Raporlar
  └── Ayarlar
```

Alt navigasyon:

```text
🏠 Ana Sayfa
💳 İşlemler
📊 Raporlar
⚙️ Ayarlar
```

---

## 11. Ana Sayfa

Gösterilen bilgiler:

- Hoş geldin / kullanıcı adı
- Toplam bakiye
- Aylık gelir
- Aylık gider
- Son işlemler
- Floating `+` işlem ekleme butonu
- Çıkış butonu

---

## 12. İşlem Ekleme Modalı

Floating `+` butonu mobil bottom-sheet tarzı modal açar.

Alanlar:

```text
[Gider] [Gelir]

Tutar
...

Açıklama
...

[İşlemi Kaydet]
```

Başarılı işlemden sonra:

- Dashboard yenilenir
- Bakiye güncellenir
- İşlem listeleri yenilenir
- Sayfanın tamamı reload edilmez

---

## 13. İşlemler Sayfası

Her işlemde:

- Açıklama
- Tarih
- Saat
- Tutar
- Gelir/gider tipi

Eski kayıtların `time` alanı yoksa:

```text
--:--:--
```

gösterilebilir.

---

## 14. Raporlar

Şu anda büyük ölçüde placeholder durumundadır.

Planlanan özellikler:

- Gelir/gider grafikleri
- Aylık grafik
- Kategori dağılımı
- Arşivlenmiş ayları görüntüleme
- Geçmiş ay karşılaştırmaları

---

## 15. Ayarlar

Mevcut ayarlar:

```text
👤 Kullanıcı
🔐 Şifre Değiştir
📅 Yeni Ay Başlat
```

### Kullanıcı

- Mevcut kullanıcı adı backend'den gelir
- Modal içinde değiştirilebilir

### Şifre Değiştir

Modal:

```text
Mevcut Şifre
Yeni Şifre
Yeni Şifre Tekrar
```

### Yeni Ay

Onay modalı gösterilir.

Onay sonrası:

- Mevcut işlemler arşivlenir
- Aktif gelir/gider/bakiye sıfırlanır
- Eski veriler korunur

---

## 16. Mobil / iPhone Desteği

CSS tarafında mobil kullanım için:

- Responsive genişlik
- iOS sistem fontları
- Bottom navigation
- Floating action button
- Bottom-sheet modallar
- `env(safe-area-inset-top)`
- `env(safe-area-inset-bottom)`
- Dokunmatik kullanım için büyük butonlar

kullanılır.

İleride PWA yapılarak iPhone'da **Ana Ekrana Ekle** desteği planlanabilir.

---

## 17. Tek Sunucu Mimarisi

Son hedef mimaride frontend ve backend aynı FastAPI sunucusundan servis edilir.

Eski yapı:

```text
Frontend :5500
Backend  :8000
```

Yeni hedef yapı:

```text
FastAPI :8000
│
├── /
│   └── frontend
│
├── /style.css
├── /app.js
│
└── /api/*
    └── backend
```

FastAPI:

```python
from fastapi.staticfiles import StaticFiles
```

kullanır.

Yaklaşık mount:

```python
app.mount(
    "/",
    StaticFiles(
        directory=str(FRONTEND_DIR),
        html=True
    ),
    name="frontend"
)
```

Bu mount, `/api/...` route'larından **sonra** tanımlanmalıdır.

Frontend tarafında same-origin istek kullanılmalıdır:

```javascript
const API_URL = "";
```

Örneğin:

```javascript
fetch(`${API_URL}/api/login`)
```

doğrudan:

```text
/api/login
```

olur.

---

## 18. Lokal Çalıştırma

Proje kökünde:

```bash
pip install -r requirements.txt
```

Geliştirme:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Tarayıcı:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

7/24 kullanımda `--reload` kullanılmamalıdır.

---

## 19. Windows BAT Launcher

Tek sunucu sürümünde yaklaşık:

```bat
@echo off

cd /d "%~dp0"

title Personal Finance Tracker

start "Finance Server" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 2 /nobreak >nul

start "" "http://127.0.0.1:8000"

exit
```

Gerçek 7/24 home server kullanımında BAT yerine:

- Windows Task Scheduler / servis
- veya Linux `systemd`

tercih edilmelidir.

---

## 20. Home Server + Tailscale Planı

Hedef:

```text
iPhone
   │
   │ Tailscale
   ▼
Tailscale Serve
   │
   ▼
Home Server
   │
127.0.0.1:8000
   │
FastAPI
   ├── Frontend
   ├── API
   └── finance.json
```

FastAPI:

```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Tailscale Serve:

```bash
tailscale serve --bg localhost:8000
```

Kontrol:

```bash
tailscale serve status
```

iPhone aynı tailnet'e bağlanır ve verilen özel HTTPS adresini Safari'de açar.

---

## 21. Router'da Yapılmaması Gerekenler

Yapma:

```text
Port 8000 forwarding
Port 5500 forwarding
DMZ
Public FastAPI exposure
Tailscale Funnel
```

İstenen yapı:

```text
Public Internet
   ✕
Direct FastAPI access

Tailscale
   ✓
Private access
```

---

## 22. Mevcut Güvenlik Modeli

Katmanlar:

```text
Tailscale cihaz / hesap doğrulaması
        ↓
Finance Tracker login
        ↓
Uygulama
```

Bilinen sınırlama:

- JWT yok
- Gerçek session yok
- API endpoint'leri login session ile tam korunmuyor

Tek kullanıcı + özel Tailscale ağı için şimdilik kabul edildi.

Public veya çok kullanıcılı sürümden önce:

- JWT veya secure cookie session
- Route protection
- Argon2 / bcrypt
- Gerekirse CSRF protection
- Logout/session revocation
- Rate limiting

eklenmelidir.

---

## 23. Kullanıcı Modeli

Şu anda **tek kullanıcı**:

```json
{
    "user": {
        "username": "...",
        "password": "..."
    }
}
```

Multi-user değildir.

İleride multi-user yapılırsa veri modeli baştan ele alınmalıdır.

Olası PostgreSQL tabloları:

```text
users
transactions
categories
monthly_periods / archives
```

---

## 24. Bilinen Eksikler

- JSON veritabanı
- Eşzamanlı JSON write koruması yok
- SHA-256 parola hash'i
- JWT/session yok
- Raporlar eksik
- İşlem düzenleme yok
- İşlem silme yok
- Kategori sistemi yok
- Otomatik backup yok
- PostgreSQL yok
- PWA yok
- Automated test yok
- Docker yok
- Multi-user yok

---

## 25. Önerilen Sonraki Adımlar

### Öncelik

1. Home server'da 7/24 çalıştır
2. Tailscale Serve kur
3. iPhone'dan ev dışından test et
4. Sunucu reboot sonrası FastAPI otomatik başlasın
5. `finance.json` otomatik backup sistemi ekle

### Özellikler

6. Raporlar
7. Geçmiş ay ekranı
8. Kategori sistemi
9. İşlem düzenleme
10. İşlem silme
11. Arama / filtre

### Güvenlik

12. JWT/session
13. Argon2/bcrypt
14. API route protection

### Altyapı

15. PostgreSQL
16. Docker
17. PWA
18. Testler

---

## 26. Gelecekte Kategori Sistemi

Örnek:

```json
{
    "type": "expense",
    "amount": 350,
    "category": "Yemek",
    "description": "Akşam yemeği",
    "date": "2026-08-17",
    "time": "19:42:13"
}
```

Olası kategoriler:

```text
Yemek
Ulaşım
Yakıt
Fatura
Eğlence
Alışveriş
Eğitim
Diğer
```

---

## 27. Git Workflow

Standart kullanım:

```bash
git status
git add .
git commit -m "Describe the change"
git push
```

Ana branch hedef adı:

```text
main
```

Büyük değişikliklerde:

```bash
git switch -c feature/example
```

Not: Projede daha önce `Main` / `main` branch isim karmaşası yaşandı. Branch işlemlerinden önce:

```bash
git branch
git status
```

ile kontrol et.

---

## 28. Başka Bir Yapay Zekâ İçin Talimatlar

Bu projeyi devam ettiren yapay zekâ:

1. Kullanıcı istemedikçe uygulamayı tamamen yeniden tasarlamamalı.
2. Migration planı yoksa mevcut JSON formatını korumalı.
3. `finance.json` dosyasını Git'e eklememeli.
4. Uygulamayı doğrudan public internete açmamalı.
5. Tailscale mevcut uzak erişim stratejisidir.
6. iPhone uyumluluğunu korumalı.
7. Değişiklikleri küçük ve aşamalı yapmalı.
8. Frontend/backend sorumluluklarını ayırmalı.
9. JSON yapısı değişirse eski kayıtlarla uyumluluğu düşünmeli.
10. Eski işlemlerde `time` alanı olmayabileceğini unutmamalı.
11. Multi-user desteği varmış gibi davranmamalı.
12. API route'larının henüz gerçek session ile korunmadığını bilmeli.
13. Deployment değişikliklerinde lokal geliştirme kolaylığını korumalı.
14. Bu dosya repository'den eski olabilir; kod değişikliğinden önce repo kaynaklarını kontrol etmeli.

---

## 29. Uzun Vadeli Hedef Mimari

```text
iPhone / Desktop
       │
       │ HTTPS over Tailscale
       ▼
Home Server
       │
       ▼
FastAPI
       │
       ├── Authentication
       ├── Transaction API
       ├── Reports API
       └── User API
       │
       ▼
PostgreSQL
```

Frontend:

```text
HTML
CSS
JavaScript
PWA
```

Backend:

```text
Python
FastAPI
```

Database:

```text
PostgreSQL
```

Networking:

```text
Tailscale
```

---

## 30. Kısa Özet

Proje başlangıçta:

```text
main.py + finance.json
```

şeklinde Python CLI uygulamasıydı.

Şimdi:

```text
Responsive Web Frontend
        ↓
FastAPI Backend
        ↓
JSON Storage
```

mimarisine dönüştü.

Mevcut ana özellikler:

- Login
- Gelir ekleme
- Gider ekleme
- Bakiye
- Aylık özet
- İşlem geçmişi
- Kullanıcı adı değiştirme
- Şifre değiştirme
- Yeni ay / arşiv
- Mobil arayüz
- GitHub
- Home server + Tailscale deployment planı

Ana hedef: uygulamayı basit, private, self-hosted ve iPhone'dan rahat kullanılabilir tutmak.
