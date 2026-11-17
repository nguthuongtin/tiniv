'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <Bo_Cuc_Trang khoang_cach_trong="space-y-4">
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
