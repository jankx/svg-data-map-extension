document.addEventListener('DOMContentLoaded', () => {
    const mapElements = document.querySelectorAll('.jankx-svg-data-map-runtime');
    const infoElements = document.querySelectorAll('.jankx-svg-data-map-info-runtime');

    // Registry of info panels indexed by mapId
    const infoPanelsByMapId = new Map();
    infoElements.forEach(el => {
        const mid = el.getAttribute('data-map-id') || 'default-map';
        const contentArea = el.querySelector('.jankx-svg-map-info-content');
        if (contentArea) {
            infoPanelsByMapId.set(mid, contentArea);
        }
    });

    mapElements.forEach((container) => {
        const rawConfig = container.getAttribute('data-config');
        const mapId = container.getAttribute('data-map-id') || 'default-map';
        if (!rawConfig) return;

        let config: any;
        try {
            config = JSON.parse(rawConfig);
        } catch (e) {
            return;
        }

        const regions = config.regions || [];
        const svgWrapper = container.querySelector('.jankx-svg-map-wrapper svg');

        // Info panel could be inside this block (legacy) or separate
        let infoPanel = container.querySelector('.jankx-svg-map-info-panel') || infoPanelsByMapId.get(mapId);

        if (!svgWrapper || !infoPanel) return;

        const regionMap = new Map();
        regions.forEach((r: any) => regionMap.set(r.id, r));

        let loading = false;
        let activeRegionId: string | null = null;

        const showLoading = () => {
            if (!infoPanel) return;
            infoPanel.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">Đang tìm kiếm...</p>
                </div>
            `;
        };

        const showError = () => {
            if (!infoPanel) return;
            infoPanel.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center text-[#1E4D65]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2 opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Không thể tải thông tin</p>
                </div>
            `;
        };

        const selectRegion = async (regionId: string) => {
            if (loading || activeRegionId === regionId) return;

            const region = regionMap.get(regionId);
            if (!region) {
                return;
            }

            // Update SVG visuals (all paths in this region)
            if (activeRegionId) {
                const prevRegion = regionMap.get(activeRegionId);
                if (prevRegion && prevRegion.pathIds) {
                    prevRegion.pathIds.forEach((pid: string) => {
                        const el = svgWrapper.querySelector(`#${pid}`);
                        if (el) el.classList.remove('jankx-map-active');
                    });
                }
                const prevMarker = container.querySelector(`.jankx-marker-btn[data-region-id="${activeRegionId}"]`);
                if (prevMarker) prevMarker.classList.remove('jankx-map-active');
            }

            activeRegionId = regionId;
            if (region.pathIds) {
                region.pathIds.forEach((pid: string) => {
                    const el = svgWrapper.querySelector(`#${pid}`);
                    if (el) el.classList.add('jankx-map-active');
                });
            }
            const activeMarker = container.querySelector(`.jankx-marker-btn[data-region-id="${regionId}"]`);
            if (activeMarker) activeMarker.classList.add('jankx-map-active');

            // Find title in either container
            const titleEl = container.querySelector('.jankx-map-active-title') || (infoPanel.parentElement ? infoPanel.parentElement.querySelector('.jankx-map-active-title') : null);
            if (titleEl) titleEl.textContent = region.name || region.label || 'Khu vực';

            // Start rendering info panel
            let manualItemsHtml = '';
            if (region.items && region.items.length > 0) {
                region.items.forEach((item: any) => {
                    manualItemsHtml += `
                        <div class="bg-indigo-50/50 p-5 rounded-xl shadow-sm border border-indigo-100/50 hover:shadow transition mb-4 animate-in">
                            <div class="flex items-center gap-2 mb-1.5">
                                <span class="p-0.5 px-1.5 rounded bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider">Ghim</span>
                                <h3 class="font-bold text-slate-900 text-base m-0 tracking-tight">${item.title || 'Thông tin'}</h3>
                            </div>
                            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${item.description || ''}</p>
                            ${item.linkUrl ? `
                                <a href="${item.linkUrl}" target="_blank" class="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-indigo-800 hover:text-indigo-900 transition-colors">
                                    <span>${item.linkLabel || 'Xem chi tiết'}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </a>
                            ` : ''}
                        </div>
                    `;
                });
            }

            // Set initial HTML with static data
            const setInfoHtml = (dynamicHtml: string = '') => {
                infoPanel.innerHTML = `
                    <div class="flex flex-col h-full justify-between animate-fade-in">
                        <div>
                            <h2 class="text-3xl font-sans font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2 m-0 p-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-indigo-800 shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                ${region.name || 'Hạng mục'}
                            </h2>
                            <p class="text-slate-600/90 text-xs leading-relaxed mb-5 mt-1">
                                ${region.description || 'Thông tin chi tiết về khu vực di sản này.'}
                            </p>
                        </div>

                        <div class="flex-1 overflow-y-auto space-y-4 max-h-[460px] pr-2 custom-scrollbar">
                            ${manualItemsHtml}
                            ${dynamicHtml}
                        </div>

                        <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                            <span>Tọa độ Dữ liệu SVG</span>
                            <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">Bản đồ động</span>
                        </div>
                    </div>
                `;
            };

            // If no termId, just show manual data and stop
            if (!region.termId) {
                console.log('SVG Map: No termId, showing manual data only');
                setInfoHtml();
                return;
            }

            showLoading();
            loading = true;

            try {
                const ajaxUrl = ((window as any).jankxViewsData?.ajaxUrl) || '/wp-admin/admin-ajax.php';
                const formData = new FormData();
                formData.append('action', 'svg_data_map_fetch_posts');
                formData.append('term_id', region.termId);
                formData.append('taxonomy', region.taxonomy || 'category');
                formData.append('post_type', region.postType || 'post');

                const response = await fetch(ajaxUrl, { method: 'POST', body: formData });
                const data = await response.json();

                if (data.success) {
                    setInfoHtml(data.data.html);
                } else {
                    showError();
                }
            } catch (e) {
                console.error('SVG Map: AJAX error:', e);
                showError();
            } finally {
                loading = false;
            }
        };

        const setRegionHover = (regionId: string, active: boolean) => {
            const region = regionMap.get(regionId);
            if (!region) return;

            // Toggle hover on all paths
            if (region.pathIds) {
                region.pathIds.forEach((pid: string) => {
                    const el = svgWrapper.querySelector(`#${pid}`);
                    if (el) {
                        if (active) el.classList.add('jankx-map-hover');
                        else el.classList.remove('jankx-map-hover');
                    }
                });
            }

            // Toggle hover on marker button if it exists
            const markerBtn = container.querySelector(`.jankx-marker-btn[data-region-id="${regionId}"]`);
            if (markerBtn) {
                if (active) markerBtn.classList.add('jankx-map-marker-hover'); // For potential marker scale effects
                else markerBtn.classList.remove('jankx-map-marker-hover');
            }
        };

        // Attach events to SVG paths
        regions.forEach((r: any) => {
            if (r.pathIds) {
                r.pathIds.forEach((pid: string) => {
                    const el = svgWrapper.querySelector(`#${pid}`);
                    if (el) {
                        el.classList.add('jankx-map-region-clickable');
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            selectRegion(r.id);
                        });
                        el.addEventListener('mouseenter', () => setRegionHover(r.id, true));
                        el.addEventListener('mouseleave', () => setRegionHover(r.id, false));
                    }
                });
            }
        });

        // Track current zoom scale and update marker sizes
        let currentScale = 1;
        const allMarkerBtns = Array.from(container.querySelectorAll('.jankx-marker-btn')) as HTMLButtonElement[];

        const applyScaleToMarkers = () => {
            allMarkerBtns.forEach(btn => {
                btn.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
                btn.style.transformOrigin = 'center bottom';
            });
        };

        // Attach events to Markers and position them
        allMarkerBtns.forEach(markerBtn => {
            const rid = markerBtn.getAttribute('data-region-id');
            const pathId = markerBtn.getAttribute('data-path-id');

            // 1. Position the marker using exact SVG space mapping
            const computePosition = () => {
                if (pathId) {
                    const svgEl = svgWrapper as SVGGraphicsElement;
                    const pathEl = svgEl.querySelector(`#${pathId}`) as SVGGraphicsElement;
                    const layer = container.querySelector('.jankx-markers-layer') as HTMLElement;

                    if (pathEl && layer && typeof pathEl.getBBox === 'function') {
                        try {
                            const bbox = pathEl.getBBox();
                            const cx = bbox.x + bbox.width / 2;
                            const cy = bbox.y + bbox.height / 2;

                            const ctm = svgEl.getScreenCTM();
                            if (ctm) {
                                const pt = (svgEl as any).createSVGPoint();
                                pt.x = cx;
                                pt.y = cy;
                                const screenPt = pt.matrixTransform(ctm);
                                const layerRect = layer.getBoundingClientRect();

                                // Correct coordinate for internal CSS space which is scaled by CSS transform
                                // Divide by currentScale to match Editor mode behavior
                                const relX = (screenPt.x - layerRect.left) / currentScale;
                                const relY = (screenPt.y - layerRect.top) / currentScale;

                                markerBtn.style.left = `${relX}px`;
                                markerBtn.style.top = `${relY}px`;
                                markerBtn.style.transform = `translate(-50%, -50%) scale(${currentScale})`;
                                markerBtn.style.transformOrigin = 'center bottom';
                                markerBtn.style.display = 'flex';
                                markerBtn.style.position = 'absolute';
                            }
                        } catch (e) {
                            console.error('SVG Map: Failed to calculate bbox for', pathId, e);
                        }
                    }
                }
            };

            computePosition();
            window.addEventListener('resize', () => { computePosition(); });

            // 2. Attach events
            markerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (rid) selectRegion(rid);
            });
            markerBtn.addEventListener('mouseenter', () => {
                if (rid) setRegionHover(rid, true);
            });
            markerBtn.addEventListener('mouseleave', () => {
                if (rid) setRegionHover(rid, false);
            });
        });

        // Hook into wheel zoom to update marker scale
        const mapViewport = container.querySelector('#map-container-root') || container;
        mapViewport.addEventListener('wheel', (e: any) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.05 : -0.05;
            currentScale = Math.max(0.5, Math.min(5, currentScale + delta));
            applyScaleToMarkers();
        }, { passive: false });
    });
});
