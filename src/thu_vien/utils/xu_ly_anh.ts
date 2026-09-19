/**
 * Tiện ích nén và thu nhỏ ảnh đại diện phía trình duyệt (Client-side Canvas Compression)
 * Giúp giảm dung lượng từ 5MB - 10MB xuống còn ~15KB - 30KB, tiết kiệm băng thông và dung lượng lưu trữ.
 */
export const nenVaThuNhoAnh = (
  file: File,
  kichThuocToiDa = 256,
  chatLuong = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Lỗi đọc file ảnh.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Lỗi tải hình ảnh vào bộ nhớ.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Tính toán tỷ lệ co giãn để cạnh lớn nhất <= kichThuocToiDa
        if (width > height) {
          if (width > kichThuocToiDa) {
            height = Math.round((height * kichThuocToiDa) / width);
            width = kichThuocToiDa;
          }
        } else {
          if (height > kichThuocToiDa) {
            width = Math.round((width * kichThuocToiDa) / height);
            height = kichThuocToiDa;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Trình duyệt không hỗ trợ xử lý ảnh qua Canvas.'));
          return;
        }

        // Khử răng cưa chất lượng cao
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Xuất ra dạng dataURL định dạng JPEG/WEBP siêu nhẹ
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', chatLuong);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};
