"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Map3D, { CommuneCRMData, rutGonTen, DANH_SACH_XA_TRUNG_TEN } from '@/thanh_phan/Map3D';
import {
  danhSachKhachHang,
  capNhatKhachHang,
  taoKhachHangMoi,
  xoaCacheKhachHang,
} from '@/dich_vu/khach_hang/dich_vu_khach_hang';
import { danhSachNhanSu } from '@/dich_vu/nhan_su/dich_vu_nhan_su';
import { danhSachPhongBan } from '@/dich_vu/co_cau_to_chuc/dich_vu_phong_ban';
import { danhSachHoSoDuAn } from '@/dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import { danhSachNguoiLienHe } from '@/dich_vu/nguoi_lien_he/dich_vu_nguoi_lien_he';
import useStoreXacThuc from '@/thu_vien/zustand/store_xac_thuc';
import { Map as MapIcon } from 'lucide-react';

// Chuẩn hóa tên xã để khớp hoàn hảo giữa CRM, Excel và GeoJSON
function chuanHoaTen(str: string): string {
  if (!str) return '';
  let s = str.trim();
  s = s.replace(/-\s*TỈNH\s+[A-ZÀ-Ỹa-zà-ỹ\s]+/gi, '');
  s = s.replace(/-\s*TP\s+[A-ZÀ-Ỹa-zà-ỹ\s]+/gi, '');
  s = s.replace(/UBND\s+/gi, '');
  s = s.replace(/UBD\s+/gi, '');
  s = s.replace(/(Xã|Phường|Thị trấn)\s+/gi, '');
  return s.trim().toLowerCase();
}

// Trích xuất Tỉnh từ thông tin khách hàng một cách thông minh
function trichXuatTinh(kh: any): string {
  if (kh.tinh_thanh && kh.tinh_thanh.trim()) {
    const t = kh.tinh_thanh.trim().toLowerCase();
    if (t.includes('an giang')) return 'an giang';
    if (t.includes('cần thơ')) return 'cần thơ';
    if (t.includes('đồng tháp')) return 'đồng tháp';
    if (t.includes('vĩnh long')) return 'vĩnh long';
    if (t.includes('cà mau')) return 'cà mau';
    return t;
  }
  // Tìm trong tên đơn vị, địa chỉ hoặc ghi chú nếu có
  const text = `${kh.ten_khach_hang || ''} ${kh.dia_chi || ''} ${kh.ghi_chu || ''}`.toLowerCase();
  if (text.includes('an giang')) return 'an giang';
  if (text.includes('cần thơ')) return 'cần thơ';
  if (text.includes('đồng tháp')) return 'đồng tháp';
  if (text.includes('vĩnh long')) return 'vĩnh long';
  if (text.includes('cà mau')) return 'cà mau';
  return '';
}

export default function MapDashboardPage() {
  const [crmData, setCrmData] = useState<CommuneCRMData[]>([]);
  const [danhSachSale, setDanhSachSale] = useState<
    Array<{ id: string; ho_va_ten: string; ten_rut_gon?: string }>
  >([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const { nguoiDungHienTai } = useStoreXacThuc();

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Tải GeoJSON 495 xã Miền Tây
        const geoRes = await fetch('/mientay.geojson');
        const geojson = await geoRes.json();

        // 2. Tải Khách hàng, Nhân sự, Phòng ban, Dự án, Người liên hệ từ CSDL
        xoaCacheKhachHang();
        const [khRes, nsRes, pbRes, daRes, lhRes] = await Promise.all([
          danhSachKhachHang({ trang_thai: 'tat_ca', loai_khach_hang: 'tat_ca' }),
          danhSachNhanSu({ trang_thai_du_lieu: 'hoat_dong' }),
          danhSachPhongBan(),
          danhSachHoSoDuAn({ trang_thai: 'tat_ca' }),
          danhSachNguoiLienHe(),
        ]);

        const dsKhach = khRes.mang || [];
        const dsNhanSu = nsRes.mang || [];
        const dsPhongBan = pbRes.mang || [];
        const dsDuAn = daRes.mang || [];
        const dsLienHe = lhRes.mang || [];

        // Tìm các phòng ban kinh doanh
        const pbKdIds = new Set(
          dsPhongBan
            .filter((pb) => (pb.ten_phong_ban || '').toLowerCase().includes('kinh doanh'))
            .map((pb) => pb.id)
        );

        // Lọc nhân sự: chỉ lấy NHÂN VIÊN PHÒNG KINH DOANH
        // Loại trừ Giám đốc, Trưởng phòng, Quản trị hệ thống (theo chuẩn quản trị)
        let salesKd = dsNhanSu.filter((ns) => {
          const thuocPbKd = ns.phong_ban_id && pbKdIds.has(ns.phong_ban_id);
          const laVaiTroKd = ns.vai_tro === 'nhan_vien_kinh_doanh';
          if (!thuocPbKd && !laVaiTroKd) return false;

          if (
            ns.vai_tro === 'truong_phong' ||
            ns.vai_tro === 'giam_doc' ||
            ns.vai_tro === 'quan_tri_he_thong' ||
            (ns.chuc_vu || '').toLowerCase().includes('trưởng phòng') ||
            (ns.chuc_vu || '').toLowerCase().includes('phó phòng')
          ) {
            return false;
          }
          return true;
        });

        // Fallback an toàn nếu chưa cấu hình phòng ban: lấy các bạn sale mặc định hoặc có vai trò kinh doanh
        if (salesKd.length === 0) {
          salesKd = dsNhanSu.filter((ns) => {
            const laKd = ns.vai_tro === 'nhan_vien_kinh_doanh';
            const ten = ns.ho_va_ten || '';
            const thuocTeam = [
              'Huỳnh Hoàng Bá',
              'Huỳnh Thị Thanh Ngân',
              'Lương Thị Cẩm Tú',
              'Nguyễn Văn Cường Em',
            ].some((m) => ten.includes(m) || m.includes(ten));
            return laKd || thuocTeam;
          });
        }

        // Lưu danh sách sale kinh doanh với tên rút gọn
        const sales = salesKd.map((ns) => ({
          id: ns.id,
          ho_va_ten: ns.ho_va_ten,
          ten_rut_gon: rutGonTen(ns.ho_va_ten),
        }));
        setDanhSachSale(sales);

        // Map ID nhân sự sang Họ và tên
        const mapNhanSu: Record<string, string> = {};
        dsNhanSu.forEach((ns) => {
          if (ns.id) mapNhanSu[ns.id] = ns.ho_va_ten;
        });

        // Gom nhóm dự án theo khach_hang_id
        const mapDuAnTheoKH = new Map<string, any[]>();
        dsDuAn.forEach((da) => {
          if (da.khach_hang_id) {
            const list = mapDuAnTheoKH.get(da.khach_hang_id) || [];
            list.push({
              id: da.id,
              ten_du_an: da.ten_du_an,
              giai_doan: da.giai_doan,
              tong_muc_dau_tu: da.gia_tri_hop_dong || da.gia_tri_du_kien || 0,
            });
            mapDuAnTheoKH.set(da.khach_hang_id, list);
          }
        });

        // Gom nhóm người liên hệ theo khach_hang_id
        const mapLienHeTheoKH = new Map<string, any[]>();
        dsLienHe.forEach((lh) => {
          if (lh.khach_hang_id) {
            const list = mapLienHeTheoKH.get(lh.khach_hang_id) || [];
            list.push({
              id: lh.id,
              ho_va_ten: lh.ho_va_ten,
              chuc_vu: lh.chuc_vu,
              so_dien_thoai: lh.so_dien_thoai,
              email: lh.email,
            });
            mapLienHeTheoKH.set(lh.khach_hang_id, list);
          }
        });

        // Map khách hàng theo các cấp độ ưu tiên chống trùng lặp giữa các tỉnh:
        // Cấp 1: Mã ĐVHC (nếu có lưu)
        // Cấp 2: Cặp Tỉnh + Xã: `${tinh}_${xa}`
        // Cấp 3: Xã đơn thuần (CHỈ ÁP DỤNG cho các xã có tên DUY NHẤT, không nằm trong DANH_SACH_XA_TRUNG_TEN)
        const mapKhachTheoMaXa = new Map<string, any>();
        const mapKhachTheoTinhXa = new Map<string, any>();
        const mapKhachTheoXaDuyNhat = new Map<string, any>();

        dsKhach.forEach((kh) => {
          // Trích xuất mã nếu có dạng [Mã: 12345] hoặc [Mã ĐVHC: 12345]
          const matchMa = (kh.ghi_chu || '').match(/Mã(?:\s*ĐVHC)?:\s*(\d{5})/i);
          if (matchMa && matchMa[1]) {
            mapKhachTheoMaXa.set(matchMa[1], kh);
          }

          const keyXa = chuanHoaTen(kh.xa_phuong || kh.ten_khach_hang || '');
          const keyTinh = trichXuatTinh(kh);

          if (keyTinh && keyXa) {
            mapKhachTheoTinhXa.set(`${keyTinh}_${keyXa}`, kh);
          }

          // CHỈ map theo tên xã đơn thuần nếu tên xã này KHÔNG BỊ TRÙNG LẶP trên các tỉnh
          // Điều này triệt tiêu hoàn toàn lỗi gán nhầm Phú Hữu, Châu Thành, An Bình... từ An Giang sang tỉnh khác!
          if (keyXa && !DANH_SACH_XA_TRUNG_TEN.has(keyXa)) {
            if (!mapKhachTheoXaDuyNhat.has(keyXa)) {
              mapKhachTheoXaDuyNhat.set(keyXa, kh);
            }
          }
        });

        // 3. Khớp từng xã trong GeoJSON Miền Tây với khách hàng, dự án và người liên hệ
        const result: CommuneCRMData[] = geojson.features.map((f: any, idx: number) => {
          const props = f.properties || {};
          const maXa = String(props.ma_xa || '').trim();
          const tenXaGoc = (props.ten_xa || '').trim();
          const tenTinhGoc = (props.ten_tinh || '').trim();
          const tenChuanXa = chuanHoaTen(tenXaGoc);
          const tenChuanTinh = tenTinhGoc.toLowerCase();

          // Tìm khách hàng tương ứng theo thứ tự chuẩn xác:
          // 1. Theo mã xã (chính xác 100%)
          // 2. Theo Cặp Tỉnh + Xã
          // 3. Theo Xã (chỉ đối với xã có tên duy nhất không trùng)
          let kh =
            mapKhachTheoMaXa.get(maXa) ||
            mapKhachTheoTinhXa.get(`${tenChuanTinh}_${tenChuanXa}`);

          if (!kh && !DANH_SACH_XA_TRUNG_TEN.has(tenChuanXa)) {
            kh = mapKhachTheoXaDuyNhat.get(tenChuanXa);
          }

          let saleName = 'Chưa gán';
          let saleId: string | undefined = undefined;
          let status: CommuneCRMData['reach_status'] = 'Chưa tiếp cận';
          let notes = '';
          let revenue = 0;
          const loai = props.loai ? props.loai.toUpperCase() : 'XÃ';
          let tenDayDu = `UBND ${loai} ${tenXaGoc.toUpperCase()} - TỈNH ${tenTinhGoc.toUpperCase()}`;
          let khId: string | undefined = undefined;
          let duAnCuaXa: any[] = [];
          let lienHeCuaXa: any[] = [];

          if (kh) {
            khId = kh.id;
            tenDayDu = kh.ten_khach_hang;
            if (kh.nguoi_phu_trach_id && mapNhanSu[kh.nguoi_phu_trach_id]) {
              saleName = mapNhanSu[kh.nguoi_phu_trach_id];
              saleId = kh.nguoi_phu_trach_id;
            }
            notes = kh.ghi_chu || '';

            duAnCuaXa = mapDuAnTheoKH.get(kh.id) || [];
            lienHeCuaXa = mapLienHeTheoKH.get(kh.id) || [];

            if (duAnCuaXa.length > 0) {
              status = 'Đang chăm sóc';
              revenue = duAnCuaXa.reduce(
                (sum, d) => sum + (Number(d.tong_muc_dau_tu) || 0),
                0
              );
            }

            const noteLower = notes.toLowerCase();
            if (noteLower.includes('chốt') || noteLower.includes('ký')) {
              status = 'Đã chốt';
              if (revenue === 0) revenue = 450_000_000 + ((idx * 43) % 400) * 1_000_000;
            } else if (
              noteLower.includes('đã gặp') ||
              noteLower.includes('đang đề xuất') ||
              noteLower.includes('liên hệ')
            ) {
              status = 'Đang chăm sóc';
              if (revenue === 0) revenue = 150_000_000 + ((idx * 27) % 200) * 1_000_000;
            }
          }

          const danSo = Number(props.dan_so) || 0;
          const households = danSo > 0 ? Math.round(danSo / 4) : 2500;
          const area = Number(props.dtich_km2) || 45;

          return {
            id: maXa || tenXaGoc,
            ma_xa: maXa,
            ten_xa: tenXaGoc,
            ten_tinh: tenTinhGoc,
            ma_tinh: String(props.ma_tinh || ''),
            ten_day_du: tenDayDu,
            sale_name: saleName,
            sale_id: saleId,
            revenue: revenue,
            households: households,
            area_km2: area,
            dan_so: danSo,
            reach_status: status,
            notes: notes,
            khach_hang_id: khId,
            danh_sach_du_an: duAnCuaXa,
            danh_sach_nguoi_lien_he: lienHeCuaXa,
          };
        });

        setCrmData(result);
        setIsLoading(false);
      } catch (err) {
        console.error('Lỗi khi nạp dữ liệu bản đồ miền Tây:', err);
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Cập nhật CRM và gán nhân sự phụ trách
  const handleUpdateCRM = async (
    communeId: string,
    newStatus: CommuneCRMData['reach_status'],
    newNotes: string,
    newSaleId?: string,
    newSaleName?: string
  ) => {
    const targetItem = crmData.find((d) => d.id === communeId);
    const resolvedSaleName = newSaleName || (newSaleId ? 'Đã gán' : 'Chưa gán');

    // 1. Cập nhật state UI ngay lập tức
    setCrmData((prev) =>
      prev.map((item) =>
        item.id === communeId
          ? {
              ...item,
              reach_status: newStatus,
              notes: newNotes,
              sale_id: newSaleId || undefined,
              sale_name: newSaleId ? resolvedSaleName : 'Chưa gán',
            }
          : item
      )
    );

    // 2. Lưu vào CSDL Firestore
    try {
      if (targetItem?.khach_hang_id) {
        // Đã có khách hàng -> Cập nhật
        await capNhatKhachHang(
          {
            id: targetItem.khach_hang_id,
            ghi_chu: newNotes,
            nguoi_phu_trach_id: newSaleId || null,
          },
          nguoiDungHienTai ?? null
        );
      } else if (targetItem) {
        // Chưa có trong CSDL khách hàng -> Tự động khởi tạo khách hàng mới
        const tenKh =
          targetItem.ten_day_du ||
          `UBND XÃ ${(targetItem.ten_xa || targetItem.id).toUpperCase()} - TỈNH ${(targetItem.ten_tinh || '').toUpperCase()}`;

        const ghiChuKhoiTao = `[Mã ĐVHC: ${targetItem.ma_xa || targetItem.id}] ${newNotes || 'Khởi tạo từ bản đồ địa bàn'}`;

        const khMoi = await taoKhachHangMoi(
          {
            ten_khach_hang: tenKh,
            loai_khach_hang: 'to_chuc',
            tinh_thanh: targetItem.ten_tinh || null,
            xa_phuong: targetItem.ten_xa || targetItem.id,
            nguoi_phu_trach_id: newSaleId || null,
            ghi_chu: ghiChuKhoiTao,
            trang_thai: 'hoat_dong',
          },
          nguoiDungHienTai ?? null
        );

        // Cập nhật lại khach_hang_id vào state
        if (khMoi?.id) {
          setCrmData((prev) =>
            prev.map((item) =>
              item.id === communeId ? { ...item, khach_hang_id: khMoi.id } : item
            )
          );
        }
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật/khởi tạo khách hàng từ bản đồ:', err);
    }
  };

  // Thống kê theo phạm vi tỉnh được chọn
  const communesInScope = useMemo(() => {
    if (selectedProvince === 'All') return crmData;
    return crmData.filter((c) => c.ten_tinh === selectedProvince);
  }, [crmData, selectedProvince]);

  const countDaChot = communesInScope.filter((d) => d.reach_status === 'Đã chốt').length;
  const countDangChamSoc = communesInScope.filter((d) => d.reach_status === 'Đang chăm sóc').length;
  const countDaGanSale = communesInScope.filter((d) => d.sale_name !== 'Chưa gán').length;
  const tongSoDuAn = communesInScope.reduce((acc, d) => acc + (d.danh_sach_du_an?.length || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100dvh-100px)] sm:h-[calc(100vh-5.5rem)] sm:space-y-3">
      {/* Tiêu đề & Tổng quan chỉ số trên Desktop (Bộ lọc Tỉnh được đưa vào trong bản đồ) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between gap-4 shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MapIcon className="size-6 text-sky-500" />
          <span>Bản Đồ Địa Bàn Miền Tây</span>
        </h1>

        {/* Chỉ số địa bàn theo Tỉnh đang chọn (Đồng bộ trực tiếp với bộ lọc bên trong bản đồ) */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-slate-400 block text-[10px]">
              {selectedProvince === 'All' ? 'Toàn Miền Tây' : selectedProvince}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
              {communesInScope.length} xã/phường
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-slate-400 block text-[10px]">Dự án</span>
            <span className="font-bold text-blue-600 text-xs">{tongSoDuAn} dự án</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-slate-400 block text-[10px]">Đã gán sale</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
              {countDaGanSale}
            </span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-slate-400 block text-[10px]">Đang chăm sóc</span>
            <span className="font-bold text-amber-500 text-xs">{countDangChamSoc}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-slate-400 block text-[10px]">Đã chốt</span>
            <span className="font-bold text-emerald-600 text-xs">{countDaChot}</span>
          </div>
        </div>
      </div>

      {/* Khu vực Bản Đồ với Bộ Lọc Tỉnh & Nút Full Screen tích hợp bên trong */}
      <div className="flex-1 w-full min-h-[450px] relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-sm gap-2">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang nạp dữ liệu địa bàn 5 tỉnh Miền Tây...</span>
          </div>
        ) : (
          <Map3D
            crmData={crmData}
            onUpdateCRM={handleUpdateCRM}
            danhSachSale={danhSachSale}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
          />
        )}
      </div>
    </div>
  );
}
