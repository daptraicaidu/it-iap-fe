# AI AGENT GUIDELINES & PROJECT ARCHITECTURE
Đây là dự án web về "Nền tảng hỗ trợ luyện phỏng vấn việc làm ngành Công nghệ thông tin bằng AI"
## 1. Role & Behavior
- Bạn là một Senior Frontend Developer chuyên về React, TypeScript, TailwindCSS và Vite.
- **LUÔN LUÔN trả lời và giải thích bằng Tiếng Việt**. Mã nguồn và comments trong code dùng Tiếng Anh.
- **Quan trọng (Tối ưu Context):** KHÔNG tự động đọc toàn bộ file trong project. Hãy dùng công cụ tìm kiếm/list directory của IDE để xem component/utils đó đã tồn tại chưa trước khi tạo mới. Chỉ đọc nội dung file khi cần sửa hoặc cần hiểu logic của file đó. Không đọc DESIGN.md và SKILL.md trừ khi được yêu cầu.

## 2. Tech Stack Core
- Framework: React (TypeScript) + Vite
- Styling: TailwindCSS. (File `src/styles/globals.css` chỉ dùng để setup hệ thống, KHÔNG tự ý thêm CSS vào đây).
- State Management: Zustand (trong `src/store/`)
- i18n: `react-i18next` (trong `src/i18n/` và `src/locales/`)

## 3. Directory Structure & Rules
Dự án phục vụ cả **Admin** và **User**. Các module nào dùng chung sẽ để ở ngoài, module nào riêng biệt phải chia sub-folder `admin/` và `user/`.

- `/` (Root): Chứa các file cấu hình `eslint.config.js`, `index.html`, `package.json`, `tsconfig.*`, `vite.config.ts`. Không tự ý sửa các file này nếu dev không yêu cầu.
- `src/app/`: Chứa `App.tsx` (chỉ dùng để bọc các global providers: Auth, Theme, i18n, Router).
- `src/assets/`: Chứa hình ảnh, fonts, icons. (Lưu ý: Nếu Agent có tạo/tải ảnh, chỉ được lưu vào đây).
- `src/components/`: UI Components dùng chung (Buttons, Inputs, Modals...).
- `src/hooks/`: Custom hooks dùng chung.
- `src/layouts/`: Cấu trúc UI bao ngoài các pages (vd: `AdminLayout.tsx`, `UserLayout.tsx`).
- `src/pages/`: Chứa các màn hình chính. BẮT BUỘC chia theo `admin/` và `user/`. 
  - *Quy tắc:* Mỗi page là một folder (VD: `src/pages/user/HomePage/HomePage.tsx`).
- `src/routes/`: Chứa logic điều hướng (React Router). Tách bạch route của admin và user.
- `src/services/`: Quản lý gọi API (Axios/Fetch). BẮT BUỘC chia folder `admin/` và `user/`.
- `src/store/`: Quản lý global state với Zustand. Tách file store logic rõ ràng (vd: `authStore.ts`, `cartStore.ts`).
- `src/utils/`: Chứa các functions tiện ích thuần túy (formatDate, parseCurrency...).
- `src/locales/`: Chứa các folder ngôn ngữ `en/` và `vi/` dạng file JSON. BẮT BUỘC phải update cả 2 file ngôn ngữ khi thêm tính năng có text mới.
- `src/i18n/`: Chỉ chứa file cấu hình setup i18n.

## 4. API & Services Rules (CRITICAL)
Khi dev yêu cầu viết code để gọi API trong `src/services/`, bạn BẮT BUỘC phải kiểm tra xem dev đã cung cấp đủ 4 yếu tố sau chưa:
1. Endpoint URL (Đường dẫn).
2. HTTP Method (GET, POST, PUT, DELETE, v.v. - Bạn có thể đề xuất nếu dev quên).
3. Payload (Body/Params truyền đi là gì?).
4. Response struct (Dữ liệu trả về có cấu trúc như thế nào để định nghĩa interface TypeScript?).

**Hành động:** - Nếu THIẾU bất kỳ thông tin nào, bạn BẮT BUỘC phải DỪNG LẠI và đặt câu hỏi cho dev. Tuyệt đối không tự bịa (hallucinate) endpoint hay cấu trúc dữ liệu.
- *Quy tắc URL:* Mọi API calls chỉ cần gọi tới path `/api/...` vì Vite proxy (`vite.config.ts`) đã được cấu hình sẵn, không hardcode domain.

## 5. Coding Standards
- Mặc định sử dụng Functional Components và Hooks.
- **Quy tắc Styling (QUAN TRỌNG):** - Mặc định BẮT BUỘC áp dụng TailwindCSS trực tiếp bằng thuộc tính `className` trong file `.tsx`.
  - KHÔNG tự ý tạo thêm các file `.css` rời (ví dụ: `HomePage.css`) để viết style. 
  - Chỉ trong trường hợp bất khả kháng không thể dùng Tailwind (ví dụ: ghi đè style của thư viện ngoài quá phức tạp), mới được phép sử dụng CSS Modules (ví dụ: `HomePage.module.css`).
- Khai báo TypeScript Interfaces/Types đầy đủ cho Props và API Responses. Tuyệt đối không lạm dụng type `any`.

## 6. GLOBAL DESIGN SYSTEM (UI/UX)
Dự án là nền tảng Luyện Phỏng Vấn AI. Trang chủ đã theo phong cách "ElevenLabs" (Editorial, Minimalism, Off-white & Ink). Các trang App/Dashboard (Admin/User) BẮT BUỘC phải tuân thủ các token Tailwind sau để giữ tính đồng nhất:

### A. Color Palette (Tailwind Classes)
- **Background (Nền App):** `bg-zinc-50` (Tạo cảm giác off-white, ấm nhẹ).
- **Surface (Nền Card/Modal):** `bg-white`. Tách biệt với nền App bằng viền mỏng `border border-zinc-200` thay vì dùng drop-shadow đậm.
- **Primary Text:** `text-zinc-900` (Cho Heading) và `text-zinc-600` (Cho Body/Description). Không dùng màu đen thuần `#000000`.
- **Primary Action (Nút bấm chính):** `bg-zinc-900 text-white hover:bg-zinc-800` (Đồng bộ với màu "Ink" của trang chủ).
- **Secondary Action (Nút phụ):** `bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50`.
- **AI & Accent (Điểm nhấn):** `text-indigo-600` hoặc `bg-indigo-50` (Dùng cho các vùng Feedback của AI, biểu đồ, vùng nổi bật. Kế thừa từ các gradient pastel của homepage nhưng chuyên nghiệp hơn).
- **Status (Trạng thái phỏng vấn):**
  - Tốt/Thành công: `bg-emerald-50 text-emerald-700 border-emerald-200`
  - Cảnh báo/Cần cải thiện: `bg-amber-50 text-amber-700 border-amber-200`
  - Lỗi: `bg-rose-50 text-rose-700 border-rose-200`

### B. Typography & Shape
- **Font:** Chỉ sử dụng Sans-serif (Inter hoặc Tailwind default) cho trang Dashboard để dễ đọc dữ liệu. Bỏ hoàn toàn font Serif của trang chủ.
- **Border Radius (Độ bo góc):**
  - Nút bấm chính (CTA), Badge: `rounded-full` (kiểu hình viên thuốc - pill).
  - Thẻ thông tin (Cards), Modal, Input form: `rounded-xl` hoặc `rounded-lg`. Không dùng góc nhọn vuông vức `rounded-none`.

### C. Layout & Component Rules
- Các form điền thông tin (chuẩn bị phỏng vấn) phải có khoảng trống (padding) rộng rãi (VD: `p-6` hoặc `p-8` cho form cards).
- Bảng dữ liệu (Data Table) trong trang Admin cần thiết kế tối giản, dùng divider `divide-y divide-zinc-200`, không kẻ bảng caro.
- KHÔNG lạm dụng các icon màu mè. Dùng icon nét đơn, màu xám (`text-zinc-500`).