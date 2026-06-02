<?php
namespace Jankx\Extensions\SvgDataMap\Gutenberg;

use Jankx\Gutenberg\Block;

class SvgDataMapInfoBlock extends Block
{
    protected $blockId = 'jankx/svg-data-map-info';

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
            'jankx-svg-data-map-info-editor',
            $scriptUrl,
            $assets['dependencies'],
            '999.9.9',
            true
        );

        wp_enqueue_style(
            'jankx-svg-data-map-info-editor',
            $styleUrl,
            [],
            '999.9.9'
        );
    }

    protected function registerFrontendAssets(): void
    {
        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';
        wp_enqueue_style(
            'jankx-svg-data-map-info',
            $styleUrl,
            [],
            '1.0.0'
        );

        $scriptUrl = $extension->get_extension_url() . '/dist/assets/frontend.js';
        wp_enqueue_script(
            'jankx-svg-data-map-frontend',
            $scriptUrl,
            [],
            '1.0.0',
            true
        );
    }

    public function render($attributes, $content = '', $block = null)
    {
        $mapId = $attributes['mapId'] ?? 'default-map';

        ob_start();
        ?>
        <div class="jankx-svg-data-map-info-runtime" 
             id="svg-map-info-<?php echo esc_attr($mapId); ?>"
             data-map-id="<?php echo esc_attr($mapId); ?>">
            
            <div class="rounded-2xl p-10 flex flex-col shadow-inner min-h-[400px]"
                 style="background-color: #D7EEF9;">
                
                <div class="jankx-svg-map-info-content h-full">
                     <!-- This will be populated by frontend.js when a region is selected on the linked map -->
                     <div class="flex flex-col items-center justify-center h-full text-center space-y-6 py-10 opacity-70">
                         <div class="w-20 h-20 bg-white/40 rounded-3xl flex items-center justify-center shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1E4D65" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                         </div>
                         <h3 class="text-2xl font-bold text-[#1E4D65]">Bắt đầu Hành Trình</h3>
                         <p class="text-[#1E4D65] font-bold text-sm leading-relaxed max-w-[200px]">
                            Chọn một khu vực trên bản đồ để xem thông tin di sản.
                         </p>
                     </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}
