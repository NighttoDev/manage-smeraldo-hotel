# Smeraldo Hotel - Business Requirements Document

## 1. Tổng Quan / Overview

**Tên dự án:** Phần mềm Quản lý Khách sạn Smeraldo  
**Hotel Name:** Smeraldo Hotel  
**Building:** 9 tầng (Tầng 2-9 là phòng khách)

---

## 2. Quản Lý Phòng / Room Management

### 2.1 Danh Sách Phòng (Room Inventory)

| Tầng | Số Phòng | Loại Phòng | Số Giường |
|------|----------|------------|-----------|
| 2 | 201 | ONE BEDROOM APARTMENT | 1 | (phòng này không bán)
| 3 | 301 | DELUXE TWIN | 2 |
| 3 | 302 | DELUXE DOUBLE | 1 |
| 3 | 303 | DELUXE TWIN | 2 |
| 3 | 304 | ONE BEDROOM APARTMENT 2 BEDS | 2 |
| 4 | 401 | DELUXE TWIN | 2 |
| 4 | 402 | DELUXE DOUBLE | 1 |
| 4 | 403 | DELUXE TWIN | 2 |
| 4 | 404 | ONE BEDROOM APARTMENT 2 BEDS | 2 |
| 5 | 501 | DELUXE TWIN | 2 |
| 5 | 502 | DELUXE DOUBLE | 1 |
| 5 | 503 | DELUXE TWIN | 2 |
| 5 | 504 | ONE BEDROOM APARTMENT 2 BED | 2 |
| 6 | 601 | DELUXE TWIN | 2 |
| 6 | 602 | DELUXE DOUBLE | 1 |
| 6 | 603 | DELUXE TWIN | 2 |
| 6 | 604 | ONE BEDROOM APARTMENT 2 BED | 2 |
| 7 | 701 | DELUXE TWIN | 2 |
| 7 | 702 | DELUXE DOUBLE | 1 |
| 7 | 703 | DELUXE TWIN | 2 |
| 7 | 704 | ONE BEDROOM APARTMENT 2 BEDS | 2 |
| 8 | 801 | SUITE APARTMENT 2 BEDROOMS | 2+ |
| 8 | 802 | ONE BEDROOM APARTMENT 2 BEDS | 2 |
| 9 | 901 | SUITE APARTMENT 2 BEDROOMS | 2+ |
| 9 | 902 | ONE BEDROOM APARTMENT 2 BEDS | 2 |

**Tổng số phòng:** 24 phòng

### 2.2 Loại Phòng (Room Types)

| Loại Phòng | Mô tả | Số lượng |
|------------|-------|----------|
| DELUXE TWIN (2G) | Phòng 2 giường đơn | 10 |
| DELUXE DOUBLE (1G) | Phòng 1 giường đơn | 5 |
| ONE BEDROOM APARTMENT 2 BEDS | Căn hộ 1 phòng ngủ, 2 giường | 7 |
| SUITE APARTMENT 2 BEDROOMS | Căn hộ 2 phòng ngủ | 2 |

### 2.3 Chức Năng Quản Lý Phòng

- [ ] Xem sơ đồ phòng theo tháng (calendar view)
- [ ] Hiển thị trạng thái phòng: Trống / Đã đặt / Đang ở
- [ ] Hiển thị tên khách đang lưu trú trong từng phòng
- [ ] Hiển thị đặt phòng theo ngày (check-in / check-out)
- [ ] Quản lý booking từ OTA (Agoda, Booking.com, etc.)
- [ ] Theo dõi số đêm lưu trú
- [ ] Tính tiền phòng tự động

---

## 3. Quản Lý Hóa Đơn / Invoice Management (Chưa cần chức năng này, vì chưa có thông tin cụ thể nhưng vẫn giữ chức năng này)

### 3.1 Hóa Đơn Đầu Ra (Sales Invoices - XUẤT HÓA ĐƠN)

**Cấu trúc dữ liệu:**

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Ngày | Ngày xuất hóa đơn | 2025-06-01 |
| Nội Dung | Mô tả dịch vụ | Tiền phòng 301,302 Xuân Hòa |
| Tiền | Số tiền trước thuế (VND) | 833,333 |
| Thuế | Thuế VAT 8% | 66,667 |
| Tổng tiền | Tổng sau thuế | 900,000 |

**Các loại dịch vụ xuất hóa đơn:**
- Tiền phòng (Room charges)
- Có thể nhiều phòng trong 1 hóa đơn (vd: phòng 301,302)
- Hóa đơn theo tên khách hàng

### 3.2 Hóa Đơn Đầu Vào (Purchase Invoices - HÓA ĐƠN ĐẦU VÀO)

**Cấu trúc dữ liệu:**

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Ngày | Ngày nhận hóa đơn | 2025-06-03 |
| Nội Dung | Mô tả chi phí | Chống thấm |
| Tiền | Số tiền trước thuế | 33,000,000 |
| Thuế | Thuế VAT 8% | 2,640,000 |
| Tổng tiền | Tổng sau thuế | 35,640,000 |

**Các loại chi phí thường gặp:**

| Danh mục | Mô tả |
|----------|-------|
| Tiền điện | Chi phí điện hàng tháng |
| Tiền nước | Chi phí nước hàng tháng |
| Tiền wifi | Chi phí internet |
| Tiền rác | Phí vệ sinh |
| CMC | Phí dịch vụ CMC |
| VIMO | Phí dịch vụ thanh toán |
| ASM | Phí dịch vụ ASM |
| Dasani | Mua nước uống |
| Chống thấm | Sửa chữa, bảo trì |
| Bảo hiểm | Phí bảo hiểm |
| Khăn tắm | Vật tư tiêu hao |
| Bàn chải | Vật tư tiêu hao |
| Rèm cửa | Nội thất |
| Phần mềm Win | Chi phí phần mềm |
| Chữ ký số | Chứng thư số |
| Agoda | Commission OTA |

### 3.3 Chức Năng Quản Lý Hóa Đơn

- [ ] Tạo hóa đơn đầu ra (xuất hóa đơn)
- [ ] Nhập hóa đơn đầu vào
- [ ] Tự động tính thuế VAT 8%
- [ ] Báo cáo tổng hợp theo tháng
- [ ] Liên kết hóa đơn với phòng/khách hàng
- [ ] Xuất báo cáo Excel

---

## 4. Quản Lý Nhân Sự / Staff Management

### 4.1 Bảng Chấm Công (Timesheet)

**Cấu trúc dữ liệu:**

| Trường | Mô tả |
|--------|-------|
| Thứ tự | STT nhân viên |
| Họ Tên | Tên nhân viên |
| Ngày 1-31 | Trạng thái làm việc mỗi ngày |
| Tổng công | Tổng ngày công trong tháng |

**Ký hiệu chấm công:**
- `1` = Đi làm đủ 1 ca
- `0.5` hoặc `0,5` = Làm nửa ca
- `0` = Nghỉ phép / Nghỉ không lương
- `1 + 0.5` = Làm thêm nửa ca

**Danh sách nhân viên mẫu:**
- Kiều
- Cô Hoàng
- Khoa
- Tú

### 4.2 Chức Năng Quản Lý Nhân Sự

- [ ] Chấm công hàng ngày
- [ ] Tính tổng công theo tháng
- [ ] Hỗ trợ làm nửa ngày
- [ ] Báo cáo chấm công theo tháng
- [ ] Xuất bảng lương

---

## 5. Quản Lý Kho / Inventory Management

### 5.1 Quản Lý Nước Uống & Vật Tư (Beverage & Supplies)

**Cấu trúc dữ liệu:**

| Trường | Mô tả | Ví dụ |
|--------|-------|-------|
| Loại | Tên sản phẩm | Coca |
| Số lượng còn | Tồn kho hiện tại | 48 |
| Nhập | Số lượng nhập (ngày) | 24 (3/1) |
| Xuất | Số lượng xuất | 7 |
| Ngày | Chi tiết xuất | 4/1 số lượng 2, 6/1 số lượng 1|

**Danh sách sản phẩm:**

| Sản phẩm | Ghi chú |
|----------|---------|
| Suối (Aqua) | Nước suối |
| Coca | Coca-Cola |
| Pepsi | Pepsi |
| 7 up | 7-Up |
| Revive chanh | Nước ngọt |
| Rockstar | Nước tăng lực |
| Tiger | Bia |
| Larue | Bia |
| Mỳ | Mỳ gói |

**Ghi chú xuất kho:**
- `sl1`, `sl2`... = Số lượng xuất
- `a Tân` = Xuất cho nhân viên Tân
- Có thể xuất nhiều lần trong ngày

### 5.2 Chức Năng Quản Lý Kho

- [ ] Quản lý tồn kho theo sản phẩm
- [ ] Nhập kho (ghi ngày nhập)
- [ ] Xuất kho (ghi ngày, số lượng, người nhận)
- [ ] Cảnh báo hết hàng
- [ ] Báo cáo nhập/xuất theo kỳ
- [ ] Theo dõi date (hạn sử dụng)

---

## 6. Báo Cáo & Thống Kê / Reports & Analytics

### 6.1 Báo Cáo Tài Chính

- [ ] Doanh thu theo tháng (từ hóa đơn đầu ra)
- [ ] Chi phí theo tháng (từ hóa đơn đầu vào)
- [ ] Lợi nhuận gộp = Doanh thu - Chi phí
- [ ] Báo cáo thuế VAT

### 6.2 Báo Cáo Vận Hành

- [ ] Công suất phòng (Occupancy rate)
- [ ] Doanh thu trung bình/phòng (RevPAR)
- [ ] Thống kê khách theo quốc tịch
- [ ] Báo cáo nhân sự

---

## 7. Tích Hợp / Integrations

### 7.1 Kênh Bán Phòng (OTA Channels)
- Booking.com (có thể mở rộng)
- Trip.com (duyệt qua email, nhưng muốn duyệt tự động qua ứng dụng quản lí)
- Smeradohotel.online (trang booking của khách sạn)

### 7.2 Thanh Toán
- Bank (thanh toán điện tử qua ngân hàng)
- Quẹt thẻ (Card payment)
- Tiền mặt (Cash)

### 7.3 Tiện Ích
- CMC (dịch vụ)
- Chữ ký số (Digital signature)

---

## 8. Yêu Cầu Kỹ Thuật / Technical Requirements

### 8.1 Đơn vị tiền tệ
- VND (Việt Nam Đồng)
- Thuế VAT: 8%

### 8.2 Ngôn ngữ
- Tiếng Việt (primary)

### 8.3 Dữ liệu
- Backup định kỳ

---

## 9. Danh Sách Modules Cần Phát Triển

| # | Module | Độ ưu tiên | Mô tả |
|---|--------|------------|-------|
| 1 | Room Management | Cao | Quản lý phòng, đặt phòng, sơ đồ phòng |
| 2 | Invoice Management | Cao | Xuất/nhập hóa đơn, tính thuế |
| 3 | Guest Management | Cao | Quản lý thông tin khách hàng |
| 4 | Staff Management | Trung bình | Chấm công, quản lý nhân viên |
| 5 | Inventory Management | Trung bình | Quản lý kho nước uống, vật tư |
| 6 | Reports | Trung bình | Báo cáo tài chính, vận hành |
| 7 | OTA Integration | Thấp | Kết nối Agoda, Booking |

---

## 10. Ghi Chú Bổ Sung

*Phần này dành cho bạn review và bổ sung thêm yêu cầu:*

- [ ] Cần cập nhật thêm cho phân quyền gồm quản lí và nhân viên, dọn phòng
- [ ] ...
- [ ] ...

---

**Ngày tạo:** 2026-02-05  
**Phiên bản:** 1.0  
**Trạng thái:** Draft - Chờ review
