# 🤖 Auto-Suggest Scoring Rules

## Cara Kerja

Sistem **Auto-Suggest** menganalisis **Task Name** dan **Description** untuk memberikan saran scoring otomatis berdasarkan keyword patterns.

---

## 📊 Dimensi Scoring

### 1️⃣ **Kompleksitas (K)** - Tingkat Kesulitan Teknis

| Score | Keyword Pattern | Contoh Task |
|-------|----------------|-------------|
| **4** | `auth`, `security`, `jwt`, `bcrypt`, `encryption`, `middleware` | POST /api/auth/login dengan JWT |
| **4** | `payment`, `billing`, `calculation`, `algorithm` | Payment calculation engine |
| **4** | `integration`, `third-party`, `api` | Third-party payment gateway |
| **3** | `migration`, `setup`, `config` | Database schema setup |
| **3** | `search`, `filter`, `pagination`, `complex query` | Advanced search with filters |
| **3** | `research`, `poc`, `proof of concept` | Research best architecture |
| **2** | `crud`, `simple`, `basic`, `get`, `list` | Basic CRUD operations |

### 2️⃣ **Waktu (W)** - Estimasi Durasi Pengerjaan

| Score | Keyword Pattern | Estimasi | Contoh |
|-------|----------------|----------|--------|
| **4** | `billing`, `payment`, `calculation` | > 6 jam | Complex billing logic |
| **3** | `auth`, `login`, `register` | 3-6 jam | Authentication system |
| **3** | `ui`, `frontend`, `component` | 3-6 jam | UI component development |
| **3** | `test`, `testing`, `unit test` | 3-6 jam | Comprehensive testing |
| **3** | `setup`, `config`, `migration` | 3-6 jam | Initial project setup |
| **2** | `post`, `put`, `create`, `update`, `delete` | 1-3 jam | Single CRUD endpoint |
| **2** | `middleware`, `validation` | 1-3 jam | Middleware implementation |
| **2** | `get list`, `get all` | 1-3 jam | List/index endpoint |
| **1** | `get single`, `get :id`, `detail` | < 1 jam | Detail/show endpoint |

### 3️⃣ **Risiko (R)** - Potensi Error/Bug Kritis

| Score | Keyword Pattern | Reasoning | Contoh |
|-------|----------------|-----------|--------|
| **5** | `auth`, `security`, `password`, `token` | Security critical | JWT implementation |
| **4** | `payment`, `billing`, `money`, `transaction` | Financial impact | Payment processing |
| **4** | `migration`, `database`, `schema` | Data integrity risk | Database migration |
| **4** | `integration`, `third-party` | External dependency | Third-party API |
| **3** | `delete`, `remove` | Data loss risk | Delete operations |
| **2** | `post`, `create` | Input validation needed | Create operations |
| **1** | `get`, `read`, `list` | Read-only, safe | Fetch/display data |

### 4️⃣ **Dependensi (D)** - Blocker untuk Task Lain

| Score | Keyword Pattern | Impact | Contoh |
|-------|----------------|--------|--------|
| **5** | `auth`, `middleware`, `setup`, `config` | Foundation | Auth middleware - semua route perlu ini |
| **5** | `database`, `schema`, `migration` | Core infrastructure | Database schema - semua CRUD bergantung |
| **4** | `foundation`, `base`, `core` | Critical dependency | Core API structure |
| **3** | `crud` (without auth) | Moderate dependency | Standard CRUD operations |
| **1** | `independent`, `standalone` | No dependencies | Isolated feature |

### 5️⃣ **Skill Required (S)** - Keahlian Khusus

| Score | Keyword Pattern | Skill Level | Contoh |
|-------|----------------|-------------|--------|
| **4** | `auth`, `jwt`, `security`, `encryption` | Advanced security knowledge | JWT + refresh token system |
| **4** | `algorithm`, `complex logic`, `calculation` | Advanced programming | Fee distribution algorithm |
| **4** | `devops`, `deployment`, `ci/cd`, `docker` | DevOps expertise | CI/CD pipeline setup |
| **3** | `frontend`, `ui`, `ux` | Frontend skills | React/Vue components |
| **3** | `database`, `sql`, `query optimization` | Database expertise | Complex SQL queries |
| **3** | `integration`, `api design` | API architecture | REST API design patterns |
| **2** | `simple`, `basic`, `crud` | Basic programming | Standard CRUD |

---

## 📝 Contoh Analisis

### Contoh 1: `POST /api/auth/login dengan JWT`

**Detected Keywords:** `auth`, `jwt`, `login`

```
Complexity: 4  (auth + security + jwt)
Time:       3  (auth/login)
Risk:       5  (auth + security + password + token)
Dependency: 5  (auth + middleware)
Skill:      4  (auth + jwt + security)
────────────────────────────────
Total:      25 pts
```

**Fee:** 25 × Rp 34.046 = **Rp 851.150**

---

### Contoh 2: `GET /api/tenants - List all tenants`

**Detected Keywords:** `get`, `list`

```
Complexity: 2  (crud + basic + get + list)
Time:       2  (get list)
Risk:       1  (get + read + list)
Dependency: 3  (crud)
Skill:      2  (simple + crud)
────────────────────────────────
Total:      12 pts
```

**Fee:** 12 × Rp 34.046 = **Rp 408.552**

---

### Contoh 3: `Payment calculation with proration`

**Detected Keywords:** `payment`, `calculation`

```
Complexity: 4  (payment + billing + calculation)
Time:       4  (billing + payment + calculation)
Risk:       4  (payment + billing + money)
Dependency: 3  (no specific keywords)
Skill:      4  (algorithm + complex logic + calculation)
────────────────────────────────
Total:      23 pts
```

**Fee:** 23 × Rp 34.046 = **Rp 783.058**

---

### Contoh 4: `Database migration setup`

**Detected Keywords:** `database`, `migration`, `setup`

```
Complexity: 3  (migration + setup + config)
Time:       3  (setup + config + migration)
Risk:       4  (migration + database + schema)
Dependency: 5  (database + schema + migration)
Skill:      3  (database + sql)
────────────────────────────────
Total:      17.5 pts
```

**Fee:** 17.5 × Rp 34.046 = **Rp 595.805**

---

## 🎯 Tips Menggunakan Auto-Suggest

### ✅ **Best Practices:**

1. **Tulis Task Name yang Deskriptif**
   ```
   ✅ Good: "POST /api/auth/login with JWT authentication"
   ❌ Bad:  "Login endpoint"
   ```

2. **Tambahkan Description Detail**
   ```
   ✅ Good: "Implement JWT authentication with bcrypt password hashing,
            refresh token mechanism, and rate limiting middleware"
   ❌ Bad:  "Make login work"
   ```

3. **Gunakan Keyword yang Relevan**
   - Auth tasks: `auth`, `jwt`, `security`, `middleware`
   - Payment: `billing`, `payment`, `calculation`, `transaction`
   - DevOps: `deployment`, `ci/cd`, `docker`, `setup`

### 🔄 **Workflow:**

1. **Isi Task Name & Description** dengan detail
2. **Klik Auto-Suggest** untuk mendapat scoring otomatis
3. **Review hasilnya** - sistem bukan 100% akurat
4. **Adjust manual** jika ada yang kurang tepat
5. **Save task**

### ⚠️ **Limitations:**

- Auto-suggest adalah **estimasi awal**, bukan scoring final
- Tidak bisa mendeteksi context yang sangat spesifik
- Tetap perlu **human judgment** untuk refinement
- Keyword overlap bisa menghasilkan score yang lebih tinggi/rendah

---

## 🔧 Customization

Jika Anda ingin menambah pattern baru, edit file:
`/app/pages/projects/[id].vue` → function `autoSuggestScoring()`

Tambahkan keyword patterns sesuai kebutuhan project Anda.
