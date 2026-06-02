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
            $html .= '<ul class="space-y-3">';
            while ($query->have_posts()) {
                $query->the_post();
                $title = get_the_title();
                $link = get_permalink();
                $excerpt = get_the_excerpt();
                if (empty($excerpt)) {
                    $excerpt = wp_trim_words(get_the_content(), 30);
                }
                
                $html .= '<div class="bg-white rounded-2xl p-6 mb-4 shadow-sm hover:shadow-md transition-all duration-300 border border-white group animate-in">';
                $html .= '<h4 class="text-lg font-extrabold text-[#1E4D65] mb-3 leading-tight group-hover:text-blue-600 transition-colors">' . esc_html($title) . '</h4>';
                $html .= '<p class="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-4">' . esc_html($excerpt) . '</p>';
                $html .= '<a href="' . esc_url($link) . '" class="inline-flex items-center text-xs font-bold text-[#D39C7E] uppercase tracking-widest hover:text-[#b07d61] transition-colors">';
                $html .= 'Xem chi tiết <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" /></svg>';
                $html .= '</a>';
                $html .= '</div>';
            }
            $html .= '</div>'; // End list wrapper if needed
            wp_reset_postdata();
        } else {
            $html = '<p class="text-slate-400 text-xs italic">Chưa có bài viết nào trong khu vực này.</p>';
        }

        wp_send_json_success(['html' => $html]);
    }

}
