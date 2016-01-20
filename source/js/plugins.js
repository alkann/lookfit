/*modernizer*/
window.Modernizr = (function (window, document, undefined) {

    var version = '2.7.1',
            Modernizr = {},
            /*>>cssclasses*/
            // option for enabling the HTML classes to be added
            enableClasses = true,
            /*>>cssclasses*/

            docElement = document.documentElement,
            /**
             * Create our "modernizr" element that we do most feature tests on.
             */
            mod = 'modernizr',
            modElem = document.createElement(mod),
            mStyle = modElem.style,
            /**
             * Create the input element for various Web Forms feature tests.
             */
            inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/,
            /*>>smile*/
            smile = ':)',
            /*>>smile*/

            toString = {}.toString,
            // TODO :: make the prefixes more granular
            /*>>prefixes*/
            // List of property values to set for css tests. See ticket #21
            prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
            /*>>prefixes*/

            /*>>domprefixes*/
            // Following spec is to expose vendor-specific style properties as:
            //   elem.style.WebkitBorderRadius
            // and the following would be incorrect:
            //   elem.style.webkitBorderRadius

            // Webkit ghosts their properties in lowercase but Opera & Moz do not.
            // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
            //   erik.eae.net/archives/2008/03/10/21.48.10/

            // More here: github.com/Modernizr/Modernizr/issues/issue/21
            omPrefixes = 'Webkit Moz O ms',
            cssomPrefixes = omPrefixes.split(' '),
            domPrefixes = omPrefixes.toLowerCase().split(' '),
            /*>>domprefixes*/

            /*>>ns*/
            ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
            inputs = {},
            attrs = {},
            classes = [],
            slice = classes.slice,
            featureName, // used in testing loop


            /*>>teststyles*/
            // Inject element with style element and some CSS rules
            injectElementWithStyles = function (rule, callback, nodes, testnames) {

                var style, ret, node, docOverflow,
                        div = document.createElement('div'),
                        // After page load injecting a fake body doesn't work so check if body exists
                        body = document.body,
                        // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
                        fakeBody = body || document.createElement('body');

                if (parseInt(nodes, 10)) {
                    // In order not to give false positives we create a node for each test
                    // This also allows the method to scale for unspecified uses
                    while (nodes--) {
                        node = document.createElement('div');
                        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
                        div.appendChild(node);
                    }
                }

                // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
                // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
                // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
                // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
                // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
                style = ['&#173;', '<style id="s', mod, '">', rule, '</style>'].join('');
                div.id = mod;
                // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
                // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
                (body ? div : fakeBody).innerHTML += style;
                fakeBody.appendChild(div);
                if (!body) {
                    //avoid crashing IE8, if background image is used
                    fakeBody.style.background = '';
                    //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
                    fakeBody.style.overflow = 'hidden';
                    docOverflow = docElement.style.overflow;
                    docElement.style.overflow = 'hidden';
                    docElement.appendChild(fakeBody);
                }

                ret = callback(div, rule);
                // If this is done after page load we don't want to remove the body so check if body exists
                if (!body) {
                    fakeBody.parentNode.removeChild(fakeBody);
                    docElement.style.overflow = docOverflow;
                } else {
                    div.parentNode.removeChild(div);
                }

                return !!ret;

            },
            /*>>teststyles*/

            /*>>mq*/
            // adapted from matchMedia polyfill
            // by Scott Jehl and Paul Irish
            // gist.github.com/786768
            testMediaQuery = function (mq) {

                var matchMedia = window.matchMedia || window.msMatchMedia;
                if (matchMedia) {
                    return matchMedia(mq).matches;
                }

                var bool;

                injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function (node) {
                    bool = (window.getComputedStyle ?
                            getComputedStyle(node, null) :
                            node.currentStyle)['position'] == 'absolute';
                });

                return bool;

            },
            /*>>mq*/


            /*>>hasevent*/
            //
            // isEventSupported determines if a given element supports the given event
            // kangax.github.com/iseventsupported/
            //
            // The following results are known incorrects:
            //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
            //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
            //   ...
            isEventSupported = (function () {

                var TAGNAMES = {
                    'select': 'input', 'change': 'input',
                    'submit': 'form', 'reset': 'form',
                    'error': 'img', 'load': 'img', 'abort': 'img'
                };

                function isEventSupported(eventName, element) {

                    element = element || document.createElement(TAGNAMES[eventName] || 'div');
                    eventName = 'on' + eventName;

                    // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
                    var isSupported = eventName in element;

                    if (!isSupported) {
                        // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
                        if (!element.setAttribute) {
                            element = document.createElement('div');
                        }
                        if (element.setAttribute && element.removeAttribute) {
                            element.setAttribute(eventName, '');
                            isSupported = is(element[eventName], 'function');

                            // If property was created, "remove it" (by setting value to `undefined`)
                            if (!is(element[eventName], 'undefined')) {
                                element[eventName] = undefined;
                            }
                            element.removeAttribute(eventName);
                        }
                    }

                    element = null;
                    return isSupported;
                }
                return isEventSupported;
            })(),
            /*>>hasevent*/

            // TODO :: Add flag for hasownprop ? didn't last time

            // hasOwnProperty shim by kangax needed for Safari 2.0 support
            _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if (!is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined')) {
        hasOwnProp = function (object, property) {
            return _hasOwnProperty.call(object, property);
        };
    }
    else {
        hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
            return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
        };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
        Function.prototype.bind = function bind(that) {

            var target = this;

            if (typeof target != "function") {
                throw new TypeError();
            }

            var args = slice.call(arguments, 1),
                    bound = function () {

                        if (this instanceof bound) {

                            var F = function () {
                            };
                            F.prototype = target.prototype;
                            var self = new F();

                            var result = target.apply(
                                    self,
                                    args.concat(slice.call(arguments))
                                    );
                            if (Object(result) === result) {
                                return result;
                            }
                            return self;

                        } else {

                            return target.apply(
                                    that,
                                    args.concat(slice.call(arguments))
                                    );

                        }

                    };

            return bound;
        };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss(str) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll(str1, str2) {
        return setCss(prefixes.join(str1 + ';') + (str2 || ''));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is(obj, type) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains(str, substr) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps(props, prefixed) {
        for (var i in props) {
            var prop = props[i];
            if (!contains(prop, "-") && mStyle[prop] !== undefined) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps(props, obj, elem) {
        for (var i in props) {
            var item = obj[props[i]];
            if (item !== undefined) {

                // return the property name as a string
                if (elem === false)
                    return props[i];

                // let's bind a function
                if (is(item, 'function')) {
                    // default to autobind unless override
                    return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll(prop, prefixed, elem) {

        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
                props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if (is(prefixed, "string") || is(prefixed, "undefined")) {
            return testProps(props, prefixed);

            // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
            props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
            return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function () {
        return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function () {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function () {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function () {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function () {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function () {
        var bool;

        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            bool = true;
        } else {
            injectElementWithStyles(['@media (', prefixes.join('touch-enabled),('), mod, ')', '{#modernizr{top:9px;position:absolute}}'].join(''), function (node) {
                bool = node.offsetTop === 9;
            });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function () {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function () {
        return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function () {
        return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function () {
        return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function () {
        return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function () {
        return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function () {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function () {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function () {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function () {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function () {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function () {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function () {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function () {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function () {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function () {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function () {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function () {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function () {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function () {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
                str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
                str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
                // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
                        (str1 + '-webkit- '.split(' ').join(str2 + str1) +
                                // standard syntax             // trailing 'background-image:'
                                prefixes.join(str3 + str1)).slice(0, -str1.length)
                        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function () {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function () {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function () {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if (ret && 'webkitPerspective' in docElement.style) {

            // Webkit allows this media query to succeed only if the feature is enabled.
            // `@media (transform-3d),(-webkit-transform-3d){ ... }`
            injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function (node, rule) {
                ret = node.offsetLeft === 9 && node.offsetHeight === 3;
            });
        }
        return ret;
    };


    tests['csstransitions'] = function () {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function () {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function (node, rule) {
            var style = document.getElementById('smodernizr'),
                    sheet = style.sheet || style.styleSheet,
                    cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

            bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function () {
        var bool;

        injectElementWithStyles(['#', mod, '{font:0/0 a}#', mod, ':after{content:"', smile, '";visibility:hidden;font:3px/1 a}'].join(''), function (node) {
            bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function () {
        var elem = document.createElement('video'),
                bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, '');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, '');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, '');
            }

        } catch (e) {
        }

        return bool;
    };

    tests['audio'] = function () {
        var elem = document.createElement('audio'),
                bool = false;

        try {
            if (bool = !!elem.canPlayType) {
                bool = new Boolean(bool);
                bool.ogg = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '');
                bool.mp3 = elem.canPlayType('audio/mpeg;').replace(/^no$/, '');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav = elem.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '');
                bool.m4a = (elem.canPlayType('audio/x-m4a;') ||
                        elem.canPlayType('audio/aac;')).replace(/^no$/, '');
            }
        } catch (e) {
        }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function () {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    };

    tests['sessionstorage'] = function () {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch (e) {
            return false;
        }
    };


    tests['webworkers'] = function () {
        return !!window.Worker;
    };


    tests['applicationcache'] = function () {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function () {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function () {
        var div = document.createElement('div');
        div.innerHTML = '<svg/>';
        return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function () {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function () {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function (props) {
            for (var i = 0, len = props.length; i < len; i++) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list) {
                // safari false positive's on datalist: webk.it/74252
                // see also github.com/Modernizr/Modernizr/issues/146
                attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function (props) {

            for (var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if (bool) {

                    inputElem.value = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

                        docElement.appendChild(inputElem);
                        defaultView = document.defaultView;

                        // Safari 2-4 allows the smiley as a value, despite making a slider
                        bool = defaultView.getComputedStyle &&
                                defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                                // Mobile android web browser has false positive, so must
                                        // check the height to see if the widget is actually there.
                                                (inputElem.offsetHeight !== 0);

                                        docElement.removeChild(inputElem);

                                    } else if (/^(search|tel)$/.test(inputElemType)) {
                                        // Spec doesn't define any special parsing or detectable UI
                                        //   behaviors so we pass these through as true

                                        // Interestingly, opera fails the earlier test, so it doesn't
                                        //  even make it here.

                                    } else if (/^(url|email)$/.test(inputElemType)) {
                                        // Real url and email support comes with prebaked validation.
                                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                                    } else {
                                        // If the upgraded input compontent rejects the :) text, we got a winner
                                        bool = inputElem.value != smile;
                                    }
                                }

                                inputs[ props[i] ] = !!bool;
                            }
                            return inputs;
                        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
                /*>>inputtypes*/
            }
            /*>>webforms*/


            // End of test definitions
            // -----------------------



            // Run through all tests and detect their support in the current UA.
            // todo: hypothetically we could be doing an array of tests and use a basic loop here.
            for (var feature in tests) {
                if (hasOwnProp(tests, feature)) {
                    // run the test, throw the return value into the Modernizr,
                    //   then based on that boolean, define an appropriate className
                    //   and push it into an array of classes we'll join later.
                    featureName = feature.toLowerCase();
                    Modernizr[featureName] = tests[feature]();

                    classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
                }
            }

            /*>>webforms*/
            // input tests need to run.
            Modernizr.input || webforms();
            /*>>webforms*/


            /**
             * addTest allows the user to define their own feature tests
             * the result will be added onto the Modernizr object,
             * as well as an appropriate className set on the html element
             *
             * @param feature - String naming the feature
             * @param test - Function returning true if feature is supported, false if not
             */
            Modernizr.addTest = function (feature, test) {
                if (typeof feature == 'object') {
                    for (var key in feature) {
                        if (hasOwnProp(feature, key)) {
                            Modernizr.addTest(key, feature[ key ]);
                        }
                    }
                } else {

                    feature = feature.toLowerCase();

                    if (Modernizr[feature] !== undefined) {
                        // we're going to quit if you're trying to overwrite an existing test
                        // if we were to allow it, we'd do this:
                        //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
                        //   docElement.className = docElement.className.replace( re, '' );
                        // but, no rly, stuff 'em.
                        return Modernizr;
                    }

                    test = typeof test == 'function' ? test() : test;

                    if (typeof enableClasses !== "undefined" && enableClasses) {
                        docElement.className += ' ' + (test ? '' : 'no-') + feature;
                    }
                    Modernizr[feature] = test;

                }

                return Modernizr; // allow chaining.
            };


            // Reset modElem.cssText to nothing to reduce memory footprint.
            setCss('');
            modElem = inputElem = null;

            /*>>shiv*/
            /**
             * @preserve HTML5 Shiv prev3.7.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
             */
            ;
            (function (window, document) {
                /*jshint evil:true */
                /** version */
                var version = '3.7.0';

                /** Preset options */
                var options = window.html5 || {};

                /** Used to skip problem elements */
                var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

                /** Not all elements can be cloned in IE **/
                var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

                /** Detect whether the browser supports default html5 styles */
                var supportsHtml5Styles;

                /** Name of the expando, to work with multiple documents or to re-shiv one document */
                var expando = '_html5shiv';

                /** The id for the the documents expando */
                var expanID = 0;

                /** Cached data for each document */
                var expandoData = {};

                /** Detect whether the browser supports unknown elements */
                var supportsUnknownElements;

                (function () {
                    try {
                        var a = document.createElement('a');
                        a.innerHTML = '<xyz></xyz>';
                        //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
                        supportsHtml5Styles = ('hidden' in a);

                        supportsUnknownElements = a.childNodes.length == 1 || (function () {
                            // assign a false positive if unable to shiv
                            (document.createElement)('a');
                            var frag = document.createDocumentFragment();
                            return (
                                    typeof frag.cloneNode == 'undefined' ||
                                    typeof frag.createDocumentFragment == 'undefined' ||
                                    typeof frag.createElement == 'undefined'
                                    );
                        }());
                    } catch (e) {
                        // assign a false positive if detection fails => unable to shiv
                        supportsHtml5Styles = true;
                        supportsUnknownElements = true;
                    }

                }());

                /*--------------------------------------------------------------------------*/

                /**
                 * Creates a style sheet with the given CSS text and adds it to the document.
                 * @private
                 * @param {Document} ownerDocument The document.
                 * @param {String} cssText The CSS text.
                 * @returns {StyleSheet} The style element.
                 */
                function addStyleSheet(ownerDocument, cssText) {
                    var p = ownerDocument.createElement('p'),
                            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

                    p.innerHTML = 'x<style>' + cssText + '</style>';
                    return parent.insertBefore(p.lastChild, parent.firstChild);
                }

                /**
                 * Returns the value of `html5.elements` as an array.
                 * @private
                 * @returns {Array} An array of shived element node names.
                 */
                function getElements() {
                    var elements = html5.elements;
                    return typeof elements == 'string' ? elements.split(' ') : elements;
                }

                /**
                 * Returns the data associated to the given document
                 * @private
                 * @param {Document} ownerDocument The document.
                 * @returns {Object} An object of data.
                 */
                function getExpandoData(ownerDocument) {
                    var data = expandoData[ownerDocument[expando]];
                    if (!data) {
                        data = {};
                        expanID++;
                        ownerDocument[expando] = expanID;
                        expandoData[expanID] = data;
                    }
                    return data;
                }

                /**
                 * returns a shived element for the given nodeName and document
                 * @memberOf html5
                 * @param {String} nodeName name of the element
                 * @param {Document} ownerDocument The context document.
                 * @returns {Object} The shived element.
                 */
                function createElement(nodeName, ownerDocument, data) {
                    if (!ownerDocument) {
                        ownerDocument = document;
                    }
                    if (supportsUnknownElements) {
                        return ownerDocument.createElement(nodeName);
                    }
                    if (!data) {
                        data = getExpandoData(ownerDocument);
                    }
                    var node;

                    if (data.cache[nodeName]) {
                        node = data.cache[nodeName].cloneNode();
                    } else if (saveClones.test(nodeName)) {
                        node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
                    } else {
                        node = data.createElem(nodeName);
                    }

                    // Avoid adding some elements to fragments in IE < 9 because
                    // * Attributes like `name` or `type` cannot be set/changed once an element
                    //   is inserted into a document/fragment
                    // * Link elements with `src` attributes that are inaccessible, as with
                    //   a 403 response, will cause the tab/window to crash
                    // * Script elements appended to fragments will execute when their `src`
                    //   or `text` property is set
                    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
                }

                /**
                 * returns a shived DocumentFragment for the given document
                 * @memberOf html5
                 * @param {Document} ownerDocument The context document.
                 * @returns {Object} The shived DocumentFragment.
                 */
                function createDocumentFragment(ownerDocument, data) {
                    if (!ownerDocument) {
                        ownerDocument = document;
                    }
                    if (supportsUnknownElements) {
                        return ownerDocument.createDocumentFragment();
                    }
                    data = data || getExpandoData(ownerDocument);
                    var clone = data.frag.cloneNode(),
                            i = 0,
                            elems = getElements(),
                            l = elems.length;
                    for (; i < l; i++) {
                        clone.createElement(elems[i]);
                    }
                    return clone;
                }

                /**
                 * Shivs the `createElement` and `createDocumentFragment` methods of the document.
                 * @private
                 * @param {Document|DocumentFragment} ownerDocument The document.
                 * @param {Object} data of the document.
                 */
                function shivMethods(ownerDocument, data) {
                    if (!data.cache) {
                        data.cache = {};
                        data.createElem = ownerDocument.createElement;
                        data.createFrag = ownerDocument.createDocumentFragment;
                        data.frag = data.createFrag();
                    }


                    ownerDocument.createElement = function (nodeName) {
                        //abort shiv
                        if (!html5.shivMethods) {
                            return data.createElem(nodeName);
                        }
                        return createElement(nodeName, ownerDocument, data);
                    };

                    ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                            'var n=f.cloneNode(),c=n.createElement;' +
                            'h.shivMethods&&(' +
                            // unroll the `createElement` calls
                            getElements().join().replace(/[\w\-]+/g, function (nodeName) {
                        data.createElem(nodeName);
                        data.frag.createElement(nodeName);
                        return 'c("' + nodeName + '")';
                    }) +
                            ');return n}'
                            )(html5, data.frag);
                }

                /*--------------------------------------------------------------------------*/

                /**
                 * Shivs the given document.
                 * @memberOf html5
                 * @param {Document} ownerDocument The document to shiv.
                 * @returns {Document} The shived document.
                 */
                function shivDocument(ownerDocument) {
                    if (!ownerDocument) {
                        ownerDocument = document;
                    }
                    var data = getExpandoData(ownerDocument);

                    if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
                        data.hasCSS = !!addStyleSheet(ownerDocument,
                                // corrects block display not defined in IE6/7/8/9
                                'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                // adds styling not present in IE6/7/8/9
                                'mark{background:#FF0;color:#000}' +
                                // hides non-rendered elements
                                'template{display:none}'
                                );
                    }
                    if (!supportsUnknownElements) {
                        shivMethods(ownerDocument, data);
                    }
                    return ownerDocument;
                }

                /*--------------------------------------------------------------------------*/

                /**
                 * The `html5` object is exposed so that more elements can be shived and
                 * existing shiving can be detected on iframes.
                 * @type Object
                 * @example
                 *
                 * // options can be changed before the script is included
                 * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
                 */
                var html5 = {
                    /**
                     * An array or space separated string of node names of the elements to shiv.
                     * @memberOf html5
                     * @type Array|String
                     */
                    'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',
                    /**
                     * current version of html5shiv
                     */
                    'version': version,
                    /**
                     * A flag to indicate that the HTML5 style sheet should be inserted.
                     * @memberOf html5
                     * @type Boolean
                     */
                    'shivCSS': (options.shivCSS !== false),
                    /**
                     * Is equal to true if a browser supports creating unknown/HTML5 elements
                     * @memberOf html5
                     * @type boolean
                     */
                    'supportsUnknownElements': supportsUnknownElements,
                    /**
                     * A flag to indicate that the document's `createElement` and `createDocumentFragment`
                     * methods should be overwritten.
                     * @memberOf html5
                     * @type Boolean
                     */
                    'shivMethods': (options.shivMethods !== false),
                    /**
                     * A string to describe the type of `html5` object ("default" or "default print").
                     * @memberOf html5
                     * @type String
                     */
                    'type': 'default',
                    // shivs the document according to the specified `html5` object options
                    'shivDocument': shivDocument,
                    //creates a shived element
                    createElement: createElement,
                    //creates a shived documentFragment
                    createDocumentFragment: createDocumentFragment
                };

                /*--------------------------------------------------------------------------*/

                // expose html5
                window.html5 = html5;

                // shiv the document
                shivDocument(document);

            }(this, document));
            /*>>shiv*/

            // Assign private properties to the return object with prefix
            Modernizr._version = version;

            // expose these for the plugin API. Look in the source for how to join() them against your input
            /*>>prefixes*/
            Modernizr._prefixes = prefixes;
            /*>>prefixes*/
            /*>>domprefixes*/
            Modernizr._domPrefixes = domPrefixes;
            Modernizr._cssomPrefixes = cssomPrefixes;
            /*>>domprefixes*/

            /*>>mq*/
            // Modernizr.mq tests a given media query, live against the current state of the window
            // A few important notes:
            //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
            //   * A max-width or orientation query will be evaluated against the current state, which may change later.
            //   * You must specify values. Eg. If you are testing support for the min-width media query use:
            //       Modernizr.mq('(min-width:0)')
            // usage:
            // Modernizr.mq('only screen and (max-width:768)')
            Modernizr.mq = testMediaQuery;
            /*>>mq*/

            /*>>hasevent*/
            // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
            // Modernizr.hasEvent('gesturestart', elem)
            Modernizr.hasEvent = isEventSupported;
            /*>>hasevent*/

            /*>>testprop*/
            // Modernizr.testProp() investigates whether a given style property is recognized
            // Note that the property names must be provided in the camelCase variant.
            // Modernizr.testProp('pointerEvents')
            Modernizr.testProp = function (prop) {
                return testProps([prop]);
            };
            /*>>testprop*/

            /*>>testallprops*/
            // Modernizr.testAllProps() investigates whether a given style property,
            //   or any of its vendor-prefixed variants, is recognized
            // Note that the property names must be provided in the camelCase variant.
            // Modernizr.testAllProps('boxSizing')
            Modernizr.testAllProps = testPropsAll;
            /*>>testallprops*/


            /*>>teststyles*/
            // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
            // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
            Modernizr.testStyles = injectElementWithStyles;
            /*>>teststyles*/


            /*>>prefixed*/
            // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
            // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

            // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
            // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
            //
            //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

            // If you're trying to ascertain which transition end event to bind to, you might do something like...
            //
            //     var transEndEventNames = {
            //       'WebkitTransition' : 'webkitTransitionEnd',
            //       'MozTransition'    : 'transitionend',
            //       'OTransition'      : 'oTransitionEnd',
            //       'msTransition'     : 'MSTransitionEnd',
            //       'transition'       : 'transitionend'
            //     },
            //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

            Modernizr.prefixed = function (prop, obj, elem) {
                if (!obj) {
                    return testPropsAll(prop, 'pfx');
                } else {
                    // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
                    return testPropsAll(prop, obj, elem);
                }
            };
            /*>>prefixed*/


            /*>>cssclasses*/
            // Remove "no-js" class from <html> element, if it exists:
            docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +
                    // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
                    /*>>cssclasses*/

                    return Modernizr;

                })(this, this.document);

        /*count to*/
        (function ($) {
            $.fn.countTo = function (options) {
                options = options || {};

                return $(this).each(function () {
                    // set options for current element
                    var settings = $.extend({}, $.fn.countTo.defaults, {
                        from: $(this).data('from'),
                        to: $(this).data('to'),
                        speed: $(this).data('speed'),
                        refreshInterval: $(this).data('refresh-interval'),
                        decimals: $(this).data('decimals')
                    }, options);

                    // how many times to update the value, and how much to increment the value on each update
                    var loops = Math.ceil(settings.speed / settings.refreshInterval),
                            increment = (settings.to - settings.from) / loops;

                    // references & variables that will change with each update
                    var self = this,
                            $self = $(this),
                            loopCount = 0,
                            value = settings.from,
                            data = $self.data('countTo') || {};

                    $self.data('countTo', data);

                    // if an existing interval can be found, clear it first
                    if (data.interval) {
                        clearInterval(data.interval);
                    }
                    data.interval = setInterval(updateTimer, settings.refreshInterval);

                    // initialize the element with the starting value
                    render(value);

                    function updateTimer() {
                        value += increment;
                        loopCount++;

                        render(value);

                        if (typeof (settings.onUpdate) == 'function') {
                            settings.onUpdate.call(self, value);
                        }

                        if (loopCount >= loops) {
                            // remove the interval
                            $self.removeData('countTo');
                            clearInterval(data.interval);
                            value = settings.to;

                            if (typeof (settings.onComplete) == 'function') {
                                settings.onComplete.call(self, value);
                            }
                        }
                    }

                    function render(value) {
                        var formattedValue = settings.formatter.call(self, value, settings);
                        $self.text(formattedValue);
                    }
                });
            };

            $.fn.countTo.defaults = {
                from: 0, // the number the element should start at
                to: 0, // the number the element should end at
                speed: 1000, // how long it should take to count between the target numbers
                refreshInterval: 100, // how often the element should be updated
                decimals: 0, // the number of decimal places to show
                formatter: formatter, // handler for formatting the value before rendering
                onUpdate: null, // callback method for every time the element is updated
                onComplete: null       // callback method for when the element finishes updating
            };

            function formatter(value, settings) {
                return value.toFixed(settings.decimals);
            }
        }(jQuery));
        /*!
         * classie - class helper functions
         * from bonzo https://github.com/ded/bonzo
         * 
         * classie.has( elem, 'my-class' ) -> true/false
         * classie.add( elem, 'my-new-class' )
         * classie.remove( elem, 'my-unwanted-class' )
         * classie.toggle( elem, 'my-class' )
         */

        /*jshint browser: true, strict: true, undef: true */
        /*global define: false */

        (function (window) {

            'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

            function classReg(className) {
                return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
            }

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
            var hasClass, addClass, removeClass;

            if ('classList' in document.documentElement) {
                hasClass = function (elem, c) {
                    return elem.classList.contains(c);
                };
                addClass = function (elem, c) {
                    elem.classList.add(c);
                };
                removeClass = function (elem, c) {
                    elem.classList.remove(c);
                };
            }
            else {
                hasClass = function (elem, c) {
                    return classReg(c).test(elem.className);
                };
                addClass = function (elem, c) {
                    if (!hasClass(elem, c)) {
                        elem.className = elem.className + ' ' + c;
                    }
                };
                removeClass = function (elem, c) {
                    elem.className = elem.className.replace(classReg(c), ' ');
                };
            }

            function toggleClass(elem, c) {
                var fn = hasClass(elem, c) ? removeClass : addClass;
                fn(elem, c);
            }

            var classie = {
                // full names
                hasClass: hasClass,
                addClass: addClass,
                removeClass: removeClass,
                toggleClass: toggleClass,
                // short names
                has: hasClass,
                add: addClass,
                remove: removeClass,
                toggle: toggleClass
            };

// transport
            if (typeof define === 'function' && define.amd) {
                // AMD
                define(classie);
            } else {
                // browser global
                window.classie = classie;
            }

        })(window);


        /*istope*/
        /*!
         * Isotope PACKAGED v2.2.0
         *
         * Licensed GPLv3 for open source use
         * or Isotope Commercial License for commercial use
         *
         * http://isotope.metafizzy.co
         * Copyright 2015 Metafizzy
         */
        (function (t) {
            function e() {
            }
            function i(t) {
                function i(e) {
                    e.prototype.option || (e.prototype.option = function (e) {
                        t.isPlainObject(e) && (this.options = t.extend(!0, this.options, e))
                    })
                }
                function n(e, i) {
                    t.fn[e] = function (n) {
                        if ("string" == typeof n) {
                            for (var s = o.call(arguments, 1), a = 0, u = this.length; u > a; a++) {
                                var p = this[a], h = t.data(p, e);
                                if (h)
                                    if (t.isFunction(h[n]) && "_" !== n.charAt(0)) {
                                        var f = h[n].apply(h, s);
                                        if (void 0 !== f)
                                            return f
                                    } else
                                        r("no such method '" + n + "' for " + e + " instance");
                                else
                                    r("cannot call methods on " + e + " prior to initialization; " + "attempted to call '" + n + "'")
                            }
                            return this
                        }
                        return this.each(function () {
                            var o = t.data(this, e);
                            o ? (o.option(n), o._init()) : (o = new i(this, n), t.data(this, e, o))
                        })
                    }
                }
                if (t) {
                    var r = "undefined" == typeof console ? e : function (t) {
                        console.error(t)
                    };
                    return t.bridget = function (t, e) {
                        i(e), n(t, e)
                    }, t.bridget
                }
            }
            var o = Array.prototype.slice;
            "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], i) : "object" == typeof exports ? i(require("jquery")) : i(t.jQuery)
        })(window), function (t) {
            function e(e) {
                var i = t.event;
                return i.target = i.target || i.srcElement || e, i
            }
            var i = document.documentElement, o = function () {
            };
            i.addEventListener ? o = function (t, e, i) {
                t.addEventListener(e, i, !1)
            } : i.attachEvent && (o = function (t, i, o) {
                t[i + o] = o.handleEvent ? function () {
                    var i = e(t);
                    o.handleEvent.call(o, i)
                } : function () {
                    var i = e(t);
                    o.call(t, i)
                }, t.attachEvent("on" + i, t[i + o])
            });
            var n = function () {
            };
            i.removeEventListener ? n = function (t, e, i) {
                t.removeEventListener(e, i, !1)
            } : i.detachEvent && (n = function (t, e, i) {
                t.detachEvent("on" + e, t[e + i]);
                try {
                    delete t[e + i]
                } catch (o) {
                    t[e + i] = void 0
                }
            });
            var r = {bind: o, unbind: n};
            "function" == typeof define && define.amd ? define("eventie/eventie", r) : "object" == typeof exports ? module.exports = r : t.eventie = r
        }(window), function () {
            function t() {
            }
            function e(t, e) {
                for (var i = t.length; i--; )
                    if (t[i].listener === e)
                        return i;
                return-1
            }
            function i(t) {
                return function () {
                    return this[t].apply(this, arguments)
                }
            }
            var o = t.prototype, n = this, r = n.EventEmitter;
            o.getListeners = function (t) {
                var e, i, o = this._getEvents();
                if (t instanceof RegExp) {
                    e = {};
                    for (i in o)
                        o.hasOwnProperty(i) && t.test(i) && (e[i] = o[i])
                } else
                    e = o[t] || (o[t] = []);
                return e
            }, o.flattenListeners = function (t) {
                var e, i = [];
                for (e = 0; t.length > e; e += 1)
                    i.push(t[e].listener);
                return i
            }, o.getListenersAsObject = function (t) {
                var e, i = this.getListeners(t);
                return i instanceof Array && (e = {}, e[t] = i), e || i
            }, o.addListener = function (t, i) {
                var o, n = this.getListenersAsObject(t), r = "object" == typeof i;
                for (o in n)
                    n.hasOwnProperty(o) && -1 === e(n[o], i) && n[o].push(r ? i : {listener: i, once: !1});
                return this
            }, o.on = i("addListener"), o.addOnceListener = function (t, e) {
                return this.addListener(t, {listener: e, once: !0})
            }, o.once = i("addOnceListener"), o.defineEvent = function (t) {
                return this.getListeners(t), this
            }, o.defineEvents = function (t) {
                for (var e = 0; t.length > e; e += 1)
                    this.defineEvent(t[e]);
                return this
            }, o.removeListener = function (t, i) {
                var o, n, r = this.getListenersAsObject(t);
                for (n in r)
                    r.hasOwnProperty(n) && (o = e(r[n], i), -1 !== o && r[n].splice(o, 1));
                return this
            }, o.off = i("removeListener"), o.addListeners = function (t, e) {
                return this.manipulateListeners(!1, t, e)
            }, o.removeListeners = function (t, e) {
                return this.manipulateListeners(!0, t, e)
            }, o.manipulateListeners = function (t, e, i) {
                var o, n, r = t ? this.removeListener : this.addListener, s = t ? this.removeListeners : this.addListeners;
                if ("object" != typeof e || e instanceof RegExp)
                    for (o = i.length; o--; )
                        r.call(this, e, i[o]);
                else
                    for (o in e)
                        e.hasOwnProperty(o) && (n = e[o]) && ("function" == typeof n ? r.call(this, o, n) : s.call(this, o, n));
                return this
            }, o.removeEvent = function (t) {
                var e, i = typeof t, o = this._getEvents();
                if ("string" === i)
                    delete o[t];
                else if (t instanceof RegExp)
                    for (e in o)
                        o.hasOwnProperty(e) && t.test(e) && delete o[e];
                else
                    delete this._events;
                return this
            }, o.removeAllListeners = i("removeEvent"), o.emitEvent = function (t, e) {
                var i, o, n, r, s = this.getListenersAsObject(t);
                for (n in s)
                    if (s.hasOwnProperty(n))
                        for (o = s[n].length; o--; )
                            i = s[n][o], i.once === !0 && this.removeListener(t, i.listener), r = i.listener.apply(this, e || []), r === this._getOnceReturnValue() && this.removeListener(t, i.listener);
                return this
            }, o.trigger = i("emitEvent"), o.emit = function (t) {
                var e = Array.prototype.slice.call(arguments, 1);
                return this.emitEvent(t, e)
            }, o.setOnceReturnValue = function (t) {
                return this._onceReturnValue = t, this
            }, o._getOnceReturnValue = function () {
                return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
            }, o._getEvents = function () {
                return this._events || (this._events = {})
            }, t.noConflict = function () {
                return n.EventEmitter = r, t
            }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
                return t
            }) : "object" == typeof module && module.exports ? module.exports = t : n.EventEmitter = t
        }.call(this), function (t) {
            function e(t) {
                if (t) {
                    if ("string" == typeof o[t])
                        return t;
                    t = t.charAt(0).toUpperCase() + t.slice(1);
                    for (var e, n = 0, r = i.length; r > n; n++)
                        if (e = i[n] + t, "string" == typeof o[e])
                            return e
                }
            }
            var i = "Webkit Moz ms Ms O".split(" "), o = document.documentElement.style;
            "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
                return e
            }) : "object" == typeof exports ? module.exports = e : t.getStyleProperty = e
        }(window), function (t) {
            function e(t) {
                var e = parseFloat(t), i = -1 === t.indexOf("%") && !isNaN(e);
                return i && e
            }
            function i() {
            }
            function o() {
                for (var t = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0}, e = 0, i = s.length; i > e; e++) {
                    var o = s[e];
                    t[o] = 0
                }
                return t
            }
            function n(i) {
                function n() {
                    if (!d) {
                        d = !0;
                        var o = t.getComputedStyle;
                        if (p = function () {
                            var t = o ? function (t) {
                                return o(t, null)
                            } : function (t) {
                                return t.currentStyle
                            };
                            return function (e) {
                                var i = t(e);
                                return i || r("Style returned " + i + ". Are you running this code in a hidden iframe on Firefox? " + "See http://bit.ly/getsizebug1"), i
                            }
                        }(), h = i("boxSizing")) {
                            var n = document.createElement("div");
                            n.style.width = "200px", n.style.padding = "1px 2px 3px 4px", n.style.borderStyle = "solid", n.style.borderWidth = "1px 2px 3px 4px", n.style[h] = "border-box";
                            var s = document.body || document.documentElement;
                            s.appendChild(n);
                            var a = p(n);
                            f = 200 === e(a.width), s.removeChild(n)
                        }
                    }
                }
                function a(t) {
                    if (n(), "string" == typeof t && (t = document.querySelector(t)), t && "object" == typeof t && t.nodeType) {
                        var i = p(t);
                        if ("none" === i.display)
                            return o();
                        var r = {};
                        r.width = t.offsetWidth, r.height = t.offsetHeight;
                        for (var a = r.isBorderBox = !(!h || !i[h] || "border-box" !== i[h]), d = 0, l = s.length; l > d; d++) {
                            var c = s[d], m = i[c];
                            m = u(t, m);
                            var y = parseFloat(m);
                            r[c] = isNaN(y) ? 0 : y
                        }
                        var g = r.paddingLeft + r.paddingRight, v = r.paddingTop + r.paddingBottom, _ = r.marginLeft + r.marginRight, I = r.marginTop + r.marginBottom, z = r.borderLeftWidth + r.borderRightWidth, L = r.borderTopWidth + r.borderBottomWidth, x = a && f, E = e(i.width);
                        E !== !1 && (r.width = E + (x ? 0 : g + z));
                        var b = e(i.height);
                        return b !== !1 && (r.height = b + (x ? 0 : v + L)), r.innerWidth = r.width - (g + z), r.innerHeight = r.height - (v + L), r.outerWidth = r.width + _, r.outerHeight = r.height + I, r
                    }
                }
                function u(e, i) {
                    if (t.getComputedStyle || -1 === i.indexOf("%"))
                        return i;
                    var o = e.style, n = o.left, r = e.runtimeStyle, s = r && r.left;
                    return s && (r.left = e.currentStyle.left), o.left = i, i = o.pixelLeft, o.left = n, s && (r.left = s), i
                }
                var p, h, f, d = !1;
                return a
            }
            var r = "undefined" == typeof console ? i : function (t) {
                console.error(t)
            }, s = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
            "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], n) : "object" == typeof exports ? module.exports = n(require("desandro-get-style-property")) : t.getSize = n(t.getStyleProperty)
        }(window), function (t) {
            function e(t) {
                "function" == typeof t && (e.isReady ? t() : s.push(t))
            }
            function i(t) {
                var i = "readystatechange" === t.type && "complete" !== r.readyState;
                e.isReady || i || o()
            }
            function o() {
                e.isReady = !0;
                for (var t = 0, i = s.length; i > t; t++) {
                    var o = s[t];
                    o()
                }
            }
            function n(n) {
                return"complete" === r.readyState ? o() : (n.bind(r, "DOMContentLoaded", i), n.bind(r, "readystatechange", i), n.bind(t, "load", i)), e
            }
            var r = t.document, s = [];
            e.isReady = !1, "function" == typeof define && define.amd ? define("doc-ready/doc-ready", ["eventie/eventie"], n) : "object" == typeof exports ? module.exports = n(require("eventie")) : t.docReady = n(t.eventie)
        }(window), function (t) {
            function e(t, e) {
                return t[s](e)
            }
            function i(t) {
                if (!t.parentNode) {
                    var e = document.createDocumentFragment();
                    e.appendChild(t)
                }
            }
            function o(t, e) {
                i(t);
                for (var o = t.parentNode.querySelectorAll(e), n = 0, r = o.length; r > n; n++)
                    if (o[n] === t)
                        return!0;
                return!1
            }
            function n(t, o) {
                return i(t), e(t, o)
            }
            var r, s = function () {
                if (t.matches)
                    return"matches";
                if (t.matchesSelector)
                    return"matchesSelector";
                for (var e = ["webkit", "moz", "ms", "o"], i = 0, o = e.length; o > i; i++) {
                    var n = e[i], r = n + "MatchesSelector";
                    if (t[r])
                        return r
                }
            }();
            if (s) {
                var a = document.createElement("div"), u = e(a, "div");
                r = u ? e : n
            } else
                r = o;
            "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function () {
                return r
            }) : "object" == typeof exports ? module.exports = r : window.matchesSelector = r
        }(Element.prototype), function (t, e) {
            "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["doc-ready/doc-ready", "matches-selector/matches-selector"], function (i, o) {
                return e(t, i, o)
            }) : "object" == typeof exports ? module.exports = e(t, require("doc-ready"), require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.docReady, t.matchesSelector)
        }(window, function (t, e, i) {
            var o = {};
            o.extend = function (t, e) {
                for (var i in e)
                    t[i] = e[i];
                return t
            }, o.modulo = function (t, e) {
                return(t % e + e) % e
            };
            var n = Object.prototype.toString;
            o.isArray = function (t) {
                return"[object Array]" == n.call(t)
            }, o.makeArray = function (t) {
                var e = [];
                if (o.isArray(t))
                    e = t;
                else if (t && "number" == typeof t.length)
                    for (var i = 0, n = t.length; n > i; i++)
                        e.push(t[i]);
                else
                    e.push(t);
                return e
            }, o.indexOf = Array.prototype.indexOf ? function (t, e) {
                return t.indexOf(e)
            } : function (t, e) {
                for (var i = 0, o = t.length; o > i; i++)
                    if (t[i] === e)
                        return i;
                return-1
            }, o.removeFrom = function (t, e) {
                var i = o.indexOf(t, e);
                -1 != i && t.splice(i, 1)
            }, o.isElement = "function" == typeof HTMLElement || "object" == typeof HTMLElement ? function (t) {
                return t instanceof HTMLElement
            } : function (t) {
                return t && "object" == typeof t && 1 == t.nodeType && "string" == typeof t.nodeName
            }, o.setText = function () {
                function t(t, i) {
                    e = e || (void 0 !== document.documentElement.textContent ? "textContent" : "innerText"), t[e] = i
                }
                var e;
                return t
            }(), o.getParent = function (t, e) {
                for (; t != document.body; )
                    if (t = t.parentNode, i(t, e))
                        return t
            }, o.getQueryElement = function (t) {
                return"string" == typeof t ? document.querySelector(t) : t
            }, o.handleEvent = function (t) {
                var e = "on" + t.type;
                this[e] && this[e](t)
            }, o.filterFindElements = function (t, e) {
                t = o.makeArray(t);
                for (var n = [], r = 0, s = t.length; s > r; r++) {
                    var a = t[r];
                    if (o.isElement(a))
                        if (e) {
                            i(a, e) && n.push(a);
                            for (var u = a.querySelectorAll(e), p = 0, h = u.length; h > p; p++)
                                n.push(u[p])
                        } else
                            n.push(a)
                }
                return n
            }, o.debounceMethod = function (t, e, i) {
                var o = t.prototype[e], n = e + "Timeout";
                t.prototype[e] = function () {
                    var t = this[n];
                    t && clearTimeout(t);
                    var e = arguments, r = this;
                    this[n] = setTimeout(function () {
                        o.apply(r, e), delete r[n]
                    }, i || 100)
                }
            }, o.toDashed = function (t) {
                return t.replace(/(.)([A-Z])/g, function (t, e, i) {
                    return e + "-" + i
                }).toLowerCase()
            };
            var r = t.console;
            return o.htmlInit = function (i, n) {
                e(function () {
                    for (var e = o.toDashed(n), s = document.querySelectorAll(".js-" + e), a = "data-" + e + "-options", u = 0, p = s.length; p > u; u++) {
                        var h, f = s[u], d = f.getAttribute(a);
                        try {
                            h = d && JSON.parse(d)
                        } catch (l) {
                            r && r.error("Error parsing " + a + " on " + f.nodeName.toLowerCase() + (f.id ? "#" + f.id : "") + ": " + l);
                            continue
                        }
                        var c = new i(f, h), m = t.jQuery;
                        m && m.data(f, n, c)
                    }
                })
            }, o
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property", "fizzy-ui-utils/utils"], function (i, o, n, r) {
                return e(t, i, o, n, r)
            }) : "object" == typeof exports ? module.exports = e(t, require("wolfy87-eventemitter"), require("get-size"), require("desandro-get-style-property"), require("fizzy-ui-utils")) : (t.Outlayer = {}, t.Outlayer.Item = e(t, t.EventEmitter, t.getSize, t.getStyleProperty, t.fizzyUIUtils))
        }(window, function (t, e, i, o, n) {
            function r(t) {
                for (var e in t)
                    return!1;
                return e = null, !0
            }
            function s(t, e) {
                t && (this.element = t, this.layout = e, this.position = {x: 0, y: 0}, this._create())
            }
            var a = t.getComputedStyle, u = a ? function (t) {
                return a(t, null)
            } : function (t) {
                return t.currentStyle
            }, p = o("transition"), h = o("transform"), f = p && h, d = !!o("perspective"), l = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "otransitionend", transition: "transitionend"}[p], c = ["transform", "transition", "transitionDuration", "transitionProperty"], m = function () {
                for (var t = {}, e = 0, i = c.length; i > e; e++) {
                    var n = c[e], r = o(n);
                    r && r !== n && (t[n] = r)
                }
                return t
            }();
            n.extend(s.prototype, e.prototype), s.prototype._create = function () {
                this._transn = {ingProperties: {}, clean: {}, onEnd: {}}, this.css({position: "absolute"})
            }, s.prototype.handleEvent = function (t) {
                var e = "on" + t.type;
                this[e] && this[e](t)
            }, s.prototype.getSize = function () {
                this.size = i(this.element)
            }, s.prototype.css = function (t) {
                var e = this.element.style;
                for (var i in t) {
                    var o = m[i] || i;
                    e[o] = t[i]
                }
            }, s.prototype.getPosition = function () {
                var t = u(this.element), e = this.layout.options, i = e.isOriginLeft, o = e.isOriginTop, n = parseInt(t[i ? "left" : "right"], 10), r = parseInt(t[o ? "top" : "bottom"], 10);
                n = isNaN(n) ? 0 : n, r = isNaN(r) ? 0 : r;
                var s = this.layout.size;
                n -= i ? s.paddingLeft : s.paddingRight, r -= o ? s.paddingTop : s.paddingBottom, this.position.x = n, this.position.y = r
            }, s.prototype.layoutPosition = function () {
                var t = this.layout.size, e = this.layout.options, i = {}, o = e.isOriginLeft ? "paddingLeft" : "paddingRight", n = e.isOriginLeft ? "left" : "right", r = e.isOriginLeft ? "right" : "left", s = this.position.x + t[o];
                s = e.percentPosition && !e.isHorizontal ? 100 * (s / t.width) + "%" : s + "px", i[n] = s, i[r] = "";
                var a = e.isOriginTop ? "paddingTop" : "paddingBottom", u = e.isOriginTop ? "top" : "bottom", p = e.isOriginTop ? "bottom" : "top", h = this.position.y + t[a];
                h = e.percentPosition && e.isHorizontal ? 100 * (h / t.height) + "%" : h + "px", i[u] = h, i[p] = "", this.css(i), this.emitEvent("layout", [this])
            };
            var y = d ? function (t, e) {
                return"translate3d(" + t + "px, " + e + "px, 0)"
            } : function (t, e) {
                return"translate(" + t + "px, " + e + "px)"
            };
            s.prototype._transitionTo = function (t, e) {
                this.getPosition();
                var i = this.position.x, o = this.position.y, n = parseInt(t, 10), r = parseInt(e, 10), s = n === this.position.x && r === this.position.y;
                if (this.setPosition(t, e), s && !this.isTransitioning)
                    return this.layoutPosition(), void 0;
                var a = t - i, u = e - o, p = {}, h = this.layout.options;
                a = h.isOriginLeft ? a : -a, u = h.isOriginTop ? u : -u, p.transform = y(a, u), this.transition({to: p, onTransitionEnd: {transform: this.layoutPosition}, isCleaning: !0})
            }, s.prototype.goTo = function (t, e) {
                this.setPosition(t, e), this.layoutPosition()
            }, s.prototype.moveTo = f ? s.prototype._transitionTo : s.prototype.goTo, s.prototype.setPosition = function (t, e) {
                this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
            }, s.prototype._nonTransition = function (t) {
                this.css(t.to), t.isCleaning && this._removeStyles(t.to);
                for (var e in t.onTransitionEnd)
                    t.onTransitionEnd[e].call(this)
            }, s.prototype._transition = function (t) {
                if (!parseFloat(this.layout.options.transitionDuration))
                    return this._nonTransition(t), void 0;
                var e = this._transn;
                for (var i in t.onTransitionEnd)
                    e.onEnd[i] = t.onTransitionEnd[i];
                for (i in t.to)
                    e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
                if (t.from) {
                    this.css(t.from);
                    var o = this.element.offsetHeight;
                    o = null
                }
                this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
            };
            var g = h && n.toDashed(h) + ",opacity";
            s.prototype.enableTransition = function () {
                this.isTransitioning || (this.css({transitionProperty: g, transitionDuration: this.layout.options.transitionDuration}), this.element.addEventListener(l, this, !1))
            }, s.prototype.transition = s.prototype[p ? "_transition" : "_nonTransition"], s.prototype.onwebkitTransitionEnd = function (t) {
                this.ontransitionend(t)
            }, s.prototype.onotransitionend = function (t) {
                this.ontransitionend(t)
            };
            var v = {"-webkit-transform": "transform", "-moz-transform": "transform", "-o-transform": "transform"};
            s.prototype.ontransitionend = function (t) {
                if (t.target === this.element) {
                    var e = this._transn, i = v[t.propertyName] || t.propertyName;
                    if (delete e.ingProperties[i], r(e.ingProperties) && this.disableTransition(), i in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[i]), i in e.onEnd) {
                        var o = e.onEnd[i];
                        o.call(this), delete e.onEnd[i]
                    }
                    this.emitEvent("transitionEnd", [this])
                }
            }, s.prototype.disableTransition = function () {
                this.removeTransitionStyles(), this.element.removeEventListener(l, this, !1), this.isTransitioning = !1
            }, s.prototype._removeStyles = function (t) {
                var e = {};
                for (var i in t)
                    e[i] = "";
                this.css(e)
            };
            var _ = {transitionProperty: "", transitionDuration: ""};
            return s.prototype.removeTransitionStyles = function () {
                this.css(_)
            }, s.prototype.removeElem = function () {
                this.element.parentNode.removeChild(this.element), this.css({display: ""}), this.emitEvent("remove", [this])
            }, s.prototype.remove = function () {
                if (!p || !parseFloat(this.layout.options.transitionDuration))
                    return this.removeElem(), void 0;
                var t = this;
                this.once("transitionEnd", function () {
                    t.removeElem()
                }), this.hide()
            }, s.prototype.reveal = function () {
                delete this.isHidden, this.css({display: ""});
                var t = this.layout.options, e = {}, i = this.getHideRevealTransitionEndProperty("visibleStyle");
                e[i] = this.onRevealTransitionEnd, this.transition({from: t.hiddenStyle, to: t.visibleStyle, isCleaning: !0, onTransitionEnd: e})
            }, s.prototype.onRevealTransitionEnd = function () {
                this.isHidden || this.emitEvent("reveal")
            }, s.prototype.getHideRevealTransitionEndProperty = function (t) {
                var e = this.layout.options[t];
                if (e.opacity)
                    return"opacity";
                for (var i in e)
                    return i
            }, s.prototype.hide = function () {
                this.isHidden = !0, this.css({display: ""});
                var t = this.layout.options, e = {}, i = this.getHideRevealTransitionEndProperty("hiddenStyle");
                e[i] = this.onHideTransitionEnd, this.transition({from: t.visibleStyle, to: t.hiddenStyle, isCleaning: !0, onTransitionEnd: e})
            }, s.prototype.onHideTransitionEnd = function () {
                this.isHidden && (this.css({display: "none"}), this.emitEvent("hide"))
            }, s.prototype.destroy = function () {
                this.css({position: "", left: "", right: "", top: "", bottom: "", transition: "", transform: ""})
            }, s
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "eventEmitter/EventEmitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function (i, o, n, r, s) {
                return e(t, i, o, n, r, s)
            }) : "object" == typeof exports ? module.exports = e(t, require("eventie"), require("wolfy87-eventemitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : t.Outlayer = e(t, t.eventie, t.EventEmitter, t.getSize, t.fizzyUIUtils, t.Outlayer.Item)
        }(window, function (t, e, i, o, n, r) {
            function s(t, e) {
                var i = n.getQueryElement(t);
                if (!i)
                    return a && a.error("Bad element for " + this.constructor.namespace + ": " + (i || t)), void 0;
                this.element = i, u && (this.$element = u(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e);
                var o = ++h;
                this.element.outlayerGUID = o, f[o] = this, this._create(), this.options.isInitLayout && this.layout()
            }
            var a = t.console, u = t.jQuery, p = function () {
            }, h = 0, f = {};
            return s.namespace = "outlayer", s.Item = r, s.defaults = {containerStyle: {position: "relative"}, isInitLayout: !0, isOriginLeft: !0, isOriginTop: !0, isResizeBound: !0, isResizingContainer: !0, transitionDuration: "0.4s", hiddenStyle: {opacity: 0, transform: "scale(0.001)"}, visibleStyle: {opacity: 1, transform: "scale(1)"}}, n.extend(s.prototype, i.prototype), s.prototype.option = function (t) {
                n.extend(this.options, t)
            }, s.prototype._create = function () {
                this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), n.extend(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
            }, s.prototype.reloadItems = function () {
                this.items = this._itemize(this.element.children)
            }, s.prototype._itemize = function (t) {
                for (var e = this._filterFindItemElements(t), i = this.constructor.Item, o = [], n = 0, r = e.length; r > n; n++) {
                    var s = e[n], a = new i(s, this);
                    o.push(a)
                }
                return o
            }, s.prototype._filterFindItemElements = function (t) {
                return n.filterFindElements(t, this.options.itemSelector)
            }, s.prototype.getItemElements = function () {
                for (var t = [], e = 0, i = this.items.length; i > e; e++)
                    t.push(this.items[e].element);
                return t
            }, s.prototype.layout = function () {
                this._resetLayout(), this._manageStamps();
                var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
                this.layoutItems(this.items, t), this._isLayoutInited = !0
            }, s.prototype._init = s.prototype.layout, s.prototype._resetLayout = function () {
                this.getSize()
            }, s.prototype.getSize = function () {
                this.size = o(this.element)
            }, s.prototype._getMeasurement = function (t, e) {
                var i, r = this.options[t];
                r ? ("string" == typeof r ? i = this.element.querySelector(r) : n.isElement(r) && (i = r), this[t] = i ? o(i)[e] : r) : this[t] = 0
            }, s.prototype.layoutItems = function (t, e) {
                t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
            }, s.prototype._getItemsForLayout = function (t) {
                for (var e = [], i = 0, o = t.length; o > i; i++) {
                    var n = t[i];
                    n.isIgnored || e.push(n)
                }
                return e
            }, s.prototype._layoutItems = function (t, e) {
                if (this._emitCompleteOnItems("layout", t), t && t.length) {
                    for (var i = [], o = 0, n = t.length; n > o; o++) {
                        var r = t[o], s = this._getItemLayoutPosition(r);
                        s.item = r, s.isInstant = e || r.isLayoutInstant, i.push(s)
                    }
                    this._processLayoutQueue(i)
                }
            }, s.prototype._getItemLayoutPosition = function () {
                return{x: 0, y: 0}
            }, s.prototype._processLayoutQueue = function (t) {
                for (var e = 0, i = t.length; i > e; e++) {
                    var o = t[e];
                    this._positionItem(o.item, o.x, o.y, o.isInstant)
                }
            }, s.prototype._positionItem = function (t, e, i, o) {
                o ? t.goTo(e, i) : t.moveTo(e, i)
            }, s.prototype._postLayout = function () {
                this.resizeContainer()
            }, s.prototype.resizeContainer = function () {
                if (this.options.isResizingContainer) {
                    var t = this._getContainerSize();
                    t && (this._setContainerMeasure(t.width, !0), this._setContainerMeasure(t.height, !1))
                }
            }, s.prototype._getContainerSize = p, s.prototype._setContainerMeasure = function (t, e) {
                if (void 0 !== t) {
                    var i = this.size;
                    i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
                }
            }, s.prototype._emitCompleteOnItems = function (t, e) {
                function i() {
                    n.emitEvent(t + "Complete", [e])
                }
                function o() {
                    s++, s === r && i()
                }
                var n = this, r = e.length;
                if (!e || !r)
                    return i(), void 0;
                for (var s = 0, a = 0, u = e.length; u > a; a++) {
                    var p = e[a];
                    p.once(t, o)
                }
            }, s.prototype.ignore = function (t) {
                var e = this.getItem(t);
                e && (e.isIgnored = !0)
            }, s.prototype.unignore = function (t) {
                var e = this.getItem(t);
                e && delete e.isIgnored
            }, s.prototype.stamp = function (t) {
                if (t = this._find(t)) {
                    this.stamps = this.stamps.concat(t);
                    for (var e = 0, i = t.length; i > e; e++) {
                        var o = t[e];
                        this.ignore(o)
                    }
                }
            }, s.prototype.unstamp = function (t) {
                if (t = this._find(t))
                    for (var e = 0, i = t.length; i > e; e++) {
                        var o = t[e];
                        n.removeFrom(this.stamps, o), this.unignore(o)
                    }
            }, s.prototype._find = function (t) {
                return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = n.makeArray(t)) : void 0
            }, s.prototype._manageStamps = function () {
                if (this.stamps && this.stamps.length) {
                    this._getBoundingRect();
                    for (var t = 0, e = this.stamps.length; e > t; t++) {
                        var i = this.stamps[t];
                        this._manageStamp(i)
                    }
                }
            }, s.prototype._getBoundingRect = function () {
                var t = this.element.getBoundingClientRect(), e = this.size;
                this._boundingRect = {left: t.left + e.paddingLeft + e.borderLeftWidth, top: t.top + e.paddingTop + e.borderTopWidth, right: t.right - (e.paddingRight + e.borderRightWidth), bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)}
            }, s.prototype._manageStamp = p, s.prototype._getElementOffset = function (t) {
                var e = t.getBoundingClientRect(), i = this._boundingRect, n = o(t), r = {left: e.left - i.left - n.marginLeft, top: e.top - i.top - n.marginTop, right: i.right - e.right - n.marginRight, bottom: i.bottom - e.bottom - n.marginBottom};
                return r
            }, s.prototype.handleEvent = function (t) {
                var e = "on" + t.type;
                this[e] && this[e](t)
            }, s.prototype.bindResize = function () {
                this.isResizeBound || (e.bind(t, "resize", this), this.isResizeBound = !0)
            }, s.prototype.unbindResize = function () {
                this.isResizeBound && e.unbind(t, "resize", this), this.isResizeBound = !1
            }, s.prototype.onresize = function () {
                function t() {
                    e.resize(), delete e.resizeTimeout
                }
                this.resizeTimeout && clearTimeout(this.resizeTimeout);
                var e = this;
                this.resizeTimeout = setTimeout(t, 100)
            }, s.prototype.resize = function () {
                this.isResizeBound && this.needsResizeLayout() && this.layout()
            }, s.prototype.needsResizeLayout = function () {
                var t = o(this.element), e = this.size && t;
                return e && t.innerWidth !== this.size.innerWidth
            }, s.prototype.addItems = function (t) {
                var e = this._itemize(t);
                return e.length && (this.items = this.items.concat(e)), e
            }, s.prototype.appended = function (t) {
                var e = this.addItems(t);
                e.length && (this.layoutItems(e, !0), this.reveal(e))
            }, s.prototype.prepended = function (t) {
                var e = this._itemize(t);
                if (e.length) {
                    var i = this.items.slice(0);
                    this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
                }
            }, s.prototype.reveal = function (t) {
                this._emitCompleteOnItems("reveal", t);
                for (var e = t && t.length, i = 0; e && e > i; i++) {
                    var o = t[i];
                    o.reveal()
                }
            }, s.prototype.hide = function (t) {
                this._emitCompleteOnItems("hide", t);
                for (var e = t && t.length, i = 0; e && e > i; i++) {
                    var o = t[i];
                    o.hide()
                }
            }, s.prototype.revealItemElements = function (t) {
                var e = this.getItems(t);
                this.reveal(e)
            }, s.prototype.hideItemElements = function (t) {
                var e = this.getItems(t);
                this.hide(e)
            }, s.prototype.getItem = function (t) {
                for (var e = 0, i = this.items.length; i > e; e++) {
                    var o = this.items[e];
                    if (o.element === t)
                        return o
                }
            }, s.prototype.getItems = function (t) {
                t = n.makeArray(t);
                for (var e = [], i = 0, o = t.length; o > i; i++) {
                    var r = t[i], s = this.getItem(r);
                    s && e.push(s)
                }
                return e
            }, s.prototype.remove = function (t) {
                var e = this.getItems(t);
                if (this._emitCompleteOnItems("remove", e), e && e.length)
                    for (var i = 0, o = e.length; o > i; i++) {
                        var r = e[i];
                        r.remove(), n.removeFrom(this.items, r)
                    }
            }, s.prototype.destroy = function () {
                var t = this.element.style;
                t.height = "", t.position = "", t.width = "";
                for (var e = 0, i = this.items.length; i > e; e++) {
                    var o = this.items[e];
                    o.destroy()
                }
                this.unbindResize();
                var n = this.element.outlayerGUID;
                delete f[n], delete this.element.outlayerGUID, u && u.removeData(this.element, this.constructor.namespace)
            }, s.data = function (t) {
                t = n.getQueryElement(t);
                var e = t && t.outlayerGUID;
                return e && f[e]
            }, s.create = function (t, e) {
                function i() {
                    s.apply(this, arguments)
                }
                return Object.create ? i.prototype = Object.create(s.prototype) : n.extend(i.prototype, s.prototype), i.prototype.constructor = i, i.defaults = n.extend({}, s.defaults), n.extend(i.defaults, e), i.prototype.settings = {}, i.namespace = t, i.data = s.data, i.Item = function () {
                    r.apply(this, arguments)
                }, i.Item.prototype = new r, n.htmlInit(i, t), u && u.bridget && u.bridget(t, i), i
            }, s.Item = r, s
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("isotope/js/item", ["outlayer/outlayer"], e) : "object" == typeof exports ? module.exports = e(require("outlayer")) : (t.Isotope = t.Isotope || {}, t.Isotope.Item = e(t.Outlayer))
        }(window, function (t) {
            function e() {
                t.Item.apply(this, arguments)
            }
            e.prototype = new t.Item, e.prototype._create = function () {
                this.id = this.layout.itemGUID++, t.Item.prototype._create.call(this), this.sortData = {}
            }, e.prototype.updateSortData = function () {
                if (!this.isIgnored) {
                    this.sortData.id = this.id, this.sortData["original-order"] = this.id, this.sortData.random = Math.random();
                    var t = this.layout.options.getSortData, e = this.layout._sorters;
                    for (var i in t) {
                        var o = e[i];
                        this.sortData[i] = o(this.element, this)
                    }
                }
            };
            var i = e.prototype.destroy;
            return e.prototype.destroy = function () {
                i.apply(this, arguments), this.css({display: ""})
            }, e
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("isotope/js/layout-mode", ["get-size/get-size", "outlayer/outlayer"], e) : "object" == typeof exports ? module.exports = e(require("get-size"), require("outlayer")) : (t.Isotope = t.Isotope || {}, t.Isotope.LayoutMode = e(t.getSize, t.Outlayer))
        }(window, function (t, e) {
            function i(t) {
                this.isotope = t, t && (this.options = t.options[this.namespace], this.element = t.element, this.items = t.filteredItems, this.size = t.size)
            }
            return function () {
                function t(t) {
                    return function () {
                        return e.prototype[t].apply(this.isotope, arguments)
                    }
                }
                for (var o = ["_resetLayout", "_getItemLayoutPosition", "_manageStamp", "_getContainerSize", "_getElementOffset", "needsResizeLayout"], n = 0, r = o.length; r > n; n++) {
                    var s = o[n];
                    i.prototype[s] = t(s)
                }
            }(), i.prototype.needsVerticalResizeLayout = function () {
                var e = t(this.isotope.element), i = this.isotope.size && e;
                return i && e.innerHeight != this.isotope.size.innerHeight
            }, i.prototype._getMeasurement = function () {
                this.isotope._getMeasurement.apply(this, arguments)
            }, i.prototype.getColumnWidth = function () {
                this.getSegmentSize("column", "Width")
            }, i.prototype.getRowHeight = function () {
                this.getSegmentSize("row", "Height")
            }, i.prototype.getSegmentSize = function (t, e) {
                var i = t + e, o = "outer" + e;
                if (this._getMeasurement(i, o), !this[i]) {
                    var n = this.getFirstItemSize();
                    this[i] = n && n[o] || this.isotope.size["inner" + e]
                }
            }, i.prototype.getFirstItemSize = function () {
                var e = this.isotope.filteredItems[0];
                return e && e.element && t(e.element)
            }, i.prototype.layout = function () {
                this.isotope.layout.apply(this.isotope, arguments)
            }, i.prototype.getSize = function () {
                this.isotope.getSize(), this.size = this.isotope.size
            }, i.modes = {}, i.create = function (t, e) {
                function o() {
                    i.apply(this, arguments)
                }
                return o.prototype = new i, e && (o.options = e), o.prototype.namespace = t, i.modes[t] = o, o
            }, i
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("masonry/masonry", ["outlayer/outlayer", "get-size/get-size", "fizzy-ui-utils/utils"], e) : "object" == typeof exports ? module.exports = e(require("outlayer"), require("get-size"), require("fizzy-ui-utils")) : t.Masonry = e(t.Outlayer, t.getSize, t.fizzyUIUtils)
        }(window, function (t, e, i) {
            var o = t.create("masonry");
            return o.prototype._resetLayout = function () {
                this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns();
                var t = this.cols;
                for (this.colYs = []; t--; )
                    this.colYs.push(0);
                this.maxY = 0
            }, o.prototype.measureColumns = function () {
                if (this.getContainerWidth(), !this.columnWidth) {
                    var t = this.items[0], i = t && t.element;
                    this.columnWidth = i && e(i).outerWidth || this.containerWidth
                }
                var o = this.columnWidth += this.gutter, n = this.containerWidth + this.gutter, r = n / o, s = o - n % o, a = s && 1 > s ? "round" : "floor";
                r = Math[a](r), this.cols = Math.max(r, 1)
            }, o.prototype.getContainerWidth = function () {
                var t = this.options.isFitWidth ? this.element.parentNode : this.element, i = e(t);
                this.containerWidth = i && i.innerWidth
            }, o.prototype._getItemLayoutPosition = function (t) {
                t.getSize();
                var e = t.size.outerWidth % this.columnWidth, o = e && 1 > e ? "round" : "ceil", n = Math[o](t.size.outerWidth / this.columnWidth);
                n = Math.min(n, this.cols);
                for (var r = this._getColGroup(n), s = Math.min.apply(Math, r), a = i.indexOf(r, s), u = {x: this.columnWidth * a, y: s}, p = s + t.size.outerHeight, h = this.cols + 1 - r.length, f = 0; h > f; f++)
                    this.colYs[a + f] = p;
                return u
            }, o.prototype._getColGroup = function (t) {
                if (2 > t)
                    return this.colYs;
                for (var e = [], i = this.cols + 1 - t, o = 0; i > o; o++) {
                    var n = this.colYs.slice(o, o + t);
                    e[o] = Math.max.apply(Math, n)
                }
                return e
            }, o.prototype._manageStamp = function (t) {
                var i = e(t), o = this._getElementOffset(t), n = this.options.isOriginLeft ? o.left : o.right, r = n + i.outerWidth, s = Math.floor(n / this.columnWidth);
                s = Math.max(0, s);
                var a = Math.floor(r / this.columnWidth);
                a -= r % this.columnWidth ? 0 : 1, a = Math.min(this.cols - 1, a);
                for (var u = (this.options.isOriginTop ? o.top : o.bottom) + i.outerHeight, p = s; a >= p; p++)
                    this.colYs[p] = Math.max(u, this.colYs[p])
            }, o.prototype._getContainerSize = function () {
                this.maxY = Math.max.apply(Math, this.colYs);
                var t = {height: this.maxY};
                return this.options.isFitWidth && (t.width = this._getContainerFitWidth()), t
            }, o.prototype._getContainerFitWidth = function () {
                for (var t = 0, e = this.cols; --e && 0 === this.colYs[e]; )
                    t++;
                return(this.cols - t) * this.columnWidth - this.gutter
            }, o.prototype.needsResizeLayout = function () {
                var t = this.containerWidth;
                return this.getContainerWidth(), t !== this.containerWidth
            }, o
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("isotope/js/layout-modes/masonry", ["../layout-mode", "masonry/masonry"], e) : "object" == typeof exports ? module.exports = e(require("../layout-mode"), require("masonry-layout")) : e(t.Isotope.LayoutMode, t.Masonry)
        }(window, function (t, e) {
            function i(t, e) {
                for (var i in e)
                    t[i] = e[i];
                return t
            }
            var o = t.create("masonry"), n = o.prototype._getElementOffset, r = o.prototype.layout, s = o.prototype._getMeasurement;
            i(o.prototype, e.prototype), o.prototype._getElementOffset = n, o.prototype.layout = r, o.prototype._getMeasurement = s;
            var a = o.prototype.measureColumns;
            o.prototype.measureColumns = function () {
                this.items = this.isotope.filteredItems, a.call(this)
            };
            var u = o.prototype._manageStamp;
            return o.prototype._manageStamp = function () {
                this.options.isOriginLeft = this.isotope.options.isOriginLeft, this.options.isOriginTop = this.isotope.options.isOriginTop, u.apply(this, arguments)
            }, o
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("isotope/js/layout-modes/fit-rows", ["../layout-mode"], e) : "object" == typeof exports ? module.exports = e(require("../layout-mode")) : e(t.Isotope.LayoutMode)
        }(window, function (t) {
            var e = t.create("fitRows");
            return e.prototype._resetLayout = function () {
                this.x = 0, this.y = 0, this.maxY = 0, this._getMeasurement("gutter", "outerWidth")
            }, e.prototype._getItemLayoutPosition = function (t) {
                t.getSize();
                var e = t.size.outerWidth + this.gutter, i = this.isotope.size.innerWidth + this.gutter;
                0 !== this.x && e + this.x > i && (this.x = 0, this.y = this.maxY);
                var o = {x: this.x, y: this.y};
                return this.maxY = Math.max(this.maxY, this.y + t.size.outerHeight), this.x += e, o
            }, e.prototype._getContainerSize = function () {
                return{height: this.maxY}
            }, e
        }), function (t, e) {
            "function" == typeof define && define.amd ? define("isotope/js/layout-modes/vertical", ["../layout-mode"], e) : "object" == typeof exports ? module.exports = e(require("../layout-mode")) : e(t.Isotope.LayoutMode)
        }(window, function (t) {
            var e = t.create("vertical", {horizontalAlignment: 0});
            return e.prototype._resetLayout = function () {
                this.y = 0
            }, e.prototype._getItemLayoutPosition = function (t) {
                t.getSize();
                var e = (this.isotope.size.innerWidth - t.size.outerWidth) * this.options.horizontalAlignment, i = this.y;
                return this.y += t.size.outerHeight, {x: e, y: i}
            }, e.prototype._getContainerSize = function () {
                return{height: this.y}
            }, e
        }), function (t, e) {
            "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size", "matches-selector/matches-selector", "fizzy-ui-utils/utils", "isotope/js/item", "isotope/js/layout-mode", "isotope/js/layout-modes/masonry", "isotope/js/layout-modes/fit-rows", "isotope/js/layout-modes/vertical"], function (i, o, n, r, s, a) {
                return e(t, i, o, n, r, s, a)
            }) : "object" == typeof exports ? module.exports = e(t, require("outlayer"), require("get-size"), require("desandro-matches-selector"), require("fizzy-ui-utils"), require("./item"), require("./layout-mode"), require("./layout-modes/masonry"), require("./layout-modes/fit-rows"), require("./layout-modes/vertical")) : t.Isotope = e(t, t.Outlayer, t.getSize, t.matchesSelector, t.fizzyUIUtils, t.Isotope.Item, t.Isotope.LayoutMode)
        }(window, function (t, e, i, o, n, r, s) {
            function a(t, e) {
                return function (i, o) {
                    for (var n = 0, r = t.length; r > n; n++) {
                        var s = t[n], a = i.sortData[s], u = o.sortData[s];
                        if (a > u || u > a) {
                            var p = void 0 !== e[s] ? e[s] : e, h = p ? 1 : -1;
                            return(a > u ? 1 : -1) * h
                        }
                    }
                    return 0
                }
            }
            var u = t.jQuery, p = String.prototype.trim ? function (t) {
                return t.trim()
            } : function (t) {
                return t.replace(/^\s+|\s+$/g, "")
            }, h = document.documentElement, f = h.textContent ? function (t) {
                return t.textContent
            } : function (t) {
                return t.innerText
            }, d = e.create("isotope", {layoutMode: "masonry", isJQueryFiltering: !0, sortAscending: !0});
            d.Item = r, d.LayoutMode = s, d.prototype._create = function () {
                this.itemGUID = 0, this._sorters = {}, this._getSorters(), e.prototype._create.call(this), this.modes = {}, this.filteredItems = this.items, this.sortHistory = ["original-order"];
                for (var t in s.modes)
                    this._initLayoutMode(t)
            }, d.prototype.reloadItems = function () {
                this.itemGUID = 0, e.prototype.reloadItems.call(this)
            }, d.prototype._itemize = function () {
                for (var t = e.prototype._itemize.apply(this, arguments), i = 0, o = t.length; o > i; i++) {
                    var n = t[i];
                    n.id = this.itemGUID++
                }
                return this._updateItemsSortData(t), t
            }, d.prototype._initLayoutMode = function (t) {
                var e = s.modes[t], i = this.options[t] || {};
                this.options[t] = e.options ? n.extend(e.options, i) : i, this.modes[t] = new e(this)
            }, d.prototype.layout = function () {
                return!this._isLayoutInited && this.options.isInitLayout ? (this.arrange(), void 0) : (this._layout(), void 0)
            }, d.prototype._layout = function () {
                var t = this._getIsInstant();
                this._resetLayout(), this._manageStamps(), this.layoutItems(this.filteredItems, t), this._isLayoutInited = !0
            }, d.prototype.arrange = function (t) {
                function e() {
                    o.reveal(i.needReveal), o.hide(i.needHide)
                }
                this.option(t), this._getIsInstant();
                var i = this._filter(this.items);
                this.filteredItems = i.matches;
                var o = this;
                this._bindArrangeComplete(), this._isInstant ? this._noTransition(e) : e(), this._sort(), this._layout()
            }, d.prototype._init = d.prototype.arrange, d.prototype._getIsInstant = function () {
                var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
                return this._isInstant = t, t
            }, d.prototype._bindArrangeComplete = function () {
                function t() {
                    e && i && o && n.emitEvent("arrangeComplete", [n.filteredItems])
                }
                var e, i, o, n = this;
                this.once("layoutComplete", function () {
                    e = !0, t()
                }), this.once("hideComplete", function () {
                    i = !0, t()
                }), this.once("revealComplete", function () {
                    o = !0, t()
                })
            }, d.prototype._filter = function (t) {
                var e = this.options.filter;
                e = e || "*";
                for (var i = [], o = [], n = [], r = this._getFilterTest(e), s = 0, a = t.length; a > s; s++) {
                    var u = t[s];
                    if (!u.isIgnored) {
                        var p = r(u);
                        p && i.push(u), p && u.isHidden ? o.push(u) : p || u.isHidden || n.push(u)
                    }
                }
                return{matches: i, needReveal: o, needHide: n}
            }, d.prototype._getFilterTest = function (t) {
                return u && this.options.isJQueryFiltering ? function (e) {
                    return u(e.element).is(t)
                } : "function" == typeof t ? function (e) {
                    return t(e.element)
                } : function (e) {
                    return o(e.element, t)
                }
            }, d.prototype.updateSortData = function (t) {
                var e;
                t ? (t = n.makeArray(t), e = this.getItems(t)) : e = this.items, this._getSorters(), this._updateItemsSortData(e)
            }, d.prototype._getSorters = function () {
                var t = this.options.getSortData;
                for (var e in t) {
                    var i = t[e];
                    this._sorters[e] = l(i)
                }
            }, d.prototype._updateItemsSortData = function (t) {
                for (var e = t && t.length, i = 0; e && e > i; i++) {
                    var o = t[i];
                    o.updateSortData()
                }
            };
            var l = function () {
                function t(t) {
                    if ("string" != typeof t)
                        return t;
                    var i = p(t).split(" "), o = i[0], n = o.match(/^\[(.+)\]$/), r = n && n[1], s = e(r, o), a = d.sortDataParsers[i[1]];
                    return t = a ? function (t) {
                        return t && a(s(t))
                    } : function (t) {
                        return t && s(t)
                    }
                }
                function e(t, e) {
                    var i;
                    return i = t ? function (e) {
                        return e.getAttribute(t)
                    } : function (t) {
                        var i = t.querySelector(e);
                        return i && f(i)
                    }
                }
                return t
            }();
            d.sortDataParsers = {parseInt: function (t) {
                    return parseInt(t, 10)
                }, parseFloat: function (t) {
                    return parseFloat(t)
                }}, d.prototype._sort = function () {
                var t = this.options.sortBy;
                if (t) {
                    var e = [].concat.apply(t, this.sortHistory), i = a(e, this.options.sortAscending);
                    this.filteredItems.sort(i), t != this.sortHistory[0] && this.sortHistory.unshift(t)
                }
            }, d.prototype._mode = function () {
                var t = this.options.layoutMode, e = this.modes[t];
                if (!e)
                    throw Error("No layout mode: " + t);
                return e.options = this.options[t], e
            }, d.prototype._resetLayout = function () {
                e.prototype._resetLayout.call(this), this._mode()._resetLayout()
            }, d.prototype._getItemLayoutPosition = function (t) {
                return this._mode()._getItemLayoutPosition(t)
            }, d.prototype._manageStamp = function (t) {
                this._mode()._manageStamp(t)
            }, d.prototype._getContainerSize = function () {
                return this._mode()._getContainerSize()
            }, d.prototype.needsResizeLayout = function () {
                return this._mode().needsResizeLayout()
            }, d.prototype.appended = function (t) {
                var e = this.addItems(t);
                if (e.length) {
                    var i = this._filterRevealAdded(e);
                    this.filteredItems = this.filteredItems.concat(i)
                }
            }, d.prototype.prepended = function (t) {
                var e = this._itemize(t);
                if (e.length) {
                    this._resetLayout(), this._manageStamps();
                    var i = this._filterRevealAdded(e);
                    this.layoutItems(this.filteredItems), this.filteredItems = i.concat(this.filteredItems), this.items = e.concat(this.items)
                }
            }, d.prototype._filterRevealAdded = function (t) {
                var e = this._filter(t);
                return this.hide(e.needHide), this.reveal(e.matches), this.layoutItems(e.matches, !0), e.matches
            }, d.prototype.insert = function (t) {
                var e = this.addItems(t);
                if (e.length) {
                    var i, o, n = e.length;
                    for (i = 0; n > i; i++)
                        o = e[i], this.element.appendChild(o.element);
                    var r = this._filter(e).matches;
                    for (i = 0; n > i; i++)
                        e[i].isLayoutInstant = !0;
                    for (this.arrange(), i = 0; n > i; i++)
                        delete e[i].isLayoutInstant;
                    this.reveal(r)
                }
            };
            var c = d.prototype.remove;
            return d.prototype.remove = function (t) {
                t = n.makeArray(t);
                var e = this.getItems(t);
                c.call(this, t);
                var i = e && e.length;
                if (i)
                    for (var o = 0; i > o; o++) {
                        var r = e[o];
                        n.removeFrom(this.filteredItems, r)
                    }
            }, d.prototype.shuffle = function () {
                for (var t = 0, e = this.items.length; e > t; t++) {
                    var i = this.items[t];
                    i.sortData.random = Math.random()
                }
                this.options.sortBy = "random", this._sort(), this._layout()
            }, d.prototype._noTransition = function (t) {
                var e = this.options.transitionDuration;
                this.options.transitionDuration = 0;
                var i = t.call(this);
                return this.options.transitionDuration = e, i
            }, d.prototype.getFilteredItemElements = function () {
                for (var t = [], e = 0, i = this.filteredItems.length; i > e; e++)
                    t.push(this.filteredItems[e].element);
                return t
            }, d
        });
        /*animsition*/
        /*!
         * animsition v3.5.2
         * http://blivesta.github.io/animsition/
         * Licensed under MIT
         * Author : blivesta
         * http://blivesta.com/
         */
        !function (a) {
            "use strict";
            var b = "animsition", c = {init: function (d) {
                    d = a.extend({inClass: "fade-in", outClass: "fade-out", inDuration: 1500, outDuration: 800, linkElement: ".animsition-link", loading: !0, loadingParentElement: "body", loadingClass: "animsition-loading", unSupportCss: ["animation-duration", "-webkit-animation-duration", "-o-animation-duration"], overlay: !1, overlayClass: "animsition-overlay-slide", overlayParentElement: "body"}, d);
                    var e = c.supportCheck.call(this, d);
                    if (!e)
                        return"console"in window || (window.console = {}, window.console.log = function (a) {
                            return a
                        }), console.log("Animsition does not support this browser."), c.destroy.call(this);
                    var f = c.optionCheck.call(this, d);
                    return f && c.addOverlay.call(this, d), d.loading && c.addLoading.call(this, d), this.each(function () {
                        var e = this, f = a(this), g = a(window), h = f.data(b);
                        h || (d = a.extend({}, d), f.data(b, {options: d}), g.on("load." + b + " pageshow." + b, function () {
                            c.pageIn.call(e)
                        }), g.on("unload." + b, function () {
                        }), a(d.linkElement).on("click." + b, function (b) {
                            b.preventDefault();
                            var d = a(this), f = d.attr("href");
                            2 === b.which || b.metaKey || b.shiftKey || -1 !== navigator.platform.toUpperCase().indexOf("WIN") && b.ctrlKey ? window.open(f, "_blank") : c.pageOut.call(e, d, f)
                        }))
                    })
                }, addOverlay: function (b) {
                    a(b.overlayParentElement).prepend('<div class="' + b.overlayClass + '"></div>')
                }, addLoading: function (b) {
                    a(b.loadingParentElement).append('<div class="' + b.loadingClass + '"></div>')
                }, removeLoading: function () {
                    var c = a(this), d = c.data(b).options, e = a(d.loadingParentElement).children("." + d.loadingClass);
                    e.fadeOut().remove()
                }, supportCheck: function (b) {
                    var c = a(this), d = b.unSupportCss, e = d.length, f = !1;
                    0 === e && (f = !0);
                    for (var g = 0; e > g; g++)
                        if ("string" == typeof c.css(d[g])) {
                            f = !0;
                            break
                        }
                    return f
                }, optionCheck: function (b) {
                    var c, d = a(this);
                    return c = b.overlay || d.data("animsition-overlay") ? !0 : !1
                }, animationCheck: function (c, d, e) {
                    var f = a(this), g = f.data(b).options, h = typeof c, i = !d && "number" === h, j = d && "string" === h && c.length > 0;
                    return i || j ? c = c : d && e ? c = g.inClass : !d && e ? c = g.inDuration : d && !e ? c = g.outClass : d || e || (c = g.outDuration), c
                }, pageIn: function () {
                    var d = this, e = a(this), f = e.data(b).options, g = e.data("animsition-in-duration"), h = e.data("animsition-in"), i = c.animationCheck.call(d, g, !1, !0), j = c.animationCheck.call(d, h, !0, !0), k = c.optionCheck.call(d, f);
                    f.loading && c.removeLoading.call(d), k ? c.pageInOverlay.call(d, j, i) : c.pageInBasic.call(d, j, i)
                }, pageInBasic: function (b, c) {
                    var d = a(this);
                    d.trigger("animsition.start").css({"animation-duration": c / 1e3 + "s"}).addClass(b).animateCallback(function () {
                        d.removeClass(b).css({opacity: 1}).trigger("animsition.end")
                    })
                }, pageInOverlay: function (c, d) {
                    var e = a(this), f = e.data(b).options;
                    e.trigger("animsition.start").css({opacity: 1}), a(f.overlayParentElement).children("." + f.overlayClass).css({"animation-duration": d / 1e3 + "s"}).addClass(c).animateCallback(function () {
                        e.trigger("animsition.end")
                    })
                }, pageOut: function (d, e) {
                    var f = this, g = a(this), h = g.data(b).options, i = d.data("animsition-out"), j = g.data("animsition-out"), k = d.data("animsition-out-duration"), l = g.data("animsition-out-duration"), m = i ? i : j, n = k ? k : l, o = c.animationCheck.call(f, m, !0, !1), p = c.animationCheck.call(f, n, !1, !1), q = c.optionCheck.call(f, h);
                    q ? c.pageOutOverlay.call(f, o, p, e) : c.pageOutBasic.call(f, o, p, e)
                }, pageOutBasic: function (b, c, d) {
                    var e = a(this);
                    e.css({"animation-duration": c / 1e3 + "s"}).addClass(b).animateCallback(function () {
                        location.href = d
                    })
                }, pageOutOverlay: function (d, e, f) {
                    var g = this, h = a(this), i = h.data(b).options, j = h.data("animsition-in"), k = c.animationCheck.call(g, j, !0, !0);
                    a(i.overlayParentElement).children("." + i.overlayClass).css({"animation-duration": e / 1e3 + "s"}).removeClass(k).addClass(d).animateCallback(function () {
                        location.href = f
                    })
                }, destroy: function () {
                    return this.each(function () {
                        var c = a(this);
                        a(window).unbind("." + b), c.css({opacity: 1}).removeData(b)
                    })
                }};
            a.fn.animateCallback = function (b) {
                var c = "animationend webkitAnimationEnd mozAnimationEnd oAnimationEnd MSAnimationEnd";
                return this.each(function () {
                    a(this).bind(c, function () {
                        return a(this).unbind(c), b.call(this)
                    })
                })
            }, a.fn.animsition = function (d) {
                return c[d] ? c[d].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof d && d ? void a.error("Method " + d + " does not exist on jQuery." + b) : c.init.apply(this, arguments)
            }
        }(jQuery);

        /*waypoints*/
// Generated by CoffeeScript 1.6.2
        /*!
         jQuery Waypoints - v2.0.5
         Copyright (c) 2011-2014 Caleb Troughton
         Licensed under the MIT license.
         https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
         */
        (function () {
            var t = [].indexOf || function (t) {
                for (var e = 0, n = this.length; e < n; e++) {
                    if (e in this && this[e] === t)
                        return e
                }
                return-1
            }, e = [].slice;
            (function (t, e) {
                if (typeof define === "function" && define.amd) {
                    return define("waypoints", ["jquery"], function (n) {
                        return e(n, t)
                    })
                } else {
                    return e(t.jQuery, t)
                }
            })(window, function (n, r) {
                var i, o, l, s, f, u, c, a, h, d, p, y, v, w, g, m;
                i = n(r);
                a = t.call(r, "ontouchstart") >= 0;
                s = {horizontal: {}, vertical: {}};
                f = 1;
                c = {};
                u = "waypoints-context-id";
                p = "resize.waypoints";
                y = "scroll.waypoints";
                v = 1;
                w = "waypoints-waypoint-ids";
                g = "waypoint";
                m = "waypoints";
                o = function () {
                    function t(t) {
                        var e = this;
                        this.$element = t;
                        this.element = t[0];
                        this.didResize = false;
                        this.didScroll = false;
                        this.id = "context" + f++;
                        this.oldScroll = {x: t.scrollLeft(), y: t.scrollTop()};
                        this.waypoints = {horizontal: {}, vertical: {}};
                        this.element[u] = this.id;
                        c[this.id] = this;
                        t.bind(y, function () {
                            var t;
                            if (!(e.didScroll || a)) {
                                e.didScroll = true;
                                t = function () {
                                    e.doScroll();
                                    return e.didScroll = false
                                };
                                return r.setTimeout(t, n[m].settings.scrollThrottle)
                            }
                        });
                        t.bind(p, function () {
                            var t;
                            if (!e.didResize) {
                                e.didResize = true;
                                t = function () {
                                    n[m]("refresh");
                                    return e.didResize = false
                                };
                                return r.setTimeout(t, n[m].settings.resizeThrottle)
                            }
                        })
                    }
                    t.prototype.doScroll = function () {
                        var t, e = this;
                        t = {horizontal: {newScroll: this.$element.scrollLeft(), oldScroll: this.oldScroll.x, forward: "right", backward: "left"}, vertical: {newScroll: this.$element.scrollTop(), oldScroll: this.oldScroll.y, forward: "down", backward: "up"}};
                        if (a && (!t.vertical.oldScroll || !t.vertical.newScroll)) {
                            n[m]("refresh")
                        }
                        n.each(t, function (t, r) {
                            var i, o, l;
                            l = [];
                            o = r.newScroll > r.oldScroll;
                            i = o ? r.forward : r.backward;
                            n.each(e.waypoints[t], function (t, e) {
                                var n, i;
                                if (r.oldScroll < (n = e.offset) && n <= r.newScroll) {
                                    return l.push(e)
                                } else if (r.newScroll < (i = e.offset) && i <= r.oldScroll) {
                                    return l.push(e)
                                }
                            });
                            l.sort(function (t, e) {
                                return t.offset - e.offset
                            });
                            if (!o) {
                                l.reverse()
                            }
                            return n.each(l, function (t, e) {
                                if (e.options.continuous || t === l.length - 1) {
                                    return e.trigger([i])
                                }
                            })
                        });
                        return this.oldScroll = {x: t.horizontal.newScroll, y: t.vertical.newScroll}
                    };
                    t.prototype.refresh = function () {
                        var t, e, r, i = this;
                        r = n.isWindow(this.element);
                        e = this.$element.offset();
                        this.doScroll();
                        t = {horizontal: {contextOffset: r ? 0 : e.left, contextScroll: r ? 0 : this.oldScroll.x, contextDimension: this.$element.width(), oldScroll: this.oldScroll.x, forward: "right", backward: "left", offsetProp: "left"}, vertical: {contextOffset: r ? 0 : e.top, contextScroll: r ? 0 : this.oldScroll.y, contextDimension: r ? n[m]("viewportHeight") : this.$element.height(), oldScroll: this.oldScroll.y, forward: "down", backward: "up", offsetProp: "top"}};
                        return n.each(t, function (t, e) {
                            return n.each(i.waypoints[t], function (t, r) {
                                var i, o, l, s, f;
                                i = r.options.offset;
                                l = r.offset;
                                o = n.isWindow(r.element) ? 0 : r.$element.offset()[e.offsetProp];
                                if (n.isFunction(i)) {
                                    i = i.apply(r.element)
                                } else if (typeof i === "string") {
                                    i = parseFloat(i);
                                    if (r.options.offset.indexOf("%") > -1) {
                                        i = Math.ceil(e.contextDimension * i / 100)
                                    }
                                }
                                r.offset = o - e.contextOffset + e.contextScroll - i;
                                if (r.options.onlyOnScroll && l != null || !r.enabled) {
                                    return
                                }
                                if (l !== null && l < (s = e.oldScroll) && s <= r.offset) {
                                    return r.trigger([e.backward])
                                } else if (l !== null && l > (f = e.oldScroll) && f >= r.offset) {
                                    return r.trigger([e.forward])
                                } else if (l === null && e.oldScroll >= r.offset) {
                                    return r.trigger([e.forward])
                                }
                            })
                        })
                    };
                    t.prototype.checkEmpty = function () {
                        if (n.isEmptyObject(this.waypoints.horizontal) && n.isEmptyObject(this.waypoints.vertical)) {
                            this.$element.unbind([p, y].join(" "));
                            return delete c[this.id]
                        }
                    };
                    return t
                }();
                l = function () {
                    function t(t, e, r) {
                        var i, o;
                        if (r.offset === "bottom-in-view") {
                            r.offset = function () {
                                var t;
                                t = n[m]("viewportHeight");
                                if (!n.isWindow(e.element)) {
                                    t = e.$element.height()
                                }
                                return t - n(this).outerHeight()
                            }
                        }
                        this.$element = t;
                        this.element = t[0];
                        this.axis = r.horizontal ? "horizontal" : "vertical";
                        this.callback = r.handler;
                        this.context = e;
                        this.enabled = r.enabled;
                        this.id = "waypoints" + v++;
                        this.offset = null;
                        this.options = r;
                        e.waypoints[this.axis][this.id] = this;
                        s[this.axis][this.id] = this;
                        i = (o = this.element[w]) != null ? o : [];
                        i.push(this.id);
                        this.element[w] = i
                    }
                    t.prototype.trigger = function (t) {
                        if (!this.enabled) {
                            return
                        }
                        if (this.callback != null) {
                            this.callback.apply(this.element, t)
                        }
                        if (this.options.triggerOnce) {
                            return this.destroy()
                        }
                    };
                    t.prototype.disable = function () {
                        return this.enabled = false
                    };
                    t.prototype.enable = function () {
                        this.context.refresh();
                        return this.enabled = true
                    };
                    t.prototype.destroy = function () {
                        delete s[this.axis][this.id];
                        delete this.context.waypoints[this.axis][this.id];
                        return this.context.checkEmpty()
                    };
                    t.getWaypointsByElement = function (t) {
                        var e, r;
                        r = t[w];
                        if (!r) {
                            return[]
                        }
                        e = n.extend({}, s.horizontal, s.vertical);
                        return n.map(r, function (t) {
                            return e[t]
                        })
                    };
                    return t
                }();
                d = {init: function (t, e) {
                        var r;
                        e = n.extend({}, n.fn[g].defaults, e);
                        if ((r = e.handler) == null) {
                            e.handler = t
                        }
                        this.each(function () {
                            var t, r, i, s;
                            t = n(this);
                            i = (s = e.context) != null ? s : n.fn[g].defaults.context;
                            if (!n.isWindow(i)) {
                                i = t.closest(i)
                            }
                            i = n(i);
                            r = c[i[0][u]];
                            if (!r) {
                                r = new o(i)
                            }
                            return new l(t, r, e)
                        });
                        n[m]("refresh");
                        return this
                    }, disable: function () {
                        return d._invoke.call(this, "disable")
                    }, enable: function () {
                        return d._invoke.call(this, "enable")
                    }, destroy: function () {
                        return d._invoke.call(this, "destroy")
                    }, prev: function (t, e) {
                        return d._traverse.call(this, t, e, function (t, e, n) {
                            if (e > 0) {
                                return t.push(n[e - 1])
                            }
                        })
                    }, next: function (t, e) {
                        return d._traverse.call(this, t, e, function (t, e, n) {
                            if (e < n.length - 1) {
                                return t.push(n[e + 1])
                            }
                        })
                    }, _traverse: function (t, e, i) {
                        var o, l;
                        if (t == null) {
                            t = "vertical"
                        }
                        if (e == null) {
                            e = r
                        }
                        l = h.aggregate(e);
                        o = [];
                        this.each(function () {
                            var e;
                            e = n.inArray(this, l[t]);
                            return i(o, e, l[t])
                        });
                        return this.pushStack(o)
                    }, _invoke: function (t) {
                        this.each(function () {
                            var e;
                            e = l.getWaypointsByElement(this);
                            return n.each(e, function (e, n) {
                                n[t]();
                                return true
                            })
                        });
                        return this
                    }};
                n.fn[g] = function () {
                    var t, r;
                    r = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : [];
                    if (d[r]) {
                        return d[r].apply(this, t)
                    } else if (n.isFunction(r)) {
                        return d.init.apply(this, arguments)
                    } else if (n.isPlainObject(r)) {
                        return d.init.apply(this, [null, r])
                    } else if (!r) {
                        return n.error("jQuery Waypoints needs a callback function or handler option.")
                    } else {
                        return n.error("The " + r + " method does not exist in jQuery Waypoints.")
                    }
                };
                n.fn[g].defaults = {context: r, continuous: true, enabled: true, horizontal: false, offset: 0, triggerOnce: false};
                h = {refresh: function () {
                        return n.each(c, function (t, e) {
                            return e.refresh()
                        })
                    }, viewportHeight: function () {
                        var t;
                        return(t = r.innerHeight) != null ? t : i.height()
                    }, aggregate: function (t) {
                        var e, r, i;
                        e = s;
                        if (t) {
                            e = (i = c[n(t)[0][u]]) != null ? i.waypoints : void 0
                        }
                        if (!e) {
                            return[]
                        }
                        r = {horizontal: [], vertical: []};
                        n.each(r, function (t, i) {
                            n.each(e[t], function (t, e) {
                                return i.push(e)
                            });
                            i.sort(function (t, e) {
                                return t.offset - e.offset
                            });
                            r[t] = n.map(i, function (t) {
                                return t.element
                            });
                            return r[t] = n.unique(r[t])
                        });
                        return r
                    }, above: function (t) {
                        if (t == null) {
                            t = r
                        }
                        return h._filter(t, "vertical", function (t, e) {
                            return e.offset <= t.oldScroll.y
                        })
                    }, below: function (t) {
                        if (t == null) {
                            t = r
                        }
                        return h._filter(t, "vertical", function (t, e) {
                            return e.offset > t.oldScroll.y
                        })
                    }, left: function (t) {
                        if (t == null) {
                            t = r
                        }
                        return h._filter(t, "horizontal", function (t, e) {
                            return e.offset <= t.oldScroll.x
                        })
                    }, right: function (t) {
                        if (t == null) {
                            t = r
                        }
                        return h._filter(t, "horizontal", function (t, e) {
                            return e.offset > t.oldScroll.x
                        })
                    }, enable: function () {
                        return h._invoke("enable")
                    }, disable: function () {
                        return h._invoke("disable")
                    }, destroy: function () {
                        return h._invoke("destroy")
                    }, extendFn: function (t, e) {
                        return d[t] = e
                    }, _invoke: function (t) {
                        var e;
                        e = n.extend({}, s.vertical, s.horizontal);
                        return n.each(e, function (e, n) {
                            n[t]();
                            return true
                        })
                    }, _filter: function (t, e, r) {
                        var i, o;
                        i = c[n(t)[0][u]];
                        if (!i) {
                            return[]
                        }
                        o = [];
                        n.each(i.waypoints[e], function (t, e) {
                            if (r(i, e)) {
                                return o.push(e)
                            }
                        });
                        o.sort(function (t, e) {
                            return t.offset - e.offset
                        });
                        return n.map(o, function (t) {
                            return t.element
                        })
                    }};
                n[m] = function () {
                    var t, n;
                    n = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : [];
                    if (h[n]) {
                        return h[n].apply(null, t)
                    } else {
                        return h.aggregate.call(null, n)
                    }
                };
                n[m].settings = {resizeThrottle: 100, scrollThrottle: 30};
                return i.on("load.waypoints", function () {
                    return n[m]("refresh")
                })
            })
        }).call(this);

        /*masonry*/

        /*!
         * Masonry PACKAGED v3.3.0
         * Cascading grid layout library
         * http://masonry.desandro.com
         * MIT License
         * by David DeSandro
         */

        !function (a) {
            function b() {
            }
            function c(a) {
                function c(b) {
                    b.prototype.option || (b.prototype.option = function (b) {
                        a.isPlainObject(b) && (this.options = a.extend(!0, this.options, b))
                    })
                }
                function e(b, c) {
                    a.fn[b] = function (e) {
                        if ("string" == typeof e) {
                            for (var g = d.call(arguments, 1), h = 0, i = this.length; i > h; h++) {
                                var j = this[h], k = a.data(j, b);
                                if (k)
                                    if (a.isFunction(k[e]) && "_" !== e.charAt(0)) {
                                        var l = k[e].apply(k, g);
                                        if (void 0 !== l)
                                            return l
                                    } else
                                        f("no such method '" + e + "' for " + b + " instance");
                                else
                                    f("cannot call methods on " + b + " prior to initialization; attempted to call '" + e + "'")
                            }
                            return this
                        }
                        return this.each(function () {
                            var d = a.data(this, b);
                            d ? (d.option(e), d._init()) : (d = new c(this, e), a.data(this, b, d))
                        })
                    }
                }
                if (a) {
                    var f = "undefined" == typeof console ? b : function (a) {
                        console.error(a)
                    };
                    return a.bridget = function (a, b) {
                        c(b), e(a, b)
                    }, a.bridget
                }
            }
            var d = Array.prototype.slice;
            "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], c) : c("object" == typeof exports ? require("jquery") : a.jQuery)
        }(window), function (a) {
            function b(b) {
                var c = a.event;
                return c.target = c.target || c.srcElement || b, c
            }
            var c = document.documentElement, d = function () {
            };
            c.addEventListener ? d = function (a, b, c) {
                a.addEventListener(b, c, !1)
            } : c.attachEvent && (d = function (a, c, d) {
                a[c + d] = d.handleEvent ? function () {
                    var c = b(a);
                    d.handleEvent.call(d, c)
                } : function () {
                    var c = b(a);
                    d.call(a, c)
                }, a.attachEvent("on" + c, a[c + d])
            });
            var e = function () {
            };
            c.removeEventListener ? e = function (a, b, c) {
                a.removeEventListener(b, c, !1)
            } : c.detachEvent && (e = function (a, b, c) {
                a.detachEvent("on" + b, a[b + c]);
                try {
                    delete a[b + c]
                } catch (d) {
                    a[b + c] = void 0
                }
            });
            var f = {bind: d, unbind: e};
            "function" == typeof define && define.amd ? define("eventie/eventie", f) : "object" == typeof exports ? module.exports = f : a.eventie = f
        }(window), function () {
            function a() {
            }
            function b(a, b) {
                for (var c = a.length; c--; )
                    if (a[c].listener === b)
                        return c;
                return-1
            }
            function c(a) {
                return function () {
                    return this[a].apply(this, arguments)
                }
            }
            var d = a.prototype, e = this, f = e.EventEmitter;
            d.getListeners = function (a) {
                var b, c, d = this._getEvents();
                if (a instanceof RegExp) {
                    b = {};
                    for (c in d)
                        d.hasOwnProperty(c) && a.test(c) && (b[c] = d[c])
                } else
                    b = d[a] || (d[a] = []);
                return b
            }, d.flattenListeners = function (a) {
                var b, c = [];
                for (b = 0; b < a.length; b += 1)
                    c.push(a[b].listener);
                return c
            }, d.getListenersAsObject = function (a) {
                var b, c = this.getListeners(a);
                return c instanceof Array && (b = {}, b[a] = c), b || c
            }, d.addListener = function (a, c) {
                var d, e = this.getListenersAsObject(a), f = "object" == typeof c;
                for (d in e)
                    e.hasOwnProperty(d) && -1 === b(e[d], c) && e[d].push(f ? c : {listener: c, once: !1});
                return this
            }, d.on = c("addListener"), d.addOnceListener = function (a, b) {
                return this.addListener(a, {listener: b, once: !0})
            }, d.once = c("addOnceListener"), d.defineEvent = function (a) {
                return this.getListeners(a), this
            }, d.defineEvents = function (a) {
                for (var b = 0; b < a.length; b += 1)
                    this.defineEvent(a[b]);
                return this
            }, d.removeListener = function (a, c) {
                var d, e, f = this.getListenersAsObject(a);
                for (e in f)
                    f.hasOwnProperty(e) && (d = b(f[e], c), -1 !== d && f[e].splice(d, 1));
                return this
            }, d.off = c("removeListener"), d.addListeners = function (a, b) {
                return this.manipulateListeners(!1, a, b)
            }, d.removeListeners = function (a, b) {
                return this.manipulateListeners(!0, a, b)
            }, d.manipulateListeners = function (a, b, c) {
                var d, e, f = a ? this.removeListener : this.addListener, g = a ? this.removeListeners : this.addListeners;
                if ("object" != typeof b || b instanceof RegExp)
                    for (d = c.length; d--; )
                        f.call(this, b, c[d]);
                else
                    for (d in b)
                        b.hasOwnProperty(d) && (e = b[d]) && ("function" == typeof e ? f.call(this, d, e) : g.call(this, d, e));
                return this
            }, d.removeEvent = function (a) {
                var b, c = typeof a, d = this._getEvents();
                if ("string" === c)
                    delete d[a];
                else if (a instanceof RegExp)
                    for (b in d)
                        d.hasOwnProperty(b) && a.test(b) && delete d[b];
                else
                    delete this._events;
                return this
            }, d.removeAllListeners = c("removeEvent"), d.emitEvent = function (a, b) {
                var c, d, e, f, g = this.getListenersAsObject(a);
                for (e in g)
                    if (g.hasOwnProperty(e))
                        for (d = g[e].length; d--; )
                            c = g[e][d], c.once === !0 && this.removeListener(a, c.listener), f = c.listener.apply(this, b || []), f === this._getOnceReturnValue() && this.removeListener(a, c.listener);
                return this
            }, d.trigger = c("emitEvent"), d.emit = function (a) {
                var b = Array.prototype.slice.call(arguments, 1);
                return this.emitEvent(a, b)
            }, d.setOnceReturnValue = function (a) {
                return this._onceReturnValue = a, this
            }, d._getOnceReturnValue = function () {
                return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
            }, d._getEvents = function () {
                return this._events || (this._events = {})
            }, a.noConflict = function () {
                return e.EventEmitter = f, a
            }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
                return a
            }) : "object" == typeof module && module.exports ? module.exports = a : e.EventEmitter = a
        }.call(this), function (a) {
            function b(a) {
                if (a) {
                    if ("string" == typeof d[a])
                        return a;
                    a = a.charAt(0).toUpperCase() + a.slice(1);
                    for (var b, e = 0, f = c.length; f > e; e++)
                        if (b = c[e] + a, "string" == typeof d[b])
                            return b
                }
            }
            var c = "Webkit Moz ms Ms O".split(" "), d = document.documentElement.style;
            "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
                return b
            }) : "object" == typeof exports ? module.exports = b : a.getStyleProperty = b
        }(window), function (a) {
            function b(a) {
                var b = parseFloat(a), c = -1 === a.indexOf("%") && !isNaN(b);
                return c && b
            }
            function c() {
            }
            function d() {
                for (var a = {width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0}, b = 0, c = g.length; c > b; b++) {
                    var d = g[b];
                    a[d] = 0
                }
                return a
            }
            function e(c) {
                function e() {
                    if (!m) {
                        m = !0;
                        var d = a.getComputedStyle;
                        if (j = function () {
                            var a = d ? function (a) {
                                return d(a, null)
                            } : function (a) {
                                return a.currentStyle
                            };
                            return function (b) {
                                var c = a(b);
                                return c || f("Style returned " + c + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), c
                            }
                        }(), k = c("boxSizing")) {
                            var e = document.createElement("div");
                            e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style[k] = "border-box";
                            var g = document.body || document.documentElement;
                            g.appendChild(e);
                            var h = j(e);
                            l = 200 === b(h.width), g.removeChild(e)
                        }
                    }
                }
                function h(a) {
                    if (e(), "string" == typeof a && (a = document.querySelector(a)), a && "object" == typeof a && a.nodeType) {
                        var c = j(a);
                        if ("none" === c.display)
                            return d();
                        var f = {};
                        f.width = a.offsetWidth, f.height = a.offsetHeight;
                        for (var h = f.isBorderBox = !(!k || !c[k] || "border-box" !== c[k]), m = 0, n = g.length; n > m; m++) {
                            var o = g[m], p = c[o];
                            p = i(a, p);
                            var q = parseFloat(p);
                            f[o] = isNaN(q) ? 0 : q
                        }
                        var r = f.paddingLeft + f.paddingRight, s = f.paddingTop + f.paddingBottom, t = f.marginLeft + f.marginRight, u = f.marginTop + f.marginBottom, v = f.borderLeftWidth + f.borderRightWidth, w = f.borderTopWidth + f.borderBottomWidth, x = h && l, y = b(c.width);
                        y !== !1 && (f.width = y + (x ? 0 : r + v));
                        var z = b(c.height);
                        return z !== !1 && (f.height = z + (x ? 0 : s + w)), f.innerWidth = f.width - (r + v), f.innerHeight = f.height - (s + w), f.outerWidth = f.width + t, f.outerHeight = f.height + u, f
                    }
                }
                function i(b, c) {
                    if (a.getComputedStyle || -1 === c.indexOf("%"))
                        return c;
                    var d = b.style, e = d.left, f = b.runtimeStyle, g = f && f.left;
                    return g && (f.left = b.currentStyle.left), d.left = c, c = d.pixelLeft, d.left = e, g && (f.left = g), c
                }
                var j, k, l, m = !1;
                return h
            }
            var f = "undefined" == typeof console ? c : function (a) {
                console.error(a)
            }, g = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
            "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], e) : "object" == typeof exports ? module.exports = e(require("desandro-get-style-property")) : a.getSize = e(a.getStyleProperty)
        }(window), function (a) {
            function b(a) {
                "function" == typeof a && (b.isReady ? a() : g.push(a))
            }
            function c(a) {
                var c = "readystatechange" === a.type && "complete" !== f.readyState;
                b.isReady || c || d()
            }
            function d() {
                b.isReady = !0;
                for (var a = 0, c = g.length; c > a; a++) {
                    var d = g[a];
                    d()
                }
            }
            function e(e) {
                return"complete" === f.readyState ? d() : (e.bind(f, "DOMContentLoaded", c), e.bind(f, "readystatechange", c), e.bind(a, "load", c)), b
            }
            var f = a.document, g = [];
            b.isReady = !1, "function" == typeof define && define.amd ? define("doc-ready/doc-ready", ["eventie/eventie"], e) : "object" == typeof exports ? module.exports = e(require("eventie")) : a.docReady = e(a.eventie)
        }(window), function (a) {
            function b(a, b) {
                return a[g](b)
            }
            function c(a) {
                if (!a.parentNode) {
                    var b = document.createDocumentFragment();
                    b.appendChild(a)
                }
            }
            function d(a, b) {
                c(a);
                for (var d = a.parentNode.querySelectorAll(b), e = 0, f = d.length; f > e; e++)
                    if (d[e] === a)
                        return!0;
                return!1
            }
            function e(a, d) {
                return c(a), b(a, d)
            }
            var f, g = function () {
                if (a.matches)
                    return"matches";
                if (a.matchesSelector)
                    return"matchesSelector";
                for (var b = ["webkit", "moz", "ms", "o"], c = 0, d = b.length; d > c; c++) {
                    var e = b[c], f = e + "MatchesSelector";
                    if (a[f])
                        return f
                }
            }();
            if (g) {
                var h = document.createElement("div"), i = b(h, "div");
                f = i ? b : e
            } else
                f = d;
            "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function () {
                return f
            }) : "object" == typeof exports ? module.exports = f : window.matchesSelector = f
        }(Element.prototype), function (a, b) {
            "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["doc-ready/doc-ready", "matches-selector/matches-selector"], function (c, d) {
                return b(a, c, d)
            }) : "object" == typeof exports ? module.exports = b(a, require("doc-ready"), require("desandro-matches-selector")) : a.fizzyUIUtils = b(a, a.docReady, a.matchesSelector)
        }(window, function (a, b, c) {
            var d = {};
            d.extend = function (a, b) {
                for (var c in b)
                    a[c] = b[c];
                return a
            }, d.modulo = function (a, b) {
                return(a % b + b) % b
            };
            var e = Object.prototype.toString;
            d.isArray = function (a) {
                return"[object Array]" == e.call(a)
            }, d.makeArray = function (a) {
                var b = [];
                if (d.isArray(a))
                    b = a;
                else if (a && "number" == typeof a.length)
                    for (var c = 0, e = a.length; e > c; c++)
                        b.push(a[c]);
                else
                    b.push(a);
                return b
            }, d.indexOf = Array.prototype.indexOf ? function (a, b) {
                return a.indexOf(b)
            } : function (a, b) {
                for (var c = 0, d = a.length; d > c; c++)
                    if (a[c] === b)
                        return c;
                return-1
            }, d.removeFrom = function (a, b) {
                var c = d.indexOf(a, b);
                -1 != c && a.splice(c, 1)
            }, d.isElement = "function" == typeof HTMLElement || "object" == typeof HTMLElement ? function (a) {
                return a instanceof HTMLElement
            } : function (a) {
                return a && "object" == typeof a && 1 == a.nodeType && "string" == typeof a.nodeName
            }, d.setText = function () {
                function a(a, c) {
                    b = b || (void 0 !== document.documentElement.textContent ? "textContent" : "innerText"), a[b] = c
                }
                var b;
                return a
            }(), d.getParent = function (a, b) {
                for (; a != document.body; )
                    if (a = a.parentNode, c(a, b))
                        return a
            }, d.getQueryElement = function (a) {
                return"string" == typeof a ? document.querySelector(a) : a
            }, d.handleEvent = function (a) {
                var b = "on" + a.type;
                this[b] && this[b](a)
            }, d.filterFindElements = function (a, b) {
                a = d.makeArray(a);
                for (var e = [], f = 0, g = a.length; g > f; f++) {
                    var h = a[f];
                    if (d.isElement(h))
                        if (b) {
                            c(h, b) && e.push(h);
                            for (var i = h.querySelectorAll(b), j = 0, k = i.length; k > j; j++)
                                e.push(i[j])
                        } else
                            e.push(h)
                }
                return e
            }, d.debounceMethod = function (a, b, c) {
                var d = a.prototype[b], e = b + "Timeout";
                a.prototype[b] = function () {
                    var a = this[e];
                    a && clearTimeout(a);
                    var b = arguments, f = this;
                    this[e] = setTimeout(function () {
                        d.apply(f, b), delete f[e]
                    }, c || 100)
                }
            }, d.toDashed = function (a) {
                return a.replace(/(.)([A-Z])/g, function (a, b, c) {
                    return b + "-" + c
                }).toLowerCase()
            };
            var f = a.console;
            return d.htmlInit = function (c, e) {
                b(function () {
                    for (var b = d.toDashed(e), g = document.querySelectorAll(".js-" + b), h = "data-" + b + "-options", i = 0, j = g.length; j > i; i++) {
                        var k, l = g[i], m = l.getAttribute(h);
                        try {
                            k = m && JSON.parse(m)
                        } catch (n) {
                            f && f.error("Error parsing " + h + " on " + l.nodeName.toLowerCase() + (l.id ? "#" + l.id : "") + ": " + n);
                            continue
                        }
                        var o = new c(l, k), p = a.jQuery;
                        p && p.data(l, e, o)
                    }
                })
            }, d
        }), function (a, b) {
            "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property", "fizzy-ui-utils/utils"], function (c, d, e, f) {
                return b(a, c, d, e, f)
            }) : "object" == typeof exports ? module.exports = b(a, require("wolfy87-eventemitter"), require("get-size"), require("desandro-get-style-property"), require("fizzy-ui-utils")) : (a.Outlayer = {}, a.Outlayer.Item = b(a, a.EventEmitter, a.getSize, a.getStyleProperty, a.fizzyUIUtils))
        }(window, function (a, b, c, d, e) {
            function f(a) {
                for (var b in a)
                    return!1;
                return b = null, !0
            }
            function g(a, b) {
                a && (this.element = a, this.layout = b, this.position = {x: 0, y: 0}, this._create())
            }
            var h = a.getComputedStyle, i = h ? function (a) {
                return h(a, null)
            } : function (a) {
                return a.currentStyle
            }, j = d("transition"), k = d("transform"), l = j && k, m = !!d("perspective"), n = {WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "otransitionend", transition: "transitionend"}[j], o = ["transform", "transition", "transitionDuration", "transitionProperty"], p = function () {
                for (var a = {}, b = 0, c = o.length; c > b; b++) {
                    var e = o[b], f = d(e);
                    f && f !== e && (a[e] = f)
                }
                return a
            }();
            e.extend(g.prototype, b.prototype), g.prototype._create = function () {
                this._transn = {ingProperties: {}, clean: {}, onEnd: {}}, this.css({position: "absolute"})
            }, g.prototype.handleEvent = function (a) {
                var b = "on" + a.type;
                this[b] && this[b](a)
            }, g.prototype.getSize = function () {
                this.size = c(this.element)
            }, g.prototype.css = function (a) {
                var b = this.element.style;
                for (var c in a) {
                    var d = p[c] || c;
                    b[d] = a[c]
                }
            }, g.prototype.getPosition = function () {
                var a = i(this.element), b = this.layout.options, c = b.isOriginLeft, d = b.isOriginTop, e = parseInt(a[c ? "left" : "right"], 10), f = parseInt(a[d ? "top" : "bottom"], 10);
                e = isNaN(e) ? 0 : e, f = isNaN(f) ? 0 : f;
                var g = this.layout.size;
                e -= c ? g.paddingLeft : g.paddingRight, f -= d ? g.paddingTop : g.paddingBottom, this.position.x = e, this.position.y = f
            }, g.prototype.layoutPosition = function () {
                var a = this.layout.size, b = this.layout.options, c = {}, d = b.isOriginLeft ? "paddingLeft" : "paddingRight", e = b.isOriginLeft ? "left" : "right", f = b.isOriginLeft ? "right" : "left", g = this.position.x + a[d];
                g = b.percentPosition && !b.isHorizontal ? g / a.width * 100 + "%" : g + "px", c[e] = g, c[f] = "";
                var h = b.isOriginTop ? "paddingTop" : "paddingBottom", i = b.isOriginTop ? "top" : "bottom", j = b.isOriginTop ? "bottom" : "top", k = this.position.y + a[h];
                k = b.percentPosition && b.isHorizontal ? k / a.height * 100 + "%" : k + "px", c[i] = k, c[j] = "", this.css(c), this.emitEvent("layout", [this])
            };
            var q = m ? function (a, b) {
                return"translate3d(" + a + "px, " + b + "px, 0)"
            } : function (a, b) {
                return"translate(" + a + "px, " + b + "px)"
            };
            g.prototype._transitionTo = function (a, b) {
                this.getPosition();
                var c = this.position.x, d = this.position.y, e = parseInt(a, 10), f = parseInt(b, 10), g = e === this.position.x && f === this.position.y;
                if (this.setPosition(a, b), g && !this.isTransitioning)
                    return void this.layoutPosition();
                var h = a - c, i = b - d, j = {}, k = this.layout.options;
                h = k.isOriginLeft ? h : -h, i = k.isOriginTop ? i : -i, j.transform = q(h, i), this.transition({to: j, onTransitionEnd: {transform: this.layoutPosition}, isCleaning: !0})
            }, g.prototype.goTo = function (a, b) {
                this.setPosition(a, b), this.layoutPosition()
            }, g.prototype.moveTo = l ? g.prototype._transitionTo : g.prototype.goTo, g.prototype.setPosition = function (a, b) {
                this.position.x = parseInt(a, 10), this.position.y = parseInt(b, 10)
            }, g.prototype._nonTransition = function (a) {
                this.css(a.to), a.isCleaning && this._removeStyles(a.to);
                for (var b in a.onTransitionEnd)
                    a.onTransitionEnd[b].call(this)
            }, g.prototype._transition = function (a) {
                if (!parseFloat(this.layout.options.transitionDuration))
                    return void this._nonTransition(a);
                var b = this._transn;
                for (var c in a.onTransitionEnd)
                    b.onEnd[c] = a.onTransitionEnd[c];
                for (c in a.to)
                    b.ingProperties[c] = !0, a.isCleaning && (b.clean[c] = !0);
                if (a.from) {
                    this.css(a.from);
                    var d = this.element.offsetHeight;
                    d = null
                }
                this.enableTransition(a.to), this.css(a.to), this.isTransitioning = !0
            };
            var r = k && e.toDashed(k) + ",opacity";
            g.prototype.enableTransition = function () {
                this.isTransitioning || (this.css({transitionProperty: r, transitionDuration: this.layout.options.transitionDuration}), this.element.addEventListener(n, this, !1))
            }, g.prototype.transition = g.prototype[j ? "_transition" : "_nonTransition"], g.prototype.onwebkitTransitionEnd = function (a) {
                this.ontransitionend(a)
            }, g.prototype.onotransitionend = function (a) {
                this.ontransitionend(a)
            };
            var s = {"-webkit-transform": "transform", "-moz-transform": "transform", "-o-transform": "transform"};
            g.prototype.ontransitionend = function (a) {
                if (a.target === this.element) {
                    var b = this._transn, c = s[a.propertyName] || a.propertyName;
                    if (delete b.ingProperties[c], f(b.ingProperties) && this.disableTransition(), c in b.clean && (this.element.style[a.propertyName] = "", delete b.clean[c]), c in b.onEnd) {
                        var d = b.onEnd[c];
                        d.call(this), delete b.onEnd[c]
                    }
                    this.emitEvent("transitionEnd", [this])
                }
            }, g.prototype.disableTransition = function () {
                this.removeTransitionStyles(), this.element.removeEventListener(n, this, !1), this.isTransitioning = !1
            }, g.prototype._removeStyles = function (a) {
                var b = {};
                for (var c in a)
                    b[c] = "";
                this.css(b)
            };
            var t = {transitionProperty: "", transitionDuration: ""};
            return g.prototype.removeTransitionStyles = function () {
                this.css(t)
            }, g.prototype.removeElem = function () {
                this.element.parentNode.removeChild(this.element), this.css({display: ""}), this.emitEvent("remove", [this])
            }, g.prototype.remove = function () {
                if (!j || !parseFloat(this.layout.options.transitionDuration))
                    return void this.removeElem();
                var a = this;
                this.once("transitionEnd", function () {
                    a.removeElem()
                }), this.hide()
            }, g.prototype.reveal = function () {
                delete this.isHidden, this.css({display: ""});
                var a = this.layout.options, b = {}, c = this.getHideRevealTransitionEndProperty("visibleStyle");
                b[c] = this.onRevealTransitionEnd, this.transition({from: a.hiddenStyle, to: a.visibleStyle, isCleaning: !0, onTransitionEnd: b})
            }, g.prototype.onRevealTransitionEnd = function () {
                this.isHidden || this.emitEvent("reveal")
            }, g.prototype.getHideRevealTransitionEndProperty = function (a) {
                var b = this.layout.options[a];
                if (b.opacity)
                    return"opacity";
                for (var c in b)
                    return c
            }, g.prototype.hide = function () {
                this.isHidden = !0, this.css({display: ""});
                var a = this.layout.options, b = {}, c = this.getHideRevealTransitionEndProperty("hiddenStyle");
                b[c] = this.onHideTransitionEnd, this.transition({from: a.visibleStyle, to: a.hiddenStyle, isCleaning: !0, onTransitionEnd: b})
            }, g.prototype.onHideTransitionEnd = function () {
                this.isHidden && (this.css({display: "none"}), this.emitEvent("hide"))
            }, g.prototype.destroy = function () {
                this.css({position: "", left: "", right: "", top: "", bottom: "", transition: "", transform: ""})
            }, g
        }), function (a, b) {
            "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "eventEmitter/EventEmitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function (c, d, e, f, g) {
                return b(a, c, d, e, f, g)
            }) : "object" == typeof exports ? module.exports = b(a, require("eventie"), require("wolfy87-eventemitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : a.Outlayer = b(a, a.eventie, a.EventEmitter, a.getSize, a.fizzyUIUtils, a.Outlayer.Item)
        }(window, function (a, b, c, d, e, f) {
            function g(a, b) {
                var c = e.getQueryElement(a);
                if (!c)
                    return void(h && h.error("Bad element for " + this.constructor.namespace + ": " + (c || a)));
                this.element = c, i && (this.$element = i(this.element)), this.options = e.extend({}, this.constructor.defaults), this.option(b);
                var d = ++k;
                this.element.outlayerGUID = d, l[d] = this, this._create(), this.options.isInitLayout && this.layout()
            }
            var h = a.console, i = a.jQuery, j = function () {
            }, k = 0, l = {};
            return g.namespace = "outlayer", g.Item = f, g.defaults = {containerStyle: {position: "relative"}, isInitLayout: !0, isOriginLeft: !0, isOriginTop: !0, isResizeBound: !0, isResizingContainer: !0, transitionDuration: "0.4s", hiddenStyle: {opacity: 0, transform: "scale(0.001)"}, visibleStyle: {opacity: 1, transform: "scale(1)"}}, e.extend(g.prototype, c.prototype), g.prototype.option = function (a) {
                e.extend(this.options, a)
            }, g.prototype._create = function () {
                this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), e.extend(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
            }, g.prototype.reloadItems = function () {
                this.items = this._itemize(this.element.children)
            }, g.prototype._itemize = function (a) {
                for (var b = this._filterFindItemElements(a), c = this.constructor.Item, d = [], e = 0, f = b.length; f > e; e++) {
                    var g = b[e], h = new c(g, this);
                    d.push(h)
                }
                return d
            }, g.prototype._filterFindItemElements = function (a) {
                return e.filterFindElements(a, this.options.itemSelector)
            }, g.prototype.getItemElements = function () {
                for (var a = [], b = 0, c = this.items.length; c > b; b++)
                    a.push(this.items[b].element);
                return a
            }, g.prototype.layout = function () {
                this._resetLayout(), this._manageStamps();
                var a = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
                this.layoutItems(this.items, a), this._isLayoutInited = !0
            }, g.prototype._init = g.prototype.layout, g.prototype._resetLayout = function () {
                this.getSize()
            }, g.prototype.getSize = function () {
                this.size = d(this.element)
            }, g.prototype._getMeasurement = function (a, b) {
                var c, f = this.options[a];
                f ? ("string" == typeof f ? c = this.element.querySelector(f) : e.isElement(f) && (c = f), this[a] = c ? d(c)[b] : f) : this[a] = 0
            }, g.prototype.layoutItems = function (a, b) {
                a = this._getItemsForLayout(a), this._layoutItems(a, b), this._postLayout()
            }, g.prototype._getItemsForLayout = function (a) {
                for (var b = [], c = 0, d = a.length; d > c; c++) {
                    var e = a[c];
                    e.isIgnored || b.push(e)
                }
                return b
            }, g.prototype._layoutItems = function (a, b) {
                if (this._emitCompleteOnItems("layout", a), a && a.length) {
                    for (var c = [], d = 0, e = a.length; e > d; d++) {
                        var f = a[d], g = this._getItemLayoutPosition(f);
                        g.item = f, g.isInstant = b || f.isLayoutInstant, c.push(g)
                    }
                    this._processLayoutQueue(c)
                }
            }, g.prototype._getItemLayoutPosition = function () {
                return{x: 0, y: 0}
            }, g.prototype._processLayoutQueue = function (a) {
                for (var b = 0, c = a.length; c > b; b++) {
                    var d = a[b];
                    this._positionItem(d.item, d.x, d.y, d.isInstant)
                }
            }, g.prototype._positionItem = function (a, b, c, d) {
                d ? a.goTo(b, c) : a.moveTo(b, c)
            }, g.prototype._postLayout = function () {
                this.resizeContainer()
            }, g.prototype.resizeContainer = function () {
                if (this.options.isResizingContainer) {
                    var a = this._getContainerSize();
                    a && (this._setContainerMeasure(a.width, !0), this._setContainerMeasure(a.height, !1))
                }
            }, g.prototype._getContainerSize = j, g.prototype._setContainerMeasure = function (a, b) {
                if (void 0 !== a) {
                    var c = this.size;
                    c.isBorderBox && (a += b ? c.paddingLeft + c.paddingRight + c.borderLeftWidth + c.borderRightWidth : c.paddingBottom + c.paddingTop + c.borderTopWidth + c.borderBottomWidth), a = Math.max(a, 0), this.element.style[b ? "width" : "height"] = a + "px"
                }
            }, g.prototype._emitCompleteOnItems = function (a, b) {
                function c() {
                    e.emitEvent(a + "Complete", [b])
                }
                function d() {
                    g++, g === f && c()
                }
                var e = this, f = b.length;
                if (!b || !f)
                    return void c();
                for (var g = 0, h = 0, i = b.length; i > h; h++) {
                    var j = b[h];
                    j.once(a, d)
                }
            }, g.prototype.ignore = function (a) {
                var b = this.getItem(a);
                b && (b.isIgnored = !0)
            }, g.prototype.unignore = function (a) {
                var b = this.getItem(a);
                b && delete b.isIgnored
            }, g.prototype.stamp = function (a) {
                if (a = this._find(a)) {
                    this.stamps = this.stamps.concat(a);
                    for (var b = 0, c = a.length; c > b; b++) {
                        var d = a[b];
                        this.ignore(d)
                    }
                }
            }, g.prototype.unstamp = function (a) {
                if (a = this._find(a))
                    for (var b = 0, c = a.length; c > b; b++) {
                        var d = a[b];
                        e.removeFrom(this.stamps, d), this.unignore(d)
                    }
            }, g.prototype._find = function (a) {
                return a ? ("string" == typeof a && (a = this.element.querySelectorAll(a)), a = e.makeArray(a)) : void 0
            }, g.prototype._manageStamps = function () {
                if (this.stamps && this.stamps.length) {
                    this._getBoundingRect();
                    for (var a = 0, b = this.stamps.length; b > a; a++) {
                        var c = this.stamps[a];
                        this._manageStamp(c)
                    }
                }
            }, g.prototype._getBoundingRect = function () {
                var a = this.element.getBoundingClientRect(), b = this.size;
                this._boundingRect = {left: a.left + b.paddingLeft + b.borderLeftWidth, top: a.top + b.paddingTop + b.borderTopWidth, right: a.right - (b.paddingRight + b.borderRightWidth), bottom: a.bottom - (b.paddingBottom + b.borderBottomWidth)}
            }, g.prototype._manageStamp = j, g.prototype._getElementOffset = function (a) {
                var b = a.getBoundingClientRect(), c = this._boundingRect, e = d(a), f = {left: b.left - c.left - e.marginLeft, top: b.top - c.top - e.marginTop, right: c.right - b.right - e.marginRight, bottom: c.bottom - b.bottom - e.marginBottom};
                return f
            }, g.prototype.handleEvent = function (a) {
                var b = "on" + a.type;
                this[b] && this[b](a)
            }, g.prototype.bindResize = function () {
                this.isResizeBound || (b.bind(a, "resize", this), this.isResizeBound = !0)
            }, g.prototype.unbindResize = function () {
                this.isResizeBound && b.unbind(a, "resize", this), this.isResizeBound = !1
            }, g.prototype.onresize = function () {
                function a() {
                    b.resize(), delete b.resizeTimeout
                }
                this.resizeTimeout && clearTimeout(this.resizeTimeout);
                var b = this;
                this.resizeTimeout = setTimeout(a, 100)
            }, g.prototype.resize = function () {
                this.isResizeBound && this.needsResizeLayout() && this.layout()
            }, g.prototype.needsResizeLayout = function () {
                var a = d(this.element), b = this.size && a;
                return b && a.innerWidth !== this.size.innerWidth
            }, g.prototype.addItems = function (a) {
                var b = this._itemize(a);
                return b.length && (this.items = this.items.concat(b)), b
            }, g.prototype.appended = function (a) {
                var b = this.addItems(a);
                b.length && (this.layoutItems(b, !0), this.reveal(b))
            }, g.prototype.prepended = function (a) {
                var b = this._itemize(a);
                if (b.length) {
                    var c = this.items.slice(0);
                    this.items = b.concat(c), this._resetLayout(), this._manageStamps(), this.layoutItems(b, !0), this.reveal(b), this.layoutItems(c)
                }
            }, g.prototype.reveal = function (a) {
                this._emitCompleteOnItems("reveal", a);
                for (var b = a && a.length, c = 0; b && b > c; c++) {
                    var d = a[c];
                    d.reveal()
                }
            }, g.prototype.hide = function (a) {
                this._emitCompleteOnItems("hide", a);
                for (var b = a && a.length, c = 0; b && b > c; c++) {
                    var d = a[c];
                    d.hide()
                }
            }, g.prototype.revealItemElements = function (a) {
                var b = this.getItems(a);
                this.reveal(b)
            }, g.prototype.hideItemElements = function (a) {
                var b = this.getItems(a);
                this.hide(b)
            }, g.prototype.getItem = function (a) {
                for (var b = 0, c = this.items.length; c > b; b++) {
                    var d = this.items[b];
                    if (d.element === a)
                        return d
                }
            }, g.prototype.getItems = function (a) {
                a = e.makeArray(a);
                for (var b = [], c = 0, d = a.length; d > c; c++) {
                    var f = a[c], g = this.getItem(f);
                    g && b.push(g)
                }
                return b
            }, g.prototype.remove = function (a) {
                var b = this.getItems(a);
                if (this._emitCompleteOnItems("remove", b), b && b.length)
                    for (var c = 0, d = b.length; d > c; c++) {
                        var f = b[c];
                        f.remove(), e.removeFrom(this.items, f)
                    }
            }, g.prototype.destroy = function () {
                var a = this.element.style;
                a.height = "", a.position = "", a.width = "";
                for (var b = 0, c = this.items.length; c > b; b++) {
                    var d = this.items[b];
                    d.destroy()
                }
                this.unbindResize();
                var e = this.element.outlayerGUID;
                delete l[e], delete this.element.outlayerGUID, i && i.removeData(this.element, this.constructor.namespace)
            }, g.data = function (a) {
                a = e.getQueryElement(a);
                var b = a && a.outlayerGUID;
                return b && l[b]
            }, g.create = function (a, b) {
                function c() {
                    g.apply(this, arguments)
                }
                return Object.create ? c.prototype = Object.create(g.prototype) : e.extend(c.prototype, g.prototype), c.prototype.constructor = c, c.defaults = e.extend({}, g.defaults), e.extend(c.defaults, b), c.prototype.settings = {}, c.namespace = a, c.data = g.data, c.Item = function () {
                    f.apply(this, arguments)
                }, c.Item.prototype = new f, e.htmlInit(c, a), i && i.bridget && i.bridget(a, c), c
            }, g.Item = f, g
        }), function (a, b) {
            "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size", "fizzy-ui-utils/utils"], b) : "object" == typeof exports ? module.exports = b(require("outlayer"), require("get-size"), require("fizzy-ui-utils")) : a.Masonry = b(a.Outlayer, a.getSize, a.fizzyUIUtils)
        }(window, function (a, b, c) {
            var d = a.create("masonry");
            return d.prototype._resetLayout = function () {
                this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns();
                var a = this.cols;
                for (this.colYs = []; a--; )
                    this.colYs.push(0);
                this.maxY = 0
            }, d.prototype.measureColumns = function () {
                if (this.getContainerWidth(), !this.columnWidth) {
                    var a = this.items[0], c = a && a.element;
                    this.columnWidth = c && b(c).outerWidth || this.containerWidth
                }
                var d = this.columnWidth += this.gutter, e = this.containerWidth + this.gutter, f = e / d, g = d - e % d, h = g && 1 > g ? "round" : "floor";
                f = Math[h](f), this.cols = Math.max(f, 1)
            }, d.prototype.getContainerWidth = function () {
                var a = this.options.isFitWidth ? this.element.parentNode : this.element, c = b(a);
                this.containerWidth = c && c.innerWidth
            }, d.prototype._getItemLayoutPosition = function (a) {
                a.getSize();
                var b = a.size.outerWidth % this.columnWidth, d = b && 1 > b ? "round" : "ceil", e = Math[d](a.size.outerWidth / this.columnWidth);
                e = Math.min(e, this.cols);
                for (var f = this._getColGroup(e), g = Math.min.apply(Math, f), h = c.indexOf(f, g), i = {x: this.columnWidth * h, y: g}, j = g + a.size.outerHeight, k = this.cols + 1 - f.length, l = 0; k > l; l++)
                    this.colYs[h + l] = j;
                return i
            }, d.prototype._getColGroup = function (a) {
                if (2 > a)
                    return this.colYs;
                for (var b = [], c = this.cols + 1 - a, d = 0; c > d; d++) {
                    var e = this.colYs.slice(d, d + a);
                    b[d] = Math.max.apply(Math, e)
                }
                return b
            }, d.prototype._manageStamp = function (a) {
                var c = b(a), d = this._getElementOffset(a), e = this.options.isOriginLeft ? d.left : d.right, f = e + c.outerWidth, g = Math.floor(e / this.columnWidth);
                g = Math.max(0, g);
                var h = Math.floor(f / this.columnWidth);
                h -= f % this.columnWidth ? 0 : 1, h = Math.min(this.cols - 1, h);
                for (var i = (this.options.isOriginTop ? d.top : d.bottom) + c.outerHeight, j = g; h >= j; j++)
                    this.colYs[j] = Math.max(i, this.colYs[j])
            }, d.prototype._getContainerSize = function () {
                this.maxY = Math.max.apply(Math, this.colYs);
                var a = {height: this.maxY};
                return this.options.isFitWidth && (a.width = this._getContainerFitWidth()), a
            }, d.prototype._getContainerFitWidth = function () {
                for (var a = 0, b = this.cols; --b && 0 === this.colYs[b]; )
                    a++;
                return(this.cols - a) * this.columnWidth - this.gutter
            }, d.prototype.needsResizeLayout = function () {
                var a = this.containerWidth;
                return this.getContainerWidth(), a !== this.containerWidth
            }, d
        });

        /*fancy box*/
        /*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
        (function (s, H, f, w) {
            var K = f("html"), q = f(s), p = f(H), b = f.fancybox = function () {
                b.open.apply(this, arguments)
            }, J = navigator.userAgent.match(/msie/i), C = null, t = H.createTouch !== w, u = function (a) {
                return a && a.hasOwnProperty && a instanceof f
            }, r = function (a) {
                return a && "string" === f.type(a)
            }, F = function (a) {
                return r(a) && 0 < a.indexOf("%")
            }, m = function (a, d) {
                var e = parseInt(a, 10) || 0;
                d && F(a) && (e *= b.getViewport()[d] / 100);
                return Math.ceil(e)
            }, x = function (a, b) {
                return m(a, b) + "px"
            };
            f.extend(b, {version: "2.1.5", defaults: {padding: 15, margin: 20,
                    width: 800, height: 600, minWidth: 100, minHeight: 100, maxWidth: 9999, maxHeight: 9999, pixelRatio: 1, autoSize: !0, autoHeight: !1, autoWidth: !1, autoResize: !0, autoCenter: !t, fitToView: !0, aspectRatio: !1, topRatio: 0.5, leftRatio: 0.5, scrolling: "auto", wrapCSS: "", arrows: !0, closeBtn: !0, closeClick: !1, nextClick: !1, mouseWheel: !0, autoPlay: !1, playSpeed: 3E3, preload: 3, modal: !1, loop: !0, ajax: {dataType: "html", headers: {"X-fancyBox": !0}}, iframe: {scrolling: "auto", preload: !0}, swf: {wmode: "transparent", allowfullscreen: "true", allowscriptaccess: "always"},
                    keys: {next: {13: "left", 34: "up", 39: "left", 40: "up"}, prev: {8: "right", 33: "down", 37: "right", 38: "down"}, close: [27], play: [32], toggle: [70]}, direction: {next: "left", prev: "right"}, scrollOutside: !0, index: 0, type: null, href: null, content: null, title: null, tpl: {wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>', image: '<img class="fancybox-image" src="{href}" alt="" />', iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' +
                                (J ? ' allowtransparency="true"' : "") + "></iframe>", error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>', closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>', next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>', prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'}, openEffect: "fade", openSpeed: 250, openEasing: "swing", openOpacity: !0,
                    openMethod: "zoomIn", closeEffect: "fade", closeSpeed: 250, closeEasing: "swing", closeOpacity: !0, closeMethod: "zoomOut", nextEffect: "elastic", nextSpeed: 250, nextEasing: "swing", nextMethod: "changeIn", prevEffect: "elastic", prevSpeed: 250, prevEasing: "swing", prevMethod: "changeOut", helpers: {overlay: !0, title: !0}, onCancel: f.noop, beforeLoad: f.noop, afterLoad: f.noop, beforeShow: f.noop, afterShow: f.noop, beforeChange: f.noop, beforeClose: f.noop, afterClose: f.noop}, group: {}, opts: {}, previous: null, coming: null, current: null, isActive: !1,
                isOpen: !1, isOpened: !1, wrap: null, skin: null, outer: null, inner: null, player: {timer: null, isActive: !1}, ajaxLoad: null, imgPreload: null, transitions: {}, helpers: {}, open: function (a, d) {
                    if (a && (f.isPlainObject(d) || (d = {}), !1 !== b.close(!0)))
                        return f.isArray(a) || (a = u(a) ? f(a).get() : [a]), f.each(a, function (e, c) {
                            var l = {}, g, h, k, n, m;
                            "object" === f.type(c) && (c.nodeType && (c = f(c)), u(c) ? (l = {href: c.data("fancybox-href") || c.attr("href"), title: f("<div/>").text(c.data("fancybox-title") || c.attr("title")).html(), isDom: !0, element: c},
                            f.metadata && f.extend(!0, l, c.metadata())) : l = c);
                            g = d.href || l.href || (r(c) ? c : null);
                            h = d.title !== w ? d.title : l.title || "";
                            n = (k = d.content || l.content) ? "html" : d.type || l.type;
                            !n && l.isDom && (n = c.data("fancybox-type"), n || (n = (n = c.prop("class").match(/fancybox\.(\w+)/)) ? n[1] : null));
                            r(g) && (n || (b.isImage(g) ? n = "image" : b.isSWF(g) ? n = "swf" : "#" === g.charAt(0) ? n = "inline" : r(c) && (n = "html", k = c)), "ajax" === n && (m = g.split(/\s+/, 2), g = m.shift(), m = m.shift()));
                            k || ("inline" === n ? g ? k = f(r(g) ? g.replace(/.*(?=#[^\s]+$)/, "") : g) : l.isDom && (k = c) :
                                    "html" === n ? k = g : n || g || !l.isDom || (n = "inline", k = c));
                            f.extend(l, {href: g, type: n, content: k, title: h, selector: m});
                            a[e] = l
                        }), b.opts = f.extend(!0, {}, b.defaults, d), d.keys !== w && (b.opts.keys = d.keys ? f.extend({}, b.defaults.keys, d.keys) : !1), b.group = a, b._start(b.opts.index)
                }, cancel: function () {
                    var a = b.coming;
                    a && !1 === b.trigger("onCancel") || (b.hideLoading(), a && (b.ajaxLoad && b.ajaxLoad.abort(), b.ajaxLoad = null, b.imgPreload && (b.imgPreload.onload = b.imgPreload.onerror = null), a.wrap && a.wrap.stop(!0, !0).trigger("onReset").remove(),
                            b.coming = null, b.current || b._afterZoomOut(a)))
                }, close: function (a) {
                    b.cancel();
                    !1 !== b.trigger("beforeClose") && (b.unbindEvents(), b.isActive && (b.isOpen && !0 !== a ? (b.isOpen = b.isOpened = !1, b.isClosing = !0, f(".fancybox-item, .fancybox-nav").remove(), b.wrap.stop(!0, !0).removeClass("fancybox-opened"), b.transitions[b.current.closeMethod]()) : (f(".fancybox-wrap").stop(!0).trigger("onReset").remove(), b._afterZoomOut())))
                }, play: function (a) {
                    var d = function () {
                        clearTimeout(b.player.timer)
                    }, e = function () {
                        d();
                        b.current && b.player.isActive &&
                                (b.player.timer = setTimeout(b.next, b.current.playSpeed))
                    }, c = function () {
                        d();
                        p.unbind(".player");
                        b.player.isActive = !1;
                        b.trigger("onPlayEnd")
                    };
                    !0 === a || !b.player.isActive && !1 !== a ? b.current && (b.current.loop || b.current.index < b.group.length - 1) && (b.player.isActive = !0, p.bind({"onCancel.player beforeClose.player": c, "onUpdate.player": e, "beforeLoad.player": d}), e(), b.trigger("onPlayStart")) : c()
                }, next: function (a) {
                    var d = b.current;
                    d && (r(a) || (a = d.direction.next), b.jumpto(d.index + 1, a, "next"))
                }, prev: function (a) {
                    var d =
                            b.current;
                    d && (r(a) || (a = d.direction.prev), b.jumpto(d.index - 1, a, "prev"))
                }, jumpto: function (a, d, e) {
                    var c = b.current;
                    c && (a = m(a), b.direction = d || c.direction[a >= c.index ? "next" : "prev"], b.router = e || "jumpto", c.loop && (0 > a && (a = c.group.length + a % c.group.length), a %= c.group.length), c.group[a] !== w && (b.cancel(), b._start(a)))
                }, reposition: function (a, d) {
                    var e = b.current, c = e ? e.wrap : null, l;
                    c && (l = b._getPosition(d), a && "scroll" === a.type ? (delete l.position, c.stop(!0, !0).animate(l, 200)) : (c.css(l), e.pos = f.extend({}, e.dim, l)))
                },
                update: function (a) {
                    var d = a && a.originalEvent && a.originalEvent.type, e = !d || "orientationchange" === d;
                    e && (clearTimeout(C), C = null);
                    b.isOpen && !C && (C = setTimeout(function () {
                        var c = b.current;
                        c && !b.isClosing && (b.wrap.removeClass("fancybox-tmp"), (e || "load" === d || "resize" === d && c.autoResize) && b._setDimension(), "scroll" === d && c.canShrink || b.reposition(a), b.trigger("onUpdate"), C = null)
                    }, e && !t ? 0 : 300))
                }, toggle: function (a) {
                    b.isOpen && (b.current.fitToView = "boolean" === f.type(a) ? a : !b.current.fitToView, t && (b.wrap.removeAttr("style").addClass("fancybox-tmp"),
                            b.trigger("onUpdate")), b.update())
                }, hideLoading: function () {
                    p.unbind(".loading");
                    f("#fancybox-loading").remove()
                }, showLoading: function () {
                    var a, d;
                    b.hideLoading();
                    a = f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");
                    p.bind("keydown.loading", function (a) {
                        27 === (a.which || a.keyCode) && (a.preventDefault(), b.cancel())
                    });
                    b.defaults.fixed || (d = b.getViewport(), a.css({position: "absolute", top: 0.5 * d.h + d.y, left: 0.5 * d.w + d.x}));
                    b.trigger("onLoading")
                }, getViewport: function () {
                    var a = b.current &&
                            b.current.locked || !1, d = {x: q.scrollLeft(), y: q.scrollTop()};
                    a && a.length ? (d.w = a[0].clientWidth, d.h = a[0].clientHeight) : (d.w = t && s.innerWidth ? s.innerWidth : q.width(), d.h = t && s.innerHeight ? s.innerHeight : q.height());
                    return d
                }, unbindEvents: function () {
                    b.wrap && u(b.wrap) && b.wrap.unbind(".fb");
                    p.unbind(".fb");
                    q.unbind(".fb")
                }, bindEvents: function () {
                    var a = b.current, d;
                    a && (q.bind("orientationchange.fb" + (t ? "" : " resize.fb") + (a.autoCenter && !a.locked ? " scroll.fb" : ""), b.update), (d = a.keys) && p.bind("keydown.fb", function (e) {
                        var c =
                                e.which || e.keyCode, l = e.target || e.srcElement;
                        if (27 === c && b.coming)
                            return!1;
                        e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || l && (l.type || f(l).is("[contenteditable]")) || f.each(d, function (d, l) {
                            if (1 < a.group.length && l[c] !== w)
                                return b[d](l[c]), e.preventDefault(), !1;
                            if (-1 < f.inArray(c, l))
                                return b[d](), e.preventDefault(), !1
                        })
                    }), f.fn.mousewheel && a.mouseWheel && b.wrap.bind("mousewheel.fb", function (d, c, l, g) {
                        for (var h = f(d.target || null), k = !1; h.length && !(k || h.is(".fancybox-skin") || h.is(".fancybox-wrap")); )
                            k = h[0] && !(h[0].style.overflow &&
                                    "hidden" === h[0].style.overflow) && (h[0].clientWidth && h[0].scrollWidth > h[0].clientWidth || h[0].clientHeight && h[0].scrollHeight > h[0].clientHeight), h = f(h).parent();
                        0 !== c && !k && 1 < b.group.length && !a.canShrink && (0 < g || 0 < l ? b.prev(0 < g ? "down" : "left") : (0 > g || 0 > l) && b.next(0 > g ? "up" : "right"), d.preventDefault())
                    }))
                }, trigger: function (a, d) {
                    var e, c = d || b.coming || b.current;
                    if (c) {
                        f.isFunction(c[a]) && (e = c[a].apply(c, Array.prototype.slice.call(arguments, 1)));
                        if (!1 === e)
                            return!1;
                        c.helpers && f.each(c.helpers, function (d, e) {
                            if (e &&
                                    b.helpers[d] && f.isFunction(b.helpers[d][a]))
                                b.helpers[d][a](f.extend(!0, {}, b.helpers[d].defaults, e), c)
                        })
                    }
                    p.trigger(a)
                }, isImage: function (a) {
                    return r(a) && a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)
                }, isSWF: function (a) {
                    return r(a) && a.match(/\.(swf)((\?|#).*)?$/i)
                }, _start: function (a) {
                    var d = {}, e, c;
                    a = m(a);
                    e = b.group[a] || null;
                    if (!e)
                        return!1;
                    d = f.extend(!0, {}, b.opts, e);
                    e = d.margin;
                    c = d.padding;
                    "number" === f.type(e) && (d.margin = [e, e, e, e]);
                    "number" === f.type(c) && (d.padding = [c, c,
                        c, c]);
                    d.modal && f.extend(!0, d, {closeBtn: !1, closeClick: !1, nextClick: !1, arrows: !1, mouseWheel: !1, keys: null, helpers: {overlay: {closeClick: !1}}});
                    d.autoSize && (d.autoWidth = d.autoHeight = !0);
                    "auto" === d.width && (d.autoWidth = !0);
                    "auto" === d.height && (d.autoHeight = !0);
                    d.group = b.group;
                    d.index = a;
                    b.coming = d;
                    if (!1 === b.trigger("beforeLoad"))
                        b.coming = null;
                    else {
                        c = d.type;
                        e = d.href;
                        if (!c)
                            return b.coming = null, b.current && b.router && "jumpto" !== b.router ? (b.current.index = a, b[b.router](b.direction)) : !1;
                        b.isActive = !0;
                        if ("image" ===
                                c || "swf" === c)
                            d.autoHeight = d.autoWidth = !1, d.scrolling = "visible";
                        "image" === c && (d.aspectRatio = !0);
                        "iframe" === c && t && (d.scrolling = "scroll");
                        d.wrap = f(d.tpl.wrap).addClass("fancybox-" + (t ? "mobile" : "desktop") + " fancybox-type-" + c + " fancybox-tmp " + d.wrapCSS).appendTo(d.parent || "body");
                        f.extend(d, {skin: f(".fancybox-skin", d.wrap), outer: f(".fancybox-outer", d.wrap), inner: f(".fancybox-inner", d.wrap)});
                        f.each(["Top", "Right", "Bottom", "Left"], function (a, b) {
                            d.skin.css("padding" + b, x(d.padding[a]))
                        });
                        b.trigger("onReady");
                        if ("inline" === c || "html" === c) {
                            if (!d.content || !d.content.length)
                                return b._error("content")
                        } else if (!e)
                            return b._error("href");
                        "image" === c ? b._loadImage() : "ajax" === c ? b._loadAjax() : "iframe" === c ? b._loadIframe() : b._afterLoad()
                    }
                }, _error: function (a) {
                    f.extend(b.coming, {type: "html", autoWidth: !0, autoHeight: !0, minWidth: 0, minHeight: 0, scrolling: "no", hasError: a, content: b.coming.tpl.error});
                    b._afterLoad()
                }, _loadImage: function () {
                    var a = b.imgPreload = new Image;
                    a.onload = function () {
                        this.onload = this.onerror = null;
                        b.coming.width =
                                this.width / b.opts.pixelRatio;
                        b.coming.height = this.height / b.opts.pixelRatio;
                        b._afterLoad()
                    };
                    a.onerror = function () {
                        this.onload = this.onerror = null;
                        b._error("image")
                    };
                    a.src = b.coming.href;
                    !0 !== a.complete && b.showLoading()
                }, _loadAjax: function () {
                    var a = b.coming;
                    b.showLoading();
                    b.ajaxLoad = f.ajax(f.extend({}, a.ajax, {url: a.href, error: function (a, e) {
                            b.coming && "abort" !== e ? b._error("ajax", a) : b.hideLoading()
                        }, success: function (d, e) {
                            "success" === e && (a.content = d, b._afterLoad())
                        }}))
                }, _loadIframe: function () {
                    var a = b.coming,
                            d = f(a.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", t ? "auto" : a.iframe.scrolling).attr("src", a.href);
                    f(a.wrap).bind("onReset", function () {
                        try {
                            f(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                        } catch (a) {
                        }
                    });
                    a.iframe.preload && (b.showLoading(), d.one("load", function () {
                        f(this).data("ready", 1);
                        t || f(this).bind("load.fb", b.update);
                        f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                        b._afterLoad()
                    }));
                    a.content = d.appendTo(a.inner);
                    a.iframe.preload ||
                            b._afterLoad()
                }, _preloadImages: function () {
                    var a = b.group, d = b.current, e = a.length, c = d.preload ? Math.min(d.preload, e - 1) : 0, f, g;
                    for (g = 1; g <= c; g += 1)
                        f = a[(d.index + g) % e], "image" === f.type && f.href && ((new Image).src = f.href)
                }, _afterLoad: function () {
                    var a = b.coming, d = b.current, e, c, l, g, h;
                    b.hideLoading();
                    if (a && !1 !== b.isActive)
                        if (!1 === b.trigger("afterLoad", a, d))
                            a.wrap.stop(!0).trigger("onReset").remove(), b.coming = null;
                        else {
                            d && (b.trigger("beforeChange", d), d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
                            b.unbindEvents();
                            e = a.content;
                            c = a.type;
                            l = a.scrolling;
                            f.extend(b, {wrap: a.wrap, skin: a.skin, outer: a.outer, inner: a.inner, current: a, previous: d});
                            g = a.href;
                            switch (c) {
                                case "inline":
                                case "ajax":
                                case "html":
                                    a.selector ? e = f("<div>").html(e).find(a.selector) : u(e) && (e.data("fancybox-placeholder") || e.data("fancybox-placeholder", f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()), e = e.show().detach(), a.wrap.bind("onReset", function () {
                                        f(this).find(e).length && e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",
                                                !1)
                                    }));
                                    break;
                                case "image":
                                    e = a.tpl.image.replace(/\{href\}/g, g);
                                    break;
                                case "swf":
                                    e = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + g + '"></param>', h = "", f.each(a.swf, function (a, b) {
                                        e += '<param name="' + a + '" value="' + b + '"></param>';
                                        h += " " + a + '="' + b + '"'
                                    }), e += '<embed src="' + g + '" type="application/x-shockwave-flash" width="100%" height="100%"' + h + "></embed></object>"
                            }
                            u(e) && e.parent().is(a.inner) || a.inner.append(e);
                            b.trigger("beforeShow");
                            a.inner.css("overflow", "yes" === l ? "scroll" : "no" === l ? "hidden" : l);
                            b._setDimension();
                            b.reposition();
                            b.isOpen = !1;
                            b.coming = null;
                            b.bindEvents();
                            if (!b.isOpened)
                                f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();
                            else if (d.prevMethod)
                                b.transitions[d.prevMethod]();
                            b.transitions[b.isOpened ? a.nextMethod : a.openMethod]();
                            b._preloadImages()
                        }
                }, _setDimension: function () {
                    var a = b.getViewport(), d = 0, e = !1, c = !1, e = b.wrap, l = b.skin, g = b.inner, h = b.current, c = h.width, k = h.height, n = h.minWidth, v = h.minHeight, p = h.maxWidth,
                            q = h.maxHeight, t = h.scrolling, r = h.scrollOutside ? h.scrollbarWidth : 0, y = h.margin, z = m(y[1] + y[3]), s = m(y[0] + y[2]), w, A, u, D, B, G, C, E, I;
                    e.add(l).add(g).width("auto").height("auto").removeClass("fancybox-tmp");
                    y = m(l.outerWidth(!0) - l.width());
                    w = m(l.outerHeight(!0) - l.height());
                    A = z + y;
                    u = s + w;
                    D = F(c) ? (a.w - A) * m(c) / 100 : c;
                    B = F(k) ? (a.h - u) * m(k) / 100 : k;
                    if ("iframe" === h.type) {
                        if (I = h.content, h.autoHeight && 1 === I.data("ready"))
                            try {
                                I[0].contentWindow.document.location && (g.width(D).height(9999), G = I.contents().find("body"), r && G.css("overflow-x",
                                        "hidden"), B = G.outerHeight(!0))
                            } catch (H) {
                            }
                    } else if (h.autoWidth || h.autoHeight)
                        g.addClass("fancybox-tmp"), h.autoWidth || g.width(D), h.autoHeight || g.height(B), h.autoWidth && (D = g.width()), h.autoHeight && (B = g.height()), g.removeClass("fancybox-tmp");
                    c = m(D);
                    k = m(B);
                    E = D / B;
                    n = m(F(n) ? m(n, "w") - A : n);
                    p = m(F(p) ? m(p, "w") - A : p);
                    v = m(F(v) ? m(v, "h") - u : v);
                    q = m(F(q) ? m(q, "h") - u : q);
                    G = p;
                    C = q;
                    h.fitToView && (p = Math.min(a.w - A, p), q = Math.min(a.h - u, q));
                    A = a.w - z;
                    s = a.h - s;
                    h.aspectRatio ? (c > p && (c = p, k = m(c / E)), k > q && (k = q, c = m(k * E)), c < n && (c = n, k = m(c /
                            E)), k < v && (k = v, c = m(k * E))) : (c = Math.max(n, Math.min(c, p)), h.autoHeight && "iframe" !== h.type && (g.width(c), k = g.height()), k = Math.max(v, Math.min(k, q)));
                    if (h.fitToView)
                        if (g.width(c).height(k), e.width(c + y), a = e.width(), z = e.height(), h.aspectRatio)
                            for (; (a > A || z > s) && c > n && k > v && !(19 < d++); )
                                k = Math.max(v, Math.min(q, k - 10)), c = m(k * E), c < n && (c = n, k = m(c / E)), c > p && (c = p, k = m(c / E)), g.width(c).height(k), e.width(c + y), a = e.width(), z = e.height();
                        else
                            c = Math.max(n, Math.min(c, c - (a - A))), k = Math.max(v, Math.min(k, k - (z - s)));
                    r && "auto" === t && k < B &&
                            c + y + r < A && (c += r);
                    g.width(c).height(k);
                    e.width(c + y);
                    a = e.width();
                    z = e.height();
                    e = (a > A || z > s) && c > n && k > v;
                    c = h.aspectRatio ? c < G && k < C && c < D && k < B : (c < G || k < C) && (c < D || k < B);
                    f.extend(h, {dim: {width: x(a), height: x(z)}, origWidth: D, origHeight: B, canShrink: e, canExpand: c, wPadding: y, hPadding: w, wrapSpace: z - l.outerHeight(!0), skinSpace: l.height() - k});
                    !I && h.autoHeight && k > v && k < q && !c && g.height("auto")
                }, _getPosition: function (a) {
                    var d = b.current, e = b.getViewport(), c = d.margin, f = b.wrap.width() + c[1] + c[3], g = b.wrap.height() + c[0] + c[2], c = {position: "absolute",
                        top: c[0], left: c[3]};
                    d.autoCenter && d.fixed && !a && g <= e.h && f <= e.w ? c.position = "fixed" : d.locked || (c.top += e.y, c.left += e.x);
                    c.top = x(Math.max(c.top, c.top + (e.h - g) * d.topRatio));
                    c.left = x(Math.max(c.left, c.left + (e.w - f) * d.leftRatio));
                    return c
                }, _afterZoomIn: function () {
                    var a = b.current;
                    a && ((b.isOpen = b.isOpened = !0, b.wrap.css("overflow", "visible").addClass("fancybox-opened"), b.update(), (a.closeClick || a.nextClick && 1 < b.group.length) && b.inner.css("cursor", "pointer").bind("click.fb", function (d) {
                        f(d.target).is("a") || f(d.target).parent().is("a") ||
                                (d.preventDefault(), b[a.closeClick ? "close" : "next"]())
                    }), a.closeBtn && f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb", function (a) {
                        a.preventDefault();
                        b.close()
                    }), a.arrows && 1 < b.group.length && ((a.loop || 0 < a.index) && f(a.tpl.prev).appendTo(b.outer).bind("click.fb", b.prev), (a.loop || a.index < b.group.length - 1) && f(a.tpl.next).appendTo(b.outer).bind("click.fb", b.next)), b.trigger("afterShow"), a.loop || a.index !== a.group.length - 1) ? b.opts.autoPlay && !b.player.isActive && (b.opts.autoPlay = !1, b.play(!0)) : b.play(!1))
                },
                _afterZoomOut: function (a) {
                    a = a || b.current;
                    f(".fancybox-wrap").trigger("onReset").remove();
                    f.extend(b, {group: {}, opts: {}, router: !1, current: null, isActive: !1, isOpened: !1, isOpen: !1, isClosing: !1, wrap: null, skin: null, outer: null, inner: null});
                    b.trigger("afterClose", a)
                }});
            b.transitions = {getOrigPosition: function () {
                    var a = b.current, d = a.element, e = a.orig, c = {}, f = 50, g = 50, h = a.hPadding, k = a.wPadding, n = b.getViewport();
                    !e && a.isDom && d.is(":visible") && (e = d.find("img:first"), e.length || (e = d));
                    u(e) ? (c = e.offset(), e.is("img") &&
                            (f = e.outerWidth(), g = e.outerHeight())) : (c.top = n.y + (n.h - g) * a.topRatio, c.left = n.x + (n.w - f) * a.leftRatio);
                    if ("fixed" === b.wrap.css("position") || a.locked)
                        c.top -= n.y, c.left -= n.x;
                    return c = {top: x(c.top - h * a.topRatio), left: x(c.left - k * a.leftRatio), width: x(f + k), height: x(g + h)}
                }, step: function (a, d) {
                    var e, c, f = d.prop;
                    c = b.current;
                    var g = c.wrapSpace, h = c.skinSpace;
                    if ("width" === f || "height" === f)
                        e = d.end === d.start ? 1 : (a - d.start) / (d.end - d.start), b.isClosing && (e = 1 - e), c = "width" === f ? c.wPadding : c.hPadding, c = a - c, b.skin[f](m("width" ===
                                f ? c : c - g * e)), b.inner[f](m("width" === f ? c : c - g * e - h * e))
                }, zoomIn: function () {
                    var a = b.current, d = a.pos, e = a.openEffect, c = "elastic" === e, l = f.extend({opacity: 1}, d);
                    delete l.position;
                    c ? (d = this.getOrigPosition(), a.openOpacity && (d.opacity = 0.1)) : "fade" === e && (d.opacity = 0.1);
                    b.wrap.css(d).animate(l, {duration: "none" === e ? 0 : a.openSpeed, easing: a.openEasing, step: c ? this.step : null, complete: b._afterZoomIn})
                }, zoomOut: function () {
                    var a = b.current, d = a.closeEffect, e = "elastic" === d, c = {opacity: 0.1};
                    e && (c = this.getOrigPosition(), a.closeOpacity &&
                            (c.opacity = 0.1));
                    b.wrap.animate(c, {duration: "none" === d ? 0 : a.closeSpeed, easing: a.closeEasing, step: e ? this.step : null, complete: b._afterZoomOut})
                }, changeIn: function () {
                    var a = b.current, d = a.nextEffect, e = a.pos, c = {opacity: 1}, f = b.direction, g;
                    e.opacity = 0.1;
                    "elastic" === d && (g = "down" === f || "up" === f ? "top" : "left", "down" === f || "right" === f ? (e[g] = x(m(e[g]) - 200), c[g] = "+=200px") : (e[g] = x(m(e[g]) + 200), c[g] = "-=200px"));
                    "none" === d ? b._afterZoomIn() : b.wrap.css(e).animate(c, {duration: a.nextSpeed, easing: a.nextEasing, complete: b._afterZoomIn})
                },
                changeOut: function () {
                    var a = b.previous, d = a.prevEffect, e = {opacity: 0.1}, c = b.direction;
                    "elastic" === d && (e["down" === c || "up" === c ? "top" : "left"] = ("up" === c || "left" === c ? "-" : "+") + "=200px");
                    a.wrap.animate(e, {duration: "none" === d ? 0 : a.prevSpeed, easing: a.prevEasing, complete: function () {
                            f(this).trigger("onReset").remove()
                        }})
                }};
            b.helpers.overlay = {defaults: {closeClick: !0, speedOut: 200, showEarly: !0, css: {}, locked: !t, fixed: !0}, overlay: null, fixed: !1, el: f("html"), create: function (a) {
                    var d;
                    a = f.extend({}, this.defaults, a);
                    this.overlay &&
                            this.close();
                    d = b.coming ? b.coming.parent : a.parent;
                    this.overlay = f('<div class="fancybox-overlay"></div>').appendTo(d && d.lenth ? d : "body");
                    this.fixed = !1;
                    a.fixed && b.defaults.fixed && (this.overlay.addClass("fancybox-overlay-fixed"), this.fixed = !0)
                }, open: function (a) {
                    var d = this;
                    a = f.extend({}, this.defaults, a);
                    this.overlay ? this.overlay.unbind(".overlay").width("auto").height("auto") : this.create(a);
                    this.fixed || (q.bind("resize.overlay", f.proxy(this.update, this)), this.update());
                    a.closeClick && this.overlay.bind("click.overlay",
                            function (a) {
                                if (f(a.target).hasClass("fancybox-overlay"))
                                    return b.isActive ? b.close() : d.close(), !1
                            });
                    this.overlay.css(a.css).show()
                }, close: function () {
                    q.unbind("resize.overlay");
                    this.el.hasClass("fancybox-lock") && (f(".fancybox-margin").removeClass("fancybox-margin"), this.el.removeClass("fancybox-lock"), q.scrollTop(this.scrollV).scrollLeft(this.scrollH));
                    f(".fancybox-overlay").remove().hide();
                    f.extend(this, {overlay: null, fixed: !1})
                }, update: function () {
                    var a = "100%", b;
                    this.overlay.width(a).height("100%");
                    J ? (b = Math.max(H.documentElement.offsetWidth, H.body.offsetWidth), p.width() > b && (a = p.width())) : p.width() > q.width() && (a = p.width());
                    this.overlay.width(a).height(p.height())
                }, onReady: function (a, b) {
                    var e = this.overlay;
                    f(".fancybox-overlay").stop(!0, !0);
                    e || this.create(a);
                    a.locked && this.fixed && b.fixed && (b.locked = this.overlay.append(b.wrap), b.fixed = !1);
                    !0 === a.showEarly && this.beforeShow.apply(this, arguments)
                }, beforeShow: function (a, b) {
                    b.locked && !this.el.hasClass("fancybox-lock") && (!1 !== this.fixPosition && f("*").filter(function () {
                        return"fixed" ===
                                f(this).css("position") && !f(this).hasClass("fancybox-overlay") && !f(this).hasClass("fancybox-wrap")
                    }).addClass("fancybox-margin"), this.el.addClass("fancybox-margin"), this.scrollV = q.scrollTop(), this.scrollH = q.scrollLeft(), this.el.addClass("fancybox-lock"), q.scrollTop(this.scrollV).scrollLeft(this.scrollH));
                    this.open(a)
                }, onUpdate: function () {
                    this.fixed || this.update()
                }, afterClose: function (a) {
                    this.overlay && !b.coming && this.overlay.fadeOut(a.speedOut, f.proxy(this.close, this))
                }};
            b.helpers.title = {defaults: {type: "float",
                    position: "bottom"}, beforeShow: function (a) {
                    var d = b.current, e = d.title, c = a.type;
                    f.isFunction(e) && (e = e.call(d.element, d));
                    if (r(e) && "" !== f.trim(e)) {
                        d = f('<div class="fancybox-title fancybox-title-' + c + '-wrap">' + e + "</div>");
                        switch (c) {
                            case "inside":
                                c = b.skin;
                                break;
                            case "outside":
                                c = b.wrap;
                                break;
                            case "over":
                                c = b.inner;
                                break;
                            default:
                                c = b.skin, d.appendTo("body"), J && d.width(d.width()), d.wrapInner('<span class="child"></span>'), b.current.margin[2] += Math.abs(m(d.css("margin-bottom")))
                        }
                        d["top" === a.position ? "prependTo" :
                                "appendTo"](c)
                    }
                }};
            f.fn.fancybox = function (a) {
                var d, e = f(this), c = this.selector || "", l = function (g) {
                    var h = f(this).blur(), k = d, l, m;
                    g.ctrlKey || g.altKey || g.shiftKey || g.metaKey || h.is(".fancybox-wrap") || (l = a.groupAttr || "data-fancybox-group", m = h.attr(l), m || (l = "rel", m = h.get(0)[l]), m && "" !== m && "nofollow" !== m && (h = c.length ? f(c) : e, h = h.filter("[" + l + '="' + m + '"]'), k = h.index(this)), a.index = k, !1 !== b.open(h, a) && g.preventDefault())
                };
                a = a || {};
                d = a.index || 0;
                c && !1 !== a.live ? p.undelegate(c, "click.fb-start").delegate(c + ":not('.fancybox-item, .fancybox-nav')",
                        "click.fb-start", l) : e.unbind("click.fb-start").bind("click.fb-start", l);
                this.filter("[data-fancybox-start=1]").trigger("click");
                return this
            };
            p.ready(function () {
                var a, d;
                f.scrollbarWidth === w && (f.scrollbarWidth = function () {
                    var a = f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"), b = a.children(), b = b.innerWidth() - b.height(99).innerWidth();
                    a.remove();
                    return b
                });
                f.support.fixedPosition === w && (f.support.fixedPosition = function () {
                    var a = f('<div style="position:fixed;top:20px;"></div>').appendTo("body"),
                            b = 20 === a[0].offsetTop || 15 === a[0].offsetTop;
                    a.remove();
                    return b
                }());
                f.extend(b.defaults, {scrollbarWidth: f.scrollbarWidth(), fixed: f.support.fixedPosition, parent: f("body")});
                a = f(s).width();
                K.addClass("fancybox-lock-test");
                d = f(s).width();
                K.removeClass("fancybox-lock-test");
                f("<style type='text/css'>.fancybox-margin{margin-right:" + (d - a) + "px;}</style>").appendTo("head")
            })
        })(window, document, jQuery);
        /*!
         * fancyBox - jQuery Plugin
         * version: 2.1.5 (Fri, 14 Jun 2013)
         * requires jQuery v1.6 or later
         *
         * Examples at http://fancyapps.com/fancybox/
         * License: www.fancyapps.com/fancybox/#license
         *
         * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
         *
         */

        ;
        (function (window, document, $, undefined) {
            "use strict";

            var H = $("html"),
                    W = $(window),
                    D = $(document),
                    F = $.fancybox = function () {
                        F.open.apply(this, arguments);
                    },
                    IE = navigator.userAgent.match(/msie/i),
                    didUpdate = null,
                    isTouch = document.createTouch !== undefined,
                    isQuery = function (obj) {
                        return obj && obj.hasOwnProperty && obj instanceof $;
                    },
                    isString = function (str) {
                        return str && $.type(str) === "string";
                    },
                    isPercentage = function (str) {
                        return isString(str) && str.indexOf('%') > 0;
                    },
                    isScrollable = function (el) {
                        return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
                    },
                    getScalar = function (orig, dim) {
                        var value = parseInt(orig, 10) || 0;

                        if (dim && isPercentage(orig)) {
                            value = F.getViewport()[ dim ] / 100 * value;
                        }

                        return Math.ceil(value);
                    },
                    getValue = function (value, dim) {
                        return getScalar(value, dim) + 'px';
                    };

            $.extend(F, {
                // The current version of fancyBox
                version: '2.1.5',
                defaults: {
                    padding: 15,
                    margin: 20,
                    width: 800,
                    height: 600,
                    minWidth: 100,
                    minHeight: 100,
                    maxWidth: 9999,
                    maxHeight: 9999,
                    pixelRatio: 1, // Set to 2 for retina display support

                    autoSize: true,
                    autoHeight: false,
                    autoWidth: false,
                    autoResize: true,
                    autoCenter: !isTouch,
                    fitToView: true,
                    aspectRatio: false,
                    topRatio: 0.5,
                    leftRatio: 0.5,
                    scrolling: 'auto', // 'auto', 'yes' or 'no'
                    wrapCSS: '',
                    arrows: true,
                    closeBtn: true,
                    closeClick: false,
                    nextClick: false,
                    mouseWheel: true,
                    autoPlay: false,
                    playSpeed: 3000,
                    preload: 3,
                    modal: false,
                    loop: true,
                    ajax: {
                        dataType: 'html',
                        headers: {'X-fancyBox': true}
                    },
                    iframe: {
                        scrolling: 'auto',
                        preload: true
                    },
                    swf: {
                        wmode: 'transparent',
                        allowfullscreen: 'true',
                        allowscriptaccess: 'always'
                    },
                    keys: {
                        next: {
                            13: 'left', // enter
                            34: 'up', // page down
                            39: 'left', // right arrow
                            40: 'up'    // down arrow
                        },
                        prev: {
                            8: 'right', // backspace
                            33: 'down', // page up
                            37: 'right', // left arrow
                            38: 'down'    // up arrow
                        },
                        close: [27], // escape key
                        play: [32], // space - start/stop slideshow
                        toggle: [70]  // letter "f" - toggle fullscreen
                    },
                    direction: {
                        next: 'left',
                        prev: 'right'
                    },
                    scrollOutside: true,
                    // Override some properties
                    index: 0,
                    type: null,
                    href: null,
                    content: null,
                    title: null,
                    // HTML templates
                    tpl: {
                        wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                        image: '<img class="fancybox-image" src="{href}" alt="" />',
                        iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
                        error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                        closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                        next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                        prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>',
                        loading: '<div id="fancybox-loading"><div></div></div>'
                    },
                    // Properties for each animation type
                    // Opening fancyBox
                    openEffect: 'fade', // 'elastic', 'fade' or 'none'
                    openSpeed: 250,
                    openEasing: 'swing',
                    openOpacity: true,
                    openMethod: 'zoomIn',
                    // Closing fancyBox
                    closeEffect: 'fade', // 'elastic', 'fade' or 'none'
                    closeSpeed: 250,
                    closeEasing: 'swing',
                    closeOpacity: true,
                    closeMethod: 'zoomOut',
                    // Changing next gallery item
                    nextEffect: 'elastic', // 'elastic', 'fade' or 'none'
                    nextSpeed: 250,
                    nextEasing: 'swing',
                    nextMethod: 'changeIn',
                    // Changing previous gallery item
                    prevEffect: 'elastic', // 'elastic', 'fade' or 'none'
                    prevSpeed: 250,
                    prevEasing: 'swing',
                    prevMethod: 'changeOut',
                    // Enable default helpers
                    helpers: {
                        overlay: true,
                        title: true
                    },
                    // Callbacks
                    onCancel: $.noop, // If canceling
                    beforeLoad: $.noop, // Before loading
                    afterLoad: $.noop, // After loading
                    beforeShow: $.noop, // Before changing in current item
                    afterShow: $.noop, // After opening
                    beforeChange: $.noop, // Before changing gallery item
                    beforeClose: $.noop, // Before closing
                    afterClose: $.noop  // After closing
                },
                //Current state
                group: {}, // Selected group
                opts: {}, // Group options
                previous: null, // Previous element
                coming: null, // Element being loaded
                current: null, // Currently loaded element
                isActive: false, // Is activated
                isOpen: false, // Is currently open
                isOpened: false, // Have been fully opened at least once

                wrap: null,
                skin: null,
                outer: null,
                inner: null,
                player: {
                    timer: null,
                    isActive: false
                },
                // Loaders
                ajaxLoad: null,
                imgPreload: null,
                // Some collections
                transitions: {},
                helpers: {},
                /*
                 *	Static methods
                 */

                open: function (group, opts) {
                    if (!group) {
                        return;
                    }

                    if (!$.isPlainObject(opts)) {
                        opts = {};
                    }

                    // Close if already active
                    if (false === F.close(true)) {
                        return;
                    }

                    // Normalize group
                    if (!$.isArray(group)) {
                        group = isQuery(group) ? $(group).get() : [group];
                    }

                    // Recheck if the type of each element is `object` and set content type (image, ajax, etc)
                    $.each(group, function (i, element) {
                        var obj = {},
                                href,
                                title,
                                content,
                                type,
                                rez,
                                hrefParts,
                                selector;

                        if ($.type(element) === "object") {
                            // Check if is DOM element
                            if (element.nodeType) {
                                element = $(element);
                            }

                            if (isQuery(element)) {
                                obj = {
                                    href: element.data('fancybox-href') || element.attr('href'),
                                    title: $('<div/>').text(element.data('fancybox-title') || element.attr('title') || '').html(),
                                    isDom: true,
                                    element: element
                                };

                                if ($.metadata) {
                                    $.extend(true, obj, element.metadata());
                                }

                            } else {
                                obj = element;
                            }
                        }

                        href = opts.href || obj.href || (isString(element) ? element : null);
                        title = opts.title !== undefined ? opts.title : obj.title || '';

                        content = opts.content || obj.content;
                        type = content ? 'html' : (opts.type || obj.type);

                        if (!type && obj.isDom) {
                            type = element.data('fancybox-type');

                            if (!type) {
                                rez = element.prop('class').match(/fancybox\.(\w+)/);
                                type = rez ? rez[1] : null;
                            }
                        }

                        if (isString(href)) {
                            // Try to guess the content type
                            if (!type) {
                                if (F.isImage(href)) {
                                    type = 'image';

                                } else if (F.isSWF(href)) {
                                    type = 'swf';

                                } else if (href.charAt(0) === '#') {
                                    type = 'inline';

                                } else if (isString(element)) {
                                    type = 'html';
                                    content = element;
                                }
                            }

                            // Split url into two pieces with source url and content selector, e.g,
                            // "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
                            if (type === 'ajax') {
                                hrefParts = href.split(/\s+/, 2);
                                href = hrefParts.shift();
                                selector = hrefParts.shift();
                            }
                        }

                        if (!content) {
                            if (type === 'inline') {
                                if (href) {
                                    content = $(isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href); //strip for ie7

                                } else if (obj.isDom) {
                                    content = element;
                                }

                            } else if (type === 'html') {
                                content = href;

                            } else if (!type && !href && obj.isDom) {
                                type = 'inline';
                                content = element;
                            }
                        }

                        $.extend(obj, {
                            href: href,
                            type: type,
                            content: content,
                            title: title,
                            selector: selector
                        });

                        group[ i ] = obj;
                    });

                    // Extend the defaults
                    F.opts = $.extend(true, {}, F.defaults, opts);

                    // All options are merged recursive except keys
                    if (opts.keys !== undefined) {
                        F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
                    }

                    F.group = group;

                    return F._start(F.opts.index);
                },
                // Cancel image loading or abort ajax request
                cancel: function () {
                    var coming = F.coming;

                    if (coming && false === F.trigger('onCancel')) {
                        return;
                    }

                    F.hideLoading();

                    if (!coming) {
                        return;
                    }

                    if (F.ajaxLoad) {
                        F.ajaxLoad.abort();
                    }

                    F.ajaxLoad = null;

                    if (F.imgPreload) {
                        F.imgPreload.onload = F.imgPreload.onerror = null;
                    }

                    if (coming.wrap) {
                        coming.wrap.stop(true, true).trigger('onReset').remove();
                    }

                    F.coming = null;

                    // If the first item has been canceled, then clear everything
                    if (!F.current) {
                        F._afterZoomOut(coming);
                    }
                },
                // Start closing animation if is open; remove immediately if opening/closing
                close: function (event) {
                    F.cancel();

                    if (false === F.trigger('beforeClose')) {
                        return;
                    }

                    F.unbindEvents();

                    if (!F.isActive) {
                        return;
                    }

                    if (!F.isOpen || event === true) {
                        $('.fancybox-wrap').stop(true).trigger('onReset').remove();

                        F._afterZoomOut();

                    } else {
                        F.isOpen = F.isOpened = false;
                        F.isClosing = true;

                        $('.fancybox-item, .fancybox-nav').remove();

                        F.wrap.stop(true, true).removeClass('fancybox-opened');

                        F.transitions[ F.current.closeMethod ]();
                    }
                },
                // Manage slideshow:
                //   $.fancybox.play(); - toggle slideshow
                //   $.fancybox.play( true ); - start
                //   $.fancybox.play( false ); - stop
                play: function (action) {
                    var clear = function () {
                        clearTimeout(F.player.timer);
                    },
                            set = function () {
                                clear();

                                if (F.current && F.player.isActive) {
                                    F.player.timer = setTimeout(F.next, F.current.playSpeed);
                                }
                            },
                            stop = function () {
                                clear();

                                D.unbind('.player');

                                F.player.isActive = false;

                                F.trigger('onPlayEnd');
                            },
                            start = function () {
                                if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
                                    F.player.isActive = true;

                                    D.bind({
                                        'onCancel.player beforeClose.player': stop,
                                        'onUpdate.player': set,
                                        'beforeLoad.player': clear
                                    });

                                    set();

                                    F.trigger('onPlayStart');
                                }
                            };

                    if (action === true || (!F.player.isActive && action !== false)) {
                        start();
                    } else {
                        stop();
                    }
                },
                // Navigate to next gallery item
                next: function (direction) {
                    var current = F.current;

                    if (current) {
                        if (!isString(direction)) {
                            direction = current.direction.next;
                        }

                        F.jumpto(current.index + 1, direction, 'next');
                    }
                },
                // Navigate to previous gallery item
                prev: function (direction) {
                    var current = F.current;

                    if (current) {
                        if (!isString(direction)) {
                            direction = current.direction.prev;
                        }

                        F.jumpto(current.index - 1, direction, 'prev');
                    }
                },
                // Navigate to gallery item by index
                jumpto: function (index, direction, router) {
                    var current = F.current;

                    if (!current) {
                        return;
                    }

                    index = getScalar(index);

                    F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
                    F.router = router || 'jumpto';

                    if (current.loop) {
                        if (index < 0) {
                            index = current.group.length + (index % current.group.length);
                        }

                        index = index % current.group.length;
                    }

                    if (current.group[ index ] !== undefined) {
                        F.cancel();

                        F._start(index);
                    }
                },
                // Center inside viewport and toggle position type to fixed or absolute if needed
                reposition: function (e, onlyAbsolute) {
                    var current = F.current,
                            wrap = current ? current.wrap : null,
                            pos;

                    if (wrap) {
                        pos = F._getPosition(onlyAbsolute);

                        if (e && e.type === 'scroll') {
                            delete pos.position;

                            wrap.stop(true, true).animate(pos, 200);

                        } else {
                            wrap.css(pos);

                            current.pos = $.extend({}, current.dim, pos);
                        }
                    }
                },
                update: function (e) {
                    var type = (e && e.originalEvent && e.originalEvent.type),
                            anyway = !type || type === 'orientationchange';

                    if (anyway) {
                        clearTimeout(didUpdate);

                        didUpdate = null;
                    }

                    if (!F.isOpen || didUpdate) {
                        return;
                    }

                    didUpdate = setTimeout(function () {
                        var current = F.current;

                        if (!current || F.isClosing) {
                            return;
                        }

                        F.wrap.removeClass('fancybox-tmp');

                        if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
                            F._setDimension();
                        }

                        if (!(type === 'scroll' && current.canShrink)) {
                            F.reposition(e);
                        }

                        F.trigger('onUpdate');

                        didUpdate = null;

                    }, (anyway && !isTouch ? 0 : 300));
                },
                // Shrink content to fit inside viewport or restore if resized
                toggle: function (action) {
                    if (F.isOpen) {
                        F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

                        // Help browser to restore document dimensions
                        if (isTouch) {
                            F.wrap.removeAttr('style').addClass('fancybox-tmp');

                            F.trigger('onUpdate');
                        }

                        F.update();
                    }
                },
                hideLoading: function () {
                    D.unbind('.loading');

                    $('#fancybox-loading').remove();
                },
                showLoading: function () {
                    var el, viewport;

                    F.hideLoading();

                    el = $(F.opts.tpl.loading).click(F.cancel).appendTo('body');

                    // If user will press the escape-button, the request will be canceled
                    D.bind('keydown.loading', function (e) {
                        if ((e.which || e.keyCode) === 27) {
                            e.preventDefault();

                            F.cancel();
                        }
                    });

                    if (!F.defaults.fixed) {
                        viewport = F.getViewport();

                        el.css({
                            position: 'absolute',
                            top: (viewport.h * 0.5) + viewport.y,
                            left: (viewport.w * 0.5) + viewport.x
                        });
                    }

                    F.trigger('onLoading');
                },
                getViewport: function () {
                    var locked = (F.current && F.current.locked) || false,
                            rez = {
                                x: W.scrollLeft(),
                                y: W.scrollTop()
                            };

                    if (locked && locked.length) {
                        rez.w = locked[0].clientWidth;
                        rez.h = locked[0].clientHeight;

                    } else {
                        // See http://bugs.jquery.com/ticket/6724
                        rez.w = isTouch && window.innerWidth ? window.innerWidth : W.width();
                        rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
                    }

                    return rez;
                },
                // Unbind the keyboard / clicking actions
                unbindEvents: function () {
                    if (F.wrap && isQuery(F.wrap)) {
                        F.wrap.unbind('.fb');
                    }

                    D.unbind('.fb');
                    W.unbind('.fb');
                },
                bindEvents: function () {
                    var current = F.current,
                            keys;

                    if (!current) {
                        return;
                    }

                    // Changing document height on iOS devices triggers a 'resize' event,
                    // that can change document height... repeating infinitely
                    W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

                    keys = current.keys;

                    if (keys) {
                        D.bind('keydown.fb', function (e) {
                            var code = e.which || e.keyCode,
                                    target = e.target || e.srcElement;

                            // Skip esc key if loading, because showLoading will cancel preloading
                            if (code === 27 && F.coming) {
                                return false;
                            }

                            // Ignore key combinations and key events within form elements
                            if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
                                $.each(keys, function (i, val) {
                                    if (current.group.length > 1 && val[ code ] !== undefined) {
                                        F[ i ](val[ code ]);

                                        e.preventDefault();
                                        return false;
                                    }

                                    if ($.inArray(code, val) > -1) {
                                        F[ i ]();

                                        e.preventDefault();
                                        return false;
                                    }
                                });
                            }
                        });
                    }

                    if ($.fn.mousewheel && current.mouseWheel) {
                        F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
                            var target = e.target || null,
                                    parent = $(target),
                                    canScroll = false;

                            while (parent.length) {
                                if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
                                    break;
                                }

                                canScroll = isScrollable(parent[0]);
                                parent = $(parent).parent();
                            }

                            if (delta !== 0 && !canScroll) {
                                if (F.group.length > 1 && !current.canShrink) {
                                    if (deltaY > 0 || deltaX > 0) {
                                        F.prev(deltaY > 0 ? 'down' : 'left');

                                    } else if (deltaY < 0 || deltaX < 0) {
                                        F.next(deltaY < 0 ? 'up' : 'right');
                                    }

                                    e.preventDefault();
                                }
                            }
                        });
                    }
                },
                trigger: function (event, o) {
                    var ret, obj = o || F.coming || F.current;

                    if (obj) {
                        if ($.isFunction(obj[event])) {
                            ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
                        }

                        if (ret === false) {
                            return false;
                        }

                        if (obj.helpers) {
                            $.each(obj.helpers, function (helper, opts) {
                                if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
                                    F.helpers[helper][event]($.extend(true, {}, F.helpers[helper].defaults, opts), obj);
                                }
                            });
                        }
                    }

                    D.trigger(event);
                },
                isImage: function (str) {
                    return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
                },
                isSWF: function (str) {
                    return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
                },
                _start: function (index) {
                    var coming = {},
                            obj,
                            href,
                            type,
                            margin,
                            padding;

                    index = getScalar(index);
                    obj = F.group[ index ] || null;

                    if (!obj) {
                        return false;
                    }

                    coming = $.extend(true, {}, F.opts, obj);

                    // Convert margin and padding properties to array - top, right, bottom, left
                    margin = coming.margin;
                    padding = coming.padding;

                    if ($.type(margin) === 'number') {
                        coming.margin = [margin, margin, margin, margin];
                    }

                    if ($.type(padding) === 'number') {
                        coming.padding = [padding, padding, padding, padding];
                    }

                    // 'modal' propery is just a shortcut
                    if (coming.modal) {
                        $.extend(true, coming, {
                            closeBtn: false,
                            closeClick: false,
                            nextClick: false,
                            arrows: false,
                            mouseWheel: false,
                            keys: null,
                            helpers: {
                                overlay: {
                                    closeClick: false
                                }
                            }
                        });
                    }

                    // 'autoSize' property is a shortcut, too
                    if (coming.autoSize) {
                        coming.autoWidth = coming.autoHeight = true;
                    }

                    if (coming.width === 'auto') {
                        coming.autoWidth = true;
                    }

                    if (coming.height === 'auto') {
                        coming.autoHeight = true;
                    }

                    /*
                     * Add reference to the group, so it`s possible to access from callbacks, example:
                     * afterLoad : function() {
                     *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
                     * }
                     */

                    coming.group = F.group;
                    coming.index = index;

                    // Give a chance for callback or helpers to update coming item (type, title, etc)
                    F.coming = coming;

                    if (false === F.trigger('beforeLoad')) {
                        F.coming = null;

                        return;
                    }

                    type = coming.type;
                    href = coming.href;

                    if (!type) {
                        F.coming = null;

                        //If we can not determine content type then drop silently or display next/prev item if looping through gallery
                        if (F.current && F.router && F.router !== 'jumpto') {
                            F.current.index = index;

                            return F[ F.router ](F.direction);
                        }

                        return false;
                    }

                    F.isActive = true;

                    if (type === 'image' || type === 'swf') {
                        coming.autoHeight = coming.autoWidth = false;
                        coming.scrolling = 'visible';
                    }

                    if (type === 'image') {
                        coming.aspectRatio = true;
                    }

                    if (type === 'iframe' && isTouch) {
                        coming.scrolling = 'scroll';
                    }

                    // Build the neccessary markup
                    coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo(coming.parent || 'body');

                    $.extend(coming, {
                        skin: $('.fancybox-skin', coming.wrap),
                        outer: $('.fancybox-outer', coming.wrap),
                        inner: $('.fancybox-inner', coming.wrap)
                    });

                    $.each(["Top", "Right", "Bottom", "Left"], function (i, v) {
                        coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
                    });

                    F.trigger('onReady');

                    // Check before try to load; 'inline' and 'html' types need content, others - href
                    if (type === 'inline' || type === 'html') {
                        if (!coming.content || !coming.content.length) {
                            return F._error('content');
                        }

                    } else if (!href) {
                        return F._error('href');
                    }

                    if (type === 'image') {
                        F._loadImage();

                    } else if (type === 'ajax') {
                        F._loadAjax();

                    } else if (type === 'iframe') {
                        F._loadIframe();

                    } else {
                        F._afterLoad();
                    }
                },
                _error: function (type) {
                    $.extend(F.coming, {
                        type: 'html',
                        autoWidth: true,
                        autoHeight: true,
                        minWidth: 0,
                        minHeight: 0,
                        scrolling: 'no',
                        hasError: type,
                        content: F.coming.tpl.error
                    });

                    F._afterLoad();
                },
                _loadImage: function () {
                    // Reset preload image so it is later possible to check "complete" property
                    var img = F.imgPreload = new Image();

                    img.onload = function () {
                        this.onload = this.onerror = null;

                        F.coming.width = this.width / F.opts.pixelRatio;
                        F.coming.height = this.height / F.opts.pixelRatio;

                        F._afterLoad();
                    };

                    img.onerror = function () {
                        this.onload = this.onerror = null;

                        F._error('image');
                    };

                    img.src = F.coming.href;

                    if (img.complete !== true) {
                        F.showLoading();
                    }
                },
                _loadAjax: function () {
                    var coming = F.coming;

                    F.showLoading();

                    F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
                        url: coming.href,
                        error: function (jqXHR, textStatus) {
                            if (F.coming && textStatus !== 'abort') {
                                F._error('ajax', jqXHR);

                            } else {
                                F.hideLoading();
                            }
                        },
                        success: function (data, textStatus) {
                            if (textStatus === 'success') {
                                coming.content = data;

                                F._afterLoad();
                            }
                        }
                    }));
                },
                _loadIframe: function () {
                    var coming = F.coming,
                            iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
                            .attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
                            .attr('src', coming.href);

                    // This helps IE
                    $(coming.wrap).bind('onReset', function () {
                        try {
                            $(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
                        } catch (e) {
                        }
                    });

                    if (coming.iframe.preload) {
                        F.showLoading();

                        iframe.one('load', function () {
                            $(this).data('ready', 1);

                            // iOS will lose scrolling if we resize
                            if (!isTouch) {
                                $(this).bind('load.fb', F.update);
                            }

                            // Without this trick:
                            //   - iframe won't scroll on iOS devices
                            //   - IE7 sometimes displays empty iframe
                            $(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

                            F._afterLoad();
                        });
                    }

                    coming.content = iframe.appendTo(coming.inner);

                    if (!coming.iframe.preload) {
                        F._afterLoad();
                    }
                },
                _preloadImages: function () {
                    var group = F.group,
                            current = F.current,
                            len = group.length,
                            cnt = current.preload ? Math.min(current.preload, len - 1) : 0,
                            item,
                            i;

                    for (i = 1; i <= cnt; i += 1) {
                        item = group[ (current.index + i) % len ];

                        if (item.type === 'image' && item.href) {
                            new Image().src = item.href;
                        }
                    }
                },
                _afterLoad: function () {
                    var coming = F.coming,
                            previous = F.current,
                            placeholder = 'fancybox-placeholder',
                            current,
                            content,
                            type,
                            scrolling,
                            href,
                            embed;

                    F.hideLoading();

                    if (!coming || F.isActive === false) {
                        return;
                    }

                    if (false === F.trigger('afterLoad', coming, previous)) {
                        coming.wrap.stop(true).trigger('onReset').remove();

                        F.coming = null;

                        return;
                    }

                    if (previous) {
                        F.trigger('beforeChange', previous);

                        previous.wrap.stop(true).removeClass('fancybox-opened')
                                .find('.fancybox-item, .fancybox-nav')
                                .remove();
                    }

                    F.unbindEvents();

                    current = coming;
                    content = coming.content;
                    type = coming.type;
                    scrolling = coming.scrolling;

                    $.extend(F, {
                        wrap: current.wrap,
                        skin: current.skin,
                        outer: current.outer,
                        inner: current.inner,
                        current: current,
                        previous: previous
                    });

                    href = current.href;

                    switch (type) {
                        case 'inline':
                        case 'ajax':
                        case 'html':
                            if (current.selector) {
                                content = $('<div>').html(content).find(current.selector);

                            } else if (isQuery(content)) {
                                if (!content.data(placeholder)) {
                                    content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter(content).hide());
                                }

                                content = content.show().detach();

                                current.wrap.bind('onReset', function () {
                                    if ($(this).find(content).length) {
                                        content.hide().replaceAll(content.data(placeholder)).data(placeholder, false);
                                    }
                                });
                            }
                            break;

                        case 'image':
                            content = current.tpl.image.replace(/\{href\}/g, href);
                            break;

                        case 'swf':
                            content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
                            embed = '';

                            $.each(current.swf, function (name, val) {
                                content += '<param name="' + name + '" value="' + val + '"></param>';
                                embed += ' ' + name + '="' + val + '"';
                            });

                            content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
                            break;
                    }

                    if (!(isQuery(content) && content.parent().is(current.inner))) {
                        current.inner.append(content);
                    }

                    // Give a chance for helpers or callbacks to update elements
                    F.trigger('beforeShow');

                    // Set scrolling before calculating dimensions
                    current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

                    // Set initial dimensions and start position
                    F._setDimension();

                    F.reposition();

                    F.isOpen = false;
                    F.coming = null;

                    F.bindEvents();

                    if (!F.isOpened) {
                        $('.fancybox-wrap').not(current.wrap).stop(true).trigger('onReset').remove();

                    } else if (previous.prevMethod) {
                        F.transitions[ previous.prevMethod ]();
                    }

                    F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

                    F._preloadImages();
                },
                _setDimension: function () {
                    var viewport = F.getViewport(),
                            steps = 0,
                            canShrink = false,
                            canExpand = false,
                            wrap = F.wrap,
                            skin = F.skin,
                            inner = F.inner,
                            current = F.current,
                            width = current.width,
                            height = current.height,
                            minWidth = current.minWidth,
                            minHeight = current.minHeight,
                            maxWidth = current.maxWidth,
                            maxHeight = current.maxHeight,
                            scrolling = current.scrolling,
                            scrollOut = current.scrollOutside ? current.scrollbarWidth : 0,
                            margin = current.margin,
                            wMargin = getScalar(margin[1] + margin[3]),
                            hMargin = getScalar(margin[0] + margin[2]),
                            wPadding,
                            hPadding,
                            wSpace,
                            hSpace,
                            origWidth,
                            origHeight,
                            origMaxWidth,
                            origMaxHeight,
                            ratio,
                            width_,
                            height_,
                            maxWidth_,
                            maxHeight_,
                            iframe,
                            body;

                    // Reset dimensions so we could re-check actual size
                    wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

                    wPadding = getScalar(skin.outerWidth(true) - skin.width());
                    hPadding = getScalar(skin.outerHeight(true) - skin.height());

                    // Any space between content and viewport (margin, padding, border, title)
                    wSpace = wMargin + wPadding;
                    hSpace = hMargin + hPadding;

                    origWidth = isPercentage(width) ? (viewport.w - wSpace) * getScalar(width) / 100 : width;
                    origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

                    if (current.type === 'iframe') {
                        iframe = current.content;

                        if (current.autoHeight && iframe.data('ready') === 1) {
                            try {
                                if (iframe[0].contentWindow.document.location) {
                                    inner.width(origWidth).height(9999);

                                    body = iframe.contents().find('body');

                                    if (scrollOut) {
                                        body.css('overflow-x', 'hidden');
                                    }

                                    origHeight = body.outerHeight(true);
                                }

                            } catch (e) {
                            }
                        }

                    } else if (current.autoWidth || current.autoHeight) {
                        inner.addClass('fancybox-tmp');

                        // Set width or height in case we need to calculate only one dimension
                        if (!current.autoWidth) {
                            inner.width(origWidth);
                        }

                        if (!current.autoHeight) {
                            inner.height(origHeight);
                        }

                        if (current.autoWidth) {
                            origWidth = inner.width();
                        }

                        if (current.autoHeight) {
                            origHeight = inner.height();
                        }

                        inner.removeClass('fancybox-tmp');
                    }

                    width = getScalar(origWidth);
                    height = getScalar(origHeight);

                    ratio = origWidth / origHeight;

                    // Calculations for the content
                    minWidth = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
                    maxWidth = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

                    minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
                    maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

                    // These will be used to determine if wrap can fit in the viewport
                    origMaxWidth = maxWidth;
                    origMaxHeight = maxHeight;

                    if (current.fitToView) {
                        maxWidth = Math.min(viewport.w - wSpace, maxWidth);
                        maxHeight = Math.min(viewport.h - hSpace, maxHeight);
                    }

                    maxWidth_ = viewport.w - wMargin;
                    maxHeight_ = viewport.h - hMargin;

                    if (current.aspectRatio) {
                        if (width > maxWidth) {
                            width = maxWidth;
                            height = getScalar(width / ratio);
                        }

                        if (height > maxHeight) {
                            height = maxHeight;
                            width = getScalar(height * ratio);
                        }

                        if (width < minWidth) {
                            width = minWidth;
                            height = getScalar(width / ratio);
                        }

                        if (height < minHeight) {
                            height = minHeight;
                            width = getScalar(height * ratio);
                        }

                    } else {
                        width = Math.max(minWidth, Math.min(width, maxWidth));

                        if (current.autoHeight && current.type !== 'iframe') {
                            inner.width(width);

                            height = inner.height();
                        }

                        height = Math.max(minHeight, Math.min(height, maxHeight));
                    }

                    // Try to fit inside viewport (including the title)
                    if (current.fitToView) {
                        inner.width(width).height(height);

                        wrap.width(width + wPadding);

                        // Real wrap dimensions
                        width_ = wrap.width();
                        height_ = wrap.height();

                        if (current.aspectRatio) {
                            while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
                                if (steps++ > 19) {
                                    break;
                                }

                                height = Math.max(minHeight, Math.min(maxHeight, height - 10));
                                width = getScalar(height * ratio);

                                if (width < minWidth) {
                                    width = minWidth;
                                    height = getScalar(width / ratio);
                                }

                                if (width > maxWidth) {
                                    width = maxWidth;
                                    height = getScalar(width / ratio);
                                }

                                inner.width(width).height(height);

                                wrap.width(width + wPadding);

                                width_ = wrap.width();
                                height_ = wrap.height();
                            }

                        } else {
                            width = Math.max(minWidth, Math.min(width, width - (width_ - maxWidth_)));
                            height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
                        }
                    }

                    if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
                        width += scrollOut;
                    }

                    inner.width(width).height(height);

                    wrap.width(width + wPadding);

                    width_ = wrap.width();
                    height_ = wrap.height();

                    canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
                    canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

                    $.extend(current, {
                        dim: {
                            width: getValue(width_),
                            height: getValue(height_)
                        },
                        origWidth: origWidth,
                        origHeight: origHeight,
                        canShrink: canShrink,
                        canExpand: canExpand,
                        wPadding: wPadding,
                        hPadding: hPadding,
                        wrapSpace: height_ - skin.outerHeight(true),
                        skinSpace: skin.height() - height
                    });

                    if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
                        inner.height('auto');
                    }
                },
                _getPosition: function (onlyAbsolute) {
                    var current = F.current,
                            viewport = F.getViewport(),
                            margin = current.margin,
                            width = F.wrap.width() + margin[1] + margin[3],
                            height = F.wrap.height() + margin[0] + margin[2],
                            rez = {
                                position: 'absolute',
                                top: margin[0],
                                left: margin[3]
                            };

                    if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
                        rez.position = 'fixed';

                    } else if (!current.locked) {
                        rez.top += viewport.y;
                        rez.left += viewport.x;
                    }

                    rez.top = getValue(Math.max(rez.top, rez.top + ((viewport.h - height) * current.topRatio)));
                    rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width) * current.leftRatio)));

                    return rez;
                },
                _afterZoomIn: function () {
                    var current = F.current;

                    if (!current) {
                        return;
                    }

                    F.isOpen = F.isOpened = true;

                    F.wrap.css('overflow', 'visible').addClass('fancybox-opened').hide().show(0);

                    F.update();

                    // Assign a click event
                    if (current.closeClick || (current.nextClick && F.group.length > 1)) {
                        F.inner.css('cursor', 'pointer').bind('click.fb', function (e) {
                            if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
                                e.preventDefault();

                                F[ current.closeClick ? 'close' : 'next' ]();
                            }
                        });
                    }

                    // Create a close button
                    if (current.closeBtn) {
                        $(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function (e) {
                            e.preventDefault();

                            F.close();
                        });
                    }

                    // Create navigation arrows
                    if (current.arrows && F.group.length > 1) {
                        if (current.loop || current.index > 0) {
                            $(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
                        }

                        if (current.loop || current.index < F.group.length - 1) {
                            $(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
                        }
                    }

                    F.trigger('afterShow');

                    // Stop the slideshow if this is the last item
                    if (!current.loop && current.index === current.group.length - 1) {

                        F.play(false);

                    } else if (F.opts.autoPlay && !F.player.isActive) {
                        F.opts.autoPlay = false;

                        F.play(true);
                    }
                },
                _afterZoomOut: function (obj) {
                    obj = obj || F.current;

                    $('.fancybox-wrap').trigger('onReset').remove();

                    $.extend(F, {
                        group: {},
                        opts: {},
                        router: false,
                        current: null,
                        isActive: false,
                        isOpened: false,
                        isOpen: false,
                        isClosing: false,
                        wrap: null,
                        skin: null,
                        outer: null,
                        inner: null
                    });

                    F.trigger('afterClose', obj);
                }
            });

            /*
             *	Default transitions
             */

            F.transitions = {
                getOrigPosition: function () {
                    var current = F.current,
                            element = current.element,
                            orig = current.orig,
                            pos = {},
                            width = 50,
                            height = 50,
                            hPadding = current.hPadding,
                            wPadding = current.wPadding,
                            viewport = F.getViewport();

                    if (!orig && current.isDom && element.is(':visible')) {
                        orig = element.find('img:first');

                        if (!orig.length) {
                            orig = element;
                        }
                    }

                    if (isQuery(orig)) {
                        pos = orig.offset();

                        if (orig.is('img')) {
                            width = orig.outerWidth();
                            height = orig.outerHeight();
                        }

                    } else {
                        pos.top = viewport.y + (viewport.h - height) * current.topRatio;
                        pos.left = viewport.x + (viewport.w - width) * current.leftRatio;
                    }

                    if (F.wrap.css('position') === 'fixed' || current.locked) {
                        pos.top -= viewport.y;
                        pos.left -= viewport.x;
                    }

                    pos = {
                        top: getValue(pos.top - hPadding * current.topRatio),
                        left: getValue(pos.left - wPadding * current.leftRatio),
                        width: getValue(width + wPadding),
                        height: getValue(height + hPadding)
                    };

                    return pos;
                },
                step: function (now, fx) {
                    var ratio,
                            padding,
                            value,
                            prop = fx.prop,
                            current = F.current,
                            wrapSpace = current.wrapSpace,
                            skinSpace = current.skinSpace;

                    if (prop === 'width' || prop === 'height') {
                        ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

                        if (F.isClosing) {
                            ratio = 1 - ratio;
                        }

                        padding = prop === 'width' ? current.wPadding : current.hPadding;
                        value = now - padding;

                        F.skin[ prop ](getScalar(prop === 'width' ? value : value - (wrapSpace * ratio)));
                        F.inner[ prop ](getScalar(prop === 'width' ? value : value - (wrapSpace * ratio) - (skinSpace * ratio)));
                    }
                },
                zoomIn: function () {
                    var current = F.current,
                            startPos = current.pos,
                            effect = current.openEffect,
                            elastic = effect === 'elastic',
                            endPos = $.extend({opacity: 1}, startPos);

                    // Remove "position" property that breaks older IE
                    delete endPos.position;

                    if (elastic) {
                        startPos = this.getOrigPosition();

                        if (current.openOpacity) {
                            startPos.opacity = 0.1;
                        }

                    } else if (effect === 'fade') {
                        startPos.opacity = 0.1;
                    }

                    F.wrap.css(startPos).animate(endPos, {
                        duration: effect === 'none' ? 0 : current.openSpeed,
                        easing: current.openEasing,
                        step: elastic ? this.step : null,
                        complete: F._afterZoomIn
                    });
                },
                zoomOut: function () {
                    var current = F.current,
                            effect = current.closeEffect,
                            elastic = effect === 'elastic',
                            endPos = {opacity: 0.1};

                    if (elastic) {
                        endPos = this.getOrigPosition();

                        if (current.closeOpacity) {
                            endPos.opacity = 0.1;
                        }
                    }

                    F.wrap.animate(endPos, {
                        duration: effect === 'none' ? 0 : current.closeSpeed,
                        easing: current.closeEasing,
                        step: elastic ? this.step : null,
                        complete: F._afterZoomOut
                    });
                },
                changeIn: function () {
                    var current = F.current,
                            effect = current.nextEffect,
                            startPos = current.pos,
                            endPos = {opacity: 1},
                    direction = F.direction,
                            distance = 200,
                            field;

                    startPos.opacity = 0.1;

                    if (effect === 'elastic') {
                        field = direction === 'down' || direction === 'up' ? 'top' : 'left';

                        if (direction === 'down' || direction === 'right') {
                            startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
                            endPos[ field ] = '+=' + distance + 'px';

                        } else {
                            startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
                            endPos[ field ] = '-=' + distance + 'px';
                        }
                    }

                    // Workaround for http://bugs.jquery.com/ticket/12273
                    if (effect === 'none') {
                        F._afterZoomIn();

                    } else {
                        F.wrap.css(startPos).animate(endPos, {
                            duration: current.nextSpeed,
                            easing: current.nextEasing,
                            complete: F._afterZoomIn
                        });
                    }
                },
                changeOut: function () {
                    var previous = F.previous,
                            effect = previous.prevEffect,
                            endPos = {opacity: 0.1},
                    direction = F.direction,
                            distance = 200;

                    if (effect === 'elastic') {
                        endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = (direction === 'up' || direction === 'left' ? '-' : '+') + '=' + distance + 'px';
                    }

                    previous.wrap.animate(endPos, {
                        duration: effect === 'none' ? 0 : previous.prevSpeed,
                        easing: previous.prevEasing,
                        complete: function () {
                            $(this).trigger('onReset').remove();
                        }
                    });
                }
            };

            /*
             *	Overlay helper
             */

            F.helpers.overlay = {
                defaults: {
                    closeClick: true, // if true, fancyBox will be closed when user clicks on the overlay
                    speedOut: 200, // duration of fadeOut animation
                    showEarly: true, // indicates if should be opened immediately or wait until the content is ready
                    css: {}, // custom CSS properties
                    locked: !isTouch, // if true, the content will be locked into overlay
                    fixed: true       // if false, the overlay CSS position property will not be set to "fixed"
                },
                overlay: null, // current handle
                fixed: false, // indicates if the overlay has position "fixed"
                el: $('html'), // element that contains "the lock"

                // Public methods
                create: function (opts) {
                    var parent;

                    opts = $.extend({}, this.defaults, opts);

                    if (this.overlay) {
                        this.close();
                    }

                    parent = F.coming ? F.coming.parent : opts.parent;

                    this.overlay = $('<div class="fancybox-overlay"></div>').appendTo(parent && parent.length ? parent : 'body');
                    this.fixed = false;

                    if (opts.fixed && F.defaults.fixed) {
                        this.overlay.addClass('fancybox-overlay-fixed');

                        this.fixed = true;
                    }
                },
                open: function (opts) {
                    var that = this;

                    opts = $.extend({}, this.defaults, opts);

                    if (this.overlay) {
                        this.overlay.unbind('.overlay').width('auto').height('auto');

                    } else {
                        this.create(opts);
                    }

                    if (!this.fixed) {
                        W.bind('resize.overlay', $.proxy(this.update, this));

                        this.update();
                    }

                    if (opts.closeClick) {
                        this.overlay.bind('click.overlay', function (e) {
                            if ($(e.target).hasClass('fancybox-overlay')) {
                                if (F.isActive) {
                                    F.close();
                                } else {
                                    that.close();
                                }

                                return false;
                            }
                        });
                    }

                    this.overlay.css(opts.css).show();
                },
                close: function () {
                    W.unbind('resize.overlay');

                    if (this.el.hasClass('fancybox-lock')) {
                        $('.fancybox-margin').removeClass('fancybox-margin');

                        this.el.removeClass('fancybox-lock');

                        W.scrollTop(this.scrollV).scrollLeft(this.scrollH);
                    }

                    $('.fancybox-overlay').remove().hide();

                    $.extend(this, {
                        overlay: null,
                        fixed: false
                    });
                },
                // Private, callbacks

                update: function () {
                    var width = '100%', offsetWidth;

                    // Reset width/height so it will not mess
                    this.overlay.width(width).height('100%');

                    // jQuery does not return reliable result for IE
                    if (IE) {
                        offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

                        if (D.width() > offsetWidth) {
                            width = D.width();
                        }

                    } else if (D.width() > W.width()) {
                        width = D.width();
                    }

                    this.overlay.width(width).height(D.height());
                },
                // This is where we can manipulate DOM, because later it would cause iframes to reload
                onReady: function (opts, obj) {
                    var overlay = this.overlay;

                    $('.fancybox-overlay').stop(true, true);

                    if (!overlay) {
                        this.create(opts);
                    }

                    if (opts.locked && this.fixed && obj.fixed) {
                        obj.locked = this.overlay.append(obj.wrap);
                        obj.fixed = false;
                    }

                    if (opts.showEarly === true) {
                        this.beforeShow.apply(this, arguments);
                    }
                },
                beforeShow: function (opts, obj) {
                    if (obj.locked && !this.el.hasClass('fancybox-lock')) {
                        if (this.fixPosition !== false) {
                            $('*').filter(function () {
                                return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && !$(this).hasClass("fancybox-wrap"));
                            }).addClass('fancybox-margin');
                        }

                        this.el.addClass('fancybox-margin');

                        this.scrollV = W.scrollTop();
                        this.scrollH = W.scrollLeft();

                        this.el.addClass('fancybox-lock');

                        W.scrollTop(this.scrollV).scrollLeft(this.scrollH);
                    }

                    this.open(opts);
                },
                onUpdate: function () {
                    if (!this.fixed) {
                        this.update();
                    }
                },
                afterClose: function (opts) {
                    // Remove overlay if exists and fancyBox is not opening
                    // (e.g., it is not being open using afterClose callback)
                    if (this.overlay && !F.coming) {
                        this.overlay.fadeOut(opts.speedOut, $.proxy(this.close, this));
                    }
                }
            };

            /*
             *	Title helper
             */

            F.helpers.title = {
                defaults: {
                    type: 'float', // 'float', 'inside', 'outside' or 'over',
                    position: 'bottom' // 'top' or 'bottom'
                },
                beforeShow: function (opts) {
                    var current = F.current,
                            text = current.title,
                            type = opts.type,
                            title,
                            target;

                    if ($.isFunction(text)) {
                        text = text.call(current.element, current);
                    }

                    if (!isString(text) || $.trim(text) === '') {
                        return;
                    }

                    title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

                    switch (type) {
                        case 'inside':
                            target = F.skin;
                            break;

                        case 'outside':
                            target = F.wrap;
                            break;

                        case 'over':
                            target = F.inner;
                            break;

                        default: // 'float'
                            target = F.skin;

                            title.appendTo('body');

                            if (IE) {
                                title.width(title.width());
                            }

                            title.wrapInner('<span class="child"></span>');

                            //Increase bottom margin so this title will also fit into viewport
                            F.current.margin[2] += Math.abs(getScalar(title.css('margin-bottom')));
                            break;
                    }

                    title[ (opts.position === 'top' ? 'prependTo' : 'appendTo') ](target);
                }
            };

            // jQuery plugin initialization
            $.fn.fancybox = function (options) {
                var index,
                        that = $(this),
                        selector = this.selector || '',
                        run = function (e) {
                            var what = $(this).blur(), idx = index, relType, relVal;

                            if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
                                relType = options.groupAttr || 'data-fancybox-group';
                                relVal = what.attr(relType);

                                if (!relVal) {
                                    relType = 'rel';
                                    relVal = what.get(0)[ relType ];
                                }

                                if (relVal && relVal !== '' && relVal !== 'nofollow') {
                                    what = selector.length ? $(selector) : that;
                                    what = what.filter('[' + relType + '="' + relVal + '"]');
                                    idx = what.index(this);
                                }

                                options.index = idx;

                                // Stop an event from bubbling if everything is fine
                                if (F.open(what, options) !== false) {
                                    e.preventDefault();
                                }
                            }
                        };

                options = options || {};
                index = options.index || 0;

                if (!selector || options.live === false) {
                    that.unbind('click.fb-start').bind('click.fb-start', run);

                } else {
                    D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
                }

                this.filter('[data-fancybox-start=1]').trigger('click');

                return this;
            };

            // Tests that need a body at doc ready
            D.ready(function () {
                var w1, w2;

                if ($.scrollbarWidth === undefined) {
                    // http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
                    $.scrollbarWidth = function () {
                        var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
                                child = parent.children(),
                                width = child.innerWidth() - child.height(99).innerWidth();

                        parent.remove();

                        return width;
                    };
                }

                if ($.support.fixedPosition === undefined) {
                    $.support.fixedPosition = (function () {
                        var elem = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
                                fixed = (elem[0].offsetTop === 20 || elem[0].offsetTop === 15);

                        elem.remove();

                        return fixed;
                    }());
                }

                $.extend(F.defaults, {
                    scrollbarWidth: $.scrollbarWidth(),
                    fixed: $.support.fixedPosition,
                    parent: $('body')
                });

                //Get real width of page scroll-bar
                w1 = $(window).width();

                H.addClass('fancybox-lock-test');

                w2 = $(window).width();

                H.removeClass('fancybox-lock-test');

                $("<style type='text/css'>.fancybox-margin{margin-right:" + (w2 - w1) + "px;}</style>").appendTo("head");
            });

        }(window, document, jQuery));

        /*owl slider*/
        !function (a, b, c, d) {
            function e(b, c) {
                this.settings = null, this.options = a.extend({}, e.Defaults, c), this.$element = a(b), this.drag = a.extend({}, m), this.state = a.extend({}, n), this.e = a.extend({}, o), this._plugins = {}, this._supress = {}, this._current = null, this._speed = null, this._coordinates = [], this._breakpoint = null, this._width = null, this._items = [], this._clones = [], this._mergers = [], this._invalidated = {}, this._pipe = [], a.each(e.Plugins, a.proxy(function (a, b) {
                    this._plugins[a[0].toLowerCase() + a.slice(1)] = new b(this)
                }, this)), a.each(e.Pipe, a.proxy(function (b, c) {
                    this._pipe.push({filter: c.filter, run: a.proxy(c.run, this)})
                }, this)), this.setup(), this.initialize()
            }
            function f(a) {
                if (a.touches !== d)
                    return{x: a.touches[0].pageX, y: a.touches[0].pageY};
                if (a.touches === d) {
                    if (a.pageX !== d)
                        return{x: a.pageX, y: a.pageY};
                    if (a.pageX === d)
                        return{x: a.clientX, y: a.clientY}
                }
            }
            function g(a) {
                var b, d, e = c.createElement("div"), f = a;
                for (b in f)
                    if (d = f[b], "undefined" != typeof e.style[d])
                        return e = null, [d, b];
                return[!1]
            }
            function h() {
                return g(["transition", "WebkitTransition", "MozTransition", "OTransition"])[1]
            }
            function i() {
                return g(["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])[0]
            }
            function j() {
                return g(["perspective", "webkitPerspective", "MozPerspective", "OPerspective", "MsPerspective"])[0]
            }
            function k() {
                return"ontouchstart"in b || !!navigator.msMaxTouchPoints
            }
            function l() {
                return b.navigator.msPointerEnabled
            }
            var m, n, o;
            m = {start: 0, startX: 0, startY: 0, current: 0, currentX: 0, currentY: 0, offsetX: 0, offsetY: 0, distance: null, startTime: 0, endTime: 0, updatedX: 0, targetEl: null}, n = {isTouch: !1, isScrolling: !1, isSwiping: !1, direction: !1, inMotion: !1}, o = {_onDragStart: null, _onDragMove: null, _onDragEnd: null, _transitionEnd: null, _resizer: null, _responsiveCall: null, _goToLoop: null, _checkVisibile: null}, e.Defaults = {items: 3, loop: !1, center: !1, mouseDrag: !0, touchDrag: !0, pullDrag: !0, freeDrag: !1, margin: 0, stagePadding: 0, merge: !1, mergeFit: !0, autoWidth: !1, startPosition: 0, rtl: !1, smartSpeed: 250, fluidSpeed: !1, dragEndSpeed: !1, responsive: {}, responsiveRefreshRate: 200, responsiveBaseElement: b, responsiveClass: !1, fallbackEasing: "swing", info: !1, nestedItemSelector: !1, itemElement: "div", stageElement: "div", themeClass: "owl-theme", baseClass: "owl-carousel", itemClass: "owl-item", centerClass: "center", activeClass: "active"}, e.Width = {Default: "default", Inner: "inner", Outer: "outer"}, e.Plugins = {}, e.Pipe = [{filter: ["width", "items", "settings"], run: function (a) {
                        a.current = this._items && this._items[this.relative(this._current)]
                    }}, {filter: ["items", "settings"], run: function () {
                        var a = this._clones, b = this.$stage.children(".cloned");
                        (b.length !== a.length || !this.settings.loop && a.length > 0) && (this.$stage.children(".cloned").remove(), this._clones = [])
                    }}, {filter: ["items", "settings"], run: function () {
                        var a, b, c = this._clones, d = this._items, e = this.settings.loop ? c.length - Math.max(2 * this.settings.items, 4) : 0;
                        for (a = 0, b = Math.abs(e / 2); b > a; a++)
                            e > 0 ? (this.$stage.children().eq(d.length + c.length - 1).remove(), c.pop(), this.$stage.children().eq(0).remove(), c.pop()) : (c.push(c.length / 2), this.$stage.append(d[c[c.length - 1]].clone().addClass("cloned")), c.push(d.length - 1 - (c.length - 1) / 2), this.$stage.prepend(d[c[c.length - 1]].clone().addClass("cloned")))
                    }}, {filter: ["width", "items", "settings"], run: function () {
                        var a, b, c, d = this.settings.rtl ? 1 : -1, e = (this.width() / this.settings.items).toFixed(3), f = 0;
                        for (this._coordinates = [], b = 0, c = this._clones.length + this._items.length; c > b; b++)
                            a = this._mergers[this.relative(b)], a = this.settings.mergeFit && Math.min(a, this.settings.items) || a, f += (this.settings.autoWidth ? this._items[this.relative(b)].width() + this.settings.margin : e * a) * d, this._coordinates.push(f)
                    }}, {filter: ["width", "items", "settings"], run: function () {
                        var b, c, d = (this.width() / this.settings.items).toFixed(3), e = {width: Math.abs(this._coordinates[this._coordinates.length - 1]) + 2 * this.settings.stagePadding, "padding-left": this.settings.stagePadding || "", "padding-right": this.settings.stagePadding || ""};
                        if (this.$stage.css(e), e = {width: this.settings.autoWidth ? "auto" : d - this.settings.margin}, e[this.settings.rtl ? "margin-left" : "margin-right"] = this.settings.margin, !this.settings.autoWidth && a.grep(this._mergers, function (a) {
                            return a > 1
                        }).length > 0)
                            for (b = 0, c = this._coordinates.length; c > b; b++)
                                e.width = Math.abs(this._coordinates[b]) - Math.abs(this._coordinates[b - 1] || 0) - this.settings.margin, this.$stage.children().eq(b).css(e);
                        else
                            this.$stage.children().css(e)
                    }}, {filter: ["width", "items", "settings"], run: function (a) {
                        a.current && this.reset(this.$stage.children().index(a.current))
                    }}, {filter: ["position"], run: function () {
                        this.animate(this.coordinates(this._current))
                    }}, {filter: ["width", "position", "items", "settings"], run: function () {
                        var a, b, c, d, e = this.settings.rtl ? 1 : -1, f = 2 * this.settings.stagePadding, g = this.coordinates(this.current()) + f, h = g + this.width() * e, i = [];
                        for (c = 0, d = this._coordinates.length; d > c; c++)
                            a = this._coordinates[c - 1] || 0, b = Math.abs(this._coordinates[c]) + f * e, (this.op(a, "<=", g) && this.op(a, ">", h) || this.op(b, "<", g) && this.op(b, ">", h)) && i.push(c);
                        this.$stage.children("." + this.settings.activeClass).removeClass(this.settings.activeClass), this.$stage.children(":eq(" + i.join("), :eq(") + ")").addClass(this.settings.activeClass), this.settings.center && (this.$stage.children("." + this.settings.centerClass).removeClass(this.settings.centerClass), this.$stage.children().eq(this.current()).addClass(this.settings.centerClass))
                    }}], e.prototype.initialize = function () {
                if (this.trigger("initialize"), this.$element.addClass(this.settings.baseClass).addClass(this.settings.themeClass).toggleClass("owl-rtl", this.settings.rtl), this.browserSupport(), this.settings.autoWidth && this.state.imagesLoaded !== !0) {
                    var b, c, e;
                    if (b = this.$element.find("img"), c = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : d, e = this.$element.children(c).width(), b.length && 0 >= e)
                        return this.preloadAutoWidthImages(b), !1
                }
                this.$element.addClass("owl-loading"), this.$stage = a("<" + this.settings.stageElement + ' class="owl-stage"/>').wrap('<div class="owl-stage-outer">'), this.$element.append(this.$stage.parent()), this.replace(this.$element.children().not(this.$stage.parent())), this._width = this.$element.width(), this.refresh(), this.$element.removeClass("owl-loading").addClass("owl-loaded"), this.eventsCall(), this.internalEvents(), this.addTriggerableEvents(), this.trigger("initialized")
            }, e.prototype.setup = function () {
                var b = this.viewport(), c = this.options.responsive, d = -1, e = null;
                c ? (a.each(c, function (a) {
                    b >= a && a > d && (d = Number(a))
                }), e = a.extend({}, this.options, c[d]), delete e.responsive, e.responsiveClass && this.$element.attr("class", function (a, b) {
                    return b.replace(/\b owl-responsive-\S+/g, "")
                }).addClass("owl-responsive-" + d)) : e = a.extend({}, this.options), (null === this.settings || this._breakpoint !== d) && (this.trigger("change", {property: {name: "settings", value: e}}), this._breakpoint = d, this.settings = e, this.invalidate("settings"), this.trigger("changed", {property: {name: "settings", value: this.settings}}))
            }, e.prototype.optionsLogic = function () {
                this.$element.toggleClass("owl-center", this.settings.center), this.settings.loop && this._items.length < this.settings.items && (this.settings.loop = !1), this.settings.autoWidth && (this.settings.stagePadding = !1, this.settings.merge = !1)
            }, e.prototype.prepare = function (b) {
                var c = this.trigger("prepare", {content: b});
                return c.data || (c.data = a("<" + this.settings.itemElement + "/>").addClass(this.settings.itemClass).append(b)), this.trigger("prepared", {content: c.data}), c.data
            }, e.prototype.update = function () {
                for (var b = 0, c = this._pipe.length, d = a.proxy(function (a) {
                    return this[a]
                }, this._invalidated), e = {}; c > b; )
                    (this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) && this._pipe[b].run(e), b++;
                this._invalidated = {}
            }, e.prototype.width = function (a) {
                switch (a = a || e.Width.Default) {
                    case e.Width.Inner:
                    case e.Width.Outer:
                        return this._width;
                    default:
                        return this._width - 2 * this.settings.stagePadding + this.settings.margin
                }
            }, e.prototype.refresh = function () {
                if (0 === this._items.length)
                    return!1;
                (new Date).getTime();
                this.trigger("refresh"), this.setup(), this.optionsLogic(), this.$stage.addClass("owl-refresh"), this.update(), this.$stage.removeClass("owl-refresh"), this.state.orientation = b.orientation, this.watchVisibility(), this.trigger("refreshed")
            }, e.prototype.eventsCall = function () {
                this.e._onDragStart = a.proxy(function (a) {
                    this.onDragStart(a)
                }, this), this.e._onDragMove = a.proxy(function (a) {
                    this.onDragMove(a)
                }, this), this.e._onDragEnd = a.proxy(function (a) {
                    this.onDragEnd(a)
                }, this), this.e._onResize = a.proxy(function (a) {
                    this.onResize(a)
                }, this), this.e._transitionEnd = a.proxy(function (a) {
                    this.transitionEnd(a)
                }, this), this.e._preventClick = a.proxy(function (a) {
                    this.preventClick(a)
                }, this)
            }, e.prototype.onThrottledResize = function () {
                b.clearTimeout(this.resizeTimer), this.resizeTimer = b.setTimeout(this.e._onResize, this.settings.responsiveRefreshRate)
            }, e.prototype.onResize = function () {
                return this._items.length ? this._width === this.$element.width() ? !1 : this.trigger("resize").isDefaultPrevented() ? !1 : (this._width = this.$element.width(), this.invalidate("width"), this.refresh(), void this.trigger("resized")) : !1
            }, e.prototype.eventsRouter = function (a) {
                var b = a.type;
                "mousedown" === b || "touchstart" === b ? this.onDragStart(a) : "mousemove" === b || "touchmove" === b ? this.onDragMove(a) : "mouseup" === b || "touchend" === b ? this.onDragEnd(a) : "touchcancel" === b && this.onDragEnd(a)
            }, e.prototype.internalEvents = function () {
                var c = (k(), l());
                this.settings.mouseDrag ? (this.$stage.on("mousedown", a.proxy(function (a) {
                    this.eventsRouter(a)
                }, this)), this.$stage.on("dragstart", function () {
                    return!1
                }), this.$stage.get(0).onselectstart = function () {
                    return!1
                }) : this.$element.addClass("owl-text-select-on"), this.settings.touchDrag && !c && this.$stage.on("touchstart touchcancel", a.proxy(function (a) {
                    this.eventsRouter(a)
                }, this)), this.transitionEndVendor && this.on(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd, !1), this.settings.responsive !== !1 && this.on(b, "resize", a.proxy(this.onThrottledResize, this))
            }, e.prototype.onDragStart = function (d) {
                var e, g, h, i;
                if (e = d.originalEvent || d || b.event, 3 === e.which || this.state.isTouch)
                    return!1;
                if ("mousedown" === e.type && this.$stage.addClass("owl-grab"), this.trigger("drag"), this.drag.startTime = (new Date).getTime(), this.speed(0), this.state.isTouch = !0, this.state.isScrolling = !1, this.state.isSwiping = !1, this.drag.distance = 0, g = f(e).x, h = f(e).y, this.drag.offsetX = this.$stage.position().left, this.drag.offsetY = this.$stage.position().top, this.settings.rtl && (this.drag.offsetX = this.$stage.position().left + this.$stage.width() - this.width() + this.settings.margin), this.state.inMotion && this.support3d)
                    i = this.getTransformProperty(), this.drag.offsetX = i, this.animate(i), this.state.inMotion = !0;
                else if (this.state.inMotion && !this.support3d)
                    return this.state.inMotion = !1, !1;
                this.drag.startX = g - this.drag.offsetX, this.drag.startY = h - this.drag.offsetY, this.drag.start = g - this.drag.startX, this.drag.targetEl = e.target || e.srcElement, this.drag.updatedX = this.drag.start, ("IMG" === this.drag.targetEl.tagName || "A" === this.drag.targetEl.tagName) && (this.drag.targetEl.draggable = !1), a(c).on("mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents", a.proxy(function (a) {
                    this.eventsRouter(a)
                }, this))
            }, e.prototype.onDragMove = function (a) {
                var c, e, g, h, i, j;
                this.state.isTouch && (this.state.isScrolling || (c = a.originalEvent || a || b.event, e = f(c).x, g = f(c).y, this.drag.currentX = e - this.drag.startX, this.drag.currentY = g - this.drag.startY, this.drag.distance = this.drag.currentX - this.drag.offsetX, this.drag.distance < 0 ? this.state.direction = this.settings.rtl ? "right" : "left" : this.drag.distance > 0 && (this.state.direction = this.settings.rtl ? "left" : "right"), this.settings.loop ? this.op(this.drag.currentX, ">", this.coordinates(this.minimum())) && "right" === this.state.direction ? this.drag.currentX -= (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length) : this.op(this.drag.currentX, "<", this.coordinates(this.maximum())) && "left" === this.state.direction && (this.drag.currentX += (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length)) : (h = this.coordinates(this.settings.rtl ? this.maximum() : this.minimum()), i = this.coordinates(this.settings.rtl ? this.minimum() : this.maximum()), j = this.settings.pullDrag ? this.drag.distance / 5 : 0, this.drag.currentX = Math.max(Math.min(this.drag.currentX, h + j), i + j)), (this.drag.distance > 8 || this.drag.distance < -8) && (c.preventDefault !== d ? c.preventDefault() : c.returnValue = !1, this.state.isSwiping = !0), this.drag.updatedX = this.drag.currentX, (this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === !1 && (this.state.isScrolling = !0, this.drag.updatedX = this.drag.start), this.animate(this.drag.updatedX)))
            }, e.prototype.onDragEnd = function (b) {
                var d, e, f;
                if (this.state.isTouch) {
                    if ("mouseup" === b.type && this.$stage.removeClass("owl-grab"), this.trigger("dragged"), this.drag.targetEl.removeAttribute("draggable"), this.state.isTouch = !1, this.state.isScrolling = !1, this.state.isSwiping = !1, 0 === this.drag.distance && this.state.inMotion !== !0)
                        return this.state.inMotion = !1, !1;
                    this.drag.endTime = (new Date).getTime(), d = this.drag.endTime - this.drag.startTime, e = Math.abs(this.drag.distance), (e > 3 || d > 300) && this.removeClick(this.drag.targetEl), f = this.closest(this.drag.updatedX), this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed), this.current(f), this.invalidate("position"), this.update(), this.settings.pullDrag || this.drag.updatedX !== this.coordinates(f) || this.transitionEnd(), this.drag.distance = 0, a(c).off(".owl.dragEvents")
                }
            }, e.prototype.removeClick = function (c) {
                this.drag.targetEl = c, a(c).on("click.preventClick", this.e._preventClick), b.setTimeout(function () {
                    a(c).off("click.preventClick")
                }, 300)
            }, e.prototype.preventClick = function (b) {
                b.preventDefault ? b.preventDefault() : b.returnValue = !1, b.stopPropagation && b.stopPropagation(), a(b.target).off("click.preventClick")
            }, e.prototype.getTransformProperty = function () {
                var a, c;
                return a = b.getComputedStyle(this.$stage.get(0), null).getPropertyValue(this.vendorName + "transform"), a = a.replace(/matrix(3d)?\(|\)/g, "").split(","), c = 16 === a.length, c !== !0 ? a[4] : a[12]
            }, e.prototype.closest = function (b) {
                var c = -1, d = 30, e = this.width(), f = this.coordinates();
                return this.settings.freeDrag || a.each(f, a.proxy(function (a, g) {
                    return b > g - d && g + d > b ? c = a : this.op(b, "<", g) && this.op(b, ">", f[a + 1] || g - e) && (c = "left" === this.state.direction ? a + 1 : a), -1 === c
                }, this)), this.settings.loop || (this.op(b, ">", f[this.minimum()]) ? c = b = this.minimum() : this.op(b, "<", f[this.maximum()]) && (c = b = this.maximum())), c
            }, e.prototype.animate = function (b) {
                this.trigger("translate"), this.state.inMotion = this.speed() > 0, this.support3d ? this.$stage.css({transform: "translate3d(" + b + "px,0px, 0px)", transition: this.speed() / 1e3 + "s"}) : this.state.isTouch ? this.$stage.css({left: b + "px"}) : this.$stage.animate({left: b}, this.speed() / 1e3, this.settings.fallbackEasing, a.proxy(function () {
                    this.state.inMotion && this.transitionEnd()
                }, this))
            }, e.prototype.current = function (a) {
                if (a === d)
                    return this._current;
                if (0 === this._items.length)
                    return d;
                if (a = this.normalize(a), this._current !== a) {
                    var b = this.trigger("change", {property: {name: "position", value: a}});
                    b.data !== d && (a = this.normalize(b.data)), this._current = a, this.invalidate("position"), this.trigger("changed", {property: {name: "position", value: this._current}})
                }
                return this._current
            }, e.prototype.invalidate = function (a) {
                this._invalidated[a] = !0
            }, e.prototype.reset = function (a) {
                a = this.normalize(a), a !== d && (this._speed = 0, this._current = a, this.suppress(["translate", "translated"]), this.animate(this.coordinates(a)), this.release(["translate", "translated"]))
            }, e.prototype.normalize = function (b, c) {
                var e = c ? this._items.length : this._items.length + this._clones.length;
                return!a.isNumeric(b) || 1 > e ? d : b = this._clones.length ? (b % e + e) % e : Math.max(this.minimum(c), Math.min(this.maximum(c), b))
            }, e.prototype.relative = function (a) {
                return a = this.normalize(a), a -= this._clones.length / 2, this.normalize(a, !0)
            }, e.prototype.maximum = function (a) {
                var b, c, d, e = 0, f = this.settings;
                if (a)
                    return this._items.length - 1;
                if (!f.loop && f.center)
                    b = this._items.length - 1;
                else if (f.loop || f.center)
                    if (f.loop || f.center)
                        b = this._items.length + f.items;
                    else {
                        if (!f.autoWidth && !f.merge)
                            throw"Can not detect maximum absolute position.";
                        for (revert = f.rtl?1: - 1, c = this.$stage.width() - this.$element.width(); (d = this.coordinates(e)) && !(d * revert >= c); )
                            b = ++e
                    }
                else
                    b = this._items.length - f.items;
                return b
            }, e.prototype.minimum = function (a) {
                return a ? 0 : this._clones.length / 2
            }, e.prototype.items = function (a) {
                return a === d ? this._items.slice() : (a = this.normalize(a, !0), this._items[a])
            }, e.prototype.mergers = function (a) {
                return a === d ? this._mergers.slice() : (a = this.normalize(a, !0), this._mergers[a])
            }, e.prototype.clones = function (b) {
                var c = this._clones.length / 2, e = c + this._items.length, f = function (a) {
                    return a % 2 === 0 ? e + a / 2 : c - (a + 1) / 2
                };
                return b === d ? a.map(this._clones, function (a, b) {
                    return f(b)
                }) : a.map(this._clones, function (a, c) {
                    return a === b ? f(c) : null
                })
            }, e.prototype.speed = function (a) {
                return a !== d && (this._speed = a), this._speed
            }, e.prototype.coordinates = function (b) {
                var c = null;
                return b === d ? a.map(this._coordinates, a.proxy(function (a, b) {
                    return this.coordinates(b)
                }, this)) : (this.settings.center ? (c = this._coordinates[b], c += (this.width() - c + (this._coordinates[b - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1)) : c = this._coordinates[b - 1] || 0, c)
            }, e.prototype.duration = function (a, b, c) {
                return Math.min(Math.max(Math.abs(b - a), 1), 6) * Math.abs(c || this.settings.smartSpeed)
            }, e.prototype.to = function (c, d) {
                if (this.settings.loop) {
                    var e = c - this.relative(this.current()), f = this.current(), g = this.current(), h = this.current() + e, i = 0 > g - h ? !0 : !1, j = this._clones.length + this._items.length;
                    h < this.settings.items && i === !1 ? (f = g + this._items.length, this.reset(f)) : h >= j - this.settings.items && i === !0 && (f = g - this._items.length, this.reset(f)), b.clearTimeout(this.e._goToLoop), this.e._goToLoop = b.setTimeout(a.proxy(function () {
                        this.speed(this.duration(this.current(), f + e, d)), this.current(f + e), this.update()
                    }, this), 30)
                } else
                    this.speed(this.duration(this.current(), c, d)), this.current(c), this.update()
            }, e.prototype.next = function (a) {
                a = a || !1, this.to(this.relative(this.current()) + 1, a)
            }, e.prototype.prev = function (a) {
                a = a || !1, this.to(this.relative(this.current()) - 1, a)
            }, e.prototype.transitionEnd = function (a) {
                return a !== d && (a.stopPropagation(), (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0)) ? !1 : (this.state.inMotion = !1, void this.trigger("translated"))
            }, e.prototype.viewport = function () {
                var d;
                if (this.options.responsiveBaseElement !== b)
                    d = a(this.options.responsiveBaseElement).width();
                else if (b.innerWidth)
                    d = b.innerWidth;
                else {
                    if (!c.documentElement || !c.documentElement.clientWidth)
                        throw"Can not detect viewport width.";
                    d = c.documentElement.clientWidth
                }
                return d
            }, e.prototype.replace = function (b) {
                this.$stage.empty(), this._items = [], b && (b = b instanceof jQuery ? b : a(b)), this.settings.nestedItemSelector && (b = b.find("." + this.settings.nestedItemSelector)), b.filter(function () {
                    return 1 === this.nodeType
                }).each(a.proxy(function (a, b) {
                    b = this.prepare(b), this.$stage.append(b), this._items.push(b), this._mergers.push(1 * b.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)
                }, this)), this.reset(a.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0), this.invalidate("items")
            }, e.prototype.add = function (a, b) {
                b = b === d ? this._items.length : this.normalize(b, !0), this.trigger("add", {content: a, position: b}), 0 === this._items.length || b === this._items.length ? (this.$stage.append(a), this._items.push(a), this._mergers.push(1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)) : (this._items[b].before(a), this._items.splice(b, 0, a), this._mergers.splice(b, 0, 1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)), this.invalidate("items"), this.trigger("added", {content: a, position: b})
            }, e.prototype.remove = function (a) {
                a = this.normalize(a, !0), a !== d && (this.trigger("remove", {content: this._items[a], position: a}), this._items[a].remove(), this._items.splice(a, 1), this._mergers.splice(a, 1), this.invalidate("items"), this.trigger("removed", {content: null, position: a}))
            }, e.prototype.addTriggerableEvents = function () {
                var b = a.proxy(function (b, c) {
                    return a.proxy(function (a) {
                        a.relatedTarget !== this && (this.suppress([c]), b.apply(this, [].slice.call(arguments, 1)), this.release([c]))
                    }, this)
                }, this);
                a.each({next: this.next, prev: this.prev, to: this.to, destroy: this.destroy, refresh: this.refresh, replace: this.replace, add: this.add, remove: this.remove}, a.proxy(function (a, c) {
                    this.$element.on(a + ".owl.carousel", b(c, a + ".owl.carousel"))
                }, this))
            }, e.prototype.watchVisibility = function () {
                function c(a) {
                    return a.offsetWidth > 0 && a.offsetHeight > 0
                }
                function d() {
                    c(this.$element.get(0)) && (this.$element.removeClass("owl-hidden"), this.refresh(), b.clearInterval(this.e._checkVisibile))
                }
                c(this.$element.get(0)) || (this.$element.addClass("owl-hidden"), b.clearInterval(this.e._checkVisibile), this.e._checkVisibile = b.setInterval(a.proxy(d, this), 500))
            }, e.prototype.preloadAutoWidthImages = function (b) {
                var c, d, e, f;
                c = 0, d = this, b.each(function (g, h) {
                    e = a(h), f = new Image, f.onload = function () {
                        c++, e.attr("src", f.src), e.css("opacity", 1), c >= b.length && (d.state.imagesLoaded = !0, d.initialize())
                    }, f.src = e.attr("src") || e.attr("data-src") || e.attr("data-src-retina")
                })
            }, e.prototype.destroy = function () {
                this.$element.hasClass(this.settings.themeClass) && this.$element.removeClass(this.settings.themeClass), this.settings.responsive !== !1 && a(b).off("resize.owl.carousel"), this.transitionEndVendor && this.off(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd);
                for (var d in this._plugins)
                    this._plugins[d].destroy();
                (this.settings.mouseDrag || this.settings.touchDrag) && (this.$stage.off("mousedown touchstart touchcancel"), a(c).off(".owl.dragEvents"), this.$stage.get(0).onselectstart = function () {
                }, this.$stage.off("dragstart", function () {
                    return!1
                })), this.$element.off(".owl"), this.$stage.children(".cloned").remove(), this.e = null, this.$element.removeData("owlCarousel"), this.$stage.children().contents().unwrap(), this.$stage.children().unwrap(), this.$stage.unwrap()
            }, e.prototype.op = function (a, b, c) {
                var d = this.settings.rtl;
                switch (b) {
                    case"<":
                        return d ? a > c : c > a;
                    case">":
                        return d ? c > a : a > c;
                    case">=":
                        return d ? c >= a : a >= c;
                    case"<=":
                        return d ? a >= c : c >= a
                }
            }, e.prototype.on = function (a, b, c, d) {
                a.addEventListener ? a.addEventListener(b, c, d) : a.attachEvent && a.attachEvent("on" + b, c)
            }, e.prototype.off = function (a, b, c, d) {
                a.removeEventListener ? a.removeEventListener(b, c, d) : a.detachEvent && a.detachEvent("on" + b, c)
            }, e.prototype.trigger = function (b, c, d) {
                var e = {item: {count: this._items.length, index: this.current()}}, f = a.camelCase(a.grep(["on", b, d], function (a) {
                    return a
                }).join("-").toLowerCase()), g = a.Event([b, "owl", d || "carousel"].join(".").toLowerCase(), a.extend({relatedTarget: this}, e, c));
                return this._supress[b] || (a.each(this._plugins, function (a, b) {
                    b.onTrigger && b.onTrigger(g)
                }), this.$element.trigger(g), this.settings && "function" == typeof this.settings[f] && this.settings[f].apply(this, g)), g
            }, e.prototype.suppress = function (b) {
                a.each(b, a.proxy(function (a, b) {
                    this._supress[b] = !0
                }, this))
            }, e.prototype.release = function (b) {
                a.each(b, a.proxy(function (a, b) {
                    delete this._supress[b]
                }, this))
            }, e.prototype.browserSupport = function () {
                if (this.support3d = j(), this.support3d) {
                    this.transformVendor = i();
                    var a = ["transitionend", "webkitTransitionEnd", "transitionend", "oTransitionEnd"];
                    this.transitionEndVendor = a[h()], this.vendorName = this.transformVendor.replace(/Transform/i, ""), this.vendorName = "" !== this.vendorName ? "-" + this.vendorName.toLowerCase() + "-" : ""
                }
                this.state.orientation = b.orientation
            }, a.fn.owlCarousel = function (b) {
                return this.each(function () {
                    a(this).data("owlCarousel") || a(this).data("owlCarousel", new e(this, b))
                })
            }, a.fn.owlCarousel.Constructor = e
        }(window.Zepto || window.jQuery, window, document), function (a, b) {
            var c = function (b) {
                this._core = b, this._loaded = [], this._handlers = {"initialized.owl.carousel change.owl.carousel": a.proxy(function (b) {
                        if (b.namespace && this._core.settings && this._core.settings.lazyLoad && (b.property && "position" == b.property.name || "initialized" == b.type))
                            for (var c = this._core.settings, d = c.center && Math.ceil(c.items / 2) || c.items, e = c.center && -1 * d || 0, f = (b.property && b.property.value || this._core.current()) + e, g = this._core.clones().length, h = a.proxy(function (a, b) {
                                this.load(b)
                            }, this); e++ < d; )
                                this.load(g / 2 + this._core.relative(f)), g && a.each(this._core.clones(this._core.relative(f++)), h)
                    }, this)}, this._core.options = a.extend({}, c.Defaults, this._core.options), this._core.$element.on(this._handlers)
            };
            c.Defaults = {lazyLoad: !1}, c.prototype.load = function (c) {
                var d = this._core.$stage.children().eq(c), e = d && d.find(".owl-lazy");
                !e || a.inArray(d.get(0), this._loaded) > -1 || (e.each(a.proxy(function (c, d) {
                    var e, f = a(d), g = b.devicePixelRatio > 1 && f.attr("data-src-retina") || f.attr("data-src");
                    this._core.trigger("load", {element: f, url: g}, "lazy"), f.is("img") ? f.one("load.owl.lazy", a.proxy(function () {
                        f.css("opacity", 1), this._core.trigger("loaded", {element: f, url: g}, "lazy")
                    }, this)).attr("src", g) : (e = new Image, e.onload = a.proxy(function () {
                        f.css({"background-image": "url(" + g + ")", opacity: "1"}), this._core.trigger("loaded", {element: f, url: g}, "lazy")
                    }, this), e.src = g)
                }, this)), this._loaded.push(d.get(0)))
            }, c.prototype.destroy = function () {
                var a, b;
                for (a in this.handlers)
                    this._core.$element.off(a, this.handlers[a]);
                for (b in Object.getOwnPropertyNames(this))
                    "function" != typeof this[b] && (this[b] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.Lazy = c
        }(window.Zepto || window.jQuery, window, document), function (a) {
            var b = function (c) {
                this._core = c, this._handlers = {"initialized.owl.carousel": a.proxy(function () {
                        this._core.settings.autoHeight && this.update()
                    }, this), "changed.owl.carousel": a.proxy(function (a) {
                        this._core.settings.autoHeight && "position" == a.property.name && this.update()
                    }, this), "loaded.owl.lazy": a.proxy(function (a) {
                        this._core.settings.autoHeight && a.element.closest("." + this._core.settings.itemClass) === this._core.$stage.children().eq(this._core.current()) && this.update()
                    }, this)}, this._core.options = a.extend({}, b.Defaults, this._core.options), this._core.$element.on(this._handlers)
            };
            b.Defaults = {autoHeight: !1, autoHeightClass: "owl-height"}, b.prototype.update = function () {
                this._core.$stage.parent().height(this._core.$stage.children().eq(this._core.current()).height()).addClass(this._core.settings.autoHeightClass)
            }, b.prototype.destroy = function () {
                var a, b;
                for (a in this._handlers)
                    this._core.$element.off(a, this._handlers[a]);
                for (b in Object.getOwnPropertyNames(this))
                    "function" != typeof this[b] && (this[b] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.AutoHeight = b
        }(window.Zepto || window.jQuery, window, document), function (a, b, c) {
            var d = function (b) {
                this._core = b, this._videos = {}, this._playing = null, this._fullscreen = !1, this._handlers = {"resize.owl.carousel": a.proxy(function (a) {
                        this._core.settings.video && !this.isInFullScreen() && a.preventDefault()
                    }, this), "refresh.owl.carousel changed.owl.carousel": a.proxy(function () {
                        this._playing && this.stop()
                    }, this), "prepared.owl.carousel": a.proxy(function (b) {
                        var c = a(b.content).find(".owl-video");
                        c.length && (c.css("display", "none"), this.fetch(c, a(b.content)))
                    }, this)}, this._core.options = a.extend({}, d.Defaults, this._core.options), this._core.$element.on(this._handlers), this._core.$element.on("click.owl.video", ".owl-video-play-icon", a.proxy(function (a) {
                    this.play(a)
                }, this))
            };
            d.Defaults = {video: !1, videoHeight: !1, videoWidth: !1}, d.prototype.fetch = function (a, b) {
                var c = a.attr("data-vimeo-id") ? "vimeo" : "youtube", d = a.attr("data-vimeo-id") || a.attr("data-youtube-id"), e = a.attr("data-width") || this._core.settings.videoWidth, f = a.attr("data-height") || this._core.settings.videoHeight, g = a.attr("href");
                if (!g)
                    throw new Error("Missing video URL.");
                if (d = g.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/), d[3].indexOf("youtu") > -1)
                    c = "youtube";
                else {
                    if (!(d[3].indexOf("vimeo") > -1))
                        throw new Error("Video URL not supported.");
                    c = "vimeo"
                }
                d = d[6], this._videos[g] = {type: c, id: d, width: e, height: f}, b.attr("data-video", g), this.thumbnail(a, this._videos[g])
            }, d.prototype.thumbnail = function (b, c) {
                var d, e, f, g = c.width && c.height ? 'style="width:' + c.width + "px;height:" + c.height + 'px;"' : "", h = b.find("img"), i = "src", j = "", k = this._core.settings, l = function (a) {
                    e = '<div class="owl-video-play-icon"></div>', d = k.lazyLoad ? '<div class="owl-video-tn ' + j + '" ' + i + '="' + a + '"></div>' : '<div class="owl-video-tn" style="opacity:1;background-image:url(' + a + ')"></div>', b.after(d), b.after(e)
                };
                return b.wrap('<div class="owl-video-wrapper"' + g + "></div>"), this._core.settings.lazyLoad && (i = "data-src", j = "owl-lazy"), h.length ? (l(h.attr(i)), h.remove(), !1) : void("youtube" === c.type ? (f = "http://img.youtube.com/vi/" + c.id + "/hqdefault.jpg", l(f)) : "vimeo" === c.type && a.ajax({type: "GET", url: "http://vimeo.com/api/v2/video/" + c.id + ".json", jsonp: "callback", dataType: "jsonp", success: function (a) {
                        f = a[0].thumbnail_large, l(f)
                    }}))
            }, d.prototype.stop = function () {
                this._core.trigger("stop", null, "video"), this._playing.find(".owl-video-frame").remove(), this._playing.removeClass("owl-video-playing"), this._playing = null
            }, d.prototype.play = function (b) {
                this._core.trigger("play", null, "video"), this._playing && this.stop();
                var c, d, e = a(b.target || b.srcElement), f = e.closest("." + this._core.settings.itemClass), g = this._videos[f.attr("data-video")], h = g.width || "100%", i = g.height || this._core.$stage.height();
                "youtube" === g.type ? c = '<iframe width="' + h + '" height="' + i + '" src="http://www.youtube.com/embed/' + g.id + "?autoplay=1&v=" + g.id + '" frameborder="0" allowfullscreen></iframe>' : "vimeo" === g.type && (c = '<iframe src="http://player.vimeo.com/video/' + g.id + '?autoplay=1" width="' + h + '" height="' + i + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'), f.addClass("owl-video-playing"), this._playing = f, d = a('<div style="height:' + i + "px; width:" + h + 'px" class="owl-video-frame">' + c + "</div>"), e.after(d)
            }, d.prototype.isInFullScreen = function () {
                var d = c.fullscreenElement || c.mozFullScreenElement || c.webkitFullscreenElement;
                return d && a(d).parent().hasClass("owl-video-frame") && (this._core.speed(0), this._fullscreen = !0), d && this._fullscreen && this._playing ? !1 : this._fullscreen ? (this._fullscreen = !1, !1) : this._playing && this._core.state.orientation !== b.orientation ? (this._core.state.orientation = b.orientation, !1) : !0
            }, d.prototype.destroy = function () {
                var a, b;
                this._core.$element.off("click.owl.video");
                for (a in this._handlers)
                    this._core.$element.off(a, this._handlers[a]);
                for (b in Object.getOwnPropertyNames(this))
                    "function" != typeof this[b] && (this[b] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.Video = d
        }(window.Zepto || window.jQuery, window, document), function (a, b, c, d) {
            var e = function (b) {
                this.core = b, this.core.options = a.extend({}, e.Defaults, this.core.options), this.swapping = !0, this.previous = d, this.next = d, this.handlers = {"change.owl.carousel": a.proxy(function (a) {
                        "position" == a.property.name && (this.previous = this.core.current(), this.next = a.property.value)
                    }, this), "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(function (a) {
                        this.swapping = "translated" == a.type
                    }, this), "translate.owl.carousel": a.proxy(function () {
                        this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
                    }, this)}, this.core.$element.on(this.handlers)
            };
            e.Defaults = {animateOut: !1, animateIn: !1}, e.prototype.swap = function () {
                if (1 === this.core.settings.items && this.core.support3d) {
                    this.core.speed(0);
                    var b, c = a.proxy(this.clear, this), d = this.core.$stage.children().eq(this.previous), e = this.core.$stage.children().eq(this.next), f = this.core.settings.animateIn, g = this.core.settings.animateOut;
                    this.core.current() !== this.previous && (g && (b = this.core.coordinates(this.previous) - this.core.coordinates(this.next), d.css({left: b + "px"}).addClass("animated owl-animated-out").addClass(g).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c)), f && e.addClass("animated owl-animated-in").addClass(f).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c))
                }
            }, e.prototype.clear = function (b) {
                a(b.target).css({left: ""}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.transitionEnd()
            }, e.prototype.destroy = function () {
                var a, b;
                for (a in this.handlers)
                    this.core.$element.off(a, this.handlers[a]);
                for (b in Object.getOwnPropertyNames(this))
                    "function" != typeof this[b] && (this[b] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.Animate = e
        }(window.Zepto || window.jQuery, window, document), function (a, b, c) {
            var d = function (b) {
                this.core = b, this.core.options = a.extend({}, d.Defaults, this.core.options), this.handlers = {"translated.owl.carousel refreshed.owl.carousel": a.proxy(function () {
                        this.autoplay()
                    }, this), "play.owl.autoplay": a.proxy(function (a, b, c) {
                        this.play(b, c)
                    }, this), "stop.owl.autoplay": a.proxy(function () {
                        this.stop()
                    }, this), "mouseover.owl.autoplay": a.proxy(function () {
                        this.core.settings.autoplayHoverPause && this.pause()
                    }, this), "mouseleave.owl.autoplay": a.proxy(function () {
                        this.core.settings.autoplayHoverPause && this.autoplay()
                    }, this)}, this.core.$element.on(this.handlers)
            };
            d.Defaults = {autoplay: !1, autoplayTimeout: 5e3, autoplayHoverPause: !1, autoplaySpeed: !1}, d.prototype.autoplay = function () {
                this.core.settings.autoplay && !this.core.state.videoPlay ? (b.clearInterval(this.interval), this.interval = b.setInterval(a.proxy(function () {
                    this.play()
                }, this), this.core.settings.autoplayTimeout)) : b.clearInterval(this.interval)
            }, d.prototype.play = function () {
                return c.hidden === !0 || this.core.state.isTouch || this.core.state.isScrolling || this.core.state.isSwiping || this.core.state.inMotion ? void 0 : this.core.settings.autoplay === !1 ? void b.clearInterval(this.interval) : void this.core.next(this.core.settings.autoplaySpeed)
            }, d.prototype.stop = function () {
                b.clearInterval(this.interval)
            }, d.prototype.pause = function () {
                b.clearInterval(this.interval)
            }, d.prototype.destroy = function () {
                var a, c;
                b.clearInterval(this.interval);
                for (a in this.handlers)
                    this.core.$element.off(a, this.handlers[a]);
                for (c in Object.getOwnPropertyNames(this))
                    "function" != typeof this[c] && (this[c] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.autoplay = d
        }(window.Zepto || window.jQuery, window, document), function (a) {
            "use strict";
            var b = function (c) {
                this._core = c, this._initialized = !1, this._pages = [], this._controls = {}, this._templates = [], this.$element = this._core.$element, this._overrides = {next: this._core.next, prev: this._core.prev, to: this._core.to}, this._handlers = {"prepared.owl.carousel": a.proxy(function (b) {
                        this._core.settings.dotsData && this._templates.push(a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
                    }, this), "add.owl.carousel": a.proxy(function (b) {
                        this._core.settings.dotsData && this._templates.splice(b.position, 0, a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
                    }, this), "remove.owl.carousel prepared.owl.carousel": a.proxy(function (a) {
                        this._core.settings.dotsData && this._templates.splice(a.position, 1)
                    }, this), "change.owl.carousel": a.proxy(function (a) {
                        if ("position" == a.property.name && !this._core.state.revert && !this._core.settings.loop && this._core.settings.navRewind) {
                            var b = this._core.current(), c = this._core.maximum(), d = this._core.minimum();
                            a.data = a.property.value > c ? b >= c ? d : c : a.property.value < d ? c : a.property.value
                        }
                    }, this), "changed.owl.carousel": a.proxy(function (a) {
                        "position" == a.property.name && this.draw()
                    }, this), "refreshed.owl.carousel": a.proxy(function () {
                        this._initialized || (this.initialize(), this._initialized = !0), this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation")
                    }, this)}, this._core.options = a.extend({}, b.Defaults, this._core.options), this.$element.on(this._handlers)
            };
            b.Defaults = {nav: !1, navRewind: !0, navText: ["prev", "next"], navSpeed: !1, navElement: "div", navContainer: !1, navContainerClass: "owl-nav", navClass: ["owl-prev", "owl-next"], slideBy: 1, dotClass: "owl-dot", dotsClass: "owl-dots", dots: !0, dotsEach: !1, dotData: !1, dotsSpeed: !1, dotsContainer: !1, controlsClass: "owl-controls"}, b.prototype.initialize = function () {
                var b, c, d = this._core.settings;
                d.dotsData || (this._templates = [a("<div>").addClass(d.dotClass).append(a("<span>")).prop("outerHTML")]), d.navContainer && d.dotsContainer || (this._controls.$container = a("<div>").addClass(d.controlsClass).appendTo(this.$element)), this._controls.$indicators = d.dotsContainer ? a(d.dotsContainer) : a("<div>").hide().addClass(d.dotsClass).appendTo(this._controls.$container), this._controls.$indicators.on("click", "div", a.proxy(function (b) {
                    var c = a(b.target).parent().is(this._controls.$indicators) ? a(b.target).index() : a(b.target).parent().index();
                    b.preventDefault(), this.to(c, d.dotsSpeed)
                }, this)), b = d.navContainer ? a(d.navContainer) : a("<div>").addClass(d.navContainerClass).prependTo(this._controls.$container), this._controls.$next = a("<" + d.navElement + ">"), this._controls.$previous = this._controls.$next.clone(), this._controls.$previous.addClass(d.navClass[0]).html(d.navText[0]).hide().prependTo(b).on("click", a.proxy(function () {
                    this.prev(d.navSpeed)
                }, this)), this._controls.$next.addClass(d.navClass[1]).html(d.navText[1]).hide().appendTo(b).on("click", a.proxy(function () {
                    this.next(d.navSpeed)
                }, this));
                for (c in this._overrides)
                    this._core[c] = a.proxy(this[c], this)
            }, b.prototype.destroy = function () {
                var a, b, c, d;
                for (a in this._handlers)
                    this.$element.off(a, this._handlers[a]);
                for (b in this._controls)
                    this._controls[b].remove();
                for (d in this.overides)
                    this._core[d] = this._overrides[d];
                for (c in Object.getOwnPropertyNames(this))
                    "function" != typeof this[c] && (this[c] = null)
            }, b.prototype.update = function () {
                var a, b, c, d = this._core.settings, e = this._core.clones().length / 2, f = e + this._core.items().length, g = d.center || d.autoWidth || d.dotData ? 1 : d.dotsEach || d.items;
                if ("page" !== d.slideBy && (d.slideBy = Math.min(d.slideBy, d.items)), d.dots || "page" == d.slideBy)
                    for (this._pages = [], a = e, b = 0, c = 0; f > a; a++)
                        (b >= g || 0 === b) && (this._pages.push({start: a - e, end: a - e + g - 1}), b = 0, ++c), b += this._core.mergers(this._core.relative(a))
            }, b.prototype.draw = function () {
                var b, c, d = "", e = this._core.settings, f = (this._core.$stage.children(), this._core.relative(this._core.current()));
                if (!e.nav || e.loop || e.navRewind || (this._controls.$previous.toggleClass("disabled", 0 >= f), this._controls.$next.toggleClass("disabled", f >= this._core.maximum())), this._controls.$previous.toggle(e.nav), this._controls.$next.toggle(e.nav), e.dots) {
                    if (b = this._pages.length - this._controls.$indicators.children().length, e.dotData && 0 !== b) {
                        for (c = 0; c < this._controls.$indicators.children().length; c++)
                            d += this._templates[this._core.relative(c)];
                        this._controls.$indicators.html(d)
                    } else
                        b > 0 ? (d = new Array(b + 1).join(this._templates[0]), this._controls.$indicators.append(d)) : 0 > b && this._controls.$indicators.children().slice(b).remove();
                    this._controls.$indicators.find(".active").removeClass("active"), this._controls.$indicators.children().eq(a.inArray(this.current(), this._pages)).addClass("active")
                }
                this._controls.$indicators.toggle(e.dots)
            }, b.prototype.onTrigger = function (b) {
                var c = this._core.settings;
                b.page = {index: a.inArray(this.current(), this._pages), count: this._pages.length, size: c && (c.center || c.autoWidth || c.dotData ? 1 : c.dotsEach || c.items)}
            }, b.prototype.current = function () {
                var b = this._core.relative(this._core.current());
                return a.grep(this._pages, function (a) {
                    return a.start <= b && a.end >= b
                }).pop()
            }, b.prototype.getPosition = function (b) {
                var c, d, e = this._core.settings;
                return"page" == e.slideBy ? (c = a.inArray(this.current(), this._pages), d = this._pages.length, b ? ++c : --c, c = this._pages[(c % d + d) % d].start) : (c = this._core.relative(this._core.current()), d = this._core.items().length, b ? c += e.slideBy : c -= e.slideBy), c
            }, b.prototype.next = function (b) {
                a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b)
            }, b.prototype.prev = function (b) {
                a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b)
            }, b.prototype.to = function (b, c, d) {
                var e;
                d ? a.proxy(this._overrides.to, this._core)(b, c) : (e = this._pages.length, a.proxy(this._overrides.to, this._core)(this._pages[(b % e + e) % e].start, c))
            }, a.fn.owlCarousel.Constructor.Plugins.Navigation = b
        }(window.Zepto || window.jQuery, window, document), function (a, b) {
            "use strict";
            var c = function (d) {
                this._core = d, this._hashes = {}, this.$element = this._core.$element, this._handlers = {"initialized.owl.carousel": a.proxy(function () {
                        "URLHash" == this._core.settings.startPosition && a(b).trigger("hashchange.owl.navigation")
                    }, this), "prepared.owl.carousel": a.proxy(function (b) {
                        var c = a(b.content).find("[data-hash]").andSelf("[data-hash]").attr("data-hash");
                        this._hashes[c] = b.content
                    }, this)}, this._core.options = a.extend({}, c.Defaults, this._core.options), this.$element.on(this._handlers), a(b).on("hashchange.owl.navigation", a.proxy(function () {
                    var a = b.location.hash.substring(1), c = this._core.$stage.children(), d = this._hashes[a] && c.index(this._hashes[a]) || 0;
                    return a ? void this._core.to(d, !1, !0) : !1
                }, this))
            };
            c.Defaults = {URLhashListener: !1}, c.prototype.destroy = function () {
                var c, d;
                a(b).off("hashchange.owl.navigation");
                for (c in this._handlers)
                    this._core.$element.off(c, this._handlers[c]);
                for (d in Object.getOwnPropertyNames(this))
                    "function" != typeof this[d] && (this[d] = null)
            }, a.fn.owlCarousel.Constructor.Plugins.Hash = c
        }(window.Zepto || window.jQuery, window, document);

        /*skrollr*/
        /*!
         * skrollr core
         *
         * Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr
         *
         * Free to use under terms of MIT license
         */
        (function (window, document, undefined) {
            'use strict';

            /*
             * Global api.
             */
            var skrollr = {
                get: function () {
                    return _instance;
                },
                //Main entry point.
                init: function (options) {
                    return _instance || new Skrollr(options);
                },
                VERSION: '0.6.29'
            };

            //Minify optimization.
            var hasProp = Object.prototype.hasOwnProperty;
            var Math = window.Math;
            var getStyle = window.getComputedStyle;

            //They will be filled when skrollr gets initialized.
            var documentElement;
            var body;

            var EVENT_TOUCHSTART = 'touchstart';
            var EVENT_TOUCHMOVE = 'touchmove';
            var EVENT_TOUCHCANCEL = 'touchcancel';
            var EVENT_TOUCHEND = 'touchend';

            var SKROLLABLE_CLASS = 'skrollable';
            var SKROLLABLE_BEFORE_CLASS = SKROLLABLE_CLASS + '-before';
            var SKROLLABLE_BETWEEN_CLASS = SKROLLABLE_CLASS + '-between';
            var SKROLLABLE_AFTER_CLASS = SKROLLABLE_CLASS + '-after';

            var SKROLLR_CLASS = 'skrollr';
            var NO_SKROLLR_CLASS = 'no-' + SKROLLR_CLASS;
            var SKROLLR_DESKTOP_CLASS = SKROLLR_CLASS + '-desktop';
            var SKROLLR_MOBILE_CLASS = SKROLLR_CLASS + '-mobile';

            var DEFAULT_EASING = 'linear';
            var DEFAULT_DURATION = 1000;//ms
            var DEFAULT_MOBILE_DECELERATION = 0.004;//pixel/ms²

            var DEFAULT_SKROLLRBODY = 'skrollr-body';

            var DEFAULT_SMOOTH_SCROLLING_DURATION = 200;//ms

            var ANCHOR_START = 'start';
            var ANCHOR_END = 'end';
            var ANCHOR_CENTER = 'center';
            var ANCHOR_BOTTOM = 'bottom';

            //The property which will be added to the DOM element to hold the ID of the skrollable.
            var SKROLLABLE_ID_DOM_PROPERTY = '___skrollable_id';

            var rxTouchIgnoreTags = /^(?:input|textarea|button|select)$/i;

            var rxTrim = /^\s+|\s+$/g;

            //Find all data-attributes. data-[_constant]-[offset]-[anchor]-[anchor].
            var rxKeyframeAttribute = /^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/;

            var rxPropValue = /\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi;

            //Easing function names follow the property in square brackets.
            var rxPropEasing = /^(@?[a-z\-]+)\[(\w+)\]$/;

            var rxCamelCase = /-([a-z0-9_])/g;
            var rxCamelCaseFn = function (str, letter) {
                return letter.toUpperCase();
            };

            //Numeric values with optional sign.
            var rxNumericValue = /[\-+]?[\d]*\.?[\d]+/g;

            //Used to replace occurences of {?} with a number.
            var rxInterpolateString = /\{\?\}/g;

            //Finds rgb(a) colors, which don't use the percentage notation.
            var rxRGBAIntegerColor = /rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g;

            //Finds all gradients.
            var rxGradient = /[a-z\-]+-gradient/g;

            //Vendor prefix. Will be set once skrollr gets initialized.
            var theCSSPrefix = '';
            var theDashedCSSPrefix = '';

            //Will be called once (when skrollr gets initialized).
            var detectCSSPrefix = function () {
                //Only relevant prefixes. May be extended.
                //Could be dangerous if there will ever be a CSS property which actually starts with "ms". Don't hope so.
                var rxPrefixes = /^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;

                //Detect prefix for current browser by finding the first property using a prefix.
                if (!getStyle) {
                    return;
                }

                var style = getStyle(body, null);

                for (var k in style) {
                    //We check the key and if the key is a number, we check the value as well, because safari's getComputedStyle returns some weird array-like thingy.
                    theCSSPrefix = (k.match(rxPrefixes) || (+k == k && style[k].match(rxPrefixes)));

                    if (theCSSPrefix) {
                        break;
                    }
                }

                //Did we even detect a prefix?
                if (!theCSSPrefix) {
                    theCSSPrefix = theDashedCSSPrefix = '';

                    return;
                }

                theCSSPrefix = theCSSPrefix[0];

                //We could have detected either a dashed prefix or this camelCaseish-inconsistent stuff.
                if (theCSSPrefix.slice(0, 1) === '-') {
                    theDashedCSSPrefix = theCSSPrefix;

                    //There's no logic behind these. Need a look up.
                    theCSSPrefix = ({
                        '-webkit-': 'webkit',
                        '-moz-': 'Moz',
                        '-ms-': 'ms',
                        '-o-': 'O'
                    })[theCSSPrefix];
                } else {
                    theDashedCSSPrefix = '-' + theCSSPrefix.toLowerCase() + '-';
                }
            };

            var polyfillRAF = function () {
                var requestAnimFrame = window.requestAnimationFrame || window[theCSSPrefix.toLowerCase() + 'RequestAnimationFrame'];

                var lastTime = _now();

                if (_isMobile || !requestAnimFrame) {
                    requestAnimFrame = function (callback) {
                        //How long did it take to render?
                        var deltaTime = _now() - lastTime;
                        var delay = Math.max(0, 1000 / 60 - deltaTime);

                        return window.setTimeout(function () {
                            lastTime = _now();
                            callback();
                        }, delay);
                    };
                }

                return requestAnimFrame;
            };

            var polyfillCAF = function () {
                var cancelAnimFrame = window.cancelAnimationFrame || window[theCSSPrefix.toLowerCase() + 'CancelAnimationFrame'];

                if (_isMobile || !cancelAnimFrame) {
                    cancelAnimFrame = function (timeout) {
                        return window.clearTimeout(timeout);
                    };
                }

                return cancelAnimFrame;
            };

            //Built-in easing functions.
            var easings = {
                begin: function () {
                    return 0;
                },
                end: function () {
                    return 1;
                },
                linear: function (p) {
                    return p;
                },
                quadratic: function (p) {
                    return p * p;
                },
                cubic: function (p) {
                    return p * p * p;
                },
                swing: function (p) {
                    return (-Math.cos(p * Math.PI) / 2) + 0.5;
                },
                sqrt: function (p) {
                    return Math.sqrt(p);
                },
                outCubic: function (p) {
                    return (Math.pow((p - 1), 3) + 1);
                },
                //see https://www.desmos.com/calculator/tbr20s8vd2 for how I did this
                bounce: function (p) {
                    var a;

                    if (p <= 0.5083) {
                        a = 3;
                    } else if (p <= 0.8489) {
                        a = 9;
                    } else if (p <= 0.96208) {
                        a = 27;
                    } else if (p <= 0.99981) {
                        a = 91;
                    } else {
                        return 1;
                    }

                    return 1 - Math.abs(3 * Math.cos(p * a * 1.028) / a);
                }
            };

            /**
             * Constructor.
             */
            function Skrollr(options) {
                documentElement = document.documentElement;
                body = document.body;

                detectCSSPrefix();

                _instance = this;

                options = options || {};

                _constants = options.constants || {};

                //We allow defining custom easings or overwrite existing.
                if (options.easing) {
                    for (var e in options.easing) {
                        easings[e] = options.easing[e];
                    }
                }

                _edgeStrategy = options.edgeStrategy || 'set';

                _listeners = {
                    //Function to be called right before rendering.
                    beforerender: options.beforerender,
                    //Function to be called right after finishing rendering.
                    render: options.render,
                    //Function to be called whenever an element with the `data-emit-events` attribute passes a keyframe.
                    keyframe: options.keyframe
                };

                //forceHeight is true by default
                _forceHeight = options.forceHeight !== false;

                if (_forceHeight) {
                    _scale = options.scale || 1;
                }

                _mobileDeceleration = options.mobileDeceleration || DEFAULT_MOBILE_DECELERATION;

                _smoothScrollingEnabled = options.smoothScrolling !== false;
                _smoothScrollingDuration = options.smoothScrollingDuration || DEFAULT_SMOOTH_SCROLLING_DURATION;

                //Dummy object. Will be overwritten in the _render method when smooth scrolling is calculated.
                _smoothScrolling = {
                    targetTop: _instance.getScrollTop()
                };

                //A custom check function may be passed.
                _isMobile = ((options.mobileCheck || function () {
                    return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
                })());

                if (_isMobile) {
                    _skrollrBody = document.getElementById(options.skrollrBody || DEFAULT_SKROLLRBODY);

                    //Detect 3d transform if there's a skrollr-body (only needed for #skrollr-body).
                    if (_skrollrBody) {
                        _detect3DTransforms();
                    }

                    _initMobile();
                    _updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_MOBILE_CLASS], [NO_SKROLLR_CLASS]);
                } else {
                    _updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS], [NO_SKROLLR_CLASS]);
                }

                //Triggers parsing of elements and a first reflow.
                _instance.refresh();

                _addEvent(window, 'resize orientationchange', function () {
                    var width = documentElement.clientWidth;
                    var height = documentElement.clientHeight;

                    //Only reflow if the size actually changed (#271).
                    if (height !== _lastViewportHeight || width !== _lastViewportWidth) {
                        _lastViewportHeight = height;
                        _lastViewportWidth = width;

                        _requestReflow = true;
                    }
                });

                var requestAnimFrame = polyfillRAF();

                //Let's go.
                (function animloop() {
                    _render();
                    _animFrame = requestAnimFrame(animloop);
                }());

                return _instance;
            }

            /**
             * (Re)parses some or all elements.
             */
            Skrollr.prototype.refresh = function (elements) {
                var elementIndex;
                var elementsLength;
                var ignoreID = false;

                //Completely reparse anything without argument.
                if (elements === undefined) {
                    //Ignore that some elements may already have a skrollable ID.
                    ignoreID = true;

                    _skrollables = [];
                    _skrollableIdCounter = 0;

                    elements = document.getElementsByTagName('*');
                } else if (elements.length === undefined) {
                    //We also accept a single element as parameter.
                    elements = [elements];
                }

                elementIndex = 0;
                elementsLength = elements.length;

                for (; elementIndex < elementsLength; elementIndex++) {
                    var el = elements[elementIndex];
                    var anchorTarget = el;
                    var keyFrames = [];

                    //If this particular element should be smooth scrolled.
                    var smoothScrollThis = _smoothScrollingEnabled;

                    //The edge strategy for this particular element.
                    var edgeStrategy = _edgeStrategy;

                    //If this particular element should emit keyframe events.
                    var emitEvents = false;

                    //If we're reseting the counter, remove any old element ids that may be hanging around.
                    if (ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {
                        delete el[SKROLLABLE_ID_DOM_PROPERTY];
                    }

                    if (!el.attributes) {
                        continue;
                    }

                    //Iterate over all attributes and search for key frame attributes.
                    var attributeIndex = 0;
                    var attributesLength = el.attributes.length;

                    for (; attributeIndex < attributesLength; attributeIndex++) {
                        var attr = el.attributes[attributeIndex];

                        if (attr.name === 'data-anchor-target') {
                            anchorTarget = document.querySelector(attr.value);

                            if (anchorTarget === null) {
                                throw 'Unable to find anchor target "' + attr.value + '"';
                            }

                            continue;
                        }

                        //Global smooth scrolling can be overridden by the element attribute.
                        if (attr.name === 'data-smooth-scrolling') {
                            smoothScrollThis = attr.value !== 'off';

                            continue;
                        }

                        //Global edge strategy can be overridden by the element attribute.
                        if (attr.name === 'data-edge-strategy') {
                            edgeStrategy = attr.value;

                            continue;
                        }

                        //Is this element tagged with the `data-emit-events` attribute?
                        if (attr.name === 'data-emit-events') {
                            emitEvents = true;

                            continue;
                        }

                        var match = attr.name.match(rxKeyframeAttribute);

                        if (match === null) {
                            continue;
                        }

                        var kf = {
                            props: attr.value,
                            //Point back to the element as well.
                            element: el,
                            //The name of the event which this keyframe will fire, if emitEvents is
                            eventType: attr.name.replace(rxCamelCase, rxCamelCaseFn)
                        };

                        keyFrames.push(kf);

                        var constant = match[1];

                        if (constant) {
                            //Strip the underscore prefix.
                            kf.constant = constant.substr(1);
                        }

                        //Get the key frame offset.
                        var offset = match[2];

                        //Is it a percentage offset?
                        if (/p$/.test(offset)) {
                            kf.isPercentage = true;
                            kf.offset = (offset.slice(0, -1) | 0) / 100;
                        } else {
                            kf.offset = (offset | 0);
                        }

                        var anchor1 = match[3];

                        //If second anchor is not set, the first will be taken for both.
                        var anchor2 = match[4] || anchor1;

                        //"absolute" (or "classic") mode, where numbers mean absolute scroll offset.
                        if (!anchor1 || anchor1 === ANCHOR_START || anchor1 === ANCHOR_END) {
                            kf.mode = 'absolute';

                            //data-end needs to be calculated after all key frames are known.
                            if (anchor1 === ANCHOR_END) {
                                kf.isEnd = true;
                            } else if (!kf.isPercentage) {
                                //For data-start we can already set the key frame w/o calculations.
                                //#59: "scale" options should only affect absolute mode.
                                kf.offset = kf.offset * _scale;
                            }
                        }
                        //"relative" mode, where numbers are relative to anchors.
                        else {
                            kf.mode = 'relative';
                            kf.anchors = [anchor1, anchor2];
                        }
                    }

                    //Does this element have key frames?
                    if (!keyFrames.length) {
                        continue;
                    }

                    //Will hold the original style and class attributes before we controlled the element (see #80).
                    var styleAttr, classAttr;

                    var id;

                    if (!ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {
                        //We already have this element under control. Grab the corresponding skrollable id.
                        id = el[SKROLLABLE_ID_DOM_PROPERTY];
                        styleAttr = _skrollables[id].styleAttr;
                        classAttr = _skrollables[id].classAttr;
                    } else {
                        //It's an unknown element. Asign it a new skrollable id.
                        id = (el[SKROLLABLE_ID_DOM_PROPERTY] = _skrollableIdCounter++);
                        styleAttr = el.style.cssText;
                        classAttr = _getClass(el);
                    }

                    _skrollables[id] = {
                        element: el,
                        styleAttr: styleAttr,
                        classAttr: classAttr,
                        anchorTarget: anchorTarget,
                        keyFrames: keyFrames,
                        smoothScrolling: smoothScrollThis,
                        edgeStrategy: edgeStrategy,
                        emitEvents: emitEvents,
                        lastFrameIndex: -1
                    };

                    _updateClass(el, [SKROLLABLE_CLASS], []);
                }

                //Reflow for the first time.
                _reflow();

                //Now that we got all key frame numbers right, actually parse the properties.
                elementIndex = 0;
                elementsLength = elements.length;

                for (; elementIndex < elementsLength; elementIndex++) {
                    var sk = _skrollables[elements[elementIndex][SKROLLABLE_ID_DOM_PROPERTY]];

                    if (sk === undefined) {
                        continue;
                    }

                    //Parse the property string to objects
                    _parseProps(sk);

                    //Fill key frames with missing properties from left and right
                    _fillProps(sk);
                }

                return _instance;
            };

            /**
             * Transform "relative" mode to "absolute" mode.
             * That is, calculate anchor position and offset of element.
             */
            Skrollr.prototype.relativeToAbsolute = function (element, viewportAnchor, elementAnchor) {
                var viewportHeight = documentElement.clientHeight;
                var box = element.getBoundingClientRect();
                var absolute = box.top;

                //#100: IE doesn't supply "height" with getBoundingClientRect.
                var boxHeight = box.bottom - box.top;

                if (viewportAnchor === ANCHOR_BOTTOM) {
                    absolute -= viewportHeight;
                } else if (viewportAnchor === ANCHOR_CENTER) {
                    absolute -= viewportHeight / 2;
                }

                if (elementAnchor === ANCHOR_BOTTOM) {
                    absolute += boxHeight;
                } else if (elementAnchor === ANCHOR_CENTER) {
                    absolute += boxHeight / 2;
                }

                //Compensate scrolling since getBoundingClientRect is relative to viewport.
                absolute += _instance.getScrollTop();

                return (absolute + 0.5) | 0;
            };

            /**
             * Animates scroll top to new position.
             */
            Skrollr.prototype.animateTo = function (top, options) {
                options = options || {};

                var now = _now();
                var scrollTop = _instance.getScrollTop();
                var duration = options.duration === undefined ? DEFAULT_DURATION : options.duration;

                //Setting this to a new value will automatically cause the current animation to stop, if any.
                _scrollAnimation = {
                    startTop: scrollTop,
                    topDiff: top - scrollTop,
                    targetTop: top,
                    duration: duration,
                    startTime: now,
                    endTime: now + duration,
                    easing: easings[options.easing || DEFAULT_EASING],
                    done: options.done
                };

                //Don't queue the animation if there's nothing to animate.
                if (!_scrollAnimation.topDiff) {
                    if (_scrollAnimation.done) {
                        _scrollAnimation.done.call(_instance, false);
                    }

                    _scrollAnimation = undefined;
                }

                return _instance;
            };

            /**
             * Stops animateTo animation.
             */
            Skrollr.prototype.stopAnimateTo = function () {
                if (_scrollAnimation && _scrollAnimation.done) {
                    _scrollAnimation.done.call(_instance, true);
                }

                _scrollAnimation = undefined;
            };

            /**
             * Returns if an animation caused by animateTo is currently running.
             */
            Skrollr.prototype.isAnimatingTo = function () {
                return !!_scrollAnimation;
            };

            Skrollr.prototype.isMobile = function () {
                return _isMobile;
            };

            Skrollr.prototype.setScrollTop = function (top, force) {
                _forceRender = (force === true);

                if (_isMobile) {
                    _mobileOffset = Math.min(Math.max(top, 0), _maxKeyFrame);
                } else {
                    window.scrollTo(0, top);
                }

                return _instance;
            };

            Skrollr.prototype.getScrollTop = function () {
                if (_isMobile) {
                    return _mobileOffset;
                } else {
                    return window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
                }
            };

            Skrollr.prototype.getMaxScrollTop = function () {
                return _maxKeyFrame;
            };

            Skrollr.prototype.on = function (name, fn) {
                _listeners[name] = fn;

                return _instance;
            };

            Skrollr.prototype.off = function (name) {
                delete _listeners[name];

                return _instance;
            };

            Skrollr.prototype.destroy = function () {
                var cancelAnimFrame = polyfillCAF();
                cancelAnimFrame(_animFrame);
                _removeAllEvents();

                _updateClass(documentElement, [NO_SKROLLR_CLASS], [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS, SKROLLR_MOBILE_CLASS]);

                var skrollableIndex = 0;
                var skrollablesLength = _skrollables.length;

                for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
                    _reset(_skrollables[skrollableIndex].element);
                }

                documentElement.style.overflow = body.style.overflow = '';
                documentElement.style.height = body.style.height = '';

                if (_skrollrBody) {
                    skrollr.setStyle(_skrollrBody, 'transform', 'none');
                }

                _instance = undefined;
                _skrollrBody = undefined;
                _listeners = undefined;
                _forceHeight = undefined;
                _maxKeyFrame = 0;
                _scale = 1;
                _constants = undefined;
                _mobileDeceleration = undefined;
                _direction = 'down';
                _lastTop = -1;
                _lastViewportWidth = 0;
                _lastViewportHeight = 0;
                _requestReflow = false;
                _scrollAnimation = undefined;
                _smoothScrollingEnabled = undefined;
                _smoothScrollingDuration = undefined;
                _smoothScrolling = undefined;
                _forceRender = undefined;
                _skrollableIdCounter = 0;
                _edgeStrategy = undefined;
                _isMobile = false;
                _mobileOffset = 0;
                _translateZ = undefined;
            };

            /*
             Private methods.
             */

            var _initMobile = function () {
                var initialElement;
                var initialTouchY;
                var initialTouchX;
                var currentElement;
                var currentTouchY;
                var currentTouchX;
                var lastTouchY;
                var deltaY;

                var initialTouchTime;
                var currentTouchTime;
                var lastTouchTime;
                var deltaTime;

                _addEvent(documentElement, [EVENT_TOUCHSTART, EVENT_TOUCHMOVE, EVENT_TOUCHCANCEL, EVENT_TOUCHEND].join(' '), function (e) {
                    var touch = e.changedTouches[0];

                    currentElement = e.target;

                    //We don't want text nodes.
                    while (currentElement.nodeType === 3) {
                        currentElement = currentElement.parentNode;
                    }

                    currentTouchY = touch.clientY;
                    currentTouchX = touch.clientX;
                    currentTouchTime = e.timeStamp;

                    if (!rxTouchIgnoreTags.test(currentElement.tagName)) {
                        e.preventDefault();
                    }

                    switch (e.type) {
                        case EVENT_TOUCHSTART:
                            //The last element we tapped on.
                            if (initialElement) {
                                initialElement.blur();
                            }

                            _instance.stopAnimateTo();

                            initialElement = currentElement;

                            initialTouchY = lastTouchY = currentTouchY;
                            initialTouchX = currentTouchX;
                            initialTouchTime = currentTouchTime;

                            break;
                        case EVENT_TOUCHMOVE:
                            //Prevent default event on touchIgnore elements in case they don't have focus yet.
                            if (rxTouchIgnoreTags.test(currentElement.tagName) && document.activeElement !== currentElement) {
                                e.preventDefault();
                            }

                            deltaY = currentTouchY - lastTouchY;
                            deltaTime = currentTouchTime - lastTouchTime;

                            _instance.setScrollTop(_mobileOffset - deltaY, true);

                            lastTouchY = currentTouchY;
                            lastTouchTime = currentTouchTime;
                            break;
                        default:
                        case EVENT_TOUCHCANCEL:
                        case EVENT_TOUCHEND:
                            var distanceY = initialTouchY - currentTouchY;
                            var distanceX = initialTouchX - currentTouchX;
                            var distance2 = distanceX * distanceX + distanceY * distanceY;

                            //Check if it was more like a tap (moved less than 7px).
                            if (distance2 < 49) {
                                if (!rxTouchIgnoreTags.test(initialElement.tagName)) {
                                    initialElement.focus();

                                    //It was a tap, click the element.
                                    var clickEvent = document.createEvent('MouseEvents');
                                    clickEvent.initMouseEvent('click', true, true, e.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                                    initialElement.dispatchEvent(clickEvent);
                                }

                                return;
                            }

                            initialElement = undefined;

                            var speed = deltaY / deltaTime;

                            //Cap speed at 3 pixel/ms.
                            speed = Math.max(Math.min(speed, 3), -3);

                            var duration = Math.abs(speed / _mobileDeceleration);
                            var targetOffset = speed * duration + 0.5 * _mobileDeceleration * duration * duration;
                            var targetTop = _instance.getScrollTop() - targetOffset;

                            //Relative duration change for when scrolling above bounds.
                            var targetRatio = 0;

                            //Change duration proportionally when scrolling would leave bounds.
                            if (targetTop > _maxKeyFrame) {
                                targetRatio = (_maxKeyFrame - targetTop) / targetOffset;

                                targetTop = _maxKeyFrame;
                            } else if (targetTop < 0) {
                                targetRatio = -targetTop / targetOffset;

                                targetTop = 0;
                            }

                            duration = duration * (1 - targetRatio);

                            _instance.animateTo((targetTop + 0.5) | 0, {easing: 'outCubic', duration: duration});
                            break;
                    }
                });

                //Just in case there has already been some native scrolling, reset it.
                window.scrollTo(0, 0);
                documentElement.style.overflow = body.style.overflow = 'hidden';
            };

            /**
             * Updates key frames which depend on others / need to be updated on resize.
             * That is "end" in "absolute" mode and all key frames in "relative" mode.
             * Also handles constants, because they may change on resize.
             */
            var _updateDependentKeyFrames = function () {
                var viewportHeight = documentElement.clientHeight;
                var processedConstants = _processConstants();
                var skrollable;
                var element;
                var anchorTarget;
                var keyFrames;
                var keyFrameIndex;
                var keyFramesLength;
                var kf;
                var skrollableIndex;
                var skrollablesLength;
                var offset;
                var constantValue;

                //First process all relative-mode elements and find the max key frame.
                skrollableIndex = 0;
                skrollablesLength = _skrollables.length;

                for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
                    skrollable = _skrollables[skrollableIndex];
                    element = skrollable.element;
                    anchorTarget = skrollable.anchorTarget;
                    keyFrames = skrollable.keyFrames;

                    keyFrameIndex = 0;
                    keyFramesLength = keyFrames.length;

                    for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
                        kf = keyFrames[keyFrameIndex];

                        offset = kf.offset;
                        constantValue = processedConstants[kf.constant] || 0;

                        kf.frame = offset;

                        if (kf.isPercentage) {
                            //Convert the offset to percentage of the viewport height.
                            offset = offset * viewportHeight;

                            //Absolute + percentage mode.
                            kf.frame = offset;
                        }

                        if (kf.mode === 'relative') {
                            _reset(element);

                            kf.frame = _instance.relativeToAbsolute(anchorTarget, kf.anchors[0], kf.anchors[1]) - offset;

                            _reset(element, true);
                        }

                        kf.frame += constantValue;

                        //Only search for max key frame when forceHeight is enabled.
                        if (_forceHeight) {
                            //Find the max key frame, but don't use one of the data-end ones for comparison.
                            if (!kf.isEnd && kf.frame > _maxKeyFrame) {
                                _maxKeyFrame = kf.frame;
                            }
                        }
                    }
                }

                //#133: The document can be larger than the maxKeyFrame we found.
                _maxKeyFrame = Math.max(_maxKeyFrame, _getDocumentHeight());

                //Now process all data-end keyframes.
                skrollableIndex = 0;
                skrollablesLength = _skrollables.length;

                for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
                    skrollable = _skrollables[skrollableIndex];
                    keyFrames = skrollable.keyFrames;

                    keyFrameIndex = 0;
                    keyFramesLength = keyFrames.length;

                    for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
                        kf = keyFrames[keyFrameIndex];

                        constantValue = processedConstants[kf.constant] || 0;

                        if (kf.isEnd) {
                            kf.frame = _maxKeyFrame - kf.offset + constantValue;
                        }
                    }

                    skrollable.keyFrames.sort(_keyFrameComparator);
                }
            };

            /**
             * Calculates and sets the style properties for the element at the given frame.
             * @param fakeFrame The frame to render at when smooth scrolling is enabled.
             * @param actualFrame The actual frame we are at.
             */
            var _calcSteps = function (fakeFrame, actualFrame) {
                //Iterate over all skrollables.
                var skrollableIndex = 0;
                var skrollablesLength = _skrollables.length;

                for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
                    var skrollable = _skrollables[skrollableIndex];
                    var element = skrollable.element;
                    var frame = skrollable.smoothScrolling ? fakeFrame : actualFrame;
                    var frames = skrollable.keyFrames;
                    var framesLength = frames.length;
                    var firstFrame = frames[0];
                    var lastFrame = frames[frames.length - 1];
                    var beforeFirst = frame < firstFrame.frame;
                    var afterLast = frame > lastFrame.frame;
                    var firstOrLastFrame = beforeFirst ? firstFrame : lastFrame;
                    var emitEvents = skrollable.emitEvents;
                    var lastFrameIndex = skrollable.lastFrameIndex;
                    var key;
                    var value;

                    //If we are before/after the first/last frame, set the styles according to the given edge strategy.
                    if (beforeFirst || afterLast) {
                        //Check if we already handled this edge case last time.
                        //Note: using setScrollTop it's possible that we jumped from one edge to the other.
                        if (beforeFirst && skrollable.edge === -1 || afterLast && skrollable.edge === 1) {
                            continue;
                        }

                        //Add the skrollr-before or -after class.
                        if (beforeFirst) {
                            _updateClass(element, [SKROLLABLE_BEFORE_CLASS], [SKROLLABLE_AFTER_CLASS, SKROLLABLE_BETWEEN_CLASS]);

                            //This handles the special case where we exit the first keyframe.
                            if (emitEvents && lastFrameIndex > -1) {
                                _emitEvent(element, firstFrame.eventType, _direction);
                                skrollable.lastFrameIndex = -1;
                            }
                        } else {
                            _updateClass(element, [SKROLLABLE_AFTER_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_BETWEEN_CLASS]);

                            //This handles the special case where we exit the last keyframe.
                            if (emitEvents && lastFrameIndex < framesLength) {
                                _emitEvent(element, lastFrame.eventType, _direction);
                                skrollable.lastFrameIndex = framesLength;
                            }
                        }

                        //Remember that we handled the edge case (before/after the first/last keyframe).
                        skrollable.edge = beforeFirst ? -1 : 1;

                        switch (skrollable.edgeStrategy) {
                            case 'reset':
                                _reset(element);
                                continue;
                            case 'ease':
                                //Handle this case like it would be exactly at first/last keyframe and just pass it on.
                                frame = firstOrLastFrame.frame;
                                break;
                            default:
                            case 'set':
                                var props = firstOrLastFrame.props;

                                for (key in props) {
                                    if (hasProp.call(props, key)) {
                                        value = _interpolateString(props[key].value);

                                        //Set style or attribute.
                                        if (key.indexOf('@') === 0) {
                                            element.setAttribute(key.substr(1), value);
                                        } else {
                                            skrollr.setStyle(element, key, value);
                                        }
                                    }
                                }

                                continue;
                        }
                    } else {
                        //Did we handle an edge last time?
                        if (skrollable.edge !== 0) {
                            _updateClass(element, [SKROLLABLE_CLASS, SKROLLABLE_BETWEEN_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_AFTER_CLASS]);
                            skrollable.edge = 0;
                        }
                    }

                    //Find out between which two key frames we are right now.
                    var keyFrameIndex = 0;

                    for (; keyFrameIndex < framesLength - 1; keyFrameIndex++) {
                        if (frame >= frames[keyFrameIndex].frame && frame <= frames[keyFrameIndex + 1].frame) {
                            var left = frames[keyFrameIndex];
                            var right = frames[keyFrameIndex + 1];

                            for (key in left.props) {
                                if (hasProp.call(left.props, key)) {
                                    var progress = (frame - left.frame) / (right.frame - left.frame);

                                    //Transform the current progress using the given easing function.
                                    progress = left.props[key].easing(progress);

                                    //Interpolate between the two values
                                    value = _calcInterpolation(left.props[key].value, right.props[key].value, progress);

                                    value = _interpolateString(value);

                                    //Set style or attribute.
                                    if (key.indexOf('@') === 0) {
                                        element.setAttribute(key.substr(1), value);
                                    } else {
                                        skrollr.setStyle(element, key, value);
                                    }
                                }
                            }

                            //Are events enabled on this element?
                            //This code handles the usual cases of scrolling through different keyframes.
                            //The special cases of before first and after last keyframe are handled above.
                            if (emitEvents) {
                                //Did we pass a new keyframe?
                                if (lastFrameIndex !== keyFrameIndex) {
                                    if (_direction === 'down') {
                                        _emitEvent(element, left.eventType, _direction);
                                    } else {
                                        _emitEvent(element, right.eventType, _direction);
                                    }

                                    skrollable.lastFrameIndex = keyFrameIndex;
                                }
                            }

                            break;
                        }
                    }
                }
            };

            /**
             * Renders all elements.
             */
            var _render = function () {
                if (_requestReflow) {
                    _requestReflow = false;
                    _reflow();
                }

                //We may render something else than the actual scrollbar position.
                var renderTop = _instance.getScrollTop();

                //If there's an animation, which ends in current render call, call the callback after rendering.
                var afterAnimationCallback;
                var now = _now();
                var progress;

                //Before actually rendering handle the scroll animation, if any.
                if (_scrollAnimation) {
                    //It's over
                    if (now >= _scrollAnimation.endTime) {
                        renderTop = _scrollAnimation.targetTop;
                        afterAnimationCallback = _scrollAnimation.done;
                        _scrollAnimation = undefined;
                    } else {
                        //Map the current progress to the new progress using given easing function.
                        progress = _scrollAnimation.easing((now - _scrollAnimation.startTime) / _scrollAnimation.duration);

                        renderTop = (_scrollAnimation.startTop + progress * _scrollAnimation.topDiff) | 0;
                    }

                    _instance.setScrollTop(renderTop, true);
                }
                //Smooth scrolling only if there's no animation running and if we're not forcing the rendering.
                else if (!_forceRender) {
                    var smoothScrollingDiff = _smoothScrolling.targetTop - renderTop;

                    //The user scrolled, start new smooth scrolling.
                    if (smoothScrollingDiff) {
                        _smoothScrolling = {
                            startTop: _lastTop,
                            topDiff: renderTop - _lastTop,
                            targetTop: renderTop,
                            startTime: _lastRenderCall,
                            endTime: _lastRenderCall + _smoothScrollingDuration
                        };
                    }

                    //Interpolate the internal scroll position (not the actual scrollbar).
                    if (now <= _smoothScrolling.endTime) {
                        //Map the current progress to the new progress using easing function.
                        progress = easings.sqrt((now - _smoothScrolling.startTime) / _smoothScrollingDuration);

                        renderTop = (_smoothScrolling.startTop + progress * _smoothScrolling.topDiff) | 0;
                    }
                }

                //Did the scroll position even change?
                if (_forceRender || _lastTop !== renderTop) {
                    //Remember in which direction are we scrolling?
                    _direction = (renderTop > _lastTop) ? 'down' : (renderTop < _lastTop ? 'up' : _direction);

                    _forceRender = false;

                    var listenerParams = {
                        curTop: renderTop,
                        lastTop: _lastTop,
                        maxTop: _maxKeyFrame,
                        direction: _direction
                    };

                    //Tell the listener we are about to render.
                    var continueRendering = _listeners.beforerender && _listeners.beforerender.call(_instance, listenerParams);

                    //The beforerender listener function is able the cancel rendering.
                    if (continueRendering !== false) {
                        //Now actually interpolate all the styles.
                        _calcSteps(renderTop, _instance.getScrollTop());

                        //That's were we actually "scroll" on mobile.
                        if (_isMobile && _skrollrBody) {
                            //Set the transform ("scroll it").
                            skrollr.setStyle(_skrollrBody, 'transform', 'translate(0, ' + -(_mobileOffset) + 'px) ' + _translateZ);
                        }

                        //Remember when we last rendered.
                        _lastTop = renderTop;

                        if (_listeners.render) {
                            _listeners.render.call(_instance, listenerParams);
                        }
                    }

                    if (afterAnimationCallback) {
                        afterAnimationCallback.call(_instance, false);
                    }
                }

                _lastRenderCall = now;
            };

            /**
             * Parses the properties for each key frame of the given skrollable.
             */
            var _parseProps = function (skrollable) {
                //Iterate over all key frames
                var keyFrameIndex = 0;
                var keyFramesLength = skrollable.keyFrames.length;

                for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
                    var frame = skrollable.keyFrames[keyFrameIndex];
                    var easing;
                    var value;
                    var prop;
                    var props = {};

                    var match;

                    while ((match = rxPropValue.exec(frame.props)) !== null) {
                        prop = match[1];
                        value = match[2];

                        easing = prop.match(rxPropEasing);

                        //Is there an easing specified for this prop?
                        if (easing !== null) {
                            prop = easing[1];
                            easing = easing[2];
                        } else {
                            easing = DEFAULT_EASING;
                        }

                        //Exclamation point at first position forces the value to be taken literal.
                        value = value.indexOf('!') ? _parseProp(value) : [value.slice(1)];

                        //Save the prop for this key frame with his value and easing function
                        props[prop] = {
                            value: value,
                            easing: easings[easing]
                        };
                    }

                    frame.props = props;
                }
            };

            /**
             * Parses a value extracting numeric values and generating a format string
             * for later interpolation of the new values in old string.
             *
             * @param val The CSS value to be parsed.
             * @return Something like ["rgba(?%,?%, ?%,?)", 100, 50, 0, .7]
             * where the first element is the format string later used
             * and all following elements are the numeric value.
             */
            var _parseProp = function (val) {
                var numbers = [];

                //One special case, where floats don't work.
                //We replace all occurences of rgba colors
                //which don't use percentage notation with the percentage notation.
                rxRGBAIntegerColor.lastIndex = 0;
                val = val.replace(rxRGBAIntegerColor, function (rgba) {
                    return rgba.replace(rxNumericValue, function (n) {
                        return n / 255 * 100 + '%';
                    });
                });

                //Handle prefixing of "gradient" values.
                //For now only the prefixed value will be set. Unprefixed isn't supported anyway.
                if (theDashedCSSPrefix) {
                    rxGradient.lastIndex = 0;
                    val = val.replace(rxGradient, function (s) {
                        return theDashedCSSPrefix + s;
                    });
                }

                //Now parse ANY number inside this string and create a format string.
                val = val.replace(rxNumericValue, function (n) {
                    numbers.push(+n);
                    return '{?}';
                });

                //Add the formatstring as first value.
                numbers.unshift(val);

                return numbers;
            };

            /**
             * Fills the key frames with missing left and right hand properties.
             * If key frame 1 has property X and key frame 2 is missing X,
             * but key frame 3 has X again, then we need to assign X to key frame 2 too.
             *
             * @param sk A skrollable.
             */
            var _fillProps = function (sk) {
                //Will collect the properties key frame by key frame
                var propList = {};
                var keyFrameIndex;
                var keyFramesLength;

                //Iterate over all key frames from left to right
                keyFrameIndex = 0;
                keyFramesLength = sk.keyFrames.length;

                for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
                    _fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);
                }

                //Now do the same from right to fill the last gaps

                propList = {};

                //Iterate over all key frames from right to left
                keyFrameIndex = sk.keyFrames.length - 1;

                for (; keyFrameIndex >= 0; keyFrameIndex--) {
                    _fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);
                }
            };

            var _fillPropForFrame = function (frame, propList) {
                var key;

                //For each key frame iterate over all right hand properties and assign them,
                //but only if the current key frame doesn't have the property by itself
                for (key in propList) {
                    //The current frame misses this property, so assign it.
                    if (!hasProp.call(frame.props, key)) {
                        frame.props[key] = propList[key];
                    }
                }

                //Iterate over all props of the current frame and collect them
                for (key in frame.props) {
                    propList[key] = frame.props[key];
                }
            };

            /**
             * Calculates the new values for two given values array.
             */
            var _calcInterpolation = function (val1, val2, progress) {
                var valueIndex;
                var val1Length = val1.length;

                //They both need to have the same length
                if (val1Length !== val2.length) {
                    throw 'Can\'t interpolate between "' + val1[0] + '" and "' + val2[0] + '"';
                }

                //Add the format string as first element.
                var interpolated = [val1[0]];

                valueIndex = 1;

                for (; valueIndex < val1Length; valueIndex++) {
                    //That's the line where the two numbers are actually interpolated.
                    interpolated[valueIndex] = val1[valueIndex] + ((val2[valueIndex] - val1[valueIndex]) * progress);
                }

                return interpolated;
            };

            /**
             * Interpolates the numeric values into the format string.
             */
            var _interpolateString = function (val) {
                var valueIndex = 1;

                rxInterpolateString.lastIndex = 0;

                return val[0].replace(rxInterpolateString, function () {
                    return val[valueIndex++];
                });
            };

            /**
             * Resets the class and style attribute to what it was before skrollr manipulated the element.
             * Also remembers the values it had before reseting, in order to undo the reset.
             */
            var _reset = function (elements, undo) {
                //We accept a single element or an array of elements.
                elements = [].concat(elements);

                var skrollable;
                var element;
                var elementsIndex = 0;
                var elementsLength = elements.length;

                for (; elementsIndex < elementsLength; elementsIndex++) {
                    element = elements[elementsIndex];
                    skrollable = _skrollables[element[SKROLLABLE_ID_DOM_PROPERTY]];

                    //Couldn't find the skrollable for this DOM element.
                    if (!skrollable) {
                        continue;
                    }

                    if (undo) {
                        //Reset class and style to the "dirty" (set by skrollr) values.
                        element.style.cssText = skrollable.dirtyStyleAttr;
                        _updateClass(element, skrollable.dirtyClassAttr);
                    } else {
                        //Remember the "dirty" (set by skrollr) class and style.
                        skrollable.dirtyStyleAttr = element.style.cssText;
                        skrollable.dirtyClassAttr = _getClass(element);

                        //Reset class and style to what it originally was.
                        element.style.cssText = skrollable.styleAttr;
                        _updateClass(element, skrollable.classAttr);
                    }
                }
            };

            /**
             * Detects support for 3d transforms by applying it to the skrollr-body.
             */
            var _detect3DTransforms = function () {
                _translateZ = 'translateZ(0)';
                skrollr.setStyle(_skrollrBody, 'transform', _translateZ);

                var computedStyle = getStyle(_skrollrBody);
                var computedTransform = computedStyle.getPropertyValue('transform');
                var computedTransformWithPrefix = computedStyle.getPropertyValue(theDashedCSSPrefix + 'transform');
                var has3D = (computedTransform && computedTransform !== 'none') || (computedTransformWithPrefix && computedTransformWithPrefix !== 'none');

                if (!has3D) {
                    _translateZ = '';
                }
            };

            /**
             * Set the CSS property on the given element. Sets prefixed properties as well.
             */
            skrollr.setStyle = function (el, prop, val) {
                var style = el.style;

                //Camel case.
                prop = prop.replace(rxCamelCase, rxCamelCaseFn).replace('-', '');

                //Make sure z-index gets a <integer>.
                //This is the only <integer> case we need to handle.
                if (prop === 'zIndex') {
                    if (isNaN(val)) {
                        //If it's not a number, don't touch it.
                        //It could for example be "auto" (#351).
                        style[prop] = val;
                    } else {
                        //Floor the number.
                        style[prop] = '' + (val | 0);
                    }
                }
                //#64: "float" can't be set across browsers. Needs to use "cssFloat" for all except IE.
                else if (prop === 'float') {
                    style.styleFloat = style.cssFloat = val;
                }
                else {
                    //Need try-catch for old IE.
                    try {
                        //Set prefixed property if there's a prefix.
                        if (theCSSPrefix) {
                            style[theCSSPrefix + prop.slice(0, 1).toUpperCase() + prop.slice(1)] = val;
                        }

                        //Set unprefixed.
                        style[prop] = val;
                    } catch (ignore) {
                    }
                }
            };

            /**
             * Cross browser event handling.
             */
            var _addEvent = skrollr.addEvent = function (element, names, callback) {
                var intermediate = function (e) {
                    //Normalize IE event stuff.
                    e = e || window.event;

                    if (!e.target) {
                        e.target = e.srcElement;
                    }

                    if (!e.preventDefault) {
                        e.preventDefault = function () {
                            e.returnValue = false;
                            e.defaultPrevented = true;
                        };
                    }

                    return callback.call(this, e);
                };

                names = names.split(' ');

                var name;
                var nameCounter = 0;
                var namesLength = names.length;

                for (; nameCounter < namesLength; nameCounter++) {
                    name = names[nameCounter];

                    if (element.addEventListener) {
                        element.addEventListener(name, callback, false);
                    } else {
                        element.attachEvent('on' + name, intermediate);
                    }

                    //Remember the events to be able to flush them later.
                    _registeredEvents.push({
                        element: element,
                        name: name,
                        listener: callback
                    });
                }
            };

            var _removeEvent = skrollr.removeEvent = function (element, names, callback) {
                names = names.split(' ');

                var nameCounter = 0;
                var namesLength = names.length;

                for (; nameCounter < namesLength; nameCounter++) {
                    if (element.removeEventListener) {
                        element.removeEventListener(names[nameCounter], callback, false);
                    } else {
                        element.detachEvent('on' + names[nameCounter], callback);
                    }
                }
            };

            var _removeAllEvents = function () {
                var eventData;
                var eventCounter = 0;
                var eventsLength = _registeredEvents.length;

                for (; eventCounter < eventsLength; eventCounter++) {
                    eventData = _registeredEvents[eventCounter];

                    _removeEvent(eventData.element, eventData.name, eventData.listener);
                }

                _registeredEvents = [];
            };

            var _emitEvent = function (element, name, direction) {
                if (_listeners.keyframe) {
                    _listeners.keyframe.call(_instance, element, name, direction);
                }
            };

            var _reflow = function () {
                var pos = _instance.getScrollTop();

                //Will be recalculated by _updateDependentKeyFrames.
                _maxKeyFrame = 0;

                if (_forceHeight && !_isMobile) {
                    //un-"force" the height to not mess with the calculations in _updateDependentKeyFrames (#216).
                    body.style.height = '';
                }

                _updateDependentKeyFrames();

                if (_forceHeight && !_isMobile) {
                    //"force" the height.
                    body.style.height = (_maxKeyFrame + documentElement.clientHeight) + 'px';
                }

                //The scroll offset may now be larger than needed (on desktop the browser/os prevents scrolling farther than the bottom).
                if (_isMobile) {
                    _instance.setScrollTop(Math.min(_instance.getScrollTop(), _maxKeyFrame));
                } else {
                    //Remember and reset the scroll pos (#217).
                    _instance.setScrollTop(pos, true);
                }

                _forceRender = true;
            };

            /*
             * Returns a copy of the constants object where all functions and strings have been evaluated.
             */
            var _processConstants = function () {
                var viewportHeight = documentElement.clientHeight;
                var copy = {};
                var prop;
                var value;

                for (prop in _constants) {
                    value = _constants[prop];

                    if (typeof value === 'function') {
                        value = value.call(_instance);
                    }
                    //Percentage offset.
                    else if ((/p$/).test(value)) {
                        value = (value.slice(0, -1) / 100) * viewportHeight;
                    }

                    copy[prop] = value;
                }

                return copy;
            };

            /*
             * Returns the height of the document.
             */
            var _getDocumentHeight = function () {
                var skrollrBodyHeight = 0;
                var bodyHeight;

                if (_skrollrBody) {
                    skrollrBodyHeight = Math.max(_skrollrBody.offsetHeight, _skrollrBody.scrollHeight);
                }

                bodyHeight = Math.max(skrollrBodyHeight, body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight);

                return bodyHeight - documentElement.clientHeight;
            };

            /**
             * Returns a string of space separated classnames for the current element.
             * Works with SVG as well.
             */
            var _getClass = function (element) {
                var prop = 'className';

                //SVG support by using className.baseVal instead of just className.
                if (window.SVGElement && element instanceof window.SVGElement) {
                    element = element[prop];
                    prop = 'baseVal';
                }

                return element[prop];
            };

            /**
             * Adds and removes a CSS classes.
             * Works with SVG as well.
             * add and remove are arrays of strings,
             * or if remove is ommited add is a string and overwrites all classes.
             */
            var _updateClass = function (element, add, remove) {
                var prop = 'className';

                //SVG support by using className.baseVal instead of just className.
                if (window.SVGElement && element instanceof window.SVGElement) {
                    element = element[prop];
                    prop = 'baseVal';
                }

                //When remove is ommited, we want to overwrite/set the classes.
                if (remove === undefined) {
                    element[prop] = add;
                    return;
                }

                //Cache current classes. We will work on a string before passing back to DOM.
                var val = element[prop];

                //All classes to be removed.
                var classRemoveIndex = 0;
                var removeLength = remove.length;

                for (; classRemoveIndex < removeLength; classRemoveIndex++) {
                    val = _untrim(val).replace(_untrim(remove[classRemoveIndex]), ' ');
                }

                val = _trim(val);

                //All classes to be added.
                var classAddIndex = 0;
                var addLength = add.length;

                for (; classAddIndex < addLength; classAddIndex++) {
                    //Only add if el not already has class.
                    if (_untrim(val).indexOf(_untrim(add[classAddIndex])) === -1) {
                        val += ' ' + add[classAddIndex];
                    }
                }

                element[prop] = _trim(val);
            };

            var _trim = function (a) {
                return a.replace(rxTrim, '');
            };

            /**
             * Adds a space before and after the string.
             */
            var _untrim = function (a) {
                return ' ' + a + ' ';
            };

            var _now = Date.now || function () {
                return +new Date();
            };

            var _keyFrameComparator = function (a, b) {
                return a.frame - b.frame;
            };

            /*
             * Private variables.
             */

            //Singleton
            var _instance;

            /*
             A list of all elements which should be animated associated with their the metadata.
             Exmaple skrollable with two key frames animating from 100px width to 20px:
             
             skrollable = {
             element: <the DOM element>,
             styleAttr: <style attribute of the element before skrollr>,
             classAttr: <class attribute of the element before skrollr>,
             keyFrames: [
             {
             frame: 100,
             props: {
             width: {
             value: ['{?}px', 100],
             easing: <reference to easing function>
             }
             },
             mode: "absolute"
             },
             {
             frame: 200,
             props: {
             width: {
             value: ['{?}px', 20],
             easing: <reference to easing function>
             }
             },
             mode: "absolute"
             }
             ]
             };
             */
            var _skrollables;

            var _skrollrBody;

            var _listeners;
            var _forceHeight;
            var _maxKeyFrame = 0;

            var _scale = 1;
            var _constants;

            var _mobileDeceleration;

            //Current direction (up/down).
            var _direction = 'down';

            //The last top offset value. Needed to determine direction.
            var _lastTop = -1;

            //The last time we called the render method (doesn't mean we rendered!).
            var _lastRenderCall = _now();

            //For detecting if it actually resized (#271).
            var _lastViewportWidth = 0;
            var _lastViewportHeight = 0;

            var _requestReflow = false;

            //Will contain data about a running scrollbar animation, if any.
            var _scrollAnimation;

            var _smoothScrollingEnabled;

            var _smoothScrollingDuration;

            //Will contain settins for smooth scrolling if enabled.
            var _smoothScrolling;

            //Can be set by any operation/event to force rendering even if the scrollbar didn't move.
            var _forceRender;

            //Each skrollable gets an unique ID incremented for each skrollable.
            //The ID is the index in the _skrollables array.
            var _skrollableIdCounter = 0;

            var _edgeStrategy;


            //Mobile specific vars. Will be stripped by UglifyJS when not in use.
            var _isMobile = false;

            //The virtual scroll offset when using mobile scrolling.
            var _mobileOffset = 0;

            //If the browser supports 3d transforms, this will be filled with 'translateZ(0)' (empty string otherwise).
            var _translateZ;

            //Will contain data about registered events by skrollr.
            var _registeredEvents = [];

            //Animation frame id returned by RequestAnimationFrame (or timeout when RAF is not supported).
            var _animFrame;

            //Expose skrollr as either a global variable or a require.js module.
            if (typeof define === 'function' && define.amd) {
                define([], function () {
                    return skrollr;
                });
            } else if (typeof module !== 'undefined' && module.exports) {
                module.exports = skrollr;
            } else {
                window.skrollr = skrollr;
            }

        }(window, document));
        /*vegas background slideshow*/

        (function ($) {
            'use strict';

            var defaults = {
                slide: 0,
                delay: 5000,
                preload: false,
                preloadImage: false,
                preloadVideo: false,
                timer: true,
                overlay: true,
                autoplay: true,
                shuffle: false,
                cover: true,
                color: null,
                align: 'center',
                valign: 'center',
                transition: 'random',
                transitionDuration: 1000,
                transitionRegister: [],
                animation: null,
                animationDuration: 'auto',
                animationRegister: [],
                init: function () {
                },
                play: function () {
                },
                pause: function () {
                },
                walk: function () {
                },
                slides: [
                    // {   
                    //  src:                null,
                    //  color:              null,
                    //  delay:              null,
                    //  align:              null,
                    //  valign:             null,
                    //  transition:         null,
                    //  transitionDuration: null,
                    //  animation:          null,
                    //  animationDuration:  null,
                    //  cover:              true,
                    //  video: {
                    //      src: [],
                    //      mute: true,
                    //      loop: true
                    // }
                    // ...
                ]
            };

            var videoCache = {};

            var Vegas = function (elmt, options) {
                this.elmt = elmt;
                this.settings = $.extend({}, defaults, $.vegas.defaults, options);
                this.slide = this.settings.slide;
                this.total = this.settings.slides.length;
                this.noshow = this.total < 2;
                this.paused = !this.settings.autoplay || this.noshow;
                this.$elmt = $(elmt);
                this.$timer = null;
                this.$overlay = null;
                this.$slide = null;
                this.timeout = null;

                this.transitions = [
                    'fade', 'fade2',
                    'blur', 'blur2',
                    'flash', 'flash2',
                    'negative', 'negative2',
                    'burn', 'burn2',
                    'slideLeft', 'slideLeft2',
                    'slideRight', 'slideRight2',
                    'slideUp', 'slideUp2',
                    'slideDown', 'slideDown2',
                    'zoomIn', 'zoomIn2',
                    'zoomOut', 'zoomOut2',
                    'swirlLeft', 'swirlLeft2',
                    'swirlRight', 'swirlRight2'
                ];

                this.animations = [
                    'kenburns',
                    'kenburnsLeft', 'kenburnsRight',
                    'kenburnsUp', 'kenburnsUpLeft', 'kenburnsUpRight',
                    'kenburnsDown', 'kenburnsDownLeft', 'kenburnsDownRight'
                ];

                if (this.settings.transitionRegister instanceof Array === false) {
                    this.settings.transitionRegister = [this.settings.transitionRegister];
                }

                if (this.settings.animationRegister instanceof Array === false) {
                    this.settings.animationRegister = [this.settings.animationRegister];
                }

                this.transitions = this.transitions.concat(this.settings.transitionRegister);
                this.animations = this.animations.concat(this.settings.animationRegister);

                this.support = {
                    objectFit: 'objectFit'  in document.body.style,
                    transition: 'transition' in document.body.style || 'WebkitTransition' in document.body.style,
                    video: $.vegas.isVideoCompatible()
                };

                if (this.settings.shuffle === true) {
                    this.shuffle();
                }

                this._init();
            };

            Vegas.prototype = {
                _init: function () {
                    var $wrapper,
                            $overlay,
                            $timer,
                            isBody = this.elmt.tagName === 'BODY',
                            timer = this.settings.timer,
                            overlay = this.settings.overlay,
                            self = this;

                    // Preloading
                    this._preload();

                    // Wrapper with content
                    if (!isBody) {
                        this.$elmt.css('height', this.$elmt.css('height'));

                        $wrapper = $('<div class="vegas-wrapper">')
                                .css('overflow', this.$elmt.css('overflow'))
                                .css('padding', this.$elmt.css('padding'));

                        // Some browsers don't compute padding shorthand
                        if (!this.$elmt.css('padding')) {
                            $wrapper
                                    .css('padding-top', this.$elmt.css('padding-top'))
                                    .css('padding-bottom', this.$elmt.css('padding-bottom'))
                                    .css('padding-left', this.$elmt.css('padding-left'))
                                    .css('padding-right', this.$elmt.css('padding-right'));
                        }

                        this.$elmt.clone(true).children().appendTo($wrapper);
                        this.elmt.innerHTML = '';
                    }

                    // Timer
                    if (timer && this.support.transition) {
                        $timer = $('<div class="vegas-timer"><div class="vegas-timer-progress">');
                        this.$timer = $timer;
                        this.$elmt.prepend($timer);
                    }

                    // Overlay
                    if (overlay) {
                        $overlay = $('<div class="vegas-overlay">');

                        if (typeof overlay === 'string') {
                            $overlay.css('background-image', 'url(' + overlay + ')');
                        }

                        this.$overlay = $overlay;
                        this.$elmt.prepend($overlay);
                    }

                    // Container
                    this.$elmt.addClass('vegas-container');

                    if (!isBody) {
                        this.$elmt.append($wrapper);
                    }

                    setTimeout(function () {
                        self.trigger('init');
                        self._goto(self.slide);

                        if (self.settings.autoplay) {
                            self.trigger('play');
                        }
                    }, 1);
                },
                _preload: function () {
                    var video, img, i;

                    for (i = 0; i < this.settings.slides.length; i++) {
                        if (this.settings.preload || this.settings.preloadImages) {
                            if (this.settings.slides[i].src) {
                                img = new Image();
                                img.src = this.settings.slides[i].src;
                            }
                        }

                        if (this.settings.preload || this.settings.preloadVideos) {
                            if (this.support.video && this.settings.slides[i].video) {
                                if (this.settings.slides[i].video instanceof Array) {
                                    video = this._video(this.settings.slides[i].video);
                                } else {
                                    video = this._video(this.settings.slides[i].video.src);
                                }
                            }
                        }
                    }
                },
                _random: function (array) {
                    return array[Math.floor(Math.random() * (array.length - 1))];
                },
                _slideShow: function () {
                    var self = this;

                    if (this.total > 1 && !this.paused && !this.noshow) {
                        this.timeout = setTimeout(function () {
                            self.next();
                        }, this._options('delay'));
                    }
                },
                _timer: function (state) {
                    var self = this;

                    clearTimeout(this.timeout);

                    if (!this.$timer) {
                        return;
                    }

                    this.$timer
                            .removeClass('vegas-timer-running')
                            .find('div')
                            .css('transition-duration', '0ms');

                    if (this.paused || this.noshow) {
                        return;
                    }

                    if (state) {
                        setTimeout(function () {
                            self.$timer
                                    .addClass('vegas-timer-running')
                                    .find('div')
                                    .css('transition-duration', self._options('delay') - 100 + 'ms');
                        }, 100);
                    }
                },
                _video: function (srcs) {
                    var video,
                            source,
                            cacheKey = srcs.toString();

                    if (videoCache[cacheKey]) {
                        return videoCache[cacheKey];
                    }

                    if (srcs instanceof Array === false) {
                        srcs = [srcs];
                    }

                    video = document.createElement('video');
                    video.preload = true;

                    srcs.forEach(function (src) {
                        source = document.createElement('source');
                        source.src = src;
                        video.appendChild(source);
                    });

                    videoCache[cacheKey] = video;

                    return video;
                },
                _fadeOutSound: function (video, duration) {
                    var self = this,
                            delay = duration / 10,
                            volume = video.volume - 0.09;

                    if (volume > 0) {
                        video.volume = volume;

                        setTimeout(function () {
                            self._fadeOutSound(video, duration);
                        }, delay);
                    } else {
                        video.pause();
                    }
                },
                _fadeInSound: function (video, duration) {
                    var self = this,
                            delay = duration / 10,
                            volume = video.volume + 0.09;

                    if (volume < 1) {
                        video.volume = volume;

                        setTimeout(function () {
                            self._fadeInSound(video, duration);
                        }, delay);
                    }
                },
                _options: function (key, i) {
                    if (i === undefined) {
                        i = this.slide;
                    }

                    if (this.settings.slides[i][key] !== undefined) {
                        return this.settings.slides[i][key];
                    }

                    return this.settings[key];
                },
                _goto: function (nb) {
                    if (typeof this.settings.slides[nb] === 'undefined') {
                        nb = 0;
                    }

                    this.slide = nb;

                    var $slide,
                            $inner,
                            $video,
                            $slides = this.$elmt.children('.vegas-slide'),
                            src = this.settings.slides[nb].src,
                            videoSettings = this.settings.slides[nb].video,
                            delay = this._options('delay'),
                            align = this._options('align'),
                            valign = this._options('valign'),
                            color = this._options('color') || this.$elmt.css('background-color'),
                            cover = this._options('cover') ? 'cover' : 'contain',
                            self = this,
                            total = $slides.length,
                            video,
                            img;

                    var transition = this._options('transition'),
                            transitionDuration = this._options('transitionDuration'),
                            animation = this._options('animation'),
                            animationDuration = this._options('animationDuration');

                    if (transition === 'random' || transition instanceof Array) {
                        if (transition instanceof Array) {
                            transition = this._random(transition);
                        } else {
                            transition = this._random(this.transitions);
                        }
                    }

                    if (animation === 'random' || animation instanceof Array) {
                        if (animation instanceof Array) {
                            animation = this._random(animation);
                        } else {
                            animation = this._random(this.animations);
                        }
                    }

                    if (transitionDuration === 'auto' || transitionDuration > delay) {
                        transitionDuration = delay;
                    }

                    if (animationDuration === 'auto') {
                        animationDuration = delay;
                    }

                    $slide = $('<div class="vegas-slide"></div>');

                    if (this.support.transition && transition) {
                        $slide.addClass('vegas-transition-' + transition);
                    }

                    // Video

                    if (this.support.video && videoSettings) {
                        if (videoSettings instanceof Array) {
                            video = this._video(videoSettings);
                        } else {
                            video = this._video(videoSettings.src);
                        }

                        video.loop = videoSettings.loop !== undefined ? videoSettings.loop : true;
                        video.muted = videoSettings.mute !== undefined ? videoSettings.mute : true;

                        if (video.muted === false) {
                            video.volume = 0;
                            this._fadeInSound(video, transitionDuration);
                        } else {
                            video.pause();
                        }

                        $video = $(video)
                                .addClass('vegas-video')
                                .css('background-color', color);

                        if (this.support.objectFit) {
                            $video
                                    .css('object-position', align + ' ' + valign)
                                    .css('object-fit', cover)
                                    .css('width', '100%')
                                    .css('height', '100%');
                        } else if (cover === 'contain') {
                            $video
                                    .css('width', '100%')
                                    .css('height', '100%');
                        }

                        $slide.append($video);

                        // Image

                    } else {
                        img = new Image();

                        $inner = $('<div class="vegas-slide-inner"></div>')
                                .css('background-image', 'url(' + src + ')')
                                .css('background-color', color)
                                .css('background-position', align + ' ' + valign)
                                .css('background-size', cover);

                        if (this.support.transition && animation) {
                            $inner
                                    .addClass('vegas-animation-' + animation)
                                    .css('animation-duration', animationDuration + 'ms');
                        }

                        $slide.append($inner);
                    }

                    if (!this.support.transition) {
                        $slide.css('display', 'none');
                    }

                    if (total) {
                        $slides.eq(total - 1).after($slide);
                    } else {
                        this.$elmt.prepend($slide);
                    }

                    self._timer(false);

                    function go() {
                        self._timer(true);

                        setTimeout(function () {
                            if (transition) {
                                if (self.support.transition) {
                                    $slides
                                            .css('transition', 'all ' + transitionDuration + 'ms')
                                            .addClass('vegas-transition-' + transition + '-out');

                                    $slides.each(function () {
                                        var video = $slides.find('video').get(0);

                                        if (video) {
                                            video.volume = 1;
                                            self._fadeOutSound(video, transitionDuration);
                                        }
                                    });

                                    $slide
                                            .css('transition', 'all ' + transitionDuration + 'ms')
                                            .addClass('vegas-transition-' + transition + '-in');
                                } else {
                                    $slide.fadeIn(transitionDuration);
                                }
                            }

                            for (var i = 0; i < $slides.length - 4; i++) {
                                $slides.eq(i).remove();
                            }

                            self.trigger('walk');
                            self._slideShow();
                        }, 100);
                    }
                    if (video) {
                        if (video.readyState === 4) {
                            video.currentTime = 0;
                        }

                        video.play();
                        go();
                    } else {
                        img.src = src;
                        img.onload = go;
                    }
                },
                shuffle: function () {
                    var temp,
                            rand;

                    for (var i = this.total - 1; i > 0; i--) {
                        rand = Math.floor(Math.random() * (i + 1));
                        temp = this.settings.slides[i];

                        this.settings.slides[i] = this.settings.slides[rand];
                        this.settings.slides[rand] = temp;
                    }
                },
                play: function () {
                    if (this.paused) {
                        this.paused = false;
                        this.next();
                        this.trigger('play');
                    }
                },
                pause: function () {
                    this._timer(false);
                    this.paused = true;
                    this.trigger('pause');
                },
                toggle: function () {
                    if (this.paused) {
                        this.play();
                    } else {
                        this.pause();
                    }
                },
                playing: function () {
                    return !this.paused && !this.noshow;
                },
                current: function (advanced) {
                    if (advanced) {
                        return {
                            slide: this.slide,
                            data: this.settings.slides[this.slide]
                        };
                    }
                    return this.slide;
                },
                jump: function (nb) {
                    if (nb < 0 || nb > this.total - 1 || nb === this.slide) {
                        return;
                    }

                    this.slide = nb;
                    this._goto(this.slide);
                },
                next: function () {
                    this.slide++;

                    if (this.slide >= this.total) {
                        this.slide = 0;
                    }

                    this._goto(this.slide);
                },
                previous: function () {
                    this.slide--;

                    if (this.slide < 0) {
                        this.slide = this.total - 1;
                    }

                    this._goto(this.slide);
                },
                trigger: function (fn) {
                    var params = [];

                    if (fn === 'init') {
                        params = [this.settings];
                    } else {
                        params = [
                            this.slide,
                            this.settings.slides[this.slide]
                        ];
                    }

                    this.$elmt.trigger('vegas' + fn, params);

                    if (typeof this.settings[fn] === 'function') {
                        this.settings[fn].apply(this.$elmt, params);
                    }
                },
                options: function (key, value) {
                    var oldSlides = this.settings.slides.slice();

                    if (typeof key === 'object') {
                        this.settings = $.extend({}, defaults, $.vegas.defaults, key);
                    } else if (typeof key === 'string') {
                        if (value === undefined) {
                            return this.settings[key];
                        }
                        this.settings[key] = value;
                    } else {
                        return this.settings;
                    }

                    // In case slides have changed
                    if (this.settings.slides !== oldSlides) {
                        this.total = this.settings.slides.length;
                        this.noshow = this.total < 2;
                        this._preload();
                    }
                },
                destroy: function () {
                    clearTimeout(this.timeout);

                    this.$elmt.removeClass('vegas-container');
                    this.$elmt.find('> .vegas-slide').remove();
                    this.$elmt.find('> .vegas-wrapper').clone(true).children().appendTo(this.$elmt);
                    this.$elmt.find('> .vegas-wrapper').remove();

                    if (this.settings.timer) {
                        this.$timer.remove();
                    }

                    if (this.settings.overlay) {
                        this.$overlay.remove();
                    }

                    this.elmt._vegas = null;
                }
            };

            $.fn.vegas = function (options) {
                var args = arguments,
                        error = false,
                        returns;

                if (options === undefined || typeof options === 'object') {
                    return this.each(function () {
                        if (!this._vegas) {
                            this._vegas = new Vegas(this, options);
                        }
                    });
                } else if (typeof options === 'string') {
                    this.each(function () {
                        var instance = this._vegas;

                        if (!instance) {
                            throw new Error('No Vegas applied to this element.');
                        }

                        if (typeof instance[options] === 'function' && options[0] !== '_') {
                            returns = instance[options].apply(instance, [].slice.call(args, 1));
                        } else {
                            error = true;
                        }
                    });

                    if (error) {
                        throw new Error('No method "' + options + '" in Vegas.');
                    }

                    return returns !== undefined ? returns : this;
                }
            };

            $.vegas = {};
            $.vegas.defaults = defaults;

            $.vegas.isVideoCompatible = function () {
                return !/(Android|webOS|Phone|iPad|iPod|BlackBerry|Windows Phone)/i.test(navigator.userAgent);
            };

        })(window.jQuery || window.Zepto);



        /*smooth scroll*/
// SmoothScroll for websites v1.2.1
// Licensed under the terms of the MIT license.

// People involved
//  - Balazs Galambosi (maintainer)  
//  - Michael Herf     (Pulse Algorithm)
// --------------------------------------------
// Platform detect
// --------------------------------------------- 
        var isMobile;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            isMobile = true;
            $("html").addClass("mobile");
        } else {
            isMobile = false;
            $("html").addClass("no-mobile");
        }

        if (!isMobile) {
            (function () {

                // Scroll Variables (tweakable)
                var defaultOptions = {
                    // Scrolling Core
                    frameRate: 150, // [Hz]
                    animationTime: 600, // [px]
                    stepSize: 150, // [px]

                    // Pulse (less tweakable)
                    // ratio of "tail" to "acceleration"
                    pulseAlgorithm: true,
                    pulseScale: 6,
                    pulseNormalize: 1,
                    // Acceleration
                    accelerationDelta: 20, // 20
                    accelerationMax: 1, // 1

                    // Keyboard Settings
                    keyboardSupport: true, // option
                    arrowScroll: 50, // [px]

                    // Other
                    touchpadSupport: true,
                    fixedBackground: true,
                    excluded: ""
                };

                var options = defaultOptions;


                // Other Variables
                var isExcluded = false;
                var isFrame = false;
                var direction = {
                    x: 0,
                    y: 0
                };
                var initDone = false;
                var root = document.documentElement;
                var activeElement;
                var observer;
                var deltaBuffer = [120, 120, 120];

                var key = {
                    left: 37,
                    up: 38,
                    right: 39,
                    down: 40,
                    spacebar: 32,
                    pageup: 33,
                    pagedown: 34,
                    end: 35,
                    home: 36
                };


                /***********************************************
                 * SETTINGS
                 ***********************************************/

                var options = defaultOptions;


                /***********************************************
                 * INITIALIZE
                 ***********************************************/

                /**
                 * Tests if smooth scrolling is allowed. Shuts down everything if not.
                 */
                function initTest() {

                    var disableKeyboard = false;

                    // disable keyboard support if anything above requested it
                    if (disableKeyboard) {
                        removeEvent("keydown", keydown);
                    }

                    if (options.keyboardSupport && !disableKeyboard) {
                        addEvent("keydown", keydown);
                    }
                }

                /**
                 * Sets up scrolls array, determines if frames are involved.
                 */
                function init() {

                    if (!document.body)
                        return;

                    var body = document.body;
                    var html = document.documentElement;
                    var windowHeight = window.innerHeight;
                    var scrollHeight = body.scrollHeight;

                    // check compat mode for root element
                    root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
                    activeElement = body;

                    initTest();
                    initDone = true;

                    // Checks if this script is running in a frame
                    if (top != self) {
                        isFrame = true;
                    }

                    /**
                     * This fixes a bug where the areas left and right to
                     * the content does not trigger the onmousewheel event
                     * on some pages. e.g.: html, body { height: 100% }
                     */
                    else if (scrollHeight > windowHeight &&
                            (body.offsetHeight <= windowHeight ||
                                    html.offsetHeight <= windowHeight)) {

                        html.style.height = 'auto';
                        //setTimeout(refresh, 10);

                        // clearfix
                        if (root.offsetHeight <= windowHeight) {
                            var underlay = document.createElement("div");
                            underlay.style.clear = "both";
                            body.appendChild(underlay);
                        }
                    }

                    // disable fixed background
                    if (!options.fixedBackground && !isExcluded) {
                        body.style.backgroundAttachment = "scroll";
                        html.style.backgroundAttachment = "scroll";
                    }
                }


                /************************************************
                 * SCROLLING
                 ************************************************/

                var que = [];
                var pending = false;
                var lastScroll = +new Date;

                /**
                 * Pushes scroll actions to the scrolling queue.
                 */
                function scrollArray(elem, left, top, delay) {

                    delay || (delay = 1000);
                    directionCheck(left, top);

                    if (options.accelerationMax != 1) {
                        var now = +new Date;
                        var elapsed = now - lastScroll;
                        if (elapsed < options.accelerationDelta) {
                            var factor = (1 + (30 / elapsed)) / 2;
                            if (factor > 1) {
                                factor = Math.min(factor, options.accelerationMax);
                                left *= factor;
                                top *= factor;
                            }
                        }
                        lastScroll = +new Date;
                    }

                    // push a scroll command
                    que.push({
                        x: left,
                        y: top,
                        lastX: (left < 0) ? 0.99 : -0.99,
                        lastY: (top < 0) ? 0.99 : -0.99,
                        start: +new Date
                    });

                    // don't act if there's a pending queue
                    if (pending) {
                        return;
                    }

                    var scrollWindow = (elem === document.body);

                    var step = function (time) {

                        var now = +new Date;
                        var scrollX = 0;
                        var scrollY = 0;

                        for (var i = 0; i < que.length; i++) {

                            var item = que[i];
                            var elapsed = now - item.start;
                            var finished = (elapsed >= options.animationTime);

                            // scroll position: [0, 1]
                            var position = (finished) ? 1 : elapsed / options.animationTime;

                            // easing [optional]
                            if (options.pulseAlgorithm) {
                                position = pulse(position);
                            }

                            // only need the difference
                            var x = (item.x * position - item.lastX) >> 0;
                            var y = (item.y * position - item.lastY) >> 0;

                            // add this to the total scrolling
                            scrollX += x;
                            scrollY += y;

                            // update last values
                            item.lastX += x;
                            item.lastY += y;

                            // delete and step back if it's over
                            if (finished) {
                                que.splice(i, 1);
                                i--;
                            }
                        }

                        // scroll left and top
                        if (scrollWindow) {
                            window.scrollBy(scrollX, scrollY);
                        } else {
                            if (scrollX)
                                elem.scrollLeft += scrollX;
                            if (scrollY)
                                elem.scrollTop += scrollY;
                        }

                        // clean up if there's nothing left to do
                        if (!left && !top) {
                            que = [];
                        }

                        if (que.length) {
                            requestFrame(step, elem, (delay / options.frameRate + 1));
                        } else {
                            pending = false;
                        }
                    };

                    // start a new queue of actions
                    requestFrame(step, elem, 0);
                    pending = true;
                }


                /***********************************************
                 * EVENTS
                 ***********************************************/

                /**
                 * Mouse wheel handler.
                 * @param {Object} event
                 */
                function wheel(event) {

                    if (!initDone) {
                        init();
                    }

                    var target = event.target;
                    var overflowing = overflowingAncestor(target);

                    // use default if there's no overflowing
                    // element or default action is prevented    
                    if (!overflowing || event.defaultPrevented ||
                            isNodeName(activeElement, "embed") ||
                            (isNodeName(target, "embed") && /\.pdf/i.test(target.src))) {
                        return true;
                    }

                    var deltaX = event.wheelDeltaX || 0;
                    var deltaY = event.wheelDeltaY || 0;

                    // use wheelDelta if deltaX/Y is not available
                    if (!deltaX && !deltaY) {
                        deltaY = event.wheelDelta || 0;
                    }

                    // check if it's a touchpad scroll that should be ignored
                    if (!options.touchpadSupport && isTouchpad(deltaY)) {
                        return true;
                    }

                    // scale by step size
                    // delta is 120 most of the time
                    // synaptics seems to send 1 sometimes
                    if (Math.abs(deltaX) > 1.2) {
                        deltaX *= options.stepSize / 120;
                    }
                    if (Math.abs(deltaY) > 1.2) {
                        deltaY *= options.stepSize / 120;
                    }

                    scrollArray(overflowing, -deltaX, -deltaY);
                    event.preventDefault();
                }

                /**
                 * Keydown event handler.
                 * @param {Object} event
                 */
                function keydown(event) {

                    var target = event.target;
                    var modifier = event.ctrlKey || event.altKey || event.metaKey ||
                            (event.shiftKey && event.keyCode !== key.spacebar);

                    // do nothing if user is editing text
                    // or using a modifier key (except shift)
                    // or in a dropdown
                    if (/input|textarea|select|embed/i.test(target.nodeName) ||
                            target.isContentEditable ||
                            event.defaultPrevented ||
                            modifier) {
                        return true;
                    }
                    // spacebar should trigger button press
                    if (isNodeName(target, "button") &&
                            event.keyCode === key.spacebar) {
                        return true;
                    }

                    var shift, x = 0,
                            y = 0;
                    var elem = overflowingAncestor(activeElement);
                    var clientHeight = elem.clientHeight;

                    if (elem == document.body) {
                        clientHeight = window.innerHeight;
                    }

                    switch (event.keyCode) {
                        case key.up:
                            y = -options.arrowScroll;
                            break;
                        case key.down:
                            y = options.arrowScroll;
                            break;
                        case key.spacebar: // (+ shift)
                            shift = event.shiftKey ? 1 : -1;
                            y = -shift * clientHeight * 0.9;
                            break;
                        case key.pageup:
                            y = -clientHeight * 0.9;
                            break;
                        case key.pagedown:
                            y = clientHeight * 0.9;
                            break;
                        case key.home:
                            y = -elem.scrollTop;
                            break;
                        case key.end:
                            var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
                            y = (damt > 0) ? damt + 10 : 0;
                            break;
                        case key.left:
                            x = -options.arrowScroll;
                            break;
                        case key.right:
                            x = options.arrowScroll;
                            break;
                        default:
                            return true; // a key we don't care about
                    }

                    scrollArray(elem, x, y);
                    event.preventDefault();
                }

                /**
                 * Mousedown event only for updating activeElement
                 */
                function mousedown(event) {
                    activeElement = event.target;
                }


                /***********************************************
                 * OVERFLOW
                 ***********************************************/

                var cache = {}; // cleared out every once in while
                setInterval(function () {
                    cache = {};
                }, 10 * 1000);

                var uniqueID = (function () {
                    var i = 0;
                    return function (el) {
                        return el.uniqueID || (el.uniqueID = i++);
                    };
                })();

                function setCache(elems, overflowing) {
                    for (var i = elems.length; i--; )
                        cache[uniqueID(elems[i])] = overflowing;
                    return overflowing;
                }

                function overflowingAncestor(el) {
                    var elems = [];
                    var rootScrollHeight = root.scrollHeight;
                    do {
                        var cached = cache[uniqueID(el)];
                        if (cached) {
                            return setCache(elems, cached);
                        }
                        elems.push(el);
                        if (rootScrollHeight === el.scrollHeight) {
                            if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
                                return setCache(elems, document.body); // scrolling root in WebKit
                            }
                        } else if (el.clientHeight + 10 < el.scrollHeight) {
                            overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
                            if (overflow === "scroll" || overflow === "auto") {
                                return setCache(elems, el);
                            }
                        }
                    } while (el = el.parentNode);
                }


                /***********************************************
                 * HELPERS
                 ***********************************************/

                function addEvent(type, fn, bubble) {
                    window.addEventListener(type, fn, (bubble || false));
                }

                function removeEvent(type, fn, bubble) {
                    window.removeEventListener(type, fn, (bubble || false));
                }

                function isNodeName(el, tag) {
                    return (el.nodeName || "").toLowerCase() === tag.toLowerCase();
                }

                function directionCheck(x, y) {
                    x = (x > 0) ? 1 : -1;
                    y = (y > 0) ? 1 : -1;
                    if (direction.x !== x || direction.y !== y) {
                        direction.x = x;
                        direction.y = y;
                        que = [];
                        lastScroll = 0;
                    }
                }

                var deltaBufferTimer;

                function isTouchpad(deltaY) {
                    if (!deltaY)
                        return;
                    deltaY = Math.abs(deltaY)
                    deltaBuffer.push(deltaY);
                    deltaBuffer.shift();
                    clearTimeout(deltaBufferTimer);

                    var allEquals = (deltaBuffer[0] == deltaBuffer[1] &&
                            deltaBuffer[1] == deltaBuffer[2]);
                    var allDivisable = (isDivisible(deltaBuffer[0], 120) &&
                            isDivisible(deltaBuffer[1], 120) &&
                            isDivisible(deltaBuffer[2], 120));
                    return !(allEquals || allDivisable);
                }

                function isDivisible(n, divisor) {
                    return (Math.floor(n / divisor) == n / divisor);
                }

                var requestFrame = (function () {
                    return window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            function (callback, element, delay) {
                                window.setTimeout(callback, delay || (1000 / 60));
                            };
                })();


                /***********************************************
                 * PULSE
                 ***********************************************/

                /**
                 * Viscous fluid with a pulse for part and decay for the rest.
                 * - Applies a fixed force over an interval (a damped acceleration), and
                 * - Lets the exponential bleed away the velocity over a longer interval
                 * - Michael Herf, http://stereopsis.com/stopping/
                 */
                function pulse_(x) {
                    var val, start, expx;
                    // test
                    x = x * options.pulseScale;
                    if (x < 1) { // acceleartion
                        val = x - (1 - Math.exp(-x));
                    } else { // tail
                        // the previous animation ended here:
                        start = Math.exp(-1);
                        // simple viscous drag
                        x -= 1;
                        expx = 1 - Math.exp(-x);
                        val = start + (expx * (1 - start));
                    }
                    return val * options.pulseNormalize;
                }

                function pulse(x) {
                    if (x >= 1)
                        return 1;
                    if (x <= 0)
                        return 0;

                    if (options.pulseNormalize == 1) {
                        options.pulseNormalize /= pulse_(1);
                    }
                    return pulse_(x);
                }

                var isChrome = /chrome/i.test(window.navigator.userAgent);
                var isMouseWheelSupported = 'onmousewheel' in document;

                if (isMouseWheelSupported && isChrome) {
                    addEvent("mousedown", mousedown);
                    addEvent("mousewheel", wheel);
                    addEvent("load", init);
                }
                ;

            })();
        }

        /**/
        (function (e) {
            var t = e(window);
            var n = t.height();
            t.resize(function () {
                n = t.height()
            });
            e.fn.parallax = function (r, i, s) {
                function l() {
                    var s = t.scrollTop();
                    o.each(function () {
                        var t = e(this);
                        var f = t.offset().top;
                        var l = u(t);
                        if (f + l < s || f > s + n) {
                            return
                        }
                        o.css("backgroundPosition", r + " " + Math.round((a - s) * i) + "px")
                    })
                }
                var o = e(this);
                var u;
                var a;
                var f = 0;
                o.each(function () {
                    a = o.offset().top
                });
                if (s) {
                    u = function (e) {
                        return e.outerHeight(true)
                    }
                } else {
                    u = function (e) {
                        return e.height()
                    }
                }
                if (arguments.length < 1 || r === null)
                    r = "50%";
                if (arguments.length < 2 || i === null)
                    i = .1;
                if (arguments.length < 3 || s === null)
                    s = true;
                t.bind("scroll", l).resize(l);
                l()
            }
        })(jQuery)





//rotate text pligin
        !function (e) {
            var t = {animation: "dissolve", separator: ",", speed: 2e3};
            e.fx.step.textShadowBlur = function (t) {
                e(t.elem).prop("textShadowBlur", t.now).css({textShadow: "0 0 " + Math.floor(t.now) + "px black"})
            };
            e.fn.textrotator = function (n) {
                var r = e.extend({}, t, n);
                return this.each(function () {
                    var t = e(this);
                    var n = [];
                    e.each(t.text().split(r.separator), function (e, t) {
                        n.push(t)
                    });
                    t.text(n[0]);
                    var i = function () {
                        switch (r.animation) {
                            case"dissolve":
                                t.animate({textShadowBlur: 20, opacity: 0}, 500, function () {
                                    s = e.inArray(t.text(), n);
                                    if (s + 1 == n.length)
                                        s = -1;
                                    t.text(n[s + 1]).animate({textShadowBlur: 0, opacity: 1}, 500)
                                });
                                break;
                            case"flip":
                                if (t.find(".back").length > 0) {
                                    t.html(t.find(".back").html())
                                }
                                var i = t.text();
                                var s = e.inArray(i, n);
                                if (s + 1 == n.length)
                                    s = -1;
                                t.html("");
                                e("<span class='front'>" + i + "</span>").appendTo(t);
                                e("<span class='back'>" + n[s + 1] + "</span>").appendTo(t);
                                t.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip").show().css({"-webkit-transform": " rotateY(-180deg)", "-moz-transform": " rotateY(-180deg)", "-o-transform": " rotateY(-180deg)", transform: " rotateY(-180deg)"});
                                break;
                            case"flipUp":
                                if (t.find(".back").length > 0) {
                                    t.html(t.find(".back").html())
                                }
                                var i = t.text();
                                var s = e.inArray(i, n);
                                if (s + 1 == n.length)
                                    s = -1;
                                t.html("");
                                e("<span class='front'>" + i + "</span>").appendTo(t);
                                e("<span class='back'>" + n[s + 1] + "</span>").appendTo(t);
                                t.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip up").show().css({"-webkit-transform": " rotateX(-180deg)", "-moz-transform": " rotateX(-180deg)", "-o-transform": " rotateX(-180deg)", transform: " rotateX(-180deg)"});
                                break;
                            case"flipCube":
                                if (t.find(".back").length > 0) {
                                    t.html(t.find(".back").html())
                                }
                                var i = t.text();
                                var s = e.inArray(i, n);
                                if (s + 1 == n.length)
                                    s = -1;
                                t.html("");
                                e("<span class='front'>" + i + "</span>").appendTo(t);
                                e("<span class='back'>" + n[s + 1] + "</span>").appendTo(t);
                                t.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip cube").show().css({"-webkit-transform": " rotateY(180deg)", "-moz-transform": " rotateY(180deg)", "-o-transform": " rotateY(180deg)", transform: " rotateY(180deg)"});
                                break;
                            case"flipCubeUp":
                                if (t.find(".back").length > 0) {
                                    t.html(t.find(".back").html())
                                }
                                var i = t.text();
                                var s = e.inArray(i, n);
                                if (s + 1 == n.length)
                                    s = -1;
                                t.html("");
                                e("<span class='front'>" + i + "</span>").appendTo(t);
                                e("<span class='back'>" + n[s + 1] + "</span>").appendTo(t);
                                t.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip cube up").show().css({"-webkit-transform": " rotateX(180deg)", "-moz-transform": " rotateX(180deg)", "-o-transform": " rotateX(180deg)", transform: " rotateX(180deg)"});
                                break;
                            case"spin":
                                if (t.find(".rotating").length > 0) {
                                    t.html(t.find(".rotating").html())
                                }
                                s = e.inArray(t.text(), n);
                                if (s + 1 == n.length)
                                    s = -1;
                                t.wrapInner("<span class='rotating spin' />").find(".rotating").hide().text(n[s + 1]).show().css({"-webkit-transform": " rotate(0) scale(1)", "-moz-transform": "rotate(0) scale(1)", "-o-transform": "rotate(0) scale(1)", transform: "rotate(0) scale(1)"});
                                break;
                            case"fade":
                                t.fadeOut(r.speed, function () {
                                    s = e.inArray(t.text(), n);
                                    if (s + 1 == n.length)
                                        s = -1;
                                    t.text(n[s + 1]).fadeIn(r.speed)
                                });
                                break
                        }
                    };
                    setInterval(i, r.speed)
                })
            }
        }(window.jQuery)



// video bacground
// Video Init
        $(document).ready(function () {
            if (!($("html").hasClass("mobile"))) {
                var videobackground = new $.backgroundVideo($('.bg-video-wrapper'), {
                    "align": "centerXY",
                    "width": 1280,
                    "height": 720,
                    "path": "video/",
                    "filename": "video",
                    "types": ["mp4", "ogg", "webm"],
                    "autoplay": true,
                    "loop": true
                });
            }
        });

        /*
         * jQuery Background video plugin for jQuery
         * ---
         * Copyright 2011, Victor Coulon (http://victorcoulon.fr)
         * Released under the MIT, BSD, and GPL Licenses.
         * based on jQuery Plugin Boilerplate 1.3
         */

        (function (t) {
            t.backgroundVideo = function (e, i) {
                var n = {videoid: "video_background", autoplay: true, loop: true, preload: true};
                var s = this;
                s.settings = {};
                var o = function () {
                    s.settings = t.extend({}, n, i);
                    s.el = e;
                    d()
                };
                var d = function () {
                    var e = "", i = "", n = "", o = "", d = s.settings.preload, g = s.settings.autoplay, a = s.settings.loop;
                    if (d) {
                        i = 'preload="auto"'
                    } else {
                        i = ""
                    }
                    if (g) {
                        n = 'autoplay="autoplay"'
                    } else {
                        n = ""
                    }
                    if (a) {
                        o = 'loop="true"'
                    } else {
                        o = ""
                    }
                    e += '<video id="' + s.settings.videoid + '"' + i + n + o;
                    if (s.settings.poster) {
                        e += ' poster="' + s.settings.poster + '" '
                    }
                    e += 'style="display:none;position:absolute;top:0;left:0;bottom:0;right:0;z-index:-100;width:100%;height:100%;">';
                    for (var l = 0; l < s.settings.types.length; l++) {
                        e += '<source src="' + s.settings.path + s.settings.filename + "." + s.settings.types[l] + '" type="video/' + s.settings.types[l] + '" />'
                    }
                    e += "bgvideo</video>";
                    s.el.prepend(e);
                    s.videoEl = document.getElementById(s.settings.videoid);
                    s.$videoEl = t(s.videoEl);
                    s.$videoEl.fadeIn(2e3);
                    r()
                };
                var r = function () {
                    var t = g();
                    s.$videoEl.width(t * s.settings.width);
                    s.$videoEl.height(t * s.settings.height);
                    if (typeof s.settings.align !== "undefined") {
                        a()
                    }
                };
                var g = function () {
                    var e = t(window).width();
                    var i = t(window).height();
                    var n = e / i;
                    var o = s.settings.width / s.settings.height;
                    var d = i / s.settings.height;
                    if (n >= o) {
                        d = e / s.settings.width
                    }
                    return d
                };
                var a = function () {
                    var e = (t(window).width() >> 1) - (s.$videoEl.width() >> 1) | 0;
                    var i = (t(window).height() >> 1) - (s.$videoEl.height() >> 1) | 0;
                    if (s.settings.align == "centerXY") {
                        s.$videoEl.css({left: e, top: i});
                        return
                    }
                    if (s.settings.align == "centerX") {
                        s.$videoEl.css("left", e);
                        return
                    }
                    if (s.settings.align == "centerY") {
                        s.$videoEl.css("top", i);
                        return
                    }
                };
                o();
                t(window).resize(function () {
                    r()
                });
                s.$videoEl.bind("ended", function () {
                    this.play()
                })
            }
        })(jQuery);

        /*!
         * Particleground
         *
         * @author Jonathan Nicol - @mrjnicol
         * @version 1.1.0
         * @description Creates a canvas based particle system background
         *
         * Inspired by http://requestlab.fr/ and http://disruptivebydesign.com/
         */
        !function (a, b) {
            "use strict";
            function c(a) {
                a = a || {};
                for (var b = 1; b < arguments.length; b++) {
                    var c = arguments[b];
                    if (c)
                        for (var d in c)
                            c.hasOwnProperty(d) && ("object" == typeof c[d] ? deepExtend(a[d], c[d]) : a[d] = c[d])
                }
                return a
            }
            function d(d, g) {
                function h() {
                    if (y) {
                        r = b.createElement("canvas"), r.className = "pg-canvas", r.style.display = "block", d.insertBefore(r, d.firstChild), s = r.getContext("2d"), i();
                        for (var c = Math.round(r.width * r.height / g.density), e = 0; c > e; e++) {
                            var f = new n;
                            f.setStackPos(e), z.push(f)
                        }
                        a.addEventListener("resize", function () {
                            k()
                        }, !1), b.addEventListener("mousemove", function (a) {
                            A = a.pageX, B = a.pageY
                        }, !1), D && !C && a.addEventListener("deviceorientation", function () {
                            F = Math.min(Math.max(-event.beta, -30), 30), E = Math.min(Math.max(-event.gamma, -30), 30)
                        }, !0), j(), q("onInit")
                    }
                }
                function i() {
                    r.width = d.offsetWidth, r.height = d.offsetHeight, s.fillStyle = g.dotColor, s.strokeStyle = g.lineColor, s.lineWidth = g.lineWidth
                }
                function j() {
                    if (y) {
                        u = a.innerWidth, v = a.innerHeight, s.clearRect(0, 0, r.width, r.height);
                        for (var b = 0; b < z.length; b++)
                            z[b].updatePosition();
                        for (var b = 0; b < z.length; b++)
                            z[b].draw();
                        G || (t = requestAnimationFrame(j))
                    }
                }
                function k() {
                    i();
                    for (var a = d.offsetWidth, b = d.offsetHeight, c = z.length - 1; c >= 0; c--)
                        (z[c].position.x > a || z[c].position.y > b) && z.splice(c, 1);
                    var e = Math.round(r.width * r.height / g.density);
                    if (e > z.length)
                        for (; e > z.length; ) {
                            var f = new n;
                            z.push(f)
                        }
                    else
                        e < z.length && z.splice(e);
                    for (c = z.length - 1; c >= 0; c--)
                        z[c].setStackPos(c)
                }
                function l() {
                    G = !0
                }
                function m() {
                    G = !1, j()
                }
                function n() {
                    switch (this.stackPos, this.active = !0, this.layer = Math.ceil(3 * Math.random()), this.parallaxOffsetX = 0, this.parallaxOffsetY = 0, this.position = {
                            x: Math.ceil(Math.random() * r.width), y: Math.ceil(Math.random() * r.height)}, this.speed = {}, g.directionX){case"left":
                            this.speed.x = +(-g.maxSpeedX + Math.random() * g.maxSpeedX - g.minSpeedX).toFixed(2);
                            break;
                        case"right":
                            this.speed.x = +(Math.random() * g.maxSpeedX + g.minSpeedX).toFixed(2);
                            break;
                        default:
                            this.speed.x = +(-g.maxSpeedX / 2 + Math.random() * g.maxSpeedX).toFixed(2), this.speed.x += this.speed.x > 0 ? g.minSpeedX : -g.minSpeedX
                    }
                    switch (g.directionY) {
                        case"up":
                            this.speed.y = +(-g.maxSpeedY + Math.random() * g.maxSpeedY - g.minSpeedY).toFixed(2);
                            break;
                        case"down":
                            this.speed.y = +(Math.random() * g.maxSpeedY + g.minSpeedY).toFixed(2);
                            break;
                        default:
                            this.speed.y = +(-g.maxSpeedY / 2 + Math.random() * g.maxSpeedY).toFixed(2), this.speed.x += this.speed.y > 0 ? g.minSpeedY : -g.minSpeedY
                    }
                }
                function o(a, b) {
                    return b ? void(g[a] = b) : g[a]
                }
                function p() {
                    console.log("destroy"), r.parentNode.removeChild(r), q("onDestroy"), f && f(d).removeData("plugin_" + e)
                }
                function q(a) {
                    void 0 !== g[a] && g[a].call(d)
                }
                var r, s, t, u, v, w, x, y = !!b.createElement("canvas").getContext, z = [], A = 0, B = 0, C = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i), D = !!a.DeviceOrientationEvent, E = 0, F = 0, G = !1;
                return g = c({}, a[e].defaults, g), n.prototype.draw = function () {
                    s.beginPath(), s.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, g.particleRadius / 2, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), s.beginPath();
                    for (var a = z.length - 1; a > this.stackPos; a--) {
                        var b = z[a], c = this.position.x - b.position.x, d = this.position.y - b.position.y, e = Math.sqrt(c * c + d * d).toFixed(2);
                        e < g.proximity && (s.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY), g.curvedLines ? s.quadraticCurveTo(Math.max(b.position.x, b.position.x), Math.min(b.position.y, b.position.y), b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY) : s.lineTo(b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY))
                    }
                    s.stroke(), s.closePath()
                }, n.prototype.updatePosition = function () {
                    if (g.parallax) {
                        if (D && !C) {
                            var a = (u - 0) / 60;
                            w = (E - -30) * a + 0;
                            var b = (v - 0) / 60;
                            x = (F - -30) * b + 0
                        } else
                            w = A, x = B;
                        this.parallaxTargX = (w - u / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10, this.parallaxTargY = (x - v / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10
                    }
                    var c = d.offsetWidth, e = d.offsetHeight;
                    switch (g.directionX) {
                        case"left":
                            this.position.x + this.speed.x + this.parallaxOffsetX < 0 && (this.position.x = c - this.parallaxOffsetX);
                            break;
                        case"right":
                            this.position.x + this.speed.x + this.parallaxOffsetX > c && (this.position.x = 0 - this.parallaxOffsetX);
                            break;
                        default:
                            (this.position.x + this.speed.x + this.parallaxOffsetX > c || this.position.x + this.speed.x + this.parallaxOffsetX < 0) && (this.speed.x = -this.speed.x)
                    }
                    switch (g.directionY) {
                        case"up":
                            this.position.y + this.speed.y + this.parallaxOffsetY < 0 && (this.position.y = e - this.parallaxOffsetY);
                            break;
                        case"down":
                            this.position.y + this.speed.y + this.parallaxOffsetY > e && (this.position.y = 0 - this.parallaxOffsetY);
                            break;
                        default:
                            (this.position.y + this.speed.y + this.parallaxOffsetY > e || this.position.y + this.speed.y + this.parallaxOffsetY < 0) && (this.speed.y = -this.speed.y)
                    }
                    this.position.x += this.speed.x, this.position.y += this.speed.y
                }, n.prototype.setStackPos = function (a) {
                    this.stackPos = a
                }, h(), {option: o, destroy: p, start: m, pause: l}
            }
            var e = "particleground", f = a.jQuery;
            a[e] = function (a, b) {
                return new d(a, b)
            }, a[e].defaults = {minSpeedX: .1, maxSpeedX: .7, minSpeedY: .1, maxSpeedY: .7, directionX: "center", directionY: "center", density: 1e4, dotColor: "#666666", lineColor: "#666666", particleRadius: 7, lineWidth: 1, curvedLines: !1, proximity: 100, parallax: !0, parallaxMultiplier: 5, onInit: function () {
                }, onDestroy: function () {
                }}, f && (f.fn[e] = function (a) {
                if ("string" == typeof arguments[0]) {
                    var b, c = arguments[0], g = Array.prototype.slice.call(arguments, 1);
                    return this.each(function () {
                        f.data(this, "plugin_" + e) && "function" == typeof f.data(this, "plugin_" + e)[c] && (b = f.data(this, "plugin_" + e)[c].apply(this, g))
                    }), void 0 !== b ? b : this
                }
                return"object" != typeof a && a ? void 0 : this.each(function () {
                    f.data(this, "plugin_" + e) || f.data(this, "plugin_" + e, new d(this, a))
                })
            })
        }(window, document), /**
         * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
         * @see: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
         * @see: http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
         * @license: MIT license
         */
                function () {
                    for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c)
                        window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"];
                    window.requestAnimationFrame || (window.requestAnimationFrame = function (b) {
                        var c = (new Date).getTime(), d = Math.max(0, 16 - (c - a)), e = window.setTimeout(function () {
                            b(c + d)
                        }, d);
                        return a = c + d, e
                    }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function (a) {
                        clearTimeout(a)
                    })
                }();



        /*inview plugin*/
        /**
         * author Remy Sharp
         * url http://remysharp.com/2009/01/26/element-in-view-event-plugin/
         */
        (function ($) {
            function getViewportHeight() {
                var height = window.innerHeight; // Safari, Opera
                var mode = document.compatMode;

                if ((mode || !$.support.boxModel)) { // IE, Gecko
                    height = (mode == 'CSS1Compat') ?
                            document.documentElement.clientHeight : // Standards
                            document.body.clientHeight; // Quirks
                }

                return height;
            }

            $(window).scroll(function () {
                var vpH = getViewportHeight(),
                        scrolltop = (document.documentElement.scrollTop ?
                                document.documentElement.scrollTop :
                                document.body.scrollTop),
                        elems = [];

                // naughty, but this is how it knows which elements to check for
                $.each($.cache, function () {
                    if (this.events && this.events.inview) {
                        elems.push(this.handle.elem);
                    }
                });

                if (elems.length) {
                    $(elems).each(function () {
                        var $el = $(this),
                                top = $el.offset().top,
                                height = $el.height(),
                                inview = $el.data('inview') || false;

                        if (scrolltop > (top + height) || scrolltop + vpH < top) {
                            if (inview) {
                                $el.data('inview', false);
                                $el.trigger('inview', [false]);
                            }
                        } else if (scrolltop < (top + height)) {
                            if (!inview) {
                                $el.data('inview', true);
                                $el.trigger('inview', [true]);
                            }
                        }
                    });
                }
            });

            // kick the event to pick up any elements already in view.
            // note however, this only works if the plugin is included after the elements are bound to 'inview'
            $(function () {
                $(window).scroll();
            });
        })(jQuery);

        // jquery.mb.YTPlayer
        $(document).ready(function () {
            $(".player").YTPlayer();
        });

        /*jquery.mb.YTPlayer 01-07-2015
         _ jquery.mb.components 
         _ email: matteo@open-lab.com 
         _ Copyright (c) 2001-2015. Matteo Bicocchi (Pupunzi); 
         _ blog: http://pupunzi.open-lab.com 
         _ Open Lab s.r.l., Florence - Italy 
         */
        function onYouTubeIframeAPIReady() {
            ytp.YTAPIReady || (ytp.YTAPIReady = !0, jQuery(document).trigger("YTAPIReady"))
        }
        function uncamel(a) {
            return a.replace(/([A-Z])/g, function (a) {
                return"-" + a.toLowerCase()
            })
        }
        function setUnit(a, b) {
            return"string" != typeof a || a.match(/^[\-0-9\.]+jQuery/) ? "" + a + b : a
        }
        function setFilter(a, b, c) {
            var d = uncamel(b), e = jQuery.browser.mozilla ? "" : jQuery.CSS.sfx;
            a[e + "filter"] = a[e + "filter"] || "", c = setUnit(c > jQuery.CSS.filters[b].max ? jQuery.CSS.filters[b].max : c, jQuery.CSS.filters[b].unit), a[e + "filter"] += d + "(" + c + ") ", delete a[b]
        }
        var ytp = ytp || {}, getYTPVideoID = function (a) {
            var b, c;
            return a.indexOf("youtu.be") > 0 ? (b = a.substr(a.lastIndexOf("/") + 1, a.length), c = b.indexOf("?list=") > 0 ? b.substr(b.lastIndexOf("="), b.length) : null, b = c ? b.substr(0, b.lastIndexOf("?")) : b) : a.indexOf("http") > -1 ? (b = a.match(/[\\?&]v=([^&#]*)/)[1], c = a.indexOf("list=") > 0 ? a.match(/[\\?&]list=([^&#]*)/)[1] : null) : (b = a.length > 15 ? null : a, c = b ? null : a), {videoID: b, playlistID: c}
        };
        !function (jQuery, ytp) {
            jQuery.mbYTPlayer = {name: "jquery.mb.YTPlayer", version: "2.9.4", build: "{{ build }}", author: "Matteo Bicocchi", apiKey: "", defaults: {containment: "body", ratio: "auto", videoURL: null, playlistURL: null, startAt: 0, stopAt: 0, autoPlay: !0, vol: 50, addRaster: !1, opacity: 1, quality: "default", mute: !1, loop: !0, showControls: !0, showAnnotations: !1, showYTLogo: !0, stopMovieOnBlur: !0, realfullscreen: !0, gaTrack: !0, optimizeDisplay: !0, onReady: function (a) {
                    }}, controls: {play: "P", pause: "p", mute: "M", unmute: "A", onlyYT: "O", showSite: "R", ytLogo: "Y"}, locationProtocol: "https:", buildPlayer: function (options) {
                    return this.each(function () {
                        var YTPlayer = this, $YTPlayer = jQuery(YTPlayer);
                        YTPlayer.loop = 0, YTPlayer.opt = {}, YTPlayer.state = {}, YTPlayer.filtersEnabled = !0, YTPlayer.filters = {grayscale: {value: 0, unit: "%"}, hue_rotate: {value: 0, unit: "deg"}, invert: {value: 0, unit: "%"}, opacity: {value: 0, unit: "%"}, saturate: {value: 0, unit: "%"}, sepia: {value: 0, unit: "%"}, brightness: {value: 0, unit: "%"}, contrast: {value: 0, unit: "%"}, blur: {value: 0, unit: "px"}}, $YTPlayer.addClass("mb_YTPlayer");
                        var property = $YTPlayer.data("property") && "string" == typeof $YTPlayer.data("property") ? eval("(" + $YTPlayer.data("property") + ")") : $YTPlayer.data("property");
                        "undefined" != typeof property && "undefined" != typeof property.vol && (property.vol = 0 === property.vol ? property.vol = 1 : property.vol), jQuery.extend(YTPlayer.opt, jQuery.mbYTPlayer.defaults, options, property), YTPlayer.hasChanged || (YTPlayer.defaultOpt = {}, jQuery.extend(YTPlayer.defaultOpt, jQuery.mbYTPlayer.defaults, options, property)), YTPlayer.isRetina = window.retina || window.devicePixelRatio > 1;
                        var isIframe = function () {
                            var a = !1;
                            try {
                                self.location.href != top.location.href && (a = !0)
                            } catch (b) {
                                a = !0
                            }
                            return a
                        };
                        YTPlayer.canGoFullScreen = !(jQuery.browser.msie || jQuery.browser.opera || isIframe()), YTPlayer.canGoFullScreen || (YTPlayer.opt.realfullscreen = !1), $YTPlayer.attr("id") || $YTPlayer.attr("id", "video_" + (new Date).getTime());
                        var playerID = "mbYTP_" + YTPlayer.id;
                        YTPlayer.isAlone = !1, YTPlayer.hasFocus = !0;
                        var videoID = this.opt.videoURL ? getYTPVideoID(this.opt.videoURL).videoID : $YTPlayer.attr("href") ? getYTPVideoID($YTPlayer.attr("href")).videoID : !1, playlistID = this.opt.videoURL ? getYTPVideoID(this.opt.videoURL).playlistID : $YTPlayer.attr("href") ? getYTPVideoID($YTPlayer.attr("href")).playlistID : !1;
                        YTPlayer.videoID = videoID, YTPlayer.playlistID = playlistID, YTPlayer.opt.showAnnotations = YTPlayer.opt.showAnnotations ? "0" : "3";
                        var playerVars = {autoplay: 0, modestbranding: 1, controls: 0, showinfo: 0, rel: 0, enablejsapi: 1, version: 3, playerapiid: playerID, origin: "*", allowfullscreen: !0, wmode: "transparent", iv_load_policy: YTPlayer.opt.showAnnotations};
                        document.createElement("video").canPlayType && jQuery.extend(playerVars, {html5: 1}), jQuery.browser.msie && jQuery.browser.version < 9 && (this.opt.opacity = 1);
                        var playerBox = jQuery("<div/>").attr("id", playerID).addClass("playerBox"), overlay = jQuery("<div/>").css({position: "absolute", top: 0, left: 0, width: "100%", height: "100%"}).addClass("YTPOverlay");
                        if (YTPlayer.isSelf = "self" == YTPlayer.opt.containment, YTPlayer.defaultOpt.containment = YTPlayer.opt.containment = jQuery("self" == YTPlayer.opt.containment ? this : YTPlayer.opt.containment), YTPlayer.isBackground = "body" == YTPlayer.opt.containment.get(0).tagName.toLowerCase(), !YTPlayer.isBackground || !ytp.backgroundIsInited) {
                            var isPlayer = YTPlayer.opt.containment.is(jQuery(this));
                            if (YTPlayer.canPlayOnMobile = isPlayer && 0 === jQuery(this).children().length, isPlayer ? YTPlayer.isPlayer = !0 : $YTPlayer.hide(), jQuery.browser.mobile && !YTPlayer.canPlayOnMobile)
                                return void $YTPlayer.remove();
                            var wrapper = jQuery("<div/>").addClass("mbYTP_wrapper").attr("id", "wrapper_" + playerID);
                            if (wrapper.css({position: "absolute", zIndex: 0, minWidth: "100%", minHeight: "100%", left: 0, top: 0, overflow: "hidden", opacity: 0}), playerBox.css({position: "absolute", zIndex: 0, width: "100%", height: "100%", top: 0, left: 0, overflow: "hidden"}), wrapper.append(playerBox), YTPlayer.opt.containment.children().not("script, style").each(function () {
                                "static" == jQuery(this).css("position") && jQuery(this).css("position", "relative")
                            }), YTPlayer.isBackground ? (jQuery("body").css({boxSizing: "border-box"}), wrapper.css({position: "fixed", top: 0, left: 0, zIndex: 0}), $YTPlayer.hide()) : "static" == YTPlayer.opt.containment.css("position") && YTPlayer.opt.containment.css({position: "relative"}), YTPlayer.opt.containment.prepend(wrapper), YTPlayer.wrapper = wrapper, playerBox.css({opacity: 1}), jQuery.browser.mobile || (playerBox.after(overlay), YTPlayer.overlay = overlay), YTPlayer.isBackground || overlay.on("mouseenter", function () {
                                YTPlayer.controlBar && YTPlayer.controlBar.addClass("visible")
                            }).on("mouseleave", function () {
                                YTPlayer.controlBar && YTPlayer.controlBar.removeClass("visible")
                            }), ytp.YTAPIReady)
                                setTimeout(function () {
                                    jQuery(document).trigger("YTAPIReady")
                                }, 100);
                            else {
                                jQuery("#YTAPI").remove();
                                var tag = jQuery("<script></script>").attr({src: jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/iframe_api?v=" + jQuery.mbYTPlayer.version, id: "YTAPI"});
                                jQuery("head").prepend(tag)
                            }
                            jQuery(document).on("YTAPIReady", function () {
                                YTPlayer.isBackground && ytp.backgroundIsInited || YTPlayer.isInit || (YTPlayer.isBackground && (ytp.backgroundIsInited = !0), YTPlayer.opt.autoPlay = "undefined" == typeof YTPlayer.opt.autoPlay ? YTPlayer.isBackground ? !0 : !1 : YTPlayer.opt.autoPlay, YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100, jQuery.mbYTPlayer.getDataFromAPI(YTPlayer), jQuery(YTPlayer).on("YTPChanged", function () {
                                    if (!YTPlayer.isInit) {
                                        if (YTPlayer.isInit = !0, jQuery.browser.mobile && YTPlayer.canPlayOnMobile) {
                                            if (YTPlayer.opt.containment.outerWidth() > jQuery(window).width()) {
                                                YTPlayer.opt.containment.css({maxWidth: "100%"});
                                                var h = .6 * YTPlayer.opt.containment.outerWidth();
                                                YTPlayer.opt.containment.css({maxHeight: h})
                                            }
                                            return void new YT.Player(playerID, {videoId: YTPlayer.videoID.toString(), height: "100%", width: "100%", events: {onReady: function (a) {
                                                        YTPlayer.player = a.target, playerBox.css({opacity: 1}), YTPlayer.wrapper.css({opacity: 1})
                                                    }}})
                                        }
                                        new YT.Player(playerID, {videoId: YTPlayer.videoID.toString(), playerVars: playerVars, events: {onReady: function (a) {
                                                    if (YTPlayer.player = a.target, !YTPlayer.isReady) {
                                                        YTPlayer.isReady = YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ? !1 : !0, YTPlayer.playerEl = YTPlayer.player.getIframe(), $YTPlayer.optimizeDisplay(), YTPlayer.videoID = videoID, jQuery(window).on("resize.YTP", function () {
                                                            $YTPlayer.optimizeDisplay()
                                                        }), jQuery.mbYTPlayer.checkForState(YTPlayer);
                                                        var b = jQuery.Event("YTPUnstarted");
                                                        b.time = YTPlayer.player.time, YTPlayer.canTrigger && jQuery(YTPlayer).trigger(b)
                                                    }
                                                }, onStateChange: function (event) {
                                                    if ("function" == typeof event.target.getPlayerState) {
                                                        var state = event.target.getPlayerState();
                                                        if (YTPlayer.state != state) {
                                                            YTPlayer.state = state;
                                                            var eventType;
                                                            switch (state) {
                                                                case-1:
                                                                    eventType = "YTPUnstarted";
                                                                    break;
                                                                case 0:
                                                                    eventType = "YTPEnd";
                                                                    break;
                                                                case 1:
                                                                    eventType = "YTPStart", YTPlayer.controlBar && YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.pause), "undefined" != typeof _gaq && eval(YTPlayer.opt.gaTrack) && _gaq.push(["_trackEvent", "YTPlayer", "Play", YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString()]), "undefined" != typeof ga && eval(YTPlayer.opt.gaTrack) && ga("send", "event", "YTPlayer", "play", YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString());
                                                                    break;
                                                                case 2:
                                                                    eventType = "YTPPause", YTPlayer.controlBar && YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                                                                    break;
                                                                case 3:
                                                                    YTPlayer.player.setPlaybackQuality(YTPlayer.opt.quality), eventType = "YTPBuffering", YTPlayer.controlBar && YTPlayer.controlBar.find(".mb_YTPPlaypause").html(jQuery.mbYTPlayer.controls.play);
                                                                    break;
                                                                case 5:
                                                                    eventType = "YTPCued"
                                                            }
                                                            var YTPEvent = jQuery.Event(eventType);
                                                            YTPEvent.time = YTPlayer.player.time, YTPlayer.canTrigger && jQuery(YTPlayer).trigger(YTPEvent)
                                                        }
                                                    }
                                                }, onPlaybackQualityChange: function (a) {
                                                    var b = a.target.getPlaybackQuality(), c = jQuery.Event("YTPQualityChange");
                                                    c.quality = b, jQuery(YTPlayer).trigger(c)
                                                }, onError: function (a) {
                                                    150 == a.data && (console.log("Embedding this video is restricted by Youtube."), YTPlayer.isPlayList && jQuery(YTPlayer).playNext()), 2 == a.data && YTPlayer.isPlayList && jQuery(YTPlayer).playNext(), "function" == typeof YTPlayer.opt.onError && YTPlayer.opt.onError($YTPlayer, a)
                                                }}})
                                    }
                                }))
                            })
                        }
                    })
                }, getDataFromAPI: function (a) {
                    if (a.videoData = jQuery.mbStorage.get("YYTPlayer_data_" + a.videoID), jQuery(a).off("YTPData.YTPlayer").on("YTPData.YTPlayer", function () {
                        if (a.hasData && a.isPlayer && !a.opt.autoPlay) {
                            var b = a.videoData.thumb_max || a.videoData.thumb_high || a.videoData.thumb_medium;
                            a.opt.containment.css({background: "rgba(0,0,0,0.5) url(" + b + ") center center", backgroundSize: "cover"}), a.opt.backgroundUrl = b
                        }
                    }), a.videoData)
                        setTimeout(function () {
                            a.opt.ratio = "auto" == a.opt.ratio ? "16/9" : a.opt.ratio, a.dataReceived = !0, jQuery(a).trigger("YTPChanged");
                            var b = jQuery.Event("YTPData");
                            b.prop = {};
                            for (var c in a.videoData)
                                b.prop[c] = a.videoData[c];
                            jQuery(a).trigger(b)
                        }, 500), a.hasData = !0;
                    else if (jQuery.mbYTPlayer.apiKey)
                        jQuery.getJSON(jQuery.mbYTPlayer.locationProtocol + "//www.googleapis.com/youtube/v3/videos?id=" + a.videoID + "&key=" + jQuery.mbYTPlayer.apiKey + "&part=snippet", function (b) {
                            function c(b) {
                                a.videoData = {}, a.videoData.id = a.videoID, a.videoData.channelTitle = b.channelTitle, a.videoData.title = b.title, a.videoData.description = b.description.length < 400 ? b.description : b.description.substring(0, 400) + " ...", a.videoData.aspectratio = "auto" == a.opt.ratio ? "16/9" : a.opt.ratio, a.opt.ratio = a.videoData.aspectratio, a.videoData.thumb_max = b.thumbnails.maxres ? b.thumbnails.maxres.url : null, a.videoData.thumb_high = b.thumbnails.high ? b.thumbnails.high.url : null, a.videoData.thumb_medium = b.thumbnails.medium ? b.thumbnails.medium.url : null, jQuery.mbStorage.set("YYTPlayer_data_" + a.videoID, a.videoData)
                            }
                            a.dataReceived = !0, jQuery(a).trigger("YTPChanged"), c(b.items[0].snippet), a.hasData = !0;
                            var d = jQuery.Event("YTPData");
                            d.prop = {};
                            for (var e in a.videoData)
                                d.prop[e] = a.videoData[e];
                            jQuery(a).trigger(d)
                        });
                    else {
                        if (setTimeout(function () {
                            jQuery(a).trigger("YTPChanged")
                        }, 50), a.isPlayer && !a.opt.autoPlay) {
                            var b = jQuery.mbYTPlayer.locationProtocol + "//i.ytimg.com/vi/" + a.videoID + "/hqdefault.jpg";
                            a.opt.containment.css({background: "rgba(0,0,0,0.5) url(" + b + ") center center", backgroundSize: "cover"}), a.opt.backgroundUrl = b
                        }
                        a.videoData = null, a.opt.ratio = "auto" == a.opt.ratio ? "16/9" : a.opt.ratio
                    }
                    a.isPlayer && !a.opt.autoPlay && (a.loading = jQuery("<div/>").addClass("loading").html("Loading").hide(), jQuery(a).append(a.loading), a.loading.fadeIn())
                }, removeStoredData: function () {
                    jQuery.mbStorage.remove()
                }, getVideoData: function () {
                    var a = this.get(0);
                    return a.videoData
                }, getVideoID: function () {
                    var a = this.get(0);
                    return a.videoID || !1
                }, setVideoQuality: function (a) {
                    var b = this.get(0);
                    jQuery.browser.chrome || b.player.setPlaybackQuality(a)
                }, playlist: function (a, b, c) {
                    var d = this, e = d.get(0);
                    return e.isPlayList = !0, b && (a = jQuery.shuffle(a)), e.videoID || (e.videos = a, e.videoCounter = 0, e.videoLength = a.length, jQuery(e).data("property", a[0]), jQuery(e).mb_YTPlayer()), "function" == typeof c && jQuery(e).on("YTPChanged", function () {
                        c(e)
                    }), jQuery(e).on("YTPEnd", function () {
                        jQuery(e).playNext()
                    }), d
                }, playNext: function () {
                    var a = this.get(0);
                    return a.videoCounter++, a.videoCounter >= a.videoLength && (a.videoCounter = 0), jQuery(a).changeMovie(a.videos[a.videoCounter]), this
                }, playPrev: function () {
                    var a = this.get(0);
                    return a.videoCounter--, a.videoCounter < 0 && (a.videoCounter = a.videoLength - 1), jQuery(a).changeMovie(a.videos[a.videoCounter]), this
                }, changeMovie: function (a) {
                    var b = this.get(0);
                    b.opt.startAt = 0, b.opt.stopAt = 0, b.opt.mute = !0, b.hasData = !1, b.hasChanged = !0, a && jQuery.extend(b.opt, b.defaultOpt, a), b.videoID = getYTPVideoID(b.opt.videoURL).videoID, jQuery(b.playerEl).CSSAnimate({opacity: 0}, 200, function () {
                        return jQuery(b).YTPGetPlayer().cueVideoByUrl(encodeURI(jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/v/" + b.videoID), 1, b.opt.quality), jQuery.mbYTPlayer.checkForState(b), jQuery(b).optimizeDisplay(), jQuery.mbYTPlayer.getDataFromAPI(b), this
                    })
                }, getPlayer: function () {
                    return jQuery(this).get(0).player
                }, playerDestroy: function () {
                    var a = this.get(0);
                    ytp.YTAPIReady = !1, ytp.backgroundIsInited = !1, a.isInit = !1, a.videoID = null;
                    var b = a.wrapper;
                    return b.remove(), jQuery("#controlBar_" + a.id).remove(), clearInterval(a.checkForStartAt), clearInterval(a.getState), this
                }, fullscreen: function (real) {
                    function hideMouse() {
                        YTPlayer.overlay.css({cursor: "none"})
                    }
                    function RunPrefixMethod(a, b) {
                        for (var c, d, e = ["webkit", "moz", "ms", "o", ""], f = 0; f < e.length && !a[c]; ) {
                            if (c = b, "" == e[f] && (c = c.substr(0, 1).toLowerCase() + c.substr(1)), c = e[f] + c, d = typeof a[c], "undefined" != d)
                                return e = [e[f]], "function" == d ? a[c]() : a[c];
                            f++
                        }
                    }
                    function launchFullscreen(a) {
                        RunPrefixMethod(a, "RequestFullScreen")
                    }
                    function cancelFullscreen() {
                        (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) && RunPrefixMethod(document, "CancelFullScreen")
                    }
                    var YTPlayer = this.get(0);
                    "undefined" == typeof real && (real = YTPlayer.opt.realfullscreen), real = eval(real);
                    var controls = jQuery("#controlBar_" + YTPlayer.id), fullScreenBtn = controls.find(".mb_OnlyYT"), videoWrapper = YTPlayer.isSelf ? YTPlayer.opt.containment : YTPlayer.wrapper;
                    if (real) {
                        var fullscreenchange = jQuery.browser.mozilla ? "mozfullscreenchange" : jQuery.browser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
                        jQuery(document).off(fullscreenchange).on(fullscreenchange, function () {
                            var a = RunPrefixMethod(document, "IsFullScreen") || RunPrefixMethod(document, "FullScreen");
                            a ? (jQuery(YTPlayer).YTPSetVideoQuality("default"), jQuery(YTPlayer).trigger("YTPFullScreenStart")) : (YTPlayer.isAlone = !1, fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT), jQuery(YTPlayer).YTPSetVideoQuality(YTPlayer.opt.quality), videoWrapper.removeClass("fullscreen"), videoWrapper.CSSAnimate({opacity: YTPlayer.opt.opacity}, 500), videoWrapper.css({zIndex: 0}), YTPlayer.isBackground ? jQuery("body").after(controls) : YTPlayer.wrapper.before(controls), jQuery(window).resize(), jQuery(YTPlayer).trigger("YTPFullScreenEnd"))
                        })
                    }
                    return YTPlayer.isAlone ? (jQuery(document).off("mousemove.YTPlayer"), YTPlayer.overlay.css({cursor: "auto"}), real ? cancelFullscreen() : (videoWrapper.CSSAnimate({opacity: YTPlayer.opt.opacity}, 500), videoWrapper.css({zIndex: 0})), fullScreenBtn.html(jQuery.mbYTPlayer.controls.onlyYT), YTPlayer.isAlone = !1) : (jQuery(document).on("mousemove.YTPlayer", function (a) {
                        YTPlayer.overlay.css({cursor: "auto"}), clearTimeout(YTPlayer.hideCursor), jQuery(a.target).parents().is(".mb_YTPBar") || (YTPlayer.hideCursor = setTimeout(hideMouse, 3e3))
                    }), hideMouse(), real ? (videoWrapper.css({opacity: 0}), videoWrapper.addClass("fullscreen"), launchFullscreen(videoWrapper.get(0)), setTimeout(function () {
                        videoWrapper.CSSAnimate({opacity: 1}, 1e3), YTPlayer.wrapper.append(controls), jQuery(YTPlayer).optimizeDisplay(), YTPlayer.player.seekTo(YTPlayer.player.getCurrentTime() + .1, !0)
                    }, 500)) : videoWrapper.css({zIndex: 1e4}).CSSAnimate({opacity: 1}, 1e3), fullScreenBtn.html(jQuery.mbYTPlayer.controls.showSite), YTPlayer.isAlone = !0), this
                }, toggleLoops: function () {
                    var a = this.get(0), b = a.opt;
                    return 1 == b.loop ? b.loop = 0 : (b.startAt ? a.player.seekTo(b.startAt) : a.player.playVideo(), b.loop = 1), this
                }, play: function () {
                    var a = this.get(0);
                    if (a.isReady) {
                        var b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPPlaypause");
                        return c.html(jQuery.mbYTPlayer.controls.pause), a.player.playVideo(), a.wrapper.CSSAnimate({opacity: a.isAlone ? 1 : a.opt.opacity}, 2e3), jQuery(a.playerEl).CSSAnimate({opacity: 1}, 1e3), jQuery(a).css("background-image", "none"), this
                    }
                }, togglePlay: function (a) {
                    var b = this.get(0);
                    return 1 == b.state ? this.YTPPause() : this.YTPPlay(), "function" == typeof a && a(b.state), this
                }, stop: function () {
                    var a = this.get(0), b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPPlaypause");
                    return c.html(jQuery.mbYTPlayer.controls.play), a.player.stopVideo(), this
                }, pause: function () {
                    var a = this.get(0), b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPPlaypause");
                    return c.html(jQuery.mbYTPlayer.controls.play), a.player.pauseVideo(), this
                }, seekTo: function (a) {
                    var b = this.get(0);
                    return b.player.seekTo(a, !0), this
                }, setVolume: function (a) {
                    var b = this.get(0);
                    return a || b.opt.vol || 0 != b.player.getVolume() ? !a && b.player.getVolume() > 0 || a && b.opt.vol == a ? b.isMute ? jQuery(b).YTPUnmute() : jQuery(b).YTPMute() : (b.opt.vol = a, b.player.setVolume(b.opt.vol), b.volumeBar && b.volumeBar.length && b.volumeBar.updateSliderVal(a)) : jQuery(b).YTPUnmute(), this
                }, mute: function () {
                    var a = this.get(0);
                    if (!a.isMute) {
                        a.player.mute(), a.isMute = !0, a.player.setVolume(0), a.volumeBar && a.volumeBar.length && a.volumeBar.width() > 10 && a.volumeBar.updateSliderVal(0);
                        var b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPMuteUnmute");
                        c.html(jQuery.mbYTPlayer.controls.unmute), jQuery(a).addClass("isMuted"), a.volumeBar && a.volumeBar.length && a.volumeBar.addClass("muted");
                        var d = jQuery.Event("YTPMuted");
                        return d.time = a.player.time, a.canTrigger && jQuery(a).trigger(d), this
                    }
                }, unmute: function () {
                    var a = this.get(0);
                    if (a.isMute) {
                        a.player.unMute(), a.isMute = !1, a.player.setVolume(a.opt.vol), a.volumeBar && a.volumeBar.length && a.volumeBar.updateSliderVal(a.opt.vol > 10 ? a.opt.vol : 10);
                        var b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPMuteUnmute");
                        c.html(jQuery.mbYTPlayer.controls.mute), jQuery(a).removeClass("isMuted"), a.volumeBar && a.volumeBar.length && a.volumeBar.removeClass("muted");
                        var d = jQuery.Event("YTPUnmuted");
                        return d.time = a.player.time, a.canTrigger && jQuery(a).trigger(d), this
                    }
                }, applyFilter: function (a, b) {
                    var c = this.get(0);
                    return c.filters[a].value = b, c.filtersEnabled && this.YTPEnableFilters(), this
                }, applyFilters: function (a) {
                    var b = this.get(0);
                    return this.on("YTPReady", function () {
                        for (var c in a)
                            b.filters[c].value = a[c], jQuery(b).YTPApplyFilter(c, a[c]);
                        jQuery(b).trigger("YTPFiltersApplied")
                    }), this
                }, toggleFilter: function (a, b) {
                    return this.each(function () {
                        var c = this;
                        c.filters[a].value ? c.filters[a].value = 0 : c.filters[a].value = b, c.filtersEnabled && jQuery(this).YTPEnableFilters()
                    })
                }, toggleFilters: function (a) {
                    return this.each(function () {
                        var b = this;
                        b.filtersEnabled ? (jQuery(b).trigger("YTPDisableFilters"), jQuery(b).YTPDisableFilters()) : (jQuery(b).YTPEnableFilters(), jQuery(b).trigger("YTPEnableFilters")), "function" == typeof a && a(b.filtersEnabled)
                    })
                }, disableFilters: function () {
                    return this.each(function () {
                        var a = this, b = jQuery(a.playerEl);
                        b.css("-webkit-filter", ""), b.css("filter", ""), a.filtersEnabled = !1
                    })
                }, enableFilters: function () {
                    return this.each(function () {
                        var a = this, b = jQuery(a.playerEl), c = "";
                        for (var d in a.filters)
                            a.filters[d].value && (c += d.replace("_", "-") + "(" + a.filters[d].value + a.filters[d].unit + ") ");
                        b.css("-webkit-filter", c), b.css("filter", c), a.filtersEnabled = !0
                    })
                }, removeFilter: function (a, b) {
                    return this.each(function () {
                        "function" == typeof a && (b = a, a = null);
                        var c = this;
                        if (a)
                            jQuery(this).YTPApplyFilter(a, 0), "function" == typeof b && b(a);
                        else
                            for (var d in c.filters)
                                jQuery(this).YTPApplyFilter(d, 0), "function" == typeof b && b(d)
                    })
                }, manageProgress: function () {
                    var a = this.get(0), b = jQuery("#controlBar_" + a.id), c = b.find(".mb_YTPProgress"), d = b.find(".mb_YTPLoaded"), e = b.find(".mb_YTPseekbar"), f = c.outerWidth(), g = Math.floor(a.player.getCurrentTime()), h = Math.floor(a.player.getDuration()), i = g * f / h, j = 0, k = 100 * a.player.getVideoLoadedFraction();
                    return d.css({left: j, width: k + "%"}), e.css({left: 0, width: i}), {totalTime: h, currentTime: g}
                }, buildControls: function (YTPlayer) {
                    var data = YTPlayer.opt;
                    if (data.showYTLogo = data.showYTLogo || data.printUrl, !jQuery("#controlBar_" + YTPlayer.id).length) {
                        YTPlayer.controlBar = jQuery("<span/>").attr("id", "controlBar_" + YTPlayer.id).addClass("mb_YTPBar").css({whiteSpace: "noWrap", position: YTPlayer.isBackground ? "fixed" : "absolute", zIndex: YTPlayer.isBackground ? 1e4 : 1e3}).hide();
                        var buttonBar = jQuery("<div/>").addClass("buttonBar"), playpause = jQuery("<span>" + jQuery.mbYTPlayer.controls.play + "</span>").addClass("mb_YTPPlaypause ytpicon").click(function () {
                            1 == YTPlayer.player.getPlayerState() ? jQuery(YTPlayer).YTPPause() : jQuery(YTPlayer).YTPPlay()
                        }), MuteUnmute = jQuery("<span>" + jQuery.mbYTPlayer.controls.mute + "</span>").addClass("mb_YTPMuteUnmute ytpicon").click(function () {
                            0 == YTPlayer.player.getVolume() ? jQuery(YTPlayer).YTPUnmute() : jQuery(YTPlayer).YTPMute()
                        }), volumeBar = jQuery("<div/>").addClass("mb_YTPVolumeBar").css({display: "inline-block"});
                        YTPlayer.volumeBar = volumeBar;
                        var idx = jQuery("<span/>").addClass("mb_YTPTime"), vURL = data.videoURL ? data.videoURL : "";
                        vURL.indexOf("http") < 0 && (vURL = jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + data.videoURL);
                        var movieUrl = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.ytLogo).addClass("mb_YTPUrl ytpicon").attr("title", "view on YouTube").on("click", function () {
                            window.open(vURL, "viewOnYT")
                        }), onlyVideo = jQuery("<span/>").html(jQuery.mbYTPlayer.controls.onlyYT).addClass("mb_OnlyYT ytpicon").on("click", function () {
                            jQuery(YTPlayer).YTPFullscreen(data.realfullscreen)
                        }), progressBar = jQuery("<div/>").addClass("mb_YTPProgress").css("position", "absolute").click(function (a) {
                            timeBar.css({width: a.clientX - timeBar.offset().left}), YTPlayer.timeW = a.clientX - timeBar.offset().left, YTPlayer.controlBar.find(".mb_YTPLoaded").css({width: 0});
                            var b = Math.floor(YTPlayer.player.getDuration());
                            YTPlayer["goto"] = timeBar.outerWidth() * b / progressBar.outerWidth(), YTPlayer.player.seekTo(parseFloat(YTPlayer["goto"]), !0), YTPlayer.controlBar.find(".mb_YTPLoaded").css({width: 0})
                        }), loadedBar = jQuery("<div/>").addClass("mb_YTPLoaded").css("position", "absolute"), timeBar = jQuery("<div/>").addClass("mb_YTPseekbar").css("position", "absolute");
                        progressBar.append(loadedBar).append(timeBar), buttonBar.append(playpause).append(MuteUnmute).append(volumeBar).append(idx), data.showYTLogo && buttonBar.append(movieUrl), (YTPlayer.isBackground || eval(YTPlayer.opt.realfullscreen) && !YTPlayer.isBackground) && buttonBar.append(onlyVideo), YTPlayer.controlBar.append(buttonBar).append(progressBar), YTPlayer.isBackground ? jQuery("body").after(YTPlayer.controlBar) : (YTPlayer.controlBar.addClass("inlinePlayer"), YTPlayer.wrapper.before(YTPlayer.controlBar)), volumeBar.simpleSlider({initialval: YTPlayer.opt.vol, scale: 100, orientation: "h", callback: function (a) {
                                0 == a.value ? jQuery(YTPlayer).YTPMute() : jQuery(YTPlayer).YTPUnmute(), YTPlayer.player.setVolume(a.value), YTPlayer.isMute || (YTPlayer.opt.vol = a.value)
                            }})
                    }
                }, checkForState: function (YTPlayer) {
                    var interval = YTPlayer.opt.showControls ? 100 : 700;
                    return clearInterval(YTPlayer.getState), jQuery.contains(document, YTPlayer) ? (jQuery.mbYTPlayer.checkForStart(YTPlayer), void(YTPlayer.getState = setInterval(function () {
                        var prog = jQuery(YTPlayer).YTPManageProgress(), $YTPlayer = jQuery(YTPlayer), data = YTPlayer.opt, startAt = YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 0, stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
                        if (stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0, YTPlayer.player.time != prog.currentTime) {
                            var YTPEvent = jQuery.Event("YTPTime");
                            YTPEvent.time = YTPlayer.player.time, jQuery(YTPlayer).trigger(YTPEvent)
                        }
                        if (YTPlayer.player.time = prog.currentTime, 0 == YTPlayer.player.getVolume() ? $YTPlayer.addClass("isMuted") : $YTPlayer.removeClass("isMuted"), YTPlayer.opt.showControls && (prog.totalTime ? YTPlayer.controlBar.find(".mb_YTPTime").html(jQuery.mbYTPlayer.formatTime(prog.currentTime) + " / " + jQuery.mbYTPlayer.formatTime(prog.totalTime)) : YTPlayer.controlBar.find(".mb_YTPTime").html("-- : -- / -- : --")), eval(YTPlayer.opt.stopMovieOnBlur) && (document.hasFocus() ? document.hasFocus() && !YTPlayer.hasFocus && -1 != YTPlayer.state && 0 != YTPlayer.state && (YTPlayer.hasFocus = !0, $YTPlayer.YTPPlay()) : 1 == YTPlayer.state && (YTPlayer.hasFocus = !1, $YTPlayer.YTPPause())), YTPlayer.controlBar && YTPlayer.controlBar.outerWidth() <= 400 && !YTPlayer.isCompact ? (YTPlayer.controlBar.addClass("compact"), YTPlayer.isCompact = !0, !YTPlayer.isMute && YTPlayer.volumeBar && YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol)) : YTPlayer.controlBar && YTPlayer.controlBar.outerWidth() > 400 && YTPlayer.isCompact && (YTPlayer.controlBar.removeClass("compact"), YTPlayer.isCompact = !1, !YTPlayer.isMute && YTPlayer.volumeBar && YTPlayer.volumeBar.updateSliderVal(YTPlayer.opt.vol)), 1 == YTPlayer.player.getPlayerState() && (parseFloat(YTPlayer.player.getDuration() - 1.5) < YTPlayer.player.getCurrentTime() || stopAt > 0 && parseFloat(YTPlayer.player.getCurrentTime()) > stopAt)) {
                            if (YTPlayer.isEnded)
                                return;
                            if (YTPlayer.isEnded = !0, setTimeout(function () {
                                YTPlayer.isEnded = !1
                            }, 1e3), YTPlayer.isPlayList) {
                                clearInterval(YTPlayer.getState);
                                var YTPEnd = jQuery.Event("YTPEnd");
                                return YTPEnd.time = YTPlayer.player.time, void jQuery(YTPlayer).trigger(YTPEnd)
                            }
                            data.loop ? (startAt = startAt || 1, YTPlayer.player.pauseVideo(), YTPlayer.player.seekTo(startAt, !0), $YTPlayer.YTPPlay()) : (YTPlayer.player.pauseVideo(), YTPlayer.wrapper.CSSAnimate({opacity: 0}, 1e3, function () {
                                var a = jQuery.Event("YTPEnd");
                                a.time = YTPlayer.player.time, jQuery(YTPlayer).trigger(a), YTPlayer.player.seekTo(startAt, !0), YTPlayer.isBackground || YTPlayer.opt.containment.css({background: "rgba(0,0,0,0.5) url(" + YTPlayer.opt.backgroundUrl + ") center center", backgroundSize: "cover"})
                            }))
                        }
                    }, interval))) : (jQuery(YTPlayer).YTPPlayerDestroy(), clearInterval(YTPlayer.getState), void clearInterval(YTPlayer.checkForStartAt))
                }, checkForStart: function (a) {
                    var b = jQuery(a);
                    if (!jQuery.contains(document, a))
                        return void jQuery(a).YTPPlayerDestroy();
                    if (jQuery.browser.chrome && (a.opt.quality = "default"), a.player.pauseVideo(), jQuery(a).muteYTPVolume(), jQuery("#controlBar_" + a.id).remove(), a.opt.showControls && jQuery.mbYTPlayer.buildControls(a), a.opt.addRaster) {
                        var c = "dot" == a.opt.addRaster ? "raster-dot" : "raster";
                        a.overlay.addClass(a.isRetina ? c + " retina" : c)
                    } else
                        a.overlay.removeClass(function (a, b) {
                            var c = b.split(" "), d = [];
                            return jQuery.each(c, function (a, b) {
                                /raster.*/.test(b) && d.push(b)
                            }), d.push("retina"), d.join(" ")
                        });
                    a.checkForStartAt = setInterval(function () {
                        jQuery(a).YTPMute();
                        var c = a.opt.startAt ? a.opt.startAt : 1, d = a.player.getVideoLoadedFraction() > c / a.player.getDuration();
                        if (a.player.getDuration() > 0 && a.player.getCurrentTime() >= c && d) {
                            clearInterval(a.checkForStartAt), a.isReady = !0, "function" == typeof a.opt.onReady && a.opt.onReady(a);
                            var e = jQuery.Event("YTPReady");
                            jQuery(a).trigger(e), a.player.pauseVideo(), a.opt.mute || jQuery(a).YTPUnmute(), a.canTrigger = !0, a.opt.autoPlay ? (b.YTPPlay(), b.css("background-image", "none"), jQuery(a.playerEl).CSSAnimate({opacity: 1}, 1e3), a.wrapper.CSSAnimate({opacity: a.isAlone ? 1 : a.opt.opacity}, 1e3)) : (a.player.pauseVideo(), a.isPlayer || (jQuery(a.playerEl).CSSAnimate({opacity: 1}, 1e3), a.wrapper.CSSAnimate({opacity: a.isAlone ? 1 : a.opt.opacity}, 1e3))), a.isPlayer && !a.opt.autoPlay && (a.loading.html("Ready"), setTimeout(function () {
                                a.loading.fadeOut()
                            }, 100)), a.controlBar && a.controlBar.slideDown(1e3)
                        } else
                            c >= 0 && a.player.seekTo(c, !0)
                    }, 1e3)
                }, formatTime: function (a) {
                    var b = Math.floor(a / 60), c = Math.floor(a - 60 * b);
                    return(9 >= b ? "0" + b : b) + " : " + (9 >= c ? "0" + c : c)
                }}, jQuery.fn.toggleVolume = function () {
                var a = this.get(0);
                if (a)
                    return a.player.isMuted() ? (jQuery(a).YTPUnmute(), !0) : (jQuery(a).YTPMute(), !1)
            }, jQuery.fn.optimizeDisplay = function () {
                var a = this.get(0), b = a.opt, c = jQuery(a.playerEl), d = {}, e = a.wrapper;
                d.width = e.outerWidth(), d.height = e.outerHeight();
                var f = 24, g = 100, h = {};
                b.optimizeDisplay ? (h.width = d.width + d.width * f / 100, h.height = "16/9" == b.ratio ? Math.ceil(9 * d.width / 16) : Math.ceil(3 * d.width / 4), h.marginTop = -((h.height - d.height) / 2), h.marginLeft = -(d.width * (f / 2) / 100), h.height < d.height && (h.height = d.height + d.height * f / 100, h.width = "16/9" == b.ratio ? Math.floor(16 * d.height / 9) : Math.floor(4 * d.height / 3), h.marginTop = -(d.height * (f / 2) / 100), h.marginLeft = -((h.width - d.width) / 2)), h.width += g, h.height += g, h.marginTop -= g / 2, h.marginLeft -= g / 2) : (h.width = "100%", h.height = "100%", h.marginTop = 0, h.marginLeft = 0), c.css({width: h.width, height: h.height, marginTop: h.marginTop, marginLeft: h.marginLeft})
            }, jQuery.shuffle = function (a) {
                for (var b = a.slice(), c = b.length, d = c; d--; ) {
                    var e = parseInt(Math.random() * c), f = b[d];
                    b[d] = b[e], b[e] = f
                }
                return b
            }, jQuery.fn.YTPlayer = jQuery.mbYTPlayer.buildPlayer, jQuery.fn.YTPGetPlayer = jQuery.mbYTPlayer.getPlayer, jQuery.fn.YTPGetVideoID = jQuery.mbYTPlayer.getVideoID, jQuery.fn.YTPChangeMovie = jQuery.mbYTPlayer.changeMovie, jQuery.fn.YTPPlayerDestroy = jQuery.mbYTPlayer.playerDestroy, jQuery.fn.YTPPlay = jQuery.mbYTPlayer.play, jQuery.fn.YTPTogglePlay = jQuery.mbYTPlayer.togglePlay, jQuery.fn.YTPStop = jQuery.mbYTPlayer.stop, jQuery.fn.YTPPause = jQuery.mbYTPlayer.pause, jQuery.fn.YTPSeekTo = jQuery.mbYTPlayer.seekTo, jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.playlist, jQuery.fn.YTPPlayNext = jQuery.mbYTPlayer.playNext, jQuery.fn.YTPPlayPrev = jQuery.mbYTPlayer.playPrev, jQuery.fn.YTPMute = jQuery.mbYTPlayer.mute, jQuery.fn.YTPUnmute = jQuery.mbYTPlayer.unmute, jQuery.fn.YTPToggleVolume = jQuery.mbYTPlayer.toggleVolume, jQuery.fn.YTPSetVolume = jQuery.mbYTPlayer.setVolume, jQuery.fn.YTPGetVideoData = jQuery.mbYTPlayer.getVideoData, jQuery.fn.YTPFullscreen = jQuery.mbYTPlayer.fullscreen, jQuery.fn.YTPToggleLoops = jQuery.mbYTPlayer.toggleLoops, jQuery.fn.YTPSetVideoQuality = jQuery.mbYTPlayer.setVideoQuality, jQuery.fn.YTPManageProgress = jQuery.mbYTPlayer.manageProgress, jQuery.fn.YTPApplyFilter = jQuery.mbYTPlayer.applyFilter, jQuery.fn.YTPApplyFilters = jQuery.mbYTPlayer.applyFilters, jQuery.fn.YTPToggleFilter = jQuery.mbYTPlayer.toggleFilter, jQuery.fn.YTPToggleFilters = jQuery.mbYTPlayer.toggleFilters, jQuery.fn.YTPRemoveFilter = jQuery.mbYTPlayer.removeFilter, jQuery.fn.YTPDisableFilters = jQuery.mbYTPlayer.disableFilters, jQuery.fn.YTPEnableFilters = jQuery.mbYTPlayer.enableFilters, jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer, jQuery.fn.playNext = jQuery.mbYTPlayer.playNext, jQuery.fn.playPrev = jQuery.mbYTPlayer.playPrev, jQuery.fn.changeMovie = jQuery.mbYTPlayer.changeMovie, jQuery.fn.getVideoID = jQuery.mbYTPlayer.getVideoID, jQuery.fn.getPlayer = jQuery.mbYTPlayer.getPlayer, jQuery.fn.playerDestroy = jQuery.mbYTPlayer.playerDestroy, jQuery.fn.fullscreen = jQuery.mbYTPlayer.fullscreen, jQuery.fn.buildYTPControls = jQuery.mbYTPlayer.buildControls, jQuery.fn.playYTP = jQuery.mbYTPlayer.play, jQuery.fn.toggleLoops = jQuery.mbYTPlayer.toggleLoops, jQuery.fn.stopYTP = jQuery.mbYTPlayer.stop, jQuery.fn.pauseYTP = jQuery.mbYTPlayer.pause, jQuery.fn.seekToYTP = jQuery.mbYTPlayer.seekTo, jQuery.fn.muteYTPVolume = jQuery.mbYTPlayer.mute, jQuery.fn.unmuteYTPVolume = jQuery.mbYTPlayer.unmute, jQuery.fn.setYTPVolume = jQuery.mbYTPlayer.setVolume, jQuery.fn.setVideoQuality = jQuery.mbYTPlayer.setVideoQuality, jQuery.fn.manageYTPProgress = jQuery.mbYTPlayer.manageProgress, jQuery.fn.YTPGetDataFromFeed = jQuery.mbYTPlayer.getVideoData
        }(jQuery, ytp), jQuery.support.CSStransition = function () {
            var a = document.body || document.documentElement, b = a.style;
            return void 0 !== b.transition || void 0 !== b.WebkitTransition || void 0 !== b.MozTransition || void 0 !== b.MsTransition || void 0 !== b.OTransition
        }(), jQuery.CSS = {name: "mb.CSSAnimate", author: "Matteo Bicocchi", version: "2.0.0", transitionEnd: "transitionEnd", sfx: "", filters: {blur: {min: 0, max: 100, unit: "px"}, brightness: {min: 0, max: 400, unit: "%"}, contrast: {min: 0, max: 400, unit: "%"}, grayscale: {min: 0, max: 100, unit: "%"}, hueRotate: {min: 0, max: 360, unit: "deg"}, invert: {min: 0, max: 100, unit: "%"}, saturate: {min: 0, max: 400, unit: "%"}, sepia: {min: 0, max: 100, unit: "%"}}, normalizeCss: function (a) {
                var b = jQuery.extend(!0, {}, a);
                jQuery.browser.webkit || jQuery.browser.opera ? jQuery.CSS.sfx = "-webkit-" : jQuery.browser.mozilla ? jQuery.CSS.sfx = "-moz-" : jQuery.browser.msie && (jQuery.CSS.sfx = "-ms-");
                for (var c in b) {
                    "transform" === c && (b[jQuery.CSS.sfx + "transform"] = b[c], delete b[c]), "transform-origin" === c && (b[jQuery.CSS.sfx + "transform-origin"] = a[c], delete b[c]), "filter" !== c || jQuery.browser.mozilla || (b[jQuery.CSS.sfx + "filter"] = a[c], delete b[c]), "blur" === c && setFilter(b, "blur", a[c]), "brightness" === c && setFilter(b, "brightness", a[c]), "contrast" === c && setFilter(b, "contrast", a[c]), "grayscale" === c && setFilter(b, "grayscale", a[c]), "hueRotate" === c && setFilter(b, "hueRotate", a[c]),
                            "invert" === c && setFilter(b, "invert", a[c]), "saturate" === c && setFilter(b, "saturate", a[c]), "sepia" === c && setFilter(b, "sepia", a[c]);
                    var d = "";
                    "x" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " translateX(" + setUnit(a[c], "px") + ")", delete b[c]), "y" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " translateY(" + setUnit(a[c], "px") + ")", delete b[c]), "z" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " translateZ(" + setUnit(a[c], "px") + ")", delete b[c]), "rotate" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " rotate(" + setUnit(a[c], "deg") + ")", delete b[c]), "rotateX" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " rotateX(" + setUnit(a[c], "deg") + ")", delete b[c]), "rotateY" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " rotateY(" + setUnit(a[c], "deg") + ")", delete b[c]), "rotateZ" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " rotateZ(" + setUnit(a[c], "deg") + ")", delete b[c]), "scale" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " scale(" + setUnit(a[c], "") + ")", delete b[c]), "scaleX" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " scaleX(" + setUnit(a[c], "") + ")", delete b[c]), "scaleY" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " scaleY(" + setUnit(a[c], "") + ")", delete b[c]), "scaleZ" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " scaleZ(" + setUnit(a[c], "") + ")", delete b[c]), "skew" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " skew(" + setUnit(a[c], "deg") + ")", delete b[c]), "skewX" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " skewX(" + setUnit(a[c], "deg") + ")", delete b[c]), "skewY" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " skewY(" + setUnit(a[c], "deg") + ")", delete b[c]), "perspective" === c && (d = jQuery.CSS.sfx + "transform", b[d] = b[d] || "", b[d] += " perspective(" + setUnit(a[c], "px") + ")", delete b[c])
                }
                return b
            }, getProp: function (a) {
                var b = [];
                for (var c in a)
                    b.indexOf(c) < 0 && b.push(uncamel(c));
                return b.join(",")
            }, animate: function (a, b, c, d, e) {
                return this.each(function () {
                    function f() {
                        g.called = !0, g.CSSAIsRunning = !1, h.off(jQuery.CSS.transitionEnd + "." + g.id), clearTimeout(g.timeout), h.css(jQuery.CSS.sfx + "transition", ""), "function" == typeof e && e.apply(g), "function" == typeof g.CSSqueue && (g.CSSqueue(), g.CSSqueue = null)
                    }
                    var g = this, h = jQuery(this);
                    g.id = g.id || "CSSA_" + (new Date).getTime();
                    var i = i || {type: "noEvent"};
                    if (g.CSSAIsRunning && g.eventType == i.type && !jQuery.browser.msie && jQuery.browser.version <= 9)
                        return void(g.CSSqueue = function () {
                            h.CSSAnimate(a, b, c, d, e)
                        });
                    if (g.CSSqueue = null, g.eventType = i.type, 0 !== h.length && a) {
                        if (a = jQuery.normalizeCss(a), g.CSSAIsRunning = !0, "function" == typeof b && (e = b, b = jQuery.fx.speeds._default), "function" == typeof c && (d = c, c = 0), "string" == typeof c && (e = c, c = 0), "function" == typeof d && (e = d, d = "cubic-bezier(0.65,0.03,0.36,0.72)"), "string" == typeof b)
                            for (var j in jQuery.fx.speeds) {
                                if (b == j) {
                                    b = jQuery.fx.speeds[j];
                                    break
                                }
                                b = jQuery.fx.speeds._default
                            }
                        if (b || (b = jQuery.fx.speeds._default), "string" == typeof e && (d = e, e = null), !jQuery.support.CSStransition) {
                            for (var k in a) {
                                if ("transform" === k && delete a[k], "filter" === k && delete a[k], "transform-origin" === k && delete a[k], "auto" === a[k] && delete a[k], "x" === k) {
                                    var l = a[k], m = "left";
                                    a[m] = l, delete a[k]
                                }
                                if ("y" === k) {
                                    var l = a[k], m = "top";
                                    a[m] = l, delete a[k]
                                }
                                ("-ms-transform" === k || "-ms-filter" === k) && delete a[k]
                            }
                            return void h.delay(c).animate(a, b, e)
                        }
                        var n = {"default": "ease", "in": "ease-in", out: "ease-out", "in-out": "ease-in-out", snap: "cubic-bezier(0,1,.5,1)", easeOutCubic: "cubic-bezier(.215,.61,.355,1)", easeInOutCubic: "cubic-bezier(.645,.045,.355,1)", easeInCirc: "cubic-bezier(.6,.04,.98,.335)", easeOutCirc: "cubic-bezier(.075,.82,.165,1)", easeInOutCirc: "cubic-bezier(.785,.135,.15,.86)", easeInExpo: "cubic-bezier(.95,.05,.795,.035)", easeOutExpo: "cubic-bezier(.19,1,.22,1)", easeInOutExpo: "cubic-bezier(1,0,0,1)", easeInQuad: "cubic-bezier(.55,.085,.68,.53)", easeOutQuad: "cubic-bezier(.25,.46,.45,.94)", easeInOutQuad: "cubic-bezier(.455,.03,.515,.955)", easeInQuart: "cubic-bezier(.895,.03,.685,.22)", easeOutQuart: "cubic-bezier(.165,.84,.44,1)", easeInOutQuart: "cubic-bezier(.77,0,.175,1)", easeInQuint: "cubic-bezier(.755,.05,.855,.06)", easeOutQuint: "cubic-bezier(.23,1,.32,1)", easeInOutQuint: "cubic-bezier(.86,0,.07,1)", easeInSine: "cubic-bezier(.47,0,.745,.715)", easeOutSine: "cubic-bezier(.39,.575,.565,1)", easeInOutSine: "cubic-bezier(.445,.05,.55,.95)", easeInBack: "cubic-bezier(.6,-.28,.735,.045)", easeOutBack: "cubic-bezier(.175, .885,.32,1.275)", easeInOutBack: "cubic-bezier(.68,-.55,.265,1.55)"};
                        n[d] && (d = n[d]), h.off(jQuery.CSS.transitionEnd + "." + g.id);
                        var o = jQuery.CSS.getProp(a), p = {};
                        jQuery.extend(p, a), p[jQuery.CSS.sfx + "transition-property"] = o, p[jQuery.CSS.sfx + "transition-duration"] = b + "ms", p[jQuery.CSS.sfx + "transition-delay"] = c + "ms", p[jQuery.CSS.sfx + "transition-timing-function"] = d, setTimeout(function () {
                            h.one(jQuery.CSS.transitionEnd + "." + g.id, f), h.css(p)
                        }, 1), g.timeout = setTimeout(function () {
                            return g.called || !e ? (g.called = !1, void(g.CSSAIsRunning = !1)) : (h.css(jQuery.CSS.sfx + "transition", ""), e.apply(g), g.CSSAIsRunning = !1, void("function" == typeof g.CSSqueue && (g.CSSqueue(), g.CSSqueue = null)))
                        }, b + c + 10)
                    }
                })
            }}, jQuery.fn.CSSAnimate = jQuery.CSS.animate, jQuery.normalizeCss = jQuery.CSS.normalizeCss, jQuery.fn.css3 = function (a) {
            return this.each(function () {
                var b = jQuery(this), c = jQuery.normalizeCss(a);
                b.css(c)
            })
        };
        var nAgt = navigator.userAgent;
        if (!jQuery.browser) {
            jQuery.browser = {}, jQuery.browser.mozilla = !1, jQuery.browser.webkit = !1, jQuery.browser.opera = !1, jQuery.browser.safari = !1, jQuery.browser.chrome = !1, jQuery.browser.msie = !1, jQuery.browser.ua = nAgt, jQuery.browser.name = navigator.appName, jQuery.browser.fullVersion = "" + parseFloat(navigator.appVersion), jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset, ix;
            if (-1 != (verOffset = nAgt.indexOf("Opera")))
                jQuery.browser.opera = !0, jQuery.browser.name = "Opera", jQuery.browser.fullVersion = nAgt.substring(verOffset + 6), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8));
            else if (-1 != (verOffset = nAgt.indexOf("OPR")))
                jQuery.browser.opera = !0, jQuery.browser.name = "Opera", jQuery.browser.fullVersion = nAgt.substring(verOffset + 4);
            else if (-1 != (verOffset = nAgt.indexOf("MSIE")))
                jQuery.browser.msie = !0, jQuery.browser.name = "Microsoft Internet Explorer", jQuery.browser.fullVersion = nAgt.substring(verOffset + 5);
            else if (-1 != nAgt.indexOf("Trident")) {
                jQuery.browser.msie = !0, jQuery.browser.name = "Microsoft Internet Explorer";
                var start = nAgt.indexOf("rv:") + 3, end = start + 4;
                jQuery.browser.fullVersion = nAgt.substring(start, end)
            } else
                -1 != (verOffset = nAgt.indexOf("Chrome")) ? (jQuery.browser.webkit = !0, jQuery.browser.chrome = !0, jQuery.browser.name = "Chrome", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7)) : -1 != (verOffset = nAgt.indexOf("Safari")) ? (jQuery.browser.webkit = !0, jQuery.browser.safari = !0, jQuery.browser.name = "Safari", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("AppleWebkit")) ? (jQuery.browser.webkit = !0, jQuery.browser.name = "Safari", jQuery.browser.fullVersion = nAgt.substring(verOffset + 7), -1 != (verOffset = nAgt.indexOf("Version")) && (jQuery.browser.fullVersion = nAgt.substring(verOffset + 8))) : -1 != (verOffset = nAgt.indexOf("Firefox")) ? (jQuery.browser.mozilla = !0, jQuery.browser.name = "Firefox", jQuery.browser.fullVersion = nAgt.substring(verOffset + 8)) : (nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/")) && (jQuery.browser.name = nAgt.substring(nameOffset, verOffset), jQuery.browser.fullVersion = nAgt.substring(verOffset + 1), jQuery.browser.name.toLowerCase() == jQuery.browser.name.toUpperCase() && (jQuery.browser.name = navigator.appName));
            -1 != (ix = jQuery.browser.fullVersion.indexOf(";")) && (jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix)), -1 != (ix = jQuery.browser.fullVersion.indexOf(" ")) && (jQuery.browser.fullVersion = jQuery.browser.fullVersion.substring(0, ix)), jQuery.browser.majorVersion = parseInt("" + jQuery.browser.fullVersion, 10), isNaN(jQuery.browser.majorVersion) && (jQuery.browser.fullVersion = "" + parseFloat(navigator.appVersion), jQuery.browser.majorVersion = parseInt(navigator.appVersion, 10)), jQuery.browser.version = jQuery.browser.majorVersion
        }
        jQuery.browser.android = /Android/i.test(nAgt), jQuery.browser.blackberry = /BlackBerry|BB|PlayBook/i.test(nAgt), jQuery.browser.ios = /iPhone|iPad|iPod|webOS/i.test(nAgt), jQuery.browser.operaMobile = /Opera Mini/i.test(nAgt), jQuery.browser.windowsMobile = /IEMobile|Windows Phone/i.test(nAgt), jQuery.browser.kindle = /Kindle|Silk/i.test(nAgt), jQuery.browser.mobile = jQuery.browser.android || jQuery.browser.blackberry || jQuery.browser.ios || jQuery.browser.windowsMobile || jQuery.browser.operaMobile || jQuery.browser.kindle, jQuery.isMobile = jQuery.browser.mobile, jQuery.isTablet = jQuery.browser.mobile && jQuery(window).width() > 765, jQuery.isAndroidDefault = jQuery.browser.android && !/chrome/i.test(nAgt), !function (a) {
            /iphone|ipod|ipad|android|ie|blackberry|fennec/.test(navigator.userAgent.toLowerCase());
            var b = "ontouchstart"in window || window.navigator && window.navigator.msPointerEnabled && window.MSGesture || window.DocumentTouch && document instanceof DocumentTouch || !1;
            a.simpleSlider = {defaults: {initialval: 0, scale: 100, orientation: "h", readonly: !1, callback: !1}, events: {start: b ? "touchstart" : "mousedown", end: b ? "touchend" : "mouseup", move: b ? "touchmove" : "mousemove"}, init: function (c) {
                    return this.each(function () {
                        var d = this, e = a(d);
                        e.addClass("simpleSlider"), d.opt = {}, a.extend(d.opt, a.simpleSlider.defaults, c), a.extend(d.opt, e.data());
                        var f = "h" == d.opt.orientation ? "horizontal" : "vertical", g = a("<div/>").addClass("level").addClass(f);
                        e.prepend(g), d.level = g, e.css({cursor: "default"}), "auto" == d.opt.scale && (d.opt.scale = a(d).outerWidth()), e.updateSliderVal(), d.opt.readonly || (e.on(a.simpleSlider.events.start, function (a) {
                            b && (a = a.changedTouches[0]), d.canSlide = !0, e.updateSliderVal(a), e.css({cursor: "col-resize"}), a.preventDefault(), a.stopPropagation()
                        }), a(document).on(a.simpleSlider.events.move, function (c) {
                            b && (c = c.changedTouches[0]), d.canSlide && (a(document).css({cursor: "default"}), e.updateSliderVal(c), c.preventDefault(), c.stopPropagation())
                        }).on(a.simpleSlider.events.end, function () {
                            a(document).css({cursor: "auto"}), d.canSlide = !1, e.css({cursor: "auto"})
                        }))
                    })
                }, updateSliderVal: function (b) {
                    function c(a, b) {
                        return Math.floor(100 * a / b)
                    }
                    var d = this, e = d.get(0);
                    e.opt.initialval = "number" == typeof e.opt.initialval ? e.opt.initialval : e.opt.initialval(e);
                    var f = a(e).outerWidth(), g = a(e).outerHeight();
                    e.x = "object" == typeof b ? b.clientX + document.body.scrollLeft - d.offset().left : "number" == typeof b ? b * f / e.opt.scale : e.opt.initialval * f / e.opt.scale, e.y = "object" == typeof b ? b.clientY + document.body.scrollTop - d.offset().top : "number" == typeof b ? (e.opt.scale - e.opt.initialval - b) * g / e.opt.scale : e.opt.initialval * g / e.opt.scale, e.y = d.outerHeight() - e.y, e.scaleX = e.x * e.opt.scale / f, e.scaleY = e.y * e.opt.scale / g, e.outOfRangeX = e.scaleX > e.opt.scale ? e.scaleX - e.opt.scale : e.scaleX < 0 ? e.scaleX : 0, e.outOfRangeY = e.scaleY > e.opt.scale ? e.scaleY - e.opt.scale : e.scaleY < 0 ? e.scaleY : 0, e.outOfRange = "h" == e.opt.orientation ? e.outOfRangeX : e.outOfRangeY, e.value = "undefined" != typeof b ? "h" == e.opt.orientation ? e.x >= d.outerWidth() ? e.opt.scale : e.x <= 0 ? 0 : e.scaleX : e.y >= d.outerHeight() ? e.opt.scale : e.y <= 0 ? 0 : e.scaleY : "h" == e.opt.orientation ? e.scaleX : e.scaleY, "h" == e.opt.orientation ? e.level.width(c(e.x, f) + "%") : e.level.height(c(e.y, g)), "function" == typeof e.opt.callback && e.opt.callback(e)
                }}, a.fn.simpleSlider = a.simpleSlider.init, a.fn.updateSliderVal = a.simpleSlider.updateSliderVal
        }(jQuery), !function (a) {
            a.mbCookie = {set: function (a, b, c, d) {
                    b = JSON.stringify(b), c || (c = 7), d = d ? "; domain=" + d : "";
                    var e, f = new Date;
                    f.setTime(f.getTime() + 864e5 * c), e = "; expires=" + f.toGMTString(), document.cookie = a + "=" + b + e + "; path=/" + d
                }, get: function (a) {
                    for (var b = a + "=", c = document.cookie.split(";"), d = 0; d < c.length; d++) {
                        for (var e = c[d]; " " == e.charAt(0); )
                            e = e.substring(1, e.length);
                        if (0 == e.indexOf(b))
                            return JSON.parse(e.substring(b.length, e.length))
                    }
                    return null
                }, remove: function (b) {
                    a.mbCookie.set(b, "", -1)
                }}, a.mbStorage = {set: function (a, b) {
                    b = JSON.stringify(b), localStorage.setItem(a, b)
                }, get: function (a) {
                    return localStorage[a] ? JSON.parse(localStorage[a]) : null
                }, remove: function (a) {
                    a ? localStorage.removeItem(a) : localStorage.clear()
                }}
        }(jQuery);
      //Start pro slider
      /*!
*  - v1.2.4
* Homepage: http://bqworks.com/slider-pro/
* Author: bqworks
* Author URL: http://bqworks.com/
*/
!function(a,b){"use strict";b.SliderPro={modules:[],addModule:function(a,c){this.modules.push(a),b.extend(d.prototype,c)}};var c=b.SliderPro.namespace="SliderPro",d=function(a,c){this.instance=a,this.$slider=b(this.instance),this.$slides=null,this.$slidesMask=null,this.$slidesContainer=null,this.slides=[],this.slidesOrder=[],this.options=c,this.settings={},this.originalSettings={},this.originalGotoSlide=null,this.selectedSlideIndex=0,this.previousSlideIndex=0,this.middleSlidePosition=0,this.supportedAnimation=null,this.vendorPrefix=null,this.transitionEvent=null,this.positionProperty=null,this.isIE=null,this.slidesPosition=0,this.slideWidth=0,this.slideHeight=0,this.slideSize=0,this.previousSlideWidth=0,this.previousSlideHeight=0,this.previousWindowWidth=0,this.previousWindowHeight=0,this.visibleOffset=0,this.allowResize=!0,this.uniqueId=(new Date).valueOf(),this.breakpoints=[],this.currentBreakpoint=-1,this.shuffledIndexes=[],this._init()};d.prototype={_init:function(){var d=this;this.supportedAnimation=f.getSupportedAnimation(),this.vendorPrefix=f.getVendorPrefix(),this.transitionEvent=f.getTransitionEvent(),this.isIE=f.checkIE(),this.$slider.removeClass("sp-no-js"),a.navigator.userAgent.match(/(iPad|iPhone|iPod)/g)&&this.$slider.addClass("ios");var e=/(msie) ([\w.]+)/,g=e.exec(a.navigator.userAgent.toLowerCase());this.isIE&&this.$slider.addClass("ie"),null!==g&&this.$slider.addClass("ie"+parseInt(g[2],10)),this.$slidesContainer=b('<div class="sp-slides-container"></div>').appendTo(this.$slider),this.$slidesMask=b('<div class="sp-mask"></div>').appendTo(this.$slidesContainer),this.$slides=this.$slider.find(".sp-slides").appendTo(this.$slidesMask),this.$slider.find(".sp-slide").appendTo(this.$slides);var h=b.SliderPro.modules;if("undefined"!=typeof h)for(var i=0;i<h.length;i++){var j=h[i].substring(0,1).toLowerCase()+h[i].substring(1)+"Defaults";"undefined"!=typeof this[j]&&b.extend(this.defaults,this[j])}if(this.settings=b.extend({},this.defaults,this.options),"undefined"!=typeof h)for(var k=0;k<h.length;k++)"undefined"!=typeof this["init"+h[k]]&&this["init"+h[k]]();if(this.originalSettings=b.extend({},this.settings),this.originalGotoSlide=this.gotoSlide,null!==this.settings.breakpoints){for(var l in this.settings.breakpoints)this.breakpoints.push({size:parseInt(l,10),properties:this.settings.breakpoints[l]});this.breakpoints=this.breakpoints.sort(function(a,b){return a.size>=b.size?1:-1})}if(this.selectedSlideIndex=this.settings.startSlide,this.settings.shuffle===!0){var m=this.$slides.find(".sp-slide"),n=[];m.each(function(a){d.shuffledIndexes.push(a)});for(var o=this.shuffledIndexes.length-1;o>0;o--){var p=Math.floor(Math.random()*(o+1)),q=this.shuffledIndexes[o];this.shuffledIndexes[o]=this.shuffledIndexes[p],this.shuffledIndexes[p]=q}b.each(this.shuffledIndexes,function(a,b){n.push(m[b])}),this.$slides.empty().append(n)}b(a).on("resize."+this.uniqueId+"."+c,function(){var c=b(a).width(),e=b(a).height();d.allowResize===!1||d.previousWindowWidth===c&&d.previousWindowHeight===e||(d.previousWindowWidth=c,d.previousWindowHeight=e,d.allowResize=!1,setTimeout(function(){d.resize(),d.allowResize=!0},200))}),this.on("update."+c,function(){d.previousSlideWidth=0,d.resize()}),this.update(),this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).addClass("sp-selected"),this.trigger({type:"init"}),b.isFunction(this.settings.init)&&this.settings.init.call(this,{type:"init"})},update:function(){var a=this;"horizontal"===this.settings.orientation?(this.$slider.removeClass("sp-vertical").addClass("sp-horizontal"),this.$slider.css({height:"","max-height":""}),this.$slides.find(".sp-slide").css("top","")):"vertical"===this.settings.orientation&&(this.$slider.removeClass("sp-horizontal").addClass("sp-vertical"),this.$slides.find(".sp-slide").css("left","")),this.positionProperty="horizontal"===this.settings.orientation?"left":"top",this.gotoSlide=this.originalGotoSlide;for(var c=this.slides.length-1;c>=0;c--)if(0===this.$slider.find('.sp-slide[data-index="'+c+'"]').length){var d=this.slides[c];d.destroy(),this.slides.splice(c,1)}this.slidesOrder.length=0,this.$slider.find(".sp-slide").each(function(c){var d=b(this);"undefined"==typeof d.attr("data-init")?a._createSlide(c,d):a.slides[c].setIndex(c),a.slidesOrder.push(c)}),this.middleSlidePosition=parseInt((a.slidesOrder.length-1)/2,10),this.settings.loop===!0&&this._updateSlidesOrder(),this.trigger({type:"update"}),b.isFunction(this.settings.update)&&this.settings.update.call(this,{type:"update"})},_createSlide:function(a,c){var d=new e(b(c),a,this.settings);this.slides.splice(a,0,d)},_updateSlidesOrder:function(){var a,c,d=b.inArray(this.selectedSlideIndex,this.slidesOrder)-this.middleSlidePosition;if(0>d)for(a=this.slidesOrder.splice(d,Math.abs(d)),c=a.length-1;c>=0;c--)this.slidesOrder.unshift(a[c]);else if(d>0)for(a=this.slidesOrder.splice(0,d),c=0;c<=a.length-1;c++)this.slidesOrder.push(a[c])},_updateSlidesPosition:function(){for(var a=parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty),10),b=0;b<this.slidesOrder.length;b++){var c=this.$slides.find(".sp-slide").eq(this.slidesOrder[b]);c.css(this.positionProperty,a+(b-this.middleSlidePosition)*(this.slideSize+this.settings.slideDistance))}},_resetSlidesPosition:function(){for(var a=0;a<this.slidesOrder.length;a++){var b=this.$slides.find(".sp-slide").eq(this.slidesOrder[a]);b.css(this.positionProperty,a*(this.slideSize+this.settings.slideDistance))}var c=-parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty),10)+this.visibleOffset;this._moveTo(c,!0)},resize:function(){var c=this;if(null!==this.settings.breakpoints&&this.breakpoints.length>0)if(b(a).width()>this.breakpoints[this.breakpoints.length-1].size&&-1!==this.currentBreakpoint)this.currentBreakpoint=-1,this._setProperties(this.originalSettings,!1);else for(var d=0,e=this.breakpoints.length;e>d;d++)if(b(a).width()<=this.breakpoints[d].size){if(this.currentBreakpoint!==this.breakpoints[d].size){var f={type:"breakpointReach",size:this.breakpoints[d].size,settings:this.breakpoints[d].properties};this.trigger(f),b.isFunction(this.settings.breakpointReach)&&this.settings.breakpointReach.call(this,f),this.currentBreakpoint=this.breakpoints[d].size;var g=b.extend({},this.originalSettings,this.breakpoints[d].properties);return void this._setProperties(g,!1)}break}this.settings.responsive===!0?"fullWidth"!==this.settings.forceSize&&"fullWindow"!==this.settings.forceSize||"auto"!==this.settings.visibleSize&&("auto"===this.settings.visibleSize||"vertical"!==this.settings.orientation)?this.$slider.css({width:"100%","max-width":this.settings.width,marginLeft:""}):(this.$slider.css("margin",0),this.$slider.css({width:b(a).width(),"max-width":"",marginLeft:-this.$slider.offset().left})):this.$slider.css({width:this.settings.width}),-1===this.settings.aspectRatio&&(this.settings.aspectRatio=this.settings.width/this.settings.height),this.slideWidth=this.$slider.width(),"fullWindow"===this.settings.forceSize?this.slideHeight=b(a).height():this.slideHeight=isNaN(this.settings.aspectRatio)?this.settings.height:this.slideWidth/this.settings.aspectRatio,(this.previousSlideWidth!==this.slideWidth||this.previousSlideHeight!==this.slideHeight||"auto"!==this.settings.visibleSize||this.$slider.outerWidth()>this.$slider.parent().width()||this.$slider.width()!==this.$slidesMask.width())&&(this.previousSlideWidth=this.slideWidth,this.previousSlideHeight=this.slideHeight,this.slideSize="horizontal"===this.settings.orientation?this.slideWidth:this.slideHeight,this.visibleSlidesSize=this.slideSize,this.visibleOffset=0,b.each(this.slides,function(a,b){b.setSize(c.slideWidth,c.slideHeight)}),this.$slidesMask.css({width:this.slideWidth,height:this.slideHeight}),this.settings.autoHeight===!0?setTimeout(function(){c._resizeHeight()},1):this.$slidesMask.css(this.vendorPrefix+"transition",""),"auto"!==this.settings.visibleSize&&("horizontal"===this.settings.orientation?("fullWidth"===this.settings.forceSize||"fullWindow"===this.settings.forceSize?(this.$slider.css("margin",0),this.$slider.css({width:b(a).width(),"max-width":"",marginLeft:-this.$slider.offset().left})):this.$slider.css({width:this.settings.visibleSize,"max-width":"100%",marginLeft:0}),this.$slidesMask.css("width",this.$slider.width()),this.visibleSlidesSize=this.$slidesMask.width(),this.visibleOffset=Math.round((this.$slider.width()-this.slideWidth)/2)):("fullWindow"===this.settings.forceSize?this.$slider.css({height:b(a).height(),"max-height":""}):this.$slider.css({height:this.settings.visibleSize,"max-height":"100%"}),this.$slidesMask.css("height",this.$slider.height()),this.visibleSlidesSize=this.$slidesMask.height(),this.visibleOffset=Math.round((this.$slider.height()-this.slideHeight)/2))),this._resetSlidesPosition(),this.trigger({type:"sliderResize"}),b.isFunction(this.settings.sliderResize)&&this.settings.sliderResize.call(this,{type:"sliderResize"}))},_resizeHeight:function(){var a=this,b=this.getSlideAt(this.selectedSlideIndex),d=b.getSize();b.off("imagesLoaded."+c),b.on("imagesLoaded."+c,function(c){if(c.index===a.selectedSlideIndex){var d=b.getSize();a._resizeHeightTo(d.height)}}),"loading"!==d&&this._resizeHeightTo(d.height)},gotoSlide:function(a){if(a!==this.selectedSlideIndex&&"undefined"!=typeof this.slides[a]){var c=this;this.previousSlideIndex=this.selectedSlideIndex,this.selectedSlideIndex=a,this.$slides.find(".sp-selected").removeClass("sp-selected"),this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).addClass("sp-selected"),this.settings.loop===!0&&(this._updateSlidesOrder(),this._updateSlidesPosition()),this.settings.autoHeight===!0&&this._resizeHeight();var d=-parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty),10)+this.visibleOffset;this._moveTo(d,!1,function(){c.settings.loop===!0&&c._resetSlidesPosition(),c.trigger({type:"gotoSlideComplete",index:a,previousIndex:c.previousSlideIndex}),b.isFunction(c.settings.gotoSlideComplete)&&c.settings.gotoSlideComplete.call(c,{type:"gotoSlideComplete",index:a,previousIndex:c.previousSlideIndex})}),this.trigger({type:"gotoSlide",index:a,previousIndex:this.previousSlideIndex}),b.isFunction(this.settings.gotoSlide)&&this.settings.gotoSlide.call(this,{type:"gotoSlide",index:a,previousIndex:this.previousSlideIndex})}},nextSlide:function(){var a=this.selectedSlideIndex>=this.getTotalSlides()-1?0:this.selectedSlideIndex+1;this.gotoSlide(a)},previousSlide:function(){var a=this.selectedSlideIndex<=0?this.getTotalSlides()-1:this.selectedSlideIndex-1;this.gotoSlide(a)},_moveTo:function(a,b,c){var d=this,e={};if(a!==this.slidesPosition)if(this.slidesPosition=a,"css-3d"!==this.supportedAnimation&&"css-2d"!==this.supportedAnimation||this.isIE!==!1)e["margin-"+this.positionProperty]=a,"undefined"!=typeof b&&b===!0?this.$slides.css(e):(this.$slides.addClass("sp-animated"),this.$slides.animate(e,this.settings.slideAnimationDuration,function(){d.$slides.removeClass("sp-animated"),"function"==typeof c&&c()}));else{var f,g="horizontal"===this.settings.orientation?a:0,h="horizontal"===this.settings.orientation?0:a;"css-3d"===this.supportedAnimation?e[this.vendorPrefix+"transform"]="translate3d("+g+"px, "+h+"px, 0)":e[this.vendorPrefix+"transform"]="translate("+g+"px, "+h+"px)","undefined"!=typeof b&&b===!0?f="":(this.$slides.addClass("sp-animated"),f=this.vendorPrefix+"transform "+this.settings.slideAnimationDuration/1e3+"s",this.$slides.on(this.transitionEvent,function(a){a.target===a.currentTarget&&(d.$slides.off(d.transitionEvent),d.$slides.removeClass("sp-animated"),"function"==typeof c&&c())})),e[this.vendorPrefix+"transition"]=f,this.$slides.css(e)}},_stopMovement:function(){var a={};if("css-3d"!==this.supportedAnimation&&"css-2d"!==this.supportedAnimation||this.isIE!==!1)this.$slides.stop(),this.slidesPosition=parseInt(this.$slides.css("margin-"+this.positionProperty),10);else{var b=this.$slides.css(this.vendorPrefix+"transform"),c=-1!==b.indexOf("matrix3d")?"matrix3d":"matrix",d=b.replace(c,"").match(/-?[0-9\.]+/g),e="matrix3d"===c?parseInt(d[12],10):parseInt(d[4],10),f="matrix3d"===c?parseInt(d[13],10):parseInt(d[5],10);"css-3d"===this.supportedAnimation?a[this.vendorPrefix+"transform"]="translate3d("+e+"px, "+f+"px, 0)":a[this.vendorPrefix+"transform"]="translate("+e+"px, "+f+"px)",a[this.vendorPrefix+"transition"]="",this.$slides.css(a),this.$slides.off(this.transitionEvent),this.slidesPosition="horizontal"===this.settings.orientation?e:f}this.$slides.removeClass("sp-animated")},_resizeHeightTo:function(a){var c=this,d={height:a};"css-3d"===this.supportedAnimation||"css-2d"===this.supportedAnimation?(d[this.vendorPrefix+"transition"]="height "+this.settings.heightAnimationDuration/1e3+"s",this.$slidesMask.off(this.transitionEvent),this.$slidesMask.on(this.transitionEvent,function(a){a.target===a.currentTarget&&(c.$slidesMask.off(c.transitionEvent),c.trigger({type:"resizeHeightComplete"}),b.isFunction(c.settings.resizeHeightComplete)&&c.settings.resizeHeightComplete.call(c,{type:"resizeHeightComplete"}))}),this.$slidesMask.css(d)):this.$slidesMask.stop().animate(d,this.settings.heightAnimationDuration,function(a){c.trigger({type:"resizeHeightComplete"}),b.isFunction(c.settings.resizeHeightComplete)&&c.settings.resizeHeightComplete.call(c,{type:"resizeHeightComplete"})})},destroy:function(){this.$slider.removeData("sliderPro"),this.$slider.removeAttr("style"),this.$slides.removeAttr("style"),this.off("update."+c),b(a).off("resize."+this.uniqueId+"."+c);var d=b.SliderPro.modules;if("undefined"!=typeof d)for(var e=0;e<d.length;e++)"undefined"!=typeof this["destroy"+d[e]]&&this["destroy"+d[e]]();b.each(this.slides,function(a,b){b.destroy()}),this.slides.length=0,this.$slides.prependTo(this.$slider),this.$slidesContainer.remove()},_setProperties:function(a,b){for(var c in a)this.settings[c]=a[c],b!==!1&&(this.originalSettings[c]=a[c]);this.update()},on:function(a,b){return this.$slider.on(a,b)},off:function(a){return this.$slider.off(a)},trigger:function(a){return this.$slider.triggerHandler(a)},getSlideAt:function(a){return this.slides[a]},getSelectedSlide:function(){return this.selectedSlideIndex},getTotalSlides:function(){return this.slides.length},defaults:{width:500,height:300,responsive:!0,aspectRatio:-1,imageScaleMode:"cover",centerImage:!0,allowScaleUp:!0,autoHeight:!1,startSlide:0,shuffle:!1,orientation:"horizontal",forceSize:"none",loop:!0,slideDistance:10,slideAnimationDuration:700,heightAnimationDuration:700,visibleSize:"auto",breakpoints:null,init:function(){},update:function(){},sliderResize:function(){},gotoSlide:function(){},gotoSlideComplete:function(){},resizeHeightComplete:function(){},breakpointReach:function(){}}};var e=function(a,b,c){this.$slide=a,this.$mainImage=null,this.$imageContainer=null,this.hasMainImage=!1,this.isMainImageLoaded=!1,this.isMainImageLoading=!1,this.hasImages=!1,this.areImagesLoaded=!1,this.width=0,this.height=0,this.settings=c,this.setIndex(b),this._init()};e.prototype={_init:function(){this.$slide.attr("data-init",!0),this.$mainImage=0!==this.$slide.find(".sp-image").length?this.$slide.find(".sp-image"):null,null!==this.$mainImage&&(this.hasMainImage=!0,this.$imageContainer=b('<div class="sp-image-container"></div>').prependTo(this.$slide),0!==this.$mainImage.parent("a").length?this.$mainImage.parent("a").appendTo(this.$imageContainer):this.$mainImage.appendTo(this.$imageContainer)),this.hasImages=0!==this.$slide.find("img").length?!0:!1},setSize:function(a,b){this.width=a,this.height=this.settings.autoHeight===!0?"auto":b,this.$slide.css({width:this.width,height:this.height}),this.hasMainImage===!0&&(this.$imageContainer.css({width:this.width,height:this.height}),"undefined"==typeof this.$mainImage.attr("data-src")&&this.resizeMainImage())},getSize:function(){var a,b=this;if(this.hasImages===!0&&this.areImagesLoaded===!1&&"undefined"==typeof this.$slide.attr("data-loading")){this.$slide.attr("data-loading",!0);var d=f.checkImagesComplete(this.$slide,function(){b.areImagesLoaded=!0,b.$slide.removeAttr("data-loading"),b.trigger({type:"imagesLoaded."+c,index:b.index})});return"complete"===d?(a=this.calculateSize(),{width:a.width,height:a.height}):"loading"}return a=this.calculateSize(),{width:a.width,height:a.height}},calculateSize:function(){var a=this.$slide.width(),c=this.$slide.height();return this.$slide.children().each(function(d,e){var f=b(e);if(f.is(":hidden")!==!0){var g=e.getBoundingClientRect(),h=f.position().top+(g.bottom-g.top),i=f.position().left+(g.right-g.left);h>c&&(c=h),i>a&&(a=i)}}),{width:a,height:c}},resizeMainImage:function(a){var b=this;if(a===!0&&(this.isMainImageLoaded=!1,this.isMainImageLoading=!1),this.isMainImageLoaded===!1&&this.isMainImageLoading===!1)return this.isMainImageLoading=!0,void f.checkImagesComplete(this.$mainImage,function(){b.isMainImageLoaded=!0,b.isMainImageLoading=!1,b.resizeMainImage(),b.trigger({type:"imagesLoaded."+c,index:b.index})});if(this.settings.allowScaleUp===!1){this.$mainImage.css({width:"",height:"",maxWidth:"",maxHeight:""});var d=this.$mainImage.width(),e=this.$mainImage.height();this.$mainImage.css({maxWidth:d,maxHeight:e})}this.settings.autoHeight===!0?this.$mainImage.css({width:"100%",height:"auto"}):"cover"===this.settings.imageScaleMode?this.$mainImage.width()/this.$mainImage.height()<=this.width/this.height?this.$mainImage.css({width:"100%",height:"auto"}):this.$mainImage.css({width:"auto",height:"100%"}):"contain"===this.settings.imageScaleMode?this.$mainImage.width()/this.$mainImage.height()>=this.width/this.height?this.$mainImage.css({width:"100%",height:"auto"}):this.$mainImage.css({width:"auto",height:"100%"}):"exact"===this.settings.imageScaleMode&&this.$mainImage.css({width:"100%",height:"100%"}),this.settings.centerImage===!0&&this.$mainImage.css({marginLeft:.5*(this.$imageContainer.width()-this.$mainImage.width()),marginTop:.5*(this.$imageContainer.height()-this.$mainImage.height())})},destroy:function(){this.$slide.removeAttr("style"),this.$slide.removeAttr("data-init"),this.$slide.removeAttr("data-index"),this.$slide.removeAttr("data-loaded"),this.hasMainImage===!0&&(this.$slide.find(".sp-image").removeAttr("style").appendTo(this.$slide),this.$slide.find(".sp-image-container").remove())},getIndex:function(){return this.index},setIndex:function(a){this.index=a,this.$slide.attr("data-index",this.index)},on:function(a,b){return this.$slide.on(a,b)},off:function(a){return this.$slide.off(a)},trigger:function(a){return this.$slide.triggerHandler(a)}},a.SliderPro=d,a.SliderProSlide=e,b.fn.sliderPro=function(a){var c=Array.prototype.slice.call(arguments,1);return this.each(function(){if("undefined"==typeof b(this).data("sliderPro")){var e=new d(this,a);b(this).data("sliderPro",e)}else if("undefined"!=typeof a){var f=b(this).data("sliderPro");if("function"==typeof f[a])f[a].apply(f,c);else if("undefined"!=typeof f.settings[a]){var g={};g[a]=c[0],f._setProperties(g)}else"object"==typeof a?f._setProperties(a):b.error(a+" does not exist in sliderPro.")}})};var f={supportedAnimation:null,vendorPrefix:null,transitionEvent:null,isIE:null,getSupportedAnimation:function(){if(null!==this.supportedAnimation)return this.supportedAnimation;var a=document.body||document.documentElement,b=a.style,c="undefined"!=typeof b.transition||"undefined"!=typeof b.WebkitTransition||"undefined"!=typeof b.MozTransition||"undefined"!=typeof b.OTransition;if(c===!0){var d=document.createElement("div");if(("undefined"!=typeof d.style.WebkitPerspective||"undefined"!=typeof d.style.perspective)&&(this.supportedAnimation="css-3d"),"css-3d"===this.supportedAnimation&&"undefined"!=typeof d.styleWebkitPerspective){var e=document.createElement("style");e.textContent="@media (transform-3d),(-webkit-transform-3d){#test-3d{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0;}}",document.getElementsByTagName("head")[0].appendChild(e),d.id="test-3d",document.body.appendChild(d),(9!==d.offsetLeft||5!==d.offsetHeight)&&(this.supportedAnimation=null),e.parentNode.removeChild(e),d.parentNode.removeChild(d)}null!==this.supportedAnimation||"undefined"==typeof d.style["-webkit-transform"]&&"undefined"==typeof d.style.transform||(this.supportedAnimation="css-2d")}else this.supportedAnimation="javascript";return this.supportedAnimation},getVendorPrefix:function(){if(null!==this.vendorPrefix)return this.vendorPrefix;var a=document.createElement("div"),b=["Webkit","Moz","ms","O"];if("transform"in a.style)return this.vendorPrefix="",this.vendorPrefix;for(var c=0;c<b.length;c++)if(b[c]+"Transform"in a.style){this.vendorPrefix="-"+b[c].toLowerCase()+"-";break}return this.vendorPrefix},getTransitionEvent:function(){if(null!==this.transitionEvent)return this.transitionEvent;var a=document.createElement("div"),b={transition:"transitionend",WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd"};for(var c in b)if(c in a.style){this.transitionEvent=b[c];break}return this.transitionEvent},checkImagesComplete:function(a,b){var c=this,d=this.checkImagesStatus(a);if("loading"===d)var e=setInterval(function(){d=c.checkImagesStatus(a),"complete"===d&&(clearInterval(e),"function"==typeof b&&b())},100);else"function"==typeof b&&b();return d},checkImagesStatus:function(a){var c="complete";return a.is("img")&&a[0].complete===!1?c="loading":a.find("img").each(function(a){var d=b(this)[0];d.complete===!1&&(c="loading")}),c},checkIE:function(){if(null!==this.isIE)return this.isIE;var b=a.navigator.userAgent;b.indexOf("MSIE");return-1!==b.indexOf("MSIE")||b.match(/Trident.*rv\:11\./)?this.isIE=!0:this.isIE=!1,this.isIE}};a.SliderProUtils=f}(window,jQuery),function(a,b){"use strict";var c="Thumbnails."+b.SliderPro.namespace,d={$thumbnails:null,$thumbnailsContainer:null,thumbnails:null,selectedThumbnailIndex:0,thumbnailsSize:0,thumbnailsContainerSize:0,thumbnailsPosition:0,thumbnailsOrientation:null,thumbnailsPositionProperty:null,isThumbnailScroller:!1,initThumbnails:function(){var a=this;this.thumbnails=[],this.on("update."+c,b.proxy(this._thumbnailsOnUpdate,this)),this.on("sliderResize."+c,b.proxy(this._thumbnailsOnResize,this)),this.on("gotoSlide."+c,function(b){a._gotoThumbnail(b.index)})},_thumbnailsOnUpdate:function(){var a=this;if(0===this.$slider.find(".sp-thumbnail").length&&0===this.thumbnails.length)return void(this.isThumbnailScroller=!1);if(this.isThumbnailScroller=!0,null===this.$thumbnailsContainer&&(this.$thumbnailsContainer=b('<div class="sp-thumbnails-container"></div>').insertAfter(this.$slidesContainer)),null===this.$thumbnails)if(0!==this.$slider.find(".sp-thumbnails").length){if(this.$thumbnails=this.$slider.find(".sp-thumbnails").appendTo(this.$thumbnailsContainer),this.settings.shuffle===!0){var c=this.$thumbnails.find(".sp-thumbnail"),d=[];b.each(this.shuffledIndexes,function(a,e){var f=b(c[e]);0!==f.parent("a").length&&(f=f.parent("a")),d.push(f)}),this.$thumbnails.empty().append(d)}}else this.$thumbnails=b('<div class="sp-thumbnails"></div>').appendTo(this.$thumbnailsContainer);this.$slides.find(".sp-thumbnail").each(function(c){var d=b(this),e=d.parents(".sp-slide").index(),f=a.$thumbnails.find(".sp-thumbnail").length-1;0!==d.parent("a").length&&(d=d.parent("a")),e>f?d.appendTo(a.$thumbnails):d.insertBefore(a.$thumbnails.find(".sp-thumbnail").eq(e))});for(var e=this.thumbnails.length-1;e>=0;e--)if(0===this.$thumbnails.find('.sp-thumbnail[data-index="'+e+'"]').length){var f=this.thumbnails[e];f.destroy(),this.thumbnails.splice(e,1)}this.$thumbnails.find(".sp-thumbnail").each(function(c){var d=b(this);"undefined"==typeof d.attr("data-init")?a._createThumbnail(d,c):a.thumbnails[c].setIndex(c)}),this.$thumbnailsContainer.removeClass("sp-top-thumbnails sp-bottom-thumbnails sp-left-thumbnails sp-right-thumbnails"),"top"===this.settings.thumbnailsPosition?(this.$thumbnailsContainer.addClass("sp-top-thumbnails"),this.thumbnailsOrientation="horizontal"):"bottom"===this.settings.thumbnailsPosition?(this.$thumbnailsContainer.addClass("sp-bottom-thumbnails"),this.thumbnailsOrientation="horizontal"):"left"===this.settings.thumbnailsPosition?(this.$thumbnailsContainer.addClass("sp-left-thumbnails"),this.thumbnailsOrientation="vertical"):"right"===this.settings.thumbnailsPosition&&(this.$thumbnailsContainer.addClass("sp-right-thumbnails"),this.thumbnailsOrientation="vertical"),this.settings.thumbnailPointer===!0?this.$thumbnailsContainer.addClass("sp-has-pointer"):this.$thumbnailsContainer.removeClass("sp-has-pointer"),this.selectedThumbnailIndex=this.selectedSlideIndex,this.$thumbnails.find(".sp-thumbnail-container").eq(this.selectedThumbnailIndex).addClass("sp-selected-thumbnail"),this.thumbnailsSize=0,b.each(this.thumbnails,function(b,c){c.setSize(a.settings.thumbnailWidth,a.settings.thumbnailHeight),a.thumbnailsSize+="horizontal"===a.thumbnailsOrientation?c.getSize().width:c.getSize().height}),"horizontal"===this.thumbnailsOrientation?(this.$thumbnails.css({width:this.thumbnailsSize,height:this.settings.thumbnailHeight}),this.$thumbnailsContainer.css("height",""),this.thumbnailsPositionProperty="left"):(this.$thumbnails.css({width:this.settings.thumbnailWidth,height:this.thumbnailsSize}),this.$thumbnailsContainer.css("width",""),this.thumbnailsPositionProperty="top"),this.trigger({type:"thumbnailsUpdate"}),b.isFunction(this.settings.thumbnailsUpdate)&&this.settings.thumbnailsUpdate.call(this,{type:"thumbnailsUpdate"})},_createThumbnail:function(a,b){var d=this,f=new e(a,this.$thumbnails,b);f.on("thumbnailClick."+c,function(a){d.gotoSlide(a.index)}),this.thumbnails.splice(b,0,f)},_thumbnailsOnResize:function(){if(this.isThumbnailScroller!==!1){var c,d=this;"horizontal"===this.thumbnailsOrientation?(this.thumbnailsContainerSize=Math.min(this.$slidesMask.width(),this.thumbnailsSize),this.$thumbnailsContainer.css("width",this.thumbnailsContainerSize),"fullWindow"===this.settings.forceSize&&(this.$slidesMask.css("height",this.$slidesMask.height()-this.$thumbnailsContainer.outerHeight(!0)),this.slideHeight=this.$slidesMask.height(),b.each(this.slides,function(a,b){b.setSize(d.slideWidth,d.slideHeight)}))):"vertical"===this.thumbnailsOrientation&&(this.$slidesMask.width()+this.$thumbnailsContainer.outerWidth(!0)>this.$slider.parent().width()&&("fullWidth"===this.settings.forceSize||"fullWindow"===this.settings.forceSize?this.$slider.css("max-width",b(a).width()-this.$thumbnailsContainer.outerWidth(!0)):this.$slider.css("max-width",this.$slider.parent().width()-this.$thumbnailsContainer.outerWidth(!0)),this.$slidesMask.css("width",this.$slider.width()),"horizontal"===this.settings.orientation?(this.visibleOffset=Math.round((this.$slider.width()-this.slideSize)/2),this.visibleSlidesSize=this.$slidesMask.width()):"vertical"===this.settings.orientation&&(this.slideWidth=this.$slider.width(),b.each(this.slides,function(a,b){b.setSize(d.slideWidth,d.slideHeight)})),this._resetSlidesPosition()),this.thumbnailsContainerSize=Math.min(this.$slidesMask.height(),this.thumbnailsSize),this.$thumbnailsContainer.css("height",this.thumbnailsContainerSize)),c=this.thumbnailsSize<=this.thumbnailsContainerSize||0===this.$thumbnails.find(".sp-selected-thumbnail").length?0:Math.max(-this.thumbnails[this.selectedThumbnailIndex].getPosition()[this.thumbnailsPositionProperty],this.thumbnailsContainerSize-this.thumbnailsSize),"top"===this.settings.thumbnailsPosition?this.$slider.css({paddingTop:this.$thumbnailsContainer.outerHeight(!0),paddingLeft:"",paddingRight:""}):"bottom"===this.settings.thumbnailsPosition?this.$slider.css({paddingTop:"",paddingLeft:"",paddingRight:""}):"left"===this.settings.thumbnailsPosition?this.$slider.css({paddingTop:"",paddingLeft:this.$thumbnailsContainer.outerWidth(!0),paddingRight:""}):"right"===this.settings.thumbnailsPosition&&this.$slider.css({paddingTop:"",paddingLeft:"",paddingRight:this.$thumbnailsContainer.outerWidth(!0)}),this._moveThumbnailsTo(c,!0)}},_gotoThumbnail:function(a){if(this.isThumbnailScroller!==!1&&"undefined"!=typeof this.thumbnails[a]){var c=this.selectedThumbnailIndex,d=this.thumbnailsPosition;if(this.selectedThumbnailIndex=a,this.$thumbnails.find(".sp-selected-thumbnail").removeClass("sp-selected-thumbnail"),this.$thumbnails.find(".sp-thumbnail-container").eq(this.selectedThumbnailIndex).addClass("sp-selected-thumbnail"),this.selectedThumbnailIndex>=c){var e=this.selectedThumbnailIndex===this.thumbnails.length-1?this.selectedThumbnailIndex:this.selectedThumbnailIndex+1,f=this.thumbnails[e],g="horizontal"===this.thumbnailsOrientation?f.getPosition().right:f.getPosition().bottom,h=-this.thumbnailsPosition+this.thumbnailsContainerSize;g>h&&(d=this.thumbnailsPosition-(g-h))}else if(this.selectedThumbnailIndex<c){var i=0===this.selectedThumbnailIndex?this.selectedThumbnailIndex:this.selectedThumbnailIndex-1,j=this.thumbnails[i],k="horizontal"===this.thumbnailsOrientation?j.getPosition().left:j.getPosition().top;k<-this.thumbnailsPosition&&(d=-k)}this._moveThumbnailsTo(d),this.trigger({type:"gotoThumbnail"}),b.isFunction(this.settings.gotoThumbnail)&&this.settings.gotoThumbnail.call(this,{type:"gotoThumbnail"})}},_moveThumbnailsTo:function(a,c,d){var e=this,f={};if(a!==this.thumbnailsPosition)if(this.thumbnailsPosition=a,"css-3d"===this.supportedAnimation||"css-2d"===this.supportedAnimation){var g,h="horizontal"===this.thumbnailsOrientation?a:0,i="horizontal"===this.thumbnailsOrientation?0:a;"css-3d"===this.supportedAnimation?f[this.vendorPrefix+"transform"]="translate3d("+h+"px, "+i+"px, 0)":f[this.vendorPrefix+"transform"]="translate("+h+"px, "+i+"px)","undefined"!=typeof c&&c===!0?g="":(this.$thumbnails.addClass("sp-animated"),g=this.vendorPrefix+"transform 0.7s",this.$thumbnails.on(this.transitionEvent,function(a){a.target===a.currentTarget&&(e.$thumbnails.off(e.transitionEvent),e.$thumbnails.removeClass("sp-animated"),"function"==typeof d&&d(),e.trigger({type:"thumbnailsMoveComplete"}),b.isFunction(e.settings.thumbnailsMoveComplete)&&e.settings.thumbnailsMoveComplete.call(e,{type:"thumbnailsMoveComplete"}))})),f[this.vendorPrefix+"transition"]=g,this.$thumbnails.css(f)}else f["margin-"+this.thumbnailsPositionProperty]=a,"undefined"!=typeof c&&c===!0?this.$thumbnails.css(f):this.$thumbnails.addClass("sp-animated").animate(f,700,function(){e.$thumbnails.removeClass("sp-animated"),"function"==typeof d&&d(),e.trigger({type:"thumbnailsMoveComplete"}),b.isFunction(e.settings.thumbnailsMoveComplete)&&e.settings.thumbnailsMoveComplete.call(e,{type:"thumbnailsMoveComplete"})})},_stopThumbnailsMovement:function(){var a={};if("css-3d"===this.supportedAnimation||"css-2d"===this.supportedAnimation){var b=this.$thumbnails.css(this.vendorPrefix+"transform"),c=-1!==b.indexOf("matrix3d")?"matrix3d":"matrix",d=b.replace(c,"").match(/-?[0-9\.]+/g),e="matrix3d"===c?parseInt(d[12],10):parseInt(d[4],10),f="matrix3d"===c?parseInt(d[13],10):parseInt(d[5],10);"css-3d"===this.supportedAnimation?a[this.vendorPrefix+"transform"]="translate3d("+e+"px, "+f+"px, 0)":a[this.vendorPrefix+"transform"]="translate("+e+"px, "+f+"px)",a[this.vendorPrefix+"transition"]="",this.$thumbnails.css(a),this.$thumbnails.off(this.transitionEvent),this.thumbnailsPosition="horizontal"===this.thumbnailsOrientation?parseInt(d[4],10):parseInt(d[5],10)}else this.$thumbnails.stop(),this.thumbnailsPosition=parseInt(this.$thumbnails.css("margin-"+this.thumbnailsPositionProperty),10);this.$thumbnails.removeClass("sp-animated")},destroyThumbnails:function(){var d=this;this.off("update."+c),this.isThumbnailScroller!==!1&&(this.off("sliderResize."+c),this.off("gotoSlide."+c),b(a).off("resize."+this.uniqueId+"."+c),this.$thumbnails.find(".sp-thumbnail").each(function(){var a=b(this),e=parseInt(a.attr("data-index"),10),f=d.thumbnails[e];f.off("thumbnailClick."+c),f.destroy()}),this.thumbnails.length=0,this.$thumbnails.appendTo(this.$slider),this.$thumbnailsContainer.remove(),this.$slider.css({paddingTop:"",paddingLeft:"",paddingRight:""}))},thumbnailsDefaults:{
thumbnailWidth:100,thumbnailHeight:80,thumbnailsPosition:"bottom",thumbnailPointer:!1,thumbnailsUpdate:function(){},gotoThumbnail:function(){},thumbnailsMoveComplete:function(){}}},e=function(a,b,c){this.$thumbnail=a,this.$thumbnails=b,this.$thumbnailContainer=null,this.width=0,this.height=0,this.isImageLoaded=!1,this.setIndex(c),this._init()};e.prototype={_init:function(){var a=this;this.$thumbnail.attr("data-init",!0),this.$thumbnailContainer=b('<div class="sp-thumbnail-container"></div>').appendTo(this.$thumbnails),0!==this.$thumbnail.parent("a").length?this.$thumbnail.parent("a").appendTo(this.$thumbnailContainer):this.$thumbnail.appendTo(this.$thumbnailContainer),this.$thumbnailContainer.on("click."+c,function(){a.trigger({type:"thumbnailClick."+c,index:a.index})})},setSize:function(a,b){this.width=a,this.height=b,this.$thumbnailContainer.css({width:this.width,height:this.height}),this.$thumbnail.is("img")&&"undefined"==typeof this.$thumbnail.attr("data-src")&&this.resizeImage()},getSize:function(){return{width:this.$thumbnailContainer.outerWidth(!0),height:this.$thumbnailContainer.outerHeight(!0)}},getPosition:function(){return{left:this.$thumbnailContainer.position().left+parseInt(this.$thumbnailContainer.css("marginLeft"),10),right:this.$thumbnailContainer.position().left+parseInt(this.$thumbnailContainer.css("marginLeft"),10)+this.$thumbnailContainer.outerWidth(),top:this.$thumbnailContainer.position().top+parseInt(this.$thumbnailContainer.css("marginTop"),10),bottom:this.$thumbnailContainer.position().top+parseInt(this.$thumbnailContainer.css("marginTop"),10)+this.$thumbnailContainer.outerHeight()}},setIndex:function(a){this.index=a,this.$thumbnail.attr("data-index",this.index)},resizeImage:function(){var a=this;if(this.isImageLoaded===!1)return void SliderProUtils.checkImagesComplete(this.$thumbnailContainer,function(){a.isImageLoaded=!0,a.resizeImage()});this.$thumbnail=this.$thumbnailContainer.find(".sp-thumbnail");var b=this.$thumbnail.width(),c=this.$thumbnail.height();b/c<=this.width/this.height?this.$thumbnail.css({width:"100%",height:"auto"}):this.$thumbnail.css({width:"auto",height:"100%"}),this.$thumbnail.css({marginLeft:.5*(this.$thumbnailContainer.width()-this.$thumbnail.width()),marginTop:.5*(this.$thumbnailContainer.height()-this.$thumbnail.height())})},destroy:function(){this.$thumbnailContainer.off("click."+c),this.$thumbnail.removeAttr("data-init"),this.$thumbnail.removeAttr("data-index"),0!==this.$thumbnail.parent("a").length?this.$thumbnail.parent("a").insertBefore(this.$thumbnailContainer):this.$thumbnail.insertBefore(this.$thumbnailContainer),this.$thumbnailContainer.remove()},on:function(a,b){return this.$thumbnailContainer.on(a,b)},off:function(a){return this.$thumbnailContainer.off(a)},trigger:function(a){return this.$thumbnailContainer.triggerHandler(a)}},b.SliderPro.addModule("Thumbnails",d)}(window,jQuery),function(a,b){"use strict";var c="ConditionalImages."+b.SliderPro.namespace,d={previousImageSize:null,currentImageSize:null,isRetinaScreen:!1,initConditionalImages:function(){this.currentImageSize=this.previousImageSize="default",this.isRetinaScreen="undefined"!=typeof this._isRetina&&this._isRetina()===!0,this.on("update."+c,b.proxy(this._conditionalImagesOnUpdate,this)),this.on("sliderResize."+c,b.proxy(this._conditionalImagesOnResize,this))},_conditionalImagesOnUpdate:function(){b.each(this.slides,function(a,c){var d=c.$slide;d.find("img:not([ data-default ])").each(function(){var a=b(this);"undefined"!=typeof a.attr("data-src")?a.attr("data-default",a.attr("data-src")):a.attr("data-default",a.attr("src"))})})},_conditionalImagesOnResize:function(){if(this.slideWidth<=this.settings.smallSize?this.currentImageSize="small":this.slideWidth<=this.settings.mediumSize?this.currentImageSize="medium":this.slideWidth<=this.settings.largeSize?this.currentImageSize="large":this.currentImageSize="default",this.previousImageSize!==this.currentImageSize){var a=this;b.each(this.slides,function(c,d){var e=d.$slide;e.find("img").each(function(){var c=b(this),e="";a.isRetinaScreen===!0&&"undefined"!=typeof c.attr("data-retina"+a.currentImageSize)?(e=c.attr("data-retina"+a.currentImageSize),"undefined"!=typeof c.attr("data-retina")&&c.attr("data-retina")!==e&&c.attr("data-retina",e)):(a.isRetinaScreen===!1||a.isRetinaScreen===!0&&"undefined"==typeof c.attr("data-retina"))&&"undefined"!=typeof c.attr("data-"+a.currentImageSize)&&(e=c.attr("data-"+a.currentImageSize),"undefined"!=typeof c.attr("data-src")&&c.attr("data-src")!==e&&c.attr("data-src",e)),""!==e&&"undefined"==typeof c.attr("data-src")&&c.attr("src")!==e&&a._loadConditionalImage(c,e,function(a){a.hasClass("sp-image")&&(d.$mainImage=a,d.resizeMainImage(!0))})})}),this.previousImageSize=this.currentImageSize}},_loadConditionalImage:function(a,c,d){var e=b(new Image);e.attr("class",a.attr("class")),e.attr("style",a.attr("style")),b.each(a.data(),function(a,b){e.attr("data-"+a,b)}),"undefined"!=typeof a.attr("width")&&e.attr("width",a.attr("width")),"undefined"!=typeof a.attr("height")&&e.attr("height",a.attr("height")),"undefined"!=typeof a.attr("alt")&&e.attr("alt",a.attr("alt")),"undefined"!=typeof a.attr("title")&&e.attr("title",a.attr("title")),e.attr("src",c),e.insertAfter(a),a.remove(),a=null,"function"==typeof d&&d(e)},destroyConditionalImages:function(){this.off("update."+c),this.off("sliderResize."+c)},conditionalImagesDefaults:{smallSize:480,mediumSize:768,largeSize:1024}};b.SliderPro.addModule("ConditionalImages",d)}(window,jQuery),function(a,b){"use strict";var c="Retina."+b.SliderPro.namespace,d={initRetina:function(){this._isRetina()!==!1&&(this.on("update."+c,b.proxy(this._checkRetinaImages,this)),0!==this.$slider.find(".sp-thumbnail").length&&this.on("update.Thumbnails."+c,b.proxy(this._checkRetinaThumbnailImages,this)))},_isRetina:function(){return a.devicePixelRatio>=2?!0:a.matchMedia&&a.matchMedia("(-webkit-min-device-pixel-ratio: 2),(min-resolution: 2dppx)").matches?!0:!1},_checkRetinaImages:function(){var a=this;b.each(this.slides,function(c,d){var e=d.$slide;"undefined"==typeof e.attr("data-retina-loaded")&&(e.attr("data-retina-loaded",!0),e.find("img[data-retina]").each(function(){var c=b(this);"undefined"!=typeof c.attr("data-src")?c.attr("data-src",c.attr("data-retina")):a._loadRetinaImage(c,function(a){a.hasClass("sp-image")&&(d.$mainImage=a,d.resizeMainImage(!0))})}))})},_checkRetinaThumbnailImages:function(){var a=this;b.each(this.thumbnails,function(c,d){var e=d.$thumbnailContainer;"undefined"==typeof e.attr("data-retina-loaded")&&(e.attr("data-retina-loaded",!0),e.find("img[data-retina]").each(function(){var c=b(this);"undefined"!=typeof c.attr("data-src")?c.attr("data-src",c.attr("data-retina")):a._loadRetinaImage(c,function(a){a.hasClass("sp-thumbnail")&&d.resizeImage()})}))})},_loadRetinaImage:function(a,c){var d=!1,e="";if("undefined"!=typeof a.attr("data-retina")&&(d=!0,e=a.attr("data-retina")),"undefined"!=typeof a.attr("data-src")&&(d===!1&&(e=a.attr("data-src")),a.removeAttr("data-src")),""!==e){var f=b(new Image);f.attr("class",a.attr("class")),f.attr("style",a.attr("style")),b.each(a.data(),function(a,b){f.attr("data-"+a,b)}),"undefined"!=typeof a.attr("width")&&f.attr("width",a.attr("width")),"undefined"!=typeof a.attr("height")&&f.attr("height",a.attr("height")),"undefined"!=typeof a.attr("alt")&&f.attr("alt",a.attr("alt")),"undefined"!=typeof a.attr("title")&&f.attr("title",a.attr("title")),f.insertAfter(a),a.remove(),a=null,f.attr("src",e),"function"==typeof c&&c(f)}},destroyRetina:function(){this.off("update."+c),this.off("update.Thumbnails."+c)}};b.SliderPro.addModule("Retina",d)}(window,jQuery),function(a,b){"use strict";var c="LazyLoading."+b.SliderPro.namespace,d={allowLazyLoadingCheck:!0,initLazyLoading:function(){this.on("sliderResize."+c,b.proxy(this._lazyLoadingOnResize,this)),this.on("gotoSlide."+c,b.proxy(this._checkAndLoadVisibleImages,this)),this.on("thumbnailsUpdate."+c+" thumbnailsMoveComplete."+c,b.proxy(this._checkAndLoadVisibleThumbnailImages,this))},_lazyLoadingOnResize:function(){var a=this;this.allowLazyLoadingCheck!==!1&&(this.allowLazyLoadingCheck=!1,this._checkAndLoadVisibleImages(),0!==this.$slider.find(".sp-thumbnail").length&&this._checkAndLoadVisibleThumbnailImages(),setTimeout(function(){a.allowLazyLoadingCheck=!0},500))},_checkAndLoadVisibleImages:function(){if(0!==this.$slider.find(".sp-slide:not([ data-loaded ])").length){var a=this,c=this.settings.loop===!0?this.middleSlidePosition:this.selectedSlideIndex,d=Math.ceil((this.visibleSlidesSize-this.slideSize)/2/this.slideSize),e=c-d-1>0?c-d-1:0,f=c+d+1<this.getTotalSlides()-1?c+d+1:this.getTotalSlides()-1,g=this.slidesOrder.slice(e,f+1);b.each(g,function(c,d){var e=a.slides[d],f=e.$slide;"undefined"==typeof f.attr("data-loaded")&&(f.attr("data-loaded",!0),f.find("img[ data-src ]").each(function(){var c=b(this);a._loadImage(c,function(a){a.hasClass("sp-image")&&(e.$mainImage=a,e.resizeMainImage(!0))})}))})}},_checkAndLoadVisibleThumbnailImages:function(){if(0!==this.$slider.find(".sp-thumbnail-container:not([ data-loaded ])").length){var a=this,c=this.thumbnailsSize/this.thumbnails.length,d=Math.floor(Math.abs(this.thumbnailsPosition/c)),e=Math.floor((-this.thumbnailsPosition+this.thumbnailsContainerSize)/c),f=this.thumbnails.slice(d,e+1);b.each(f,function(c,d){var e=d.$thumbnailContainer;"undefined"==typeof e.attr("data-loaded")&&(e.attr("data-loaded",!0),e.find("img[ data-src ]").each(function(){var c=b(this);a._loadImage(c,function(){d.resizeImage()})}))})}},_loadImage:function(a,c){var d=b(new Image);d.attr("class",a.attr("class")),d.attr("style",a.attr("style")),b.each(a.data(),function(a,b){d.attr("data-"+a,b)}),"undefined"!=typeof a.attr("width")&&d.attr("width",a.attr("width")),"undefined"!=typeof a.attr("height")&&d.attr("height",a.attr("height")),"undefined"!=typeof a.attr("alt")&&d.attr("alt",a.attr("alt")),"undefined"!=typeof a.attr("title")&&d.attr("title",a.attr("title")),d.attr("src",a.attr("data-src")),d.removeAttr("data-src"),d.insertAfter(a),a.remove(),a=null,"function"==typeof c&&c(d)},destroyLazyLoading:function(){this.off("update."+c),this.off("gotoSlide."+c),this.off("sliderResize."+c),this.off("thumbnailsUpdate."+c),this.off("thumbnailsMoveComplete."+c)}};b.SliderPro.addModule("LazyLoading",d)}(window,jQuery),function(a,b){"use strict";var c="Layers."+b.SliderPro.namespace,d={layersGotoSlideReference:null,waitForLayersTimer:null,initLayers:function(){this.on("update."+c,b.proxy(this._layersOnUpdate,this)),this.on("sliderResize."+c,b.proxy(this._layersOnResize,this)),this.on("gotoSlide."+c,b.proxy(this._layersOnGotoSlide,this))},_layersOnUpdate:function(a){var c=this;b.each(this.slides,function(a,c){c.$slide;this.$slide.find(".sp-layer:not([ data-layer-init ])").each(function(){var a=new f(b(this));"undefined"==typeof c.layers&&(c.layers=[]),c.layers.push(a),b(this).hasClass("sp-static")===!1&&("undefined"==typeof c.animatedLayers&&(c.animatedLayers=[]),c.animatedLayers.push(a))})}),this.settings.waitForLayers===!0&&(clearTimeout(this.waitForLayersTimer),this.waitForLayersTimer=setTimeout(function(){c.layersGotoSlideReference=c.gotoSlide,c.gotoSlide=c._layersGotoSlide},1)),setTimeout(function(){c.showLayers(c.selectedSlideIndex)},1)},_layersOnResize:function(){var a,c,d=this,e=this.settings.autoScaleLayers;this.settings.autoScaleLayers!==!1&&(-1===this.settings.autoScaleReference?"string"==typeof this.settings.width&&-1!==this.settings.width.indexOf("%")?e=!1:a=parseInt(this.settings.width,10):a=this.settings.autoScaleReference,c=e===!0&&this.slideWidth<a?d.slideWidth/a:1,b.each(this.slides,function(a,d){"undefined"!=typeof d.layers&&b.each(d.layers,function(a,b){b.scale(c)})}))},_layersGotoSlide:function(a){var b=this,d=this.slides[this.selectedSlideIndex].animatedLayers;this.$slider.hasClass("sp-swiping")||"undefined"==typeof d||0===d.length?this.layersGotoSlideReference(a):(this.on("hideLayersComplete."+c,function(){b.off("hideLayersComplete."+c),b.layersGotoSlideReference(a)}),this.hideLayers(this.selectedSlideIndex))},_layersOnGotoSlide:function(a){this.previousSlideIndex!==this.selectedSlideIndex&&this.settings.waitForLayers===!1&&this.hideLayers(this.previousSlideIndex),this.showLayers(this.selectedSlideIndex)},showLayers:function(a){var c=this,d=this.slides[a].animatedLayers,e=0;"undefined"!=typeof d&&b.each(d,function(a,f){f.isVisible()===!0?(e++,e===d.length&&(c.trigger({type:"showLayersComplete",index:a}),b.isFunction(c.settings.showLayersComplete)&&c.settings.showLayersComplete.call(c,{type:"showLayersComplete",index:a}))):f.show(function(){e++,e===d.length&&(c.trigger({type:"showLayersComplete",index:a}),b.isFunction(c.settings.showLayersComplete)&&c.settings.showLayersComplete.call(c,{type:"showLayersComplete",index:a}))})})},hideLayers:function(a){var c=this,d=this.slides[a].animatedLayers,e=0;"undefined"!=typeof d&&b.each(d,function(a,f){f.isVisible()===!1?(e++,e===d.length&&(c.trigger({type:"hideLayersComplete",index:a}),b.isFunction(c.settings.hideLayersComplete)&&c.settings.hideLayersComplete.call(c,{type:"hideLayersComplete",index:a}))):f.hide(function(){e++,e===d.length&&(c.trigger({type:"hideLayersComplete",index:a}),b.isFunction(c.settings.hideLayersComplete)&&c.settings.hideLayersComplete.call(c,{type:"hideLayersComplete",index:a}))})})},destroyLayers:function(){this.off("update."+c),this.off("resize."+c),this.off("gotoSlide."+c),this.off("hideLayersComplete."+c)},layersDefaults:{waitForLayers:!1,autoScaleLayers:!0,autoScaleReference:-1,showLayersComplete:function(){},hideLayersComplete:function(){}}},e=a.SliderProSlide.prototype.destroy;a.SliderProSlide.prototype.destroy=function(){"undefined"!=typeof this.layers&&(b.each(this.layers,function(a,b){b.destroy()}),this.layers.length=0),"undefined"!=typeof this.animatedLayers&&(this.animatedLayers.length=0),e.apply(this)};var f=function(a){this.$layer=a,this.visible=!1,this.styled=!1,this.data=null,this.position=null,this.horizontalProperty=null,this.verticalProperty=null,this.horizontalPosition=null,this.verticalPosition=null,this.scaleRatio=1,this.supportedAnimation=SliderProUtils.getSupportedAnimation(),this.vendorPrefix=SliderProUtils.getVendorPrefix(),this.transitionEvent=SliderProUtils.getTransitionEvent(),this.stayTimer=null,this._init()};f.prototype={_init:function(){this.$layer.attr("data-layer-init",!0),this.$layer.hasClass("sp-static")?this._setStyle():this.$layer.css({visibility:"hidden"})},_setStyle:function(){this.styled=!0,this.data=this.$layer.data(),"undefined"!=typeof this.data.width&&this.$layer.css("width",this.data.width),"undefined"!=typeof this.data.height&&this.$layer.css("height",this.data.height),"undefined"!=typeof this.data.depth&&this.$layer.css("z-index",this.data.depth),this.position=this.data.position?this.data.position.toLowerCase():"topleft",-1!==this.position.indexOf("right")?this.horizontalProperty="right":-1!==this.position.indexOf("left")?this.horizontalProperty="left":this.horizontalProperty="center",-1!==this.position.indexOf("bottom")?this.verticalProperty="bottom":-1!==this.position.indexOf("top")?this.verticalProperty="top":this.verticalProperty="center",this._setPosition(),this.scale(this.scaleRatio)},_setPosition:function(){var a=this.$layer.attr("style");this.horizontalPosition="undefined"!=typeof this.data.horizontal?this.data.horizontal:0,this.verticalPosition="undefined"!=typeof this.data.vertical?this.data.vertical:0,"center"===this.horizontalProperty?(this.$layer.is("img")===!1&&("undefined"==typeof a||"undefined"!=typeof a&&-1===a.indexOf("width"))&&(this.$layer.css("white-space","nowrap"),this.$layer.css("width",this.$layer.outerWidth(!0))),this.$layer.css({marginLeft:"auto",marginRight:"auto",left:this.horizontalPosition,right:0})):this.$layer.css(this.horizontalProperty,this.horizontalPosition),"center"===this.verticalProperty?(this.$layer.is("img")===!1&&("undefined"==typeof a||"undefined"!=typeof a&&-1===a.indexOf("height"))&&(this.$layer.css("white-space","nowrap"),this.$layer.css("height",this.$layer.outerHeight(!0))),this.$layer.css({marginTop:"auto",marginBottom:"auto",top:this.verticalPosition,bottom:0})):this.$layer.css(this.verticalProperty,this.verticalPosition)},scale:function(a){if(!this.$layer.hasClass("sp-no-scale")&&(this.scaleRatio=a,this.styled!==!1)){var b="center"===this.horizontalProperty?"left":this.horizontalProperty,c="center"===this.verticalProperty?"top":this.verticalProperty,d={};d[this.vendorPrefix+"transform-origin"]=this.horizontalProperty+" "+this.verticalProperty,d[this.vendorPrefix+"transform"]="scale("+this.scaleRatio+")","string"!=typeof this.horizontalPosition&&(d[b]=this.horizontalPosition*this.scaleRatio),"string"!=typeof this.verticalPosition&&(d[c]=this.verticalPosition*this.scaleRatio),"string"==typeof this.data.width&&-1!==this.data.width.indexOf("%")&&(d.width=(parseInt(this.data.width,10)/this.scaleRatio).toString()+"%"),"string"==typeof this.data.height&&-1!==this.data.height.indexOf("%")&&(d.height=(parseInt(this.data.height,10)/this.scaleRatio).toString()+"%"),this.$layer.css(d)}},show:function(a){if(this.visible!==!0){this.visible=!0,this.styled===!1&&this._setStyle();var b=this,c="undefined"!=typeof this.data.showOffset?this.data.showOffset:50,d="undefined"!=typeof this.data.showDuration?this.data.showDuration/1e3:.4,e="undefined"!=typeof this.data.showDelay?this.data.showDelay:10,f="undefined"!=typeof b.data.stayDuration?parseInt(b.data.stayDuration,10):-1;if("javascript"===this.supportedAnimation)this.$layer.stop().delay(e).css({opacity:0,visibility:"visible"}).animate({opacity:1},1e3*d,function(){-1!==f&&(b.stayTimer=setTimeout(function(){b.hide(),b.stayTimer=null},f)),"undefined"!=typeof a&&a()});else{var g={opacity:0,visibility:"visible"},h={opacity:1},i="";g[this.vendorPrefix+"transform"]="scale("+this.scaleRatio+")",h[this.vendorPrefix+"transform"]="scale("+this.scaleRatio+")",h[this.vendorPrefix+"transition"]="opacity "+d+"s","undefined"!=typeof this.data.showTransition&&("left"===this.data.showTransition?i=c+"px, 0":"right"===this.data.showTransition?i="-"+c+"px, 0":"up"===this.data.showTransition?i="0, "+c+"px":"down"===this.data.showTransition&&(i="0, -"+c+"px"),g[this.vendorPrefix+"transform"]+="css-3d"===this.supportedAnimation?" translate3d("+i+", 0)":" translate("+i+")",h[this.vendorPrefix+"transform"]+="css-3d"===this.supportedAnimation?" translate3d(0, 0, 0)":" translate(0, 0)",h[this.vendorPrefix+"transition"]+=", "+this.vendorPrefix+"transform "+d+"s"),this.$layer.on(this.transitionEvent,function(c){c.target===c.currentTarget&&(b.$layer.off(b.transitionEvent).css(b.vendorPrefix+"transition",""),-1!==f&&(b.stayTimer=setTimeout(function(){b.hide(),b.stayTimer=null},f)),"undefined"!=typeof a&&a())}),this.$layer.css(g),setTimeout(function(){b.$layer.css(h)},e)}}},hide:function(a){if(this.visible!==!1){var c=this,d="undefined"!=typeof this.data.hideOffset?this.data.hideOffset:50,e="undefined"!=typeof this.data.hideDuration?this.data.hideDuration/1e3:.4,f="undefined"!=typeof this.data.hideDelay?this.data.hideDelay:10;if(this.visible=!1,null!==this.stayTimer&&clearTimeout(this.stayTimer),"javascript"===this.supportedAnimation)this.$layer.stop().delay(f).animate({opacity:0},1e3*e,function(){b(this).css("visibility","hidden"),"undefined"!=typeof a&&a()});else{var g="",h={opacity:0};h[this.vendorPrefix+"transform"]="scale("+this.scaleRatio+")",h[this.vendorPrefix+"transition"]="opacity "+e+"s","undefined"!=typeof this.data.hideTransition&&("left"===this.data.hideTransition?g="-"+d+"px, 0":"right"===this.data.hideTransition?g=d+"px, 0":"up"===this.data.hideTransition?g="0, -"+d+"px":"down"===this.data.hideTransition&&(g="0, "+d+"px"),h[this.vendorPrefix+"transform"]+="css-3d"===this.supportedAnimation?" translate3d("+g+", 0)":" translate("+g+")",h[this.vendorPrefix+"transition"]+=", "+this.vendorPrefix+"transform "+e+"s"),this.$layer.on(this.transitionEvent,function(b){b.target===b.currentTarget&&(c.$layer.off(c.transitionEvent).css(c.vendorPrefix+"transition",""),c.visible===!1&&c.$layer.css("visibility","hidden"),"undefined"!=typeof a&&a())}),setTimeout(function(){c.$layer.css(h)},f)}}},isVisible:function(){return this.visible===!1||this.$layer.is(":hidden")?!1:!0},destroy:function(){this.$layer.removeAttr("style"),this.$layer.removeAttr("data-layer-init")}},b.SliderPro.addModule("Layers",d)}(window,jQuery),function(a,b){"use strict";var c="Fade."+b.SliderPro.namespace,d={fadeGotoSlideReference:null,initFade:function(){this.on("update."+c,b.proxy(this._fadeOnUpdate,this))},_fadeOnUpdate:function(){this.settings.fade===!0&&(this.fadeGotoSlideReference=this.gotoSlide,this.gotoSlide=this._fadeGotoSlide)},_fadeGotoSlide:function(a){if(a!==this.selectedSlideIndex)if(this.$slider.hasClass("sp-swiping"))this.fadeGotoSlideReference(a);else{var c,d,e=this,f=a;b.each(this.slides,function(a,b){var g=b.getIndex(),h=b.$slide;g===f?(h.css({opacity:0,left:0,top:0,"z-index":20}),c=h):g===e.selectedSlideIndex?(h.css({opacity:1,left:0,top:0,"z-index":10}),d=h):h.css("visibility","hidden")}),this.previousSlideIndex=this.selectedSlideIndex,this.selectedSlideIndex=a,this.$slides.find(".sp-selected").removeClass("sp-selected"),this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).addClass("sp-selected"),e.settings.loop===!0&&e._updateSlidesOrder(),this._moveTo(this.visibleOffset,!0),this.settings.fadeOutPreviousSlide===!0&&this._fadeSlideTo(d,0),this._fadeSlideTo(c,1,function(){b.each(e.slides,function(a,b){var c=b.$slide;c.css({visibility:"",opacity:"","z-index":""})}),e._resetSlidesPosition(),e.trigger({type:"gotoSlideComplete",index:a,previousIndex:e.previousSlideIndex}),b.isFunction(e.settings.gotoSlideComplete)&&e.settings.gotoSlideComplete.call(e,{type:"gotoSlideComplete",index:a,previousIndex:e.previousSlideIndex})}),this.settings.autoHeight===!0&&this._resizeHeight(),this.trigger({type:"gotoSlide",index:a,previousIndex:this.previousSlideIndex}),b.isFunction(this.settings.gotoSlide)&&this.settings.gotoSlide.call(this,{type:"gotoSlide",index:a,previousIndex:this.previousSlideIndex})}},_fadeSlideTo:function(a,b,c){var d=this;"css-3d"===this.supportedAnimation||"css-2d"===this.supportedAnimation?(setTimeout(function(){var c={opacity:b};c[d.vendorPrefix+"transition"]="opacity "+d.settings.fadeDuration/1e3+"s",a.css(c)},100),a.on(this.transitionEvent,function(b){b.target===b.currentTarget&&(a.off(d.transitionEvent),a.css(d.vendorPrefix+"transition",""),"function"==typeof c&&c())})):a.stop().animate({opacity:b},this.settings.fadeDuration,function(){"function"==typeof c&&c()})},destroyFade:function(){this.off("update."+c),null!==this.fadeGotoSlideReference&&(this.gotoSlide=this.fadeGotoSlideReference)},fadeDefaults:{fade:!1,fadeOutPreviousSlide:!0,fadeDuration:500}};b.SliderPro.addModule("Fade",d)}(window,jQuery),function(a,b){"use strict";var c="TouchSwipe."+b.SliderPro.namespace,d={touchStartPoint:{x:0,y:0},touchEndPoint:{x:0,y:0},touchDistance:{x:0,y:0},touchStartPosition:0,isTouchMoving:!1,touchSwipeEvents:{startEvent:"",moveEvent:"",endEvent:""},initTouchSwipe:function(){this.settings.touchSwipe!==!1&&(this.touchSwipeEvents.startEvent="touchstart."+c+" mousedown."+c,this.touchSwipeEvents.moveEvent="touchmove."+c+" mousemove."+c,this.touchSwipeEvents.endEvent="touchend."+this.uniqueId+"."+c+" mouseup."+this.uniqueId+"."+c,this.$slidesMask.on(this.touchSwipeEvents.startEvent,b.proxy(this._onTouchStart,this)),this.$slidesMask.on("dragstart."+c,function(a){a.preventDefault()}),this.$slidesMask.addClass("sp-grab"))},_onTouchStart:function(a){if(!(b(a.target).closest(".sp-selectable").length>=1)){var d="undefined"!=typeof a.originalEvent.touches?a.originalEvent.touches[0]:a.originalEvent;"undefined"==typeof a.originalEvent.touches&&a.preventDefault(),b(a.target).parents(".sp-slide").find("a").one("click."+c,function(a){a.preventDefault()}),this.touchStartPoint.x=d.pageX||d.clientX,this.touchStartPoint.y=d.pageY||d.clientY,this.touchStartPosition=this.slidesPosition,this.touchDistance.x=this.touchDistance.y=0,this.$slides.hasClass("sp-animated")&&(this.isTouchMoving=!0,this._stopMovement(),this.touchStartPosition=this.slidesPosition),this.$slidesMask.on(this.touchSwipeEvents.moveEvent,b.proxy(this._onTouchMove,this)),b(document).on(this.touchSwipeEvents.endEvent,b.proxy(this._onTouchEnd,this)),this.$slidesMask.removeClass("sp-grab").addClass("sp-grabbing"),this.$slider.addClass("sp-swiping")}},_onTouchMove:function(a){var b="undefined"!=typeof a.originalEvent.touches?a.originalEvent.touches[0]:a.originalEvent;this.isTouchMoving=!0,this.touchEndPoint.x=b.pageX||b.clientX,this.touchEndPoint.y=b.pageY||b.clientY,this.touchDistance.x=this.touchEndPoint.x-this.touchStartPoint.x,this.touchDistance.y=this.touchEndPoint.y-this.touchStartPoint.y;var c="horizontal"===this.settings.orientation?this.touchDistance.x:this.touchDistance.y,d="horizontal"===this.settings.orientation?this.touchDistance.y:this.touchDistance.x;Math.abs(c)>Math.abs(d)&&(a.preventDefault(),this.settings.loop===!1&&(this.slidesPosition>this.touchStartPosition&&0===this.selectedSlideIndex||this.slidesPosition<this.touchStartPosition&&this.selectedSlideIndex===this.getTotalSlides()-1)&&(c=.2*c),this._moveTo(this.touchStartPosition+c,!0))},_onTouchEnd:function(a){var d=this,e="horizontal"===this.settings.orientation?this.touchDistance.x:this.touchDistance.y;if(this.$slidesMask.off(this.touchSwipeEvents.moveEvent),b(document).off(this.touchSwipeEvents.endEvent),this.$slidesMask.removeClass("sp-grabbing").addClass("sp-grab"),(this.isTouchMoving===!1||this.isTouchMoving===!0&&Math.abs(this.touchDistance.x)<10&&Math.abs(this.touchDistance.y)<10)&&(b(a.target).parents(".sp-slide").find("a").off("click."+c),this.$slider.removeClass("sp-swiping")),setTimeout(function(){d.$slider.removeClass("sp-swiping")},1),this.isTouchMoving!==!1){this.isTouchMoving=!1,b(a.target).parents(".sp-slide").one("click",function(a){a.preventDefault()});var f=-parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty),10)+this.visibleOffset;if(Math.abs(e)<this.settings.touchSwipeThreshold)this._moveTo(f);else{var g=e/(this.slideSize+this.settings.slideDistance);g=parseInt(g,10)+(g>0?1:-1);var h=this.slidesOrder[b.inArray(this.selectedSlideIndex,this.slidesOrder)-g];this.settings.loop===!0?this.gotoSlide(h):"undefined"!=typeof h?this.gotoSlide(h):this._moveTo(f)}}},destroyTouchSwipe:function(){this.$slidesMask.off(this.touchSwipeEvents.startEvent),this.$slidesMask.off(this.touchSwipeEvents.moveEvent),this.$slidesMask.off("dragstart."+c),b(document).off(this.touchSwipeEvents.endEvent),this.$slidesMask.removeClass("sp-grab")},touchSwipeDefaults:{touchSwipe:!0,touchSwipeThreshold:50}};b.SliderPro.addModule("TouchSwipe",d)}(window,jQuery),function(a,b){"use strict";var c="Caption."+b.SliderPro.namespace,d={$captionContainer:null,captionContent:"",initCaption:function(){this.on("update."+c,b.proxy(this._captionOnUpdate,this)),this.on("gotoSlide."+c,b.proxy(this._updateCaptionContent,this))},_captionOnUpdate:function(){this.$captionContainer=this.$slider.find(".sp-caption-container"),this.$slider.find(".sp-caption").length&&0===this.$captionContainer.length&&(this.$captionContainer=b('<div class="sp-caption-container"></div>').appendTo(this.$slider),this._updateCaptionContent()),this.$slides.find(".sp-caption").each(function(){b(this).css("display","none")})},_updateCaptionContent:function(){var a=this,b=this.$slider.find(".sp-slide").eq(this.selectedSlideIndex).find(".sp-caption"),c=0!==b.length?b.html():"";this.settings.fadeCaption===!0?""!==this.captionContent?(0===parseFloat(this.$captionContainer.css("opacity"),10)&&(this.$captionContainer.css(this.vendorPrefix+"transition",""),this.$captionContainer.css("opacity",1)),this._fadeCaptionTo(0,function(){a.captionContent=c,""!==c?(a.$captionContainer.html(a.captionContent),a._fadeCaptionTo(1)):a.$captionContainer.empty()})):(this.captionContent=c,this.$captionContainer.html(this.captionContent),this.$captionContainer.css("opacity",0),this._fadeCaptionTo(1)):(this.captionContent=c,this.$captionContainer.html(this.captionContent))},_fadeCaptionTo:function(a,b){var c=this;"css-3d"===this.supportedAnimation||"css-2d"===this.supportedAnimation?(setTimeout(function(){var b={opacity:a};b[c.vendorPrefix+"transition"]="opacity "+c.settings.captionFadeDuration/1e3+"s",c.$captionContainer.css(b)},1),this.$captionContainer.on(this.transitionEvent,function(a){a.target===a.currentTarget&&(c.$captionContainer.off(c.transitionEvent),c.$captionContainer.css(c.vendorPrefix+"transition",""),"function"==typeof b&&b())})):this.$captionContainer.stop().animate({opacity:a},this.settings.captionFadeDuration,function(){"function"==typeof b&&b()})},destroyCaption:function(){this.off("update."+c),this.off("gotoSlide."+c),this.$captionContainer.remove(),this.$slider.find(".sp-caption").each(function(){b(this).css("display","")})},captionDefaults:{fadeCaption:!0,captionFadeDuration:500}};b.SliderPro.addModule("Caption",d)}(window,jQuery),function(a,b){"use strict";var c="DeepLinking."+b.SliderPro.namespace,d={initDeepLinking:function(){var d=this;this.on("init."+c,function(){d._gotoHash(a.location.hash)}),this.on("gotoSlide."+c,function(b){if(d.settings.updateHash===!0){var c=d.$slider.find(".sp-slide").eq(b.index).attr("id");"undefined"==typeof c&&(c=b.index),a.location.hash=d.$slider.attr("id")+"/"+c}}),b(a).on("hashchange."+this.uniqueId+"."+c,function(){d._gotoHash(a.location.hash)})},_parseHash:function(a){if(""!==a){a=a.substring(1);var b=a.split("/"),c=b.pop(),d=a.slice(0,-c.toString().length-1);if(this.$slider.attr("id")===d)return{sliderID:d,slideId:c}}return!1},_gotoHash:function(a){var b=this._parseHash(a);if(b!==!1){var c=b.slideId,d=parseInt(c,10);if(isNaN(d)){var e=this.$slider.find(".sp-slide#"+c).index();-1!==e&&e!==this.selectedSlideIndex&&this.gotoSlide(e)}else d!==this.selectedSlideIndex&&this.gotoSlide(d)}},destroyDeepLinking:function(){this.off("init."+c),this.off("gotoSlide."+c),b(a).off("hashchange."+this.uniqueId+"."+c)},deepLinkingDefaults:{updateHash:!1}};b.SliderPro.addModule("DeepLinking",d)}(window,jQuery),function(a,b){"use strict";var c="Autoplay."+b.SliderPro.namespace,d={autoplayTimer:null,isTimerRunning:!1,isTimerPaused:!1,initAutoplay:function(){this.on("update."+c,b.proxy(this._autoplayOnUpdate,this))},_autoplayOnUpdate:function(a){this.settings.autoplay===!0?(this.on("gotoSlide."+c,b.proxy(this._autoplayOnGotoSlide,this)),this.on("mouseenter."+c,b.proxy(this._autoplayOnMouseEnter,this)),this.on("mouseleave."+c,b.proxy(this._autoplayOnMouseLeave,this)),this.startAutoplay()):(this.off("gotoSlide."+c),this.off("mouseenter."+c),this.off("mouseleave."+c),this.stopAutoplay())},_autoplayOnGotoSlide:function(a){this.isTimerRunning===!0&&this.stopAutoplay(),this.isTimerPaused===!1&&this.startAutoplay()},_autoplayOnMouseEnter:function(a){!this.isTimerRunning||"pause"!==this.settings.autoplayOnHover&&"stop"!==this.settings.autoplayOnHover||(this.stopAutoplay(),this.isTimerPaused=!0)},_autoplayOnMouseLeave:function(a){this.settings.autoplay===!0&&this.isTimerRunning===!1&&"stop"!==this.settings.autoplayOnHover&&(this.startAutoplay(),this.isTimerPaused=!1)},startAutoplay:function(){var a=this;this.isTimerRunning=!0,this.autoplayTimer=setTimeout(function(){"normal"===a.settings.autoplayDirection?a.nextSlide():"backwards"===a.settings.autoplayDirection&&a.previousSlide()},this.settings.autoplayDelay)},stopAutoplay:function(){this.isTimerRunning=!1,this.isTimerPaused=!1,clearTimeout(this.autoplayTimer)},destroyAutoplay:function(){clearTimeout(this.autoplayTimer),this.off("update."+c),this.off("gotoSlide."+c),this.off("mouseenter."+c),this.off("mouseleave."+c)},autoplayDefaults:{autoplay:!0,autoplayDelay:5e3,autoplayDirection:"normal",autoplayOnHover:"pause"}};b.SliderPro.addModule("Autoplay",d)}(window,jQuery),function(a,b){"use strict";var c="Keyboard."+b.SliderPro.namespace,d={initKeyboard:function(){
var a=this,d=!1;this.settings.keyboard!==!1&&(this.$slider.on("focus."+c,function(){d=!0}),this.$slider.on("blur."+c,function(){d=!1}),b(document).on("keydown."+this.uniqueId+"."+c,function(b){(a.settings.keyboardOnlyOnFocus!==!0||d!==!1)&&(37===b.which?a.previousSlide():39===b.which?a.nextSlide():13===b.which&&a.$slider.find(".sp-slide").eq(a.selectedSlideIndex).find(".sp-image-container a")[0].click())}))},destroyKeyboard:function(){this.$slider.off("focus."+c),this.$slider.off("blur."+c),b(document).off("keydown."+this.uniqueId+"."+c)},keyboardDefaults:{keyboard:!0,keyboardOnlyOnFocus:!1}};b.SliderPro.addModule("Keyboard",d)}(window,jQuery),function(a,b){"use strict";var c="FullScreen."+b.SliderPro.namespace,d={isFullScreen:!1,$fullScreenButton:null,sizeBeforeFullScreen:{},initFullScreen:function(){(document.fullscreenEnabled||document.webkitFullscreenEnabled||document.mozFullScreenEnabled||document.msFullscreenEnabled)&&this.on("update."+c,b.proxy(this._fullScreenOnUpdate,this))},_fullScreenOnUpdate:function(){this.settings.fullScreen===!0&&null===this.$fullScreenButton?this._addFullScreen():this.settings.fullScreen===!1&&null!==this.$fullScreenButton&&this._removeFullScreen(),this.settings.fullScreen===!0&&(this.settings.fadeFullScreen===!0?this.$fullScreenButton.addClass("sp-fade-full-screen"):this.settings.fadeFullScreen===!1&&this.$fullScreenButton.removeClass("sp-fade-full-screen"))},_addFullScreen:function(){this.$fullScreenButton=b('<div class="sp-full-screen-button"></div>').appendTo(this.$slider),this.$fullScreenButton.on("click."+c,b.proxy(this._onFullScreenButtonClick,this)),document.addEventListener("fullscreenchange",b.proxy(this._onFullScreenChange,this)),document.addEventListener("mozfullscreenchange",b.proxy(this._onFullScreenChange,this)),document.addEventListener("webkitfullscreenchange",b.proxy(this._onFullScreenChange,this)),document.addEventListener("MSFullscreenChange",b.proxy(this._onFullScreenChange,this))},_removeFullScreen:function(){null!==this.$fullScreenButton&&(this.$fullScreenButton.off("click."+c),this.$fullScreenButton.remove(),this.$fullScreenButton=null,document.removeEventListener("fullscreenchange",this._onFullScreenChange),document.removeEventListener("mozfullscreenchange",this._onFullScreenChange),document.removeEventListener("webkitfullscreenchange",this._onFullScreenChange),document.removeEventListener("MSFullscreenChange",this._onFullScreenChange))},_onFullScreenButtonClick:function(){this.isFullScreen===!1?this.instance.requestFullScreen?this.instance.requestFullScreen():this.instance.mozRequestFullScreen?this.instance.mozRequestFullScreen():this.instance.webkitRequestFullScreen?this.instance.webkitRequestFullScreen():this.instance.msRequestFullscreen&&this.instance.msRequestFullscreen():document.exitFullScreen?document.exitFullScreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitCancelFullScreen?document.webkitCancelFullScreen():document.msExitFullscreen&&document.msExitFullscreen()},_onFullScreenChange:function(){this.isFullScreen=document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement?!0:!1,this.isFullScreen===!0?(this.sizeBeforeFullScreen={forceSize:this.settings.forceSize,autoHeight:this.settings.autoHeight},this.$slider.addClass("sp-full-screen"),this.settings.forceSize="fullWindow",this.settings.autoHeight=!1):(this.$slider.css("margin",""),this.$slider.removeClass("sp-full-screen"),this.settings.forceSize=this.sizeBeforeFullScreen.forceSize,this.settings.autoHeight=this.sizeBeforeFullScreen.autoHeight),this.resize()},destroyFullScreen:function(){this.off("update."+c),this._removeFullScreen()},fullScreenDefaults:{fullScreen:!1,fadeFullScreen:!0}};b.SliderPro.addModule("FullScreen",d)}(window,jQuery),function(a,b){"use strict";var c="Buttons."+b.SliderPro.namespace,d={$buttons:null,initButtons:function(){this.on("update."+c,b.proxy(this._buttonsOnUpdate,this))},_buttonsOnUpdate:function(){this.$buttons=this.$slider.find(".sp-buttons"),this.settings.buttons===!0&&this.getTotalSlides()>1&&0===this.$buttons.length?this._createButtons():this.settings.buttons===!0&&this.getTotalSlides()!==this.$buttons.find(".sp-button").length&&0!==this.$buttons.length?this._adjustButtons():(this.settings.buttons===!1||this.getTotalSlides()<=1&&0!==this.$buttons.length)&&this._removeButtons()},_createButtons:function(){var a=this;this.$buttons=b('<div class="sp-buttons"></div>').appendTo(this.$slider);for(var d=0;d<this.getTotalSlides();d++)b('<div class="sp-button"></div>').appendTo(this.$buttons);this.$buttons.on("click."+c,".sp-button",function(){a.gotoSlide(b(this).index())}),this.$buttons.find(".sp-button").eq(this.selectedSlideIndex).addClass("sp-selected-button"),this.on("gotoSlide."+c,function(b){a.$buttons.find(".sp-selected-button").removeClass("sp-selected-button"),a.$buttons.find(".sp-button").eq(b.index).addClass("sp-selected-button")}),this.$slider.addClass("sp-has-buttons")},_adjustButtons:function(){this.$buttons.empty();for(var a=0;a<this.getTotalSlides();a++)b('<div class="sp-button"></div>').appendTo(this.$buttons);this.$buttons.find(".sp-selected-button").removeClass("sp-selected-button"),this.$buttons.find(".sp-button").eq(this.selectedSlideIndex).addClass("sp-selected-button")},_removeButtons:function(){this.$buttons.off("click."+c,".sp-button"),this.off("gotoSlide."+c),this.$buttons.remove(),this.$slider.removeClass("sp-has-buttons")},destroyButtons:function(){this._removeButtons(),this.off("update."+c)},buttonsDefaults:{buttons:!0}};b.SliderPro.addModule("Buttons",d)}(window,jQuery),function(a,b){"use strict";var c="Arrows."+b.SliderPro.namespace,d={$arrows:null,$previousArrow:null,$nextArrow:null,initArrows:function(){this.on("update."+c,b.proxy(this._arrowsOnUpdate,this)),this.on("gotoSlide."+c,b.proxy(this._checkArrowsVisibility,this))},_arrowsOnUpdate:function(){var a=this;this.settings.arrows===!0&&null===this.$arrows?(this.$arrows=b('<div class="sp-arrows"></div>').appendTo(this.$slidesContainer),this.$previousArrow=b('<div class="sp-arrow sp-previous-arrow"></div>').appendTo(this.$arrows),this.$nextArrow=b('<div class="sp-arrow sp-next-arrow"></div>').appendTo(this.$arrows),this.$previousArrow.on("click."+c,function(){a.previousSlide()}),this.$nextArrow.on("click."+c,function(){a.nextSlide()}),this._checkArrowsVisibility()):this.settings.arrows===!1&&null!==this.$arrows&&this._removeArrows(),this.settings.arrows===!0&&(this.settings.fadeArrows===!0?this.$arrows.addClass("sp-fade-arrows"):this.settings.fadeArrows===!1&&this.$arrows.removeClass("sp-fade-arrows"))},_checkArrowsVisibility:function(){this.settings.arrows!==!1&&this.settings.loop!==!0&&(0===this.selectedSlideIndex?this.$previousArrow.css("display","none"):this.$previousArrow.css("display","block"),this.selectedSlideIndex===this.getTotalSlides()-1?this.$nextArrow.css("display","none"):this.$nextArrow.css("display","block"))},_removeArrows:function(){null!==this.$arrows&&(this.$previousArrow.off("click."+c),this.$nextArrow.off("click."+c),this.$arrows.remove(),this.$arrows=null)},destroyArrows:function(){this._removeArrows(),this.off("update."+c),this.off("gotoSlide."+c)},arrowsDefaults:{arrows:!1,fadeArrows:!0}};b.SliderPro.addModule("Arrows",d)}(window,jQuery),function(a,b){"use strict";var c="ThumbnailTouchSwipe."+b.SliderPro.namespace,d={thumbnailTouchStartPoint:{x:0,y:0},thumbnailTouchEndPoint:{x:0,y:0},thumbnailTouchDistance:{x:0,y:0},thumbnailTouchStartPosition:0,isThumbnailTouchMoving:!1,isThumbnailTouchSwipe:!1,thumbnailTouchSwipeEvents:{startEvent:"",moveEvent:"",endEvent:""},initThumbnailTouchSwipe:function(){this.on("update."+c,b.proxy(this._thumbnailTouchSwipeOnUpdate,this))},_thumbnailTouchSwipeOnUpdate:function(){this.isThumbnailScroller!==!1&&(this.settings.thumbnailTouchSwipe===!0&&this.isThumbnailTouchSwipe===!1&&(this.isThumbnailTouchSwipe=!0,this.thumbnailTouchSwipeEvents.startEvent="touchstart."+c+" mousedown."+c,this.thumbnailTouchSwipeEvents.moveEvent="touchmove."+c+" mousemove."+c,this.thumbnailTouchSwipeEvents.endEvent="touchend."+this.uniqueId+"."+c+" mouseup."+this.uniqueId+"."+c,this.$thumbnails.on(this.thumbnailTouchSwipeEvents.startEvent,b.proxy(this._onThumbnailTouchStart,this)),this.$thumbnails.on("dragstart."+c,function(a){a.preventDefault()}),this.$thumbnails.addClass("sp-grab")),b.each(this.thumbnails,function(a,b){b.off("thumbnailClick")}))},_onThumbnailTouchStart:function(a){if(!(b(a.target).closest(".sp-selectable").length>=1)){var d="undefined"!=typeof a.originalEvent.touches?a.originalEvent.touches[0]:a.originalEvent;"undefined"==typeof a.originalEvent.touches&&a.preventDefault(),b(a.target).parents(".sp-thumbnail-container").find("a").one("click."+c,function(a){a.preventDefault()}),this.thumbnailTouchStartPoint.x=d.pageX||d.clientX,this.thumbnailTouchStartPoint.y=d.pageY||d.clientY,this.thumbnailTouchStartPosition=this.thumbnailsPosition,this.thumbnailTouchDistance.x=this.thumbnailTouchDistance.y=0,this.$thumbnails.hasClass("sp-animated")&&(this.isThumbnailTouchMoving=!0,this._stopThumbnailsMovement(),this.thumbnailTouchStartPosition=this.thumbnailsPosition),this.$thumbnails.on(this.thumbnailTouchSwipeEvents.moveEvent,b.proxy(this._onThumbnailTouchMove,this)),b(document).on(this.thumbnailTouchSwipeEvents.endEvent,b.proxy(this._onThumbnailTouchEnd,this)),this.$thumbnails.removeClass("sp-grab").addClass("sp-grabbing"),this.$thumbnailsContainer.addClass("sp-swiping")}},_onThumbnailTouchMove:function(a){var b="undefined"!=typeof a.originalEvent.touches?a.originalEvent.touches[0]:a.originalEvent;this.isThumbnailTouchMoving=!0,this.thumbnailTouchEndPoint.x=b.pageX||b.clientX,this.thumbnailTouchEndPoint.y=b.pageY||b.clientY,this.thumbnailTouchDistance.x=this.thumbnailTouchEndPoint.x-this.thumbnailTouchStartPoint.x,this.thumbnailTouchDistance.y=this.thumbnailTouchEndPoint.y-this.thumbnailTouchStartPoint.y;var c="horizontal"===this.thumbnailsOrientation?this.thumbnailTouchDistance.x:this.thumbnailTouchDistance.y,d="horizontal"===this.thumbnailsOrientation?this.thumbnailTouchDistance.y:this.thumbnailTouchDistance.x;if(Math.abs(c)>Math.abs(d)){if(a.preventDefault(),this.thumbnailsPosition>=0){var e=-this.thumbnailTouchStartPosition;c=e+.2*(c-e)}else if(this.thumbnailsPosition<=-this.thumbnailsSize+this.thumbnailsContainerSize){var f=this.thumbnailsSize-this.thumbnailsContainerSize+this.thumbnailTouchStartPosition;c=-f+.2*(c+f)}this._moveThumbnailsTo(this.thumbnailTouchStartPosition+c,!0)}},_onThumbnailTouchEnd:function(a){var d=this;"horizontal"===this.thumbnailsOrientation?this.thumbnailTouchDistance.x:this.thumbnailTouchDistance.y;if(this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent),b(document).off(this.thumbnailTouchSwipeEvents.endEvent),this.$thumbnails.removeClass("sp-grabbing").addClass("sp-grab"),this.isThumbnailTouchMoving===!1||this.isThumbnailTouchMoving===!0&&Math.abs(this.thumbnailTouchDistance.x)<10&&Math.abs(this.thumbnailTouchDistance.y)<10){var e=b(a.target).hasClass("sp-thumbnail-container")?b(a.target):b(a.target).parents(".sp-thumbnail-container"),f=e.index();return void(0!==b(a.target).parents("a").length?(b(a.target).parents("a").off("click."+c),this.$thumbnailsContainer.removeClass("sp-swiping")):f!==this.selectedThumbnailIndex&&-1!==f&&this.gotoSlide(f))}this.isThumbnailTouchMoving=!1,b(a.target).parents(".sp-thumbnail").one("click",function(a){a.preventDefault()}),setTimeout(function(){d.$thumbnailsContainer.removeClass("sp-swiping")},1),this.thumbnailsPosition>0?this._moveThumbnailsTo(0):this.thumbnailsPosition<this.thumbnailsContainerSize-this.thumbnailsSize&&this._moveThumbnailsTo(this.thumbnailsContainerSize-this.thumbnailsSize),this.trigger({type:"thumbnailsMoveComplete"}),b.isFunction(this.settings.thumbnailsMoveComplete)&&this.settings.thumbnailsMoveComplete.call(this,{type:"thumbnailsMoveComplete"})},destroyThumbnailTouchSwipe:function(){this.off("update."+c),this.isThumbnailScroller!==!1&&(this.$thumbnails.off(this.thumbnailTouchSwipeEvents.startEvent),this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent),this.$thumbnails.off("dragstart."+c),b(document).off(this.thumbnailTouchSwipeEvents.endEvent),this.$thumbnails.removeClass("sp-grab"))},thumbnailTouchSwipeDefaults:{thumbnailTouchSwipe:!0}};b.SliderPro.addModule("ThumbnailTouchSwipe",d)}(window,jQuery),function(a,b){"use strict";var c="ThumbnailArrows."+b.SliderPro.namespace,d={$thumbnailArrows:null,$previousThumbnailArrow:null,$nextThumbnailArrow:null,initThumbnailArrows:function(){var a=this;this.on("update."+c,b.proxy(this._thumbnailArrowsOnUpdate,this)),this.on("sliderResize."+c+" thumbnailsMoveComplete."+c,function(){a.isThumbnailScroller===!0&&a.settings.thumbnailArrows===!0&&a._checkThumbnailArrowsVisibility()})},_thumbnailArrowsOnUpdate:function(){var a=this;this.isThumbnailScroller!==!1&&(this.settings.thumbnailArrows===!0&&null===this.$thumbnailArrows?(this.$thumbnailArrows=b('<div class="sp-thumbnail-arrows"></div>').appendTo(this.$thumbnailsContainer),this.$previousThumbnailArrow=b('<div class="sp-thumbnail-arrow sp-previous-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows),this.$nextThumbnailArrow=b('<div class="sp-thumbnail-arrow sp-next-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows),this.$previousThumbnailArrow.on("click."+c,function(){var b=Math.min(0,a.thumbnailsPosition+a.thumbnailsContainerSize);a._moveThumbnailsTo(b)}),this.$nextThumbnailArrow.on("click."+c,function(){var b=Math.max(a.thumbnailsContainerSize-a.thumbnailsSize,a.thumbnailsPosition-a.thumbnailsContainerSize);a._moveThumbnailsTo(b)})):this.settings.thumbnailArrows===!1&&null!==this.$thumbnailArrows&&this._removeThumbnailArrows(),this.settings.thumbnailArrows===!0&&(this.settings.fadeThumbnailArrows===!0?this.$thumbnailArrows.addClass("sp-fade-thumbnail-arrows"):this.settings.fadeThumbnailArrows===!1&&this.$thumbnailArrows.removeClass("sp-fade-thumbnail-arrows"),this._checkThumbnailArrowsVisibility()))},_checkThumbnailArrowsVisibility:function(){0===this.thumbnailsPosition?this.$previousThumbnailArrow.css("display","none"):this.$previousThumbnailArrow.css("display","block"),this.thumbnailsPosition===this.thumbnailsContainerSize-this.thumbnailsSize?this.$nextThumbnailArrow.css("display","none"):this.$nextThumbnailArrow.css("display","block")},_removeThumbnailArrows:function(){null!==this.$thumbnailArrows&&(this.$previousThumbnailArrow.off("click."+c),this.$nextThumbnailArrow.off("click."+c),this.$thumbnailArrows.remove(),this.$thumbnailArrows=null)},destroyThumbnailArrows:function(){this._removeThumbnailArrows(),this.off("update."+c),this.off("sliderResize."+c),this.off("thumbnailsMoveComplete."+c)},thumbnailArrowsDefaults:{thumbnailArrows:!1,fadeThumbnailArrows:!0}};b.SliderPro.addModule("ThumbnailArrows",d)}(window,jQuery),function(a,b){"use strict";var c="Video."+b.SliderPro.namespace,d={initVideo:function(){this.on("update."+c,b.proxy(this._videoOnUpdate,this)),this.on("gotoSlideComplete."+c,b.proxy(this._videoOnGotoSlideComplete,this))},_videoOnUpdate:function(){var a=this;this.$slider.find(".sp-video").not("a, [data-video-init]").each(function(){var c=b(this);a._initVideo(c)}),this.$slider.find("a.sp-video").not("[data-video-preinit]").each(function(){var c=b(this);a._preinitVideo(c)})},_initVideo:function(a){var d=this;a.attr("data-video-init",!0).videoController(),a.on("videoPlay."+c,function(){"stopAutoplay"===d.settings.playVideoAction&&"undefined"!=typeof d.stopAutoplay&&(d.stopAutoplay(),d.settings.autoplay=!1);var c={type:"videoPlay",video:a};d.trigger(c),b.isFunction(d.settings.videoPlay)&&d.settings.videoPlay.call(d,c)}),a.on("videoPause."+c,function(){"startAutoplay"===d.settings.pauseVideoAction&&"undefined"!=typeof d.startAutoplay&&(d.startAutoplay(),d.settings.autoplay=!0);var c={type:"videoPause",video:a};d.trigger(c),b.isFunction(d.settings.videoPause)&&d.settings.videoPause.call(d,c)}),a.on("videoEnded."+c,function(){"startAutoplay"===d.settings.endVideoAction&&"undefined"!=typeof d.startAutoplay?(d.startAutoplay(),d.settings.autoplay=!0):"nextSlide"===d.settings.endVideoAction?d.nextSlide():"replayVideo"===d.settings.endVideoAction&&a.videoController("replay");var c={type:"videoEnd",video:a};d.trigger(c),b.isFunction(d.settings.videoEnd)&&d.settings.videoEnd.call(d,c)})},_preinitVideo:function(a){var d=this;a.attr("data-video-preinit",!0),a.on("click."+c,function(c){if(!d.$slider.hasClass("sp-swiping")){c.preventDefault();var e,f,g,h,i,j,k,l=a.attr("href"),m=a.children("img").attr("width"),n=a.children("img").attr("height");-1!==l.indexOf("youtube")||-1!==l.indexOf("youtu.be")?f="youtube":-1!==l.indexOf("vimeo")&&(f="vimeo"),g="youtube"===f?/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/:/http:\/\/(www\.)?vimeo.com\/(\d+)/,h=l.match(g),i=h[2],j="youtube"===f?"http://www.youtube.com/embed/"+i+"?enablejsapi=1&wmode=opaque":"http://player.vimeo.com/video/"+i+"?api=1",k=l.split("?")[1],"undefined"!=typeof k&&(k=k.split("&"),b.each(k,function(a,b){-1===b.indexOf(i)&&(j+="&"+b)})),e=b("<iframe></iframe>").attr({src:j,width:m,height:n,"class":a.attr("class"),frameborder:0,allowfullscreen:"allowfullscreen"}).insertBefore(a),d._initVideo(e),e.videoController("play"),a.css("display","none")}})},_videoOnGotoSlideComplete:function(a){var b=this.$slides.find(".sp-slide").eq(a.previousIndex).find(".sp-video[data-video-init]");if(-1!==a.previousIndex&&0!==b.length&&("stopVideo"===this.settings.leaveVideoAction?b.videoController("stop"):"pauseVideo"===this.settings.leaveVideoAction?b.videoController("pause"):"removeVideo"===this.settings.leaveVideoAction&&(0!==b.siblings("a.sp-video").length?(b.siblings("a.sp-video").css("display",""),b.videoController("destroy"),b.remove()):b.videoController("stop"))),"playVideo"===this.settings.reachVideoAction){var d=this.$slides.find(".sp-slide").eq(a.index).find(".sp-video[data-video-init]"),e=this.$slides.find(".sp-slide").eq(a.index).find(".sp-video[data-video-preinit]");0!==d.length?d.videoController("play"):0!==e.length&&e.trigger("click."+c)}},destroyVideo:function(){this.$slider.find(".sp-video[ data-video-preinit ]").each(function(){var a=b(this);a.removeAttr("data-video-preinit"),a.off("click."+c)}),this.$slider.find(".sp-video[ data-video-init ]").each(function(){var a=b(this);a.removeAttr("data-video-init"),a.off("Video"),a.videoController("destroy")}),this.off("update."+c),this.off("gotoSlideComplete."+c)},videoDefaults:{reachVideoAction:"none",leaveVideoAction:"pauseVideo",playVideoAction:"stopAutoplay",pauseVideoAction:"none",endVideoAction:"none",videoPlay:function(){},videoPause:function(){},videoEnd:function(){}}};b.SliderPro.addModule("Video",d)}(window,jQuery),function(a){"use strict";var b=window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g)?!0:!1,c=function(b,c){this.$video=a(b),this.options=c,this.settings={},this.player=null,this._init()};c.prototype={_init:function(){this.settings=a.extend({},this.defaults,this.options);var b=this,c=a.VideoController.players,d=this.$video.attr("id");for(var e in c)if("undefined"!=typeof c[e]&&c[e].isType(this.$video)){this.player=new c[e](this.$video);break}if(null!==this.player){var f=["ready","start","play","pause","ended"];a.each(f,function(c,e){var f="video"+e.charAt(0).toUpperCase()+e.slice(1);b.player.on(e,function(){b.trigger({type:f,video:d}),a.isFunction(b.settings[f])&&b.settings[f].call(b,{type:f,video:d})})})}},play:function(){b===!0&&this.player.isStarted()===!1||"playing"===this.player.getState()||this.player.play()},stop:function(){b===!0&&this.player.isStarted()===!1||"stopped"===this.player.getState()||this.player.stop()},pause:function(){b===!0&&this.player.isStarted()===!1||"paused"===this.player.getState()||this.player.pause()},replay:function(){(b!==!0||this.player.isStarted()!==!1)&&this.player.replay()},on:function(a,b){return this.$video.on(a,b)},off:function(a){return this.$video.off(a)},trigger:function(a){return this.$video.triggerHandler(a)},destroy:function(){this.player.isStarted()===!0&&this.stop(),this.player.off("ready"),this.player.off("start"),this.player.off("play"),this.player.off("pause"),this.player.off("ended"),this.$video.removeData("videoController")},defaults:{videoReady:function(){},videoStart:function(){},videoPlay:function(){},videoPause:function(){},videoEnded:function(){}}},a.VideoController={players:{},addPlayer:function(a,b){this.players[a]=b}},a.fn.videoController=function(b){var d=Array.prototype.slice.call(arguments,1);return this.each(function(){if("undefined"==typeof a(this).data("videoController")){var e=new c(this,b);a(this).data("videoController",e)}else if("undefined"!=typeof b){var f=a(this).data("videoController");"function"==typeof f[b]?f[b].apply(f,d):a.error(b+" does not exist in videoController.")}})};var d=function(b){this.$video=b,this.player=null,this.ready=!1,this.started=!1,this.state="",this.events=a({}),this._init()};d.prototype={_init:function(){},play:function(){},pause:function(){},stop:function(){},replay:function(){},isType:function(){},isReady:function(){return this.ready},isStarted:function(){return this.started},getState:function(){return this.state},on:function(a,b){return this.events.on(a,b)},off:function(a){return this.events.off(a)},trigger:function(a){return this.events.triggerHandler(a)}};var e={youtubeAPIAdded:!1,youtubeVideos:[]},f=function(b){this.init=!1;var c=window.YT&&window.YT.Player;if("undefined"!=typeof c)d.call(this,b);else if(e.youtubeVideos.push({video:b,scope:this}),e.youtubeAPIAdded===!1){e.youtubeAPIAdded=!0;var f=document.createElement("script");f.src="http://www.youtube.com/player_api";var g=document.getElementsByTagName("script")[0];g.parentNode.insertBefore(f,g),window.onYouTubePlayerAPIReady=function(){a.each(e.youtubeVideos,function(a,b){d.call(b.scope,b.video)})}}};f.prototype=new d,f.prototype.constructor=f,a.VideoController.addPlayer("YoutubeVideo",f),f.isType=function(a){if(a.is("iframe")){var b=a.attr("src");if(-1!==b.indexOf("youtube.com")||-1!==b.indexOf("youtu.be"))return!0}return!1},f.prototype._init=function(){this.init=!0,this._setup()},f.prototype._setup=function(){var a=this;this.player=new YT.Player(this.$video[0],{events:{onReady:function(){a.trigger({type:"ready"}),a.ready=!0},onStateChange:function(b){switch(b.data){case YT.PlayerState.PLAYING:a.started===!1&&(a.started=!0,a.trigger({type:"start"})),a.state="playing",a.trigger({type:"play"});break;case YT.PlayerState.PAUSED:a.state="paused",a.trigger({type:"pause"});break;case YT.PlayerState.ENDED:a.state="ended",a.trigger({type:"ended"})}}}})},f.prototype.play=function(){var a=this;if(this.ready===!0)this.player.playVideo();else var b=setInterval(function(){a.ready===!0&&(clearInterval(b),a.player.playVideo())},100)},f.prototype.pause=function(){b===!0?this.stop():this.player.pauseVideo()},f.prototype.stop=function(){this.player.seekTo(1),this.player.stopVideo(),this.state="stopped"},f.prototype.replay=function(){this.player.seekTo(1),this.player.playVideo()},f.prototype.on=function(a,b){var c=this;if(this.init===!0)d.prototype.on.call(this,a,b);else var e=setInterval(function(){c.init===!0&&(clearInterval(e),d.prototype.on.call(c,a,b))},100)};var g={vimeoAPIAdded:!1,vimeoVideos:[]},h=function(b){if(this.init=!1,"undefined"!=typeof window.Froogaloop)d.call(this,b);else if(g.vimeoVideos.push({video:b,scope:this}),g.vimeoAPIAdded===!1){g.vimeoAPIAdded=!0;var c=document.createElement("script");c.src="http://a.vimeocdn.com/js/froogaloop2.min.js";var e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(c,e);var f=setInterval(function(){"undefined"!=typeof window.Froogaloop&&(clearInterval(f),a.each(g.vimeoVideos,function(a,b){d.call(b.scope,b.video)}))},100)}};h.prototype=new d,h.prototype.constructor=h,a.VideoController.addPlayer("VimeoVideo",h),h.isType=function(a){if(a.is("iframe")){var b=a.attr("src");if(-1!==b.indexOf("vimeo.com"))return!0}return!1},h.prototype._init=function(){this.init=!0,this._setup()},h.prototype._setup=function(){var a=this;this.player=$f(this.$video[0]),this.player.addEvent("ready",function(){a.ready=!0,a.trigger({type:"ready"}),a.player.addEvent("play",function(){a.started===!1&&(a.started=!0,a.trigger({type:"start"})),a.state="playing",a.trigger({type:"play"})}),a.player.addEvent("pause",function(){a.state="paused",a.trigger({type:"pause"})}),a.player.addEvent("finish",function(){a.state="ended",a.trigger({type:"ended"})})})},h.prototype.play=function(){var a=this;if(this.ready===!0)this.player.api("play");else var b=setInterval(function(){a.ready===!0&&(clearInterval(b),a.player.api("play"))},100)},h.prototype.pause=function(){this.player.api("pause")},h.prototype.stop=function(){this.player.api("seekTo",0),this.player.api("pause"),this.state="stopped"},h.prototype.replay=function(){this.player.api("seekTo",0),this.player.api("play")},h.prototype.on=function(a,b){var c=this;if(this.init===!0)d.prototype.on.call(this,a,b);else var e=setInterval(function(){c.init===!0&&(clearInterval(e),d.prototype.on.call(c,a,b))},100)};var i=function(a){d.call(this,a)};i.prototype=new d,i.prototype.constructor=i,a.VideoController.addPlayer("HTML5Video",i),i.isType=function(a){return a.is("video")&&a.hasClass("video-js")===!1&&a.hasClass("sublime")===!1?!0:!1},i.prototype._init=function(){var a=this;this.player=this.$video[0],this.ready=!0,this.player.addEventListener("play",function(){a.started===!1&&(a.started=!0,a.trigger({type:"start"})),a.state="playing",a.trigger({type:"play"})}),this.player.addEventListener("pause",function(){a.state="paused",a.trigger({type:"pause"})}),this.player.addEventListener("ended",function(){a.state="ended",a.trigger({type:"ended"})})},i.prototype.play=function(){this.player.play()},i.prototype.pause=function(){this.player.pause()},i.prototype.stop=function(){this.player.currentTime=0,this.player.pause(),this.state="stopped"},i.prototype.replay=function(){this.player.currentTime=0,this.player.play()};var j=function(a){d.call(this,a)};j.prototype=new d,j.prototype.constructor=j,a.VideoController.addPlayer("VideoJSVideo",j),j.isType=function(a){return"undefined"==typeof a.attr("data-videojs-id")&&!a.hasClass("video-js")||"undefined"==typeof videojs?!1:!0},j.prototype._init=function(){var a=this,b=this.$video.hasClass("video-js")?this.$video.attr("id"):this.$video.attr("data-videojs-id");this.player=videojs(b),this.player.ready(function(){a.ready=!0,a.trigger({type:"ready"}),a.player.on("play",function(){a.started===!1&&(a.started=!0,a.trigger({type:"start"})),a.state="playing",a.trigger({type:"play"})}),a.player.on("pause",function(){a.state="paused",a.trigger({type:"pause"})}),a.player.on("ended",function(){a.state="ended",a.trigger({type:"ended"})})})},j.prototype.play=function(){this.player.play()},j.prototype.pause=function(){this.player.pause()},j.prototype.stop=function(){this.player.currentTime(0),this.player.pause(),this.state="stopped"},j.prototype.replay=function(){this.player.currentTime(0),this.player.play()};var k=function(a){d.call(this,a)};k.prototype=new d,k.prototype.constructor=k,a.VideoController.addPlayer("SublimeVideo",k),k.isType=function(a){return a.hasClass("sublime")&&"undefined"!=typeof sublime?!0:!1},k.prototype._init=function(){var a=this;sublime.ready(function(){a.player=sublime.player(a.$video.attr("id")),a.ready=!0,a.trigger({type:"ready"}),a.player.on("play",function(){a.started===!1&&(a.started=!0,a.trigger({type:"start"})),a.state="playing",a.trigger({type:"play"})}),a.player.on("pause",function(){a.state="paused",a.trigger({type:"pause"})}),a.player.on("stop",function(){a.state="stopped",a.trigger({type:"stop"})}),a.player.on("end",function(){a.state="ended",a.trigger({type:"ended"})})})},k.prototype.play=function(){this.player.play()},k.prototype.pause=function(){this.player.pause()},k.prototype.stop=function(){this.player.stop()},k.prototype.replay=function(){this.player.stop(),this.player.play()};var l=function(a){d.call(this,a)};l.prototype=new d,l.prototype.constructor=l,a.VideoController.addPlayer("JWPlayerVideo",l),l.isType=function(a){return"undefined"==typeof a.attr("data-jwplayer-id")&&!a.hasClass("jwplayer")&&0===a.find("object[data*='jwplayer']").length||"undefined"==typeof jwplayer?!1:!0},l.prototype._init=function(){var a,b=this;this.$video.hasClass("jwplayer")?a=this.$video.attr("id"):"undefined"!=typeof this.$video.attr("data-jwplayer-id")?a=this.$video.attr("data-jwplayer-id"):0!==this.$video.find("object[data*='jwplayer']").length&&(a=this.$video.find("object").attr("id")),this.player=jwplayer(a),this.player.onReady(function(){b.ready=!0,b.trigger({type:"ready"}),b.player.onPlay(function(){b.started===!1&&(b.started=!0,b.trigger({type:"start"})),b.state="playing",b.trigger({type:"play"})}),b.player.onPause(function(){b.state="paused",b.trigger({type:"pause"})}),b.player.onComplete(function(){b.state="ended",b.trigger({type:"ended"})})})},l.prototype.play=function(){this.player.play(!0)},l.prototype.pause=function(){this.player.pause(!0)},l.prototype.stop=function(){this.player.stop(),this.state="stopped"},l.prototype.replay=function(){this.player.seek(0),this.player.play(!0)}}(jQuery);
 //start tabslet
 /**
 * Tabslet | tabs jQuery plugin
 *
 * @copyright Copyright 2015, Dimitris Krestos
 * @license   Apache License, Version 2.0 (http://www.opensource.org/licenses/apache2.0.php)
 * @link      http://vdw.staytuned.gr
 * @version   v1.4.9
 */

  /* Sample html structure

  <div class='tabs'>
    <ul class='horizontal'>
      <li><a href="#tab-1">Tab 1</a></li>
      <li><a href="#tab-2">Tab 2</a></li>
      <li><a href="#tab-3">Tab 3</a></li>
    </ul>
    <div id='tab-1'></div>
    <div id='tab-2'></div>
    <div id='tab-3'></div>
  </div>

  */

!function($,window,undefined){"use strict";$.fn.tabslet=function(options){var defaults={mouseevent:"click",attribute:"href",animation:!1,autorotate:!1,pauseonhover:!0,delay:2e3,active:1,controls:{prev:".prev",next:".next"}},options=$.extend(defaults,options);return this.each(function(){var $this=$(this),_cache_li=[],_cache_div=[];$this.find("> div").each(function(){_cache_div.push($(this).css("display"))});var elements=$this.find("> ul li"),i=options.active-1;if(!$this.data("tabslet-init")){$this.data("tabslet-init",!0),options.mouseevent=$this.data("mouseevent")||options.mouseevent,options.attribute=$this.data("attribute")||options.attribute,options.animation=$this.data("animation")||options.animation,options.autorotate=$this.data("autorotate")||options.autorotate,options.pauseonhover=$this.data("pauseonhover")||options.pauseonhover,options.delay=$this.data("delay")||options.delay,options.active=$this.data("active")||options.active,$this.find("> div").hide(),options.active&&($this.find("> div").eq(options.active-1).show(),$this.find("> ul li").eq(options.active-1).addClass("active"));var fn=eval(function(){$(this).trigger("_before"),$this.find("> ul li").removeClass("active"),$(this).addClass("active"),$this.find("> div").hide(),i=elements.index($(this));var t=$(this).find("a").attr(options.attribute);return options.animation?$this.find(t).animate({opacity:"show"},"slow",function(){$(this).trigger("_after")}):($this.find(t).show(),$(this).trigger("_after")),!1}),init=eval("$this.find('> ul li')."+options.mouseevent+"(fn)"),t,forward=function(){i=++i%elements.length,"hover"==options.mouseevent?elements.eq(i).trigger("mouseover"):elements.eq(i).click(),options.autorotate&&(clearTimeout(t),t=setTimeout(forward,options.delay),$this.mouseover(function(){options.pauseonhover&&clearTimeout(t)}))};options.autorotate&&(t=setTimeout(forward,options.delay),$this.hover(function(){options.pauseonhover&&clearTimeout(t)},function(){t=setTimeout(forward,options.delay)}),options.pauseonhover&&$this.on("mouseleave",function(){clearTimeout(t),t=setTimeout(forward,options.delay)}));var move=function(t){"forward"==t&&(i=++i%elements.length),"backward"==t&&(i=--i%elements.length),elements.eq(i).click()};$this.find(options.controls.next).click(function(){move("forward")}),$this.find(options.controls.prev).click(function(){move("backward")}),$this.on("destroy",function(){$(this).removeData().find("> ul li").each(function(){$(this).removeClass("active")}),$(this).find("> div").each(function(t){$(this).removeAttr("style").css("display",_cache_div[t])})})}})},$(document).ready(function(){$('[data-toggle="tabslet"]').tabslet()})}(jQuery);
//start letters effect
(function($){"use strict";var LetterFx=function(element,options){this.options=$.extend({},$.fn.letterfx.defaults,options);this.num_completed_fx=0;this.is_done=false;this.monitor_timer=null;this.killswitch=null;this.$element=$(element);if(this.options.restore)this.original_html=this.$element.html();this.init()};LetterFx.prototype.init=function(){this.new_html=this.$element.text().replace(this.options.pattern,this.options.replacement);this.$element.addClass(this.options.css.element.base).addClass(this.options.css.element.before);this.$element.html(this.new_html);this.$letters=this.$element.find(this.options.selector);this.$letters.css("transition-duration",this.options.fx_duration).addClass(this.options.css.letters.base).addClass(this.options.css.letters.before);this.bindLetterFxEnd();this.num_letters=this.$letters.length;this.fx();return this};LetterFx.prototype.bindLetterFxEnd=function(){var options=this.options;var lfx=this;this.$letters.bind("transitionend",function(){options.onLetterComplete($(this),lfx.$element,lfx);lfx.notifyFXEnd();switch(options.letter_end){case"destroy":$(this).remove();break;case"rewind":lfx.applyLetterFx($(this),options.timing,options.css.letters.after,options.css.letters.before);break;case"stay":break;default:$(this).replaceWith($(this).text())}});return lfx};LetterFx.prototype.terminate=function(){this.is_done=true;this.options.onElementComplete(this.$element,this);clearTimeout(this.killswitch);switch(this.options.element_end){case"destroy":this.$element.remove();break;case"stay":break;default:this.$element.html(this.original_html);this.$element.removeClass(this.options.css.element.base).removeClass(this.options.css.element.after);break}};LetterFx.prototype.notifyFXEnd=function(){clearTimeout(this.monitor_timer);this.num_completed_fx++;var lfx=this;this.monitor_timer=setTimeout(function(){if(lfx.num_completed_fx%lfx.num_letters===0){lfx.terminate()}},Math.max(this.options.timing+10,50));return this};LetterFx.prototype.startKillWatch=function(){var fx_duration=this.options.fx_duration.match(/\d+s/)?parseInt(this.options.fx_duration):1;var time=Math.ceil(1.5*this.num_letters*this.options.timing*fx_duration);var lfx=this;this.killswitch=window.setTimeout(function(){if(!lfx.isDone()){lfx.terminate()}},time)};LetterFx.prototype.fx=function(){var lfx=this;this.startKillWatch();this.$element.removeClass(this.options.css.element.before).addClass(this.options.css.element.after);var $letters=this.options.sort(this.$letters);var options=this.options;$letters.each(function(i,letter){lfx.applyLetterFx($(letter),(i+1)*options.timing,options.css.letters.before,options.css.letters.after)});return this};LetterFx.prototype.applyLetterFx=function($letter,timing,css_before,css_after){var options=this.options;window.setTimeout(function(){$letter.removeClass(css_before).addClass(css_after)},timing);return this};LetterFx.prototype.isDone=function(){return this.is_done};var LetterFxConfig=function(conf){this.config=$.extend({},$.fn.letterfx.defaults,conf);this.buildCss(this.config.backwards);if(this.config.words)this.config.pattern=/(\S+)/g};LetterFxConfig.prototype.buildCss=function(flip){var options=this.config;var before=flip?"after":"before";var after=flip?"before":"after";var css={element:{},letters:{}};css.element.base=options.element_class+"-container "+options.fx.replace(/(\S+)/g,options.element_class+"-$1-container");css.element[before]=options.fx.replace(/(\S+)/g,options.element_class+"-$1-before-container");css.element[after]=options.fx.replace(/(\S+)/g,options.element_class+"-$1-after-container");css.letters.base=options.element_class;css.letters[before]=options.fx.replace(/(\S+)/g,options.element_class+"-$1-before");css.letters[after]=options.fx.replace(/(\S+)/g,options.element_class+"-$1-after");this.config=$.extend(options,{css:css})};LetterFxConfig.prototype.getConfig=function(){return this.config};LetterFxConfig.parse=function(config){return new LetterFxConfig(config).getConfig()};$.fn.letterfx=function(config){config=LetterFxConfig.parse(config);return $(this).each(function(){var $element=$(this);if(!$element.data("letterfx-obj")||$element.data("letterfx-obj").isDone()){$element.data("letterfx-obj",new LetterFx($element,config))}})};$.fn.letterfx.sort={random:function(array){var currentIndex=array.length,temporaryValue,randomIndex;while(0!==currentIndex){randomIndex=Math.floor(Math.random()*currentIndex);currentIndex-=1;temporaryValue=array[currentIndex];array[currentIndex]=array[randomIndex];array[randomIndex]=temporaryValue}return array},reverse:function($array){return $array.toArray().reverse()}};$.fn.letterfx.patterns={letters:/(\S)/gi};$.fn.letterfx.defaults={fx:"spin fly-top",pattern:/(\S)/gi,word:false,backwards:false,replacement:"<span>$1</span>",selector:"span",timing:50,fx_duration:"1s",sort:function($letters){return $letters},onLetterComplete:function($letter,$element,LetterFXObj){},onElementComplete:function($element,LetterFXObj){},letter_end:"restore",element_end:"restore",restore:true,destroy:false,element_class:"letterfx",css:{element:{base:"",before:"",after:""},letters:{base:"",before:"",after:""}}}})(jQuery);

//start mmenu
/*
 * jQuery mmenu v5.5.3
 * @requires jQuery 1.7.0 or later
 *
 * mmenu.frebsite.nl
 *	
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * Licensed under the MIT license:
 * http://en.wikipedia.org/wiki/MIT_License
 */
!function(e){function n(){e[t].glbl||(l={$wndw:e(window),$html:e("html"),$body:e("body")},a={},i={},r={},e.each([a,i,r],function(e,n){n.add=function(e){e=e.split(" ");for(var t=0,s=e.length;s>t;t++)n[e[t]]=n.mm(e[t])}}),a.mm=function(e){return"mm-"+e},a.add("wrapper menu panels panel nopanel current highest opened subopened navbar hasnavbar title btn prev next listview nolistview inset vertical selected divider spacer hidden fullsubopen"),a.umm=function(e){return"mm-"==e.slice(0,3)&&(e=e.slice(3)),e},i.mm=function(e){return"mm-"+e},i.add("parent sub"),r.mm=function(e){return e+".mm"},r.add("transitionend webkitTransitionEnd mousedown mouseup touchstart touchmove touchend click keydown"),e[t]._c=a,e[t]._d=i,e[t]._e=r,e[t].glbl=l)}var t="mmenu",s="5.5.3";if(!(e[t]&&e[t].version>s)){e[t]=function(e,n,t){this.$menu=e,this._api=["bind","init","update","setSelected","getInstance","openPanel","closePanel","closeAllPanels"],this.opts=n,this.conf=t,this.vars={},this.cbck={},"function"==typeof this.___deprecated&&this.___deprecated(),this._initMenu(),this._initAnchors();var s=this.$pnls.children();return this._initAddons(),this.init(s),"function"==typeof this.___debug&&this.___debug(),this},e[t].version=s,e[t].addons={},e[t].uniqueId=0,e[t].defaults={extensions:[],navbar:{add:!0,title:"Menu",titleLink:"panel"},onClick:{setSelected:!0},slidingSubmenus:!0},e[t].configuration={classNames:{divider:"Divider",inset:"Inset",panel:"Panel",selected:"Selected",spacer:"Spacer",vertical:"Vertical"},clone:!1,openingInterval:25,panelNodetype:"ul, ol, div",transitionDuration:400},e[t].prototype={init:function(e){e=e.not("."+a.nopanel),e=this._initPanels(e),this.trigger("init",e),this.trigger("update")},update:function(){this.trigger("update")},setSelected:function(e){this.$menu.find("."+a.listview).children().removeClass(a.selected),e.addClass(a.selected),this.trigger("setSelected",e)},openPanel:function(n){var s=n.parent();if(s.hasClass(a.vertical)){var i=s.parents("."+a.subopened);if(i.length)return this.openPanel(i.first());s.addClass(a.opened)}else{if(n.hasClass(a.current))return;var r=this.$pnls.children("."+a.panel),l=r.filter("."+a.current);r.removeClass(a.highest).removeClass(a.current).not(n).not(l).not("."+a.vertical).addClass(a.hidden),e[t].support.csstransitions||l.addClass(a.hidden),n.hasClass(a.opened)?n.nextAll("."+a.opened).addClass(a.highest).removeClass(a.opened).removeClass(a.subopened):(n.addClass(a.highest),l.addClass(a.subopened)),n.removeClass(a.hidden).addClass(a.current),setTimeout(function(){n.removeClass(a.subopened).addClass(a.opened)},this.conf.openingInterval)}this.trigger("openPanel",n)},closePanel:function(e){var n=e.parent();n.hasClass(a.vertical)&&(n.removeClass(a.opened),this.trigger("closePanel",e))},closeAllPanels:function(){this.$menu.find("."+a.listview).children().removeClass(a.selected).filter("."+a.vertical).removeClass(a.opened);var e=this.$pnls.children("."+a.panel),n=e.first();this.$pnls.children("."+a.panel).not(n).removeClass(a.subopened).removeClass(a.opened).removeClass(a.current).removeClass(a.highest).addClass(a.hidden),this.openPanel(n)},togglePanel:function(e){var n=e.parent();n.hasClass(a.vertical)&&this[n.hasClass(a.opened)?"closePanel":"openPanel"](e)},getInstance:function(){return this},bind:function(e,n){this.cbck[e]=this.cbck[e]||[],this.cbck[e].push(n)},trigger:function(){var e=this,n=Array.prototype.slice.call(arguments),t=n.shift();if(this.cbck[t])for(var s=0,a=this.cbck[t].length;a>s;s++)this.cbck[t][s].apply(e,n)},_initMenu:function(){this.opts.offCanvas&&this.conf.clone&&(this.$menu=this.$menu.clone(!0),this.$menu.add(this.$menu.find("[id]")).filter("[id]").each(function(){e(this).attr("id",a.mm(e(this).attr("id")))})),this.$menu.contents().each(function(){3==e(this)[0].nodeType&&e(this).remove()}),this.$pnls=e('<div class="'+a.panels+'" />').append(this.$menu.children(this.conf.panelNodetype)).prependTo(this.$menu),this.$menu.parent().addClass(a.wrapper);var n=[a.menu];this.opts.slidingSubmenus||n.push(a.vertical),this.opts.extensions=this.opts.extensions.length?"mm-"+this.opts.extensions.join(" mm-"):"",this.opts.extensions&&n.push(this.opts.extensions),this.$menu.addClass(n.join(" "))},_initPanels:function(n){var t=this,s=this.__findAddBack(n,"ul, ol");this.__refactorClass(s,this.conf.classNames.inset,"inset").addClass(a.nolistview+" "+a.nopanel),s.not("."+a.nolistview).addClass(a.listview);var r=this.__findAddBack(n,"."+a.listview).children();this.__refactorClass(r,this.conf.classNames.selected,"selected"),this.__refactorClass(r,this.conf.classNames.divider,"divider"),this.__refactorClass(r,this.conf.classNames.spacer,"spacer"),this.__refactorClass(this.__findAddBack(n,"."+this.conf.classNames.panel),this.conf.classNames.panel,"panel");var l=e(),d=n.add(n.find("."+a.panel)).add(this.__findAddBack(n,"."+a.listview).children().children(this.conf.panelNodetype)).not("."+a.nopanel);this.__refactorClass(d,this.conf.classNames.vertical,"vertical"),this.opts.slidingSubmenus||d.addClass(a.vertical),d.each(function(){var n=e(this),s=n;n.is("ul, ol")?(n.wrap('<div class="'+a.panel+'" />'),s=n.parent()):s.addClass(a.panel);var i=n.attr("id");n.removeAttr("id"),s.attr("id",i||t.__getUniqueId()),n.hasClass(a.vertical)&&(n.removeClass(t.conf.classNames.vertical),s.add(s.parent()).addClass(a.vertical)),l=l.add(s)});var o=e("."+a.panel,this.$menu);l.each(function(){var n=e(this),s=n.parent(),r=s.children("a, span").first();if(s.is("."+a.panels)||(s.data(i.sub,n),n.data(i.parent,s)),!s.children("."+a.next).length&&s.parent().is("."+a.listview)){var l=n.attr("id"),d=e('<a class="'+a.next+'" href="#'+l+'" data-target="#'+l+'" />').insertBefore(r);r.is("span")&&d.addClass(a.fullsubopen)}if(!n.children("."+a.navbar).length&&!s.hasClass(a.vertical)){if(s.parent().is("."+a.listview))var s=s.closest("."+a.panel);else var r=s.closest("."+a.panel).find('a[href="#'+n.attr("id")+'"]').first(),s=r.closest("."+a.panel);var o=e('<div class="'+a.navbar+'" />');if(s.length){var l=s.attr("id");switch(t.opts.navbar.titleLink){case"anchor":_url=r.attr("href");break;case"panel":case"parent":_url="#"+l;break;case"none":default:_url=!1}o.append('<a class="'+a.btn+" "+a.prev+'" href="#'+l+'" data-target="#'+l+'" />').append(e('<a class="'+a.title+'"'+(_url?' href="'+_url+'"':"")+" />").text(r.text())).prependTo(n),t.opts.navbar.add&&n.addClass(a.hasnavbar)}else t.opts.navbar.title&&(o.append('<a class="'+a.title+'">'+t.opts.navbar.title+"</a>").prependTo(n),t.opts.navbar.add&&n.addClass(a.hasnavbar))}});var c=this.__findAddBack(n,"."+a.listview).children("."+a.selected).removeClass(a.selected).last().addClass(a.selected);c.add(c.parentsUntil("."+a.menu,"li")).filter("."+a.vertical).addClass(a.opened).end().not("."+a.vertical).each(function(){e(this).parentsUntil("."+a.menu,"."+a.panel).not("."+a.vertical).first().addClass(a.opened).parentsUntil("."+a.menu,"."+a.panel).not("."+a.vertical).first().addClass(a.opened).addClass(a.subopened)}),c.children("."+a.panel).not("."+a.vertical).addClass(a.opened).parentsUntil("."+a.menu,"."+a.panel).not("."+a.vertical).first().addClass(a.opened).addClass(a.subopened);var h=o.filter("."+a.opened);return h.length||(h=l.first()),h.addClass(a.opened).last().addClass(a.current),l.not("."+a.vertical).not(h.last()).addClass(a.hidden).end().appendTo(this.$pnls),l},_initAnchors:function(){var n=this;l.$body.on(r.click+"-oncanvas","a[href]",function(s){var i=e(this),r=!1,l=n.$menu.find(i).length;for(var d in e[t].addons)if(r=e[t].addons[d].clickAnchor.call(n,i,l))break;if(!r&&l){var o=i.attr("href");if(o.length>1&&"#"==o.slice(0,1))try{var c=e(o,n.$menu);c.is("."+a.panel)&&(r=!0,n[i.parent().hasClass(a.vertical)?"togglePanel":"openPanel"](c))}catch(h){}}if(r&&s.preventDefault(),!r&&l&&i.is("."+a.listview+" > li > a")&&!i.is('[rel="external"]')&&!i.is('[target="_blank"]')){n.__valueOrFn(n.opts.onClick.setSelected,i)&&n.setSelected(e(s.target).parent());var p=n.__valueOrFn(n.opts.onClick.preventDefault,i,"#"==o.slice(0,1));p&&s.preventDefault(),n.__valueOrFn(n.opts.onClick.close,i,p)&&n.close()}})},_initAddons:function(){for(var n in e[t].addons)e[t].addons[n].add.call(this),e[t].addons[n].add=function(){};for(var n in e[t].addons)e[t].addons[n].setup.call(this)},__api:function(){var n=this,t={};return e.each(this._api,function(){var e=this;t[e]=function(){var s=n[e].apply(n,arguments);return"undefined"==typeof s?t:s}}),t},__valueOrFn:function(e,n,t){return"function"==typeof e?e.call(n[0]):"undefined"==typeof e&&"undefined"!=typeof t?t:e},__refactorClass:function(e,n,t){return e.filter("."+n).removeClass(n).addClass(a[t])},__findAddBack:function(e,n){return e.find(n).add(e.filter(n))},__filterListItems:function(e){return e.not("."+a.divider).not("."+a.hidden)},__transitionend:function(e,n,t){var s=!1,a=function(){s||n.call(e[0]),s=!0};e.one(r.transitionend,a),e.one(r.webkitTransitionEnd,a),setTimeout(a,1.1*t)},__getUniqueId:function(){return a.mm(e[t].uniqueId++)}},e.fn[t]=function(s,a){return n(),s=e.extend(!0,{},e[t].defaults,s),a=e.extend(!0,{},e[t].configuration,a),this.each(function(){var n=e(this);if(!n.data(t)){var i=new e[t](n,s,a);n.data(t,i.__api())}})},e[t].support={touch:"ontouchstart"in window||navigator.msMaxTouchPoints,csstransitions:function(){if("undefined"!=typeof Modernizr&&"undefined"!=typeof Modernizr.csstransitions)return Modernizr.csstransitions;var e=document.body||document.documentElement,n=e.style,t="transition";if("string"==typeof n[t])return!0;var s=["Moz","webkit","Webkit","Khtml","O","ms"];t=t.charAt(0).toUpperCase()+t.substr(1);for(var a=0;a<s.length;a++)if("string"==typeof n[s[a]+t])return!0;return!1}()};var a,i,r,l}}(jQuery);
/*	
 * jQuery mmenu offCanvas addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(e){var t="mmenu",o="offCanvas";e[t].addons[o]={setup:function(){if(this.opts[o]){var s=this.opts[o],i=this.conf[o];a=e[t].glbl,this._api=e.merge(this._api,["open","close","setPage"]),("top"==s.position||"bottom"==s.position)&&(s.zposition="front"),"string"!=typeof i.pageSelector&&(i.pageSelector="> "+i.pageNodetype),a.$allMenus=(a.$allMenus||e()).add(this.$menu),this.vars.opened=!1;var r=[n.offcanvas];"left"!=s.position&&r.push(n.mm(s.position)),"back"!=s.zposition&&r.push(n.mm(s.zposition)),this.$menu.addClass(r.join(" ")).parent().removeClass(n.wrapper),this.setPage(a.$page),this._initBlocker(),this["_initWindow_"+o](),this.$menu[i.menuInjectMethod+"To"](i.menuWrapperSelector)}},add:function(){n=e[t]._c,s=e[t]._d,i=e[t]._e,n.add("offcanvas slideout blocking modal background opening blocker page"),s.add("style"),i.add("resize")},clickAnchor:function(e){if(!this.opts[o])return!1;var t=this.$menu.attr("id");if(t&&t.length&&(this.conf.clone&&(t=n.umm(t)),e.is('[href="#'+t+'"]')))return this.open(),!0;if(a.$page){var t=a.$page.first().attr("id");return t&&t.length&&e.is('[href="#'+t+'"]')?(this.close(),!0):!1}}},e[t].defaults[o]={position:"left",zposition:"back",blockUI:!0,moveBackground:!0},e[t].configuration[o]={pageNodetype:"div",pageSelector:null,noPageSelector:[],wrapPageIfNeeded:!0,menuWrapperSelector:"body",menuInjectMethod:"prepend"},e[t].prototype.open=function(){if(!this.vars.opened){var e=this;this._openSetup(),setTimeout(function(){e._openFinish()},this.conf.openingInterval),this.trigger("open")}},e[t].prototype._openSetup=function(){var t=this,r=this.opts[o];this.closeAllOthers(),a.$page.each(function(){e(this).data(s.style,e(this).attr("style")||"")}),a.$wndw.trigger(i.resize+"-"+o,[!0]);var p=[n.opened];r.blockUI&&p.push(n.blocking),"modal"==r.blockUI&&p.push(n.modal),r.moveBackground&&p.push(n.background),"left"!=r.position&&p.push(n.mm(this.opts[o].position)),"back"!=r.zposition&&p.push(n.mm(this.opts[o].zposition)),this.opts.extensions&&p.push(this.opts.extensions),a.$html.addClass(p.join(" ")),setTimeout(function(){t.vars.opened=!0},this.conf.openingInterval),this.$menu.addClass(n.current+" "+n.opened)},e[t].prototype._openFinish=function(){var e=this;this.__transitionend(a.$page.first(),function(){e.trigger("opened")},this.conf.transitionDuration),a.$html.addClass(n.opening),this.trigger("opening")},e[t].prototype.close=function(){if(this.vars.opened){var t=this;this.__transitionend(a.$page.first(),function(){t.$menu.removeClass(n.current).removeClass(n.opened),a.$html.removeClass(n.opened).removeClass(n.blocking).removeClass(n.modal).removeClass(n.background).removeClass(n.mm(t.opts[o].position)).removeClass(n.mm(t.opts[o].zposition)),t.opts.extensions&&a.$html.removeClass(t.opts.extensions),a.$page.each(function(){e(this).attr("style",e(this).data(s.style))}),t.vars.opened=!1,t.trigger("closed")},this.conf.transitionDuration),a.$html.removeClass(n.opening),this.trigger("close"),this.trigger("closing")}},e[t].prototype.closeAllOthers=function(){a.$allMenus.not(this.$menu).each(function(){var o=e(this).data(t);o&&o.close&&o.close()})},e[t].prototype.setPage=function(t){var s=this,i=this.conf[o];t&&t.length||(t=a.$body.find(i.pageSelector),i.noPageSelector.length&&(t=t.not(i.noPageSelector.join(", "))),t.length>1&&i.wrapPageIfNeeded&&(t=t.wrapAll("<"+this.conf[o].pageNodetype+" />").parent())),t.each(function(){e(this).attr("id",e(this).attr("id")||s.__getUniqueId())}),t.addClass(n.page+" "+n.slideout),a.$page=t,this.trigger("setPage",t)},e[t].prototype["_initWindow_"+o]=function(){a.$wndw.off(i.keydown+"-"+o).on(i.keydown+"-"+o,function(e){return a.$html.hasClass(n.opened)&&9==e.keyCode?(e.preventDefault(),!1):void 0});var e=0;a.$wndw.off(i.resize+"-"+o).on(i.resize+"-"+o,function(t,o){if(1==a.$page.length&&(o||a.$html.hasClass(n.opened))){var s=a.$wndw.height();(o||s!=e)&&(e=s,a.$page.css("minHeight",s))}})},e[t].prototype._initBlocker=function(){var t=this;this.opts[o].blockUI&&(a.$blck||(a.$blck=e('<div id="'+n.blocker+'" class="'+n.slideout+'" />')),a.$blck.appendTo(a.$body).off(i.touchstart+"-"+o+" "+i.touchmove+"-"+o).on(i.touchstart+"-"+o+" "+i.touchmove+"-"+o,function(e){e.preventDefault(),e.stopPropagation(),a.$blck.trigger(i.mousedown+"-"+o)}).off(i.mousedown+"-"+o).on(i.mousedown+"-"+o,function(e){e.preventDefault(),a.$html.hasClass(n.modal)||(t.closeAllOthers(),t.close())}))};var n,s,i,a}(jQuery);
/*	
 * jQuery mmenu autoHeight addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(t){var e="mmenu",s="autoHeight";t[e].addons[s]={setup:function(){if(this.opts.offCanvas){switch(this.opts.offCanvas.position){case"left":case"right":return}var n=this,o=this.opts[s];if(this.conf[s],h=t[e].glbl,"boolean"==typeof o&&o&&(o={height:"auto"}),"object"!=typeof o&&(o={}),o=this.opts[s]=t.extend(!0,{},t[e].defaults[s],o),"auto"==o.height){this.$menu.addClass(i.autoheight);var u=function(t){var e=parseInt(this.$pnls.css("top"),10)||0;_bot=parseInt(this.$pnls.css("bottom"),10)||0,this.$menu.addClass(i.measureheight),t=t||this.$pnls.children("."+i.current),t.is("."+i.vertical)&&(t=t.parents("."+i.panel).not("."+i.vertical).first()),this.$menu.height(t.outerHeight()+e+_bot).removeClass(i.measureheight)};this.bind("update",u),this.bind("openPanel",u),this.bind("closePanel",u),this.bind("open",u),h.$wndw.off(a.resize+"-autoheight").on(a.resize+"-autoheight",function(){u.call(n)})}}},add:function(){i=t[e]._c,n=t[e]._d,a=t[e]._e,i.add("autoheight measureheight"),a.add("resize")},clickAnchor:function(){}},t[e].defaults[s]={height:"default"};var i,n,a,h}(jQuery);
/*	
 * jQuery mmenu backButton addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(o){var t="mmenu",n="backButton";o[t].addons[n]={setup:function(){if(this.opts.offCanvas){var i=this,e=this.opts[n];if(this.conf[n],a=o[t].glbl,"boolean"==typeof e&&(e={close:e}),"object"!=typeof e&&(e={}),e=o.extend(!0,{},o[t].defaults[n],e),e.close){var c="#"+i.$menu.attr("id");this.bind("opened",function(){location.hash!=c&&history.pushState(null,document.title,c)}),o(window).on("popstate",function(o){a.$html.hasClass(s.opened)?(o.stopPropagation(),i.close()):location.hash==c&&(o.stopPropagation(),i.open())})}}},add:function(){return window.history&&window.history.pushState?(s=o[t]._c,i=o[t]._d,void(e=o[t]._e)):void(o[t].addons[n].setup=function(){})},clickAnchor:function(){}},o[t].defaults[n]={close:!1};var s,i,e,a}(jQuery);
/*	
 * jQuery mmenu counters addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(t){var n="mmenu",e="counters";t[n].addons[e]={setup:function(){var s=this,o=this.opts[e];this.conf[e],c=t[n].glbl,"boolean"==typeof o&&(o={add:o,update:o}),"object"!=typeof o&&(o={}),o=this.opts[e]=t.extend(!0,{},t[n].defaults[e],o),this.bind("init",function(n){this.__refactorClass(t("em",n),this.conf.classNames[e].counter,"counter")}),o.add&&this.bind("init",function(n){n.each(function(){var n=t(this).data(a.parent);n&&(n.children("em."+i.counter).length||n.prepend(t('<em class="'+i.counter+'" />')))})}),o.update&&this.bind("update",function(){this.$pnls.find("."+i.panel).each(function(){var n=t(this),e=n.data(a.parent);if(e){var c=e.children("em."+i.counter);c.length&&(n=n.children("."+i.listview),n.length&&c.html(s.__filterListItems(n.children()).length))}})})},add:function(){i=t[n]._c,a=t[n]._d,s=t[n]._e,i.add("counter search noresultsmsg")},clickAnchor:function(){}},t[n].defaults[e]={add:!1,update:!1},t[n].configuration.classNames[e]={counter:"Counter"};var i,a,s,c}(jQuery);
/*	
 * jQuery mmenu dividers addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(i){var e="mmenu",s="dividers";i[e].addons[s]={setup:function(){var n=this,a=this.opts[s];if(this.conf[s],l=i[e].glbl,"boolean"==typeof a&&(a={add:a,fixed:a}),"object"!=typeof a&&(a={}),a=this.opts[s]=i.extend(!0,{},i[e].defaults[s],a),this.bind("init",function(){this.__refactorClass(i("li",this.$menu),this.conf.classNames[s].collapsed,"collapsed")}),a.add&&this.bind("init",function(e){switch(a.addTo){case"panels":var s=e;break;default:var s=i(a.addTo,this.$pnls).filter("."+d.panel)}i("."+d.divider,s).remove(),s.find("."+d.listview).not("."+d.vertical).each(function(){var e="";n.__filterListItems(i(this).children()).each(function(){var s=i.trim(i(this).children("a, span").text()).slice(0,1).toLowerCase();s!=e&&s.length&&(e=s,i('<li class="'+d.divider+'">'+s+"</li>").insertBefore(this))})})}),a.collapse&&this.bind("init",function(e){i("."+d.divider,e).each(function(){var e=i(this),s=e.nextUntil("."+d.divider,"."+d.collapsed);s.length&&(e.children("."+d.subopen).length||(e.wrapInner("<span />"),e.prepend('<a href="#" class="'+d.subopen+" "+d.fullsubopen+'" />')))})}),a.fixed){var o=function(e){e=e||this.$pnls.children("."+d.current);var s=e.find("."+d.divider).not("."+d.hidden);if(s.length){this.$menu.addClass(d.hasdividers);var n=e.scrollTop()||0,t="";e.is(":visible")&&e.find("."+d.divider).not("."+d.hidden).each(function(){i(this).position().top+n<n+1&&(t=i(this).text())}),this.$fixeddivider.text(t)}else this.$menu.removeClass(d.hasdividers)};this.$fixeddivider=i('<ul class="'+d.listview+" "+d.fixeddivider+'"><li class="'+d.divider+'"></li></ul>').prependTo(this.$pnls).children(),this.bind("openPanel",o),this.bind("init",function(e){e.off(t.scroll+"-dividers "+t.touchmove+"-dividers").on(t.scroll+"-dividers "+t.touchmove+"-dividers",function(){o.call(n,i(this))})})}},add:function(){d=i[e]._c,n=i[e]._d,t=i[e]._e,d.add("collapsed uncollapsed fixeddivider hasdividers"),t.add("scroll")},clickAnchor:function(i,e){if(this.opts[s].collapse&&e){var n=i.parent();if(n.is("."+d.divider)){var t=n.nextUntil("."+d.divider,"."+d.collapsed);return n.toggleClass(d.opened),t[n.hasClass(d.opened)?"addClass":"removeClass"](d.uncollapsed),!0}}return!1}},i[e].defaults[s]={add:!1,addTo:"panels",fixed:!1,collapse:!1},i[e].configuration.classNames[s]={collapsed:"Collapsed"};var d,n,t,l}(jQuery);
/*	
 * jQuery mmenu dragOpen addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(e){function t(e,t,n){return t>e&&(e=t),e>n&&(e=n),e}var n="mmenu",o="dragOpen";e[n].addons[o]={setup:function(){if(this.opts.offCanvas){var i=this,a=this.opts[o],p=this.conf[o];if(r=e[n].glbl,"boolean"==typeof a&&(a={open:a}),"object"!=typeof a&&(a={}),a=this.opts[o]=e.extend(!0,{},e[n].defaults[o],a),a.open){var d,f,c,u,h,l={},m=0,g=!1,v=!1,w=0,_=0;switch(this.opts.offCanvas.position){case"left":case"right":l.events="panleft panright",l.typeLower="x",l.typeUpper="X",v="width";break;case"top":case"bottom":l.events="panup pandown",l.typeLower="y",l.typeUpper="Y",v="height"}switch(this.opts.offCanvas.position){case"right":case"bottom":l.negative=!0,u=function(e){e>=r.$wndw[v]()-a.maxStartPos&&(m=1)};break;default:l.negative=!1,u=function(e){e<=a.maxStartPos&&(m=1)}}switch(this.opts.offCanvas.position){case"left":l.open_dir="right",l.close_dir="left";break;case"right":l.open_dir="left",l.close_dir="right";break;case"top":l.open_dir="down",l.close_dir="up";break;case"bottom":l.open_dir="up",l.close_dir="down"}switch(this.opts.offCanvas.zposition){case"front":h=function(){return this.$menu};break;default:h=function(){return e("."+s.slideout)}}var b=this.__valueOrFn(a.pageNode,this.$menu,r.$page);"string"==typeof b&&(b=e(b));var y=new Hammer(b[0],a.vendors.hammer);y.on("panstart",function(e){u(e.center[l.typeLower]),r.$slideOutNodes=h(),g=l.open_dir}).on(l.events+" panend",function(e){m>0&&e.preventDefault()}).on(l.events,function(e){if(d=e["delta"+l.typeUpper],l.negative&&(d=-d),d!=w&&(g=d>=w?l.open_dir:l.close_dir),w=d,w>a.threshold&&1==m){if(r.$html.hasClass(s.opened))return;m=2,i._openSetup(),i.trigger("opening"),r.$html.addClass(s.dragging),_=t(r.$wndw[v]()*p[v].perc,p[v].min,p[v].max)}2==m&&(f=t(w,10,_)-("front"==i.opts.offCanvas.zposition?_:0),l.negative&&(f=-f),c="translate"+l.typeUpper+"("+f+"px )",r.$slideOutNodes.css({"-webkit-transform":"-webkit-"+c,transform:c}))}).on("panend",function(){2==m&&(r.$html.removeClass(s.dragging),r.$slideOutNodes.css("transform",""),i[g==l.open_dir?"_openFinish":"close"]()),m=0})}}},add:function(){return"function"!=typeof Hammer||Hammer.VERSION<2?void(e[n].addons[o].setup=function(){}):(s=e[n]._c,i=e[n]._d,a=e[n]._e,void s.add("dragging"))},clickAnchor:function(){}},e[n].defaults[o]={open:!1,maxStartPos:100,threshold:50,vendors:{hammer:{}}},e[n].configuration[o]={width:{perc:.8,min:140,max:440},height:{perc:.8,min:140,max:880}};var s,i,a,r}(jQuery);
/*	
 * jQuery mmenu fixedElements addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(s){var i="mmenu",t="fixedElements";s[i].addons[t]={setup:function(){if(this.opts.offCanvas){var n=this.opts[t];this.conf[t],d=s[i].glbl,n=this.opts[t]=s.extend(!0,{},s[i].defaults[t],n);var a=function(s){var i=this.conf.classNames[t].fixed;this.__refactorClass(s.find("."+i),i,"slideout").appendTo(d.$body)};a.call(this,d.$page),this.bind("setPage",a)}},add:function(){n=s[i]._c,a=s[i]._d,e=s[i]._e,n.add("fixed")},clickAnchor:function(){}},s[i].configuration.classNames[t]={fixed:"Fixed"};var n,a,e,d}(jQuery);
/*	
 * jQuery mmenu iconPanels addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(e){var n="mmenu",i="iconPanels";e[n].addons[i]={setup:function(){var a=this,l=this.opts[i];if(this.conf[i],d=e[n].glbl,"boolean"==typeof l&&(l={add:l}),"number"==typeof l&&(l={add:!0,visible:l}),"object"!=typeof l&&(l={}),l=this.opts[i]=e.extend(!0,{},e[n].defaults[i],l),l.visible++,l.add){this.$menu.addClass(s.iconpanel);for(var t=[],o=0;o<=l.visible;o++)t.push(s.iconpanel+"-"+o);t=t.join(" ");var c=function(n){var i=a.$pnls.children("."+s.panel).removeClass(t),d=i.filter("."+s.subopened);d.removeClass(s.hidden).add(n).slice(-l.visible).each(function(n){e(this).addClass(s.iconpanel+"-"+n)})};this.bind("openPanel",c),this.bind("init",function(n){c.call(a,a.$pnls.children("."+s.current)),l.hideNavbars&&n.removeClass(s.hasnavbar),n.each(function(){e(this).children("."+s.subblocker).length||e(this).prepend('<a href="#'+e(this).closest("."+s.panel).attr("id")+'" class="'+s.subblocker+'" />')})})}},add:function(){s=e[n]._c,a=e[n]._d,l=e[n]._e,s.add("iconpanel subblocker")},clickAnchor:function(){}},e[n].defaults[i]={add:!1,visible:3,hideNavbars:!1};var s,a,l,d}(jQuery);
/*	
 * jQuery mmenu navbar addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(n){var a="mmenu",t="navbars";n[a].addons[t]={setup:function(){var r=this,s=this.opts[t],c=this.conf[t];if(i=n[a].glbl,"undefined"!=typeof s){s instanceof Array||(s=[s]);var d={};n.each(s,function(i){var o=s[i];"boolean"==typeof o&&o&&(o={}),"object"!=typeof o&&(o={}),"undefined"==typeof o.content&&(o.content=["prev","title"]),o.content instanceof Array||(o.content=[o.content]),o=n.extend(!0,{},r.opts.navbar,o);var l=o.position,h=o.height;"number"!=typeof h&&(h=1),h=Math.min(4,Math.max(1,h)),"bottom"!=l&&(l="top"),d[l]||(d[l]=0),d[l]++;var f=n("<div />").addClass(e.navbar+" "+e.navbar+"-"+l+" "+e.navbar+"-"+l+"-"+d[l]+" "+e.navbar+"-size-"+h);d[l]+=h-1;for(var v=0,p=o.content.length;p>v;v++){var u=n[a].addons[t][o.content[v]]||!1;u?u.call(r,f,o,c):(u=o.content[v],u instanceof n||(u=n(o.content[v])),u.each(function(){f.append(n(this))}))}var b=Math.ceil(f.children().not("."+e.btn).length/h);b>1&&f.addClass(e.navbar+"-content-"+b),f.children("."+e.btn).length&&f.addClass(e.hasbtns),f.prependTo(r.$menu)});for(var o in d)r.$menu.addClass(e.hasnavbar+"-"+o+"-"+d[o])}},add:function(){e=n[a]._c,r=n[a]._d,s=n[a]._e,e.add("close hasbtns")},clickAnchor:function(){}},n[a].configuration[t]={breadcrumbSeparator:"/"},n[a].configuration.classNames[t]={panelTitle:"Title",panelNext:"Next",panelPrev:"Prev"};var e,r,s,i}(jQuery),/*	
 * jQuery mmenu navbar addon breadcrumbs content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="breadcrumbs";n[a].addons[t][e]=function(t,e,r){var s=n[a]._c,i=n[a]._d;s.add("breadcrumbs separator"),t.append('<span class="'+s.breadcrumbs+'"></span>'),this.bind("init",function(a){a.removeClass(s.hasnavbar).each(function(){for(var a=[],t=n(this),e=n('<span class="'+s.breadcrumbs+'"></span>'),c=n(this).children().first(),d=!0;c&&c.length;){c.is("."+s.panel)||(c=c.closest("."+s.panel));var o=c.children("."+s.navbar).children("."+s.title).text();a.unshift(d?"<span>"+o+"</span>":'<a href="#'+c.attr("id")+'">'+o+"</a>"),d=!1,c=c.data(i.parent)}e.append(a.join('<span class="'+s.separator+'">'+r.breadcrumbSeparator+"</span>")).appendTo(t.children("."+s.navbar))})});var c=function(){var n=this.$pnls.children("."+s.current),a=t.find("."+s.breadcrumbs),e=n.children("."+s.navbar).children("."+s.breadcrumbs);a.html(e.html())};this.bind("openPanel",c),this.bind("init",c)}}(jQuery),/*	
 * jQuery mmenu navbar addon close content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="close";n[a].addons[t][e]=function(t){var e=n[a]._c,r=n[a].glbl;t.append('<a class="'+e.close+" "+e.btn+'" href="#"></a>');var s=function(n){t.find("."+e.close).attr("href","#"+n.attr("id"))};s.call(this,r.$page),this.bind("setPage",s)}}(jQuery),/*	
 * jQuery mmenu navbar addon next content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="next";n[a].addons[t][e]=function(e){var r=n[a]._c;e.append('<a class="'+r.next+" "+r.btn+'" href="#"></a>');var s=function(n){n=n||this.$pnls.children("."+r.current);var a=e.find("."+r.next),s=n.find("."+this.conf.classNames[t].panelNext),i=s.attr("href"),c=s.html();a[i?"attr":"removeAttr"]("href",i),a[i||c?"removeClass":"addClass"](r.hidden),a.html(c)};this.bind("openPanel",s),this.bind("init",function(){s.call(this)})}}(jQuery),/*	
 * jQuery mmenu navbar addon prev content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="prev";n[a].addons[t][e]=function(e){var r=n[a]._c;e.append('<a class="'+r.prev+" "+r.btn+'" href="#"></a>'),this.bind("init",function(n){n.removeClass(r.hasnavbar)});var s=function(){var n=this.$pnls.children("."+r.current),a=e.find("."+r.prev),s=n.find("."+this.conf.classNames[t].panelPrev);s.length||(s=n.children("."+r.navbar).children("."+r.prev));var i=s.attr("href"),c=s.html();a[i?"attr":"removeAttr"]("href",i),a[i||c?"removeClass":"addClass"](r.hidden),a.html(c)};this.bind("openPanel",s),this.bind("init",s)}}(jQuery),/*	
 * jQuery mmenu navbar addon searchfield content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="searchfield";n[a].addons[t][e]=function(t){var e=n[a]._c,r=n('<div class="'+e.search+'" />').appendTo(t);"object"!=typeof this.opts.searchfield&&(this.opts.searchfield={}),this.opts.searchfield.add=!0,this.opts.searchfield.addTo=r}}(jQuery),/*	
 * jQuery mmenu navbar addon title content
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
function(n){var a="mmenu",t="navbars",e="title";n[a].addons[t][e]=function(e,r){var s=n[a]._c;e.append('<a class="'+s.title+'"></a>');var i=function(n){n=n||this.$pnls.children("."+s.current);var a=e.find("."+s.title),i=n.find("."+this.conf.classNames[t].panelTitle);i.length||(i=n.children("."+s.navbar).children("."+s.title));var c=i.attr("href"),d=i.html()||r.title;a[c?"attr":"removeAttr"]("href",c),a[c||d?"removeClass":"addClass"](s.hidden),a.html(d)};this.bind("openPanel",i),this.bind("init",function(){i.call(this)})}}(jQuery);
/*	
 * jQuery mmenu searchfield addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(e){function s(e){switch(e){case 9:case 16:case 17:case 18:case 37:case 38:case 39:case 40:return!0}return!1}var n="mmenu",a="searchfield";e[n].addons[a]={setup:function(){var o=this,d=this.opts[a],c=this.conf[a];r=e[n].glbl,"boolean"==typeof d&&(d={add:d}),"object"!=typeof d&&(d={}),d=this.opts[a]=e.extend(!0,{},e[n].defaults[a],d),this.bind("close",function(){this.$menu.find("."+l.search).find("input").blur()}),this.bind("init",function(n){if(d.add){switch(d.addTo){case"panels":var a=n;break;default:var a=e(d.addTo,this.$menu)}a.each(function(){var s=e(this);if(!s.is("."+l.panel)||!s.is("."+l.vertical)){if(!s.children("."+l.search).length){var n=c.form?"form":"div",a=e("<"+n+' class="'+l.search+'" />');if(c.form&&"object"==typeof c.form)for(var t in c.form)a.attr(t,c.form[t]);a.append('<input placeholder="'+d.placeholder+'" type="text" autocomplete="off" />'),s.hasClass(l.search)?s.replaceWith(a):s.prepend(a).addClass(l.hassearch)}if(d.noResults){var i=s.closest("."+l.panel).length;if(i||(s=o.$pnls.children("."+l.panel).first()),!s.children("."+l.noresultsmsg).length){var r=s.children("."+l.listview).first();e('<div class="'+l.noresultsmsg+'" />').append(d.noResults)[r.length?"insertAfter":"prependTo"](r.length?r:s)}}}}),d.search&&e("."+l.search,this.$menu).each(function(){var n=e(this),a=n.closest("."+l.panel).length;if(a)var r=n.closest("."+l.panel),c=r;else var r=e("."+l.panel,o.$menu),c=o.$menu;var h=n.children("input"),u=o.__findAddBack(r,"."+l.listview).children("li"),f=u.filter("."+l.divider),p=o.__filterListItems(u),v="> a",m=v+", > span",b=function(){var s=h.val().toLowerCase();r.scrollTop(0),p.add(f).addClass(l.hidden).find("."+l.fullsubopensearch).removeClass(l.fullsubopen).removeClass(l.fullsubopensearch),p.each(function(){var n=e(this),a=v;(d.showTextItems||d.showSubPanels&&n.find("."+l.next))&&(a=m),e(a,n).text().toLowerCase().indexOf(s)>-1&&n.add(n.prevAll("."+l.divider).first()).removeClass(l.hidden)}),d.showSubPanels&&r.each(function(){var s=e(this);o.__filterListItems(s.find("."+l.listview).children()).each(function(){var s=e(this),n=s.data(t.sub);s.removeClass(l.nosubresults),n&&n.find("."+l.listview).children().removeClass(l.hidden)})}),e(r.get().reverse()).each(function(s){var n=e(this),i=n.data(t.parent);i&&(o.__filterListItems(n.find("."+l.listview).children()).length?(i.hasClass(l.hidden)&&i.children("."+l.next).not("."+l.fullsubopen).addClass(l.fullsubopen).addClass(l.fullsubopensearch),i.removeClass(l.hidden).removeClass(l.nosubresults).prevAll("."+l.divider).first().removeClass(l.hidden)):a||(n.hasClass(l.opened)&&setTimeout(function(){o.openPanel(i.closest("."+l.panel))},1.5*(s+1)*o.conf.openingInterval),i.addClass(l.nosubresults)))}),c[p.not("."+l.hidden).length?"removeClass":"addClass"](l.noresults),this.update()};h.off(i.keyup+"-searchfield "+i.change+"-searchfield").on(i.keyup+"-searchfield",function(e){s(e.keyCode)||b.call(o)}).on(i.change+"-searchfield",function(){b.call(o)})})}})},add:function(){l=e[n]._c,t=e[n]._d,i=e[n]._e,l.add("search hassearch noresultsmsg noresults nosubresults fullsubopensearch"),i.add("change keyup")},clickAnchor:function(){}},e[n].defaults[a]={add:!1,addTo:"panels",search:!0,placeholder:"Search",noResults:"No results found.",showTextItems:!1,showSubPanels:!0},e[n].configuration[a]={form:!1};var l,t,i,r}(jQuery);
/*	
 * jQuery mmenu sectionIndexer addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(e){var a="mmenu",r="sectionIndexer";e[a].addons[r]={setup:function(){var i=this,d=this.opts[r];this.conf[r],t=e[a].glbl,"boolean"==typeof d&&(d={add:d}),"object"!=typeof d&&(d={}),d=this.opts[r]=e.extend(!0,{},e[a].defaults[r],d),this.bind("init",function(a){if(d.add){switch(d.addTo){case"panels":var r=a;break;default:var r=e(d.addTo,this.$menu).filter("."+n.panel)}r.find("."+n.divider).closest("."+n.panel).addClass(n.hasindexer)}if(!this.$indexer&&this.$pnls.children("."+n.hasindexer).length){this.$indexer=e('<div class="'+n.indexer+'" />').prependTo(this.$pnls).append('<a href="#a">a</a><a href="#b">b</a><a href="#c">c</a><a href="#d">d</a><a href="#e">e</a><a href="#f">f</a><a href="#g">g</a><a href="#h">h</a><a href="#i">i</a><a href="#j">j</a><a href="#k">k</a><a href="#l">l</a><a href="#m">m</a><a href="#n">n</a><a href="#o">o</a><a href="#p">p</a><a href="#q">q</a><a href="#r">r</a><a href="#s">s</a><a href="#t">t</a><a href="#u">u</a><a href="#v">v</a><a href="#w">w</a><a href="#x">x</a><a href="#y">y</a><a href="#z">z</a>'),this.$indexer.children().on(s.mouseover+"-sectionindexer "+n.touchstart+"-sectionindexer",function(){var a=e(this).attr("href").slice(1),r=i.$pnls.children("."+n.current),s=r.find("."+n.listview),t=!1,d=r.scrollTop(),h=s.position().top+parseInt(s.css("margin-top"),10)+parseInt(s.css("padding-top"),10)+d;r.scrollTop(0),s.children("."+n.divider).not("."+n.hidden).each(function(){t===!1&&a==e(this).text().slice(0,1).toLowerCase()&&(t=e(this).position().top+h)}),r.scrollTop(t!==!1?t:d)});var t=function(e){i.$menu[(e.hasClass(n.hasindexer)?"add":"remove")+"Class"](n.hasindexer)};this.bind("openPanel",t),t.call(this,this.$pnls.children("."+n.current))}})},add:function(){n=e[a]._c,i=e[a]._d,s=e[a]._e,n.add("indexer hasindexer"),s.add("mouseover touchstart")},clickAnchor:function(e){return e.parent().is("."+n.indexer)?!0:void 0}},e[a].defaults[r]={add:!1,addTo:"panels"};var n,i,s,t}(jQuery);
/*	
 * jQuery mmenu toggles addon
 * mmenu.frebsite.nl
 *
 * Copyright (c) Fred Heusschen
 */
!function(t){var e="mmenu",c="toggles";t[e].addons[c]={setup:function(){var n=this;this.opts[c],this.conf[c],l=t[e].glbl,this.bind("init",function(e){this.__refactorClass(t("input",e),this.conf.classNames[c].toggle,"toggle"),this.__refactorClass(t("input",e),this.conf.classNames[c].check,"check"),t("input."+s.toggle+", input."+s.check,e).each(function(){var e=t(this),c=e.closest("li"),i=e.hasClass(s.toggle)?"toggle":"check",l=e.attr("id")||n.__getUniqueId();c.children('label[for="'+l+'"]').length||(e.attr("id",l),c.prepend(e),t('<label for="'+l+'" class="'+s[i]+'"></label>').insertBefore(c.children("a, span").last()))})})},add:function(){s=t[e]._c,n=t[e]._d,i=t[e]._e,s.add("toggle check")},clickAnchor:function(){}},t[e].configuration.classNames[c]={toggle:"Toggle",check:"Check"};var s,n,i,l}(jQuery);

//start rotate handel
jQuery(document).ready(function($){
	//set animation timing
	var animationDelay = 2500,
		//loading bar effect
		barAnimationDelay = 3800,
		barWaiting = barAnimationDelay - 3000, //3000 is the duration of the transition on the loading bar - set in the scss/css file
		//letters effect
		lettersDelay = 50,
		//type effect
		typeLettersDelay = 150,
		selectionDuration = 500,
		typeAnimationDelay = selectionDuration + 800,
		//clip effect 
		revealDuration = 600,
		revealAnimationDelay = 1500;
	
	initHeadline();
	

	function initHeadline() {
		//insert <i> element for each letter of a changing word
		singleLetters($('.cd-headline.letters').find('b'));
		//initialise headline animation
		animateHeadline($('.cd-headline'));
	}

	function singleLetters($words) {
		$words.each(function(){
			var word = $(this),
				letters = word.text().split(''),
				selected = word.hasClass('is-visible');
			for (i in letters) {
				if(word.parents('.rotate-2').length > 0) letters[i] = '<em>' + letters[i] + '</em>';
				letters[i] = (selected) ? '<i class="in">' + letters[i] + '</i>': '<i>' + letters[i] + '</i>';
			}
		    var newLetters = letters.join('');
		    word.html(newLetters).css('opacity', 1);
		});
	}

	function animateHeadline($headlines) {
		var duration = animationDelay;
		$headlines.each(function(){
			var headline = $(this);
			
			if(headline.hasClass('loading-bar')) {
				duration = barAnimationDelay;
				setTimeout(function(){ headline.find('.cd-words-wrapper').addClass('is-loading') }, barWaiting);
			} else if (headline.hasClass('clip')){
				var spanWrapper = headline.find('.cd-words-wrapper'),
					newWidth = spanWrapper.width() + 10
				spanWrapper.css('width', newWidth);
			} else if (!headline.hasClass('type') ) {
				//assign to .cd-words-wrapper the width of its longest word
				var words = headline.find('.cd-words-wrapper b'),
					width = 0;
				words.each(function(){
					var wordWidth = $(this).width();
				    if (wordWidth > width) width = wordWidth;
				});
				headline.find('.cd-words-wrapper').css('width', width);
			};

			//trigger animation
			setTimeout(function(){ hideWord( headline.find('.is-visible').eq(0) ) }, duration);
		});
	}

	function hideWord($word) {
		var nextWord = takeNext($word);
		
		if($word.parents('.cd-headline').hasClass('type')) {
			var parentSpan = $word.parent('.cd-words-wrapper');
			parentSpan.addClass('selected').removeClass('waiting');	
			setTimeout(function(){ 
				parentSpan.removeClass('selected'); 
				$word.removeClass('is-visible').addClass('is-hidden').children('i').removeClass('in').addClass('out');
			}, selectionDuration);
			setTimeout(function(){ showWord(nextWord, typeLettersDelay) }, typeAnimationDelay);
		
		} else if($word.parents('.cd-headline').hasClass('letters')) {
			var bool = ($word.children('i').length >= nextWord.children('i').length) ? true : false;
			hideLetter($word.find('i').eq(0), $word, bool, lettersDelay);
			showLetter(nextWord.find('i').eq(0), nextWord, bool, lettersDelay);

		}  else if($word.parents('.cd-headline').hasClass('clip')) {
			$word.parents('.cd-words-wrapper').animate({ width : '2px' }, revealDuration, function(){
				switchWord($word, nextWord);
				showWord(nextWord);
			});

		} else if ($word.parents('.cd-headline').hasClass('loading-bar')){
			$word.parents('.cd-words-wrapper').removeClass('is-loading');
			switchWord($word, nextWord);
			setTimeout(function(){ hideWord(nextWord) }, barAnimationDelay);
			setTimeout(function(){ $word.parents('.cd-words-wrapper').addClass('is-loading') }, barWaiting);

		} else {
			switchWord($word, nextWord);
			setTimeout(function(){ hideWord(nextWord) }, animationDelay);
		}
	}

	function showWord($word, $duration) {
		if($word.parents('.cd-headline').hasClass('type')) {
			showLetter($word.find('i').eq(0), $word, false, $duration);
			$word.addClass('is-visible').removeClass('is-hidden');

		}  else if($word.parents('.cd-headline').hasClass('clip')) {
			$word.parents('.cd-words-wrapper').animate({ 'width' : $word.width() + 10 }, revealDuration, function(){ 
				setTimeout(function(){ hideWord($word) }, revealAnimationDelay); 
			});
		}
	}

	function hideLetter($letter, $word, $bool, $duration) {
		$letter.removeClass('in').addClass('out');
		
		if(!$letter.is(':last-child')) {
		 	setTimeout(function(){ hideLetter($letter.next(), $word, $bool, $duration); }, $duration);  
		} else if($bool) { 
		 	setTimeout(function(){ hideWord(takeNext($word)) }, animationDelay);
		}

		if($letter.is(':last-child') && $('html').hasClass('no-csstransitions')) {
			var nextWord = takeNext($word);
			switchWord($word, nextWord);
		} 
	}

	function showLetter($letter, $word, $bool, $duration) {
		$letter.addClass('in').removeClass('out');
		
		if(!$letter.is(':last-child')) { 
			setTimeout(function(){ showLetter($letter.next(), $word, $bool, $duration); }, $duration); 
		} else { 
			if($word.parents('.cd-headline').hasClass('type')) { setTimeout(function(){ $word.parents('.cd-words-wrapper').addClass('waiting'); }, 200);}
			if(!$bool) { setTimeout(function(){ hideWord($word) }, animationDelay) }
		}
	}

	function takeNext($word) {
		return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
	}

	function takePrev($word) {
		return (!$word.is(':first-child')) ? $word.prev() : $word.parent().children().last();
	}

	function switchWord($oldWord, $newWord) {
		$oldWord.removeClass('is-visible').addClass('is-hidden');
		$newWord.removeClass('is-hidden').addClass('is-visible');
	}
});

//ripple
!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?module.exports=e(require("jquery")):e(jQuery)}(function(e){function t(t,n,i){function o(e){return e.css({overflow:"hidden",position:"relative"})}function s(){p=e.isArray(t.diameter)?Math.floor(Math.random()*t.diameter[1])+t.diameter[0]:t.diameter,u=Math.ceil(p/2)}function r(o,r,c,d){s(),o.css({top:c,left:r}).show(),e.isFunction(n)&&n.call(o),o.animate({opacity:t.reverseOpacity?1:0,width:p,height:p,borderRadius:p,top:c-u,left:r-u},t.animationTime,function(){e.isFunction(i)&&i.call(o,a(d)?d:void 0),t.autoDelete&&o.remove()})}function a(t){return t instanceof e.Event}var c,d=e('<div class="event-pulser">'),f={speed:"fast",size:"medium",bgColor:"#000",event:"click",autoDelete:!0,reverseOpacity:!1,forceContainerStyles:!1},p=0,u=0;return 2==arguments.length&&e.isFunction(t)&&e.isFunction(n)&&(i=n,n=t,t={}),t=e.extend(f,t),t.animationTime="fast"==t.speed?500:"slow"==t.speed?1e3:e.isNumeric(parseInt(t.speed),10)?t.speed:0,t.diameter="small"==t.size?100:"medium"==t.size?200:"large"==t.size?400:"string"==e.type(t.size)?parseInt(t.size,10):t.size,s(),c={position:"absolute",top:0,left:0,display:"none",opacity:t.reverseOpacity?0:1,background:t.bgColor,width:0,height:0,borderRadius:p},d.css(c),this instanceof e?(this.on(t.event,function(n){n.stopPropagation();var i,s,a=e(this),c=d.clone();t.forceContainerStyles&&o(a),i=n.pageX-a.offset().left-parseInt(a.css("border-left-width"),10),s=n.pageY-a.offset().top-parseInt(a.css("border-top"),10),c.appendTo(a),r(c,i,s,n)}),this):function(n,i){var s=d.clone();t.container instanceof e?(t.forceContainerStyles&&o(t.container),s.appendTo(t.container)):s.appendTo(e("body")),r(s,n,i)}}e.extend({ePulse:t}),e.fn.ePulse=t});
