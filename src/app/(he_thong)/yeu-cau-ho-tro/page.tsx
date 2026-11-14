'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { Bo_Cuc_Trang } from '../../../thanh_phan/ui';
import HopYeuCauPhoiHop from '../../../thanh_phan/ke_hoach/hop_yeu_cau_phoi_hop';
import ModalTaoYeuCauPhoiHop from '../../../thanh_phan/ke_hoach/modal_tao_yeu_cau_phoi_hop';
import {
  danhSachYeuCauPhoiHop,
  langNgheYeuCauPhoiHop,
  type YeuCauPhoiHop
} from '../../../dich_vu/yeu_cau_phoi_hop/dich_vu_yeu_cau_phoi_hop';
import { danhSachHoSoDuAn } from '../../../dich_vu/ho_so_du_an/dich_vu_ho_so_du_an';
import type { HoSoDuAn } from '../../../thu_vien/types/du_an';
import { useStoreXacThuc } from '../../../thu_vien/zustand/store_xac_thuc';

export default function TrangYeuCauHoTro() {
  const router = useRouter();
  const { nguoiDungHienTai } = useStoreXacThuc();

  const [danhSachYeuCau, setDanhSachYeuCau] = useState<YeuCauPhoiHop[]>([]);
  const [danhSachDuAn, setDanhSachDuAn] = useState<HoSoDuAn[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [moModalTaoYeuCau, setMoModalTaoYeuCau] = useState(false);
  const [duAnChoYeuCau, setDuAnChoYeuCau] = useState<HoSoDuAn | null>(null);

  useEffect(() => {
    let daHuy = false;
    const taiDuLieu = async () => {
      try {
        const [dsYC, dsDA] = await Promise.all([
          danhSachYeuCauPhoiHop(),
          danhSachHoSoDuAn()
        ]);
        if (!daHuy) {
          setDanhSachYeuCau(dsYC);
          const mangDA = Array.isArray(dsDA) ? dsDA : (dsDA as any)?.mang || [];
          setDanhSachDuAn(mangDA);
          setDangTai(false);
        }
      } catch (err) {
        console.error('Lỗi tải yêu cầu hỗ trợ:', err);
        if (!daHuy) setDangTai(false);
      }
    };
    void taiDuLieu();

    const unsub = langNgheYeuCauPhoiHop((ds) => {
      if (!daHuy) setDanhSachYeuCau(ds);
    });

    return () => {
      daHuy = true;
      unsub();
    };
  }, []);

  const soYeuCauCanXuLy = danhSachYeuCau.filter((yc) => yc.trang_thai !== 'da_hoan_thanh').length;

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4">
      {/* THANH ĐIỀU HƯỚNG VÀ TÁC VỤ */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/lich-cong-tac"
            className="h-8.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Về Lịch làm việc</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Hộp Yêu Cầu Phối Hợp &amp; Hỗ Trợ Phòng Ban
                </h1>
                {soYeuCauCanXuLy > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10.5px] font-black">
                    {soYeuCauCanXuLy} đang chạy
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-slate-400 font-medium">
                Phối hợp liên phòng ban: Sales, Trưởng phòng Kinh doanh, KHTH, Khảo sát &amp; Kỹ thuật
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setDuAnChoYeuCau(null);
            setMoModalTaoYeuCau(true);
          }}
          className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition active:scale-95"
        >
          <Plus className="size-4" />
          <span>+ Gửi yêu cầu hỗ trợ</span>
        </button>
      </div>

      {/* NỘI DUNG HỘP YÊU CẦU */}
      <div className="min-w-0">
        <HopYeuCauPhoiHop
          danhSachYeuCau={danhSachYeuCau}
          nguoiDungHienTai={nguoiDungHienTai}
          onXoaYeuCau={(ycId) => setDanhSachYeuCau((prev) => prev.filter((x) => x.id !== ycId))}
          onCapNhatYeuCau={(ycCapNhat) =>
            setDanhSachYeuCau((prev) =>
              prev.map((x) => (x.id === ycCapNhat.id ? ycCapNhat : x))
            )
          }
          onMoModalTaoYeuCau={() => {
            setDuAnChoYeuCau(null);
            setMoModalTaoYeuCau(true);
          }}
          onMoChiTietDuAn={(daId) => router.push(`/ho-so-du-an/${daId}`)}
        />
      </div>

      {/* MODAL TẠO YÊU CẦU */}
      <ModalTaoYeuCauPhoiHop
        mo={moModalTaoYeuCau}
        onDong={() => setMoModalTaoYeuCau(false)}
        duAnMacDinh={duAnChoYeuCau}
        danhSachDuAn={danhSachDuAn}
        nguoiDungHienTai={nguoiDungHienTai}
        onTaoThanhCong={(ycMoi) => {
          setDanhSachYeuCau((prev) => [ycMoi, ...prev.filter((x) => x.id !== ycMoi.id)]);
        }}
      />
    </Bo_Cuc_Trang>
  );
}
