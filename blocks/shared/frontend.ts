document.addEventListener('DOMContentLoaded', () => {
    const mapElements = document.querySelectorAll('.jankx-svg-data-map-runtime');
    const infoElements = document.querySelectorAll('.jankx-svg-data-map-info-runtime');
    console.log('SVG Map: Found info elements:', infoElements.length);

    // Registry of info panels indexed by mapId
    const infoPanelsByMapId = new Map();
    infoElements.forEach(el => {
        const mid = el.getAttribute('data-map-id') || 'default-map';
        const contentArea = el.querySelector('.jankx-svg-map-info-content');
        console.log('SVG Map: Registered info panel for mapId:', mid, !!contentArea);
        if (contentArea) {
            infoPanelsByMapId.set(mid, contentArea);
        }
    });

    mapElements.forEach((container) => {
        const rawConfig = container.getAttribute('data-config');
        const mapId = container.getAttribute('data-map-id') || 'default-map';
        console.log('SVG Map: Initializing map:', mapId);
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
            console.log('SVG Map: Selecting region:', regionId);
            if (loading || activeRegionId === regionId) return;

            const region = regionMap.get(regionId);
            console.log('SVG Map: Region data:', region);
            if (!region || !region.termId) {
                console.warn('SVG Map: Region or termId missing for region:', regionId);
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
                                ${data.data.html}
                            </div>

                            <div class="pt-4 mt-4 border-t border-sky-200/80 flex items-center justify-between text-[11px] text-sky-800 font-medium">
                                <span>Tọa độ Dữ liệu SVG</span>
                                <span class="bg-sky-200/60 px-2 py-0.5 rounded uppercase tracking-tighter">Bản đồ động</span>
                            </div>
                        </div>
                    `;
                } else {
                    showError();
                }
            } catch (e) {
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

        // Attach events to Markers
        container.querySelectorAll('.jankx-marker-btn').forEach(btn => {
            const rid = btn.getAttribute('data-region-id');
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (rid) selectRegion(rid);
            });
            btn.addEventListener('mouseenter', () => {
                if (rid) setRegionHover(rid, true);
            });
            btn.addEventListener('mouseleave', () => {
                if (rid) setRegionHover(rid, false);
            });
        });
    });
});
