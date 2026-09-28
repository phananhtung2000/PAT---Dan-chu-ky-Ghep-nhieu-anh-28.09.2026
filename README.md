# PAT WORKSPACE — hướng dẫn deploy PWA

Bộ file này chuyển trang cổng **PAT WORKSPACE** (gồm `index.html` và 2 công cụ
trong thư mục `apps/`: *Chèn chữ ký vào PDF*, *Ghép nhiều ảnh*) thành một PWA
có thể cài đặt được, trong khi vẫn mở bình thường qua `file://` (double-click)
như trước — không có gì trong logic nghiệp vụ hay dữ liệu lưu trữ (localStorage
/IndexedDB) bị thay đổi.

## Cấu trúc file (giữ nguyên khi upload)

```
index.html
manifest.json
sw.js
icon-192.png
icon-512.png
icon-512-maskable.png
apps/
  chen-chu-ky-pdf.html
  ghep-nhieu-anh.html
```

Đặt toàn bộ cấu trúc này ở **thư mục gốc** của repo GitHub (đừng lồng thêm
thư mục cha), vì `manifest.json` và `sw.js` dùng đường dẫn tương đối.

## 1. Đưa lên GitHub Pages

1. Tạo một repo mới trên GitHub (ví dụ `pat-workspace`).
2. Đẩy (push) toàn bộ nội dung thư mục này lên nhánh `main` của repo, giữ
   nguyên cấu trúc thư mục ở trên.
3. Vào **Settings → Pages** của repo, chọn nguồn là nhánh `main`, thư mục
   `/ (root)`, rồi lưu lại.
4. Sau vài phút, trang sẽ chạy tại:
   `https://<username-của-bạn>.github.io/pat-workspace/`

Vì `start_url` và `scope` trong `manifest.json` đều dùng đường dẫn tương đối
(`./`), bạn không cần sửa gì thêm dù URL cuối cùng nằm ở subpath
`username.github.io/pat-workspace/` chứ không phải domain gốc.

## 2. Cài lên màn hình chính Android

1. Mở link GitHub Pages ở trên bằng **Chrome** trên điện thoại Android.
2. Chạm menu 3 chấm ở góc trên → chọn **"Cài đặt ứng dụng"** hoặc
   **"Thêm vào Màn hình chính"**.
3. App sẽ có icon riêng và mở toàn màn hình, không còn thanh địa chỉ trình duyệt.

## 3. Cài đặt trên Windows 11

1. Mở link bằng **Edge** hoặc **Chrome**.
2. Bấm icon **"Cài đặt"** ở thanh địa chỉ (biểu tượng màn hình có dấu +),
   hoặc vào menu (3 chấm) → **Ứng dụng** → **Cài đặt trang này như một ứng dụng**.
3. App sẽ chạy trong cửa sổ riêng như một phần mềm desktop.

## 4. Kiểm tra nhanh bằng Lighthouse

1. Mở trang GitHub Pages bằng Chrome, bấm **F12** để mở DevTools.
2. Vào tab **Lighthouse** → chọn hạng mục **"Progressive Web App"** → **Analyze**.
3. Kết quả sẽ xác nhận: có manifest hợp lệ, có service worker, có icon đúng
   kích thước.

## Lưu ý về dữ liệu

Cả 3 file đều lưu dữ liệu nghiệp vụ trực tiếp trong trình duyệt
(localStorage/IndexedDB) — dữ liệu này gắn với **domain đang mở** (ví dụ
`username.github.io`), không đồng bộ giữa các máy hay giữa bản GitHub Pages
và bản mở qua `file://` trên máy tính. `sw.js` không cache hay can thiệp vào
các thao tác đọc/ghi này, chỉ cache tài nguyên tĩnh (HTML/JS/icon) để dùng
được khi offline.
