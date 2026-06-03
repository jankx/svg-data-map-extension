<?php
namespace Jankx\Extensions\SvgDataMap;

use Jankx\Extensions\AbstractExtension;
use Jankx\Extensions\SvgDataMap\Gutenberg\SvgDataMapBlock;
use Jankx\Extensions\SvgDataMap\Gutenberg\SvgDataMapInfoBlock;

class SvgDataMapExtension extends AbstractExtension
{
    protected static $instance;

    public function __construct()
    {
        $this->register_autoloader();
        parent::__construct();
    }

    protected function register_autoloader()
    {
        spl_autoload_register(function ($class) {
            $prefix = 'Jankx\\Extensions\\SvgDataMap\\';
            $base_dir = __DIR__ . '/'; // Current file is in includes/

            $len = strlen($prefix);
            if (strncmp($prefix, $class, $len) !== 0) {
                return;
            }

            $relative_class = substr($class, $len);
            $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

            if (file_exists($file)) {
                require $file;
            }
        });
    }

    public function init(): void
    {
        self::$instance = $this;
        add_action('wp_ajax_svg_data_map_fetch_posts', [$this, 'ajax_fetch_posts']);
        add_action('wp_ajax_nopriv_svg_data_map_fetch_posts', [$this, 'ajax_fetch_posts']);
    }

    public static function get_instance(): ?self
    {
        return self::$instance;
    }

    public function register_hooks(): void
    {
        // Register through GutenbergService's official channel
        add_action('jankx/gutenberg/register-blocks', [$this, 'register_blocks_in_service'], 10, 2);
    }

    public function register_blocks_in_service($repository, $app)
    {
        $extension_path = rtrim($this->get_extension_path(), '/');
        $blocks_dir = $extension_path . '/blocks';

        if (is_dir($blocks_dir)) {
            // Map Block
            if (file_exists($blocks_dir . '/map/block.json')) {
                $block = new SvgDataMapBlock($blocks_dir . '/map');
                $repository->registerBlock($block);
            }

            // Info Block
            if (file_exists($blocks_dir . '/info/block.json')) {
                $block = new SvgDataMapInfoBlock($blocks_dir . '/info');
                $repository->registerBlock($block);
            }
        } else {
            // Fallback to root block.json for backward compatibility if needed
            if (file_exists($extension_path . '/block.json')) {
                $block = new SvgDataMapBlock($extension_path);
                $repository->registerBlock($block);
            }
        }
    }



    public function ajax_fetch_posts()
    {
        $term_id = isset($_POST['term_id']) ? intval($_POST['term_id']) : 0;
        $taxonomy = isset($_POST['taxonomy']) ? sanitize_text_field($_POST['taxonomy']) : 'category';
        $post_type = isset($_POST['post_type']) ? sanitize_text_field($_POST['post_type']) : 'post';

        if (!$term_id) {
            wp_send_json_error(['message' => 'Invalid parameters']);
        }

        $args = [
            'post_type' => $post_type,
            'posts_per_page' => 5,
            'tax_query' => [
                [
                    'taxonomy' => $taxonomy,
                    'field' => 'term_id',
                    'terms' => $term_id
                ]
            ]
        ];

        $query = new \WP_Query($args);
        $html = '';

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $title = get_the_title();
                $link = get_permalink();
                $excerpt = get_the_excerpt();
                if (empty($excerpt)) {
                    $excerpt = wp_trim_words(get_the_content(), 20);
                }
                
                $html .= '<div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow transition mb-4 animate-in">';
                $html .= '<h3 class="font-bold text-slate-900 text-base mb-1.5 tracking-tight">' . esc_html($title) . '</h3>';
                $html .= '<p class="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap break-words line-clamp-3">' . esc_html($excerpt) . '</p>';
                $html .= '<a href="' . esc_url($link) . '" target="_blank" class="inline-flex items-center gap-1 mt-3 font-sans font-bold text-xs text-amber-800 hover:text-amber-900 transition-colors">';
                $html .= '<span>Xem chi tiết</span>';
                $html .= '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6"></polyline></svg>';
                $html .= '</a>';
                $html .= '</div>';
            }
            wp_reset_postdata();
        } else {
            $html = '<div class="bg-white/80 backdrop-blur-sm p-8 rounded-xl text-center border border-dashed border-sky-300">';
            $html .= '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-sky-500/80 mx-auto mb-2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>';
            $html .= '<p class="text-sm font-semibold text-sky-900">Không có dữ liệu</p>';
            $html .= '<p class="text-xs text-sky-700/80 mt-1">Vùng này chưa được gán nội dung nào.</p>';
            $html .= '</div>';
        }

        wp_send_json_success(['html' => $html]);
    }

}
