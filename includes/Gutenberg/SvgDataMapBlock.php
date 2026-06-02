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
        $asset_file = $this->blockPath . '/dist/assets/index.asset.php';
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
            $assets['version'],
            true
        );

        if (file_exists($this->blockPath . '/dist/assets/index.css')) {
            wp_enqueue_style(
                'jankx-svg-data-map-editor',
                $styleUrl,
                [],
                $assets['version']
            );
        }
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

        // Enqueue TailwindCSS/Main styles
        $cssPath = $this->blockPath . '/dist/assets/index.css';
        if (file_exists($cssPath)) {
            $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';
            wp_enqueue_style(
                'jankx-svg-data-map',
                $styleUrl,
                [],
                '1.0.0'
            );
        }

        // Enqueue frontend.js for interactivity
        $jsPath = $this->blockPath . '/dist/assets/frontend.js';
        if (file_exists($jsPath)) {
            $assetFile = $this->blockPath . '/dist/assets/frontend.asset.php';
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

    public function render($attributes, $content = '', $block = null)
    {
        $config = $attributes['config'] ?? [];
        
        // Load default SVG using absolute path to be safe
        if (empty($config['globalSvgContent'])) {
            $svg_path = '/home/puleeno/Projects/baotanghanghai.vn/wp-content/themes/baotanghanghai/Ban do.svg';
            if (file_exists($svg_path)) {
                $config['globalSvgContent'] = file_get_contents($svg_path);
            } else {
                // Try relative to current theme if absolute fails
                $svg_path = get_stylesheet_directory() . '/Ban do.svg';
                if (file_exists($svg_path)) {
                    $config['globalSvgContent'] = file_get_contents($svg_path);
                }
            }
        }

        // SSR Skeleton
        ob_start();
        ?>
        <div class="jankx-svg-data-map-runtime font-sans" 
             id="svg-map-<?php echo esc_attr(uniqid()); ?>"
             data-config="<?php echo esc_attr(json_encode($config)); ?>">
            
            <div class="flex flex-col lg:flex-row min-h-[600px] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-white/50">
                
                <!-- LEFT: Map View Port (70%) -->
                <div class="lg:w-[65%] xl:w-[70%] p-8 relative flex items-center justify-center bg-[#F1F7FA]">
                    <div class="jankx-svg-map-wrapper w-full h-full min-h-[500px] flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[700px] [&>svg]:w-auto [&>svg]:h-auto">
                        <?php echo $config['globalSvgContent'] ?? ''; ?>
                    </div>
                </div>

                <!-- RIGHT: Detail Sidebar (35%) -->
                <div class="lg:w-[35%] xl:w-[32%] bg-[#D7EEF9] p-10 flex flex-col shadow-inner">
                    <!-- Dynamic Title -->
                    <div class="mb-10">
                        <h2 class="jankx-map-active-title text-4xl font-black text-[#1E4D65] tracking-tight transition-all duration-300 drop-shadow-sm">
                             Việt Nam
                        </h2>
                    </div>

                    <!-- Post List Container -->
                    <div class="jankx-svg-map-info-panel flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        <div class="flex flex-col items-center justify-center h-full text-center space-y-6 py-10 opacity-70">
                             <div class="w-20 h-20 bg-white/40 rounded-3xl flex items-center justify-center shadow-inner">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E4D65" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                             </div>
                             <p class="text-[#1E4D65] font-bold text-sm leading-relaxed max-w-[200px]">
                                Chọn một khu vực trên bản đồ để xem thông tin di sản.
                             </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                /* Force SVG Visibility */
                .jankx-svg-map-wrapper svg {
                    display: block;
                    margin: 0 auto;
                }
                .jankx-svg-map-wrapper svg path, 
                .jankx-svg-map-wrapper svg g {
                    fill: #3498db !important; /* Blue from image */
                    stroke: #ffffff;
                    stroke-width: 0.5px;
                    transition: all 0.3s ease-out;
                    cursor: pointer;
                    vector-effect: non-scaling-stroke;
                }
                .jankx-svg-map-wrapper svg path:hover,
                .jankx-svg-map-wrapper svg g:hover {
                    fill: #2980b9 !important;
                    filter: brightness(1.1);
                }
                .jankx-svg-map-wrapper svg .jankx-map-active {
                    fill: #1E4D65 !important;
                }

                /* Sidebar custom scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #B3D9EA; border-radius: 10px; }
                
                /* Post item animations */
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeInUp 0.5s ease forwards; }
            </style>
        </div>
        <?php
        return ob_get_clean();
    }
}
