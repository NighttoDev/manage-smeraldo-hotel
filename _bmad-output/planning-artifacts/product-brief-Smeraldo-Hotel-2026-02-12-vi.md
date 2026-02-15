---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - "_bmad-output/business-requirements.md"
date: 2026-02-12
author: Khoa
---

# Tài Liệu Sản Phẩm: Smeraldo Hotel

<!-- Nội dung sẽ được bổ sung tuần tự qua các bước quy trình làm việc cộng tác -->

## Tóm Tắt Điều Hành

Smeraldo Hotel là khách sạn boutique 24 phòng hoạt động trên 9 tầng tại Việt Nam. Tất cả hoạt động của khách sạn — quản lý phòng, chấm công nhân viên, kho hàng và hóa đơn — hiện đang được quản lý thủ công qua các bảng tính Excel. Điều này tạo ra những khó khăn hàng ngày: lỗi nhập liệu thủ công khi cập nhật đặt phòng, mất 30–60 phút thời gian nhân viên mỗi ngày để duy trì bảng tính, và không có cái nhìn tổng quan về công suất phòng hoặc vận hành.

Mục tiêu của dự án này là xây dựng một **ứng dụng web quản lý khách sạn nội bộ** tự động hóa và số hóa các quy trình làm việc hiện có — không phải để thay thế cách đội ngũ vận hành, mà là để làm cho các hoạt động đó nhanh hơn, chính xác hơn và trực quan hơn. Hệ thống được thiết kế dành riêng cho nhân viên nội bộ (lễ tân, quản lý, buồng phòng) không có tính năng dành cho khách.

---

## Tầm Nhìn Cốt Lõi

### Vấn Đề Cần Giải Quyết

Hoạt động hàng ngày của Smeraldo Hotel phụ thuộc vào nhiều bảng tính Excel cập nhật chậm, dễ sai sót và không kết nối với nhau. Nhân viên lễ tân mất đến một giờ mỗi ngày để cập nhật thủ công tình trạng phòng, kho hàng và chấm công. Các kênh đặt phòng (Agoda, Booking.com, Trip.com, quảng cáo Facebook) được quản lý riêng lẻ mà không có cái nhìn thống nhất, tạo ra rủi ro đặt phòng trùng và bỏ lỡ cập nhật. Không có tính toán tự động cho chấm công, hóa đơn hay mức tồn kho.

### Tác Động Của Vấn Đề

- **Mất thời gian:** 30–60 phút/ngày mỗi nhân viên để cập nhật bảng tính thủ công
- **Rủi ro sai sót:** Nhập liệu thủ công qua các file riêng lẻ dẫn đến lỗi đặt phòng và sai lệch chấm công
- **Điểm mù vận hành:** Không có khả năng theo dõi thời gian thực công suất phòng, mức tồn kho hay tài chính hàng tháng
- **Giới hạn mở rộng:** Khi lượng đặt phòng tăng qua các kênh OTA và Facebook, Excel ngày càng khó quản lý

### Tại Sao Các Giải Pháp Hiện Có Không Phù Hợp

Không có hệ thống PMS khách sạn nào được đánh giá — và điều này là có chủ đích. Các hệ thống chung (Cloudbeds, Little Hotelier, v.v.) áp đặt quy trình làm việc mới mà nhân viên phải học từ đầu, thường bằng tiếng Anh, với các tính năng và độ phức tạp vượt xa nhu cầu của khách sạn boutique 24 phòng. Đội ngũ đã có quy trình vận hành hiệu quả; điều cần thiết là một hệ thống **phản ánh và tự động hóa quy trình đó**, không phải thay thế nó.

### Giải Pháp Đề Xuất

Một ứng dụng web quản lý khách sạn nội bộ bằng tiếng Việt được xây dựng đặc biệt theo mô hình vận hành hiện có của Smeraldo Hotel. Hệ thống sẽ cung cấp:

- **Lịch sơ đồ phòng** trực quan hiển thị công suất thời gian thực, tên khách, ngày nhận/trả phòng và nguồn đặt phòng
- **Chấm công tự động** với điểm danh hàng ngày, hỗ trợ nửa ngày và xuất tổng kết hàng tháng
- **Quản lý kho hàng** cho đồ uống và vật tư với cảnh báo tồn kho và ghi nhận nhập/xuất
- **Quản lý hóa đơn** cho cả hóa đơn bán (phí phòng, VAT 8%) và hóa đơn mua hàng
- **Báo cáo tài chính và vận hành** thay thế tổng kết Excel thủ công hàng tháng
- Hỗ trợ **khách thuê căn hộ dài hạn** cùng với đặt phòng theo đêm tiêu chuẩn

### Điểm Khác Biệt Chính

- **Thiết kế bảo toàn quy trình:** Xây dựng phù hợp với cách Smeraldo đang vận hành — quy trình quen thuộc, thực thi tự động
- **Ưu tiên tiếng Việt:** Thiết kế cho nhân viên nói tiếng Việt với đơn vị VND và VAT 8% tích hợp sẵn
- **Chính xác theo quy mô boutique:** Tùy chỉnh cho khách sạn 24 phòng với phòng kiểu căn hộ và các kênh đặt phòng đa dạng bao gồm quảng cáo Facebook
- **Chỉ phục vụ nội bộ:** Không có độ phức tạp dành cho khách — thuần túy hiệu quả vận hành cho nhân viên và quản lý
- **Trung tâm vận hành thống nhất:** Một hệ thống thay thế 4+ file Excel riêng biệt cho phòng, chấm công, kho hàng và hóa đơn

---

## Người Dùng Mục Tiêu

### Người Dùng Chính

#### 🧑‍💼 Linh — Nhân Viên Lễ Tân

**Bối Cảnh & Hoàn Cảnh:**
Linh là lễ tân duy nhất trực ca tại Smeraldo Hotel, quản lý quầy lễ tân một mình trong mỗi ca làm. Cô ấy sử dụng smartphone và ứng dụng thành thạo, tiếp thu công cụ số nhanh chóng. Ngày làm việc của cô nhộn nhịp — khách đến, đặt phòng OTA vào, tình trạng phòng thay đổi — và cô là trung tâm điều phối mọi hoạt động khách sạn.

**Trải Nghiệm Vấn Đề Hiện Tại:**
Linh hiện đang phải xử lý 4+ bảng tính Excel để làm việc. Khi đợt check-in cao điểm ập đến, cô phải cập nhật thủ công sơ đồ phòng Excel, kiểm tra chéo đặt phòng OTA, ghi chấm công trong ngày và trả lời thắc mắc của khách — tất cả cùng lúc. Lỗi nhập liệu thủ công xảy ra trong giờ cao điểm: phòng đánh dấu có khách khi thực tế trống, hoặc ngày trả phòng nhập sai. Cập nhật kho hàng và hóa đơn chiếm thêm 30–60 phút khối lượng công việc hàng ngày sau khi đợt cao điểm kết thúc.

**Mục Tiêu & Động Lực:**
- Vượt qua đợt check-in cao điểm mà không mắc lỗi
- Biết ngay phòng nào trống, có khách, hoặc trả phòng hôm nay
- Giảm thời gian bảo trì bảng tính, dành nhiều thời gian hơn phục vụ khách
- Có một nơi duy nhất để kiểm tra và cập nhật mọi thứ

**Hình Dung Thành Công:**
*"Tôi mở ứng dụng, thấy sơ đồ phòng, check-in khách chỉ với hai cú nhấp, và chấm công tự động. Tôi không cần chạm vào Excel nữa."*

---

### Người Dùng Phụ

#### 👔 Khoa — Quản Lý Khách Sạn

**Bối Cảnh & Hoàn Cảnh:**
Khoa là chủ và quản lý khách sạn. Anh giám sát hoạt động nhưng không trực tiếp nhập liệu — đó là công việc của Linh. Anh cần tầm nhìn tổng quan về cách khách sạn đang vận hành, chủ yếu kiểm tra từ xa hoặc vào đầu/cuối ngày.

**Mục Tiêu & Động Lực:**
- Xem công suất phòng hôm nay chỉ với một cái nhìn (phòng nào có khách, phòng nào trống)
- Theo dõi chấm công nhân viên mà không cần hỏi ai
- Phát hiện xu hướng tài chính trong doanh thu và chi phí hàng tháng
- Tin tưởng dữ liệu chính xác mà không cần kiểm tra Excel thủ công

**Hình Dung Thành Công:**
*"Tôi mở bảng điều khiển, thấy công suất phòng và chấm công hôm nay trong chưa đầy 10 giây, và tiếp tục công việc."*

---

#### 🧹 Nhân Viên Buồng Phòng

**Bối Cảnh & Hoàn Cảnh:**
Nhân viên buồng phòng hiện nhận phân công dọn phòng qua lời nói hoặc ghi chú giấy từ lễ tân. Họ sử dụng smartphone cơ bản nhưng không tương tác với hệ thống nào hiện tại. Mục tiêu là cho họ khả năng tự cập nhật tình trạng phòng (ví dụ: đánh dấu phòng "Đã Dọn / Sẵn Sàng") để lễ tân không phải làm thay.

**Mục Tiêu & Động Lực:**
- Biết phòng nào cần dọn và thứ tự ưu tiên
- Đánh dấu phòng đã dọn/sẵn sàng mà không cần tìm lễ tân
- Giao diện đơn giản, tối thiểu — chỉ tập trung vào công việc cần làm

**Hình Dung Thành Công:**
*"Tôi dọn xong phòng 401, nhấn 'Sẵn Sàng' trong ứng dụng, và lễ tân ngay lập tức thấy phòng có thể nhận khách. Không cần gọi điện, không giấy tờ."*

---

### Hành Trình Người Dùng

#### Hành Trình Hàng Ngày của Linh (Chính)

| Giai Đoạn | Hiện Tại (Excel) | Với Ứng Dụng Smeraldo |
|-----------|------------------|----------------------|
| **Bắt đầu buổi sáng** | Mở 3-4 file Excel, kiểm tra tình trạng hôm qua | Mở bảng điều khiển — sơ đồ phòng hiển thị ngay |
| **Đợt check-in cao điểm** | Tìm thủ công đặt phòng trong bảng tính, cập nhật tình trạng phòng, ghi tên khách | Tìm đặt phòng trong lịch, check-in khách, phòng tự động cập nhật "Có Khách" |
| **Trong ngày** | Cập nhật kho hàng thủ công, ghi nhận đặt phòng OTA mới | Kho hàng cập nhật khi sử dụng; đặt phòng OTA xuất hiện tự động |
| **Chấm công** | Mở Excel chấm công, đánh dấu ca làm | Ứng dụng tự động ghi ca; nửa ngày đánh dấu một chạm |
| **Cuối ca** | Cập nhật tình trạng phòng, kiểm tra hóa đơn chưa thanh toán | Xác nhận tình trạng phòng, đánh dấu hóa đơn chờ xử lý — tối đa 5 phút |
| **Khoảnh khắc "Aha!"** | — | Tuần đầu: *"Tôi không chạm vào Excel cả ngày hôm nay."* |

#### Hành Trình Hàng Ngày của Khoa (Phụ)

| Giai Đoạn | Hiện Tại | Với Ứng Dụng Smeraldo |
|-----------|----------|----------------------|
| **Kiểm tra buổi sáng** | Hỏi Linh cập nhật miệng hoặc kiểm tra Excel | Mở bảng điều khiển: công suất hôm nay + chấm công trong một màn hình |
| **Đánh giá hàng tháng** | Tổng hợp thủ công doanh thu/chi phí từ nhiều file | Xuất báo cáo tài chính hàng tháng — đã tính toán sẵn |
| **Khoảnh khắc "Aha!"** | — | *"Tôi có thể thấy mọi thứ mà không cần gọi ai."* |

#### Hành Trình Buồng Phòng (Phụ)

| Giai Đoạn | Hiện Tại | Với Ứng Dụng Smeraldo |
|-----------|----------|----------------------|
| **Nhận phân công** | Hướng dẫn miệng hoặc danh sách giấy | Kiểm tra phòng được phân công trong ứng dụng |
| **Sau khi dọn** | Báo lễ tân bằng lời nói | Nhấn "Phòng Sẵn Sàng" — lễ tân thấy ngay |
| **Khoảnh khắc "Aha!"** | — | *"Không cần chạy ra quầy lễ tân nữa."* |
