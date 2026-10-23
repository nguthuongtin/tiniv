"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  FolderKanban,
  Users,
  Phone,
  ExternalLink,
  Plus,
  Search,
  X,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle,
  Building2,
  UserCheck
} from 'lucide-react';

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
  id: string; // Khóa duy nhất (ma_xa)
  ma_xa?: string;
  ten_xa?: string;
  ten_tinh?: string;
  ma_tinh?: string;
  ten_day_du?: string;
  sale_name: string;
  sale_id?: string;
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
  onUpdateCRM: (
    id: string,
    newStatus: CommuneCRMData['reach_status'],
    newNotes: string,
    newSaleId?: string,
    newSaleName?: string
  ) => Promise<void> | void;
  danhSachSale?: Array<{ id: string; ho_va_ten: string }>;
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
}

export const SALE_COLORS: Record<string, string> = {
  'Huỳnh Hoàng Bá': '#3b82f6',
  'Huỳnh Thị Thanh Ngân': '#10b981',
  'Lương Thị Cẩm Tú': '#f59e0b',
  'Nguyễn Văn Cường Em': '#8b5cf6',
  'Chưa gán': '#475569',
};

const DEFAULT_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6',
  '#a855f7', '#eab308'
];

export function layMauSale(name: string): string {
  if (!name || name === 'Chưa gán') return '#475569';
  if (SALE_COLORS[name]) return SALE_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DEFAULT_COLOR_PALETTE.length;
  return DEFAULT_COLOR_PALETTE[idx];
}

export const PROVINCES_LIST = [
  'All',
  'An Giang',
  'Cần Thơ',
  'Đồng Tháp',
  'Vĩnh Long',
  'Cà Mau',
] as const;

export const PROVINCE_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  'All': { center: [105.3, 9.85], zoom: 7.8 },
  'An Giang': { center: [104.52, 10.11], zoom: 9.0 },
  'Cần Thơ': { center: [105.76, 9.80], zoom: 9.2 },
  'Đồng Tháp': { center: [106.00, 10.55], zoom: 9.1 },
  'Vĩnh Long': { center: [106.24, 9.93], zoom: 9.2 },
  'Cà Mau': { center: [105.19, 9.03], zoom: 9.0 },
};

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
  return '';
};

interface CommuneGeomInfo {
  center: [number, number];
  bbox: [number, number, number, number];
  featureId: string;
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
  const bbox: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];

  return {
    center,
    bbox,
    featureId: String(feature.properties?.ma_xa || feature.id || idx),
    properties: feature.properties || {},
  };
}

export default function Map3D({
  crmData,
  onUpdateCRM,
  danhSachSale = [],
  selectedProvince = 'All',
  onSelectProvince,
}: MapProps) {
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
  const selectedIdRef = useRef<string | null>(null);

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
  const [editSaleId, setEditSaleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    if (danhSachSale && danhSachSale.length > 0) {
      return danhSachSale.map((s) => s.ho_va_ten);
    }
    const defaultSales = ['Huỳnh Hoàng Bá', 'Huỳnh Thị Thanh Ngân', 'Lương Thị Cẩm Tú', 'Nguyễn Văn Cường Em'];
    const dynamic = new Set<string>(defaultSales);
    crmData.forEach((c) => {
      if (c.sale_name && c.sale_name !== 'Chưa gán') dynamic.add(c.sale_name);
    });
    return Array.from(dynamic);
  }, [danhSachSale, crmData]);

  // Danh sách xã gợi ý theo từ khóa tìm kiếm
  const filteredSearchList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return crmData
      .filter((c) => {
        const passProvince = selectedProvince === 'All' || c.ten_tinh === selectedProvince;
        if (!passProvince) return false;
        const matchName = c.id.toLowerCase().includes(q) || (c.ten_xa && c.ten_xa.toLowerCase().includes(q));
        const matchProv = c.ten_tinh && c.ten_tinh.toLowerCase().includes(q);
        const matchSale = c.sale_name.toLowerCase().includes(q);
        return matchName || matchProv || matchSale;
      })
      .slice(0, 12);
  }, [searchQuery, crmData, selectedProvince]);

  // Thống kê số lượng xã phụ trách của từng bạn Sale
  const saleStats = useMemo(() => {
    const counts: Record<string, number> = {};
    crmData.forEach((item) => {
      const passProvince = selectedProvince === 'All' || item.ten_tinh === selectedProvince;
      if (passProvince && item.sale_name && item.sale_name !== 'Chưa gán') {
        counts[item.sale_name] = (counts[item.sale_name] || 0) + 1;
      }
    });
    return counts;
  }, [crmData, selectedProvince]);

  const crmDataRef = useRef(crmData);
  useEffect(() => {
    crmDataRef.current = crmData;
  }, [crmData]);

  // Hàm chọn và tự động zoom + định vị đến xã
  const chonVaDinhViXa = (identifier: string) => {
    const map = mapRef.current;
    const geomInfo =
      communeGeomRef.current.get(identifier.toLowerCase()) ||
      communeGeomRef.current.get(identifier);

    const matched = crmDataRef.current.find(
      (c) =>
        c.id.toLowerCase() === identifier.toLowerCase() ||
        (c.ten_xa && c.ten_xa.toLowerCase() === identifier.toLowerCase())
    );

    if (map && geomInfo) {
      if (selectedIdRef.current !== null) {
        map.setFeatureState(
          { source: 'mientay-communes', id: selectedIdRef.current },
          { selected: false }
        );
      }
      selectedIdRef.current = geomInfo.featureId;
      map.setFeatureState(
        { source: 'mientay-communes', id: geomInfo.featureId },
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
            right: typeof window !== 'undefined' && window.innerWidth > 1024 ? 420 : 70,
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
      setEditSaleId(matched.sale_id || '');
    } else if (geomInfo) {
      const props = geomInfo.properties;
      const loai = props.loai ? props.loai.toUpperCase() : 'XÃ';
      const fallbackData: CommuneCRMData = {
        id: props.ma_xa || identifier,
        ma_xa: props.ma_xa,
        ten_xa: props.ten_xa || identifier,
        ten_tinh: props.ten_tinh,
        ma_tinh: props.ma_tinh,
        ten_day_du: `UBND ${loai} ${(props.ten_xa || identifier).toUpperCase()} - TỈNH ${(props.ten_tinh || '').toUpperCase()}`,
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
      setEditSaleId('');
    }
  };

  const dongDrawer = () => {
    const map = mapRef.current;
    if (map && selectedIdRef.current !== null) {
      map.setFeatureState(
        { source: 'mientay-communes', id: selectedIdRef.current },
        { selected: false }
      );
      selectedIdRef.current = null;
    }
    setSelectedFeature(null);
    setSaveSuccess(false);
  };

  const resetMapView = () => {
    dongDrawer();
    setSearchQuery('');
    setIsSearching(false);
    const map = mapRef.current;
    if (!map) return;
    const cfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];
    map.flyTo({
      center: cfg.center,
      zoom: cfg.zoom,
      duration: 1000,
    });
  };

  // Khởi tạo bản đồ Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const token = activeToken || layMapboxToken();
      if (!token) {
        setMapError('Chưa có mã truy cập (token) Mapbox để hiển thị bản đồ.');
        return;
      }
      mapboxgl.accessToken = token;

      const initialCfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCfg.center,
        zoom: initialCfg.zoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
      });

      mapRef.current = map;

      map.on('load', async () => {
        try {
          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

          // Tải đồng thời GeoJSON Xã Miền Tây và GeoJSON Tỉnh Miền Tây
          const [geoCommunes, geoProvinces] = await Promise.all([
            fetch('/mientay.geojson').then((r) => r.json()),
            fetch('/mientay_tinh.geojson').then((r) => r.json()),
          ]);

          const geomMap = new Map<string, CommuneGeomInfo>();
          geoCommunes.features.forEach((f: any, idx: number) => {
            const info = tinhToaDoXa(f, idx);
            const name = (f.properties?.ten_xa || '').trim();
            const code = String(f.properties?.ma_xa || '').trim();
            const prov = (f.properties?.ten_tinh || '').trim();

            if (code) geomMap.set(code, info);
            if (name) {
              geomMap.set(name.toLowerCase(), info);
              if (prov) {
                geomMap.set(`${name} - ${prov}`.toLowerCase(), info);
              }
            }
          });
          communeGeomRef.current = geomMap;

          // Source xã phường
          if (!map.getSource('mientay-communes')) {
            map.addSource('mientay-communes', {
              type: 'geojson',
              data: geoCommunes,
              generateId: true,
              promoteId: 'ma_xa',
            });
          }

          // Source ranh giới tỉnh
          if (!map.getSource('mientay-provinces')) {
            map.addSource('mientay-provinces', {
              type: 'geojson',
              data: geoProvinces,
            });
          }

          // 1. Layer tô màu xã phường
          if (!map.getLayer('communes-fill')) {
            map.addLayer({
              id: 'communes-fill',
              type: 'fill',
              source: 'mientay-communes',
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

          // 2. Layer viền ranh giới xã
          if (!map.getLayer('communes-border')) {
            map.addLayer({
              id: 'communes-border',
              type: 'line',
              source: 'mientay-communes',
              paint: {
                'line-color': '#64748b',
                'line-width': 0.8,
                'line-opacity': 0.35,
              },
            });
          }

          // 3. Layer viền ranh giới cấp TỈNH (nổi bật, rõ nét)
          if (!map.getLayer('provinces-border')) {
            map.addLayer({
              id: 'provinces-border',
              type: 'line',
              source: 'mientay-provinces',
              paint: {
                'line-color': '#38bdf8',
                'line-width': 2.2,
                'line-opacity': 0.8,
              },
            });
          }

          // 4. Layer đường viền sáng khi được chọn (Highlight)
          if (!map.getLayer('communes-highlight')) {
            map.addLayer({
              id: 'communes-highlight',
              type: 'line',
              source: 'mientay-communes',
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

          // 5. Layer nhãn TÊN TỈNH (Hiển thị khi zoom bao quát < 9.2)
          if (!map.getLayer('provinces-labels')) {
            map.addLayer({
              id: 'provinces-labels',
              type: 'symbol',
              source: 'mientay-provinces',
              maxzoom: 9.2,
              layout: {
                'text-field': ['get', 'ten_tinh'],
                'text-size': 13,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.1,
                'text-allow-overlap': true,
              },
              paint: {
                'text-color': '#7dd3fc',
                'text-halo-color': '#020617',
                'text-halo-width': 2.5,
              },
            });
          }

          // 6. Layer nhãn TÊN XÃ/PHƯỜNG (Hiển thị khi zoom sâu >= 9.2)
          if (!map.getLayer('communes-labels')) {
            map.addLayer({
              id: 'communes-labels',
              type: 'symbol',
              source: 'mientay-communes',
              minzoom: 9.2,
              layout: {
                'text-field': ['get', 'ten_xa'],
                'text-size': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  9.2, 9,
                  10.5, 11,
                  12, 13,
                  14, 16,
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
          console.error('Lỗi nạp dữ liệu bản đồ:', err);
        }
      });

      let hoveredId: string | null = null;
      let selectedId: string | null = null;

      // Xử lý di chuột (Hover Tooltip)
      map.on('mousemove', 'communes-fill', (e) => {
        map.getCanvas().style.cursor = 'pointer';

        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties || {};
          const maXa = String(props.ma_xa || feature.id || '').trim();
          const tenXa = (props.ten_xa || '').trim();
          const tenTinh = (props.ten_tinh || '').trim();

          if (hoveredId !== null) {
            map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: false });
          }
          hoveredId = maXa || null;
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: true });
          }

          const matched = crmDataRef.current.find(
            (c) =>
              c.id === maXa ||
              (c.ten_xa && c.ten_xa.toLowerCase() === tenXa.toLowerCase() && c.ten_tinh === tenTinh)
          );

          if (matched) {
            setHoveredCommune(matched);
          } else {
            setHoveredCommune({
              id: maXa || tenXa,
              ma_xa: maXa,
              ten_xa: tenXa,
              ten_tinh: tenTinh,
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
          map.setFeatureState({ source: 'mientay-communes', id: hoveredId }, { hover: false });
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
        const maXa = String(props.ma_xa || feature.id || '').trim();
        const tenXa = (props.ten_xa || '').trim();
        const tenTinh = (props.ten_tinh || '').trim();

        if (selectedId !== null) {
          map.setFeatureState({ source: 'mientay-communes', id: selectedId }, { selected: false });
        }
        selectedId = maXa || null;
        selectedIdRef.current = selectedId;
        if (selectedId !== null) {
          map.setFeatureState({ source: 'mientay-communes', id: selectedId }, { selected: true });
        }
        setSearchQuery(tenXa);

        const matched = crmDataRef.current.find(
          (c) =>
            c.id === maXa ||
            (c.ten_xa && c.ten_xa.toLowerCase() === tenXa.toLowerCase() && c.ten_tinh === tenTinh)
        );

        setSaveSuccess(false);
        if (matched) {
          setSelectedFeature(matched);
          setEditStatus(matched.reach_status);
          setEditNotes(matched.notes || '');
          setEditSaleId(matched.sale_id || '');
        } else {
          const loai = props.loai ? props.loai.toUpperCase() : 'XÃ';
          const fallbackData: CommuneCRMData = {
            id: maXa || tenXa,
            ma_xa: maXa,
            ten_xa: tenXa,
            ten_tinh: tenTinh,
            ma_tinh: String(props.ma_tinh || ''),
            ten_day_du: `UBND ${loai} ${tenXa.toUpperCase()} - TỈNH ${tenTinh.toUpperCase()}`,
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
          setEditSaleId('');
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

  // Cập nhật vị trí camera khi đổi Tỉnh
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    const cfg = PROVINCE_CONFIG[selectedProvince] || PROVINCE_CONFIG['All'];
    map.flyTo({
      center: cfg.center,
      zoom: cfg.zoom,
      duration: 900,
    });
  }, [selectedProvince, mapLoaded]);

  // Cập nhật màu sắc 2D theo Sale, Trạng thái và Tỉnh
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.getLayer('communes-fill')) return;

    const colorExpr: any[] = ['match', ['get', 'ma_xa']];

    crmData.forEach((item) => {
      const passSale = filterSale === 'All' || item.sale_name === filterSale;
      const passStatus = filterStatus === 'All' || item.reach_status === filterStatus;
      const passProvince = selectedProvince === 'All' || item.ten_tinh === selectedProvince;

      if (!passSale || !passStatus || !passProvince) {
        colorExpr.push(item.id, '#1e293b');
        return;
      }

      const color = layMauSale(item.sale_name);
      colorExpr.push(item.id, color);
    });

    colorExpr.push('#334155');

    map.setPaintProperty('communes-fill', 'fill-color', colorExpr as any);
  }, [crmData, filterSale, filterStatus, selectedProvince, mapLoaded]);

  // Lưu thông tin & gán nhân sự phụ trách
  const handleSaveCRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeature) return;

    setIsSaving(true);
    try {
      const selectedSaleObj = danhSachSale?.find((s) => s.id === editSaleId);
      const newSaleName = selectedSaleObj ? selectedSaleObj.ho_va_ten : 'Chưa gán';

      await onUpdateCRM(
        selectedFeature.id,
        editStatus,
        editNotes,
        editSaleId || undefined,
        newSaleName
      );

      setSelectedFeature((prev) =>
        prev
          ? {
              ...prev,
              reach_status: editStatus,
              notes: editNotes,
              sale_id: editSaleId || undefined,
              sale_name: newSaleName,
            }
          : null
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Lỗi khi lưu CRM địa bàn:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl flex flex-col">
      {/* 1. Thanh Thống Kê & Bộ Lọc Trên Desktop */}
      <div className="hidden sm:flex z-20 bg-slate-900/95 backdrop-blur-md p-3 border-b border-slate-800 flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        {/* Phân bổ theo Sale */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] mr-1">
            Phân bổ địa bàn:
          </span>
          {salesList.map((sale) => (
            <button
              key={sale}
              onClick={() => setFilterSale(filterSale === sale ? 'All' : sale)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterSale === sale
                  ? 'bg-slate-800 border-white text-white font-bold ring-1 ring-white/50'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: layMauSale(sale) }} />
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
                      setSearchQuery(filteredSearchList[0].ten_xa || filteredSearchList[0].id);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm xã/phường miền Tây..."
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
                      setSearchQuery(c.ten_xa || c.id);
                      setIsSearching(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-slate-200 group-hover:text-sky-400 truncate flex items-center gap-1.5">
                        <MapPin className="size-3 text-sky-400 shrink-0" />
                        <span>{c.ten_xa || c.id}</span>
                        {c.ten_tinh && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({c.ten_tinh})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate pl-4.5">
                        {c.sale_name !== 'Chưa gán' ? `Sale: ${c.sale_name}` : 'Chưa gán sale'}
                      </div>
                    </div>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: layMauSale(c.sale_name) }}
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
            className="h-8 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
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

        {/* Thanh điều khiển nổi trên Mobile */}
        <div className="sm:hidden absolute top-2.5 inset-x-2.5 z-30 flex items-center gap-2 pointer-events-auto">
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
                      setSearchQuery(filteredSearchList[0].ten_xa || filteredSearchList[0].id);
                      setIsSearching(false);
                    }
                  } else if (e.key === 'Escape') {
                    setIsSearching(false);
                  }
                }}
                placeholder="Tìm nhanh xã/phường..."
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

            {isSearching && filteredSearchList.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl z-50 divide-y divide-slate-800">
                {filteredSearchList.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      chonVaDinhViXa(c.id);
                      setSearchQuery(c.ten_xa || c.id);
                      setIsSearching(false);
                    }}
                    className="w-full text-left px-3 py-2.5 active:bg-slate-800 transition flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <MapPin className="size-3 text-sky-400 shrink-0" />
                        <span>{c.ten_xa || c.id}</span>
                        {c.ten_tinh && <span className="text-[10px] text-slate-400">({c.ten_tinh})</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 pl-4.5">
                        {c.sale_name !== 'Chưa gán' ? `Sale: ${c.sale_name}` : 'Chưa gán sale'}
                      </div>
                    </div>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: layMauSale(c.sale_name) }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMoBoLocMobile(true)}
            className="h-9 px-3 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-xl shrink-0"
          >
            <SlidersHorizontal className="size-3.5 text-sky-400" />
            <span>Lọc</span>
          </button>
        </div>

        {/* Nút đặt lại góc nhìn bản đồ */}
        <button
          type="button"
          onClick={resetMapView}
          className="absolute left-3 bottom-3 z-20 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700/80 shadow-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Đặt lại góc nhìn bản đồ"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Góc nhìn chuẩn</span>
        </button>

        {/* Hover Tooltip */}
        {tooltipPos && hoveredCommune && (
          <div
            className="pointer-events-none absolute z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-lg p-2.5 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mt--2 min-w-[200px]"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 12}px` }}
          >
            <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{hoveredCommune.ten_xa || hoveredCommune.id}</span>
              {hoveredCommune.ten_tinh && (
                <span className="text-[10px] text-sky-400 font-normal">
                  {hoveredCommune.ten_tinh}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Sale phụ trách:</span>
              <span className="font-medium text-slate-200 flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: layMauSale(hoveredCommune.sale_name) }}
                />
                {hoveredCommune.sale_name}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
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
            {hoveredCommune.danh_sach_du_an && hoveredCommune.danh_sach_du_an.length > 0 && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Số dự án:</span>
                <span className="font-semibold text-blue-400">
                  {hoveredCommune.danh_sach_du_an.length} dự án
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Card/Drawer Chi Tiết Xã Khi Click */}
        {selectedFeature && (
          <div className="fixed sm:absolute bottom-0 inset-x-0 sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-96 max-h-[75vh] sm:max-h-none rounded-t-2xl sm:rounded-xl z-40 bg-slate-900/98 backdrop-blur-md border-t sm:border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-bottom sm:slide-in-from-right duration-200">
            {/* Thanh vuốt Mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Header Drawer */}
            <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-800/60">
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">
                    {selectedFeature.ten_tinh || 'Miền Tây'}
                  </span>
                  {selectedFeature.khach_hang_id ? (
                    <Link
                      href={`/khach-hang/${selectedFeature.khach_hang_id}`}
                      className="text-[11px] text-slate-400 hover:text-sky-300 inline-flex items-center gap-0.5 transition-colors"
                      title="Mở hồ sơ khách hàng đầy đủ"
                    >
                      <ExternalLink className="size-3" />
                      <span>Xem hồ sơ KH</span>
                    </Link>
                  ) : (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                      Chưa tạo KH
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-1 leading-snug break-words">
                  {selectedFeature.ten_day_du || selectedFeature.ten_xa || selectedFeature.id}
                </h3>
              </div>
              <button
                onClick={dongDrawer}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-700/50 transition-colors shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nội dung Drawer */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              {saveSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="size-4 shrink-0 text-emerald-400" />
                  <span>Đã cập nhật thông tin và phân công địa bàn thành công!</span>
                </div>
              )}

              {/* Thẻ chỉ số chung */}
              <div className="space-y-2 text-xs bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sale phụ trách:</span>
                  <span className="font-semibold flex items-center gap-1.5 text-white">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: layMauSale(selectedFeature.sale_name) }}
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
                  <span className="text-slate-400">Dân số / Hộ dân:</span>
                  <span className="text-white font-medium">
                    {selectedFeature.households.toLocaleString('vi-VN')} hộ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Diện tích:</span>
                  <span className="text-white font-medium">{selectedFeature.area_km2} km²</span>
                </div>
              </div>

              {/* Dự án liên kết */}
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
                        className="block p-2.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-sky-500/80 transition-all group shadow-xs"
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

              {/* Người liên hệ */}
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

              {/* Form Cập Nhật Nhanh & Gán Sale */}
              <form onSubmit={handleSaveCRM} className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="size-3.5 text-sky-400" />
                    Phân công & cập nhật
                  </span>
                  {!selectedFeature.khach_hang_id && (
                    <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                      Tự động tạo hồ sơ KH
                    </span>
                  )}
                </div>

                {/* Chọn Nhân Sự Phụ Trách */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Nhân sự phụ trách địa bàn
                  </label>
                  <select
                    value={editSaleId}
                    onChange={(e) => setEditSaleId(e.target.value)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="">-- Chưa gán người phụ trách --</option>
                    {(danhSachSale || []).map((ns) => (
                      <option key={ns.id} value={ns.id}>
                        {ns.ho_va_ten}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trạng Thái */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Trạng thái tiếp cận</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Chưa tiếp cận">Chưa tiếp cận</option>
                    <option value="Đang chăm sóc">Đang chăm sóc</option>
                    <option value="Đã chốt">Đã chốt</option>
                  </select>
                </div>

                {/* Ghi Chú Hỗ Trợ */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Ghi chú tiến độ / đầu mối</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Ghi chú trao đổi, đầu mối liên hệ..."
                    className="w-full text-xs bg-slate-800 border border-slate-700 text-slate-100 rounded-lg p-2 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs transition-colors shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi địa bàn'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. Bottom Sheet Bộ Lọc Trên Mobile */}
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
                {filterSale !== 'All' || filterStatus !== 'All' || selectedProvince !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterSale('All');
                      setFilterStatus('All');
                      onSelectProvince?.('All');
                    }}
                    className="text-xs text-sky-400 hover:underline cursor-pointer"
                  >
                    Đặt lại bộ lọc
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMoBoLocMobile(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Đóng
                  </button>
                )}
              </div>

              {/* Lọc theo Tỉnh */}
              <div className="space-y-2">
                <span className="text-slate-400 block text-[11px] font-semibold uppercase tracking-wider">
                  Khu vực Tỉnh / Thành
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PROVINCES_LIST.map((prov) => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => onSelectProvince?.(prov)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        selectedProvince === prov
                          ? 'bg-slate-800 border-sky-400 text-white font-bold ring-1 ring-sky-400/50'
                          : 'bg-slate-800/40 border-slate-700/80 text-slate-300'
                      }`}
                    >
                      {prov === 'All' ? 'Toàn Miền Tây' : prov}
                    </button>
                  ))}
                </div>
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
                        <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: layMauSale(sale) }} />
                        <span className="truncate">{sale}</span>
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 shrink-0">
                        {saleStats[sale] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lọc theo Trạng thái */}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
