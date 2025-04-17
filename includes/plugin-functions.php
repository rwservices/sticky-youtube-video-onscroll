<?php
/**
 * @package function
 */
class SvyoOption{

	public function __construct(){
		global $block_content, $block;
	}

	public function register(){	
		
		add_filter( 'render_block', array( $this,'custom_youtube_block'), 11 , 2);		
		add_action( 'wp_footer',array($this,'youtube_custom_scripts'));
		add_action( 'wp_enqueue_scripts', array( $this,'svyo_custom_inline_style'));
		
	}	

	public function custom_youtube_block( $block_content, $block ) {		
		
	  	// use blockName to only affect the desired block 'core-embed/youtube', main

	  	if( $syvos_enable_youtube_sticky == 'no' ){
	  		return $block_content;
	  	}

	  	if( "core/embed" !== $block['blockName'] ) {
	    	return $block_content;
	  	}

	  	if( 'video' !== $block['attrs']['type'] && 'youtube' !== $block['attrs']['providerNameSlug']) {
	  		return $block_content;
	  	}

	  	$url = $block['attrs']['url'];
	  	$parts = explode('?v=', $url);
	  	
	  	$youtube_video_id = $this -> get_YoutubeVideoIdFromUrl( $url );	

		$position_class = '';
		$admin_syvos_video_position 	= get_option( 'admin_syvos_video_position',3 );
		if( $admin_syvos_video_position == 1 ){
			$position_class = 'left-position-class';
		}elseif( $admin_syvos_video_position == 2 ){
			$position_class = 'center-position-class';
		}else{
			$position_class = 'right-positon-class';
		}

		$admin_syvos_width = absint(get_option('admin_syvos_width', 280));
		$admin_syvos_height = absint(get_option('admin_syvos_height', 160));
		$front_syvos_syvos_width = $admin_syvos_width + 470;
		$front_syvos_video_height = $admin_syvos_height + 262;
		$syvos_enable_youtube_sticky = esc_attr(get_post_meta(get_the_ID(), 'syvos_enable_youtube_sticky', TRUE));

		$content = '';
		$content .= '<section class="videowrapper ytvideo '.esc_attr($position_class).'">';
		$content .= '<a href="javascript:void(0);" class="close-button"></a>';
		$content .= '<i class="fa fa-arrows-alt" aria-hidden="true"></i>';
		$content .= '<div class="gradient-overlay"></div>';	
		$content .= '<iframe width="'.esc_attr($front_syvos_syvos_width).'" height="'.esc_attr($front_syvos_video_height).'" src="https://www.youtube.com/embed/'.esc_attr($youtube_video_id).'?enablejsapi=1&rel=0&controls=1&showinfo=0" frameborder="0" allowfullscreen></iframe>';
		$content .= '</section>';

		return $content;
	}

	public function get_YoutubeVideoIdFromUrl( $url = '' ){
		global $post;
	    $regs = array();
	    $id = '';
	    preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $match); 
	    $id = isset($match[1]) ? $match[1]: '';
	    return $id;
	}

	public function svyo_custom_inline_style(){
		wp_enqueue_style( 'svyo-style', plugins_url( 'syvo-style.css', __FILE__ ));

		$admin_syvos_width 				= esc_attr( get_option( 'admin_syvos_width',280 ));
		$admin_syvos_height 			= esc_attr( get_option( 'admin_syvos_height',160 ));		
		$admin_syvos_cross_position 	= $admin_syvos_height - absint( 5 );

		$syvos_custom_css = ".ytvideo .is-sticky, .is-sticky{ 
								width : {$admin_syvos_width}px;
								height : {$admin_syvos_height}px;
	                		}
	                		.close-button{
	                			bottom : {$admin_syvos_cross_position}px;
	                		}";

        wp_add_inline_style( 'svyo-style', $syvos_custom_css );
	}

	public function youtube_custom_scripts(){
		$admin_syvos_enable_disable 	= esc_attr( get_option( 'admin_syvos_enable_disable',1 ) );

		if( $admin_syvos_enable_disable == 1 ){
			wp_enqueue_script( 'svyo-video-script', SYVOS_URL .'assets/js/svyo-video-script.js',array(), SYVOS_VER ,true );	
			
		}
		
	}

}

if( class_exists('SvyoOption') ){
	$SvyoOption = new SvyoOption();
	$SvyoOption	-> register();
}
