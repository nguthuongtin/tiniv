const fs = require('fs');
const path = require('path');
const file = path.join('src', 'app', '(he_thong)', 'ho-so-du-an', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const statStartIndex = lines.findIndex(l => l.includes('sm:hidden bg-gradient-to-br'));
const statEndIndex = lines.findIndex(l => l.includes('<BoLocHoSoDuAn'));

const listStartIndex = lines.findIndex(l => l.includes('hidden sm:block overflow-x-auto'));
const listEndIndex = lines.findIndex(l => l.includes('tongSoTrang > 1 && ('));

if (statStartIndex === -1 || statEndIndex === -1 || listStartIndex === -1 || listEndIndex === -1) {
  console.log('Not found:', statStartIndex, statEndIndex, listStartIndex, listEndIndex);
  process.exit(1);
}

const FLAGSHIP_STATS = `      {/* Flagship Dashboard Bento Hub - Thống nhất cho cả Mobile & Desktop */}
      <section className="bento-flagship squircle-card p-5 sm:p-6 text-white shadow-squircle relative overflow-hidden mb-2">
        <div className="absolute -right-6 -top-6 w-40 h-40 bg-emerald-400/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-start justify-between relative z-10 gap-2">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">TỔNG QUAN HỆ THỐNG</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/25"></span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs font-semibold text-emerald-100/80">Dự án:</span>
              <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm font-sans">{thongKe.tongSo}</span>
              <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 hidden sm:inline-block">Hoạt động</span>
            </div>
          </div>
          
          <div className="glass-inner-pill px-3 py-2 rounded-2xl flex items-center gap-2.5 shadow-sm shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center shadow-md shadow-amber-400/30 shrink-0 font-bold">
              <Wallet className="size-4 sm:size-5 text-emerald-950 stroke-[2.4]" />
            </div>
            <div>
              <p className="text-[9px] text-emerald-200/90 font-bold uppercase tracking-wider leading-none">TỔNG GIÁ TRỊ</p>
              <p className="text-[13px] sm:text-[15px] font-black text-amber-300 tracking-tight mt-1 leading-none drop-shadow">
                {laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(thongKe.tongGiaTri)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-4 sm:mt-6 relative z-10">
          <div className="glass-inner-pill-active rounded-2xl py-2 px-1 sm:py-3 text-center transition-transform hover:scale-95 cursor-default">
            <div className="text-[19px] sm:text-[22px] font-black text-emerald-300 leading-none drop-shadow-sm">{thongKe.soDangThucHien}</div>
            <div className="text-[10px] sm:text-[12px] font-bold text-emerald-100 tracking-tight mt-1 truncate">Đang chạy</div>
            <div className="w-6 h-0.5 bg-emerald-400/70 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-slate-200 leading-none">{thongKe.soHoanThanh}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-slate-300/80 tracking-tight mt-1 truncate">Hoàn tất</div>
            <div className="w-4 h-0.5 bg-white/20 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-amber-200/90 leading-none">{thongKe.soTamDung}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-amber-200/70 tracking-tight mt-1 truncate">Tạm dừng</div>
            <div className="w-4 h-0.5 bg-amber-400/20 rounded-full mx-auto mt-1.5"></div>
          </div>
          <div className="glass-inner-pill rounded-2xl py-2 px-1 sm:py-3 text-center hover:bg-white/10 transition-all cursor-default">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-rose-200/80 leading-none">{thongKe.soDaHuy}</div>
            <div className="text-[10px] sm:text-[12px] font-semibold text-rose-200/60 tracking-tight mt-1 truncate">Đã hủy</div>
            <div className="w-4 h-0.5 bg-rose-400/20 rounded-full mx-auto mt-1.5"></div>
          </div>
        </div>
      </section>`;

const FLAGSHIP_GRID = `          {/* Flagship Apple Squircle Glass Project Cards Unified Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4 p-3.5 sm:p-5 bg-slate-50/50">
            {danhSachTrangHienTai.map((hda, index) => {
              const kh = hda.khach_hang_id ? dsKhachHang.find((k) => k.id === hda.khach_hang_id) ?? null : null;
              const idLead = hda.nguoi_phu_trach_id || hda.nguoi_quan_ly_id;
              const nguoiLead = idLead ? dsNhanSu.find((n) => n.id === idLead) ?? null : null;
              const gd = tenGiaiDoan[hda.giai_doan] ?? { nhan: String(hda.giai_doan) };
              const stt = (trangHienTai - 1) * SO_BAN_GHI_MOI_TRANG + index + 1;
              const duocChon = dsDuAnDaChonIds.has(hda.id);
              const giaTri = laBackOffice ? '***' : DINH_DANG_TIEN_NGAN_GON(hda.gia_tri_du_kien || hda.gia_tri_hop_dong);
              
              const gdColors: Record<string, { badge: string; dotBg: string; barWidth: string }> = {
                moi_tao: { badge: 'bg-violet-50 text-violet-700 border-violet-200/80', dotBg: 'bg-violet-600', barWidth: '15%' },
                tiep_can: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dotBg: 'bg-indigo-600', barWidth: '25%' },
                khao_sat: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-300/80', dotBg: 'bg-emerald-500', barWidth: '35%' },
                len_giai_phap: { badge: 'bg-sky-50 text-sky-700 border-sky-200/80', dotBg: 'bg-sky-500', barWidth: '50%' },
                bao_gia: { badge: 'bg-amber-50 text-amber-700 border-amber-200/80', dotBg: 'bg-amber-500', barWidth: '65%' },
                dam_phan: { badge: 'bg-orange-50 text-orange-700 border-orange-200/80', dotBg: 'bg-orange-500', barWidth: '80%' },
                ky_hop_dong: { badge: 'bg-teal-50 text-teal-700 border-teal-200/80', dotBg: 'bg-teal-500', barWidth: '90%' },
                trien_khai: { badge: 'bg-blue-50 text-blue-700 border-blue-200/80', dotBg: 'bg-blue-600', barWidth: '95%' },
                nghiem_thu: { badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80', dotBg: 'bg-fuchsia-600', barWidth: '98%' },
                hoan_thanh: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-300/80', dotBg: 'bg-emerald-500', barWidth: '100%' },
                tam_dung: { badge: 'bg-slate-50 text-slate-700 border-slate-200/80', dotBg: 'bg-slate-500', barWidth: '50%' },
                huy: { badge: 'bg-rose-50 text-rose-700 border-rose-200/80', dotBg: 'bg-rose-500', barWidth: '10%' },
              };
              const styleColor = hda.trang_thai === 'da_xoa' ? { badge: 'bg-rose-50 text-rose-700 border-rose-200/80', dotBg: 'bg-rose-500', barWidth: '0%' } : (gdColors[hda.giai_doan] || { badge: 'bg-slate-100 text-slate-600 border-slate-200/80', dotBg: 'bg-slate-400', barWidth: '0%' });

              return (
                <article
                  key={hda.id}
                  className={cn(
                    "glass-card-item p-4 sm:p-5 hover:shadow-card-hover transition-all duration-200 relative group flex flex-col",
                    hda.trang_thai === 'da_xoa' && 'opacity-60 bg-slate-50/50 grayscale-[30%]',
                    duocChon && 'border-emerald-500/80 ring-1 ring-emerald-500/20 bg-emerald-50/10 shadow-emerald-500/10'
                  )}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <label className="pt-0.5 cursor-pointer flex items-center">
                      <input type="checkbox" checked={duocChon} onChange={() => toggleChonDuAn(hda.id)} className="custom-check" />
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/60 leading-none">
                          #{stt < 10 ? \`0\${stt}\` : stt}
                        </span>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-xs", styleColor.badge)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", styleColor.dotBg, hda.giai_doan === 'moi_tao' && 'animate-pulse')}></span>
                          {hda.trang_thai === 'da_xoa' ? 'Đã xóa' : gd.nhan}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-400 font-semibold truncate max-w-[80px]">
                          {hda.ngay_tao ? formatNgay(hda.ngay_tao.slice(0, 10)) : 'Hôm nay'}
                        </span>
                      </div>
                      
                      <Link href={\`/ho-so-du-an/\${hda.id}\`}>
                        <h3 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-snug tracking-tight uppercase line-clamp-2 mt-1 hover:text-emerald-700 transition-colors">
                          {hda.ten_du_an}
                        </h3>
                      </Link>
                      
                      {kh && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                          <Building2 className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{kh.ten_khach_hang}</span>
                        </div>
                      )}
                      
                      <div className="mt-3.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", styleColor.dotBg)} style={{ width: styleColor.barWidth }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 flex items-center gap-1 p-1">
                    <Link href={\`/ho-so-du-an/\${hda.id}\`} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition" title="Xem"><Eye className="size-3.5" /></Link>
                    <button type="button" onClick={() => moSua(hda)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition" title="Sửa"><Pencil className="size-3.5" /></button>
                    {hda.trang_thai === 'da_xoa' && coQuyenKhoiPhuc ? (
                      <button type="button" onClick={() => xuLyKhoiPhuc(hda)} disabled={dangXuLyKhac === hda.id} className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50" title="Khôi phục"><RotateCcw className="size-3.5" /></button>
                    ) : coQuyenXoa ? (
                      <button type="button" onClick={() => xuLyXoa(hda)} disabled={dangXuLyKhac === hda.id} className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-50" title="Xóa"><Trash2 className="size-3.5" /></button>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between text-xs">
                    <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-300/80 font-black tracking-tight text-[11px] shadow-xs truncate max-w-[130px]">
                      {giaTri}
                    </div>
                    {nguoiLead ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-bold text-slate-700 truncate max-w-[80px]">
                          {nguoiLead.ho_va_ten.split(' ').pop()}
                        </span>
                        <div className="size-6 sm:size-7 rounded-full bg-gradient-to-tr from-brand-500 to-teal-400 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-black shadow-xs ring-2 ring-white">
                          {nguoiLead.ho_va_ten.split(' ').pop()?.[0]?.toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Chưa gán</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>`;

const beforeStat = lines.slice(0, statStartIndex - 1);
const afterStat = lines.slice(statEndIndex);
const newLines1 = beforeStat.concat([FLAGSHIP_STATS]).concat(afterStat);

const listStart = newLines1.findIndex(l => l.includes('hidden sm:block overflow-x-auto'));
const listEnd = newLines1.findIndex(l => l.includes('tongSoTrang > 1 && ('));

const beforeList = newLines1.slice(0, listStart - 1);
const afterList = newLines1.slice(listEnd - 2);
const finalLines = beforeList.concat([FLAGSHIP_GRID]).concat(afterList);

fs.writeFileSync(file, finalLines.join('\n'));
console.log('Success');
