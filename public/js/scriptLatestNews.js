(function ($) {
    "use strict";
    

    // Background-images
    $("[data-background]").each(function () {
        $(this).css({
            "background-image": "url(" + $(this).data("background") + ")"
        });
    });

    // background color
    $("[data-color]").each(function () {
        $(this).css({
            "background-color": $(this).data("color")
        });
    });

    // progress bar
    $("[data-progress]").each(function () {
        $(this).css({
            "bottom": $(this).data("progress")
        });
    });


    /* ########################################### hero parallax ############################################## */
    window.onload = function () {
        var parallaxBox = document.getElementById("parallax");
    };

    function mouseParallax(id, left, top, mouseX, mouseY, speed) {
        var obj = document.getElementById(id);
        var parentObj = obj.parentNode,
            containerWidth = parseInt(parentObj.offsetWidth),
            containerHeight = parseInt(parentObj.offsetHeight);
        obj.style.left = left - (((mouseX - (parseInt(obj.offsetWidth) / 2 + left)) / containerWidth) * speed) + "px";
        obj.style.top = top - (((mouseY - (parseInt(obj.offsetHeight) / 2 + top)) / containerHeight) * speed) + "px";
    }
    /* ########################################### /hero parallax ############################################## */

    // testimonial-slider
    $(".testimonial-slider").slick({
        dots: true,
        infinite: true,
        speed: 300,
        slidesToShow: 1,
        arrows: false,
        adaptiveHeight: true
    });


    // clients logo slider
    $(".client-logo-slider").slick({
        infinite: true,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        dots: false,
        arrows: false,
        responsive: [{
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 400,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    // Shuffle js filter and masonry
    var Shuffle = window.Shuffle;
    var jQuery = window.jQuery;

    jQuery("input[name=\"shuffle-filter\"]").on("change", function (evt) {
        var input = evt.currentTarget;
        if (input.checked) {
            myShuffle.filter(input.value);
        }
    });



})(jQuery);