document.addEventListener('DOMContentLoaded', () => {
    const mapElements = document.querySelectorAll('.jankx-svg-data-map-runtime');

    mapElements.forEach((container) => {
        const rawConfig = container.getAttribute('data-config');
        if (!rawConfig) return;

        let config;
        try {
            config = JSON.parse(rawConfig);
        } catch (e) {
            console.error('Invalid SVG Data Map config', e);
            return;
        }

        const regions = config.regions || [];
        const svgWrapper = container.querySelector('.jankx-svg-map-wrapper svg');
        const infoPanel = container.querySelector('.jankx-svg-map-info-panel');

        if (!svgWrapper || !infoPanel) return;

        // Create mapping of ID to Region Data
        const regionMap = new Map();
        regions.forEach((r: any) => regionMap.set(r.id, r));

        // State variables
        let loading = false;
        let activeRegionId: string | null = null;

        // Setup default view HTML template
        const defaultHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center space-y-4 py-10 opacity-60">
                 <div class="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E4D65" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                 </div>
                 <p class="text-[#1E4D65] font-bold text-sm leading-relaxed">
                    Chọn một khu vực trên bản đồ để xem thông tin di sản đường biển.
                 </p>
            </div>
        `;

        // Show loading HTML
        const showLoading = () => {
            infoPanel.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full space-y-4 py-10">
                    <div class="w-10 h-10 border-4 border-white/30 border-t-[#1E4D65] rounded-full animate-spin"></div>
                    <p class="text-[#1E4D65] font-bold text-xs uppercase tracking-widest">Đang tìm kiếm...</p>
                </div>
            `;
        };

        const showError = () => {
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

            // Visual selection (add active class / reset others)
            if (activeRegionId) {
                const prevElement = svgWrapper.querySelector(`#${activeRegionId}`);
                if (prevElement) prevElement.classList.remove('jankx-map-active');
            }
            activeRegionId = regionId;
            const currElement = svgWrapper.querySelector(`#${regionId}`);
            if (currElement) currElement.classList.add('jankx-map-active');

            // Update Title if element exists
            const titleEl = container.querySelector('.jankx-map-active-title');
            if (titleEl) titleEl.textContent = region.label || 'Khu vực';

            showLoading();
            loading = true;

            try {
                const ajaxUrl = ((window as any).jankxViewsData?.ajaxUrl) || '/wp-admin/admin-ajax.php';

                const formData = new FormData();
                formData.append('action', 'svg_data_map_fetch_posts');
                formData.append('term_id', region.termId);
                formData.append('taxonomy', region.taxonomy || 'category');
                formData.append('post_type', region.postType || 'post');

                const response = await fetch(ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) throw new Error("Network error");

                const data = await response.json();

                if (data.success) {
                    infoPanel.innerHTML = `
                        <div class="w-full animate-fade-in">
                           ${data.data.html || '<p class="text-slate-400 text-sm italic">Chưa có bài viết nào.</p>'}
                        </div>
                    `;
                } else {
                    showError();
                }
            } catch (e) {
                console.error(e);
                showError();
            } finally {
                loading = false;
            }
        };

        // Attach events
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
