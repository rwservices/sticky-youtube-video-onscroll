(function($) {
    var fire = {
        youtube: function() {
            var ytIframeList, videoList, currentPlayer, closeButton, gradientOverlay, fullScreenIcon;
            var inViewPortBol = false;
            var ytIframeIdList = [];
            var ytVideoId = [];
            var ytPlayerId = [];

            // Wait for DOM to be fully loaded
            $(document).ready(function() {
                // Load YouTube Iframe API
                var youTubeVideoTag = document.createElement('script');
                youTubeVideoTag.src = "//www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                document.body.appendChild(youTubeVideoTag, firstScriptTag);

                // Get all iframes and process YouTube ones
                ytIframeList = document.getElementsByTagName("iframe");

                for (var i = 0; i < ytIframeList.length; i++) {
                    var src = ytIframeList[i].src;
                    // Check if it's a YouTube iframe
                    if (src.includes('youtube.com/embed/')) {
                        // Add enablejsapi=1 if not present
                        if (!src.includes('enablejsapi=1')) {
                            ytIframeList[i].src = src + (src.includes('?') ? '&' : '?') + 'enablejsapi=1';
                        }
                        var url = ytIframeList[i].src.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                        if (url[2] !== undefined) {
                            var ID = url[2].split(/[^0-9a-z_\-]/i)[0];
                            ytIframeIdList.push(ID);
                            ytIframeList[i].id = "iframe" + i;
                            ytVideoId.push("ytVideoId" + i);
                            ytVideoId[i] = document.getElementById(ytIframeList[i].id);
                            ytPlayerId.push("player" + i);
                        }
                    }
                }

                closeButton = document.querySelector("a.close-button");
                gradientOverlay = document.querySelector(".gradient-overlay");
                fullScreenIcon = document.querySelector("i.fa.fa-arrows-alt");
                fullScreenPlay();
            });

            // Expose onYouTubeIframeAPIReady globally
            window.onYouTubeIframeAPIReady = function() {
                for (var i = 0; i < ytIframeIdList.length; i++) {
                    ytPlayerId[i] = new YT.Player(ytIframeList[i].id, {
                        events: {
                            "onStateChange": onPlayerStateChange
                        }
                    });
                }
            };

            function onPlayerStateChange(event) {
                for (var i = 0; i < ytPlayerId.length; i++) {
                    if (ytPlayerId[i].getPlayerState() === 1) { // Playing
                        currentPlayer = ytVideoId[i];
                        ytVideoId[i].classList.remove("is-paused");
                        ytVideoId[i].classList.add("is-playing");
                        break;
                    }
                }
                for (var i = 0; i < ytVideoId.length; i++) {
                    if (currentPlayer === ytVideoId[i]) continue;
                    ytVideoId[i].classList.remove("is-playing");
                    ytVideoId[i].classList.add("is-paused");
                }
                for (var i = 0; i < ytPlayerId.length; i++) {
                    if (ytPlayerId[i].getPlayerState() === 2) { // Paused
                        ytVideoId[i].classList.add("is-paused");
                        ytVideoId[i].classList.remove("is-playing");
                        ytPlayerId[i].pauseVideo();
                    }
                }
                for (var i = 0; i < ytPlayerId.length; i++) {
                    if (ytVideoId[i].classList.contains("is-sticky")) {
                        ytPlayerId[i].pauseVideo();
                        ytVideoId[i].classList.remove("is-sticky");
                        fullScreenIcon.style.display = "none";
                    }
                }
                for (var i = 0; i < ytPlayerId.length; i++) {
                    if (ytPlayerId[i].getPlayerState() === 0) { // Ended
                        ytVideoId[i].classList.remove("is-playing");
                        ytVideoId[i].classList.remove("is-paused");
                    }
                }
                videohandler();
            }

            function videohandler() {
                if (currentPlayer && closeButton) {
                    closeFloatVideo();
                    closeButton.addEventListener("click", function(e) {
                        closeButton.style.display = "none";
                        if (currentPlayer.classList.contains("is-sticky")) {
                            currentPlayer.classList.remove("is-sticky");
                            closeFloatVideo();
                            for (var i = 0; i < ytVideoId.length; i++) {
                                if (currentPlayer === ytVideoId[i]) {
                                    ytPlayerId[i].pauseVideo();
                                }
                            }
                        } else {
                            for (var i = 0; i < ytVideoId.length; i++) {
                                if (currentPlayer !== ytVideoId[i]) {
                                    ytVideoId[i].classList.remove("is-sticky");
                                    closeFloatVideo();
                                }
                            }
                        }
                        
                    });
                }
            }

            $(window).on('scroll', function() {
                inViewPortBol = inViewPort();
                if (currentPlayer) {
                    if (!inViewPortBol && currentPlayer.classList.contains("is-playing")) {
                        for (var i = 0; i < ytVideoId.length; i++) {
                            if (currentPlayer !== ytVideoId[i]) {
                                ytVideoId[i].classList.remove("is-sticky");
                            }
                        }
                        currentPlayer.classList.add("is-sticky");
                        openFloatVideo();
                    } else if (currentPlayer.classList.contains("is-sticky")) {
                        currentPlayer.classList.remove("is-sticky");
                        closeFloatVideo();
                    }
                }
            });

            function fullScreenPlay() {
                if (fullScreenIcon) {
                    fullScreenIcon.addEventListener("click", function() {
                        if (currentPlayer.requestFullscreen) {
                            currentPlayer.requestFullscreen();
                        } else if (currentPlayer.msRequestFullscreen) {
                            currentPlayer.msRequestFullscreen();
                        } else if (currentPlayer.mozRequestFullScreen) {
                            currentPlayer.mozRequestFullScreen();
                        } else if (currentPlayer.webkitRequestFullscreen) {
                            currentPlayer.webkitRequestFullscreen();
                        }
                    });
                }
            }

            function inViewPort() {
                if (currentPlayer) {
                    var videoParentLocal = currentPlayer.parentElement.getBoundingClientRect();
                    return videoParentLocal.bottom > 0 &&
                        videoParentLocal.right > 0 &&
                        videoParentLocal.left < (window.innerWidth || document.documentElement.clientWidth) &&
                        videoParentLocal.top < (window.innerHeight || document.documentElement.clientHeight);
                }
                return false;
            }

            function openFloatVideo() {
                if (closeButton) closeButton.style.display = "block";
                if (gradientOverlay) gradientOverlay.style.display = "block";
                if (fullScreenIcon) fullScreenIcon.style.display = "block";
            }

            function closeFloatVideo() {
                if (closeButton) closeButton.style.display = "none";
                if (gradientOverlay) gradientOverlay.style.display = "none";
                if (fullScreenIcon) fullScreenIcon.style.display = "none";
            }
        }
    };

    // Execute the youtube function when jQuery is ready
    $(document).ready(function() {
        fire.youtube();
    });
})(jQuery);