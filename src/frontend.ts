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
            <div class="text-center">
                <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 shrink-0 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-indigo-800 animate-spin-slow"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800 leading-snug">
                    Bắt đầu Hành Trình Khám Phá
                </h3>
                <p class="text-slate-600 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
                    Vui lòng click chọn các vùng miền và địa danh trên bản đồ để hiển thị thông tin bài viết chi tiết.
                </p>
            </div>
        `;

        // Show loading HTML
        const showLoading = () => {
            infoPanel.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full space-y-4">
                    <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p class="text-indigo-600 font-bold text-xs">Đang tải dữ liệu...</p>
                </div>
            `;
        };

        const showError = () => {
            infoPanel.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 mb-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p class="font-bold text-sm">Lỗi tải dữ liệu</p>
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

            showLoading();
            loading = true;

            try {
                // Determine layout mapping
                let layout = region.layout || 'icon-card';
                // Since user wants SSR layout, mapping JS may need to request HTML from server.
                // In a true vanilla setup we hit the REST API or Admin AJAX:
                const ajaxUrl = ((window as any).jankxDynamicDataLayoutView?.ajaxUrl) || '/wp-admin/admin-ajax.php';

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
                      <div class="h-full flex flex-col items-start w-full animate-fade-in text-left">
                        <div class="mb-5 flex flex-col gap-1 w-full border-b border-slate-100 pb-4">
                            <h3 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500 leading-tight">
                              ${region.label || 'Vùng đã chọn'}
                            </h3>
                        </div>
                        <div class="w-full">
                           ${data.data.html || '<p class="text-slate-400 text-sm">Chưa có bài viết nào.</p>'}
                        </div>
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
                el.addEventListener('click', () => {
                    selectRegion(r.id);
                });
            }
        });
    });
});
