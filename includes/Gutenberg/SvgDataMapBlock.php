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

        if (file_exists(dirname(dirname($this->blockPath)) . '/dist/assets/index.css')) {
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
        $rootPath = dirname(dirname($this->blockPath));
        $cssPath = $rootPath . '/dist/assets/index.css';
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
             data-config="<?php echo esc_attr(json_encode($config)); ?>"
             data-map-id="<?php echo esc_attr($attributes['mapId'] ?? 'default-map'); ?>"
             data-ssr="yes">
            
            <div class="flex flex-col bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-white/50">
                
                <!-- Map View Port (100%) -->
                <div class="p-8 relative flex items-center justify-center bg-[#F1F7FA]">
                    <div class="jankx-svg-map-wrapper w-full h-full min-h-[500px] flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-[700px] [&>svg]:w-auto [&>svg]:h-auto">
                        <?php echo $config['globalSvgContent'] ?? ''; ?>
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
