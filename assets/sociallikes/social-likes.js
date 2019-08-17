/**
 * Social Likes
 * http://sapegin.github.com/social-likes
 *
 * Sharing buttons for Russian and worldwide social networks.
 *
 * @requires jQuery
 * @author Artem Sapegin
 * @copyright 2014 Artem Sapegin (sapegin.me)
 * @license MIT
 */

/*global define:false, socialLikesButtons:false */

(function(factory) {  // Try to register as an anonymous AMD module
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else {
        factory(jQuery);
    }
}(function($, undefined) {

    'use strict';

    var prefix = 'social-likes';
    var classPrefix = prefix + '__';
    var openClass = prefix + '_opened';
    var protocol = location.protocol === 'https:' ? 'https:' : 'http:';
    var isHttps = protocol === 'https:';


    /**
     * Buttons
     */
    var services = {
        facebook: {
            // https://developers.facebook.com/docs/reference/fql/link_stat/
            counterUrl: 'https://graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22{url}%22&callback=?',
            convertNumber: function(data) {
                return data.data[0].total_count;
            },
            popupUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}',
            popupWidth: 600,
            popupHeight: 500
        },
        twitter: {
            counterUrl: 'https://cdn.api.twitter.com/1/urls/count.json?url={url}&callback=?',
            convertNumber: function(data) {
                return data.count;
            },
            popupUrl: 'https://twitter.com/intent/tweet?url={url}&text={title}',
            popupWidth: 600,
            popupHeight: 450,
            click: function() {
                // Add colon to improve readability
                if (!/[\.\?:\-–—]\s*$/.test(this.options.title)) this.options.title += ':';
                return true;
            }
        },
        mailru: {
            counterUrl: protocol + '//connect.mail.ru/share_count?url_list={url}&callback=1&func=?',
            convertNumber: function(data) {
                for (var url in data) {
                    if (data.hasOwnProperty(url)) {
                        return data[url].shares;
                    }
                }
            },
            popupUrl: protocol + '//connect.mail.ru/share?share_url={url}&title={title}',
            popupWidth: 550,
            popupHeight: 360
        },
        vkontakte: {
            counterUrl: 'https://vk.com/share.php?act=count&url={url}&index={index}',
            counter: function(jsonUrl, deferred) {
                var options = services.vkontakte;
                if (!options._) {
                    options._ = [];
                    if (!window.VK) window.VK = {};
                    window.VK.Share = {
                        count: function(idx, number) {
                            options._[idx].resolve(number);
                        }
                    };
                }

                var index = options._.length;
                options._.push(deferred);
                $.getScript(makeUrl(jsonUrl, {index: index}))
                    .fail(deferred.reject);
            },
            popupUrl: protocol + '//vk.com/share.php?url={url}&title={title}',
            popupWidth: 550,
            popupHeight: 330
        },
        odnoklassniki: {
            // HTTPS not supported
            counterUrl: isHttps ? undefined : 'http://connect.ok.ru/dk?st.cmd=extLike&ref={url}&uid={index}',
            counter: function(jsonUrl, deferred) {
                var options = services.odnoklassniki;
                if (!options._) {
                    options._ = [];
                    if (!window.ODKL) window.ODKL = {};
                    window.ODKL.updateCount = function(idx, number) {
                        options._[idx].resolve(number);
                    };
                }

                var index = options._.length;
                options._.push(deferred);
                $.getScript(makeUrl(jsonUrl, {index: index}))
                    .fail(deferred.reject);
            },
            popupUrl: 'http://connect.ok.ru/dk?st.cmd=WidgetSharePreview&service=odnoklassniki&st.shareUrl={url}',
            popupWidth: 550,
            popupHeight: 360
        },
        plusone: {
            // HTTPS not supported yet: http://clubs.ya.ru/share/1499
            counterUrl: isHttps ? undefined : 'http://share.yandex.ru/gpp.xml?url={url}',
            counter: function(jsonUrl, deferred) {
                var options = services.plusone;
                if (options._) {
                    // Reject all counters except the first because Yandex Share counter doesn’t return URL
                    deferred.reject();
                    return;
                }

                if (!window.services) window.services = {};
                window.services.gplus = {
                    cb: function(number) {
                        if (typeof number === 'string') {
                            number = number.replace(/\D/g, '');
                        }
                        options._.resolve(parseInt(number, 10));
                    }
                };

                options._ = deferred;
                $.getScript(makeUrl(jsonUrl))
                    .fail(deferred.reject);
            },
            popupUrl: 'https://plus.google.com/share?url={url}',
            popupWidth: 700,
            popupHeight: 500
        },
        pinterest: {
            counterUrl: protocol + '//api.pinterest.com/v1/urls/count.json?url={url}&callback=?',
            convertNumber: function(data) {
                return data.count;
            },
            popupUrl: protocol + '//pinterest.com/pin/create/button/?url={url}&description={title}',
            popupWidth: 630,
            popupHeight: 270
        }
    };


    /**
     * Counters manager
     */
    var counters = {
        promises: {},
        fetch: function(service, url, extraOptions) {
            if (!counters.promises[service]) counters.promises[service] = {};
            var servicePromises = counters.promises[service];

            if (!extraOptions.forceUpdate && servicePromises[url]) {
                return servicePromises[url];
            }
            else {
                var options = $.extend({}, services[service], extraOptions);
                var deferred = $.Deferred();
                var jsonUrl = options.counterUrl && makeUrl(options.counterUrl, {url: url});

                if (jsonUrl && $.isFunction(options.counter)) {
                    options.counter(jsonUrl, deferred);
                }
                else if (options.counterUrl) {
                    $.getJSON(jsonUrl)
                        .done(function(data) {
                            try {
                                var number = data;
                                if ($.isFunction(options.convertNumber)) {
                                    number = options.convertNumber(data);
                                }
                                deferred.resolve(number);
                            }
                            catch (e) {
                                deferred.reject();
                            }
                        })
                        .fail(deferred.reject);
                }
                else {
                    deferred.reject();
                }

                servicePromises[url] = deferred.promise();
                return servicePromises[url];
            }
        }
    };


    /**
     * jQuery plugin
     */
    $.fn.socialLikes = function(options) {
        return this.each(function() {
            var elem = $(this);
            var instance = elem.data(prefix);
            if (instance) {
                if ($.isPlainObject(options)) {
                    instance.update(options);
                }
            }
            else {
                instance = new SocialLikes(elem, $.extend({}, $.fn.socialLikes.defaults, options, dataToOptions(elem)));
                elem.data(prefix, instance);
            }
        });
    };

    $.fn.socialLikes.defaults = {
        url: window.location.href.replace(window.location.hash, ''),
        title: document.title,
        counters: true,
        zeroes: false,
        wait: 500,  // Show buttons only after counters are ready or after this amount of time
        timeout: 10000,  // Show counters after this amount of time even if they aren’t ready
        popupCheckInterval: 500,
        singleTitle: 'Share',
        initHtml: true
    };

    function SocialLikes(container, options) {
        this.container = container;
        this.options = options;
        this.init();
    }

    SocialLikes.prototype = {
        init: function() {
            // Add class in case of manual initialization
            this.container.addClass(prefix);

            this.single = this.container.hasClass(prefix + '_single');

            this.initUserButtons();

            this.countersLeft = 0;
            this.number = 0;
            this.container.on('counter.' + prefix, $.proxy(this.updateCounter, this));

            var buttons = this.container.children();

            this.makeSingleButton();

            this.buttons = [];
            buttons.each($.proxy(function(idx, elem) {
                var button = new Button($(elem), this.options);
                this.buttons.push(button);
                if (button.options.counterUrl) this.countersLeft++;
            }, this));

            if (this.options.counters) {
                this.timer = setTimeout($.proxy(this.appear, this), this.options.wait);
                this.timeout = setTimeout($.proxy(this.ready, this, true), this.options.timeout);
            }
            else {
                this.appear();
            }
        },
        initUserButtons: function() {
            if (!this.userButtonInited && window.socialLikesButtons) {
                $.extend(true, services, socialLikesButtons);
            }
            this.userButtonInited = true;
        },
        makeSingleButton: function() {
            if (!this.single) return;

            var container = this.container;
            container.addClass(prefix + '_vertical');
            container.wrap($('<div>', {'class': prefix + '_single-w'}));
            container.wrapInner($('<div>', {'class': prefix + '__single-container'}));
            var wrapper = container.parent();

            // Widget
            var widget = $('<div>', {
                'class': getElementClassNames('widget', 'single')
            });
            var button = $(template(
                '<div class="{buttonCls}">' +
                    '<span class="{iconCls}"></span>' +
                    '{title}' +
                '</div>',
                {
                    buttonCls: getElementClassNames('button', 'single'),
                    iconCls: getElementClassNames('icon', 'single'),
                    title: this.options.singleTitle
                }
            ));
            widget.append(button);
            wrapper.append(widget);

            widget.on('click', function() {
                var activeClass = prefix + '__widget_active';
                widget.toggleClass(activeClass);
                if (widget.hasClass(activeClass)) {
                    container.css({left: -(container.width()-widget.width())/2,  top: -container.height()});
                    showInViewport(container);
                    closeOnClick(container, function() {
                        widget.removeClass(activeClass);
                    });
                }
                else {
                    container.removeClass(openClass);
                }
                return false;
            });

            this.widget = widget;
        },
        update: function(options) {
            if (!options.forceUpdate && options.url === this.options.url) return;

            // Reset counters
            this.number = 0;
            this.countersLeft = this.buttons.length;
            if (this.widget) this.widget.find('.' + prefix + '__counter').remove();

            // Update options
            $.extend(this.options, options);
            for (var buttonIdx = 0; buttonIdx < this.buttons.length; buttonIdx++) {
                this.buttons[buttonIdx].update(options);
            }
        },
        updateCounter: function(e, service, number) {
            if (number) {
                this.number += number;
                if (this.single) {
                    this.getCounterElem().text(this.number);
                }
            }

            this.countersLeft--;
            if (this.countersLeft === 0) {
                this.appear();
                this.ready();
            }
        },
        appear: function() {
            this.container.addClass(prefix + '_visible');
        },
        ready: function(silent) {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.container.addClass(prefix + '_ready');
            if (!silent) {
                this.container.trigger('ready.' + prefix, this.number);
            }
        },
        getCounterElem: function() {
            var counterElem = this.widget.find('.' + classPrefix + 'counter_single');
            if (!counterElem.length) {
                counterElem = $('<span>', {
                    'class': getElementClassNames('counter', 'single')
                });
                this.widget.append(counterElem);
            }
            return counterElem;
        }
    };


    function Button(widget, options) {
        this.widget = widget;
        this.options = $.extend({}, options);
        this.detectService();
        if (this.service) {
            this.init();
        }
    }

    Button.prototype = {
        init: function() {
            this.detectParams();
            if (this.options.initHtml) this.initHtml();
            else this.widget.on('click', $.proxy(this.click, this));
            setTimeout($.proxy(this.initCounter, this), 0);
        },

        update: function(options) {
            $.extend(this.options, {forceUpdate: false}, options);
            this.widget.find('.' + prefix + '__counter').remove();  // Remove old counter
            this.initCounter();
        },

        detectService: function() {
            var service = this.widget.data('service');
            if (!service) {
                // class="facebook"
                var node = this.widget[0];
                var classes = node.classList || node.className.split(' ');
                for (var classIdx = 0; classIdx < classes.length; classIdx++) {
                    var cls = classes[classIdx];
                    if (services[cls]) {
                        service = cls;
                        break;
                    }
                }
                if (!service) return;
            }
            this.service = service;
            $.extend(this.options, services[service]);
        },

        detectParams: function() {
            var data = this.widget.data();

            // Custom page counter URL or number
            if (data.counter) {
                var number = parseInt(data.counter, 10);
                if (isNaN(number)) {
                    this.options.counterUrl = data.counter;
                }
                else {
                    this.options.counterNumber = number;
                }
            }

            // Custom page title
            if (data.title) {
                this.options.title = data.title;
            }

            // Custom page URL
            if (data.url) {
                this.options.url = data.url;
            }
        },

        initHtml: function() {
            var options = this.options;
            var widget = this.widget;

            // Old initialization HTML
            var a = widget.find('a');
            if (a.length) {
                this.cloneDataAttrs(a, widget);
            }

            // Button
            var button = $('<span>', {
                'class': this.getElementClassNames('button'),
                'text': widget.text()
            });
            if (options.clickUrl) {
                var url = makeUrl(options.clickUrl, {
                    url: options.url,
                    title: options.title
                });
                var link = $('<a>', {
                    href: url
                });
                this.cloneDataAttrs(widget, link);
                widget.replaceWith(link);
                this.widget = widget = link;
            }
            else {
                widget.on('click', $.proxy(this.click, this));
            }

            widget.removeClass(this.service);
            widget.addClass(this.getElementClassNames('widget'));

            // Icon
            button.prepend($('<span>', {'class': this.getElementClassNames('icon')}));

            widget.empty().append(button);
            this.button = button;
        },

        initCounter: function() {
            if (this.options.counters) {
                if (this.options.counterNumber) {
                    this.updateCounter(this.options.counterNumber);
                }
                else {
                    var extraOptions = {
                        counterUrl: this.options.counterUrl,
                        forceUpdate: this.options.forceUpdate
                    };
                    counters.fetch(this.service, this.options.url, extraOptions)
                        .always($.proxy(this.updateCounter, this));
                }
            }
        },

        cloneDataAttrs: function(source, destination) {
            var data = source.data();
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    destination.data(key, data[key]);
                }
            }
        },

        getElementClassNames: function(elem) {
            return getElementClassNames(elem, this.service);
        },

        updateCounter: function(number) {
            number = parseInt(number, 10) || 0;

            var params = {
                'class': this.getElementClassNames('counter'),
                'text': number
            };
            if (!number && !this.options.zeroes) {
                params['class'] += ' ' + prefix + '__counter_empty';
                params.text = '';
            }
            var counterElem = $('<span>', params);
            this.widget.append(counterElem);

            this.widget.trigger('counter.' + prefix, [this.service, number]);
        },

        click: function(e) {
            var options = this.options;
            var process = true;
            if ($.isFunction(options.click)) {
                process = options.click.call(this, e);
            }
            if (process) {
                var url = makeUrl(options.popupUrl, {
                    url: options.url,
                    title: options.title
                });
                url = this.addAdditionalParamsToUrl(url);
                this.openPopup(url, {
                    width: options.popupWidth,
                    height: options.popupHeight
                });
            }
            return false;
        },

        addAdditionalParamsToUrl: function(url) {
            var params = $.param($.extend(this.widget.data(), this.options.data));
            if ($.isEmptyObject(params)) return url;
            var glue = url.indexOf('?') === -1 ? '?' : '&';
            return url + glue + params;
        },

        openPopup: function(url, params) {
            var left = Math.round(screen.width/2 - params.width/2);
            var top = 0;
            if (screen.height > params.height) {
                top = Math.round(screen.height/3 - params.height/2);
            }

            var win = window.open(url, 'sl_' + this.service, 'left=' + left + ',top=' + top + ',' +
               'width=' + params.width + ',height=' + params.height + ',personalbar=0,toolbar=0,scrollbars=1,resizable=1');
            if (win) {
                win.focus();
                this.widget.trigger('popup_opened.' + prefix, [this.service, win]);
                var timer = setInterval($.proxy(function() {
                    if (!win.closed) return;
                    clearInterval(timer);
                    this.widget.trigger('popup_closed.' + prefix, this.service);
                }, this), this.options.popupCheckInterval);
            }
            else {
                location.href = url;
            }
        }
    };


    /**
     * Helpers
     */

     // Camelize data-attributes
    function dataToOptions(elem) {
        function upper(m, l) {
            return l.toUpper();
        }
        var options = {};
        var data = elem.data();
        for (var key in data) {
            var value = data[key];
            if (value === 'yes') value = true;
            else if (value === 'no') value = false;
            options[key.replace(/-(\w)/g, upper)] = value;
        }
        return options;
    }

    function makeUrl(url, context) {
        return template(url, context, encodeURIComponent);
    }

    function template(tmpl, context, filter) {
        return tmpl.replace(/\{([^\}]+)\}/g, function(m, key) {
            // If key doesn't exists in the context we should keep template tag as is
            return key in context ? (filter ? filter(context[key]) : context[key]) : m;
        });
    }

    function getElementClassNames(elem, mod) {
        var cls = classPrefix + elem;
        return cls + ' ' + cls + '_' + mod;
    }

    function closeOnClick(elem, callback) {
        function handler(e) {
            if ((e.type === 'keydown' && e.which !== 27) || $(e.target).closest(elem).length) return;
            elem.removeClass(openClass);
            doc.off(events, handler);
            if ($.isFunction(callback)) callback();
        }
        var doc = $(document);
        var events = 'click touchstart keydown';
        doc.on(events, handler);
    }

    function showInViewport(elem) {
        var offset = 10;
        if (document.documentElement.getBoundingClientRect) {
            var left = parseInt(elem.css('left'), 10);
            var top = parseInt(elem.css('top'), 10);

            var rect = elem[0].getBoundingClientRect();
            if (rect.left < offset)
                elem.css('left', offset - rect.left + left);
            else if (rect.right > window.innerWidth - offset)
                elem.css('left', window.innerWidth - rect.right - offset + left);

            if (rect.top < offset)
                elem.css('top', offset - rect.top + top);
            else if (rect.bottom > window.innerHeight - offset)
                elem.css('top', window.innerHeight - rect.bottom - offset + top);
        }
        elem.addClass(openClass);
    }


    /**
     * Auto initialization
     */
    $(function() {
        $('.' + prefix).socialLikes();
    });

}));
