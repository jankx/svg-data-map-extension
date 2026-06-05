<?php
namespace Puleeno\Extensions\SvgDataMap\Gutenberg;

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

        $extension = \Puleeno\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

        $scriptUrl = $extension->get_extension_url() . '/dist/assets/index.js';

        wp_enqueue_script(
            'jankx-svg-data-map-info-editor',
            $scriptUrl,
            $assets['dependencies'],
            '999.9.9',
            true
        );
    }

    protected function registerFrontendAssets(): void
    {
        $extension = \Puleeno\Extensions\SvgDataMap\SvgDataMapExtension::get_instance();
        if (!$extension) return;

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
        $mapId        = $attributes['mapId'] ?? 'default-map';
        $hasContent   = trim((string) $content) !== '';

        ob_start();
        ?>
        <div class="jankx-svg-data-map-info-runtime"
             id="svg-map-info-<?php echo esc_attr($mapId); ?>"
             data-map-id="<?php echo esc_attr($mapId); ?>">

            <div class="jankx-svg-map-info-container">

                <?php if ($hasContent) : ?>
                    <?php
                    /**
                     * The rendered inner blocks (advanced-filters + dynamic-data-layout)
                     * are output here. frontend.js will listen to region-selected events
                     * and update a taxQuery/meta on the dynamic-data-layout so the list
                     * automatically filters to match the selected map region.
                     */
                    echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
                    ?>
                <?php else : ?>
                    <!-- Placeholder shown when no inner blocks have been configured yet -->
                    <div class="jankx-svg-map-info-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"
                             fill="none" stroke="#1E4D65" stroke-width="1.5"
                             stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                        </svg>

                        <h3><?php esc_html_e('Bắt đầu Hành Trình Khám Phá', 'jankx'); ?></h3>

                        <p><?php esc_html_e('Vui lòng nhấp chuột chọn bất kỳ địa danh nào trên bản đồ để hiển thị thông tin chi tiết.', 'jankx'); ?></p>
                    </div>
                <?php endif; ?>

            </div><!-- .jankx-svg-map-info-container -->

        </div><!-- .jankx-svg-data-map-info-runtime -->
        <?php
        return ob_get_clean();
    }
}
