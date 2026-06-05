/**
 * SVG Data Map — Frontend Runtime
 *
 * Khi user click vào region / pin marker:
 *  1. Highlight SVG path
 *  2. Tìm block dynamic-data-layout liên kết qua info panel cùng mapId
 *  3. Gọi AJAX jankx_dynamic_data_layout_filter với taxQuery từ marker config
 *  4. Swap nội dung block (chỉ innerHTML) bằng HTML server trả về
 *
 * @license Apache-2.0
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lấy ajaxUrl & nonce từ globals do WordPress localize */
function getAjaxConfig(): { url: string; nonce: string; postId: number } {
    const w = window as any;
    const config = w.jankxSvgDataMapConfig || w.jankxDynamicDataLayoutView || {};
    return {
        url: config.ajaxUrl || '/wp-admin/admin-ajax.php',
        nonce: config.nonce || '',
        postId: Number(config.postId || 0),
    };
}

/**
 * Tìm block dynamic-data-layout wrapper bên trong info panel.
 * Returns null nếu không có.
 */
function findDynamicDataLayoutBlock(infoRoot: Element): HTMLElement | null {
    return (
        (infoRoot.querySelector('.wp-block-jankx-dynamic-data-layout') as HTMLElement) ||
        null
    );
}

/**
 * Đọc data-block-settings JSON từ dynamic-data-layout block.
 */
function readBlockAttributes(block: HTMLElement): Record<string, any> | null {
    const raw = block.dataset.blockSettings;
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/**
 * Hiển thị spinner tạm thời bên trong block content (carousel-container).
 */
function showBlockLoading(block: HTMLElement): void {
    const container = block.querySelector('.carousel-container') || block;
    (container as HTMLElement).innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 16px;gap:12px;">
            <div style="width:36px;height:36px;border:3px solid rgba(30,77,101,0.15);border-top-color:#1E4D65;border-radius:50%;animation:jankx-spin 0.7s linear infinite;"></div>
            <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#1E4D65;margin:0;">Đang tải dữ liệu...</p>
        </div>
        <style>@keyframes jankx-spin{to{transform:rotate(360deg)}}</style>
    `;
}

/**
 * Gọi AJAX jankx_dynamic_data_layout_filter và swap nội dung block.
 */
async function refreshDynamicDataLayout(
    block: HTMLElement,
    region: Record<string, any>,
    postId: number
): Promise<void> {
    const blockId = block.dataset.blockId || block.dataset.queryId || '';
    if (!blockId) {
        console.warn('[SVG Map] dynamic-data-layout không có data-block-id');
        return;
    }

    const baseAttrs = readBlockAttributes(block) || {};
    const { url: ajaxUrl, nonce } = getAjaxConfig();

    // ── Xây dựng filters từ marker config chuẩn theo Jankx ────────────────
    const filters: Record<string, any> = {};

    // 1. Array taxQuery gốc (nếu dùng giao diện nâng cao)
    if (Array.isArray(region.taxQuery) && region.taxQuery.length > 0) {
        region.taxQuery.forEach((tq: any) => {
            if (tq.taxonomy && tq.terms && tq.terms.length > 0) {
                filters[tq.taxonomy] = tq.terms;
            }
        });
    }
    // 2. Fallback: termId & taxonomy đơn lẻ
    else if (region.termId && region.taxonomy) {
        filters[region.taxonomy] = [Number(region.termId)];
    }

    // Keyword & Post type
    if (region.keyword) filters.keyword = region.keyword;
    if (region.postType) filters.post_type = region.postType;

    // Merge filters vào attributes (DynamicDataLayoutQueryHelper::applyFiltersToAttributes sẽ xử lý phía server)
    const mergedAttrs = { ...baseAttrs, queryId: blockId };

    showBlockLoading(block);

    try {
        const body = new FormData();
        body.append('action', 'jankx_dynamic_data_layout_filter');
        body.append('nonce', nonce);
        body.append('block_id', blockId);
        body.append('attributes', JSON.stringify(mergedAttrs));
        body.append('filters', JSON.stringify(filters));
        body.append('post_id', String(postId));

        const response = await fetch(ajaxUrl, { method: 'POST', body });
        const json = await response.json();

        if (json.success && json.data?.html) {
            // Parse server response
            const tmp = document.createElement('div');
            tmp.innerHTML = json.data.html;

            // Server may return a full wrapper div or just inner HTML
            const serverBlock =
                (tmp.querySelector('.wp-block-jankx-dynamic-data-layout') as HTMLElement) ||
                (tmp.firstElementChild as HTMLElement);

            if (serverBlock) {
                // Update cached block settings if server returned fresh attributes
                if (json.data.attributes) {
                    block.dataset.blockSettings = JSON.stringify(json.data.attributes);
                }

                // Replace the entire inner HTML of the DDL block wrapper
                // (keeps the block's own wrapper div + data-* intact for subsequent calls)
                block.innerHTML = serverBlock.innerHTML;
            } else {
                block.innerHTML = json.data.html;
            }

            // Kích hoạt lại carousel nếu layout là carousel
            if (block.dataset.layout === 'carousel') {
                block.dispatchEvent(
                    new CustomEvent('jankx:reinitialize-carousel', {
                        detail: { element: block },
                        bubbles: true,
                    })
                );
            }
        } else {
            const msg = json.data?.message || 'Không tìm thấy dữ liệu.';
            const container = block.querySelector('.carousel-container') || block;
            (container as HTMLElement).innerHTML = `
                <div style="padding:24px;text-align:center;color:#64748b;font-size:13px;">
                    <p style="margin:0;">${msg}</p>
                </div>
            `;
        }
    } catch (err) {
        console.error('[SVG Map] AJAX error:', err);
        const container = block.querySelector('.carousel-container') || block;
        (container as HTMLElement).innerHTML = `
            <div style="padding:24px;text-align:center;color:#ef4444;font-size:13px;">
                <p style="margin:0;">Lỗi kết nối. Vui lòng thử lại.</p>
            </div>
        `;
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    const mapElements = document.querySelectorAll('.jankx-svg-data-map-runtime');
    const infoElements = document.querySelectorAll('.jankx-svg-data-map-info-runtime');

    // Registry: mapId → info root element
    const infoRootsByMapId = new Map<string, Element>();
    infoElements.forEach(el => {
        const mid = el.getAttribute('data-map-id') || 'default-map';
        infoRootsByMapId.set(mid, el);
    });

    mapElements.forEach(container => {
        const rawConfig = container.getAttribute('data-config');
        const mapId = container.getAttribute('data-map-id') || 'default-map';
        const postId = getAjaxConfig().postId;

        if (!rawConfig) return;

        let config: any;
        try {
            config = JSON.parse(rawConfig);
        } catch {
            return;
        }

        const regions: any[] = config.regions || [];
        const svgWrapper = container.querySelector('.jankx-svg-map-wrapper svg') as SVGGraphicsElement | null;
        const infoRoot = infoRootsByMapId.get(mapId) || null;

        if (!svgWrapper) return;

        // regionMap for quick lookup
        const regionMap = new Map<string, any>();
        regions.forEach(r => regionMap.set(r.id, r));

        let activeRegionId: string | null = null;

        // ── Highlight helpers ──────────────────────────────────────────────

        const setPathActive = (regionId: string, active: boolean) => {
            const r = regionMap.get(regionId);
            if (!r?.pathIds) return;
            r.pathIds.forEach((pid: string) => {
                const el = svgWrapper.querySelector(`#${pid}`);
                if (el) el.classList.toggle('jankx-map-active', active);
            });
        };

        const setRegionHover = (regionId: string, active: boolean) => {
            const r = regionMap.get(regionId);
            if (!r?.pathIds) return;
            r.pathIds.forEach((pid: string) => {
                const el = svgWrapper.querySelector(`#${pid}`);
                if (el) el.classList.toggle('jankx-map-hover', active);
            });
            const markerBtn = container.querySelector(`.jankx-marker-btn[data-region-id="${regionId}"]`);
            if (markerBtn) markerBtn.classList.toggle('jankx-map-marker-hover', active);
        };

        // Save default title text
        const titleEl =
            container.querySelector('.jankx-map-active-title') ||
            (infoRoot ? infoRoot.querySelector('.jankx-map-active-title') : null);
        const defaultTitle = titleEl ? titleEl.textContent : 'Tất cả Địa Điểm';

        // ── selectRegion ───────────────────────────────────────────────────

        const selectRegion = (regionId: string | null) => {
            if (activeRegionId === regionId) return;

            // Deactivate previous
            if (activeRegionId) {
                setPathActive(activeRegionId, false);
                const prevMarker = container.querySelector(`.jankx-marker-btn[data-region-id="${activeRegionId}"]`);
                if (prevMarker) prevMarker.classList.remove('jankx-map-active');
            }

            activeRegionId = regionId;

            let region: any = null;

            if (regionId) {
                setPathActive(regionId, true);
                const activeMarker = container.querySelector(`.jankx-marker-btn[data-region-id="${regionId}"]`);
                if (activeMarker) activeMarker.classList.add('jankx-map-active');

                region = regionMap.get(regionId);
                // Update title element 
                if (titleEl) titleEl.textContent = region?.name || region?.label || 'Khu vực';
            } else {
                // Deselect: restore title
                if (titleEl) titleEl.textContent = defaultTitle;
            }

            // ── Refresh dynamic-data-layout if available ──────────────────
            if (infoRoot) {
                const ddlBlock = findDynamicDataLayoutBlock(infoRoot);
                if (ddlBlock) {
                    // Pass an empty object when deselected to clear filters
                    refreshDynamicDataLayout(ddlBlock, region || {}, postId);
                    return; // skip legacy AJAX below
                }
            }

            // ── Legacy: render static region.items when no DDL block ───────
            if (!infoRoot) return;
            const legacyContent = infoRoot.querySelector('.jankx-svg-map-info-content') as HTMLElement | null;
            if (!legacyContent || !region) return;

            let manualHtml = '';
            if (region.items?.length) {
                region.items.forEach((item: any) => {
                    manualHtml += `
                        <div class="bg-indigo-50/50 p-5 rounded-xl shadow-sm border border-indigo-100/50 hover:shadow transition mb-4">
                            <h3 class="font-bold text-slate-900 text-base m-0 mb-1">${item.title || ''}</h3>
                            <p class="text-slate-600 text-xs leading-relaxed">${item.description || ''}</p>
                            ${item.linkUrl ? `<a href="${item.linkUrl}" target="_blank" class="inline-flex items-center gap-1 mt-2 font-bold text-xs text-indigo-800 hover:text-indigo-900">${item.linkLabel || 'Xem chi tiết'} →</a>` : ''}
                        </div>`;
                });
            }

            legacyContent.innerHTML = `
                <h2 class="text-2xl font-bold text-slate-800 mb-3">${region.name || 'Khu vực'}</h2>
                <p class="text-slate-600 text-xs mb-4">${region.description || ''}</p>
                <div class="space-y-3">${manualHtml}</div>
            `;
        };

        // ── Attach events to SVG paths ─────────────────────────────────────

        regions.forEach(r => {
            if (!r.pathIds) return;
            r.pathIds.forEach((pid: string) => {
                const el = svgWrapper.querySelector(`#${pid}`);
                if (!el) return;
                el.classList.add('jankx-map-region-clickable');
                el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); selectRegion(r.id); });
                el.addEventListener('mouseenter', () => setRegionHover(r.id, true));
                el.addEventListener('mouseleave', () => setRegionHover(r.id, false));
            });
        });

        // Click outside on SVG background to deselect
        svgWrapper.addEventListener('click', () => {
            selectRegion(null);
        });

        // ── Attach events + positioning to Markers ─────────────────────────

        const allMarkers = Array.from(
            container.querySelectorAll('.jankx-marker-btn')
        ) as HTMLButtonElement[];

        allMarkers.forEach(markerBtn => {
            const rid = markerBtn.getAttribute('data-region-id');
            const pathId = markerBtn.getAttribute('data-path-id');

            // Position marker using getScreenCTM of the specific path element
            const computePosition = () => {
                if (!pathId) return;
                const pathEl = svgWrapper.querySelector(`#${pathId}`) as SVGGraphicsElement | null;
                const layer = container.querySelector('.jankx-markers-layer') as HTMLElement | null;
                if (!pathEl || !layer || typeof pathEl.getBBox !== 'function') return;

                try {
                    const bbox = pathEl.getBBox();
                    const cx = bbox.x + bbox.width / 2;
                    const cy = bbox.y + bbox.height / 2;

                    const ctm = pathEl.getScreenCTM();
                    if (!ctm || ctm.a === 0 || ctm.d === 0) return;

                    const pt = (svgWrapper as any).createSVGPoint();
                    pt.x = cx;
                    pt.y = cy;
                    const screenPt = pt.matrixTransform(ctm);
                    const layerRect = layer.getBoundingClientRect();

                    const region = rid ? regionMap.get(rid) : null;
                    const offX = region?.marker?.markerOffsetX ?? 0;
                    const offY = region?.marker?.markerOffsetY ?? 0;

                    markerBtn.style.left = `${screenPt.x - layerRect.left + offX}px`;
                    markerBtn.style.top = `${screenPt.y - layerRect.top + offY}px`;
                    markerBtn.style.transform = 'translate(-50%, -50%)';
                    markerBtn.style.transformOrigin = 'center bottom';
                    markerBtn.style.display = 'flex';
                    markerBtn.style.position = 'absolute';
                } catch (e) {
                    console.error('[SVG Map] Failed to position marker', pathId, e);
                }
            };

            computePosition();

            const observer = new ResizeObserver(() => computePosition());
            observer.observe(svgWrapper);

            // Click: selectRegion (→ refreshDynamicDataLayout nếu có DDL block)
            markerBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                if (rid) selectRegion(rid);
            });
            markerBtn.addEventListener('mouseenter', () => { if (rid) setRegionHover(rid, true); });
            markerBtn.addEventListener('mouseleave', () => { if (rid) setRegionHover(rid, false); });
        });
    });
});
