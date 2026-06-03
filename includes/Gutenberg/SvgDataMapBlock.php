<?php
namespace Jankx\Extensions\SvgDataMap\Gutenberg;

use Jankx\Gutenberg\Block;

class SvgDataMapBlock extends Block
{
    protected $blockId = 'jankx/svg-data-map';

    protected function registerHooks(): void
    {
        // Internal hooks can be added here if needed
    }

    /**
     * Standard Jankx lifecycle for editor assets
     */
    protected function registerEditorAssets(): void
    {
        $asset_file = dirname(dirname($this->blockPath)) . '/dist/assets/index.asset.php';
        $assets = file_exists($asset_file) ? require $asset_file : [
            'dependencies' => ['wp-blocks', 'wp-element', 'wp-editor'],
            'version' => '1.0.0'
        ];

        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $scriptUrl = $extension->get_extension_url() . '/dist/assets/index.js';
        $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';

        wp_enqueue_script(
            'jankx-svg-data-map-editor',
            $scriptUrl,
            $assets['dependencies'],
            '999.9.9',
            true
        );

        // Styles are handled by block.json ("editorStyle")
    }

    /**
     * Standard Jankx lifecycle for frontend assets.
     * Note: For Gutenberg apiVersion 3, we also need to ensure styles 
     * are loaded in the editor iframe, which registerFrontendAssets handles 
     * in modern Jankx versions or via 'style' attribute in block.json.
     */
    protected function registerFrontendAssets(): void
    {
        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        // Styles are handled by block.json ("style")
        $rootPath = dirname(dirname($this->blockPath));

        // Enqueue frontend.js for interactivity
        $jsPath = $rootPath . '/dist/assets/frontend.js';
        if (file_exists($jsPath)) {
            $assetFile = $rootPath . '/dist/assets/frontend.asset.php';
            $assets = file_exists($assetFile) ? require $assetFile : [
                'dependencies' => [],
                'version' => '1.0.0'
            ];

            $scriptUrl = $extension->get_extension_url() . '/dist/assets/frontend.js';
            wp_enqueue_script(
                'jankx-svg-data-map-frontend',
                $scriptUrl,
                $assets['dependencies'],
                $assets['version'],
                true
            );
        }
    }

    private function getMarkerIcon($type)
    {
        switch ($type) {
            case 'transport':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><rect x="2" y="10" width="20" height="8" rx="2" ry="2"/><path d="M7 22l3-3"/><path d="M17 22l-3-3"/><path d="M15 13a3 3 0 0 0-3-3"/><path d="M15 2l-2 8H7L5 2"/></svg>';
            case 'hotel':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M3 7v11"/><path d="M21 7v11"/><path d="M3 11h18"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M15 5v2"/><path d="M9 5v2"/></svg>';
            case 'food':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
            case 'scenic':
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
            default:
                return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
        }
    }

    public function render($attributes, $content = '', $block = null)
    {
        $config = $attributes['config'] ?? [];
        $mapId = $attributes['mapId'] ?? 'default-map';
        
        // Load default SVG using absolute path to be safe
        if (empty($config['svgContent'])) {
            $svg_path = '/home/puleeno/Projects/baotanghanghai.vn/wp-content/themes/baotanghanghai/Ban do.svg';
            if (file_exists($svg_path)) {
                $config['svgContent'] = file_get_contents($svg_path);
            }
        }

        $title = $config['title'] ?? 'Bản đồ hiện tại';
        $description = $config['description'] ?? 'Khám phá các điểm đến di sản.';
        $regions = $config['regions'] ?? [];
        $settings = $config['settings'] ?? [];
        $markerColor = $settings['markerColor'] ?? '#f97316';

        // Prepare config for JS without the large SVG content to save space
        $jsConfig = $config;
        unset($jsConfig['svgContent']);

        // SSR Skeleton
        ob_start();
        ?>
        <div class="jankx-svg-data-map-runtime font-sans flex flex-col gap-4" 
             id="svg-map-<?php echo esc_attr(uniqid()); ?>"
             data-config="<?php echo esc_attr(json_encode($jsConfig)); ?>"
             data-map-id="<?php echo esc_attr($mapId); ?>"
             data-ssr="yes">
            
            <!-- 1. Info header of map -->
            <div class="bg-white border border-indigo-50/70 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="p-1 px-2 rounded bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-wider font-mono">Bản đồ</span>
                        <h1 class="text-xl font-bold text-slate-800 m-0"><?php echo esc_html($title); ?></h1>
                    </div>
                    <?php if ($description): ?>
                        <p class="text-slate-500 text-xs mt-1 mb-0"><?php echo esc_html($description); ?></p>
                    <?php endif; ?>
                </div>

                <div class="flex items-center gap-1.5 self-start sm:self-center">
                    <span class="text-xs text-slate-400 mr-1.5">Trạng thái:</span>
                    <span class="p-1.5 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-500/10">
                        Live
                    </span>
                </div>
            </div>

            <div class="relative bg-[#F1F7FA] rounded-[2rem] overflow-hidden shadow-2xl border border-white/50 min-h-[600px] flex items-center justify-center" id="map-container-root">
                <div id="svg-viewport" class="w-full h-full flex items-center justify-center transition-transform duration-75">
                    <div class="jankx-svg-map-wrapper relative w-full h-full flex items-center justify-center pointer-events-auto" style="min-height: 500px;">
                        <?php 
                        $svgRender = $config['svgContent'] ?? '';
                        // Defensive fix: if SVG was saved escaped in database, decode it
                        if (strpos($svgRender, '&lt;svg') !== false) {
                            $svgRender = html_entity_decode($svgRender);
                        }
                        echo $svgRender; 
                        ?>

                        <!-- Markers Layer: JS will reposition each marker at its vector path's centroid -->
                        <div class="jankx-markers-layer" style="position:absolute;inset:0;pointer-events:none;">
                            <?php foreach ($regions as $region): ?>
                                <?php if (!empty($region['marker'])): $marker = $region['marker']; ?>
                                    <?php 
                                    $markerClass = 'jankx-marker-btn';
                                    if (!empty($marker['showAnimation'])) {
                                        $markerClass .= ' jankx-marker-pulse';
                                    }
                                    ?>
                                    <button class="<?php echo esc_attr($markerClass); ?>"
                                            style="display:none;flex-direction:column;align-items:center;pointer-events:auto;z-index:20;"
                                            data-region-id="<?php echo esc_attr($region['id']); ?>"
                                            data-path-id="<?php echo esc_attr($region['pathIds'][0] ?? ''); ?>">
                                        
                                        <div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px rgba(0,0,0,.2);border:2px solid white;background-color:<?php echo esc_attr($markerColor); ?>;">
                                            <?php echo $this->getMarkerIcon($marker['iconType'] ?? 'pin'); ?>
                                        </div>

                                        <?php if (!empty($marker['label'])): ?>
                                            <div style="margin-top:4px;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:#fff;color:#1e293b;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,.1);white-space:nowrap;">
                                                <?php echo esc_html($marker['label']); ?>
                                            </div>
                                        <?php endif; ?>
                                    </button>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. Micro status legend -->
            <div class="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <div class="flex items-center gap-4 flex-wrap">
                    <span class="font-semibold text-slate-600">Chú thích:</span>
                    <span class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded-full bg-orange-500 border border-white shadow-sm"></span>
                        Điểm mốc (Markers)
                    </span>
                    <span class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-indigo-600 inline-block border border-white shadow-sm"></span>
                        Đã chọn
                    </span>
                    <span class="flex items-center gap-1.5">
                        <span class="w-3.5 h-3.5 rounded bg-indigo-200 inline-block border border-white shadow-sm"></span>
                        Vùng di sản
                    </span>
                </div>

                <div class="text-[11px] text-slate-400">
                    Dữ liệu: <span class="font-bold text-slate-600"><?php echo count($regions); ?> vùng</span>
                </div>
            </div>
            
            <style>
                .jankx-svg-map-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }
                .jankx-svg-map-wrapper svg { 
                    display: block; 
                    margin: 0 auto;
                    max-width: 100%;
                    height: auto;
                }

                /* Only style CONFIGURED region paths. CSS ID selectors override SVG presentation attributes by specificity — no !important needed. */
                <?php 
                $defaultFill      = $settings['defaultFillColor']  ?? '#a8c5da';
                $defaultHoverFill = $settings['hoverFillColor']    ?? '#93c5fd';
                $activeFill       = $settings['selectedFillColor'] ?? '#3b82f6';
                foreach ($regions as $region):
                    $regionFill      = !empty($region['fillColor'])      ? $region['fillColor']      : $defaultFill;
                    $regionHoverFill = !empty($region['hoverFillColor']) ? $region['hoverFillColor'] : $defaultHoverFill;
                    foreach ($region['pathIds'] as $pathId):
                        $pid = esc_attr($pathId);
                ?>
                .jankx-svg-map-wrapper svg #<?php echo $pid; ?> {
                    fill: <?php echo esc_attr($regionFill); ?>;
                    cursor: pointer;
                    transition: fill 0.2s ease;
                    vector-effect: non-scaling-stroke;
                }
                .jankx-svg-map-wrapper svg #<?php echo $pid; ?>:hover,
                .jankx-svg-map-wrapper svg #<?php echo $pid; ?>.jankx-map-hover {
                    fill: <?php echo esc_attr($regionHoverFill); ?>;
                }
                .jankx-svg-map-wrapper svg #<?php echo $pid; ?>.jankx-map-active {
                    fill: <?php echo esc_attr($activeFill); ?>;
                    stroke: #1d4ed8;
                    stroke-width: 2px;
                }
                <?php endforeach; endforeach; ?>

                /* Markers layer */
                .jankx-markers-layer { position: absolute; inset: 0; pointer-events: none; }
                .jankx-marker-btn {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: auto;
                    transform: translate(-50%, -50%);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    z-index: 20;
                }
                .jankx-marker-btn:hover { transform: translate(-50%, -50%) scale(1.1); }

                /* Pulsing animation */
                .jankx-marker-pulse::before {
                    content: '';
                    position: absolute;
                    top: 18px; /* Center of the 36px circle */
                    left: 50%;
                    width: 36px;
                    height: 36px;
                    background-color: <?php echo esc_attr($markerColor); ?>;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: -1;
                    animation: jankx-mark-pulse 2s infinite;
                    opacity: 0;
                }
                @keyframes jankx-mark-pulse {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                    100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
                }
            </style>

            <script>
            /* Position each marker at the centroid of its associated SVG path using getBBox() */
            (function() {
                function placeMarkers(wrapper) {
                    var svgEl = wrapper.querySelector('svg');
                    var layer = wrapper.querySelector('.jankx-markers-layer');
                    if (!svgEl || !layer) return;

                    var layerRect = layer.getBoundingClientRect();
                    var ctm = svgEl.getScreenCTM();
                    if (!ctm) return;

                    layer.querySelectorAll('.jankx-marker-btn').forEach(function(btn) {
                        var pathId = btn.getAttribute('data-path-id');
                        if (!pathId) return;

                        var pathEl = svgEl.getElementById(pathId);
                        if (!pathEl || typeof pathEl.getBBox !== 'function') return;

                        try {
                            var bbox   = pathEl.getBBox();
                            var cx     = bbox.x + bbox.width  / 2;
                            var cy     = bbox.y + bbox.height / 2;

                            // Convert SVG user-space coords → screen coords
                            var pt = svgEl.createSVGPoint();
                            pt.x = cx;
                            pt.y = cy;
                            var screenPt = pt.matrixTransform(ctm);

                            // Convert screen coords → layer-relative coords
                            var relX = screenPt.x - layerRect.left;
                            var relY = screenPt.y - layerRect.top;

                            btn.style.position  = 'absolute';
                            btn.style.left      = relX + 'px';
                            btn.style.top       = relY + 'px';
                            btn.style.transform = 'translate(-50%, -50%)';
                            btn.style.display   = 'flex';
                        } catch(e) {
                            // getBBox can fail for invisible elements; skip
                        }
                    });
                }

                function initAll() {
                    document.querySelectorAll('.jankx-svg-map-wrapper').forEach(placeMarkers);
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initAll);
                } else {
                    setTimeout(initAll, 60); // Let SVG paint first
                }
                window.addEventListener('resize', function() {
                    // Re-run on resize since layer rect and CTM change
                    setTimeout(initAll, 50);
                });
            })();
            </script>
        </div>
        <?php
        return ob_get_clean();
    }
}
