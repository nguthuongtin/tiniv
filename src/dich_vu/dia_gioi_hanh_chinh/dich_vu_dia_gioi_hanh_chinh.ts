'use client';

import {
  addDoc,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import type { DiaGioiHanhChinh } from '../../thu_vien/types/dia_gioi_hanh_chinh';
import {
  thamChieuCollection,
  thamChieuBanGhi
} from '../../thu_vien/firebase/client_firebase';

const COLLECTION_NAME = 'dia_gioi_hanh_chinh' as const;

// 13 tỉnh thành Đồng bằng Sông Cửu Long (Miền Tây)
export const DANH_SACH_TINH_MIEN_TAY = [
  'An Giang',
  'Cần Thơ',
  'Đồng Tháp',
  'Kiên Giang',
  'Cà Mau',
  'Bạc Liêu',
  'Sóc Trăng',
  'Bến Tre',
  'Tiền Giang',
  'Vĩnh Long',
  'Trà Vinh',
  'Hậu Giang',
  'Long An'
] as const;

// Danh sách xã, phường, thị trấn trọng điểm thuộc 13 tỉnh Miền Tây sau sáp nhập (Nghị quyết UBTVQH 2023-2025)
export const DS_DIA_GIOI_MAC_DINH: Omit<DiaGioiHanhChinh, 'id'>[] = [
  // --- AN GIANG --- (Bao gồm TX Tịnh Biên thành lập mới)
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Bình (TP Long Xuyên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Long (TP Long Xuyên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Phước (TP Long Xuyên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Bình Khánh (TP Long Xuyên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Châu Phú A (TP Châu Đốc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Châu Phú B (TP Châu Đốc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Núi Sam (TP Châu Đốc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Tịnh Biên (TX Tịnh Biên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Chi Lăng (TX Tịnh Biên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Nhà Bàng (TX Tịnh Biên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Thới Sơn (TX Tịnh Biên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Long Thạnh (TX Tân Châu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Long Hưng (TX Tân Châu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Xã Phú Hòa (H. Thoại Sơn)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Núi Sập (H. Thoại Sơn)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Chợ Mới (H. Chợ Mới)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Xã Kiến An (H. Chợ Mới)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Tri Tôn (H. Tri Tôn)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Phú Mỹ (H. Phú Tân)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn An Châu (H. Châu Thành)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- CẦN THƠ --- (Sau sáp nhập An Cư, An Phú, An Nghiệp vào Phường Thới Bình theo NQ 1192/NQ-UBTVQH15)
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Thới Bình (Q. Ninh Kiều - Mới)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Tân An (Q. Ninh Kiều)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Xuân Khánh (Q. Ninh Kiều)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Cái Khế (Q. Ninh Kiều)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường An Khánh (Q. Ninh Kiều)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Hưng Lợi (Q. Ninh Kiều)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Lê Bình (Q. Cái Răng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Hưng Phú (Q. Cái Răng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Bình Thủy (Q. Bình Thủy)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Châu Văn Liêm (Q. Ô Môn)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Thốt Nốt (Q. Thốt Nốt)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Thị trấn Phong Điền (H. Phong Điền)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Xã Mỹ Khánh (H. Phong Điền)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Thị trấn Thới Lai (H. Thới Lai)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- TIỀN GIANG --- (Sau sáp nhập P7 vào P1, P3 & P8 vào P2; TP Gò Công thành lập mới theo NQ 1202/NQ-UBTVQH15)
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 1 (TP Mỹ Tho - Sáp nhập P7)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 2 (TP Mỹ Tho - Sáp nhập P3, P8)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 4 (TP Mỹ Tho)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 5 (TP Mỹ Tho)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 6 (TP Mỹ Tho)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 9 (TP Mỹ Tho)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 10 (TP Mỹ Tho)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Xã Bình Trưng (H. Châu Thành - Sáp nhập Hữu Đạo, Dưỡng Điềm)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Tân Hiệp (H. Châu Thành - Sáp nhập Tân Lý Tây)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 1 (TP Gò Công)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 2 (TP Gò Công)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 1 (TX Cai Lậy)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Cái Bè (H. Cái Bè)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Chợ Gạo (H. Chợ Gạo)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- BẾN TRE --- (Sau sáp nhập P4, P5 vào Phường An Hội theo NQ 1201/NQ-UBTVQH15)
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường An Hội (TP Bến Tre - Sáp nhập P4, P5)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường Phú Khương (TP Bến Tre)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường Phú Tân (TP Bến Tre)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Xã Mỹ Thạnh An (TP Bến Tre)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Châu Thành (H. Châu Thành)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Chợ Lách (H. Chợ Lách)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Mỏ Cày (H. Mỏ Cày Nam)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Ba Tri (H. Ba Tri)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Bình Đại (H. Bình Đại)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- LONG AN --- (Sau sáp nhập Phường 2 vào Phường 1 TP Tân An theo NQ 1244/NQ-UBTVQH15)
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 1 (TP Tân An - Sáp nhập P2)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 3 (TP Tân An)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 4 (TP Tân An)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 5 (TP Tân An)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 7 (TP Tân An)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Xã An Thạnh (H. Bến Lức - Sáp nhập Tân Hòa)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Bến Lức (H. Bến Lức)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Cần Giuộc (H. Cần Giuộc)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Cần Đước (H. Cần Đước)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Hậu Nghĩa (H. Đức Hòa)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Đức Hòa (H. Đức Hòa)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 1 (TX Kiến Tường)', loai: 'phuong', trang_thai: 'hoat_dong' },

  // --- ĐỒNG THÁP --- (Sau sắp xếp ĐVHC cấp xã theo NQ 1284/NQ-UBTVQH15)
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 1 (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 2 (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 3 (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 4 (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường Mỹ Phú (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường Hòa Thuận (TP Cao Lãnh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 1 (TP Sa Đéc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 2 (TP Sa Đéc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường An Hòa (TP Sa Đéc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Xã Tân Quy Đông (TP Sa Đéc)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường An Lộc (TP Hồng Ngự)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Lấp Vò (H. Lấp Vò)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Lai Vung (H. Lai Vung)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Mỹ An (H. Tháp Mười)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Tràm Chim (H. Tam Nông)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- CÀ MAU --- (Sau sáp nhập Phường 2 vào Phường 4 TP Cà Mau)
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 4 (TP Cà Mau - Sáp nhập P2)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 1 (TP Cà Mau)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 5 (TP Cà Mau)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 6 (TP Cà Mau)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 7 (TP Cà Mau)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 8 (TP Cà Mau)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Xã Lý Văn Lâm (TP Cà Mau)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Năm Căn (H. Năm Căn)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Sông Đốc (H. Trần Văn Thời)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Cái Nước (H. Cái Nước)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Đầm Dơi (H. Đầm Dơi)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Xã Đất Mũi (H. Ngọc Hiển)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Rạch Gốc (H. Ngọc Hiển)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- KIÊN GIANG ---
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Thanh Vân (TP Rạch Giá)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Lạc (TP Rạch Giá)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường An Hòa (TP Rạch Giá)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Quang (TP Rạch Giá)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Đông Hồ (TP Hà Tiên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Pháo Đài (TP Hà Tiên)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Dương Đông (TP Phú Quốc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường An Thới (TP Phú Quốc)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Xã Hàm Ninh (TP Phú Quốc)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Xã Cửa Dương (TP Phú Quốc)', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Kiên Lương (H. Kiên Lương)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Hòn Đất (H. Hòn Đất)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Minh Lương (H. Châu Thành)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Giồng Riềng (H. Giồng Riềng)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- BẠC LIÊU ---
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 1 (TP Bạc Liêu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 2 (TP Bạc Liêu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 3 (TP Bạc Liêu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 5 (TP Bạc Liêu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 7 (TP Bạc Liêu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 1 (TX Giá Rai)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường Hộ Phòng (TX Giá Rai)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Hòa Bình (H. Hòa Bình)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Gành Hào (H. Đông Hải)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Phước Long (H. Phước Long)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- SÓC TRĂNG ---
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 1 (TP Sóc Trăng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 2 (TP Sóc Trăng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 3 (TP Sóc Trăng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 4 (TP Sóc Trăng)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 1 (TX Vĩnh Châu)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 1 (TX Ngã Năm)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Mỹ Xuyên (H. Mỹ Xuyên)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Trần Đề (H. Trần Đề)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Cù Lao Dung (H. Cù Lao Dung)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- VĨNH LONG ---
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 1 (TP Vĩnh Long)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 2 (TP Vĩnh Long)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 3 (TP Vĩnh Long)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 4 (TP Vĩnh Long)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 9 (TP Vĩnh Long)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường Cái Vồn (TX Bình Minh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Cái Nhum (H. Mang Thít)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Long Hồ (H. Long Hồ)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Trà Ôn (H. Trà Ôn)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Tam Bình (H. Tam Bình)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Vũng Liêm (H. Vũng Liêm)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- TRÀ VINH ---
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 1 (TP Trà Vinh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 2 (TP Trà Vinh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 3 (TP Trà Vinh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 7 (TP Trà Vinh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 1 (TX Duyên Hải)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Càng Long (H. Càng Long)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Cầu Kè (H. Cầu Kè)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Tiểu Cần (H. Tiểu Cần)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Châu Thành (H. Châu Thành)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Trà Cú (H. Trà Cú)', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- HẬU GIANG ---
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 1 (TP Vị Thanh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 3 (TP Vị Thanh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 4 (TP Vị Thanh)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Ngã Bảy (TP Ngã Bảy)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Hiệp Thành (TP Ngã Bảy)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Thuận An (TX Long Mỹ)', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Thị trấn Cây Dương (H. Phụng Hiệp)', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Thị trấn Ngã Sáu (H. Châu Thành)', loai: 'thi_trai', trang_thai: 'hoat_dong' }
];

export const layDanhSachDiaGioiHanhChinh = async (): Promise<DiaGioiHanhChinh[]> => {
  try {
    const q = query(
      thamChieuCollection(COLLECTION_NAME),
      limit(1000)
    );
    const snap = await getDocs(q);
    const res: DiaGioiHanhChinh[] = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<DiaGioiHanhChinh, 'id'>) }))
      .filter((x) => x.trang_thai === 'hoat_dong' || !x.trang_thai);

    if (res.length === 0) {
      // Tự động khởi tạo dữ liệu mẫu Miền Tây vào Firestore trong background nếu chưa có
      void tuDongKhoiTaoNeuChuaCo();
      return DS_DIA_GIOI_MAC_DINH.map((item, index) => ({
        id: `default_${index + 1}`,
        ...item
      }));
    }

    return res;
  } catch (err) {
    console.warn('[dich_vu_dia_gioi_hanh_chinh] Catch fallback local:', err);
    return DS_DIA_GIOI_MAC_DINH.map((item, index) => ({
      id: `default_${index + 1}`,
      ...item
    }));
  }
};

const tuDongKhoiTaoNeuChuaCo = async () => {
  try {
    const now = new Date().toISOString();
    for (const item of DS_DIA_GIOI_MAC_DINH) {
      await addDoc(thamChieuCollection(COLLECTION_NAME), {
        ...item,
        ngay_tao: now,
        ngay_cap_nhat: now
      });
    }
  } catch (e) {
    console.warn('Lỗi tự động khởi tạo dữ liệu địa giới:', e);
  }
};

export const napDuLieuMauMienTay = async (): Promise<number> => {
  const now = new Date().toISOString();
  let dem = 0;
  try {
    const q = query(thamChieuCollection(COLLECTION_NAME), limit(1000));
    const snap = await getDocs(q);
    const existing = new Set(
      snap.docs.map((d) => {
        const data = d.data();
        return `${data.tinh_thanh}_${data.xa_phuong}`.toLowerCase();
      })
    );

    for (const item of DS_DIA_GIOI_MAC_DINH) {
      const key = `${item.tinh_thanh}_${item.xa_phuong}`.toLowerCase();
      if (!existing.has(key)) {
        await addDoc(thamChieuCollection(COLLECTION_NAME), {
          ...item,
          ngay_tao: now,
          ngay_cap_nhat: now
        });
        dem++;
      }
    }
  } catch (err) {
    console.warn('Lỗi nạp dữ liệu mẫu Miền Tây:', err);
  }
  return dem;
};

export const taoDiaGioiHanhChinh = async (
  data: Omit<DiaGioiHanhChinh, 'id' | 'ngay_tao' | 'ngay_cap_nhat' | 'trang_thai'> & {
    loai?: 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac';
  }
): Promise<DiaGioiHanhChinh> => {
  const now = new Date().toISOString();
  const raw = {
    tinh_thanh: data.tinh_thanh.trim(),
    xa_phuong: data.xa_phuong.trim(),
    loai: data.loai || 'xa',
    trang_thai: 'hoat_dong' as const,
    ngay_tao: now,
    ngay_cap_nhat: now
  };

  try {
    const ref = await addDoc(thamChieuCollection(COLLECTION_NAME), raw);
    return { id: ref.id, ...raw };
  } catch (err) {
    console.warn('Lỗi tạo địa giới hành chính Firestore:', err);
    return { id: `local_dg_${Date.now()}`, ...raw };
  }
};

export const capNhatDiaGioiHanhChinh = async (
  id: string,
  data: Partial<Omit<DiaGioiHanhChinh, 'id'>>
): Promise<void> => {
  const now = new Date().toISOString();
  try {
    await setDoc(
      thamChieuBanGhi(COLLECTION_NAME, id),
      { ...data, ngay_cap_nhat: now },
      { merge: true }
    );
  } catch (err) {
    console.warn('Lỗi cập nhật địa giới hành chính Firestore:', err);
  }
};

export const xoaDiaGioiHanhChinh = async (id: string): Promise<void> => {
  try {
    await setDoc(
      thamChieuBanGhi(COLLECTION_NAME, id),
      { trang_thai: 'da_xoa', ngay_cap_nhat: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    console.warn('Lỗi xóa địa giới hành chính Firestore:', err);
  }
};
