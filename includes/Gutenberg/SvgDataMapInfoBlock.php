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
            
            <div class="jankx-svg-map-info-container rounded-2xl p-6 flex flex-col justify-between shadow-md border overflow-hidden min-h-[550px] transition-all"
                 style="background-color: #d2ebfa; border-color: #bce1f7;">
                
                <div class="jankx-svg-map-info-content h-full">
                     <!-- This will be populated by frontend.js when a region is selected -->
                     <div class="flex flex-col items-center justify-center text-center h-full min-h-[450px]">
                        <div class="relative mb-4">
                            <div class="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-60 animate-pulse"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1E4D65" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="relative opacity-80 animate-spin-slow" style="animation: spin 8s linear infinite;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                        </div>

                        <h3 class="text-lg font-bold text-slate-800 leading-snug m-0">
                            Bắt đầu Hành Trình Khám Phá
                        </h3>

                        <p class="text-slate-600 text-xs mt-2 max-w-xs leading-relaxed m-0">
                            Vui lòng hover và nhấp chuột chọn bất kỳ địa danh nào trên bản đồ để hiển thị thông tin dữ liệu chi tiết.
                        </p>

                        <div class="mt-8 bg-white/50 border border-sky-200/40 p-3 rounded-lg max-w-xs text-[11px] text-slate-500">
                            <span class="font-semibold text-slate-700 block mb-0.5">💡 Gợi ý nhanh</span> Chọn các vùng có màu xanh đậm trên bản đồ để xem nội dung di sản liên quan!
                        </div>
                     </div>
                </div>
            </div>
            <style>
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin 8s linear infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #B3D9EA; border-radius: 10px; }
            </style>
        </div>
        <?php
        return ob_get_clean();
    }
}
