'use client';

import {
  addDoc,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import type { DiaGioiHanhChinh } from '../../thu_vien/types/dia_gioi_hanh_chinh';
import {
  thamChieuCollection,
  thamChieuBanGhi,
  firebaseFirestore
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
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Bình', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Long', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Mỹ Phước', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Bình Khánh', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Châu Phú A', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Châu Phú B', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Núi Sam', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Tịnh Biên', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Chi Lăng', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Nhà Bàng', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Thới Sơn', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Long Thạnh', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Phường Long Hưng', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Xã Phú Hòa', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Núi Sập', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Chợ Mới', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Xã Kiến An', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Tri Tôn', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn Phú Mỹ', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'An Giang', xa_phuong: 'Thị trấn An Châu', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- CẦN THƠ --- (Sau sáp nhập An Cư, An Phú, An Nghiệp vào Phường Thới Bình theo NQ 1192/NQ-UBTVQH15)
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Thới Bình', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Tân An', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Xuân Khánh', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Cái Khế', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường An Khánh', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Hưng Lợi', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Lê Bình', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Hưng Phú', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Bình Thủy', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Châu Văn Liêm', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Phường Thốt Nốt', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Thị trấn Phong Điền', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Xã Mỹ Khánh', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cần Thơ', xa_phuong: 'Thị trấn Thới Lai', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- TIỀN GIANG --- (Sau sáp nhập P7 vào P1, P3 & P8 vào P2; TP Gò Công thành lập mới theo NQ 1202/NQ-UBTVQH15)
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 5', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 6', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 9', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Phường 10', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Xã Bình Trưng', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Tân Hiệp', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Cái Bè', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Tiền Giang', xa_phuong: 'Thị trấn Chợ Gạo', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- BẾN TRE --- (Sau sáp nhập P4, P5 vào Phường An Hội theo NQ 1201/NQ-UBTVQH15)
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường An Hội', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường Phú Khương', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Phường Phú Tân', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Xã Mỹ Thạnh An', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Châu Thành', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Chợ Lách', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Mỏ Cày', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Ba Tri', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bến Tre', xa_phuong: 'Thị trấn Bình Đại', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- LONG AN --- (Sau sáp nhập Phường 2 vào Phường 1 TP Tân An theo NQ 1244/NQ-UBTVQH15)
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 5', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Phường 7', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Xã An Thạnh', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Bến Lức', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Cần Giuộc', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Cần Đước', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Hậu Nghĩa', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Long An', xa_phuong: 'Thị trấn Đức Hòa', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- ĐỒNG THÁP --- (Sau sắp xếp ĐVHC cấp xã theo NQ 1284/NQ-UBTVQH15)
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường Mỹ Phú', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường Hòa Thuận', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường An Hòa', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Xã Tân Quy Đông', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Phường An Lộc', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Lấp Vò', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Lai Vung', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Mỹ An', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Đồng Tháp', xa_phuong: 'Thị trấn Tràm Chim', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- CÀ MAU --- (Sau sáp nhập Phường 2 vào Phường 4 TP Cà Mau)
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 5', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 6', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 7', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Phường 8', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Xã Lý Văn Lâm', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Năm Căn', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Sông Đốc', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Cái Nước', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Đầm Dơi', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Xã Đất Mũi', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Cà Mau', xa_phuong: 'Thị trấn Rạch Gốc', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- KIÊN GIANG ---
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Thanh Vân', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Lạc', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường An Hòa', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Vĩnh Quang', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Đông Hồ', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Pháo Đài', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường Dương Đông', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Phường An Thới', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Xã Hàm Ninh', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Xã Cửa Dương', loai: 'xa', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Kiên Lương', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Hòn Đất', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Minh Lương', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Kiên Giang', xa_phuong: 'Thị trấn Giồng Riềng', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- BẠC LIÊU ---
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 5', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường 7', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Phường Hộ Phòng', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Hòa Bình', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Gành Hào', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Bạc Liêu', xa_phuong: 'Thị trấn Phước Long', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- SÓC TRĂNG ---
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Mỹ Xuyên', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Trần Đề', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Sóc Trăng', xa_phuong: 'Thị trấn Cù Lao Dung', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- VĨNH LONG ---
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường 9', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Phường Cái Vồn', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Cái Nhum', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Long Hồ', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Trà Ôn', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Tam Bình', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Vĩnh Long', xa_phuong: 'Thị trấn Vũng Liêm', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- TRÀ VINH ---
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 2', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Phường 7', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Càng Long', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Cầu Kè', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Tiểu Cần', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Châu Thành', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Trà Vinh', xa_phuong: 'Thị trấn Trà Cú', loai: 'thi_trai', trang_thai: 'hoat_dong' },

  // --- HẬU GIANG ---
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 1', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 3', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường 4', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Ngã Bảy', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Hiệp Thành', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Phường Thuận An', loai: 'phuong', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Thị trấn Cây Dương', loai: 'thi_trai', trang_thai: 'hoat_dong' },
  { tinh_thanh: 'Hậu Giang', xa_phuong: 'Thị trấn Ngã Sáu', loai: 'thi_trai', trang_thai: 'hoat_dong' }
];

export const layDanhSachDiaGioiHanhChinh = async (): Promise<DiaGioiHanhChinh[]> => {
  try {
    const q = query(
      thamChieuCollection(COLLECTION_NAME),
      limit(10000)
    );
    const snap = await getDocs(q);
    const rawList: DiaGioiHanhChinh[] = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<DiaGioiHanhChinh, 'id'>) }))
      .filter((x) => x.trang_thai === 'hoat_dong' || !x.trang_thai);

    if (rawList.length === 0) {
      return [];
    }

    // Khử trùng lặp tên xã theo tỉnh
    const mapUnique = new Map<string, DiaGioiHanhChinh>();
    for (const item of rawList) {
      const key = `${item.tinh_thanh.trim()}__${item.xa_phuong.trim()}`.toLowerCase();
      if (!mapUnique.has(key)) {
        mapUnique.set(key, item);
      }
    }

    return Array.from(mapUnique.values());
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

/**
 * Tự động phân loại đơn vị hành chính dựa vào tiền tố tên gọi
 */
export const phanLoaiXaPhuong = (
  ten: string
): 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac' => {
  const lower = ten.trim().toLowerCase();
  if (lower.startsWith('phường') || lower.startsWith('p.')) return 'phuong';
  if (lower.startsWith('xã') || lower.startsWith('x.')) return 'xa';
  if (
    lower.startsWith('thị trấn') ||
    lower.startsWith('tt.') ||
    lower.startsWith('t.trấn') ||
    lower.startsWith('thị xã') ||
    lower.startsWith('tx.')
  )
    return 'thi_trai';
  if (lower.startsWith('đặc khu') || lower.startsWith('đk.')) return 'dac_khu';
  return 'xa';
};

export interface KetQuaImportDiaGioi {
  tongSoFile: number;
  tongHopLe: number;
  thanhCong: number;
  boQua: number;
}

/**
 * Nhập hàng loạt địa giới hành chính vào Firestore sử dụng writeBatch theo khối (chunk 400 records)
 */
export const nhapHangLoatDiaGioiHanhChinh = async (
  danhSach: Array<{
    tinh_thanh: string;
    xa_phuong: string;
    loai?: 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac';
  }>,
  onTienDo?: (daXuLy: number, tongSo: number) => void
): Promise<KetQuaImportDiaGioi> => {
  const now = new Date().toISOString();

  // Khử trùng lặp ngay trong danh sách file đầu vào
  const mapUniq = new Map<
    string,
    {
      tinh_thanh: string;
      xa_phuong: string;
      loai: 'xa' | 'phuong' | 'dac_khu' | 'thi_trai' | 'khac';
    }
  >();

  for (const item of danhSach) {
    const tinh = item.tinh_thanh.trim();
    const xa = item.xa_phuong.trim();
    if (!tinh || !xa) continue;

    const key = `${tinh}__${xa}`.toLowerCase();
    if (!mapUniq.has(key)) {
      mapUniq.set(key, {
        tinh_thanh: tinh,
        xa_phuong: xa,
        loai: item.loai || phanLoaiXaPhuong(xa)
      });
    }
  }

  const items = Array.from(mapUniq.values());
  const tongHopLe = items.length;
  let thanhCong = 0;
  const CHUNK_SIZE = 400; // Firestore giới hạn tối đa 500 ops/batch

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(firebaseFirestore);

    for (const it of chunk) {
      // Document ID xác định duy nhất theo Tỉnh + Xã, loại bỏ ký tự không an toàn
      const docId = `${it.tinh_thanh}__${it.xa_phuong}`
        .replace(/[\/\\#?\[\]]/g, '-')
        .replace(/\s+/g, '_')
        .toLowerCase();

      const ref = doc(firebaseFirestore, COLLECTION_NAME, docId);
      batch.set(
        ref,
        {
          tinh_thanh: it.tinh_thanh,
          xa_phuong: it.xa_phuong,
          loai: it.loai,
          trang_thai: 'hoat_dong',
          ngay_cap_nhat: now,
          ngay_tao: now
        },
        { merge: true }
      );
    }

    await batch.commit();
    thanhCong += chunk.length;

    if (onTienDo) {
      onTienDo(thanhCong, tongHopLe);
    }
  }

  return {
    tongSoFile: danhSach.length,
    tongHopLe,
    thanhCong,
    boQua: danhSach.length - tongHopLe
  };
};

/**
 * Xóa sạch toàn bộ dữ liệu địa giới hành chính (Hard Delete)
 */
export const xoaToanBoDiaGioiHanhChinh = async (): Promise<number> => {
  try {
    const q = query(thamChieuCollection(COLLECTION_NAME), limit(10000));
    const snap = await getDocs(q);
    
    if (snap.empty) return 0;

    let daXoa = 0;
    const CHUNK_SIZE = 400; // Giới hạn batch

    for (let i = 0; i < snap.docs.length; i += CHUNK_SIZE) {
      const chunk = snap.docs.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(firebaseFirestore);

      for (const d of chunk) {
        batch.delete(d.ref);
      }
      
      await batch.commit();
      daXoa += chunk.length;
    }

    return daXoa;
  } catch (err) {
    console.warn('Lỗi khi xóa toàn bộ địa giới hành chính:', err);
    throw err;
  }
};
