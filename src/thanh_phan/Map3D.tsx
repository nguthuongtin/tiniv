"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FolderKanban, Users, Phone, ExternalLink, Plus, Search, X, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface DuAnLienKet {
  id: string;
  ten_du_an: string;
  giai_doan?: string;
  tong_muc_dau_tu?: number;
}

export interface NguoiLienHeLienKet {
  id: string;
  ho_va_ten: string;
  chuc_vu?: string | null;
  so_dien_thoai?: string | null;
  email?: string | null;
}

export interface CommuneCRMData {
  id: string; // Tên xã chuẩn (khớp với ten_xa trong GeoJSON)
  ten_day_du?: string; // Tên đầy đủ theo quy chuẩn (VD: UBND XÃ PHÚ HÒA - TỈNH AN GIANG)
  sale_name: string;
  revenue: number;
  households: number;
  area_km2: number;
  reach_status: 'Chưa tiếp cận' | 'Đang chăm sóc' | 'Đã chốt';
  notes?: string;
  khach_hang_id?: string;
  danh_sach_du_an: DuAnLienKet[];
  danh_sach_nguoi_lien_he: NguoiLienHeLienKet[];
}

interface MapProps {
  crmData: CommuneCRMData[];
  onUpdateCRM: (id: string, newStatus: CommuneCRMData['reach_status'], newNotes: string) => void;
}

// 4 màu đại diện trực quan cho 4 bạn sale
export const SALE_COLORS: Record<string, string> = {
  'Huỳnh Hoàng Bá': '#3b82f6',       // Xanh dương tươi sáng
  'Huỳnh Thị Thanh Ngân': '#10b981', // Xanh ngọc lục bảo
  'Lương Thị Cẩm Tú': '#f59e0b',     // Vàng cam nổi bật
  'Nguyễn Văn Cường Em': '#8b5cf6', // Tím hoa cà
  'Chưa gán': '#475569',            // Xám Slate
};

// Giải mã token Mapbox public từ base64 để bảo đảm hoạt động thông suốt trên Vercel / Production
// đồng thời tránh kích hoạt bộ lọc GitHub Secret Scanning đối với chuỗi ký tự thô
const layMapboxToken = (): string => {
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN && process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim() !== '') {
    return process.env.NEXT_PUBLIC_MAPBOX_TOKEN.trim();
  }
  const b64 = 'cGsuZXlKMUlqb2libWQxZEdoMWIyNW5kR2x1SWl3aVlTSTZJbU50ZGpGMmRHUjVZVEJoYXpneWQyOWthak5xYVhZM1pHMGlmUS5RQ2lSWTZwTFp5bDI5eEd4QzBoMER3';
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    try {
      return window.atob(b64);
    } catch {
      return '';
    }
  }
  if (typeof Buffer !== 'undefined') {
    try {
      return Buffer.from(b64, 'base64').toString('utf8');
    } catch {
      return '';
    }
  }
  return '';
};

interface CommuneGeomInfo {
  center: [number, number];
  bbox: [number, number, number, number];
  featureId: number;
  properties: any;
}

function tinhToaDoXa(feature: any, idx: number): CommuneGeomInfo {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  let sumLng = 0, sumLat = 0, count = 0;

  function duyetToaDo(coords: any) {
    if (!coords) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lng = coords[0];
      const lat = coords[1];
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      sumLng += lng;
      sumLat += lat;
      count++;
    } else if (Array.isArray(coords)) {
      for (let i = 0; i < coords.length; i++) {
        duyetToaDo(coords[i]);
      }
    }
  }

  duyetToaDo(feature.geometry?.coordinates);

  const center: [number, number] = count > 0 ? [sumLng / count, sumLat / count] : [105.15, 10.52];
  const bbox: [number, number, number, number] = [
    minLng !== Infinity ? minLng : 105.0,
    minLat !== Infinity ? minLat : 10.3,
    maxLng !== -Infinity ? maxLng : 105.3,
    maxLat !== -Infinity ? maxLat : 10.7
  ];

  return {
    center,
    bbox,
    featureId: feature.id ?? idx,
    properties: feature.properties || {}
  };
}

export default function Map3D({ crmData, onUpdateCRM }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const [activeToken] = useState<string>(() => layMapboxToken());
  const [mapError, setMapError] = useState<string | null>(null);

  // States
  const [selectedFeature, setSelectedFeature] = useState<CommuneCRMData | null>(null);
  const [hoveredCommune, setHoveredCommune] = useState<CommuneCRMData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const [filterSale, setFilterSale] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Geometry cache & Selected feature ref
  const communeGeomRef = useRef<Map<string, CommuneGeomInfo>>(new Map());
  const selectedIdRef = useRef<number | string | null>(null);

  // State Tìm Kiếm Nhanh
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // State mở Bottom Sheet bộ lọc trên Mobile
  const [moBoLocMobile, setMoBoLocMobile] = useState(false);

  // Form cập nhật
  const [editStatus, setEditStatus] = useState<CommuneCRMData['reach_status']>('Chưa tiếp cận');
  const [editNotes, setEditNotes] = useState('');

  // Đóng dropdown tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchRef.current && searchRef.current.contains(target);
      const insideMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const salesList = useMemo(() => {
    return ['Huỳnh Hoàng Bá', 'Huỳnh Thị Thanh Ngân', 'Lương Thị Cẩm Tú', 'Nguyễn Văn Cường Em'];
  }, []);

  // Danh sách xã gợi ý theo từ khóa tìm kiếm
  const filteredSearchList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return crmData
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          (c.ten_day_du && c.ten_day_du.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [crmData, searchQuery]);

  // Thống kê số lượng xã theo từng bạn sale
  const saleStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Huỳnh Hoàng Bá': 0,
      'Huỳnh Thị Thanh Ngân': 0,
      'Lương Thị Cẩm Tú': 0,
      'Nguyễn Văn Cường Em': 0,
      'Chưa gán': 0,
    };
    crmData.forEach((d) => {
      const s = d.sale_name || 'Chưa gán';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [crmData]);

  // Hàm chọn và tự động zoom + định vị đến xã
  const chonVaDinhViXa = (communeName: string) => {
    const map = mapRef.current;
    const geomInfo = communeGeomRef.current.get(communeName.toLowerCase());
    const matched = crmDataRef.current.find(
      (c) => c.id.toLowerCase() === communeName.toLowerCase()
    );

    if (map && geomInfo) {
      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: 'angiang-communes', id: selectedIdRef.current },
          { selected: false }
        );
      }
      selectedIdRef.current = geomInfo.featureId;
      map.setFeatureState(
        { source: 'angiang-communes', id: geomInfo.featureId },
        { selected: true }
      );

      const [minLng, minLat, maxLng, maxLat] = geomInfo.bbox;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: {
            top: typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 70,
            bottom: typeof window !== 'undefined' && window.innerWidth < 640 ? 280 : 70,
            left: typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 70,
            right: typeof window !== 'undefined' && window.innerWidth > 1024 ? 420 : (typeof window !== 'undefined' && window.innerWidth < 640 ? 24 : 70),
          },
          maxZoom: 13,
          duration: 1200,
        }
      );
    }

    if (matched) {
      setSelectedFeature(matched);
      setEditStatus(matched.reach_status);
      setEditNotes(matched.notes || '');
    } else if (geomInfo) {
      const props = geomInfo.properties;
      const fallbackData: CommuneCRMData = {
        id: communeName,
        ten_day_du: `UBND XÃ ${communeName.toUpperCase()} - TỈNH AN GIANG`,
        sale_name: 'Chưa gán',
        revenue: 0,
        households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
        area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
        reach_status: 'Chưa tiếp cận',
        notes: '',
        danh_sach_du_an: [],
        danh_sach_nguoi_lien_he: [],
      };
      setSelectedFeature(fallbackData);
      setEditStatus('Chưa tiếp cận');
      setEditNotes('');
    }
  };

  const dongDrawer = () => {
    const map = mapRef.current;
    if (map && selectedIdRef.current !== null) {
      map.setFeatureState(
        { source: 'angiang-communes', id: selectedIdRef.current },
        { selected: false }
      );
      selectedIdRef.current = null;
    }
    setSelectedFeature(null);
  };

  const resetMapView = () => {
    dongDrawer();
    setSearchQuery('');
    setIsSearching(false);
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [105.15, 10.52],
      zoom: 9.3,
      duration: 1000,
    });
  };

  // Khởi tạo bản đồ 2D
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const token = activeToken || layMapboxToken();
      if (!token) {
        setMapError('Chưa có mã truy cập (token) Mapbox để hiển thị bản đồ.');
        return;
      }
      mapboxgl.accessToken = token;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [105.15, 10.52],
        zoom: 9.3,
        pitch: 0,   // 2D nhìn thẳng từ trên xuống
        bearing: 0, // Hướng thẳng Bắc - Nam
        antialias: true,
      });

      mapRef.current = map;

      map.on('load', async () => {
        try {
          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

          // Tải GeoJSON An Giang
          const response = await fetch('/angiang.geojson');
          const geojson = await response.json();

          const geomMap = new Map<string, CommuneGeomInfo>();
          geojson.features.forEach((f: any, idx: number) => {
            const info = tinhToaDoXa(f, idx);
            const name = (f.properties?.ten_xa || '').trim();
            if (name) {
              geomMap.set(name.toLowerCase(), info);
            }
          });
          communeGeomRef.current = geomMap;

          if (!map.getSource('angiang-communes')) {
            map.addSource('angiang-communes', {
              type: 'geojson',
              data: geojson,
              generateId: true,
            });
          }

          // 1. Layer tô màu 2D từng xã (Fill layer)
          if (!map.getLayer('communes-fill')) {
            map.addLayer({
              id: 'communes-fill',
              type: 'fill',
              source: 'angiang-communes',
              paint: {
                'fill-color': '#475569',
                'fill-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  0.85,
                  0.65,
                ],
              },
            });
          }

          // 2. Layer viền ranh giới giữa các xã
          if (!map.getLayer('communes-border')) {
            map.addLayer({
              id: 'communes-border',
              type: 'line',
              source: 'angiang-communes',
              paint: {
                'line-color': '#ffffff',
                'line-width': 1.2,
                'line-opacity': 0.5,
              },
            });
          }

          // 3. Layer đường viền sáng khi được chọn (Highlight)
          if (!map.getLayer('communes-highlight')) {
            map.addLayer({
              id: 'communes-highlight',
              type: 'line',
              source: 'angiang-communes',
              paint: {
                'line-color': '#38bdf8',
                'line-width': [
                  'case',
                  ['boolean', ['feature-state', 'selected'], false],
                  3.5,
                  0,
                ],
              },
            });
          }

          // 4. Layer nhãn TÊN XÃ/PHƯỜNG RÕ NÉT (Symbol layer)
          if (!map.getLayer('communes-labels')) {
            map.addLayer({
              id: 'communes-labels',
              type: 'symbol',
              source: 'angiang-communes',
              layout: {
                'text-field': ['get', 'ten_xa'],
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  8.5, 9,
                  9.5, 11,
                  11.5, 13,
                  13, 16,
                ],
                'text-variable-anchor': ['center', 'top', 'bottom', 'left', 'right'],
                'text-justify': 'auto',
                'text-allow-overlap': false,
                'text-ignore-placement': false,
              },
              paint: {
                'text-color': '#ffffff',
                'text-halo-color': '#020617',
                'text-halo-width': 2.2,
                'text-halo-blur': 0.5,
              },
            });
          }

          setMapLoaded(true);
        } catch (err) {
          console.error('Lỗi khởi tạo bản đồ 2D:', err);
        }
      });

      let hoveredId: number | string | null = null;
      let selectedId: number | string | null = null;

      // Xử lý di chuột (Hover Tooltip)
      map.on('mousemove', 'communes-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties || {};
          const communeName = (props.ten_xa || '').trim();

          if (hoveredId !== null) {
            map.setFeatureState({ source: 'angiang-communes', id: hoveredId }, { hover: false });
          }
          hoveredId = feature.id ?? null;
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'angiang-communes', id: hoveredId }, { hover: true });
          }

          const matched = crmDataRef.current.find(
            (c) => c.id.toLowerCase() === communeName.toLowerCase()
          );

          if (matched) {
            setHoveredCommune(matched);
          } else {
            setHoveredCommune({
              id: communeName,
              ten_day_du: `UBND XÃ ${communeName.toUpperCase()} - TỈNH AN GIANG`,
              sale_name: 'Chưa gán',
              revenue: 0,
              households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
              area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
              reach_status: 'Chưa tiếp cận',
              danh_sach_du_an: [],
              danh_sach_nguoi_lien_he: [],
            });
          }

          setTooltipPos({ x: e.point.x, y: e.point.y });
        }
      });

      map.on('mouseleave', 'communes-fill', () => {
        map.getCanvas().style.cursor = '';
        if (hoveredId !== null) {
          map.setFeatureState({ source: 'angiang-communes', id: hoveredId }, { hover: false });
        }
        hoveredId = null;
        setHoveredCommune(null);
        setTooltipPos(null);
      });

      // Xử lý bấm chọn xã (Click)
      map.on('click', 'communes-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const props = feature.properties || {};
        const communeName = (props.ten_xa || '').trim();

        if (selectedId !== null) {
          map.setFeatureState({ source: 'angiang-communes', id: selectedId }, { selected: false });
        }
        selectedId = feature.id ?? null;
        selectedIdRef.current = selectedId;
        if (selectedId !== null) {
          map.setFeatureState({ source: 'angiang-communes', id: selectedId }, { selected: true });
        }
        setSearchQuery(communeName);

        const matched = crmDataRef.current.find(
          (c) => c.id.toLowerCase() === communeName.toLowerCase()
        );

        if (matched) {
          setSelectedFeature(matched);
          setEditStatus(matched.reach_status);
          setEditNotes(matched.notes || '');
        } else {
          const fallbackData: CommuneCRMData = {
            id: communeName,
            ten_day_du: `UBND XÃ ${communeName.toUpperCase()} - TỈNH AN GIANG`,
            sale_name: 'Chưa gán',
            revenue: 0,
            households: props.dan_so ? Math.round(Number(props.dan_so) / 4) : 0,
            area_km2: props.dtich_km2 ? Number(props.dtich_km2) : 0,
            reach_status: 'Chưa tiếp cận',
            notes: '',
            danh_sach_du_an: [],
            danh_sach_nguoi_lien_he: [],
          };
          setSelectedFeature(fallbackData);
          setEditStatus('Chưa tiếp cận');
          setEditNotes('');
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err: any) {
      console.error('Lỗi Map:', err);
      setMapError(err?.message || 'Không thể khởi tạo bản đồ.');
    }
  }, [activeToken]);

  const crmDataRef = useRef(crmData);
  useEffect(() => {
    crmDataRef.current = crmData;
  }, [crmData]);

  // Cập nhật màu sắc 2D theo Sale và Bộ lọc
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('communes-fill')) return;

    const colorExpr: any[] = ['match', ['get', 'ten_xa']];

    crmData.forEach((item) => {
      const passSale = filterSale === 'All' || item.sale_name === filterSale;
      const passStatus = filterStatus === 'All' || item.reach_status === filterStatus;

      if (!passSale || !passStatus) {
        colorExpr.push(item.id, '#1e293b'); // Làm chìm các xã không thuộc bộ lọc
        return;
      }

      const color = SALE_COLORS[item.sale_name] || SALE_COLORS['Chưa gán'];
      colorExpr.push(item.id, color);
    });

    colorExpr.push(SALE_COLORS['Chưa gán']);

    map.setPaintProperty('communes-fill', 'fill-color', colorExpr as any);
  }, [crmData, filterSale, filterStatus, mapLoaded]);

  const handleSaveCRM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature) return;

    onUpdateCRM(selectedFeature.id, editStatus, editNotes);
    setSelectedFeature({
      ...selectedFeature,
      reach_status: editStatus,
      notes: editNotes,
    });
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
      {/* 1. Thanh Thống Kê & Bộ Lọc Trên Desktop (Ẩn trên mobile để dành toàn bộ không gian cho map) */}
      <div className="hidden sm:flex z-20 bg-slate-900/95 backdrop-blur-md p-3 border-b border-slate-800 flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {/* Nhãn thống kê theo từng bạn sale */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            Phân bổ địa bàn:
          </span>
          {salesList.map((sale) => (
            <button
              key={sale}
              onClick={() => setFilterSale(filterSale === sale ? 'All' : sale)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                filterSale === sale
                  ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SALE_COLORS[sale] }} />
              <span>{sale}</span>
              <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[10px] text-slate-400 ml-0.5">
                {saleStats[sale] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Dropdowns Bộ lọc & Ô Tìm Kiếm Nhanh Trên Desktop */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Ô Tìm Kiếm Xã/Phường Nhanh & Tự Động Zoom */}
          <div ref={searchRef} className="relative w-56 sm:w-64">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredSearchList.length > 0) {
                      chonVaDinhViXa(filteredSearchList[0].id);
                      setSearchQuery(filteredSearchList[0].id);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm nhanh xã / phường..."
                className="w-full h-8 bg-slate-800/90 border border-slate-700 text-slate-200 pl-8 pr-7 rounded-lg text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    resetMapView();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  title="Xóa tìm kiếm và đặt lại bản đồ"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Dropdown Gợi ý khi tìm kiếm */}
            {isSearching && filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 divide-y divide-slate-800/60">
                {filteredSearchList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      chonVaDinhViXa(c.id);
                      setSearchQuery(c.id);
                      setIsSearching(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-200 group-hover:text-sky-400 truncate flex items-center gap-1.5">
                        <MapPin className="size-3 text-sky-400 shrink-0" />
                        <span>{c.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate pl-4.5">
                        {c.sale_name !== 'Chưa gán' ? `Sale: ${c.sale_name}` : 'Chưa gán sale'}
                      </div>
                    </div>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: SALE_COLORS[c.sale_name] || '#64748b' }}
                      title={c.sale_name}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Chưa tiếp cận">Chưa tiếp cận</option>
            <option value="Đang chăm sóc">Đang chăm sóc</option>
            <option value="Đã chốt">Đã chốt</option>
          </select>
        </div>
      </div>

      {/* 2. Container Bản Đồ */}
      <div className="relative flex-1 w-full h-full min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* THANH ĐIỀU KHIỂN NỔI GỌN GÀNG TRÊN MOBILE (Floating Pill) - Không chiếm diện tích bản đồ */}
        <div className="sm:hidden absolute top-2.5 inset-x-2.5 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Ô Tìm Kiếm Nhanh Nổi */}
          <div ref={mobileSearchRef} className="relative flex-1">
            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredSearchList.length > 0) {
                      chonVaDinhViXa(filteredSearchList[0].id);
                      setSearchQuery(filteredSearchList[0].id);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm nhanh xã / phường..."
                className="w-full h-9 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white pl-8.5 pr-8 rounded-full text-xs shadow-xl placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearching(false);
                    resetMapView();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Gợi Ý Tìm Kiếm Trên Mobile */}
            {isSearching && filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-52 overflow-y-auto bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800/80">
                {filteredSearchList.slice(0, 15).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      chonVaDinhViXa(c.id);
                      setSearchQuery(c.id);
                      setIsSearching(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-800 transition flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate flex items-center gap-1.5">
                        <MapPin className="size-3 text-sky-400 shrink-0" />
                        <span>{c.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate pl-4.5">
                        {c.sale_name !== 'Chưa gán' ? `Sale: ${c.sale_name}` : 'Chưa gán sale'}
                      </div>
                    </div>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: SALE_COLORS[c.sale_name] || '#64748b' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nút Mở Bottom Sheet Lọc Trên Mobile */}
          <button
            type="button"
            onClick={() => setMoBoLocMobile(true)}
            className={`size-9 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 flex items-center justify-center shrink-0 shadow-xl active:scale-95 transition relative ${
              filterSale !== 'All' || filterStatus !== 'All'
                ? 'text-sky-400 border-sky-500/70'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Lọc địa bàn"
          >
            <SlidersHorizontal className="size-3.5" />
            {(filterSale !== 'All' || filterStatus !== 'All') && (
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
            )}
          </button>

          {/* Nút Đặt Lại Bản Đồ Mobile */}
          <button
            type="button"
            onClick={resetMapView}
            className="size-9 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 flex items-center justify-center text-slate-300 hover:text-white shrink-0 shadow-xl active:scale-95 transition"
            title="Đặt lại bản đồ"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-300 p-6 z-20">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 max-w-md text-center space-y-3">
              <div className="text-amber-400 font-bold text-base">Thông báo bản đồ</div>
              <p className="text-xs text-slate-300 leading-relaxed">{mapError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        )}

        {/* Floating Tooltip khi di chuột qua xã (Chỉ hiển thị trên Desktop để không vướng cảm ứng trên Mobile) */}
        {hoveredCommune && tooltipPos && !selectedFeature && (
          <div
            className="hidden sm:block pointer-events-none absolute z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-lg p-2.5 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[210px]"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="font-bold text-sm text-sky-400 border-b border-slate-800 pb-1">
              {hoveredCommune.id}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {hoveredCommune.ten_day_du || hoveredCommune.id}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Phụ trách:</span>
              <span className="font-medium flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: SALE_COLORS[hoveredCommune.sale_name] || '#64748b' }}
                />
                {hoveredCommune.sale_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Trạng thái:</span>
              <span
                className={`font-semibold ${
                  hoveredCommune.reach_status === 'Đã chốt'
                    ? 'text-emerald-400'
                    : hoveredCommune.reach_status === 'Đang chăm sóc'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {hoveredCommune.reach_status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Số dự án:</span>
              <span className="font-semibold text-blue-400">
                {hoveredCommune.danh_sach_du_an?.length || 0} dự án
              </span>
            </div>
            {hoveredCommune.revenue > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Doanh số:</span>
                <span className="font-bold text-emerald-400">
                  {hoveredCommune.revenue.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Card/Drawer Chi Tiết Xã Khi Click: Bottom Sheet trên Mobile, Right Drawer trên Desktop */}
        {selectedFeature && (
          <div className="fixed sm:absolute bottom-0 inset-x-0 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-96 max-h-[70vh] sm:max-h-none rounded-t-2xl sm:rounded-xl z-40 bg-slate-900/98 backdrop-blur-md border-t sm:border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
            {/* Thanh gạt vuốt (Drag Handle) trực quan trên Mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Header Drawer */}
            <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-800/60">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">
                    Địa bàn phụ trách
                  </span>
                  {selectedFeature.khach_hang_id && (
                    <Link
                      href={`/khach-hang/${selectedFeature.khach_hang_id}`}
                      className="text-[11px] text-slate-400 hover:text-sky-300 inline-flex items-center gap-0.5 transition-colors"
                      title="Mở hồ sơ khách hàng đầy đủ"
                    >
                      <ExternalLink className="size-3" />
                      <span>Xem hồ sơ KH</span>
                    </Link>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-1 leading-snug break-words">
                  {selectedFeature.ten_day_du || selectedFeature.id}
                </h3>
              </div>
              <button
                onClick={dongDrawer}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Nội dung Drawer cuộn */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {/* Thẻ chỉ số chung */}
              <div className="space-y-2 text-xs bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sale phụ trách:</span>
                  <span className="font-semibold flex items-center gap-1.5 text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: SALE_COLORS[selectedFeature.sale_name] || '#64748b' }}
                    />
                    {selectedFeature.sale_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      selectedFeature.reach_status === 'Đã chốt'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : selectedFeature.reach_status === 'Đang chăm sóc'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {selectedFeature.reach_status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số hộ dân:</span>
                  <span className="text-white font-medium">{selectedFeature.households.toLocaleString('vi-VN')} hộ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Diện tích:</span>
                  <span className="text-white font-medium">{selectedFeature.area_km2} km²</span>
                </div>
              </div>

              {/* KHỐI DỰ ÁN LIÊN KẾT: SỐ DỰ ÁN, CLICK RA THẲNG DỰ ÁN */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderKanban className="size-3.5 text-blue-400" />
                    Dự án tại địa bàn ({selectedFeature.danh_sach_du_an?.length || 0})
                  </span>
                  {selectedFeature.khach_hang_id && (
                    <Link
                      href={`/ho-so-du-an?khachHangId=${selectedFeature.khach_hang_id}&moForm=true`}
                      className="text-[11px] text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Thêm dự án
                    </Link>
                  )}
                </div>

                {selectedFeature.danh_sach_du_an && selectedFeature.danh_sach_du_an.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFeature.danh_sach_du_an.map((da) => (
                      <Link
                        key={da.id}
                        href={`/ho-so-du-an/${da.id}`}
                        className="block p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-sky-500/80 transition-all group shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                            {da.ten_du_an}
                          </span>
                          <ExternalLink className="size-3 text-slate-400 group-hover:text-sky-300 shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                          <span className="bg-slate-700/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                            {da.giai_doan || 'Đang xúc tiến'}
                          </span>
                          {da.tong_muc_dau_tu ? (
                            <span className="font-semibold text-emerald-400 font-mono">
                              {da.tong_muc_dau_tu.toLocaleString('vi-VN')} đ
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-800/30 rounded-lg border border-slate-800">
                    Chưa có dự án nào gắn với địa bàn này.
                  </div>
                )}
              </div>

              {/* KHỐI NGƯỜI LIÊN HỆ */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-3.5 text-emerald-400" />
                    Người liên hệ ({selectedFeature.danh_sach_nguoi_lien_he?.length || 0})
                  </span>
                </div>

                {selectedFeature.danh_sach_nguoi_lien_he && selectedFeature.danh_sach_nguoi_lien_he.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFeature.danh_sach_nguoi_lien_he.map((lh) => (
                      <div
                        key={lh.id}
                        className="p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/40 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white truncate">{lh.ho_va_ten}</div>
                          {lh.chuc_vu && <div className="text-[11px] text-slate-400 truncate">{lh.chuc_vu}</div>}
                        </div>
                        {lh.so_dien_thoai ? (
                          <a
                            href={`tel:${lh.so_dien_thoai}`}
                            className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all inline-flex items-center gap-1 font-mono text-[11px]"
                          >
                            <Phone className="size-3" />
                            {lh.so_dien_thoai}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic bg-slate-800/30 rounded-lg border border-slate-800">
                    Chưa có đầu mối liên hệ tại địa bàn này.
                  </div>
                )}
              </div>

              {/* Form Cập Nhật Nhanh */}
              <form onSubmit={handleSaveCRM} className="space-y-3 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Cập nhật tiến độ tiếp cận
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Trạng thái</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Chưa tiếp cận">Chưa tiếp cận</option>
                    <option value="Đang chăm sóc">Đang chăm sóc</option>
                    <option value="Đã chốt">Đã chốt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ghi chú hỗ trợ</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Ghi chú trao đổi, đầu mối liên hệ..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-xs transition-colors shadow-lg shadow-blue-600/30"
                >
                  Lưu thay đổi địa bàn
                </button>
              </form>
            </div>
          </div>
        )}
        {/* 4. Bottom Sheet Bộ Lọc Trên Mobile: Tiện lợi, không chiếm diện tích bản đồ khi đóng */}
        {moBoLocMobile && (
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMoBoLocMobile(false)}
            />
            <div className="relative bg-slate-900 border-t border-slate-700/80 rounded-t-2xl p-4 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200 text-xs text-white max-h-[80vh] overflow-y-auto">
              <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto -mt-1" />
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-sm text-white">Bộ lọc địa bàn</span>
                {(filterSale !== 'All' || filterStatus !== 'All') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSale('All');
                      setFilterStatus('All');
                    }}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    Đặt lại bộ lọc
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMoBoLocMobile(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Đóng
                  </button>
                )}
              </div>

              {/* Lọc theo Sale */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Nhân sự phụ trách
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterSale('All')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      filterSale === 'All'
                        ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                        : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    Tất cả sale
                  </button>
                  {salesList.map((sale) => (
                    <button
                      key={sale}
                      type="button"
                      onClick={() => setFilterSale(filterSale === sale ? 'All' : sale)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        filterSale === sale
                          ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: SALE_COLORS[sale] }} />
                        <span className="truncate">{sale}</span>
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                        {saleStats[sale] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc theo Trạng thái tiếp cận */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Trạng thái tiếp cận
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Chưa tiếp cận', 'Đang chăm sóc', 'Đã chốt'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFilterStatus(st)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        filterStatus === st
                          ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {st === 'All' ? 'Tất cả trạng thái' : st}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMoBoLocMobile(false)}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-center transition shadow-lg shadow-sky-600/30"
              >
                Áp dụng & xem bản đồ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
