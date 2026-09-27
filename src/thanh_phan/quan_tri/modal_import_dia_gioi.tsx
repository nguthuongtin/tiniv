'use client';

import { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  MapPin,
  Building2,
  RefreshCw
} from 'lucide-react';
import {
  docFileExcelDiaGioi,
  xuatFileMauExcelDiaGioi,
  type HangDiaGioiExcel
} from '../../dich_vu/dia_gioi_hanh_chinh/dich_vu_excel_dia_gioi';
import {
  nhapHangLoatDiaGioiHanhChinh,
  type KetQuaImportDiaGioi
} from '../../dich_vu/dia_gioi_hanh_chinh/dich_vu_dia_gioi_hanh_chinh';

interface Props {
  mo: boolean;
  onDong: () => void;
  onImportThanhCong: () => Promise<void>;
}

export default function ModalImportDiaGioi({ mo, onDong, onImportThanhCong }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dangDocFile, setDangDocFile] = useState(false);
  const [loiDocFile, setLoiDocFile] = useState<string | null>(null);
  const [duLieuDocDuoc, setDuLieuDocDuoc] = useState<HangDiaGioiExcel[]>([]);

  const [dangImport, setDangImport] = useState(false);
  const [tienDo, setTienDo] = useState({ daXuLy: 0, tongSo: 0 });
  const [ketQua, setKetQua] = useState<KetQuaImportDiaGioi | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!mo) return null;

  const resetForm = () => {
    setFile(null);
    setDangDocFile(false);
    setLoiDocFile(null);
    setDuLieuDocDuoc([]);
    setDangImport(false);
    setTienDo({ daXuLy: 0, tongSo: 0 });
    setKetQua(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (dangImport) return; // Không cho đóng khi đang ghi dữ liệu
    resetForm();
    onDong();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const f = files[0];
    await xuLyFile(f);
  };

  const xuLyFile = async (f: File) => {
    setFile(f);
    setLoiDocFile(null);
    setDuLieuDocDuoc([]);
    setKetQua(null);
    setDangDocFile(true);

    try {
      const data = await docFileExcelDiaGioi(f);
      if (data.length === 0) {
        setLoiDocFile('File không có dữ liệu hợp lệ hoặc các dòng trống.');
      } else {
        setDuLieuDocDuoc(data);
      }
    } catch (err: any) {
      console.error('Lỗi đọc file:', err);
      setLoiDocFile(err?.message || 'Không thể đọc file. Vui lòng kiểm tra lại định dạng file Excel.');
    } finally {
      setDangDocFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (dangImport || dangDocFile) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await xuLyFile(files[0]);
    }
  };

  // Thống kê sơ bộ từ dữ liệu đã đọc
  const thongKe = (() => {
    if (duLieuDocDuoc.length === 0) return null;
    const setTinh = new Set<string>();
    let demXa = 0;
    let demPhuong = 0;
    let demThiTran = 0;
    let demDacKhu = 0;

    duLieuDocDuoc.forEach((x) => {
      setTinh.add(x.tinh_thanh);
      if (x.loai === 'xa') demXa++;
      else if (x.loai === 'phuong') demPhuong++;
      else if (x.loai === 'thi_trai') demThiTran++;
      else if (x.loai === 'dac_khu') demDacKhu++;
    });

    return {
      tong: duLieuDocDuoc.length,
      soTinh: setTinh.size,
      demXa,
      demPhuong,
      demThiTran,
      demDacKhu
    };
  })();

  const handleStartImport = async () => {
    if (duLieuDocDuoc.length === 0) return;
    setDangImport(true);
    setTienDo({ daXuLy: 0, tongSo: duLieuDocDuoc.length });

    try {
      const res = await nhapHangLoatDiaGioiHanhChinh(duLieuDocDuoc, (daXuLy, tongSo) => {
        setTienDo({ daXuLy, tongSo });
      });
      setKetQua(res);
      await onImportThanhCong();
    } catch (err: any) {
      console.error('Lỗi khi import:', err);
      setLoiDocFile('Đã xảy ra lỗi khi lưu vào cơ sở dữ liệu: ' + (err?.message || 'Lỗi không xác định'));
    } finally {
      setDangImport(false);
    }
  };

  const phanTramTienDo =
    tienDo.tongSo > 0 ? Math.min(100, Math.round((tienDo.daXuLy / tienDo.tongSo) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Import Địa giới hành chính</h3>
              <p className="text-xs text-muted-foreground">
                Nhập danh sách xã, phường, đặc khu từ file Excel (.xlsx) hoặc CSV
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={dangImport}
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Step: Đã Import Xong */}
          {ketQua ? (
            <div className="py-8 text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-xs animate-in zoom-in-75 duration-200">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Import hoàn tất thành công!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Dữ liệu địa giới hành chính đã được lưu an toàn vào cơ sở dữ liệu.
                </p>
              </div>

              <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-left bg-muted/40 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Đã lưu vào hệ thống:</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {ketQua.thanhCong.toLocaleString('vi-VN')} đơn vị
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tổng số dòng trong file:</span>
                  <span className="text-sm font-bold text-foreground">
                    {ketQua.tongSoFile.toLocaleString('vi-VN')} dòng
                  </span>
                </div>
                {ketQua.boQua > 0 && (
                  <div className="col-span-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                    💡 Đã tự động lọc và gom {ketQua.boQua.toLocaleString('vi-VN')} dòng trùng lặp trong file.
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Xong & Đóng
                </button>
              </div>
            </div>
          ) : dangImport ? (
            /* Step: Đang thực hiện Import */
            <div className="py-10 space-y-5 text-center">
              <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <RefreshCw className="size-7 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Đang import dữ liệu vào hệ thống...</h4>
                <p className="text-xs text-muted-foreground">
                  Đang ghi dữ liệu theo từng khối batch 400 dòng để đảm bảo tốc độ cao nhất.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Tiến trình</span>
                  <span className="text-primary font-bold">{phanTramTienDo}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${phanTramTienDo}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground text-right">
                  Đã ghi <strong>{tienDo.daXuLy.toLocaleString('vi-VN')}</strong> /{' '}
                  {tienDo.tongSo.toLocaleString('vi-VN')} đơn vị
                </div>
              </div>
            </div>
          ) : (
            /* Step: Chọn file & Preview */
            <>
              {/* Vùng tải file */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  {dangDocFile ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Upload className="size-5" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">
                    {file ? file.name : 'Bấm vào đây để chọn file Excel / CSV hoặc kéo thả file'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Hỗ trợ file định dạng <strong>.xlsx</strong> hoặc <strong>.csv</strong> (hơn 3.000 dòng vẫn xử lý cực nhanh)
                  </p>
                </div>
              </div>

              {/* Thông báo lỗi đọc file nếu có */}
              {loiDocFile && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="text-xs font-medium">{loiDocFile}</span>
                </div>
              )}

              {/* Thống kê dữ liệu đã phân tích */}
              {thongKe && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        Tổng đơn vị
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {thongKe.tong.toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        Tỉnh / Thành phố
                      </span>
                      <span className="text-base font-extrabold text-primary">
                        {thongKe.soTinh} tỉnh
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        Phường & Thị trấn
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {(thongKe.demPhuong + thongKe.demThiTran).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-0.5">
                        Xã & Đặc khu
                      </span>
                      <span className="text-base font-extrabold text-foreground">
                        {(thongKe.demXa + thongKe.demDacKhu).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  {/* Bảng xem trước dữ liệu */}
                  <div className="border border-border rounded-xl overflow-hidden bg-background">
                    <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-muted-foreground">
                        Xem trước mẫu 6 dòng đầu tiên ({duLieuDocDuoc.length.toLocaleString('vi-VN')} dòng hợp lệ):
                      </span>
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-muted/20 text-muted-foreground font-semibold text-[11px]">
                            <th className="p-2 w-10 text-center">STT</th>
                            <th className="p-2">Tên (Xã / Phường / Đặc khu)</th>
                            <th className="p-2">Tỉnh / Thành phố</th>
                            <th className="p-2 w-24 text-center">Tự động phân loại</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {duLieuDocDuoc.slice(0, 6).map((r, i) => (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="p-2 text-center text-muted-foreground font-medium">{i + 1}</td>
                              <td className="p-2 font-semibold text-foreground">{r.xa_phuong}</td>
                              <td className="p-2 text-foreground">{r.tinh_thanh}</td>
                              <td className="p-2 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                                  {r.loai}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Hướng dẫn cấu trúc & Nút tải mẫu */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[11px] text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>
                    Cấu trúc file chuẩn: <strong>Cột 1: Tên</strong> (VD: Phường Ba Đình),{' '}
                    <strong>Cột 2: Tỉnh / Thành Phố</strong> (VD: Thành phố Hà Nội).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => xuatFileMauExcelDiaGioi()}
                  className="px-2.5 py-1 rounded-lg border border-blue-500/30 hover:bg-blue-500/10 font-bold inline-flex items-center gap-1.5 shrink-0 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span>Tải file mẫu</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!ketQua && (
          <div className="px-5 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={dangImport}
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={dangImport || dangDocFile || duLieuDocDuoc.length === 0}
              onClick={handleStartImport}
              className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
            >
              {dangImport ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang Import ({phanTramTienDo}%)...</span>
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  <span>
                    Bắt đầu Import {duLieuDocDuoc.length > 0 ? `(${duLieuDocDuoc.length.toLocaleString('vi-VN')} dòng)` : ''}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
