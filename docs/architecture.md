# Bản đồ kiến trúc dự án

**Portfolio công khai (React 19 single-page) + Admin CMS**, cùng dùng một Supabase backend.

Stack: React 19 + React Compiler · Vite 7 · react-router-dom v7 · Supabase JS v2 · Context API (không Redux) · Framer Motion · CSS thuần / CSS Modules

---

## Mục lục

1. [Tổng quan](#1-tổng-quan-dự-án)
2. [Pattern kiến trúc](#2-architecture--design-pattern)
3. [API & data fetching](#3-api--data-fetching)
4. [State management](#4-state-management)
5. [Rendering & lifecycle](#5-rendering--lifecycle)
6. [Auth & authorization](#6-authentication--authorization)
7. [Component architecture](#7-component-architecture)
8. [Error handling](#8-error-handling)
9. [Cấu trúc thư mục](#9-cấu-trúc-thư-mục)
10. [Flow thực tế](#10-flow-thực-tế--end-to-end)
11. [Dependency map](#11-dependency--communication)
12. [Coding convention](#12-coding-convention)
13. [Playbook & nợ kỹ thuật](#13-playbook--nợ-kỹ-thuật)

---

## 1. Tổng quan dự án

Đây là **một ứng dụng React duy nhất chứa hai "app" con**: một trang portfolio công khai dạng single-page-scroll (`/`), và một CMS quản trị nội bộ (`/admin/*`) để chỉnh nội dung hiển thị ở trang public. Cả hai dùng chung một Supabase project làm backend — không có server Node/Express riêng, chỉ có 2 Supabase Edge Functions (Deno) xử lý gửi email.

**Trang Public — `/`** (`src/App.jsx`)
Không dùng route con cho từng section. `App.jsx` render tuần tự Navbar → Hero → About → Skills → Experience → Contact → Resume → Footer, cuộn trong một trang. Data đọc read-only từ Supabase qua `usePublicData`.

**Admin CMS — `/admin/*`** (`src/pages/admin/`)
Route lồng nhau sau `ProtectedRoute`, quản lý CRUD cho skills / projects / experiences / contacts và hộp thư liên hệ (contact-with-me) kèm trả lời email.

### Layer chính và trách nhiệm

| Layer | Thư mục | Trách nhiệm |
|---|---|---|
| UI — Sections | `components/sections/` | Khối nội dung lớn ghép thành trang (Hero, About, Contact…) |
| UI — Primitives | `components/ui/` | Component tái dùng: modal, card, button, cursor… |
| UI — Admin widgets | `components/admin/` | Bảng, form field, dialog xác nhận dùng riêng trong CMS |
| Data access | `services/` | Hàm gọi Supabase (CRUD + Edge Functions), tách khỏi UI |
| State glue | `hooks/` | Nối service với component state (`useCrud`, `usePublicData`, auth) |
| Cross-cutting | `i18n/` | Context song ngữ vi/en, không phụ thuộc Supabase |
| Client init | `lib/supabaseClient.js` | Nguồn duy nhất khởi tạo Supabase client |
| Backend logic | `supabase/functions/` | 2 Edge Function Deno chạy trên hạ tầng Supabase, dùng service-role key |

### Luồng dữ liệu tổng thể

```
Component → hook (useCrud / usePublicData) → service (*Service.js) → supabase client → Postgres / Edge Function
```

Không có store trung tâm nào giữ cache toàn cục — mỗi hook tự fetch và giữ state cục bộ trong component gọi nó. Điều hướng lại trang sẽ refetch lại từ đầu.

### Module quan trọng nhất

- **src/lib/supabaseClient.js** — điểm thắt cổ chai duy nhất tới backend; mọi service và hook đều import từ đây. Không component nào import trực tiếp nữa (đã refactor — xem mục 2, mục 13).
- **src/services/crudService.js** — factory sinh ra 4/5 service còn lại, quyết định shape của toàn bộ tầng data access.
- **src/hooks/AuthProvider.jsx** — canh cổng toàn bộ khu vực admin.
- **src/i18n/LanguageContext.jsx** — chi phối gần như mọi section public vì nội dung song ngữ.

---

## 2. Architecture & Design Pattern

### Factory Pattern — tầng service
`src/services/crudService.js:12`

`createCrudService(table, opts)` là factory sinh ra object `{getAll, getById, create, update, remove}` cho một bảng Supabase bất kỳ. Ba service dùng thẳng không thêm gì:

```
contactsService.js    → createCrudService("contacts")
projectsService.js    → createCrudService("projects")
skillsService.js      → createCrudService("skills")
experiencesService.js → createCrudService("experiences", {orderBy:"start_time", ascending:false})
```

**Vì sao:** 4 bảng có CRUD giống hệt nhau (id, sort_order, insert/update/delete) — factory tránh lặp code 4 lần. `contactMeService.js`, `contactService.js`, `resumeService.js` không dùng factory này vì nghiệp vụ khác (search, gửi email, mapping đặc thù) — đúng chỗ nên tách thành domain service riêng thay vì nhồi vào CRUD generic.

### Custom Hooks làm lớp kết dính (glue layer)
`src/hooks/useCrud.js`, `src/hooks/usePublicData.js`

`useCrud(service)` là một state machine nhỏ: giữ `items/loading/error`, tự `refresh()` khi mount, và có `addItem/updateItem/removeItem` cập nhật `items` cục bộ (sau khi server trả về, không phải trước khi gọi server) thay vì refetch toàn bộ danh sách. Đây chính là pattern đóng vai trò mà React Query/SWR thường đảm nhiệm trong các project khác — nhưng viết tay, không cache chéo component, không cache theo key toàn cục.

> **Nhận xét:** Vì không có cache toàn cục, hai component cùng gọi `useCrud(projectsService)` sẽ fetch 2 lần độc lập và không đồng bộ với nhau. Chấp nhận được vì hiện tại mỗi trang admin chỉ mount một instance mỗi service.

### Provider Pattern cho state toàn cục
`src/hooks/AuthProvider.jsx`, `src/i18n/LanguageContext.jsx`

Không có Redux/Zustand. Hai vùng state thực sự toàn cục (auth session, ngôn ngữ) đi qua Context API, mỗi cái tách thành 3 file theo cùng khuôn: `Context.js` (chỉ `createContext`) / `Provider.jsx` (logic + value) / `useX.js` (hook tiêu thụ, throw nếu dùng ngoài provider). Tách file này không phải sở thích — nó tránh cảnh báo của `eslint-plugin-react-refresh` (một file export cả component lẫn non-component phá fast refresh).

### Route Guard Pattern
`src/pages/admin/ProtectedRoute.jsx`

`ProtectedRoute` bọc quanh route cha `/admin` trong `main.jsx`, đọc `{user, loading}` từ `useAuth()`: loading → spinner, không có user → `<Navigate to="/admin/login"/>`, có user → render `children` (ở đây là `AdminLayout` chứa `<Outlet/>` cho các route con).

### Component không import Supabase trực tiếp (đã fix)

Trước đây `Contact.jsx` và `Resume.jsx` gọi thẳng `supabase.functions.invoke(...)` / `supabase.from("resume")...` trong component, phá boundary `component → hook/service → supabase` mà phần còn lại của app tuân theo. Đã tách thành 2 domain service mới:

```
src/services/contactService.js  → { sendContact }   — dùng bởi Contact.jsx
src/services/resumeService.js   → { getResumes }    — dùng bởi Resume.jsx
```

Không tạo hook wrapper cho 2 service này vì không có state/lifecycle logic cần tái sử dụng — gọi thẳng từ component là đủ, theo đúng nguyên tắc "không tạo abstraction chỉ để bọc 1 hàm". Kết quả: **không còn file nào trong `components/`/`pages/` import `lib/supabaseClient` trực tiếp** (verify bằng `grep -rn "lib/supabaseClient" src/components/ src/pages/`).

---

## 3. API & Data Fetching

Không có REST client tuỳ biến, không axios. Toàn bộ giao tiếp backend đi qua **Supabase JS SDK** — SDK tự lo base URL, header, và ký request bằng anon key.

```
UI event → hook (useCrud / usePublicData) → service function → supabase.from(table)
  → PostgREST → Postgres (RLS áp dụng) → JSON response → setState → re-render
```

### Khởi tạo client — nguồn sự thật duy nhất
`src/lib/supabaseClient.js`

```js
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables...");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

> **Lưu ý vận hành:** Thiếu biến môi trường sẽ **throw ngay khi module được import** — tức là crash toàn app từ bundle, không phải lỗi UI cục bộ. Luôn kiểm tra `.env` có `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` trước khi debug màn hình trắng.

### Authentication đính vào request
Không tự tay gắn header Authorization. Sau khi `signInWithPassword`, Supabase SDK tự lưu access token (localStorage) và tự đính JWT vào mọi request tiếp theo. Row Level Security (RLS) trên Postgres là lớp phân quyền thật sự — không phải code phía client.

### Trace API #1 — Đọc dữ liệu public (read path)
`src/hooks/usePublicData.js`

```js
const { data: rows, error: err } = await supabase
  .from(table)
  .select("*")
  .order(orderBy, { ascending });
if (err) throw err;
if (!cancelled) setData(rows);
```

Dùng bởi các section public (`About`, `Projects`, `Contact`'s social links...) để đọc bảng tương ứng ngay khi mount. Có cờ `cancelled` chặn race-condition khi component unmount hoặc `table` đổi trước khi fetch xong — tự viết tay, không dùng `AbortController`.

### Trace API #2 — CRUD trong Admin (mutation path)
`src/services/crudService.js` → `src/hooks/useCrud.js` → `src/pages/admin/AdminProjects.jsx`

```js
// crudService.js
async function update(id, changes) {
  ensureClient();
  const { data, error } = await supabase
    .from(table).update(changes).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// useCrud.js — gọi lại từ AdminProjects.jsx khi bấm Save
const updated = await service.update(id, changes);
setItems(prev => prev.map(it => it.id === id ? updated : it));
```

`mutation` Người dùng bấm Save trong `AdminModal` → `AdminProjects.handleSave` gọi `updateItem(id, changes)` từ `useCrud` → service `update()` → Supabase trả bản ghi mới → `useCrud` patch thẳng vào mảng `items` cục bộ (không refetch toàn bảng) → re-render bảng.

### Trace API #3 — Gửi email qua Edge Function
`src/components/sections/Contact.jsx` → `src/services/contactService.js` → `supabase/functions/send-contact-email/index.ts`

```
Form submit → contactService.sendContact(data) → supabase.functions.invoke("send-contact-email")
  → Edge Function (Deno) → insert bảng contact-with-me bằng service-role key
  → {success:true} → confetti + reset form
```

Đây là luồng duy nhất mà việc ghi dữ liệu **không** đi qua RLS thường — Edge Function dùng service-role key để bypass RLS, vì người dùng ẩn danh (chưa login) cần được phép tạo bản ghi contact. Luồng trả lời tương ứng ở phía admin (`reply-contact` function) dùng Resend API để gửi email thật rồi update `replied_at`.

### Toàn bộ điểm gọi Supabase trong `src/`

| File | Loại | Ghi chú |
|---|---|---|
| `services/crudService.js` | read / write | Factory CRUD dùng chung 4 bảng |
| `services/contactMeService.js` | read / write | Search + gọi Edge Function `reply-contact` |
| `services/contactService.js` | write | Gọi Edge Function `send-contact-email` — dùng bởi `Contact.jsx` |
| `services/resumeService.js` | read | Đọc + map bảng `resume` thành `{en, vi}` — dùng bởi `Resume.jsx` |
| `hooks/usePublicData.js` | read | Generic read-only cho trang public |
| `hooks/AuthProvider.jsx` | auth | `getSession`, `onAuthStateChange`, `signInWithPassword`, `signOut` |

Toàn bộ điểm gọi Supabase giờ đều nằm trong `services/`. Không còn component nào import `lib/supabaseClient` trực tiếp.

Không có retry, không có refresh-token thủ công (SDK Supabase tự refresh), không có transform/normalize riêng — response từ PostgREST được dùng gần như nguyên dạng trong state.

---

## 4. State Management

| Loại state | Cơ chế | Ví dụ |
|---|---|---|
| Global — auth | Context API | `AuthContext` / `AuthProvider` |
| Global — ngôn ngữ | Context API + localStorage | `LanguageContext`, key `portfolio-lang` |
| Server state | Custom hook (không cache chéo) | `useCrud`, `usePublicData` |
| Local UI state | `useState` trong component | form field, modal open/close, tab active |
| URL state | `react-router-dom` | route admin xác định trang CMS đang mở |
| Persistent state | `localStorage` | ngôn ngữ; token phiên do Supabase SDK tự quản |

**Không có Redux/Redux-Saga/Jotai/React Query.** Điều này có nghĩa: không có middleware pipeline, không có global cache invalidation, không có selector layer. Mỗi trang admin tự chịu trách nhiệm refetch dữ liệu của chính nó.

### LanguageProvider
`src/i18n/LanguageContext.jsx`

`lang` khởi tạo từ `localStorage.getItem("portfolio-lang")` (mặc định `"vi"`), `setLang` ghi lại localStorage, `t` là `useMemo` chọn dictionary tương ứng từ `i18n/en.js` / `i18n/vi.js`. Mọi section public đọc `t.section.field` để hiển thị đúng ngôn ngữ.

### Không có duplicate state đáng kể
Vì không cache chéo, "duplicate" chỉ xảy ra nếu 2 component cùng mount 2 instance `useCrud` của cùng service — hiện tại chưa xảy ra trong codebase. Rủi ro tiềm ẩn: nếu sau này thêm 1 section public thứ hai cũng đọc bảng `projects`, sẽ có 2 lần fetch độc lập không đồng bộ.

---

## 5. Rendering & Lifecycle

Đây là ứng dụng **CSR thuần** (Vite + React, không phải Next.js) — không có Server Component, không SSR/SSG/ISR. Mọi thứ chạy trên trình duyệt sau khi `index.html` load `src/main.jsx` làm module entry.

### Cây Provider — `src/main.jsx`

```
<StrictMode> → <LanguageProvider> → <BrowserRouter> → <AuthProvider> → <Routes>
```

`LanguageProvider` nằm ngoài cùng vì cả trang public lẫn admin đều cần i18n. `AuthProvider` nằm trong `BrowserRouter` để có thể dùng hook điều hướng nếu cần mở rộng sau này.

### Data fetching diễn ra ở đâu
Toàn bộ fetch nằm trong `useEffect` phía client (trong `usePublicData`, `useCrud`, `AuthProvider`) — không có fetch nào chạy trước khi component mount. Nghĩa là mỗi trang sẽ có khoảnh khắc `loading=true` hiển thị trước khi dữ liệu về; không có pre-fetch hoặc hydrate từ server.

### Loading / error state
Xử lý thủ công tại từng hook: `loading`/`error` là state riêng, component tự quyết định render gì khi `loading` hoặc `error` truthy (ví dụ `ProtectedRoute` render spinner text khi `loading`).

### Component bắt buộc client-side
Không áp dụng khái niệm "Client Component" vì đây không phải Next.js App Router — **toàn bộ component đều chạy client-side** theo mặc định của Vite CSR.

---

## 6. Authentication & Authorization

```
Login form → signInWithPassword → Supabase Auth → JWT lưu bởi SDK → onAuthStateChange
  → AuthContext.user → ProtectedRoute cho qua → request kèm JWT tự động → RLS kiểm tra → signOut
```

### AuthProvider — trung tâm logic
`src/hooks/AuthProvider.jsx`

- `useEffect` đầu tiên: `supabase.auth.getSession()` lấy session hiện có, set `user = session?.user ?? null`, `loading=false`.
- Subscribe `supabase.auth.onAuthStateChange` để tự cập nhật `user` khi login/logout/token refresh xảy ra ở bất kỳ đâu.
- `signIn(email, password)` → `supabase.auth.signInWithPassword`, throw nếu lỗi (component gọi tự catch).
- `signOut()` → `supabase.auth.signOut()`.
- Cleanup: unsubscribe listener khi unmount.

### Route protection
`src/pages/admin/ProtectedRoute.jsx`

Bọc quanh route cha `/admin` (không phải từng route con riêng lẻ) — mọi trang trong `AdminLayout` tự động được bảo vệ nhờ lồng route trong `main.jsx`.

> **Không có phân quyền role:** Bất kỳ user Supabase Auth hợp lệ nào cũng được coi là admin khi vào `/admin` — `ProtectedRoute` chỉ kiểm tra `user` tồn tại, không check role/claim. Nếu cần nhiều cấp quyền, phải thêm bảng roles + kiểm tra claim, hiện chưa có.

### Token refresh & logout
Không có logic refresh token viết tay — Supabase SDK tự làm ngầm và bắn qua `onAuthStateChange`. Logout: `AdminLayout.jsx` gọi `signOut()` rồi `navigate("/admin/login")` thủ công (không tự động redirect qua listener).

**API cần auth:** mọi thao tác trong `services/` gọi từ trang admin (đằng sau `ProtectedRoute`) đều implicit cần session hợp lệ để vượt qua RLS ghi/sửa/xoá. Các `usePublicData` đọc bảng public không cần auth (RLS cho phép SELECT ẩn danh).

---

## 7. Component Architecture

| Thư mục | Vai trò | Ví dụ |
|---|---|---|
| `components/ui/` | Primitive tái dùng, không biết gì về nghiệp vụ cụ thể | `BaseModal`, `ProjectCard`, `MagneticButton` |
| `components/sections/` | Khối nội dung gắn với 1 phần cụ thể của trang, thường tự fetch data riêng | `Contact.jsx`, `About.jsx` |
| `components/admin/` | Widget CMS dùng chung giữa các trang admin | `AdminTable`, `FormField`, `ConfirmDialog` |
| `components/animation/` | Hiệu ứng thuần trình diễn, không chứa logic nghiệp vụ | `ParticleField`, `RevealText` |

Không theo Container/Presentational tách file rõ ràng — hầu hết section component (`Contact.jsx`, `Projects.jsx`) tự vừa fetch data (qua hook) vừa render UI trong cùng file. Đây là container+presentational gộp chung, chấp nhận được ở quy mô hiện tại.

### Component lớn/phức tạp nhất

- **Contact.jsx** (~360 dòng) — form validate tay, confetti, fetch social links qua `usePublicData`, gửi email qua `contactService`. Vẫn là component nhiều trách nhiệm nhất, nhưng gửi email đã tách ra service — không còn biết chi tiết Supabase API.
- **AdminContactWithMe/index.jsx** (296 dòng) — bảng + search + modal reply với đính kèm file, giới hạn dung lượng thủ công.

> **Quyết định không tách file:** `Contact.jsx` vẫn gộp UI + validate + fetch social links trong 1 file. Không split thành `ContactForm.jsx`/`ContactSocialLinks.jsx` vì các phần này không thay đổi độc lập và file vẫn dễ đọc — tách chỉ vì số dòng sẽ là over-engineering không cần thiết ở quy mô hiện tại.

---

## 8. Error Handling

```
Supabase trả {error} → service throw error → hook catch → setError(err.message)
  → component đọc error từ hook → hiển thị inline (ErrorBanner / text đỏ)
```

**Không có ErrorBoundary** (React) ở bất kỳ đâu trong codebase — một lỗi render sẽ làm trắng toàn màn hình thay vì fallback UI. **Không có thư viện toast** (react-toastify, sonner...) — mọi thông báo lỗi/thành công đều hiển thị inline trong chính component.

| Nguồn lỗi | Xử lý ở đâu | Hiển thị |
|---|---|---|
| CRUD admin thất bại | `useCrud.js` catch, set `error` | `<ErrorBanner/>` |
| Fetch public data lỗi | `usePublicData.js` catch | thường im lặng / không render section |
| Login sai | `AdminLogin.jsx` catch `err.message` | text lỗi dưới form |
| Gửi contact-form lỗi | `Contact.jsx` — có thêm `console.error` | text tĩnh "Error. Please try again." |
| Edge Function lỗi | trả JSON `{error}` với status code, có xử lý CORS preflight | tuỳ nơi gọi diễn giải |

---

## 9. Cấu trúc thư mục

```
src/
├── assets/              # .lottie, svg — chỉ static asset
├── components/
│   ├── admin/           # AdminModal, AdminTable, FormField, ConfirmDialog
│   ├── animation/       # hiệu ứng thuần trình diễn
│   ├── sections/        # khối nội dung trang public, tự fetch data riêng
│   └── ui/              # primitive tái dùng, kèm *.module.css
├── hooks/                # AuthContext/Provider, useAuth, useCrud, usePublicData
├── i18n/                 # LanguageContext, en.js, vi.js
├── lib/
│   └── supabaseClient.js  # nguồn khởi tạo client DUY NHẤT
├── pages/admin/          # AdminLayout, ProtectedRoute, AdminLogin, Admin*.jsx
├── services/              # tầng data access — MỌI query Supabase nằm ở đây, không ngoại lệ
│                           # crudService, projectsService, skillsService, experiencesService,
│                           # contactMeService, contactService, resumeService
└── styles/                # admin.css

supabase/
└── functions/            # 2 Edge Function Deno: send-contact-email, reply-contact
```

| Thư mục | Nên đặt vào | Không nên đặt vào |
|---|---|---|
| `services/` | Hàm gọi Supabase, không JSX, không React hook | logic UI, useState |
| `hooks/` | logic state + side-effect tái dùng được | JSX render trực tiếp |
| `components/sections/` | 1 khối nội dung gắn 1 phần cụ thể của trang | logic gọi API phức tạp nên tách ra hook/service riêng |
| `components/ui/` | component không biết gì về Supabase hay nghiệp vụ | fetch data trực tiếp |
| `lib/` | khởi tạo client / cấu hình SDK thuần | business logic |

---

## 10. Flow thực tế — end-to-end

### Flow 1 — Khách gửi liên hệ (public, không cần login)

```
Contact.jsx form → validateField() (regex tay) → handleSubmit trim data
  → contactService.sendContact(data) → supabase.functions.invoke("send-contact-email")
  → Edge Function insert (service-role key) → {success:true} → setSent(true) + confetti
```
**File:** `components/sections/Contact.jsx` → `services/contactService.js` → `supabase/functions/send-contact-email/index.ts`

### Flow 2 — Admin đăng nhập và vào CMS

```
AdminLogin form → signIn(email,pw) → supabase.auth.signInWithPassword → onAuthStateChange bắn
  → AuthContext.user cập nhật → ProtectedRoute cho qua → Navigate "/admin/skills"
```
**File:** `pages/admin/AdminLogin.jsx` → `hooks/AuthProvider.jsx` → `pages/admin/ProtectedRoute.jsx`

### Flow 3 — Admin sửa 1 project

```
AdminProjects list → bấm Edit → mở AdminModal + FormField → Save
  → handleSave gọi updateItem(id,changes) → useCrud → projectsService.update()
  → supabase .update().eq("id").select().single() → patch local items[] → re-render bảng
```
**File:** `pages/admin/AdminProjects.jsx` → `hooks/useCrud.js` → `services/projectsService.js` → `services/crudService.js`

### Flow 4 — Admin trả lời tin nhắn liên hệ kèm file đính kèm

```
AdminContactWithMe loadData(searchText) → contactMeService.getAll (ilike filter)
  → bấm Reply → ReplyModal nhập subject/message/file → replyEmailService(FormData)
  → Edge Function reply-contact → gửi qua Resend API + update replied_at
  → onSent() đóng modal + loadData() lại
```
**File:** `pages/admin/AdminContactWithMe/index.jsx` → `services/contactMeService.js` → `supabase/functions/reply-contact/index.ts`

### Flow 5 — Trang public hiển thị dữ liệu song ngữ

```
Projects.jsx mount → usePublicData("projects") → supabase.from("projects").select("*")
  → useMemo map title_vi/title_en theo lang hiện tại (useLanguage())
  → render ProjectCard với useInView animation
```
**File:** `components/sections/Projects.jsx` → `hooks/usePublicData.js` → `i18n/useLanguage.js` → `components/ui/ProjectCard.jsx`

---

## 11. Dependency & Communication

```
Feature: Admin Projects
├── AdminProjects.jsx        (page)
│   ├── AdminModal, FormField, ConfirmDialog, AdminTable  (components/admin)
│   └── useCrud(projectsService)                          (hooks)
│        └── projectsService.js                           (services)
│             └── crudService.js → supabaseClient.js       (lib)
└── (đọc song song bởi) Projects.jsx (public)
     └── usePublicData("projects") → supabaseClient.js
```

**Dependency chính:** gần như mọi thứ đổ dồn về `lib/supabaseClient.js` — đây là điểm coupling trung tâm có chủ đích (single source of truth cho client), không phải anti-pattern.

**Không phát hiện circular dependency.** Luồng import một chiều: `pages/components → hooks → services → lib`, không có chiều ngược.

**Coupling đã fix:** `Contact.jsx` và `Resume.jsx` từng import thẳng `supabase` từ `lib/` thay vì qua service. Đã tách ra `contactService.js` / `resumeService.js` — không còn component nào phụ thuộc trực tiếp vào Supabase SDK.

**Abstraction giảm coupling tốt:** `createCrudService` khiến 4 trang admin không cần biết chi tiết PostgREST — chỉ cần biết interface `{getAll, create, update, remove}`. Đổi backend (giả sử đổi bảng, đổi field order) chỉ sửa 1 chỗ.

---

## 12. Coding Convention

| Đối tượng | Convention | Ví dụ |
|---|---|---|
| Component file | PascalCase.jsx | `AdminProjects.jsx`, `ProjectCard.jsx` |
| Hook file | `useXxx.js`/`.jsx`, luôn bắt đầu "use" | `useCrud.js`, `usePublicData.js` |
| Service file | `xxxService.js`, camelCase + hậu tố Service | `projectsService.js` |
| Context tách 3 file | `XContext.js` / `XProvider.jsx` / `useX.js` | Auth*, Language* |
| CSS Modules | `ComponentName.module.css` đi kèm component cùng thư mục | `BaseModal.module.css` |
| Async | `async/await` nhất quán, không dùng `.then()` chain | toàn bộ `services/` |
| Error convention | service `throw error`; hook/component catch và lưu `err.message` vào state | `useCrud.js` |
| Import | named export cho hook/service, default export cho component | `export const supabase` vs `export default function App()` |

---

## 13. Playbook & nợ kỹ thuật

### Must know

- Mọi bảng CRUD chuẩn (skills/projects/experiences/contacts) đi qua `createCrudService` — thêm bảng mới chỉ cần 1 dòng gọi factory, không viết lại CRUD.
- **Component không bao giờ import `lib/supabaseClient` trực tiếp** — mọi query/Edge Function call phải đi qua một file trong `services/`. Đây là rule cứng, không phải gợi ý.
- `ProtectedRoute` không phân quyền role — mọi tài khoản Supabase Auth hợp lệ đều là admin.
- Không có cache toàn cục — mount lại component nghĩa là fetch lại từ đầu.
- Thiếu env var làm crash app ngay từ import, không phải lỗi UI.

### Common pitfalls

- Thêm field mới vào bảng nhưng quên cập nhật RLS policy — lỗi sẽ hiện dưới dạng `error` từ Supabase, không phải lỗi JS rõ ràng.
- `usePublicData` mặc định order theo `sort_order` — bảng không có cột này sẽ lỗi âm thầm nếu không truyền `opts.orderBy`.
- Đừng tạo hook mới chỉ để bọc 1 service function không có state/lifecycle logic (xem `contactService.sendContact`, `resumeService.getResumes` — gọi thẳng từ component là đủ).

### Don'ts

- Đừng gọi `supabase` trực tiếp trong component mới — luôn thêm hàm vào `services/`, theo đúng pattern đã thiết lập.
- Đừng thêm state global mới bằng Context nếu chỉ 1-2 component cần — dùng `useState` cục bộ hoặc prop.
- Đừng giả định có ErrorBoundary bắt lỗi render — chưa có, một lỗi throw trong render sẽ trắng màn hình.

### Recommended workflow cho feature mới

1. Tìm bảng/service tương tự trong `services/` — phần lớn nhu cầu CRUD đã có factory sẵn.
2. Trace flow hiện có gần nhất (vd. thêm 1 trang admin mới → xem `AdminProjects.jsx` làm mẫu).
3. Xác định layer cần sửa: chỉ UI → sửa component; cần bảng mới → thêm service qua `createCrudService` rồi hook `useCrud`.
4. Implement theo đúng convention đặt tên ở mục 12.
5. Test thủ công cả vi/en nếu nội dung song ngữ.
6. Kiểm tra RLS policy trên Supabase dashboard nếu thêm bảng/thao tác mới.
7. Chạy `eslint` — cấu hình đã bật `react-hooks` rules nghiêm.

### Nợ kỹ thuật đã phát hiện

| Mức độ | Vấn đề | Chi tiết |
|---|---|---|
| ~~Trung bình~~ Đã fix | ~~Inconsistent pattern — Contact.jsx gọi Supabase trực tiếp~~ | Đã tách thành `services/contactService.js`. |
| ~~Trung bình~~ Đã fix | ~~Inconsistent pattern — Resume.jsx gọi Supabase trực tiếp~~ | Đã tách thành `services/resumeService.js`; đồng thời bỏ luôn dead-code guard `if (!supabase)` không bao giờ true (vì `supabaseClient.js` throw ngay khi thiếu env, trước khi component kịp mount). |
| Thấp | Dead code — "Resume copy.jsx" | `components/sections/Resume copy.jsx` (có khoảng trắng trong tên file) không được import ở đâu — nhiều khả năng là file backup còn sót lại. |
| Thấp | Section bị tắt — Projects | `<Projects/>` bị comment trong `App.jsx:36` — trang live hiện không hiển thị section này dù code còn hoạt động đầy đủ. |
| Cao | Không có phân quyền role trong admin | Mọi tài khoản Auth hợp lệ = full admin access. Nếu tương lai có nhiều người dùng CMS, cần bảng roles + kiểm tra claim trong `ProtectedRoute`. Không tự ý implement — chỉ document constraint. |
| Thấp | Không có ErrorBoundary / toast library | Lỗi render sẽ làm trắng màn hình; thông báo lỗi/thành công hiện dựa vào text tĩnh inline từng nơi, không đồng bộ trải nghiệm. Không thêm nếu chưa có yêu cầu cụ thể. |

### Audit gần nhất (2026-08-19)

Audit toàn diện theo target architecture `Component → Hook → Service → supabaseClient → Postgres/Edge Function`. Kết luận: kiến trúc hiện tại đã đúng hướng ở phần lớn codebase (CRUD admin, auth, i18n) — chỉ 2 điểm bypass boundary (`Contact.jsx`, `Resume.jsx`), cả hai đã fix bằng domain service mới, không thêm hook/store/abstraction nào khác. Không phát hiện race condition, memory leak, hay circular dependency trong `useCrud`/`usePublicData`/`crudService`. Không đủ lý do cụ thể để thêm React Query, Redux, role system, hay feature-based restructuring — giữ nguyên theo nguyên tắc "không over-engineer".
