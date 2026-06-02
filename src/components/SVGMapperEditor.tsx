/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SVGMapConfig,
  RegionConfig,
  DataItem,
  MarkerConfig,
  MarkerIconType
} from '../types';
import { SVGMapContainer } from './SVGMapContainer';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Settings,
  Layers,
  MapPin,
  Save,
  FileCode,
  Check,
  Info,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Copy,
  Eye,
  Database
} from 'lucide-react';

// Use globals for WP dependencies
const { useSelect } = (window as any).wp?.data || {};
const { SelectControl, Spinner } = (window as any).wp?.components || {};


interface SVGMapperEditorProps {
  config: SVGMapConfig;
  onChangeConfig: (newConfig: SVGMapConfig) => void;
  selectedRegionId: string | null;
  onSelectRegion: (id: string | null) => void;
}

export function SVGMapperEditor({
  config,
  onChangeConfig,
  selectedRegionId,
  onSelectRegion,
}: SVGMapperEditorProps) {
  // Temporary state for newly parsed path IDs in uploaded SVG
  const [availablePathIds, setAvailablePathIds] = useState<string[]>([]);

  // Selection states for assembling new regions
  const [selectedPathsForNewRegion, setSelectedPathsForNewRegion] = useState<string[]>([]);
  const [newRegionName, setNewRegionName] = useState('');

  // States for marker placement
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);

  // JSON view modal
  const [jsonPasteValue, setJsonPasteValue] = useState('');
  const [showJsonOverlay, setShowJsonOverlay] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  // Raw SVG edit area toggle
  const [isEditingRawSvg, setIsEditingRawSvg] = useState(false);
  const [rawSvgInput, setRawSvgInput] = useState('');

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  // Active Region being inspected in sidebar panel
  const activeRegionObj = config.regions.find(r => r.id === selectedRegionId) || null;

  // WP Taxonomy/Term data

  // WP Taxonomy/Term data
  const taxonomies = useSelect ? useSelect((select: any) => {
    return select('core').getTaxonomies({ per_page: -1 });
  }, []) : [];

  const selectedTaxonomy = activeRegionObj?.taxonomy || 'category';
  const terms = useSelect ? useSelect((select: any) => {
    return select('core').getEntityRecords('taxonomy', selectedTaxonomy, { per_page: -1 });
  }, [selectedTaxonomy]) : [];

  // Extract all IDs from raw SVG content to feed the listing panel
  useEffect(() => {
    if (!config.svgContent) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(config.svgContent, 'image/svg+xml');

      // Select all potential interactive elements
      const interactiveNodes = doc.querySelectorAll('path, g, polygon, rect, circle, ellipse');
      const ids: string[] = [];
      let missingIdCount = 0;
      let hasChanged = false;

      interactiveNodes.forEach((node, index) => {
        let id = node.getAttribute('id');

        // If element doesn't have an ID, generate a temporary but stable one
        if (!id) {
          id = `${node.tagName.toLowerCase()}-${index + 1}`;
          node.setAttribute('id', id);
          hasChanged = true;
          missingIdCount++;
        }

        // Filter out typical styling elements like gradients/patterns
        if (id && !id.startsWith('grid') && !id.startsWith('gradient') && !id.startsWith('mask') && !id.startsWith('clip')) {
          ids.push(id);
        }
      });

      setAvailablePathIds(ids);
      setRawSvgInput(config.svgContent);

      // If we auto-generated IDs, we need to update the actual config content so they persist
      if (hasChanged) {
        const serializer = new XMLSerializer();
        const updatedSvg = serializer.serializeToString(doc);
        onChangeConfig({
          ...config,
          svgContent: updatedSvg
        });
      }
    } catch (e) {
      console.warn('SVG parse notice during loading', e);
    }
  }, [config.svgContent]);

  // Handle local SVG file selection
  const handleSvgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Simple sanitization to preserve nested IDs
        onChangeConfig({
          ...config,
          title: `Bản đồ: ${file.name.replace('.svg', '')}`,
          svgContent: text,
          regions: [], // Reset previous mapped nodes since vectors changed
        });
        setSelectedPathsForNewRegion([]);
        onSelectRegion(null);
      }
    };
    reader.readAsText(file);
  };

  // Drag over handler for drop area
  const [isDragOver, setIsDragOver] = useState(false);
  const handleSvgDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onChangeConfig({
            ...config,
            title: `Bản đồ: ${file.name.replace('.svg', '')}`,
            svgContent: text,
            regions: [],
          });
          setSelectedPathsForNewRegion([]);
          onSelectRegion(null);
        }
      };
      reader.readAsText(file);
    }
  };

  // Parse custom pasted SVG code directly
  const handleApplyRawSvg = () => {
    if (!rawSvgInput.trim()) return;
    onChangeConfig({
      ...config,
      svgContent: rawSvgInput,
    });
    setIsEditingRawSvg(false);
  };

  // Toggle path selection under builder flow
  const handleSelectPathId = (pathId: string) => {
    setSelectedPathsForNewRegion(prev => {
      if (prev.includes(pathId)) {
        return prev.filter(id => id !== pathId);
      } else {
        return [...prev, pathId];
      }
    });

    // Automatically check if this path already belongs to a region. If so, select that region to let users inspect it!
    const existingRegion = config.regions.find(r => r.pathIds.includes(pathId));
    if (existingRegion) {
      onSelectRegion(existingRegion.id);
    }
  };

  // Create a brand new mapped Region grouping
  const handleCreateRegion = () => {
    if (!newRegionName.trim() || selectedPathsForNewRegion.length === 0) return;

    const newId = `region-${Date.now()}`;
    const newRegion: RegionConfig = {
      id: newId,
      name: newRegionName.trim(),
      pathIds: [...selectedPathsForNewRegion],
      items: [],
      description: 'Nhập tóm tắt mô tả về địa danh này tại thanh quản lý bên phải...',
      fillColor: undefined, // Default from global settings
    };

    onChangeConfig({
      ...config,
      regions: [...config.regions, newRegion]
    });

    // Reset setup states and highlight the newly created region
    setNewRegionName('');
    setSelectedPathsForNewRegion([]);
    onSelectRegion(newId);
  };

  // Delete an entire region config
  const handleDeleteRegion = (regionId: string) => {
    onChangeConfig({
      ...config,
      regions: config.regions.filter(r => r.id !== regionId)
    });
    if (selectedRegionId === regionId) {
      onSelectRegion(null);
    }
  };

  // Modify currently selected Region attributes
  const updateActiveRegion = (updater: (region: RegionConfig) => RegionConfig) => {
    if (!selectedRegionId) return;
    onChangeConfig({
      ...config,
      regions: config.regions.map(r => r.id === selectedRegionId ? updater(r) : r)
    });
  };

  // Add a new content item/article to the active region
  const handleAddNewItem = () => {
    const newItem: DataItem = {
      id: `item-${Date.now()}`,
      title: 'Tiêu đề bài viết mới',
      description: 'Nội dung chi tiết giới thiệu về đặc sản, địa điểm du lịch, khách sạn hoặc lịch sử của danh lam thắng cảnh này. Bạn có thể soạn thảo nhiều dòng.',
      linkLabel: 'Xem chi tiết',
      linkUrl: ''
    };

    updateActiveRegion(region => ({
      ...region,
      items: [...region.items, newItem]
    }));
  };

  // Update specific field inside item
  const handleUpdateItemField = (itemId: string, field: keyof DataItem, value: string) => {
    updateActiveRegion(region => ({
      ...region,
      items: region.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };

  // Delete an item card
  const handleRemoveItem = (itemId: string) => {
    updateActiveRegion(region => ({
      ...region,
      items: region.items.filter(item => item.id !== itemId)
    }));
  };

  // Place interactive coordinates click handler
  const handleMapMarkerCoordsPlaced = (coords: { x: number; y: number }) => {
    if (!selectedRegionId) return;

    updateActiveRegion(region => {
      const updatedMarker: MarkerConfig = {
        id: `marker-${Date.now()}`,
        x: coords.x,
        y: coords.y,
        iconType: region.marker?.iconType || 'pin',
        label: region.marker?.label || region.name,
      };

      return {
        ...region,
        marker: updatedMarker
      };
    });

    setIsPlacingMarker(false);
  };

  const handleUpdateRegionMarkerField = (field: keyof MarkerConfig, value: any) => {
    updateActiveRegion(region => {
      if (!region.marker) return region;
      return {
        ...region,
        marker: {
          ...region.marker,
          [field]: value
        }
      };
    });
  };

  const handleRemoveMarker = () => {
    updateActiveRegion(region => {
      const { marker, ...rest } = region;
      return rest;
    });
  };

  // Save to WordPress System via AJAX
  const handleSaveToSystem = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const ajaxUrl = (window as any).jankxSvgMapData?.ajaxUrl || '/wp-admin/admin-ajax.php';
    const formData = new FormData();
    formData.append('action', 'svg_data_map_save_config');
    formData.append('config', JSON.stringify(config));

    try {
      const response = await fetch(ajaxUrl, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus({ type: 'success', msg: 'Đã lưu cấu hình bản đồ thành công!' });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(data.data?.message || 'Lỗi lưu dữ liệu');
      }
    } catch (e) {
      console.error(e);
      setSaveStatus({ type: 'error', msg: 'Lỗi: ' + (e as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  // Export full mapping setup to a JSON file (downloadable)
  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${config.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_mapping_config.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyClipboardJson = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  // Import custom Config from pasted JSON block
  const handleImportJson = () => {
    if (!jsonPasteValue.trim()) return;
    try {
      const parsed = JSON.parse(jsonPasteValue);
      if (parsed && typeof parsed === 'object' && parsed.svgContent && Array.isArray(parsed.regions)) {
        onChangeConfig(parsed);
        setShowJsonOverlay(false);
        setJsonPasteValue('');
        onSelectRegion(null);
      } else {
        alert('Cấu trúc file JSON không hợp lệ. Vui lòng kiểm tra lại cấu trúc thuộc tính.');
      }
    } catch (e) {
      alert('Lỗi định dạng JSON: ' + (e as Error).message);
    }
  };

  // UI section was removed from bottom as it was moved up
  // activeRegionObj is now declared at top of component

  return (
    <div id="builder-editor-root" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
      {/* 1. Left Action Bar Panel (SVG Upload & Vector ID parser list) */}
      <div className="xl:col-span-3 flex flex-col gap-5">

        {/* Workspace details & import */}
        <div className="bg-white border border-indigo-50/50 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-600" />
            Nguồn Bản Đồ (SVG)
          </h3>

          <div
            id="svg-dropzone"
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleSvgDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition cursor-pointer ${isDragOver
              ? 'bg-indigo-50/75 border-indigo-400'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
              }`}
          >
            <label className="cursor-pointer block">
              <input
                type="file"
                accept=".svg"
                onChange={handleSvgFileUpload}
                className="hidden"
              />
              <FileCode className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-700 block">Kéo thả file .svg vào đây</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Hoặc bấm để duyệt tập tin từ máy</span>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <button
              id="raw-svg-toggle"
              onClick={() => {
                setIsEditingRawSvg(!isEditingRawSvg);
                setRawSvgInput(config.svgContent);
              }}
              className="text-xs w-full py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              {isEditingRawSvg ? 'Đóng mã nguồn SVG' : 'Dán mã SVG trực tiếp'}
            </button>

            {isEditingRawSvg && (
              <div className="mt-2 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Dán Code SVG (&lt;svg&gt;...&lt;/svg&gt;):</label>
                <textarea
                  id="textarea-raw-svg"
                  className="w-full h-32 p-2 font-mono text-[10px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                  value={rawSvgInput}
                  onChange={(e) => setRawSvgInput(e.target.value)}
                  placeholder="Paste <svg>...</svg> content here..."
                />
                <button
                  id="btn-apply-raw-svg"
                  onClick={handleApplyRawSvg}
                  className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 rounded-lg text-center cursor-pointer"
                >
                  Áp dụng XML SVG
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vector Element path checklist selection */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              Các Vector Khả Dụng ({availablePathIds.length})
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 p-1 px-1.5 rounded font-mono font-bold">id="*"</span>
          </div>

          <div className="text-[11px] text-slate-500 mb-2 leading-relaxed">
            Hệ thống tự động phát hiện các thẻ vector chứa mã định danh <b>ID</b> trong file SVG của bạn. Click chọn các dòng dưới để gom nhóm:
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-1.5 pr-1 custom-scrollbar">
            {availablePathIds.length > 0 ? (
              availablePathIds.map(pathId => {
                const belongsToRegion = config.regions.find(r => r.pathIds.includes(pathId));
                const isSelectedForNew = selectedPathsForNewRegion.includes(pathId);

                return (
                  <button
                    key={pathId}
                    id={`vector-item-${pathId}`}
                    onClick={() => handleSelectPathId(pathId)}
                    className={`w-full text-left p-1.5 px-2.5 rounded-lg text-xs font-mono font-medium flex items-center justify-between gap-1 transition ${isSelectedForNew
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : belongsToRegion
                        ? 'bg-blue-50/70 text-blue-700 border border-blue-100 hover:bg-blue-100/50'
                        : 'bg-slate-50 border border-slate-100 hover:bg-slate-100/80 text-slate-600'
                      }`}
                  >
                    <span className="truncate">{pathId}</span>
                    {isSelectedForNew ? (
                      <span className="text-[9px] bg-purple-600 text-white rounded px-1">Chờ gộp ({selectedPathsForNewRegion.indexOf(pathId) + 1})</span>
                    ) : belongsToRegion ? (
                      <span className="text-[10px] text-blue-500 font-sans font-bold">→ {belongsToRegion.name}</span>
                    ) : (
                      <span className="text-[9px] bg-slate-200 text-slate-400 rounded px-1">Chưa gán</span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 italic">
                Không tìm thấy phần tử SVG nào có thuộc tính id. Hãy kiểm tra hoặc dán định dạng SVG mới chứa các thuộc tính id cho từng tỉnh/phân khu.
              </div>
            )}
          </div>

          {/* Quick Grouping form */}
          {selectedPathsForNewRegion.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 uppercase block mb-1">Gom Nhóm Mới ({selectedPathsForNewRegion.length} vectors)</span>
                <input
                  id="input-new-region-name"
                  type="text"
                  placeholder="Nhập tên địa danh..."
                  className="w-full text-xs p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                />

                <div className="mt-2 flex gap-1.5">
                  <button
                    id="btn-confirm-group"
                    onClick={handleCreateRegion}
                    disabled={!newRegionName.trim()}
                    className="flex-1 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 text-white font-bold text-xs p-1.5 rounded-lg text-center cursor-pointer transition"
                  >
                    Định vị nhóm
                  </button>
                  <button
                    id="btn-cancel-group"
                    onClick={() => setSelectedPathsForNewRegion([])}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs p-1.5 rounded-lg text-center cursor-pointer"
                  >
                    Hùy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Interactive Map Builder Container */}
      <div className="xl:col-span-6 flex flex-col gap-4">

        {/* Editor map controller */}
        <div className="bg-white border border-indigo-50/50 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 px-1.5 rounded bg-amber-50 text-amber-600 font-bold text-[10px]">BUILDER WORKSPACE</span>
              <input
                id="edit-map-title"
                type="text"
                className="font-bold text-lg text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:bg-slate-50 px-1 rounded transition"
                value={config.title}
                onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
              />
            </div>
            <input
              id="edit-map-desc"
              type="text"
              placeholder="Nhập mô tả của bản đồ cấu hình..."
              className="text-xs text-slate-500 mt-1 w-full border-b border-transparent hover:border-slate-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5 rounded transition"
              value={config.description}
              onChange={(e) => onChangeConfig({ ...config, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button
              id="btn-save-system"
              onClick={handleSaveToSystem}
              disabled={isSaving}
              className="p-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu Hệ Thống'}
            </button>
            <button
              id="btn-show-json-import"
              onClick={() => setShowJsonOverlay(true)}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Nhập JSON cấu hình"
            >
              <FileCode className="w-4 h-4" /> Import JSON
            </button>
            <button
              id="btn-export-json-config"
              onClick={handleExportJson}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/10"
              title="Xuất JSON cấu hình"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className={`p-3 rounded-xl text-xs font-bold animate-in ${saveStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
            {saveStatus.msg}
          </div>
        )}

        {/* Map panel */}
        <div className="relative h-[530px]">
          <SVGMapContainer
            config={config}
            selectedRegionId={selectedRegionId}
            onSelectRegion={onSelectRegion}
            isBuilderMode={true}
            onSelectPathId={handleSelectPathId}
            onPlaceMarkerCoords={handleMapMarkerCoordsPlaced}
            selectedPathIdsForGrouping={selectedPathsForNewRegion}
            isPlacingMarker={isPlacingMarker}
          />

          {/* Overlay indicator for marker placing state */}
          {isPlacingMarker && (
            <div className="absolute inset-x-0 top-0 bg-orange-500/90 text-white text-xs font-semibold py-2 px-4 shadow text-center animate-fade-in flex items-center justify-center gap-2 z-30">
              <span className="animate-pulse">📍 Chế độ ghim cờ: Vui lòng click chọn một tọa độ trên bản đồ để đặt Marker...</span>
              <button
                id="btn-cancel-place"
                onClick={() => setIsPlacingMarker(false)}
                className="bg-white text-orange-600 font-bold px-2 py-0.5 rounded text-[10px] hover:bg-orange-50 transition"
              >
                Hủy chế độ ghim
              </button>
            </div>
          )}
        </div>

        {/* Settings options panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-500" />
            Cấu Hình Màu Sắc & Hiệu ứng Bản Đồ (Global Theme)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Màu mặc định nền:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.settings.defaultFillColor}
                  onChange={(e) => onChangeConfig({
                    ...config,
                    settings: { ...config.settings, defaultFillColor: e.target.value }
                  })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono">{config.settings.defaultFillColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Màu di chuột (Hover):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.settings.hoverFillColor}
                  onChange={(e) => onChangeConfig({
                    ...config,
                    settings: { ...config.settings, hoverFillColor: e.target.value }
                  })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono">{config.settings.hoverFillColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Màu chọn (Select):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.settings.selectedFillColor}
                  onChange={(e) => onChangeConfig({
                    ...config,
                    settings: { ...config.settings, selectedFillColor: e.target.value }
                  })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono">{config.settings.selectedFillColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Màu mốc cờ (Marker):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.settings.markerColor}
                  onChange={(e) => onChangeConfig({
                    ...config,
                    settings: { ...config.settings, markerColor: e.target.value }
                  })}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer"
                />
                <span className="text-xs font-mono">{config.settings.markerColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Panel Sidebar: Selected Region Details & Content Cards Editor */}
      <div className="xl:col-span-3 flex flex-col gap-5">

        {/* Regions list sidebar quick select */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Danh Sách Địa Danh ({config.regions.length})
          </h3>

          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {config.regions.length > 0 ? (
              config.regions.map(region => (
                <div
                  key={region.id}
                  className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs font-medium cursor-pointer transition ${selectedRegionId === region.id
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  onClick={() => onSelectRegion(region.id)}
                >
                  <span className="truncate">{region.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">📦 {region.items.length} cards</span>
                    <button
                      id={`btn-delete-region-${region.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRegion(region.id);
                      }}
                      className="p-1 hover:text-red-655 hover:bg-neutral-50 rounded transition shrink-0"
                      title="Xóa địa danh này"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-3 text-xs italic text-slate-400">
                Chưa gán địa danh nào. Chọn vector bên trái để gán.
              </div>
            )}
          </div>
        </div>

        {/* Selected Area/Region Editor form */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex-1 flex flex-col min-h-[400px]">
          {activeRegionObj ? (
            <div className="flex flex-col h-full justify-between gap-4">
              <div className="space-y-4 overflow-y-auto pr-1 max-h-[480px] custom-scrollbar flex-1">
                <div className="border-b border-indigo-50/50 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded font-mono">Đang soạn thảo</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {activeRegionObj.id}</span>
                  </div>

                  {/* Region name */}
                  <input
                    id="edit-region-title"
                    type="text"
                    className="w-full text-lg font-bold text-slate-800 focus:outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 mt-2 px-1 rounded bg-slate-50/50"
                    value={activeRegionObj.name}
                    onChange={(e) => updateActiveRegion(r => ({ ...r, name: e.target.value }))}
                  />

                  {/* Path indicators */}
                  <div className="mt-1 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Liên kết path:</span>
                    {activeRegionObj.pathIds.map(pathId => (
                      <span
                        key={pathId}
                        className="bg-purple-50 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-mono flex items-center gap-1 border border-purple-100"
                      >
                        {pathId}
                        <button
                          id={`remove-path-${pathId}`}
                          onClick={() => {
                            updateActiveRegion(r => ({
                              ...r,
                              pathIds: r.pathIds.filter(id => id !== pathId)
                            }));
                          }}
                          className="hover:text-red-600 transition font-bold"
                          title="Hủy gán path"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* WordPress Data Binding (Taxonomy/Term) */}
                {useSelect && (
                  <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase flex items-center gap-1">
                        <Database className="w-3.5 h-3.5" />
                        Liên kết Dữ liệu WordPress
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Chọn Phân loại (Taxonomy):</label>
                        <select
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
                          value={selectedTaxonomy}
                          onChange={(e) => updateActiveRegion(r => ({ ...r, taxonomy: e.target.value, termId: undefined }))}
                        >
                          <option value="category">Chuyên mục (Category)</option>
                          <option value="post_tag">Thẻ (Tag)</option>
                          {taxonomies?.filter((tax: any) => !['category', 'post_tag'].includes(tax.slug)).map((tax: any) => (
                            <option key={tax.slug} value={tax.slug}>{tax.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Chọn Term (Địa danh / Mốc):</label>
                        {!terms ? (
                          <div className="py-2 text-center text-[10px] text-slate-400 italic">Đang tải dữ liệu...</div>
                        ) : (
                          <select
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
                            value={activeRegionObj?.termId || ''}
                            onChange={(e) => updateActiveRegion(r => ({ ...r, termId: parseInt(e.target.value) }))}
                          >
                            <option value="">-- Chọn một term --</option>
                            {terms.map((term: any) => (
                              <option key={term.id} value={term.id}>{term.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )}


                {/* Subtitle / summary */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mô tả ngắn địa danh:</label>
                  <textarea
                    id="edit-region-desc"
                    className="w-full text-xs p-2.5 border border-indigo-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                    rows={2}
                    placeholder="Mô tả tóm tắt tổng quan về vùng..."
                    value={activeRegionObj.description || ''}
                    onChange={(e) => updateActiveRegion(r => ({ ...r, description: e.target.value }))}
                  />
                </div>

                {/* Map interact marker coordinate mapping */}
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      Tọa độ ghim Marker (Cờ)
                    </span>
                    {activeRegionObj.marker ? (
                      <button
                        id="btn-remove-region-marker"
                        onClick={handleRemoveMarker}
                        className="text-[9px] hover:text-red-600 transition"
                      >
                        Xóa mốc ghim
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Chưa gờ</span>
                    )}
                  </div>

                  {activeRegionObj.marker ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Tọa độ mốc:</span>
                        <div className="font-mono text-[10px] font-semibold text-slate-700">
                          X: {activeRegionObj.marker.x}% | Y: {activeRegionObj.marker.y}%
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-400 block font-sans">Loại Icon:</span>
                        <select
                          id="select-region-marker-icon"
                          className="p-1 px-1.5 border border-slate-200 text-[10px] rounded focus:outline-none w-full bg-white font-bold"
                          value={activeRegionObj.marker.iconType}
                          onChange={(e) => handleUpdateRegionMarkerField('iconType', e.target.value as MarkerIconType)}
                        >
                          <option value="pin">📍 Ghim Bản đồ</option>
                          <option value="transport">🚌 Giao thông</option>
                          <option value="hotel">🛌 Khách sạn</option>
                          <option value="food">🍽️ Ẩm thực</option>
                          <option value="scenic">📷 Danh thắng</option>
                        </select>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[9px] text-slate-400 block">Nhãn hiển thị (Label):</span>
                        <input
                          id="input-region-marker-label"
                          type="text"
                          className="w-full p-1 px-2 border border-slate-200 text-[10px] rounded focus:outline-none bg-white"
                          value={activeRegionObj.marker.label || ''}
                          onChange={(e) => handleUpdateRegionMarkerField('label', e.target.value)}
                        />
                      </div>

                      <button
                        id="btn-trigger-relocate-marker"
                        onClick={() => setIsPlacingMarker(true)}
                        className="col-span-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-850 font-bold text-[10px] text-center rounded transition cursor-pointer"
                      >
                        📍 Thay đổi vị trí ghim
                      </button>
                    </div>
                  ) : (
                    <button
                      id="btn-trigger-init-marker"
                      onClick={() => setIsPlacingMarker(true)}
                      className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center rounded-lg transition cursor-pointer shadow-sm shadow-orange-500/10 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm mốc ghim trên bản đồ
                    </button>
                  )}
                </div>

                {/* Content Cards loop */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 uppercase">Thẻ dữ liệu bài viết ({activeRegionObj.items.length})</span>
                    <button
                      id="btn-add-region-item-card"
                      onClick={handleAddNewItem}
                      className="text-white bg-indigo-600 hover:bg-indigo-700 font-bold p-1 px-1.5 rounded text-[10px] flex items-center gap-0.5 cursor-pointer shadow-sm shadow-indigo-500/10"
                    >
                      <Plus className="w-3 h-3" /> Thêm card
                    </button>
                  </div>

                  <div className="space-y-3">
                    {activeRegionObj.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3 border border-indigo-50 bg-slate-50/50 rounded-xl relative space-y-2 text-left"
                      >
                        <button
                          id={`btn-remove-item-${item.id}`}
                          onClick={() => handleRemoveItem(item.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition"
                          title="Xóa card này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Tiêu đề thẻ {index + 1}:</span>
                          <input
                            id={`input-item-title-${item.id}`}
                            type="text"
                            className="w-full p-1.5 border border-indigo-50 focus:border-indigo-500 text-xs rounded focus:outline-none bg-white font-semibold"
                            value={item.title}
                            onChange={(e) => handleUpdateItemField(item.id, 'title', e.target.value)}
                          />
                        </div>

                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Mô tả (Description):</span>
                          <textarea
                            id={`textarea-item-desc-${item.id}`}
                            className="w-full text-[11px] p-2 border border-indigo-50 focus:border-indigo-500 rounded focus:outline-none bg-white leading-relaxed"
                            rows={3}
                            value={item.description}
                            onChange={(e) => handleUpdateItemField(item.id, 'description', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Nhãn Link:</span>
                            <input
                              id={`input-item-label-${item.id}`}
                              type="text"
                              className="w-full p-1 border border-indigo-50 focus:border-indigo-500 rounded focus:outline-none bg-white font-sans text-[10px]"
                              value={item.linkLabel || ''}
                              onChange={(e) => handleUpdateItemField(item.id, 'linkLabel', e.target.value)}
                            />
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Địa chỉ URL Link:</span>
                            <input
                              id={`input-item-url-${item.id}`}
                              type="text"
                              className="w-full p-1 border border-indigo-50 focus:border-indigo-500 rounded focus:outline-none bg-white font-mono text-[9px]"
                              value={item.linkUrl || ''}
                              placeholder="https://..."
                              onChange={(e) => handleUpdateItemField(item.id, 'linkUrl', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action notice helper bottom */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11pt] text-slate-400">
                <span>Trạng thái: Tự động lưu trữ nội bộ</span>
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">● Hoạt động</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Layers className="w-10 h-10 text-slate-350 mb-2" />
              <p className="text-xs font-semibold text-slate-600">Chưa chọn địa danh nào</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Hãy click chọn một tỉnh thành/vùng trên bản đồ hoặc chọn một danh mục trong list phía trên để bắt đầu gán dữ liệu chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* JSON Import Overlay modal */}
      {showJsonOverlay && (
        <div id="json-modal-overlay" className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                Nhập Cấu hình Bản Đồ JSON
              </h3>
              <button
                id="btn-close-json-modal"
                onClick={() => setShowJsonOverlay(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 px-2.5 rounded hover:bg-slate-150 transition"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-2 text-left">
              <p className="text-xs text-slate-500 leading-relaxed">
                Địa chỉ tải các file JSON đã xuất trước đó để thiết lập nhanh, gán đè toàn bộ cấu trúc bản đồ, định danh và các markers:
              </p>

              <textarea
                id="textarea-json-paste"
                className="w-full h-64 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 font-mono text-[11px] leading-relaxed"
                placeholder='Dán cấu trúc JSON chứa properties "svgContent", "regions" và "settings" tại đây...'
                value={jsonPasteValue}
                onChange={(e) => setJsonPasteValue(e.target.value)}
              />
            </div>

            <div className="p-5 border-t border-slate-150 bg-slate-50 flex justify-end gap-2 text-xs">
              <button
                id="btn-cancel-import-action"
                onClick={() => setShowJsonOverlay(false)}
                className="p-2 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-bold transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                id="btn-confirm-import-action"
                onClick={handleImportJson}
                disabled={!jsonPasteValue.trim()}
                className="p-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-500/10"
              >
                Nhập Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating toast notification for copy/export events */}
      {exportNotice && (
        <div id="toast-notify" className="fixed bottom-6 right-6 z-[200] bg-slate-900 border border-slate-800 text-white p-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-slide-up text-xs font-semibold">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Sao chép / Xuất cấu hình JSON thành công!</span>
        </div>
      )}
    </div>
  );
}
