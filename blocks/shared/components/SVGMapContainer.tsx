/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  SVGMapConfig,
  RegionConfig,
  MarkerIconType
} from '../types';
import {
  Bus,
  Bed,
  Utensils,
  Camera,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Maximize2
} from 'lucide-react';

interface SVGMapContainerProps {
  config: SVGMapConfig;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  // Builder specific props
  isBuilderMode?: boolean;
  onSelectPathId?: (pathId: string) => void;
  onPlaceMarkerCoords?: (coords: { x: number; y: number }) => void;
  onMarkerDragged?: (regionId: string, offsetX: number, offsetY: number) => void;
  selectedPathIdsForGrouping?: string[];
  isPlacingMarker?: boolean;
  // Zoom state props for Gutenberg persistence
  zoomScale?: number;
  zoomPositionX?: number;
  zoomPositionY?: number;
  onZoomChange?: (zoomState: { scale: number; positionX: number; positionY: number }) => void;
  isGutenberg?: boolean;
}

export function SVGMapContainer({
  config,
  selectedRegionId,
  onSelectRegion,
  isBuilderMode = false,
  onSelectPathId,
  onPlaceMarkerCoords,
  onMarkerDragged,
  selectedPathIdsForGrouping = [],
  isPlacingMarker = false,
  zoomScale = 1,
  zoomPositionX = 0,
  zoomPositionY = 0,
  onZoomChange,
  isGutenberg = false,
}: SVGMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredPathId, setHoveredPathId] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<RegionConfig | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Pan and Zoom States
  const [scale, setScale] = useState(zoomScale);
  const [position, setPosition] = useState({ x: zoomPositionX, y: zoomPositionY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Sync zoom state with props when in Gutenberg mode
  useEffect(() => {
    if (isGutenberg) {
      setScale(zoomScale);
      setPosition({ x: zoomPositionX, y: zoomPositionY });
    }
  }, [zoomScale, zoomPositionX, zoomPositionY, isGutenberg]);

  // Save zoom state to block attributes when in Gutenberg mode
  const handleZoomStateChange = (newScale: number, newPosition: { x: number; y: number }) => {
    setScale(newScale);
    setPosition(newPosition);
    if (isGutenberg && onZoomChange) {
      onZoomChange({ scale: newScale, positionX: newPosition.x, positionY: newPosition.y });
    }
  };

  // Reset pan and zoom when svg change (only in non-Gutenberg mode or when not persisted)
  useEffect(() => {
    if (!isGutenberg) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [config.svgContent, isGutenberg]);

  // Find region by path ID
  const findRegionByPathId = (pathId: string): RegionConfig | null => {
    if (!pathId) return null;
    return config.regions.find(r => r.pathIds.includes(pathId)) || null;
  };

  // Find path details to show tooltip on hover
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as SVGElement;
    const pathId = target.getAttribute('id');
    if (pathId) {
      setHoveredPathId(pathId);
      const region = findRegionByPathId(pathId);
      setHoveredRegion(region);

      // Calculate tooltip position relative to container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: e.clientX - rect.left + 15,
          y: e.clientY - rect.top + 15,
        });
      }
    } else {
      setHoveredPathId(null);
      setHoveredRegion(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && (hoveredPathId || hoveredRegion)) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPathId(null);
    setHoveredRegion(null);
  };

  // Click handler using event delegation
  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation and prevent default to prevent Gutenberg conflicts
    if (isGutenberg) {
      e.stopPropagation();
      e.preventDefault();
    }

    // If placing marker in builder mode, capture click coordinates first!
    if (isBuilderMode && isPlacingMarker && onPlaceMarkerCoords && svgWrapperRef.current) {
      const rect = svgWrapperRef.current.getBoundingClientRect();
      // Calculate % relative coordinates inside the SVG
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onPlaceMarkerCoords({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
      return;
    }

    const target = e.target as SVGElement;
    const pathId = target.getAttribute('id');

    if (!pathId) {
      // Clicked on background, deselect unless we dragging or in special mode
      if (!isDragging) {
        onSelectRegion(null);
      }
      return;
    }

    if (isBuilderMode && onSelectPathId) {
      onSelectPathId(pathId);
    }

    const matchedRegion = findRegionByPathId(pathId);
    if (matchedRegion) {
      onSelectRegion(matchedRegion.id === selectedRegionId ? null : matchedRegion.id);
    } else if (!isBuilderMode) {
      onSelectRegion(null);
    }
  };

  // Drag listeners for Map Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Stop propagation and prevent default to prevent Gutenberg from dragging the whole block
    if (isGutenberg) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Only permit dragging if we are NOT in marker placement mode, or if clicking middle mouse / space
    if (isPlacingMarker) return;

    // Check if target is a button or input to not disrupt UI
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-drag')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleDragMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    if (isGutenberg) {
      e.stopPropagation();
      e.preventDefault();
    }

    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    handleZoomStateChange(scale, newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Stop propagation to prevent Gutenberg conflicts
    if (isGutenberg) {
      e.stopPropagation();
    }
    const zoomFactor = 0.05;
    let newScale = scale + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
    newScale = Math.max(0.5, Math.min(5, newScale));
    handleZoomStateChange(newScale, position);
  };

  const handleZoomIn = () => handleZoomStateChange(Math.min(5, scale + 0.25), position);
  const handleZoomOut = () => handleZoomStateChange(Math.max(0.5, scale - 0.25), position);
  const handleResetView = () => {
    handleZoomStateChange(1, { x: 0, y: 0 });
  };

  const getMarkerIcon = (type: MarkerIconType, size = 20) => {
    const s = size;
    switch (type) {
      case 'transport':
        return <Bus style={{ width: s, height: s }} className="text-white" id="icon-bus" />;
      case 'hotel':
        return <Bed style={{ width: s, height: s }} className="text-white" id="icon-bed" />;
      case 'food':
        return <Utensils style={{ width: s, height: s }} className="text-white" id="icon-food" />;
      case 'scenic':
        return <Camera style={{ width: s, height: s }} className="text-white" id="icon-camera" />;
      case 'pin':
      default:
        return <MapPin style={{ width: s, height: s }} className="text-white" id="icon-pin" />;
    }
  };

  // Build reactive CSS styles to override SVG element fills according to configuration parameters
  const generateStyleSheets = (): string => {
    const defaultColor = config.settings?.defaultFillColor || '#e2edf5';
    const hoverColor = config.settings?.hoverFillColor || '#93c5fd';
    const selectedColor = config.settings?.selectedFillColor || '#3b82f6';

    let css = `
      #vietnam-regions path, #vietnam-regions circle, #exhibition-zones rect, #exhibition-zones path,
      svg path, svg circle, svg rect, svg polygon {
        fill: ${defaultColor} !important;
        transition: fill 0.2s ease, opacity 0.2s ease, stroke-width 0.2s ease;
      }
    `;

    // 1. Group custom styling for regions
    config.regions.forEach(region => {
      const isSelected = selectedRegionId === region.id;
      const baseColor = region.fillColor || defaultColor;
      const regionHoverColor = region.hoverFillColor || hoverColor;

      region.pathIds.forEach(pathId => {
        if (isSelected) {
          css += `
            #${pathId} {
              fill: ${selectedColor} !important;
              stroke: #ffffff !important;
              stroke-width: 3px !important;
              opacity: 1 !important;
            }
          `;
        } else {
          css += `
            #${pathId} {
              fill: ${baseColor} !important;
              opacity: 0.85;
            }
            #${pathId}:hover {
              fill: ${regionHoverColor} !important;
              opacity: 1 !important;
            }
          `;
        }
      });
    });

    // 2. Select visual items highlight in Builder Mode (under grouping workflow)
    if (isBuilderMode && selectedPathIdsForGrouping.length > 0) {
      selectedPathIdsForGrouping.forEach(id => {
        css += `
          #${id} {
            fill: #9553e6 !important;
            stroke: #ffffff !important;
            stroke-width: 2.5px !important;
            opacity: 1 !important;
          }
        `;
      });
    }

    // 3. Hover global logic (fallback for non-mapped paths)
    css += `
      path:hover, circle:hover, rect:hover {
        fill: ${hoverColor} !important;
        opacity: 1 !important;
        cursor: pointer;
      }
    `;
    // 4. Marker Animations (Global definition for utility class)
    css += `
      @keyframes jankx-mark-pulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
        100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
      }
      .jankx-marker-pulse::before {
        content: "";
        position: absolute;
        top: 18px;
        left: 50%;
        width: 36px;
        height: 36px;
        background-color: ${config.settings.markerColor || '#3b82f6'};
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
        animation: jankx-mark-pulse 2s infinite;
        opacity: 0;
      }
    `;

    return css;
  };

  return (
    <div
      id="map-container-root"
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden bg-slate-50 border border-slate-200/80 shadow-inner min-h-[500px]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleDragMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : isPlacingMarker ? 'crosshair' : 'grab' }}
    >
      {/* 1. Style Injector block */}
      <style dangerouslySetInnerHTML={{ __html: generateStyleSheets() }} />

      {/* 2. Interactive SVG Canvas Frame with zoom and pan transform applied */}
      <div
        id="svg-viewport"
        ref={svgWrapperRef}
        className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
        onClick={handleSvgClick}
        onMouseOver={handleMouseOver}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="relative w-full h-full max-w-full max-h-full flex items-center justify-center p-4 pointer-events-auto"
          dangerouslySetInnerHTML={{ __html: config.svgContent }}
        />

        {/* 3. Interactive Floating Coordinate Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {config.regions.map(region => {
            if (!region.marker) return null;
            const isSelected = selectedRegionId === region.id;
            const markerColor = config.settings?.markerColor || '#f97316';

            const pathId = region.pathIds?.[0];

            return (
              <MarkerDataComponent
                key={region.marker.id}
                region={region}
                pathId={pathId}
                isSelected={isSelected}
                markerColor={markerColor}
                config={config}
                svgWrapperRef={svgWrapperRef}
                onSelectRegion={onSelectRegion}
                getMarkerIcon={getMarkerIcon}
                scale={scale}
                isBuilderMode={isBuilderMode}
                onMarkerDragged={onMarkerDragged}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Controls overlays in corner */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg border border-slate-100 shadow-md no-drag">
        <button
          id="btn-zoom-in"
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Phóng to"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-out"
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition"
          title="Thu nhỏ"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          id="btn-zoom-reset"
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition border-t border-slate-100"
          title="Đặt lại góc nhìn"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Helper legend overlay in corner (only in Gutenberg/Builder mode) */}
      {isGutenberg && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-2 rounded-lg border border-slate-100 shadow-md no-drag max-w-xs text-[11px] text-slate-500 flex flex-col gap-1.5">
          <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Hướng dẫn thao tác
          </span>
          <div className="flex flex-col gap-0.5 leading-relaxed">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Cuộn chuột: Phóng to / Thu nhỏ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Kéo chuột: Di chuyển bản đồ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2 rounded bg-blue-300"></span> Click địa danh: Xem chi tiết
            </div>
          </div>
        </div>
      )}

      {/* 5. Rich Hover Tooltip info card (only in Gutenberg/Builder mode) */}
      {isGutenberg && (hoveredPathId || hoveredRegion) && (
        <div
          id="svg-map-tooltip"
          className="absolute z-50 pointer-events-none p-3 bg-slate-900/95 backdrop-blur-sm text-white rounded-lg shadow-xl border border-slate-800 max-w-xs transition-opacity duration-150 text-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="font-bold text-sm text-blue-300 flex items-center gap-1.5 justify-between">
            <span>{hoveredRegion ? hoveredRegion.name : `Vector: #${hoveredPathId}`}</span>
            {hoveredRegion && (
              <span className="text-[10px] bg-slate-800 px-1 py-0.5 rounded text-slate-400">Đã định danh</span>
            )}
          </div>

          {hoveredRegion?.description ? (
            <p className="mt-1 text-slate-300 text-[11px] line-clamp-3 leading-relaxed">{hoveredRegion.description}</p>
          ) : (
            <p className="mt-1 text-slate-400 text-[11px] italic">
              {isBuilderMode ? 'Click để chọn gom nhóm hoặc định danh cho vector này.' : 'Vùng chưa gán dữ liệu chi tiết.'}
            </p>
          )}

          {hoveredRegion?.items && hoveredRegion.items.length > 0 && (
            <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>📚 Chứa {hoveredRegion.items.length} bài viết dữ liệu</span>
              <span className="text-blue-400 font-semibold">Xem chi tiết &rarr;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const MarkerDataComponent = ({ region, pathId, isSelected, markerColor, config, svgWrapperRef, onSelectRegion, getMarkerIcon, scale = 1, isBuilderMode = false, onMarkerDragged }: any) => {
  const markerRef = React.useRef<HTMLButtonElement>(null);

  // Drag state for UI feedback (only 2 renders per drag action: start & end)
  const [isDraggingNow, setIsDraggingNow] = React.useState(false);
  const isDraggingRef = React.useRef(false);
  const dragStartRef = React.useRef<{ mouseX: number; mouseY: number; baseLeft: number; baseTop: number } | null>(null);

  // Computed centroid position (px in layer space)
  const centroidRef = React.useRef<{ left: number; top: number } | null>(null);

  React.useLayoutEffect(() => {
    const updatePosition = () => {
      if (!pathId || !svgWrapperRef.current || !markerRef.current) return;
      const svgElement = svgWrapperRef.current.querySelector('svg');
      const layer = markerRef.current.parentElement;
      if (!svgElement || !layer) return;

      const pathEl = svgElement.querySelector(`#${pathId}`);
      if (pathEl && typeof (pathEl as any).getBBox === 'function') {
        try {
          const bbox = (pathEl as any).getBBox();
          const cx = bbox.x + bbox.width / 2;
          const cy = bbox.y + bbox.height / 2;

          // Use the specific path element's CTM so that nested group transforms are correctly applied
          const ctm = (pathEl as SVGGraphicsElement).getScreenCTM();
          if (ctm) {
            const pt = (svgElement as any).createSVGPoint();
            pt.x = cx;
            pt.y = cy;
            const screenPt = pt.matrixTransform(ctm);
            const layerRect = layer.getBoundingClientRect();

            const relX = (screenPt.x - layerRect.left) / scale;
            const relY = (screenPt.y - layerRect.top) / scale;

            centroidRef.current = { left: relX, top: relY };

            // Apply stored drag offset (if user has dragged it before)
            const offX = region.marker.markerOffsetX ?? 0;
            const offY = region.marker.markerOffsetY ?? 0;

            markerRef.current.style.left = `${relX + offX}px`;
            markerRef.current.style.top = `${relY + offY}px`;
          }
        } catch (e) {
          console.warn('Failed to align marker precisely:', e);
        }
      }
    };

    if (!isDraggingRef.current) {
      updatePosition();
      // Second pass after a tiny delay for cases where SVG parsing/rendering is async
      const timer = setTimeout(updatePosition, 100);
      const timerLong = setTimeout(updatePosition, 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(timerLong);
      };
    }
    const observer = new ResizeObserver(() => { if (!isDraggingRef.current) updatePosition(); });
    if (svgWrapperRef.current) observer.observe(svgWrapperRef.current);

    return () => observer.disconnect();
  }, [scale, pathId, region, region.marker.markerOffsetX, region.marker.markerOffsetY, config.svgContent]);

  // --- Drag handlers (builder mode only) ---
  const handleMarkerMouseDown = (e: React.MouseEvent) => {
    if (!isBuilderMode) return;
    e.stopPropagation();
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDraggingNow(true);

    if (markerRef.current) {
      markerRef.current.classList.add('is-dragging');
      markerRef.current.style.cursor = 'grabbing';
    }

    const curLeft = parseFloat(markerRef.current?.style.left || '0');
    const curTop = parseFloat(markerRef.current?.style.top || '0');
    dragStartRef.current = { mouseX: e.clientX, mouseY: e.clientY, baseLeft: curLeft, baseTop: curTop };
  };

  React.useEffect(() => {
    if (!isBuilderMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current || !markerRef.current) return;

      const dx = (e.clientX - dragStartRef.current.mouseX) / scale;
      const dy = (e.clientY - dragStartRef.current.mouseY) / scale;

      const newLeft = dragStartRef.current.baseLeft + dx;
      const newTop = dragStartRef.current.baseTop + dy;

      markerRef.current.style.left = `${newLeft}px`;
      markerRef.current.style.top = `${newTop}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current || !dragStartRef.current) return;

      isDraggingRef.current = false;
      setIsDraggingNow(false);
      if (markerRef.current) {
        markerRef.current.classList.remove('is-dragging');
        markerRef.current.style.cursor = '';
      }

      const dx = (e.clientX - dragStartRef.current.mouseX) / scale;
      const dy = (e.clientY - dragStartRef.current.mouseY) / scale;

      // Calculate final offset
      const currentOffsetX = region.marker.markerOffsetX ?? 0;
      const currentOffsetY = region.marker.markerOffsetY ?? 0;
      const finalOffX = Math.round((currentOffsetX + dx) * 100) / 100;
      const finalOffY = Math.round((currentOffsetY + dy) * 100) / 100;

      dragStartRef.current = null;

      if (onMarkerDragged && (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1)) {
        onMarkerDragged(region.id, finalOffX, finalOffY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isBuilderMode, scale, region.id, region.marker.markerOffsetX, region.marker.markerOffsetY]);

  return (
    <button
      ref={markerRef}
      id={`marker-btn-${region.marker.id}`}
      className={`absolute pointer-events-auto flex flex-col items-center group/marker no-drag ${region.marker.showAnimation && !isDraggingNow ? 'jankx-marker-pulse' : ''}`}
      style={{
        left: '-9999px',
        top: '-9999px',
        zIndex: isSelected ? 40 : 20,
        // Cap the visual size of the marker when zoomed in to avoid bloating, but allow it to shrink when zoomed out.
        transform: `translate(-50%, -50%) scale(${Math.min(1.25, scale) / scale})`,
        transformOrigin: 'center bottom',
        transition: isDraggingNow ? 'none' : 'transform 0.15s ease',
        cursor: isBuilderMode ? (isDraggingNow ? 'grabbing' : 'grab') : 'pointer',
      }}
      onMouseDown={handleMarkerMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        if (!isDraggingNow) {
          onSelectRegion(isSelected ? null : region.id);
        }
      }}
    >
      {/* Drag handle hint in builder mode */}
      {isBuilderMode && (
        <div
          title="Kéo để di chuyển pin"
          className={`absolute -top-4 text-[8px] font-bold px-1 py-0.5 rounded transition-opacity ${isDraggingNow ? 'opacity-100 bg-violet-600 text-white' : 'opacity-0 group-hover/marker:opacity-100 bg-slate-700 text-white'
            }`}
          style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}
        >
          {isDraggingNow ? '⤢ Đang di chuyển' : '✥ Kéo để di chuyển'}
        </div>
      )}

      {isSelected && !isDraggingNow && (
        <span
          className="absolute inline-flex rounded-full opacity-60 animate-ping"
          style={{ width: 26, height: 26, backgroundColor: markerColor }}
        />
      )}

      {/* Base pin size: 26x26 at scale=1 */}
      <div
        className={`flex items-center justify-center border-2 cursor-pointer transition-all duration-200 ${isDraggingNow
          ? 'border-violet-400 shadow-xl shadow-violet-500/40'
          : isSelected
            ? 'border-white shadow-lg'
            : 'border-white group-hover/marker:brightness-110 shadow-sm'
          }`}
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          boxShadow: isDraggingNow
            ? '0 8px 24px rgba(139,92,246,0.5)'
            : isSelected
              ? '0 4px 12px rgba(30,58,138,0.4)'
              : '0 2px 6px rgba(0,0,0,0.2)',
          backgroundColor: isDraggingNow ? '#7c3aed' : isSelected ? '#1e3a8a' : markerColor,
        }}
      >
        {getMarkerIcon(region.marker.iconType, 13)}
      </div>

      {(() => {
        const isLabelVisible = region.marker.showLabel !== undefined
          ? region.marker.showLabel !== false
          : config.settings?.showMarkerLabels !== false;

        return isLabelVisible && region.marker.label && (
          <div className={`mt-0.5 font-sans font-bold rounded shadow-sm transition-all border ${isDraggingNow
            ? 'bg-violet-700 text-white border-violet-600'
            : isSelected
              ? 'bg-blue-900 text-white border-blue-800'
              : 'bg-white text-slate-800 border-slate-100 opacity-90 group-hover/marker:opacity-100'
            }`}
            style={{ fontSize: 9, padding: '1px 4px', whiteSpace: 'nowrap', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {region.marker.label}
          </div>
        );
      })()}
    </button>
  );
};
