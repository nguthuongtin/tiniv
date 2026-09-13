import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';

export default function TrangDebug() {
  return (
    <Bo_Cuc_Trang tieu_de="Trang Debug (Tối Giản)" phu_de="Kiểm tra xem Bo_Cuc_Trang + Shell flexbox có vỡ layout không. Nếu div đỏ này hiển thị đúng (kích thước 100x100, nằm trong khung xanh và khung đỏ của main) → lỗi nằm ở thành phần con bên trong Bo_Cuc_Trang.">
      <div className="size-[100px] bg-red-600 border-4 border-red-900" />
    </Bo_Cuc_Trang>
  );
}
