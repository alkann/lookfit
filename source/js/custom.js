(function ($) {
    "use strict";
    /* ==========================================================================
     smoothscroll
     ========================================================================== */
    $('a.btn, #header-2 .navbar-right a[href*=#]:not([href=#])').on('click', function () {
        if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top
                }, 1000);
                return false;
            }
        }
    });

    /* ==========================================================================
     scroll timer
     ========================================================================== */
    var scrollTimer = null;
    $(window).scroll(function () {
        var viewportHeight = $(this).height(),
                scrollbarHeight = viewportHeight / $(document).height() * viewportHeight,
                progress = $(this).scrollTop() / ($(document).height() - viewportHeight),
                distance = progress * (viewportHeight - scrollbarHeight) + scrollbarHeight / 2 - $('#scroll').height() / 2;
        $('#scroll')
                .css('top', distance)
                .text(' (' + Math.round(progress * 100) + '%)')
                .fadeIn(100);
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function () {
            $('#scroll').fadeOut();
        }, 1500);
    });


    /* ==========================================================================
     mobile nav
     ========================================================================== */
    $('#menuu').mmenu({
        extensions: ['effect-slide-menu', 'pageshadow'],
        counters: true,
        navbar: {
            title: '<img src="img/logo.png" />'
        },
        navbars: [
            {
                position: 'top',
                content: [
                    'prev',
                    'title',
                    'close'
                ]
            }, {
                position: 'bottom',
                content: [
                    '<a href="#" target="_blank">buy now</a>'
                ]
            }
        ]
    });

    /* ==========================================================================
     page transitions
     ========================================================================== */
    $(".animsition").animsition({
        inClass: 'fade-in-down-sm',
        outClass: 'fade-out-down-sm',
        inDuration: 800,
        outDuration: 800,
        loading: true,
        loadingParentElement: 'body', //animsition wrapper element
        loadingClass: 'site-loading',
        unSupportCss: ['animation-duration',
            '-webkit-animation-duration',
            '-o-animation-duration'
        ],
        overlay: false,
        overlayClass: 'animsition-overlay-slide',
        overlayParentElement: 'body'
    });

    /* ==========================================================================
     header effect on scroll
     ========================================================================== */
    if ($(".header").hasClass("transparent-dark")) {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 10) {
                $('.header').addClass("small-header");
                $('.header').removeClass("transparent-dark");
            }
            else {
                $('.header').removeClass("small-header");
                $('.header').addClass("transparent-dark");
            }
        });
    }

    if ($(".header").hasClass("transparent")) {
        $(window).scroll(function () {
            if ($(this).scrollTop() > 10) {
                $('.header').addClass("small-header");
                $('.header').removeClass("transparent");
            }
            else {
                $('.header').removeClass("small-header");
                $('.header').addClass("transparent");
            }
        });

    }

    $(window).scroll(function () {
        if ($(this).scrollTop() > 10) {
            $('.header').addClass("small-header");
        } else {
            $('.header').removeClass("small-header");
        }

    });

    /* ==========================================================================
     hide desk top nav bar
     ========================================================================== */
    $(window).on('resize', function () {
        var win = $(this); //this = window
        if (win.width() >= 1000) {
            $('.navbar-nav.navbar-right').css({
                display: 'block'
            });
            $('#toggle-sidebar').css({
                display: 'none'
            });
        }
        else {
            $('.navbar-nav.navbar-right').css({
                display: 'none'
            });
            $('#toggle-sidebar').css({
                display: 'block'
            });


            $('.header').addClass('small-header');
        }
    });
    /* ==========================================================================
     toggle top search
     ========================================================================== */
    $('.top-search').hide();
    $("#toggle-search").on('click', function () {
        $('.top-search').slideToggle(200);

    });


    /* ==========================================================================
     toggle share
     ========================================================================== */
    $(".toggle-share").on('click', function () {
        $('ul').toggleClass('open');
    });
    /* ==========================================================================
     bg slideshow
     ========================================================================== */
    $(".bg-slideshwo").vegas({
        overlay: true,
        transition: 'random',
        transitionDuration: 4000,
        delay: 10000,
        animation: 'random',
        animationDuration: 20000,
        slides: [
            {src: "img/1.jpg"},
            {src: "img/slide31.jpg"},
            {src: "img/slider2.jpg"}
        ]
    });

    /* ==========================================================================
     particleground
     ========================================================================== */
    $('#particle-ground').particleground({
        dotColor: '#ffffff',
        lineColor: '#ffffff'
    });

    /* ==========================================================================
     rotate text
     ========================================================================== */
    $(".text-rotate").textrotator({
        animation: "dissolve", // You can pick the way it animates when rotating through words. Options are dissolve (default), fade, flip, flipUp, flipCube, flipCubeUp and spin.
        separator: ",", // If you don't want commas to be the separator, you can define a new separator (|, &, * etc.) by yourself using this field.
        speed: 3000 // How many milliseconds until the next word show.
    });


    /* ==========================================================================
     Flickr Feed
     ========================================================================== */
    $('#flickrImages').jflickrfeed({
        limit: 6,
        qstrings: {
            id: '52617155@N08'
        },
        itemTemplate: '<li>' + '<a href="{{image_b}}" class="show-img" data-fancybox-group="gallery-fliker" title="{{title}}"><img src="{{image_s}}" alt="{{title}}" /></a>' + '</li>'
    });

    /* ==========================================================================
     add Sections backgrounds
     ========================================================================== */
    var pageSection = $("div , section");
    pageSection.each(function (indx) {
        if ($(this).attr("data-background")) {
            $(this).css("background-image", "url(" + $(this).data("background") + ")");
        }
    });


    /* ==========================================================================
     parallax1
     ========================================================================== */
    $('.parallax-1').mousemove(function (e) {
        var x = (e.pageX * -0.3 / 2), y = (e.pageY * -1 / 2);
        $(this).css('background-position', x + 'px ' + y + 'px');
    });

    /* ==========================================================================
     button Position Aware
     ========================================================================== */
    $(function () {
        $('.btn-position').on('mouseenter', function (e) {
            var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
            $(this).find('span').css({top: relY, left: relX});
        })
                .on('mouseout', function (e) {
                    var parentOffset = $(this).offset(),
                            relX = e.pageX - parentOffset.left,
                            relY = e.pageY - parentOffset.top;
                    $(this).find('span').css({top: relY, left: relX});
                });
        $('[href=#]').on('click', function () {
            return false;
        });
    });


    /* ==========================================================================
     roll effect
     ========================================================================== */
    $('.roll-effect').each(function () {
        var linkText = $(this).text();
        $(this).addClass('roll-link').html($('<span />', {'data-title': linkText, html: linkText}));
    });


    /* ==========================================================================
     all sliders in the template
     ========================================================================== */
    $('#ent-hero-slider').sliderPro({
        width: '100%',
        height: '100%',
        fade: true,
        forceSize: 'fullWindow',
        arrows: true,
        waitForLayers: true,
        buttons: false,
        autoplay: false,
        autoplayDelay: 6000,
        touchSwipe: false,
        autoScaleLayers: false,
        slideAnimationDuration: 1500,
        gotoSlide: function () {
            $('.letter-effect').letterfx({"fx": "fly-left", "fx_duration": "500ms"});
            $('.letter-effect-2').letterfx({"fx": "smear", "fx_duration": "500ms"});


        }
    });

    /* ==========================================================================
     post slider
     ========================================================================== */
    $('.post-slider').owlCarousel({
        items: 1,
        loop: true,
        autoplay: false,
        margin: 30,
        smartSpeed: 450,
        nav: true,
        navText: [
            '<i class="fa fa-angle-left"></i>',
            '<i class="fa fa-angle-right"></i>'
        ]
    });


    /* ==========================================================================
     partners-slider
     ========================================================================== */
    $('.partners-slider').owlCarousel({
        items: 4,
        loop: true,
        autoplay: true,
        margin: 30,
        smartSpeed: 450,
        nav: true,
        navText: [
            '<i class="fa fa-angle-left"></i>',
            '<i class="fa fa-angle-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0: {
                items: 2,
                nav: false

            },
            600: {
                items: 3,
                nav: false
            },
            1000: {
                items: 4,
                nav: true

            }
        }
    });

    /* ==========================================================================
     partners-slider
     ========================================================================== */
    $('.banner-text-slider').owlCarousel({
        animateIn: 'fadeInDown',
        animateOut: 'fadeOutUp',
        items: 1,
        autoplay: true,
        loop: true,
        margin: 30,
        smartSpeed: 450,
        nav: false,
        dots: true,
        touchDrag: true,
        mouseDrag: false
    });

    /* ==========================================================================
     portfolio-slider
     ========================================================================== */
    $('.portfolio-slider').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        video: true,
        margin: 30,
        smartSpeed: 450,
        nav: true,
        navText: [
            '<i class="fa fa-angle-left"></i>',
            '<i class="fa fa-angle-right"></i>'
        ]
    });

    /* ==========================================================================
     brand-slider
     ========================================================================== */
    $('.brand-slider').owlCarousel({
        items: 2,
        autoplay: true,
        video: true,
        margin: 30,
        smartSpeed: 500,
        loop: true
    });

    /* ==========================================================================
     tesimonials-slider
     ========================================================================== */
    $('.tesimonials-slider').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        smartSpeed: 450,
        margin: 30,
        nav: true,
        navText: [
            '<i class="fa fa-angle-left"></i>',
            '<i class="fa fa-angle-right"></i>'
        ]
    });

    /* ==========================================================================
     related-post-slider
     ========================================================================== */
    $('.related-post-slider').owlCarousel({
        items: 4,
        loop: true,
        autoplay: true,
        smartSpeed: 1550,
        nav: false,
        dots: false,
        responsiveClass: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 3,
                loop: false
            },
            1200: {
                items: 4,
                loop: false
            }
        }
    });

    /* ==========================================================================
     recent-news-slider (footer)
     ========================================================================== */
    $('.recent-news-slider').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        smartSpeed: 450,
        margin: 10,
        dots: true
    });


    /* ==========================================================================
     single project
     ========================================================================== */
    $('.single-project-2 ul').owlCarousel({
        items: 1,
        loop: true,
        autoplay: false,
        margin: 30,
        smartSpeed: 450,
        nav: true,
        touchDrag: true,
        mouseDrag: false,
        navText: [
            '<i class="fa fa-angle-left"></i>',
            '<i class="fa fa-angle-right"></i>'
        ]
    });


    /* ==========================================================================
     animate PROGRESS BAR inview
     ========================================================================== */
    $('.skillbar').waypoint(function () {
        $('.skillbar').each(function () {
            var t = $(this),
                    dataperc = t.attr('data-perc'),
                    barperc = Math.round(dataperc * 4.0);
            t.find('.bar').animate({width: barperc}, dataperc * 25);
            function perc() {
                var length = t.find('.bar').css('width'),
                        perc = Math.round(parseInt(length, 10) / 4.0),
                        labelpos = parseInt(length, 8);
                t.find('.perc').text(perc + '%');
            }
            perc();
            setInterval(perc, 0);
        });
    }, {offset: 500});


    /* ==========================================================================
     count to.
     ========================================================================== */
    $('.fun-fact').waypoint(function () {
// first timer
        $('.timer1').countTo({
            from: 0, // the number you want to start
            to: 159, // the number you want to reach
            speed: 3500,
            refreshInterval: 100

        });
        // second timer
        $('.timer2').countTo({
            from: 0, // the number you want to start
            to: 489, // the number you want to reach
            speed: 3500,
            refreshInterval: 50

        });
        // third timer
        $('.timer3').countTo({
            from: 0, // the number you want to start
            to: 346, // the number you want to reach
            speed: 3500,
            refreshInterval: 10
        });
        // fourth timer
        $('.timer4').countTo({
            from: 0, // the number you want to start
            to: 792, // the number you want to reach
            speed: 3500,
            refreshInterval: 10
        });
    },
            {offset: 500});


    /* ==========================================================================
     fancybox lightbox
     ========================================================================== */
    $('a.show-img').fancybox();

    /* ==========================================================================
     Accordion & Toggle
     ========================================================================== */
    $(".accordion .accordion-title").each(function () {
        $(this).on('click', function () {
            if ($(this).parent().parent().hasClass("toggle-accordion")) {
                $(this).parent().find("li:first .accordion-title").addClass("active");
                $(this).parent().find("li:first .accordion-title").next(".accordion-inner").addClass("active");
                $(this).toggleClass("active");
                $(this).next(".accordion-inner").slideToggle().toggleClass("active");
                $(this).find("i").toggleClass("ti-minus").toggleClass("ti-plus");
            } else {
                if ($(this).next().is(":hidden")) {
                    $(this).parent().parent().find(".accordion-title").removeClass("active").next().slideUp(200);
                    $(this).parent().parent().find(".accordion-title").next().removeClass("active").slideUp(200);
                    $(this).toggleClass("active").next().slideDown(200);
                    $(this).next(".accordion-inner").toggleClass("active");
                    $(this).parent().parent().find("i").removeClass("ti-plus").addClass("ti-minus");
                    $(this).find("i").removeClass("ti-minus").addClass("ti-plus");
                }
            }
            return false;
        });
    });


    /* ==========================================================================
     news tabs
     ========================================================================== */
    $('.news-tabs').tabslet({
        mouseevent: 'click',
        attribute: 'href',
        animation: true
    });

    /* ==========================================================================
     skrollr
     ========================================================================== */

    var s = skrollr.init({
        forceHeight: !1,
        smoothScrolling: !1
    });
    if (s.isMobile()) {
        s.destroy();
    }
    /* ==========================================================================
     Parallax  
     ========================================================================== */
    $(".parallax-0").parallax("50%", 0.1);
    $(".parallax-2").parallax("50%", 0.2);
    $(".parallax-3").parallax("50%", 0.3);
    $(".parallax-4").parallax("50%", 0.4);
    $(".parallax-5").parallax("50%", 0.5);
    $(".parallax-6").parallax("50%", 0.6);
    $(".parallax-7").parallax("50%", 0.7);
    $(".parallax-8").parallax("50%", 0.5);
    $(".parallax-9").parallax("50%", 0.5);
    $(".parallax-10").parallax("50%", 0.5);
    $(".parallax-11").parallax("50%", 0.05);


    /* ==========================================================================
     isotope portfolio
     ========================================================================== */
    $(window).load(function () {
        var $containerMasonry = $('#projects-grid.masonry-gride');
        $containerMasonry.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            },
            masonry: {
                columnWidth: 0.5
            }

        });
        var $container = $('#projects-grid');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }

        });
        $('#filter-1 a').on('click', function () {
            $('#filter-1 a.current').removeClass('current');
            $(this).addClass('current');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'ease',
                    queue: false
                }
            });
            return false;
        });
    });


    /* ==========================================================================
     vertical nav
     ========================================================================== */
    $(document).ready(function ($) {
        var contentSections = $('.cd-section'),
                navigationItems = $('#cd-vertical-nav a');

        updateNavigation();
        $(window).on('scroll', function () {
            updateNavigation();
        });

        //smooth scroll to the section
        navigationItems.on('click', function (event) {
            event.preventDefault();
            smoothScroll($(this.hash));
        });
        //smooth scroll to second section
        $('.cd-scroll-down').on('click', function (event) {
            event.preventDefault();
            smoothScroll($(this.hash));
        });

        //open-close navigation on touch devices
        $('.touch .cd-nav-trigger').on('click', function () {
            $('.touch #cd-vertical-nav').toggleClass('open');

        });
        //close navigation on touch devices when selectin an elemnt from the list
        $('.touch #cd-vertical-nav a').on('click', function () {
            $('.touch #cd-vertical-nav').removeClass('open');
        });

        function updateNavigation() {
            contentSections.each(function () {
                $this = $(this);
                var activeSection = $('#cd-vertical-nav a[href="#' + $this.attr('id') + '"]').data('number') - 1;
                if (($this.offset().top - $(window).height() / 2 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height() / 2 > $(window).scrollTop())) {
                    navigationItems.eq(activeSection).addClass('is-selected');
                } else {
                    navigationItems.eq(activeSection).removeClass('is-selected');
                }
            });
        }

        function smoothScroll(target) {
            $('body,html').animate(
                    {'scrollTop': target.offset().top},
            600
                    );
        }
    });



    $(document).ready(function () {
        $(document).on("scroll", onScroll);

        $('#cd-vertical-nav a[href^="#"]').on('click', function (e) {
            e.preventDefault();
            $(document).off("scroll");

            $('#cd-vertical-nav ul li a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');

            var target = this.hash;
            $target = $(target);
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top + 2
            }, 500, 'swing', function () {
                window.location.hash = target;
                $(document).on("scroll", onScroll);
            });
        });
    });
    function onScroll(event) {
        var scrollPosition = $(document).scrollTop();
        $('#cd-vertical-nav ul li a').each(function () {
            var currentLink = $(this);
            var refElement = $(currentLink.attr("href"));
            if (refElement.position().top <= scrollPosition && refElement.position().top + refElement.height() > scrollPosition) {
                $('#cd-vertical-nav ul li a').removeClass("active");
                currentLink.addClass("active");
            }
            else {
                currentLink.removeClass("active");
            }
        });
    }
    /* ==========================================================================
     to top
     ========================================================================== */

    $(window).scroll(function () {
        if ($(this).scrollTop() > 400) {
            $('.go-up').fadeIn();
        } else {
            $('.go-up').fadeOut();
        }
    });
    $('.go-up').on('click', function () {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    });
    /* ==========================================================================
     repple effect
     ========================================================================== */
    $("#filter-1 a").ePulse({
// animation speed
        speed: 'fast',
        size: 'small'
    });
})(jQuery);