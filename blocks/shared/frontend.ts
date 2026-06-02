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
            if (!region || !region.termId) return;

            // Update SVG visuals
            if (activeRegionId) {
                const prevElement = svgWrapper.querySelector(`#${activeRegionId}`);
                if (prevElement) prevElement.classList.remove('jankx-map-active');
            }
            activeRegionId = regionId;
            const currElement = svgWrapper.querySelector(`#${regionId}`);
            if (currElement) currElement.classList.add('jankx-map-active');

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
                        <div class="w-full animate-fade-in">
                           <div class="mb-6">
                               <h2 class="text-3xl font-bold text-[#1E4D65] tracking-tight">${region.name || 'Thông tin'}</h2>
                               ${region.description ? `<p class="text-slate-600 text-xs mt-2">${region.description}</p>` : ''}
                           </div>
                           <div class="space-y-4">
                               ${data.data.html || '<p class="text-slate-400 text-sm italic">Chưa có bài viết nào.</p>'}
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

        // Attach events to SVG paths
        regions.forEach((r: any) => {
            const el = svgWrapper.querySelector(`#${r.id}`);
            if (el) {
                el.classList.add('jankx-map-region-clickable');
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    selectRegion(r.id);
                });
            }
        });
    });
});
