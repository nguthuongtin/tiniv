export type PhamViTaiLieu = 'chung' | 'rieng';

export type LoaiLienKet =
  | 'google_sheets'
  | 'google_docs'
  | 'google_drive'
  | 'google_slides'
  | 'figma'
  | 'canva'
  | 'pdf'
  | 'video'
  | 'trang_web'
  | 'khac';

export interface TaiLieuLienKet {
  id: string;
  tieu_de: string;
  url: string;
  mo_ta?: string | null;
  pham_vi: PhamViTaiLieu;
  danh_muc?: string | null;
  loai_lien_ket: LoaiLienKet;
  the_tags?: string[] | null;
  anh_thu_nho?: string | null;
  nguoi_tao_id: string;
  ten_nguoi_tao?: string | null;
  chuc_vu_nguoi_tao?: string | null;
  url_anh_nguoi_tao?: string | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
  trang_thai: 'hoat_dong' | 'da_xoa';
  ghim?: boolean;
  luot_mo?: number;
}

export interface TaoTaiLieuDTO {
  tieu_de: string;
  url: string;
  mo_ta?: string | null;
  pham_vi: PhamViTaiLieu;
  danh_muc?: string | null;
  loai_lien_ket?: LoaiLienKet;
  the_tags?: string[] | null;
  anh_thu_nho?: string | null;
  ghim?: boolean;
}

export interface CapNhatTaiLieuDTO extends Partial<TaoTaiLieuDTO> {
  id: string;
}

export const NHAN_LOAI_LIEN_KET: Record<LoaiLienKet, { nhan: string; mau: string; iconKey: string }> = {
  google_sheets: { nhan: 'Google Sheets / Excel', mau: 'emerald', iconKey: 'sheets' },
  google_docs: { nhan: 'Google Docs / Word', mau: 'blue', iconKey: 'docs' },
  google_drive: { nhan: 'Google Drive', mau: 'amber', iconKey: 'drive' },
  google_slides: { nhan: 'Google Slides / PPT', mau: 'orange', iconKey: 'slides' },
  figma: { nhan: 'Figma', mau: 'purple', iconKey: 'figma' },
  canva: { nhan: 'Canva', mau: 'cyan', iconKey: 'canva' },
  pdf: { nhan: 'Tài liệu PDF', mau: 'rose', iconKey: 'pdf' },
  video: { nhan: 'Video / YouTube', mau: 'red', iconKey: 'video' },
  trang_web: { nhan: 'Trang Web', mau: 'indigo', iconKey: 'web' },
  khac: { nhan: 'Khác', mau: 'slate', iconKey: 'other' }
};

export const DANH_MUC_GOI_Y = [
  'Biểu mẫu & Hợp đồng',
  'Quy trình vận hành',
  'Tài liệu đào tạo',
  'Hồ sơ kỹ thuật',
  'Tài liệu kinh doanh',
  'Công cụ & Phần mềm',
  'Tài nguyên thiết kế',
  'Khác'
];
