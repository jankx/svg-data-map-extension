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

            <!-- 2. The map visual canvas container -->
            <div class="relative bg-[#F1F7FA] rounded-[2rem] overflow-hidden shadow-2xl border border-white/50 p-8 min-h-[600px] flex items-center justify-center" id="map-container-root">
                <div id="svg-viewport" class="w-full h-full flex items-center justify-center transition-transform duration-75">
                    <div class="jankx-svg-map-wrapper relative w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[800px] [&>svg]:w-auto [&>svg]:h-auto pointer-events-auto">
                        <?php echo $config['svgContent'] ?? ''; ?>

                        <!-- Markers Layer -->
                        <div class="absolute inset-0 pointer-events-none">
                            <?php foreach ($regions as $region): ?>
                                <?php if (!empty($region['marker'])): $marker = $region['marker']; ?>
                                    <button class="absolute pointer-events-auto transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/marker no-drag jankx-marker-btn"
                                            style="left: <?php echo esc_attr($marker['x']); ?>%; top: <?php echo esc_attr($marker['y']); ?>%; z-index: 20;"
                                            data-region-id="<?php echo esc_attr($region['id']); ?>">
                                        
                                        <div class="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all border-2 border-white cursor-pointer hover:scale-110"
                                             style="background-color: <?php echo esc_attr($markerColor); ?>;">
                                            <?php echo $this->getMarkerIcon($marker['iconType'] ?? 'pin'); ?>
                                        </div>

                                        <?php if (!empty($marker['label'])): ?>
                                            <div class="mt-1 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm bg-white text-slate-800 border border-slate-100 opacity-90 group-hover/marker:opacity-100 group-hover/marker:scale-105 whitespace-nowrap">
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
                .jankx-svg-map-wrapper svg { display: block; margin: 0 auto; }
                .jankx-svg-map-wrapper svg path, .jankx-svg-map-wrapper svg g {
                    fill: <?php echo $settings['defaultFillColor'] ?? '#e2edf5'; ?>;
                    stroke: #ffffff; stroke-width: 0.5px; transition: all 0.2s ease;
                    cursor: pointer; vector-effect: non-scaling-stroke;
                }
                .jankx-svg-map-wrapper svg path:hover, .jankx-svg-map-wrapper svg g:hover {
                    fill: <?php echo $settings['hoverFillColor'] ?? '#93c5fd'; ?> !important;
                }
                .jankx-svg-map-wrapper svg .jankx-map-active {
                    fill: <?php echo $settings['selectedFillColor'] ?? '#3b82f6'; ?> !important;
                    stroke-width: 2px !important;
                }
                
                <?php foreach ($regions as $region): if (!empty($region['fillColor'])): ?>
                    <?php foreach ($region['pathIds'] as $pathId): ?>
                        #<?php echo esc_attr($pathId); ?> { fill: <?php echo esc_attr($region['fillColor']); ?>; }
                    <?php endforeach; ?>
                <?php endif; endforeach; ?>

                .jankx-marker-btn { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .jankx-marker-btn:hover { transform: translate(-50%, -50%) scale(1.1); }
            </style>
        </div>
        <?php
        return ob_get_clean();
    }
}
