## Bug đã cài:
1. http://localhost:5173/index.php -> Phần dành cho bạn không được render
2. http://localhost:5173/product-detail.html?id=1000 -> Không hiển thị "sản phẩm không tồn tại" với id không tồn tại trong hệ thống
3. http://localhost:5173/product-detail.html?id=12 -> Sản phẩm đã hết hàng vẫn có thể thêm vào giỏ hàng
4. http://localhost:5173/cart.html -> khi giảm số lượng sản phẩm trong giỏ hàng, có thể giảm xuống số âm
5. http://localhost:5173/register.html -> Khi tạo tk mới, trường "xác nhận mật khẩu" không khớp với trường "mật khẩu" nhưng không báo lỗi và vẫn tạo được tk
6. http://localhost:5173/change-password.html -> trường "xác nhận mật khẩu" không khớp với trường "mật khẩu" nhưng không báo lỗi và vẫn đổi được mật khẩu
7. http://localhost:5173/manager.html?content=import-product -> Khi nhập hàng, trường "tỉ lệ lợi nhuận" chấp nhận số âm
8. http://localhost:5173/manager.html?content=auth-group -> Có thể tắt quyền quản lý, sau khi tắt tài khoản admin không đăng nhập được
9. http://localhost:5173/history.html -> Trạng thái đơn hàng "đang giao" vẫn có thể thay đổi phương thức giao của đơn hàng và hủy đơn 
10. http://localhost:5173/history.html -> đường dẫn: "Trang chủ / Lịch sử mua hàng" khi bấm vào Trang chủ không quay về trang chủ