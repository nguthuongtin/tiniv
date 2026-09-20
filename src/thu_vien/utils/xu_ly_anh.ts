/**
 * Tiện ích nén và thu nhỏ ảnh đại diện phía trình duyệt (Client-side Canvas Compression)
 * Giúp giảm dung lượng từ 5MB - 10MB xuống còn ~15KB - 30KB, tiết kiệm băng thông và dung lượng lưu trữ.
 */
export const nenVaThuNhoAnh = (
  file: File,
  kichThuocToiDa = 256,
  chatLuong = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Vui lòng chọn file hình ảnh hợp lệ.'));
      return;
    }

    const isImageMime = file.type && file.type.startsWith('image/');
    const isImageExt = /\.(jpe?g|png|webp|gif|bmp|heic|jfif|svg)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      reject(new Error('File được chọn không phải là hình ảnh (hỗ trợ JPG, PNG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu file ảnh.'));
    reader.onload = (e) => {
      const src = e.target?.result;
      if (!src || typeof src !== 'string') {
        reject(new Error('Dữ liệu ảnh rỗng hoặc không đọc được.'));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('Không thể giải mã hình ảnh để nén.'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          // Nếu không lấy được kích thước, trả về trực tiếp Data URL gốc
          resolve(src);
          return;
        }

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
          // Fallback nếu canvas context lỗi
          resolve(src);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', chatLuong);
          resolve(dataUrl);
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};
