import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export const formatNgay = (ngay: unknown, dinh_dang: string = 'DD/MM/YYYY'): string => {
  if (!ngay) {
    return '';
  }

  try {
    const ket_qua = dayjs(ngay as dayjs.ConfigType);
    if (!ket_qua.isValid()) {
      return '';
    }
    return ket_qua.format(dinh_dang);
  } catch {
    return '';
  }
};

export const formatNgayGio = (ngay: unknown): string => {
  return formatNgay(ngay, 'DD/MM/YYYY HH:mm');
};

export const layHomNay = () => dayjs();

export default formatNgay;
