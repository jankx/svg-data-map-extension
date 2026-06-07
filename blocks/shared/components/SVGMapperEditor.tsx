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
  FileCode,
  Check,
  Info,
  ChevronRight,
  ArrowRight,
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

  // Raw SVG edit area toggle (moved to settings panel)
  const [isEditingRawSvg, setIsEditingRawSvg] = useState(false);
  const [rawSvgInput, setRawSvgInput] = useState('');

  // Saving state

  // Active Region being inspected in sidebar panel
  const activeRegionObj = config.regions.find(r => r.id === selectedRegionId) || null;

  // WP Taxonomy/Term data

  // WP Taxonomy/Term data
  const postTypes = useSelect ? useSelect((select: any) => {
    return select('core').getPostTypes({ per_page: -1 });
  }, []) : [];

  const taxonomies = useSelect ? useSelect((select: any) => {
    return select('core').getTaxonomies({ per_page: -1 });
  }, []) : [];

  const selectedPostType = activeRegionObj?.postType || 'post';
  const selectedTaxonomy = activeRegionObj?.taxonomy || '';

  // Filter taxonomies based on selected post type
  const filteredTaxonomies = taxonomies ? taxonomies.filter((tax: any) => {
    return tax.types && tax.types.includes(selectedPostType);
  }) : [];

  const terms = useSelect ? useSelect((select: any) => {
    if (!selectedTaxonomy) return [];
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

  // Parse custom pasted SVG code directly (kept for direct paste feature)
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

  // Handle drag-to-reposition marker: save the pixel offset on the marker config
  const handleMarkerDragged = (regionId: string, offsetX: number, offsetY: number) => {
    onChangeConfig({
      ...config,
      regions: config.regions.map(r =>
        r.id === regionId && r.marker
          ? { ...r, marker: { ...r.marker, markerOffsetX: offsetX, markerOffsetY: offsetY } }
          : r
      )
    });
  };

  // Export full mapping setup to a JSON file (downloadable)
  // JSON import/export handlers moved to App.tsx settings panel

  // UI section was removed from bottom as it was moved up
  // activeRegionObj is now declared at top of component

  return (
    <div id="builder-editor-root" className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch h-full p-4 overflow-hidden">
      {/* 1. Left Action Bar Panel (Vector ID parser list only - export/import moved to settings) */}
      <div className="xl:col-span-3 flex flex-col gap-4 h-full min-w-0">

        {/* Vector Element path checklist selection */}
        <div className="bg-white border border-slate-100 rounded-xl p-3 flex-1 flex flex-col min-h-[200px]">
          <div className="flex items-center justify-between mb-2.5 border-b border-slate-50 pb-1.5">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-tight flex items-center gap-2">
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
        </div>

        {/* Sticky Quick Grouping panel — outside the scrollable list, anchored to bottom of card */}
        {selectedPathsForNewRegion.length > 0 && (
          <div className="sticky bottom-0 z-20 mt-2">
            <div className="bg-purple-50/95 backdrop-blur-sm rounded-xl p-3 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-purple-700 uppercase flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-purple-600 text-white text-[8px] font-bold">{selectedPathsForNewRegion.length}</span>
                  Gom Nhóm Mới
                </span>
                <span className="text-[9px] text-purple-500 italic">{selectedPathsForNewRegion.join(', ').slice(0, 40)}{selectedPathsForNewRegion.join(', ').length > 40 ? '...' : ''}</span>
              </div>
              <input
                id="input-new-region-name"
                type="text"
                placeholder="Nhập tên địa danh..."
                className="w-full text-xs p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white"
                value={newRegionName}
                onChange={(e) => setNewRegionName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newRegionName.trim()) handleCreateRegion(); }}
                autoFocus
              />
              <div className="mt-2 flex gap-1.5">
                <button
                  id="btn-confirm-group"
                  onClick={handleCreateRegion}
                  disabled={!newRegionName.trim()}
                  className="flex-1 bg-purple-600 disabled:opacity-50 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs p-1.5 rounded-lg text-center cursor-pointer transition-all"
                >
                  ✓ Định vị nhóm
                </button>
                <button
                  id="btn-cancel-group"
                  onClick={() => {
                    setSelectedPathsForNewRegion([]);
                    setNewRegionName('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs p-1.5 rounded-lg text-center cursor-pointer transition-all"
                >
                  ✗ Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Middle Interactive Map Builder Container - full height */}
      <div className="xl:col-span-6 flex flex-col h-full gap-4 min-w-0">

        {/* Editor map controller */}
        <div className="bg-white border border-indigo-50/50 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="p-0.5 px-1.5 rounded bg-amber-50 text-amber-600 font-bold text-[9px]">BUILDER WORKSPACE</span>
              <input
                id="edit-map-title"
                type="text"
                className="font-bold text-base text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:bg-slate-50 px-1 rounded transition w-full"
                value={config.title}
                onChange={(e) => onChangeConfig({ ...config, title: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Map panel - full height 100% */}
        <div className="relative flex-1 h-full min-h-[500px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
          <SVGMapContainer
            config={config}
            selectedRegionId={selectedRegionId}
            onSelectRegion={onSelectRegion}
            isBuilderMode={true}
            onSelectPathId={handleSelectPathId}
            onPlaceMarkerCoords={handleMapMarkerCoordsPlaced}
            onMarkerDragged={handleMarkerDragged}
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

      </div>

      {/* 3. Right Panel Sidebar: Selected Region Details & Content Cards Editor */}
      <div className="xl:col-span-3 flex flex-col gap-5 h-full min-w-0">

        {/* Regions list sidebar quick select */}
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-tight mb-2 flex items-center gap-2">
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
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex-1 flex flex-col min-h-[400px]">
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
                    className="w-full text-base font-bold text-slate-800 focus:outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 mt-1.5 px-1 rounded bg-slate-50/50"
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
                        <label className="text-[9px] text-slate-400 block mb-1">Chọn Post Type:</label>
                        <select
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
                          value={selectedPostType}
                          onChange={(e) => updateActiveRegion(r => ({
                            ...r,
                            postType: e.target.value,
                            taxonomy: '', // Reset taxonomy when post type changes
                            termId: undefined
                          }))}
                        >
                          <option value="">-- Chọn post type --</option>
                          {postTypes?.filter((pt: any) => pt.viewable).map((pt: any) => (
                            <option key={pt.slug} value={pt.slug}>{pt.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Chọn Phân loại (Taxonomy):</label>
                        <select
                          className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
                          value={selectedTaxonomy}
                          onChange={(e) => updateActiveRegion(r => ({ ...r, taxonomy: e.target.value, termId: undefined }))}
                        >
                          <option value="">-- Chọn taxonomy --</option>
                          {filteredTaxonomies.map((tax: any) => (
                            <option key={tax.slug} value={tax.slug}>{tax.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Chọn Term (Địa danh / Mốc):</label>
                        {!terms && selectedTaxonomy ? (
                          <div className="py-2 text-center text-[10px] text-slate-400 italic">Đang tải dữ liệu...</div>
                        ) : (
                          <select
                            className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white"
                            value={activeRegionObj?.termId || ''}
                            onChange={(e) => updateActiveRegion(r => ({ ...r, termId: parseInt(e.target.value) }))}
                          >
                            <option value="">-- Chọn một term --</option>
                            {terms?.map((term: any) => (
                              <option key={term.id} value={term.id}>{term.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Marker Coordinates */}
                <div className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-orange-700 uppercase flex items-center gap-1">
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
                      <button
                        id="btn-place-marker"
                        onClick={() => setIsPlacingMarker(true)}
                        className="text-[9px] bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded transition font-bold"
                      >
                        📍 Ghim cờ
                      </button>
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
                          <option value="jankx">🏛️ Jankx Library...</option>
                        </select>
                      </div>

                      {activeRegionObj.marker.iconType === 'jankx' && (
                        <div className="col-span-2">
                          <span className="text-[9px] text-slate-400 block">Tên Icon (Jankx Library):</span>
                          <input
                            id="input-region-marker-custom-icon"
                            type="text"
                            className="w-full p-1.5 border border-slate-200 text-[10px] rounded focus:outline-none focus:border-indigo-400 bg-white font-mono"
                            value={activeRegionObj.marker.customIconName || ''}
                            onChange={(e) => handleUpdateRegionMarkerField('customIconName', e.target.value)}
                            placeholder="Tên icon (ví dụ: home, menu, search...)"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-[10px] text-slate-400 italic">
                      Chưa gán marker. Click "Ghim cờ" để đặt marker trên bản đồ.
                    </div>
                  )}
                </div>

                {/* Color customization */}
                <div className="bg-slate-50/50 border border-slate-200 p-3 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-700 uppercase">Màu sắc hiển thị</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block mb-1">Màu nền (Hover):</label>
                      <input
                        type="color"
                        value={activeRegionObj.fillColor || config.settings.hoverFillColor || '#93c5fd'}
                        onChange={(e) => updateActiveRegion(r => ({ ...r, fillColor: e.target.value }))}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mô tả:</label>
                  <textarea
                    id="edit-region-description"
                    rows={3}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 bg-slate-50 resize-none"
                    placeholder="Nhập mô tả chi tiết về địa danh này..."
                    value={activeRegionObj.description}
                    onChange={(e) => updateActiveRegion(r => ({ ...r, description: e.target.value }))}
                  />
                </div>

                {/* Data Cards Management */}
                <div className="bg-green-50/50 border border-green-100 p-3 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-green-700 uppercase flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" />
                      Thông tin bổ sung
                    </span>
                    <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">{activeRegionObj.items.length} items</span>
                  </div>

                  {activeRegionObj.items.length > 0 ? (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                      {activeRegionObj.items.map((item, index) => (
                        <div key={index} className="bg-white p-2 rounded-lg border border-green-100 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700">{item.label}</span>
                            <button
                              onClick={() => updateActiveRegion(r => ({
                                ...r,
                                items: r.items.filter((_, i) => i !== index)
                              }))}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[10px] text-slate-400 italic">
                      Chưa có thông tin bổ sung.
                    </div>
                  )}
                </div>
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

      {/* JSON Import/Export moved to App.tsx settings panel */}
    </div>
  );
}
