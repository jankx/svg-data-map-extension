<?php
namespace Jankx\Extensions\SvgDataMap\Gutenberg;

use Jankx\Gutenberg\Block;

class SvgDataMapBlock extends Block
{
    protected $blockId = 'jankx/svg-data-map';

    protected function registerHooks(): void
    {
        add_action('enqueue_block_editor_assets', [$this, 'enqueueEditorAssets']);
        add_action('enqueue_block_assets', [$this, 'enqueueBlockAssets']);
    }

    public function enqueueEditorAssets()
    {
        $asset_file = $this->blockPath . '/dist/assets/index.asset.php';
        $assets = file_exists($asset_file) ? require $asset_file : [
            'dependencies' => ['wp-blocks', 'wp-element', 'wp-editor'],
            'version' => '1.0.0'
        ];

        // Create correct URL for the script
        $baseUrl = str_replace(ABSPATH, site_url('/'), $this->blockPath);
        // Better way: use the extension instance if available
        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if ($extension) {
            $scriptUrl = $extension->get_extension_url() . '/dist/assets/index.js';
            $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';
        } else {
            // fallback
            $scriptUrl = content_url('themes/jankx/extensions/svg-data-map/dist/assets/index.js');
            $styleUrl = content_url('themes/jankx/extensions/svg-data-map/dist/assets/index.css');
        }

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
     * enqueue_block_assets fires in BOTH the editor iframe AND frontend,
     * which is what we need to get TailwindCSS inside the editor iframe.
     */
    public function enqueueBlockAssets()
    {
        $extension = \Jankx\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $cssPath = $this->blockPath . '/dist/assets/index.css';
        if (!file_exists($cssPath)) return;

        $styleUrl = $extension->get_extension_url() . '/dist/assets/index.css';

        wp_enqueue_style(
            'jankx-svg-data-map',
            $styleUrl,
            [],
            '1.0.0'
        );
    }

    public function render($attributes, $content = '', $block = null)
    {
        $config = $attributes['config'] ?? [];
        if (empty($config) || empty($config['globalSvgContent'])) {
            return is_admin() ? __('Vui lòng cấu hình bản đồ từ SVG.', 'jankx') : '';
        }

        if (is_admin()) {
            return '';
        }

        ob_start();
        ?>
        <div class="jankx-svg-data-map-runtime animate-fade-in" data-config="<?php echo esc_attr(json_encode($config)); ?>">
            <div class="flex flex-col lg:flex-row gap-6 p-4 md:p-6 bg-slate-50/50 rounded-xl border border-slate-200">
                
                <div class="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-100 p-4 relative overflow-hidden flex items-center justify-center min-h-[400px]">
                    <div class="jankx-svg-map-wrapper w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain">
                        <?php echo $config['globalSvgContent']; ?>
                    </div>
                </div>

                <div class="lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <div class="jankx-svg-map-info-panel h-full">
                        <div class="text-center h-full flex flex-col items-center justify-center">
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
                    </div>
                </div>
            </div>
            
            <style>
                <?php
                if (!empty($config['regions'])) {
                    foreach ($config['regions'] as $region) {
                        if (empty($region['id'])) continue;
                        $id = sanitize_html_class($region['id']);
                        $defaultColor = esc_attr($region['defaultColor'] ?? '#e2e8f0');
                        $hoverColor = esc_attr($region['hoverColor'] ?? '#6366f1');
                        echo "
                        .jankx-svg-map-wrapper svg #{$id} {
                            fill: {$defaultColor};
                            transition: fill 0.3s ease;
                            cursor: pointer;
                        }
                        .jankx-svg-map-wrapper svg #{$id}:hover,
                        .jankx-svg-map-wrapper svg #{$id}.jankx-map-active {
                            fill: {$hoverColor} !important;
                        }
                        ";
                    }
                }
                ?>
            </style>
        </div>
        <?php
        return ob_get_clean();
    }
}
