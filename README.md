# VIXXY D'ORANCE - Huong dan project

Project hien co nhieu ban thu nghiem. De tranh bi roi, hay xem `vixxy-store/` la website chinh.

## Website chinh

```bash
cd vixxy-store
npm install
npm run dev
```

Sau do mo dung dia chi Terminal bao. Mac nen uu tien:

```text
http://127.0.0.1:3000
```

## Chuc nang trong web chinh

- Trang chu: hero, trang phuc, trang suc, phu kien.
- San pham: loc theo danh muc, tim kiem, sap xep gia.
- Chi tiet san pham: chon size, them vao gio hang.
- Gio hang: luu localStorage, cap nhat so luong theo tung size, xoa san pham, thanh toan demo.
- Tai khoan: dang ky/dang nhap demo bang sessionStorage/localStorage.
- Chat: giao dien ho tro, gui tin nhan, tao nhom, them thanh vien demo.

Tai khoan demo:

```text
user@vixxy.com / user123
```

## Cac thu muc/file cu

- `index.html`, `trang-phuc.html`, `login.html`, `register.html`: ban HTML thuan cu.
- `js/`, `css/`: script/style cho ban HTML cu.
- `novachat/`: ban demo Vite rieng.
- `admin/`, `admin-dashboard/`: ban admin/demo rieng.

Khuyen nghi: neu muon mot website thong nhat, tiep tuc phat trien trong `vixxy-store/`. Cac ban cu chi nen giu lam tham khao cho den khi ban chac chan muon xoa hoac luu tru.

## Kiem tra production

```bash
cd vixxy-store
npm run build
npm start
```

Ghi chu: thanh toan va chat hien la demo frontend, chua ket noi server/database/cổng thanh toán thật.

## Deploy Production

Xem huong dan day du:

- [DEPLOY.md](DEPLOY.md)
- [docs/PRODUCTION_GUIDE.md](docs/PRODUCTION_GUIDE.md)
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)

Sau khi deploy, website hoat dong tai URL cong khai (vi du: `https://vixxy-dorance.vercel.app`).
