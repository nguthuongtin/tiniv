/**
 * QUY CHUẨN ĐẶT TÊN KHÁCH HÀNG VÀ DỰ ÁN
 * Hệ thống Quản trị Doanh nghiệp & Dự án B2B / B2G (TINIPMS)
 */

export interface MauGoiYDatTen {
  id: string;
  nhan: string;
  mau: string;
  moTa?: string;
}

export interface ViDuSoSanh {
  dung: string;
  sai: string;
  lyDo: string;
}

export interface NhomQuyChuan {
  tieuDe: string;
  congThuc: string;
  giaiThich: string;
  mauGoiY: MauGoiYDatTen[];
  viDu: ViDuSoSanh[];
  luuY: string[];
}

export const QUY_CHUAN_KHACH_HANG: {
  congThucTongQuat: string;
  nhom: NhomQuyChuan[];
  cacLuuYChung: string[];
} = {
  congThucTongQuat: '[Loại hình / Cơ quan] [Tên riêng] - [Địa bàn / Đơn vị quản lý]',
  nhom: [
    {
      tieuDe: 'Cơ quan Nhà nước / Chính quyền / Đơn vị sự nghiệp',
      congThuc: '[Tên cơ quan/đơn vị] - [Đơn vị hành chính cấp Huyện/Tỉnh]',
      giaiThich:
        'Sử dụng các chữ viết tắt chuẩn hóa (UBND, HĐND, CA, BCHQS, GD&ĐT, TN&MT, TTYT), viết hoa đúng chuẩn chính quyền và có gạch nối phân cách địa danh.',
      mauGoiY: [
        { id: 'kh-ubnd-xa', nhan: 'UBND Xã/Phường', mau: 'UBND Xã [Tên] - Huyện [Tên]' },
        { id: 'kh-ubnd-huyen', nhan: 'UBND Huyện/TP', mau: 'UBND Huyện [Tên] - Tỉnh [Tên]' },
        { id: 'kh-cong-an', nhan: 'Công an', mau: 'Công an Huyện [Tên] - Tỉnh [Tên]' },
        { id: 'kh-phong-ban', nhan: 'Phòng/Ban', mau: 'Phòng GD&ĐT Huyện [Tên]' },
        { id: 'kh-truong-hoc', nhan: 'Trường học', mau: 'Trường THPT [Tên] - Huyện [Tên]' },
        { id: 'kh-y-te', nhan: 'Y tế / BV', mau: 'Trung tâm Y tế Huyện [Tên]' }
      ],
      viDu: [
        {
          dung: 'UBND Xã Đắk R\'Moan - TP. Gia Nghĩa',
          sai: 'ubnd dakrmoan, xã đắc rmoan',
          lyDo: 'Cần viết hoa cơ quan, viết đúng chính tả địa phương và có gạch nối phân cách địa bàn.'
        },
        {
          dung: 'Công an Huyện Cư Jút - Đắk Nông',
          sai: 'CA Huyện Cư Jút, Công an Cư Jút a Tuấn',
          lyDo: 'Không gắn tên cán bộ hay số điện thoại vào tên khách hàng; dùng tên cơ quan chính thức.'
        },
        {
          dung: 'Phòng GD&ĐT Huyện Krông Nô',
          sai: 'Phòng giáo dục krongno, phong gd&dt',
          lyDo: 'Viết tắt chuẩn GD&ĐT, viết hoa tên riêng Krông Nô.'
        }
      ],
      luuY: [
        'Các từ viết tắt chuẩn được phép dùng: UBND, HĐND, CA (Công an), BCHQS, GD&ĐT, TN&MT, VHTT, LĐTB&XH, TTYT, BHXH, TAND, VKSND.',
        'Địa danh hành chính nên ghi rõ: TP., Thị xã, Huyện, Xã, Phường.',
        'Tuyệt đối không ghép thông tin người liên hệ (vd: "anh Tuấn", "chị Lan") vào tên cơ quan khách hàng.'
      ]
    },
    {
      tieuDe: 'Doanh nghiệp / Tập đoàn / Công ty',
      congThuc: '[Loại hình DN] [Tên Thương mại] - [Chi nhánh / Địa phương / Lĩnh vực]',
      giaiThich:
        'Ghi rõ loại hình doanh nghiệp (Công ty CP, Công ty TNHH, DNTN) kèm tên thương hiệu và chi nhánh nếu có.',
      mauGoiY: [
        { id: 'kh-cty-tnhh', nhan: 'Công ty TNHH', mau: 'Công ty TNHH [Tên DN]' },
        { id: 'kh-cty-cp', nhan: 'Công ty CP', mau: 'Công ty CP [Tên DN]' },
        { id: 'kh-cty-cn', nhan: 'Công ty có Chi nhánh', mau: 'Công ty [Tên DN] - Chi nhánh [Địa bàn]' },
        { id: 'kh-tap-doan', nhan: 'Tập đoàn', mau: 'Tập đoàn [Tên] - CN [Địa bàn]' }
      ],
      viDu: [
        {
          dung: 'Công ty CP Công nghệ Sao Mai - CN Đắk Nông',
          sai: 'Cty Sao Mai, Sao mai dak nong',
          lyDo: 'Ghi rõ Công ty CP và viết hoa thương hiệu, ghi rõ chi nhánh.'
        },
        {
          dung: 'Công ty TNHH MTV Cà phê An Thái',
          sai: 'TNHH Cà phê An Thái, An Thai Coffee',
          lyDo: 'Đồng bộ tên đăng ký kinh doanh chính thức của doanh nghiệp.'
        }
      ],
      luuY: [
        'Nên ưu tiên dùng tên theo Đăng ký kinh doanh hoặc Hóa đơn VAT.',
        'Nếu doanh nghiệp có nhiều chi nhánh, thêm " - CN [Tên tỉnh/huyện]" ở đuôi.'
      ]
    },
    {
      tieuDe: 'Hộ kinh doanh / Khách hàng Cá nhân',
      congThuc: '[HKD / KH] [Họ và tên chủ hộ/khách] - [Tên Cửa hàng / Ngành nghề]',
      giaiThich:
        'Phân biệt rõ Hộ kinh doanh (HKD) hoặc Khách hàng cá nhân (KH) kèm tên cơ sở kinh doanh.',
      mauGoiY: [
        { id: 'kh-hkd-ch', nhan: 'Hộ KD Cửa hàng', mau: 'HKD [Họ tên] - Tiệm/Cửa hàng [Tên]' },
        { id: 'kh-hkd-dl', nhan: 'Hộ KD Đại lý', mau: 'HKD [Họ tên] - Đại lý [Tên]' },
        { id: 'kh-ca-nhan', nhan: 'Cá nhân lẻ', mau: 'KH [Họ và tên] - [Địa chỉ ngắn]' }
      ],
      viDu: [
        {
          dung: 'HKD Nguyễn Văn Nam - Tiệm Vàng Kim Phát',
          sai: 'Tiệm vàng Kim Phát, Anh Nam bán vàng',
          lyDo: 'Cần có họ tên chủ kinh doanh và tên hiệu để dễ lập hợp đồng, hóa đơn.'
        }
      ],
      luuY: [
        'Tiền tố "HKD" dành cho hộ có đăng ký kinh doanh.',
        'Tiền tố "KH" dành cho người tiêu dùng cá nhân thông thường.'
      ]
    }
  ],
  cacLuuYChung: [
    'Viết tiếng Việt có dấu đầy đủ, chuẩn chính tả.',
    'Dùng dấu gạch nối cách đều 2 bên (" - ") để phân tách các thành phần.',
    'Không nhập số điện thoại, ghi chú giao dịch vào ô tên khách hàng (đã có ô riêng).',
    'Tra cứu trước xem khách hàng đã tồn tại trên hệ thống chưa để tránh trùng lặp.'
  ]
};

export const GIAI_PHAP_DU_AN_PHO_BIEN = [
  'Hệ thống Truyền thanh thông minh',
  'Camera giám sát an ninh & Trật tự',
  'Hệ thống Hội nghị truyền hình trực tuyến',
  'Phần mềm Quản lý văn bản & Điều hành',
  'Phần mềm Số hóa & Quản lý dữ liệu',
  'Hệ thống Một cửa điện tử & Dịch vụ công',
  'Hạ tầng mạng LAN, Wifi & Máy chủ',
  'Cung cấp trang thiết bị CNTT văn phòng',
  'Bảo dưỡng & Nâng cấp hệ thống CNTT',
  'Màn hình tương tác & Phòng học thông minh',
  'Hệ thống Quản lý Đô thị thông minh (IOC)'
];

export const QUY_CHUAN_DU_AN: {
  congThucTongQuat: string;
  thanhPhan: { ten: string; viDu: string; batBuoc: boolean }[];
  viDu: ViDuSoSanh[];
  giaiPhapPhoBien: string[];
  luuY: string[];
} = {
  congThucTongQuat: '[Hạng mục / Giải pháp] - [Tên Khách hàng / Đơn vị] - [Năm thực hiện]',
  thanhPhan: [
    {
      ten: 'Hạng mục / Giải pháp',
      viDu: 'Hệ thống Truyền thanh thông minh, Nâng cấp Camera giám sát an ninh, Cung cấp thiết bị CNTT...',
      batBuoc: true
    },
    {
      ten: 'Tên Khách hàng / Đơn vị thụ hưởng',
      viDu: 'UBND Xã Đắk R\'Moan, Công an Huyện Cư Jút, Trường THPT Chu Văn An...',
      batBuoc: true
    },
    {
      ten: 'Năm thực hiện',
      viDu: '2026',
      batBuoc: false
    }
  ],
  giaiPhapPhoBien: GIAI_PHAP_DU_AN_PHO_BIEN,
  viDu: [
    {
      dung: 'Hệ thống Truyền thanh thông minh - UBND Xã Đắk R\'Moan - 2026',
      sai: 'Truyền thanh Đắk R\'Moan, DA Truyền thanh xã, Dự án mới',
      lyDo: 'Nêu rõ tên giải pháp, đơn vị thụ hưởng và năm triển khai giúp tìm kiếm và lập báo cáo nhanh chóng.'
    },
    {
      dung: 'Nâng cấp Camera giám sát an ninh - Công an Huyện Cư Jút - 2026',
      sai: 'Camera Cư Jút, Gói thầu số 02, Lắp camera an ninh',
      lyDo: 'Rõ ràng phạm vi công việc (Nâng cấp) và khách hàng thụ hưởng chính thức.'
    },
    {
      dung: 'Phần mềm Quản lý văn bản & Điều hành - Huyện ủy Krông Nô - 2026',
      sai: 'Phần mềm văn phòng, Triển khai CNTT Krông Nô',
      lyDo: 'Tránh dùng cụm từ quá chung chung "Triển khai CNTT" hay "Dự án phần mềm".'
    }
  ],
  luuY: [
    'Tên dự án phải phản ánh đúng nội dung hợp đồng / dự toán / gói thầu.',
    'Luôn gắn kèm tên đơn vị khách hàng để khi xem trên Dashboard, Lịch biểu, Báo cáo không bị nhầm lẫn giữa các đơn vị.',
    'Nên có năm thực hiện ở cuối để phân biệt với các gói thầu/giai đoạn bảo trì năm trước hoặc năm sau.',
    'Tránh các tên vô nghĩa như: "Dự án mới", "Gói 1", "Bổ sung thiết bị", "Hợp đồng 2026".'
  ]
};

/**
 * Sinh gợi ý tên dự án tự động từ giải pháp, tên khách hàng và năm
 */
export function sinhTenDuAnGoiY(giaiPhap: string, tenKhachHang?: string | null, nam: number = new Date().getFullYear()): string {
  const namStr = nam.toString();
  if (!tenKhachHang || !tenKhachHang.trim()) {
    return `${giaiPhap} - [Khách hàng] - ${namStr}`;
  }
  // Loại bỏ các tiền tố dài dòng nếu có để tên dự án gọn gàng
  const khSach = tenKhachHang.trim();
  return `${giaiPhap} - ${khSach} - ${namStr}`;
}
