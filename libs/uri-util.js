/*!
 * uri-util - URI Util module to work with URIs in browser and server
 * @version v1.1.0 - Sun Dec 07 2014
 * @link https://github.com/pasangsherpa/uri-util
 * @author Pasang Sherpa <pgyalzen@gmail.com> (https://github.com/pasangsherpa)
 * @license MIT
 */
(function() {
    'use strict';

    var isCommonjs = typeof module !== 'undefined' && module.exports;
    var isAMD = typeof define === 'function' && define.amd;

    var URIUtil = {
        parse: function(str) {
            if (typeof str !== 'string') {
                return {};
            }
            str = str.trim().replace(/^(.*?)(\?|#)/, '').replace(/\+/g, '%20');
            if (!str) {
                return {};
            }

            return str.split('&').reduce(function(queryObj, querystring) {
                querystring = querystring.split('=');
                var key = querystring[0];
                var val = querystring[1];

                key = decodeURIComponent(key);
                val = val === undefined ? null : decodeURIComponent(val);

                if (!queryObj.hasOwnProperty(key)) {
                    queryObj[key] = val;
                } else if (Array.isArray(queryObj[key])) {
                    queryObj[key].push(val);
                } else {
                    queryObj[key] = [queryObj[key], val];
                }
                return queryObj;
            }, {});
        },

        stringify: function(obj) {
            return obj ? Object.keys(obj).map(function(key) {
                var val = obj[key];
                if (Array.isArray(val)) {
                    return val.map(function(val2) {
                        return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
                    }).join('&');
                }
                return encodeURIComponent(key) + '=' + encodeURIComponent(val);
            }).join('&') : '';
        },

        getQueryValue: function(str, key) {
            if (typeof str !== 'string') {
            	return '';}
            str = str.trim().replace(/^(.*?)(\?|#)/, '');
            if (!str) {return '';}
            return decodeURIComponent((new RegExp(key + '=([^&;]+?)(&|#|;|$)')
                .exec(str) || [, ''])[1].replace(/\+/g, '%20')) || null;
        },

        getQueryValueInLoc: function(key) {
            return this.getQueryValue(location.search, key);
        }
    };

    if (isCommonjs) {
        module.exports = URIUtil;
    } else if (isAMD) {
        define(function() {
            return URIUtil;
        });
    } else {
        window.URIUtil = URIUtil;
    }

})();
