/**
 * React Component Styles (RCS) v0.0.0
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('react-rcs/browser/transformer');
},{"react-rcs/browser/transformer":6}],2:[function(require,module,exports){
'use strict';

/*!
 * contentLoaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: cross-browser wrapper for DOMContentLoaded
 * Updated: 20101020
 * License: MIT
 * Version: 1.2
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 *
 */
 
// @win window reference
// @fn function reference
function contentLoaded(win, fn) {
 
	var done = false, top = true,
 
	doc = win.document, root = doc.documentElement,
 
	add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
	rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
	pre = doc.addEventListener ? '' : 'on',
 
	init = function(e) {
		if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
			return;
		}
		(e.type === 'load' ? win : doc)[rem](pre + e.type, init, false);
		if (!done && (done = true)) {
			fn.call(win, e.type || e);
		}
	},
 
	poll = function() {
		try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
		init('poll');
	};
 
	if (doc.readyState === 'complete') {
		fn.call(win, 'lazy');
	} else {
		if (doc.createEventObject && root.doScroll) {
			try { top = !win.frameElement; } catch(e) { }
			if (top) {
				poll();
			}
		}
		doc[add](pre + 'DOMContentLoaded', init, false);
		doc[add](pre + 'readystatechange', init, false);
		win[add](pre + 'load', init, false);
	}
 
}

module.exports = contentLoaded;
},{}],3:[function(require,module,exports){
'use strict';

var toHyphenDelimited = require('../utils/toHyphenDelimited');

function addPrefixToClassName (prefix, className) {
	return prefix + '-' + toHyphenDelimited(className);
}

function addClassPrefixToClassString (prefix, classString) {
	return classString.split(' ').map(function (className) {
		return addPrefixToClassName(prefix, className);
	}).join(' ');
}

function addClassPrefixToNode (node, displayName, _isChild) {		
	if (!node || !node.props) {
		return;
	}

	var props = node.props,
		prefix = 'react-' + toHyphenDelimited(displayName);

	if (props.class) {
		// precompute class names
		props.class = props.class.split(' ').map(function (className) {
			// replace state shorthand
			className = className.replace(/^\:\:\:/, 'state-');
			return className;
		}).join(' ');
	}

	// modify class strings
	if (props.class && !_isChild) {
		props.class = ['react-view', prefix, addClassPrefixToClassString(prefix, props.class)].join(' ');
	} else if (props.class && _isChild) {
		props.class = addClassPrefixToClassString(prefix, props.class);
	} else if (!props.class && !_isChild) {
		props.class = 'react-view ' + prefix;
	}

	// add to className
	if (props.className && props.class) {
		props.className += ' ' + props.class;
	} else if (!props.className && props.class) {
		props.className = props.class;
	}
	delete props.class;

	if (typeof props.children === 'string') {
		return;
	}

	// traverse children
	if (Array.isArray(props.children)) {
		props.children.forEach(function (node) {
			addClassPrefixToNode(node, displayName, true);
		});
	} else if (typeof props.children === 'object') {
		addClassPrefixToNode(props.children, displayName, true);
	} else if (props.children && props.children._store) {
		addClassPrefixToNode(props.children, displayName, true);
	}
}

exports.addClassPrefixToNode = addClassPrefixToNode;
},{"../utils/toHyphenDelimited":10}],4:[function(require,module,exports){
'use strict';

var XMLHttpFactories = [
    function () {return new window.XMLHttpRequest();},
    function () {return new window.ActiveXObject('Msxml2.XMLHTTP');},
    function () {return new window.ActiveXObject('Msxml3.XMLHTTP');},
    function () {return new window.ActiveXObject('Microsoft.XMLHTTP');}
];

function createXMLHTTPObject() {
    var xmlhttp = false;
    for (var i=0;i<XMLHttpFactories.length;i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        }
        catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}

function sendRequest(url,callback,postData) {
    var req = createXMLHTTPObject();
    if (!req) {
    	return;
    }
    var method = (postData) ? 'POST' : 'GET';
    req.open(method,url,true);
    if (postData) {
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    }
    req.onreadystatechange = function () {
        if (req.readyState !== 4) {
        	return;
        }
        if (req.status !== 200 && req.status !== 304) {
//          alert('HTTP error ' + req.status);
            return;
        }
        callback(req);
    };

    if (req.readyState === 4) {
    	return;
    }
    
    req.send(postData);
}

module.exports = sendRequest;
},{}],5:[function(require,module,exports){
'use strict';

var Style = require('../style');

var element = window.document.createElement('style'),
	ready = false,
	writeTimeout = null,
	firstRun = true,
	styles = [],
	writeQueue = [],
	styleIdenfiers = [];

function getStylesheetObjectForInstance () {
	var stylesheet = false;

	for (var i = 0; i < window.document.styleSheets.length; i++) {
		if ((window.document.styleSheets[i].ownerNode || window.document.styleSheets[i].owningElement) === element)	{
			stylesheet = window.document.styleSheets[i];
			break;
		}
	}

	return stylesheet;
}

function checkIfStylesheetIsReady (callback) {
	var style = getStylesheetObjectForInstance();

	// check if the stylesheet is processed and ready
	try {
		if (style && style.rules && style.rules.length !== undefined) {
			ready = true;
		} else if (style && style.cssRules && style.rules.length !== undefined) {
			ready = true;
		}
	} catch (e) {}

	// write html if we are really ready
	if (ready) {
		if (callback) {
			window.setTimeout(callback, 0);
		}
		return;
	}

	window.setTimeout(function () {
		checkIfStylesheetIsReady(callback);
	}, 0);
}

function writeRulesForStyles (styles) {
	var stylesheetText = '';

	for (var style in styles) {
		stylesheetText += '\n/* Styles for ' + styles[style].displayName + ' component */\n';
		stylesheetText += styles[style].toString();
	}
	
	element.innerHTML += stylesheetText;
}

function addStyle (style) {
	if (styleIdenfiers.indexOf(style.displayName) >= 0) {
		return;
	}

	styles.push(style);
	writeQueue.push(style);
	styleIdenfiers.push(style.displayName);
}

function writeStyles () {
	if (firstRun && ready) {
		return writeRulesForStyles(writeQueue.splice(0));
	}

	clearTimeout(writeTimeout);

	writeTimeout = setTimeout(function () {
		writeRulesForStyles(writeQueue.splice(0));
	}, 0);
}

function createStyle (displayName, style) {
	addStyle(new Style(style, displayName));
	writeStyles();
}

// initialization
(function () {
	// append our stylesheet to the head
	window.document.getElementsByTagName('head')[0].appendChild(element);

	// track the first event loop
	setTimeout(function () {
		firstRun = false;
	}, 0);

	// check the DOM for the stylesheet
	checkIfStylesheetIsReady(function () {
		writeStyles();
	});
})();

exports.createStyle = createStyle;
exports.addStyle = addStyle;
exports.writeStyles = writeStyles;
},{"../style":9}],6:[function(require,module,exports){
'use strict';

var React = window.React,
	Style = require('../style'),
	StyleSheet = require('./stylesheet'),
	DOM = require('./dom'),
	Properties = require('../properties'),
	Parser = require('../parser'),
	contentLoaded = require('./contentLoaded'),
	sendRequest = require('./sendRequest');

// initializes ReactStyle, mainly used for adding mixins
if (typeof window.RCSPropertiesInit !== 'undefined') {
	window.RCSPropertiesInit(Properties);
}

if (typeof React !== 'undefined') {
	React.createClass = (function (createClass) {
		return function (spec) {
			if (spec.style) {
				StyleSheet.addStyle(new Style(spec.displayName, spec.style));
				StyleSheet.writeStyles();

				delete spec.style;
			}

			var render = spec.render;
			spec.render = function () {
				var node = render.apply(this, arguments);
				DOM.addClassPrefixToNode(node, spec.displayName);
				return node;
			};

			return createClass(spec);
		};
	})(React.createClass);
}

function processRCSSource (source, name) {
	var css = '';
	var rcs = Parser.parseRCS(source);

	for (var selector in rcs) {
		if (selector.match(/\@component/)) {
			var componentName = selector.match(/@component (.+)/)[1];
			var style = new Style(componentName, rcs[selector]);
			css += '/* Style for component ' + componentName + ' */\n';
			css += style.toString() + '\n\n';
			delete rcs[selector];
		}
	}

	if (name) {
		css += new Style(name, rcs);
	}

	return css.trim();
}

// process html
contentLoaded(window, function () {
	// replace rcs style tags
	var rcsStyles = Array.prototype.slice.call(document.querySelectorAll('style[type="text/rcs"]'));
	rcsStyles.forEach(function (style) {
		var name = style.getAttribute('component');
		var element = document.createElement('style');
		element.innerHTML = processRCSSource(style.innerHTML, name);
		element.setAttribute('type', 'text/css');
		if (name) {
			element.setAttribute('component', name);
		}

		style.parentNode.replaceChild(element, style);
	});

	// replace rcs link tags
	var rcsLinks = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet/rcs"][type="text/css"]'));
	rcsLinks.forEach(function (link) {
		var name = link.getAttribute('component');

		sendRequest(link.getAttribute('href'), function (request) {
			var element = document.createElement('style');
			element.innerHTML = processRCSSource(request.responseText, name);
			element.setAttribute('type', 'text/css');
			if (name) {
				element.setAttribute('component', name);
			}
			link.parentNode.replaceChild(element, link);
		});
	});
});

exports.Style = Style;
exports.StyleSheet = StyleSheet;
exports.Properties = Properties;
exports.Parser = Parser;
},{"../parser":7,"../properties":8,"../style":9,"./contentLoaded":2,"./dom":3,"./sendRequest":4,"./stylesheet":5}],7:[function(require,module,exports){
'use strict';

/**
 * Parses a RCS string to a JSON object.
 */
function parseRCS (rcs) {
	var original = rcs;

	rcs = '{\n' + rcs + '\n}';
	
	rcs = rcs.replace(/"/g, '\\"');

	// strip comments
	rcs = rcs.replace(/^[\t]+\/\/.+$/gim, '');
	rcs = rcs.replace(/\/\*[\S\s]*?\*\//gim, '');

	// add quotes
	rcs = rcs.replace(/([\@a-z0-9\-\.\:\*][a-z0-9\-\.\:\s\*]*)(?:\s+)?:\s*(.+);/gi, '"$1": "$2";');
	rcs = rcs.replace(/([\@a-z0-9\-\.\:\*][a-z0-9\%\-\.\:\s\*\[\]\=\'\"\,]*?)(?:\s*)([\{\[])/gi, '"$1": $2');

	// remove unnessary white spaces
	//rcs = rcs.replace(/\n|\t/g, '');

	// default number values to pixels
	//rcs = rcs.replace(/(\d+)(?!\d)(?!%|px)/gi, '$1px');

	// add commas
	rcs = rcs.replace(/\}(?!\s*[\}\]]|$)/g, '},');
	rcs = rcs.replace(/;(?!\s*[\}\]])/g, ',');
	rcs = rcs.replace(/;(?=\s*[\}\]])/g, '');

	try {
		return JSON.parse(rcs);
	} catch (error) {
		throw new Error('Issue Parsing RCS: \noriginal:\n' + original + '\n\nmalformed:\n' + rcs);
	}
}

exports.parseRCS = parseRCS;
},{}],8:[function(require,module,exports){
'use strict';

/**
 * Manages css property/value transforms.
 */
var propertyTransforms = [],
	prefixedProperties = [],
	baseUrl = '';

function registerProperty (property, transform) {
	propertyTransforms.push({property: property, method: transform});
}

function registerStandardPrefixedProperties (properties) {
	properties.forEach(function (property) {
		prefixedProperties[property] = true;
	});
}

function standardTransform (name, value) {
	return [
		{name: '-webkit-' + name, value: value},
		{name: '-ms-' + name, value: value},
		{name: '-moz-' + name, value: value},
		{name: '-o-' + name, value: value},
		{name: name, value: value}
	];
}

function transform (name, value) {
	var results = [];

	propertyTransforms.forEach(function (transform) {
		if (transform.property !== name) {
			return;
		}

		var transforms = transform.method(name, value);
		
		if (transforms) {
			results = results.concat(transforms);
		}
	});

	if (!results.length) {
		if (prefixedProperties[name]) {
			return standardTransform(name, value);
		} else {
			results.push({name: name, value: value});
		}
	}

	return results;
}

// register defaults
registerProperty('background', function (name, value) {
	var matches = value.match(/url\(['"]*(.+?)['"]*\)/);
	
	if (!matches || !baseUrl) {
		return;
	}

	var url = matches[1],
		newUrl = baseUrl + url;

	return {
		name: name,
		value: value.replace(url, newUrl)
	};
});

exports.setBaseUrl =  function (url) {
	baseUrl = url;
};
exports.transform = transform;
exports.registerProperty = registerProperty;
exports.registerStandardPrefixedProperties = registerStandardPrefixedProperties;
},{}],9:[function(require,module,exports){
'use strict';

var Properties = require('./properties'),
	Parser = require('./parser'),
	toHyphenDelimited = require('./utils/toHyphenDelimited');

/**
 * Manages css property/value transforms.
 */
function Style (displayName, style, options) {
	options = options || {};
	
	this.displayName = displayName;

	this._prefix = 'react-' + toHyphenDelimited(displayName) + '-';
	
	this._selectorPrefix = '.react-view.' + this._prefix.substr(0, this._prefix.length-1) + ' ';

	this.rules = {};
	this.animations = {};
	this.instanceRules = {};
	this.mediaQueries = {};

	this.parseStyle(style);
}

Style.prototype = {
	INT_PROPERTIES: ['z-index', 'opacity'],

	parseStyle: function (style) {
		var rules;
		
		if (typeof style === 'object') {
			rules = style;
		} else if (typeof style === 'string') {
			try {

				rules = Parser.parseRCS(style);
			} catch (error) {
				throw new Error('Parsing component ' + this.displayName + '\n' + error);
			}
		}

		this._addRules(rules);
	},

	_addRules: function (rules) {
		// traverse arguments and run addRule on each item
		for (var rule in rules) {
			var rulesBuffer = {rules: {}, animations: {}};

			if (rule.match(/^@media/)) {	
				for (var mediaRule in rules[rule]) {
					this._addRule(mediaRule, rules[rule][mediaRule], rulesBuffer);
				}

				this.mediaQueries[rule] = rulesBuffer;
			} else {
				this._addRule(rule, rules[rule], rulesBuffer);

				var bufferRulesKeys = Object.keys(rulesBuffer.rules);
				bufferRulesKeys.sort();
				bufferRulesKeys.forEach(function (key) {
					this.rules[key] = rulesBuffer.rules[key];
				}, this);
				for (var animation in rulesBuffer.animations) {
					this.animations[animation] = rulesBuffer.animations[animation];
				}
			}
		}
	},

	_addRule: function (selector, properties, rulesBuffer, _recursive) {
		if (selector.match(/^@keyframes/)) {
			return this._addKeyframeAnimation(selector, properties, rulesBuffer);
		}

		if (selector.substr(0, 3) === ':::') {
			return this._addRule(this._resolveStateWithSelector(selector), properties, rulesBuffer, true);
		} else if (selector.match(/^\:\:?[a-z]/)) {
			selector = this._selectorPrefix.slice(0, -1) + selector;

			return this._addRule(selector, properties, rulesBuffer, true);
		}

		// properly process the selector
		var selectors = selector.split(',');
		if (selectors.length > 1) {
			selectors.forEach(function (item) {
				this._addRule(item.trim(), properties, rulesBuffer, true);
			}, this);
			return;
		} else {
			selector = this._resolveSelector(selector);
		}

		// track altered properties
		var _properties = rulesBuffer.rules[selector] || [];

		for (var property in properties) {
			if (typeof properties[property] === 'object') {
		 		if (property.substr(0, 3) === ':::') {
					this._addRule(this._resolveStateWithSelector(property, selector), properties[property], rulesBuffer, true);
		 		} else {
		 			this._addRule(this._addParentSelectorToSelector(selector, property), properties[property], rulesBuffer, true);
		 		}
			} else {
				var resolved = Properties.transform(property, properties[property]);
				resolved.forEach(function (property) {
					if (property.value !== undefined) {
						_properties.push(property);
					}
				});
			}
		}

		// add to rules
		rulesBuffer.rules[selector] = _properties;

		return rulesBuffer;
	},

	_resolveSelector: function (selector) {
		if (this._prefix !== 'react-') {
			if (/(^|\s|,)view/.test(selector)) {
				selector = selector.replace(/(^|\s|,)view/g, '$1.react-view.' + this._prefix.substr(0, this._prefix.length-1));
			} else if (!selector.match(/.react-/) && selector.match(/\.|\#/)) {
				selector = this._selectorPrefix + selector;
			}
		}

		selector = selector.replace(new RegExp('([#\\.])(?!react-)([a-z0-9\\-_]*)', 'ig'), '$1' + this._prefix + '$2');

		return selector.trim();
	},

	_resolveStateWithSelector: function (state, selector) {
		state = state.substr(3);
		selector = selector || '';

		var viewSelector = '.react-view.' + this._prefix.substr(0, this._prefix.length-1);

		if (!state.match(/^react/)) {
			// prepend with state
			state = state.split('.').map(function (state) {
				return 'state-' + state;
			}).join('.');

			if (!selector) {
				selector += this._resolveSelector(this._selectorPrefix.slice(0, -1) + '.' + this._prefix + state);
			} else {
				selector = selector.replace(viewSelector, viewSelector + '.' + this._prefix + state);
			}
		} else {
			if (!selector) {
				selector = this._resolveSelector('.' + state) + ' ' + viewSelector;
			} else {
				selector = this._resolveSelector('.' + state) + ' ' + selector;
			}
		}

		return selector;
	},

	_addParentSelectorToSelector: function (parent, selector) {
		return selector.split(',').map(function (item) {
			return parent + (item.substr(0, 1) === ':' ? '' : ' ') + item;
		}).join(',');
	},

	_addKeyframeAnimation: function (selector, list, rulesBuffer) {
		var identifier = selector.replace('@keyframes ', ''),
			keyframesName = 'keyframes',
			value = '';

		for (var time in list) {
			value += time + ' {';

			for (var property in list[time]) {
				var resolved = Properties.transform(property, list[time][property]);
				resolved.forEach(function (property) {
					value += property.name + ': ' + property.value + ';';
				});
			}
			value += '}';
		}

		rulesBuffer.animations['@-webkit-' + keyframesName + ' ' + identifier] = value;
		rulesBuffer.animations['@-ms-' + keyframesName + ' ' + identifier] = value;
		rulesBuffer.animations['@-moz-' + keyframesName + ' ' + identifier] = value;
		rulesBuffer.animations['@-o-' + keyframesName + ' ' + identifier] = value;
		rulesBuffer.animations['@' + keyframesName + ' ' + identifier] = value;
	},

	toString: function () {
		var stylesheetText = '',
			ruleStrings = this.rulesToStrings(this.rules);

		for (var selector in ruleStrings) {
			stylesheetText += selector + ' {' + ruleStrings[selector] + '}\n';
		}

		for (var animation in this.animations) {
			stylesheetText += animation + ' {' + this.animations[animation] + '}\n';
		}

		stylesheetText += this.mediaQueriesToString(this.mediaQueries);

		return stylesheetText.trim();
	},

	mediaQueriesToString: function (queries) {
		var string = '';

		for (var query in queries) {
			var animations = queries[query].animations,
				rules = queries[query].rules;

			var queryString = query + ' {\n',
				mediaQueryRuleStrings = this.rulesToStrings(rules);

			for (var selector in mediaQueryRuleStrings) {
				queryString += '\t' + selector + ' {' + mediaQueryRuleStrings[selector] + '}\n';
			}

			for (var animation in animations) {
				queryString +=  '\t' + animation + ' {' + animations[animation] + '}\n';
			}

			queryString += '}\n';

			string += queryString;
		}

		return string;
	},


	rulesToStrings: function (rules) {
		var strings = {};
		for (var selector in rules) {
			var propertiesString = '',
				rule = rules[selector];
			
			rule.forEach(function (property) {
				propertiesString += property.name + ':' + property.value + ';';
			});

			if (!propertiesString) {
				continue;
			}
			strings[selector] = propertiesString;
		}
		return strings;
	}
};

module.exports = Style;
},{"./parser":7,"./properties":8,"./utils/toHyphenDelimited":10}],10:[function(require,module,exports){
"use strict";

/**
 * Converts a CamelCase string to a hyphen-delimited string.
 */
function toHyphenDelimited (string) {
  return string.replace(/([a-z][A-Z])/g, function (g) {
    return g[0] + '-' + g[1];
  }).toLowerCase();
};

module.exports = toHyphenDelimited;
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9saWIvcmNzLXdpdGgtdHJhbnNmb3JtZXIuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvY29udGVudExvYWRlZC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci9kb20uanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvc2VuZFJlcXVlc3QuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvc3R5bGVzaGVldC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci90cmFuc2Zvcm1lci5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcGFyc2VyLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9wcm9wZXJ0aWVzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9zdHlsZS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncmVhY3QtcmNzL2Jyb3dzZXIvdHJhbnNmb3JtZXInKTsiLCIndXNlIHN0cmljdCc7XG5cbi8qIVxuICogY29udGVudExvYWRlZC5qc1xuICpcbiAqIEF1dGhvcjogRGllZ28gUGVyaW5pIChkaWVnby5wZXJpbmkgYXQgZ21haWwuY29tKVxuICogU3VtbWFyeTogY3Jvc3MtYnJvd3NlciB3cmFwcGVyIGZvciBET01Db250ZW50TG9hZGVkXG4gKiBVcGRhdGVkOiAyMDEwMTAyMFxuICogTGljZW5zZTogTUlUXG4gKiBWZXJzaW9uOiAxLjJcbiAqXG4gKiBVUkw6XG4gKiBodHRwOi8vamF2YXNjcmlwdC5ud2JveC5jb20vQ29udGVudExvYWRlZC9cbiAqIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9Db250ZW50TG9hZGVkL01JVC1MSUNFTlNFXG4gKlxuICovXG4gXG4vLyBAd2luIHdpbmRvdyByZWZlcmVuY2Vcbi8vIEBmbiBmdW5jdGlvbiByZWZlcmVuY2VcbmZ1bmN0aW9uIGNvbnRlbnRMb2FkZWQod2luLCBmbikge1xuIFxuXHR2YXIgZG9uZSA9IGZhbHNlLCB0b3AgPSB0cnVlLFxuIFxuXHRkb2MgPSB3aW4uZG9jdW1lbnQsIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuIFxuXHRhZGQgPSBkb2MuYWRkRXZlbnRMaXN0ZW5lciA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdhdHRhY2hFdmVudCcsXG5cdHJlbSA9IGRvYy5hZGRFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50Jyxcblx0cHJlID0gZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyAnJyA6ICdvbicsXG4gXG5cdGluaXQgPSBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUudHlwZSA9PT0gJ3JlYWR5c3RhdGVjaGFuZ2UnICYmIGRvYy5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdChlLnR5cGUgPT09ICdsb2FkJyA/IHdpbiA6IGRvYylbcmVtXShwcmUgKyBlLnR5cGUsIGluaXQsIGZhbHNlKTtcblx0XHRpZiAoIWRvbmUgJiYgKGRvbmUgPSB0cnVlKSkge1xuXHRcdFx0Zm4uY2FsbCh3aW4sIGUudHlwZSB8fCBlKTtcblx0XHR9XG5cdH0sXG4gXG5cdHBvbGwgPSBmdW5jdGlvbigpIHtcblx0XHR0cnkgeyByb290LmRvU2Nyb2xsKCdsZWZ0Jyk7IH0gY2F0Y2goZSkgeyBzZXRUaW1lb3V0KHBvbGwsIDUwKTsgcmV0dXJuOyB9XG5cdFx0aW5pdCgncG9sbCcpO1xuXHR9O1xuIFxuXHRpZiAoZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcblx0XHRmbi5jYWxsKHdpbiwgJ2xhenknKTtcblx0fSBlbHNlIHtcblx0XHRpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0ICYmIHJvb3QuZG9TY3JvbGwpIHtcblx0XHRcdHRyeSB7IHRvcCA9ICF3aW4uZnJhbWVFbGVtZW50OyB9IGNhdGNoKGUpIHsgfVxuXHRcdFx0aWYgKHRvcCkge1xuXHRcdFx0XHRwb2xsKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGRvY1thZGRdKHByZSArICdET01Db250ZW50TG9hZGVkJywgaW5pdCwgZmFsc2UpO1xuXHRcdGRvY1thZGRdKHByZSArICdyZWFkeXN0YXRlY2hhbmdlJywgaW5pdCwgZmFsc2UpO1xuXHRcdHdpblthZGRdKHByZSArICdsb2FkJywgaW5pdCwgZmFsc2UpO1xuXHR9XG4gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGVudExvYWRlZDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b0h5cGhlbkRlbGltaXRlZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3RvSHlwaGVuRGVsaW1pdGVkJyk7XG5cbmZ1bmN0aW9uIGFkZFByZWZpeFRvQ2xhc3NOYW1lIChwcmVmaXgsIGNsYXNzTmFtZSkge1xuXHRyZXR1cm4gcHJlZml4ICsgJy0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoY2xhc3NOYW1lKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nIChwcmVmaXgsIGNsYXNzU3RyaW5nKSB7XG5cdHJldHVybiBjbGFzc1N0cmluZy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG5cdFx0cmV0dXJuIGFkZFByZWZpeFRvQ2xhc3NOYW1lKHByZWZpeCwgY2xhc3NOYW1lKTtcblx0fSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvTm9kZSAobm9kZSwgZGlzcGxheU5hbWUsIF9pc0NoaWxkKSB7XHRcdFxuXHRpZiAoIW5vZGUgfHwgIW5vZGUucHJvcHMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgcHJvcHMgPSBub2RlLnByb3BzLFxuXHRcdHByZWZpeCA9ICdyZWFjdC0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoZGlzcGxheU5hbWUpO1xuXG5cdGlmIChwcm9wcy5jbGFzcykge1xuXHRcdC8vIHByZWNvbXB1dGUgY2xhc3MgbmFtZXNcblx0XHRwcm9wcy5jbGFzcyA9IHByb3BzLmNsYXNzLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRcdC8vIHJlcGxhY2Ugc3RhdGUgc2hvcnRoYW5kXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxcOlxcOlxcOi8sICdzdGF0ZS0nKTtcblx0XHRcdHJldHVybiBjbGFzc05hbWU7XG5cdFx0fSkuam9pbignICcpO1xuXHR9XG5cblx0Ly8gbW9kaWZ5IGNsYXNzIHN0cmluZ3Ncblx0aWYgKHByb3BzLmNsYXNzICYmICFfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzID0gWydyZWFjdC12aWV3JywgcHJlZml4LCBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzcyldLmpvaW4oJyAnKTtcblx0fSBlbHNlIGlmIChwcm9wcy5jbGFzcyAmJiBfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzID0gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3MpO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzcyA9ICdyZWFjdC12aWV3ICcgKyBwcmVmaXg7XG5cdH1cblxuXHQvLyBhZGQgdG8gY2xhc3NOYW1lXG5cdGlmIChwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3MpIHtcblx0XHRwcm9wcy5jbGFzc05hbWUgKz0gJyAnICsgcHJvcHMuY2xhc3M7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzTmFtZSAmJiBwcm9wcy5jbGFzcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSA9IHByb3BzLmNsYXNzO1xuXHR9XG5cdGRlbGV0ZSBwcm9wcy5jbGFzcztcblxuXHRpZiAodHlwZW9mIHByb3BzLmNoaWxkcmVuID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRyYXZlcnNlIGNoaWxkcmVuXG5cdGlmIChBcnJheS5pc0FycmF5KHByb3BzLmNoaWxkcmVuKSkge1xuXHRcdHByb3BzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0XHR9KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgcHJvcHMuY2hpbGRyZW4gPT09ICdvYmplY3QnKSB7XG5cdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUocHJvcHMuY2hpbGRyZW4sIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0fSBlbHNlIGlmIChwcm9wcy5jaGlsZHJlbiAmJiBwcm9wcy5jaGlsZHJlbi5fc3RvcmUpIHtcblx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShwcm9wcy5jaGlsZHJlbiwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHR9XG59XG5cbmV4cG9ydHMuYWRkQ2xhc3NQcmVmaXhUb05vZGUgPSBhZGRDbGFzc1ByZWZpeFRvTm9kZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBYTUxIdHRwRmFjdG9yaWVzID0gW1xuICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO30sXG4gICAgZnVuY3Rpb24gKCkge3JldHVybiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJyk7fSxcbiAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdCgnTXN4bWwzLlhNTEhUVFAnKTt9LFxuICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KCdNaWNyb3NvZnQuWE1MSFRUUCcpO31cbl07XG5cbmZ1bmN0aW9uIGNyZWF0ZVhNTEhUVFBPYmplY3QoKSB7XG4gICAgdmFyIHhtbGh0dHAgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpPTA7aTxYTUxIdHRwRmFjdG9yaWVzLmxlbmd0aDtpKyspIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHhtbGh0dHAgPSBYTUxIdHRwRmFjdG9yaWVzW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4geG1saHR0cDtcbn1cblxuZnVuY3Rpb24gc2VuZFJlcXVlc3QodXJsLGNhbGxiYWNrLHBvc3REYXRhKSB7XG4gICAgdmFyIHJlcSA9IGNyZWF0ZVhNTEhUVFBPYmplY3QoKTtcbiAgICBpZiAoIXJlcSkge1xuICAgIFx0cmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbWV0aG9kID0gKHBvc3REYXRhKSA/ICdQT1NUJyA6ICdHRVQnO1xuICAgIHJlcS5vcGVuKG1ldGhvZCx1cmwsdHJ1ZSk7XG4gICAgaWYgKHBvc3REYXRhKSB7XG4gICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnKTtcbiAgICB9XG4gICAgcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHJlcS5yZWFkeVN0YXRlICE9PSA0KSB7XG4gICAgICAgIFx0cmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXEuc3RhdHVzICE9PSAyMDAgJiYgcmVxLnN0YXR1cyAhPT0gMzA0KSB7XG4vLyAgICAgICAgICBhbGVydCgnSFRUUCBlcnJvciAnICsgcmVxLnN0YXR1cyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2socmVxKTtcbiAgICB9O1xuXG4gICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgXHRyZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHJlcS5zZW5kKHBvc3REYXRhKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZW5kUmVxdWVzdDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTdHlsZSA9IHJlcXVpcmUoJy4uL3N0eWxlJyk7XG5cbnZhciBlbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG5cdHJlYWR5ID0gZmFsc2UsXG5cdHdyaXRlVGltZW91dCA9IG51bGwsXG5cdGZpcnN0UnVuID0gdHJ1ZSxcblx0c3R5bGVzID0gW10sXG5cdHdyaXRlUXVldWUgPSBbXSxcblx0c3R5bGVJZGVuZmllcnMgPSBbXTtcblxuZnVuY3Rpb24gZ2V0U3R5bGVzaGVldE9iamVjdEZvckluc3RhbmNlICgpIHtcblx0dmFyIHN0eWxlc2hlZXQgPSBmYWxzZTtcblxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHdpbmRvdy5kb2N1bWVudC5zdHlsZVNoZWV0cy5sZW5ndGg7IGkrKykge1xuXHRcdGlmICgod2luZG93LmRvY3VtZW50LnN0eWxlU2hlZXRzW2ldLm93bmVyTm9kZSB8fCB3aW5kb3cuZG9jdW1lbnQuc3R5bGVTaGVldHNbaV0ub3duaW5nRWxlbWVudCkgPT09IGVsZW1lbnQpXHR7XG5cdFx0XHRzdHlsZXNoZWV0ID0gd2luZG93LmRvY3VtZW50LnN0eWxlU2hlZXRzW2ldO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHN0eWxlc2hlZXQ7XG59XG5cbmZ1bmN0aW9uIGNoZWNrSWZTdHlsZXNoZWV0SXNSZWFkeSAoY2FsbGJhY2spIHtcblx0dmFyIHN0eWxlID0gZ2V0U3R5bGVzaGVldE9iamVjdEZvckluc3RhbmNlKCk7XG5cblx0Ly8gY2hlY2sgaWYgdGhlIHN0eWxlc2hlZXQgaXMgcHJvY2Vzc2VkIGFuZCByZWFkeVxuXHR0cnkge1xuXHRcdGlmIChzdHlsZSAmJiBzdHlsZS5ydWxlcyAmJiBzdHlsZS5ydWxlcy5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmVhZHkgPSB0cnVlO1xuXHRcdH0gZWxzZSBpZiAoc3R5bGUgJiYgc3R5bGUuY3NzUnVsZXMgJiYgc3R5bGUucnVsZXMubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJlYWR5ID0gdHJ1ZTtcblx0XHR9XG5cdH0gY2F0Y2ggKGUpIHt9XG5cblx0Ly8gd3JpdGUgaHRtbCBpZiB3ZSBhcmUgcmVhbGx5IHJlYWR5XG5cdGlmIChyZWFkeSkge1xuXHRcdGlmIChjYWxsYmFjaykge1xuXHRcdFx0d2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblxuXHR3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0Y2hlY2tJZlN0eWxlc2hlZXRJc1JlYWR5KGNhbGxiYWNrKTtcblx0fSwgMCk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlUnVsZXNGb3JTdHlsZXMgKHN0eWxlcykge1xuXHR2YXIgc3R5bGVzaGVldFRleHQgPSAnJztcblxuXHRmb3IgKHZhciBzdHlsZSBpbiBzdHlsZXMpIHtcblx0XHRzdHlsZXNoZWV0VGV4dCArPSAnXFxuLyogU3R5bGVzIGZvciAnICsgc3R5bGVzW3N0eWxlXS5kaXNwbGF5TmFtZSArICcgY29tcG9uZW50ICovXFxuJztcblx0XHRzdHlsZXNoZWV0VGV4dCArPSBzdHlsZXNbc3R5bGVdLnRvU3RyaW5nKCk7XG5cdH1cblx0XG5cdGVsZW1lbnQuaW5uZXJIVE1MICs9IHN0eWxlc2hlZXRUZXh0O1xufVxuXG5mdW5jdGlvbiBhZGRTdHlsZSAoc3R5bGUpIHtcblx0aWYgKHN0eWxlSWRlbmZpZXJzLmluZGV4T2Yoc3R5bGUuZGlzcGxheU5hbWUpID49IDApIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzdHlsZXMucHVzaChzdHlsZSk7XG5cdHdyaXRlUXVldWUucHVzaChzdHlsZSk7XG5cdHN0eWxlSWRlbmZpZXJzLnB1c2goc3R5bGUuZGlzcGxheU5hbWUpO1xufVxuXG5mdW5jdGlvbiB3cml0ZVN0eWxlcyAoKSB7XG5cdGlmIChmaXJzdFJ1biAmJiByZWFkeSkge1xuXHRcdHJldHVybiB3cml0ZVJ1bGVzRm9yU3R5bGVzKHdyaXRlUXVldWUuc3BsaWNlKDApKTtcblx0fVxuXG5cdGNsZWFyVGltZW91dCh3cml0ZVRpbWVvdXQpO1xuXG5cdHdyaXRlVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdHdyaXRlUnVsZXNGb3JTdHlsZXMod3JpdGVRdWV1ZS5zcGxpY2UoMCkpO1xuXHR9LCAwKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R5bGUgKGRpc3BsYXlOYW1lLCBzdHlsZSkge1xuXHRhZGRTdHlsZShuZXcgU3R5bGUoc3R5bGUsIGRpc3BsYXlOYW1lKSk7XG5cdHdyaXRlU3R5bGVzKCk7XG59XG5cbi8vIGluaXRpYWxpemF0aW9uXG4oZnVuY3Rpb24gKCkge1xuXHQvLyBhcHBlbmQgb3VyIHN0eWxlc2hlZXQgdG8gdGhlIGhlYWRcblx0d2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG5cblx0Ly8gdHJhY2sgdGhlIGZpcnN0IGV2ZW50IGxvb3Bcblx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0Zmlyc3RSdW4gPSBmYWxzZTtcblx0fSwgMCk7XG5cblx0Ly8gY2hlY2sgdGhlIERPTSBmb3IgdGhlIHN0eWxlc2hlZXRcblx0Y2hlY2tJZlN0eWxlc2hlZXRJc1JlYWR5KGZ1bmN0aW9uICgpIHtcblx0XHR3cml0ZVN0eWxlcygpO1xuXHR9KTtcbn0pKCk7XG5cbmV4cG9ydHMuY3JlYXRlU3R5bGUgPSBjcmVhdGVTdHlsZTtcbmV4cG9ydHMuYWRkU3R5bGUgPSBhZGRTdHlsZTtcbmV4cG9ydHMud3JpdGVTdHlsZXMgPSB3cml0ZVN0eWxlczsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHdpbmRvdy5SZWFjdCxcblx0U3R5bGUgPSByZXF1aXJlKCcuLi9zdHlsZScpLFxuXHRTdHlsZVNoZWV0ID0gcmVxdWlyZSgnLi9zdHlsZXNoZWV0JyksXG5cdERPTSA9IHJlcXVpcmUoJy4vZG9tJyksXG5cdFByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9wcm9wZXJ0aWVzJyksXG5cdFBhcnNlciA9IHJlcXVpcmUoJy4uL3BhcnNlcicpLFxuXHRjb250ZW50TG9hZGVkID0gcmVxdWlyZSgnLi9jb250ZW50TG9hZGVkJyksXG5cdHNlbmRSZXF1ZXN0ID0gcmVxdWlyZSgnLi9zZW5kUmVxdWVzdCcpO1xuXG4vLyBpbml0aWFsaXplcyBSZWFjdFN0eWxlLCBtYWlubHkgdXNlZCBmb3IgYWRkaW5nIG1peGluc1xuaWYgKHR5cGVvZiB3aW5kb3cuUkNTUHJvcGVydGllc0luaXQgIT09ICd1bmRlZmluZWQnKSB7XG5cdHdpbmRvdy5SQ1NQcm9wZXJ0aWVzSW5pdChQcm9wZXJ0aWVzKTtcbn1cblxuaWYgKHR5cGVvZiBSZWFjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0UmVhY3QuY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKGNyZWF0ZUNsYXNzKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChzcGVjKSB7XG5cdFx0XHRpZiAoc3BlYy5zdHlsZSkge1xuXHRcdFx0XHRTdHlsZVNoZWV0LmFkZFN0eWxlKG5ldyBTdHlsZShzcGVjLmRpc3BsYXlOYW1lLCBzcGVjLnN0eWxlKSk7XG5cdFx0XHRcdFN0eWxlU2hlZXQud3JpdGVTdHlsZXMoKTtcblxuXHRcdFx0XHRkZWxldGUgc3BlYy5zdHlsZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJlbmRlciA9IHNwZWMucmVuZGVyO1xuXHRcdFx0c3BlYy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBub2RlID0gcmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdERPTS5hZGRDbGFzc1ByZWZpeFRvTm9kZShub2RlLCBzcGVjLmRpc3BsYXlOYW1lKTtcblx0XHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gY3JlYXRlQ2xhc3Moc3BlYyk7XG5cdFx0fTtcblx0fSkoUmVhY3QuY3JlYXRlQ2xhc3MpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzUkNTU291cmNlIChzb3VyY2UsIG5hbWUpIHtcblx0dmFyIGNzcyA9ICcnO1xuXHR2YXIgcmNzID0gUGFyc2VyLnBhcnNlUkNTKHNvdXJjZSk7XG5cblx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gcmNzKSB7XG5cdFx0aWYgKHNlbGVjdG9yLm1hdGNoKC9cXEBjb21wb25lbnQvKSkge1xuXHRcdFx0dmFyIGNvbXBvbmVudE5hbWUgPSBzZWxlY3Rvci5tYXRjaCgvQGNvbXBvbmVudCAoLispLylbMV07XG5cdFx0XHR2YXIgc3R5bGUgPSBuZXcgU3R5bGUoY29tcG9uZW50TmFtZSwgcmNzW3NlbGVjdG9yXSk7XG5cdFx0XHRjc3MgKz0gJy8qIFN0eWxlIGZvciBjb21wb25lbnQgJyArIGNvbXBvbmVudE5hbWUgKyAnICovXFxuJztcblx0XHRcdGNzcyArPSBzdHlsZS50b1N0cmluZygpICsgJ1xcblxcbic7XG5cdFx0XHRkZWxldGUgcmNzW3NlbGVjdG9yXTtcblx0XHR9XG5cdH1cblxuXHRpZiAobmFtZSkge1xuXHRcdGNzcyArPSBuZXcgU3R5bGUobmFtZSwgcmNzKTtcblx0fVxuXG5cdHJldHVybiBjc3MudHJpbSgpO1xufVxuXG4vLyBwcm9jZXNzIGh0bWxcbmNvbnRlbnRMb2FkZWQod2luZG93LCBmdW5jdGlvbiAoKSB7XG5cdC8vIHJlcGxhY2UgcmNzIHN0eWxlIHRhZ3Ncblx0dmFyIHJjc1N0eWxlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3N0eWxlW3R5cGU9XCJ0ZXh0L3Jjc1wiXScpKTtcblx0cmNzU3R5bGVzLmZvckVhY2goZnVuY3Rpb24gKHN0eWxlKSB7XG5cdFx0dmFyIG5hbWUgPSBzdHlsZS5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRlbGVtZW50LmlubmVySFRNTCA9IHByb2Nlc3NSQ1NTb3VyY2Uoc3R5bGUuaW5uZXJIVE1MLCBuYW1lKTtcblx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuXHRcdGlmIChuYW1lKSB7XG5cdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSgnY29tcG9uZW50JywgbmFtZSk7XG5cdFx0fVxuXG5cdFx0c3R5bGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxlbWVudCwgc3R5bGUpO1xuXHR9KTtcblxuXHQvLyByZXBsYWNlIHJjcyBsaW5rIHRhZ3Ncblx0dmFyIHJjc0xpbmtzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGlua1tyZWw9XCJzdHlsZXNoZWV0L3Jjc1wiXVt0eXBlPVwidGV4dC9jc3NcIl0nKSk7XG5cdHJjc0xpbmtzLmZvckVhY2goZnVuY3Rpb24gKGxpbmspIHtcblx0XHR2YXIgbmFtZSA9IGxpbmsuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQnKTtcblxuXHRcdHNlbmRSZXF1ZXN0KGxpbmsuZ2V0QXR0cmlidXRlKCdocmVmJyksIGZ1bmN0aW9uIChyZXF1ZXN0KSB7XG5cdFx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0XHRlbGVtZW50LmlubmVySFRNTCA9IHByb2Nlc3NSQ1NTb3VyY2UocmVxdWVzdC5yZXNwb25zZVRleHQsIG5hbWUpO1xuXHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcblx0XHRcdGlmIChuYW1lKSB7XG5cdFx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjb21wb25lbnQnLCBuYW1lKTtcblx0XHRcdH1cblx0XHRcdGxpbmsucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxlbWVudCwgbGluayk7XG5cdFx0fSk7XG5cdH0pO1xufSk7XG5cbmV4cG9ydHMuU3R5bGUgPSBTdHlsZTtcbmV4cG9ydHMuU3R5bGVTaGVldCA9IFN0eWxlU2hlZXQ7XG5leHBvcnRzLlByb3BlcnRpZXMgPSBQcm9wZXJ0aWVzO1xuZXhwb3J0cy5QYXJzZXIgPSBQYXJzZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFBhcnNlcyBhIFJDUyBzdHJpbmcgdG8gYSBKU09OIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gcGFyc2VSQ1MgKHJjcykge1xuXHR2YXIgb3JpZ2luYWwgPSByY3M7XG5cblx0cmNzID0gJ3tcXG4nICsgcmNzICsgJ1xcbn0nO1xuXHRcblx0cmNzID0gcmNzLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKTtcblxuXHQvLyBzdHJpcCBjb21tZW50c1xuXHRyY3MgPSByY3MucmVwbGFjZSgvXltcXHRdK1xcL1xcLy4rJC9naW0sICcnKTtcblx0cmNzID0gcmNzLnJlcGxhY2UoL1xcL1xcKltcXFNcXHNdKj9cXCpcXC8vZ2ltLCAnJyk7XG5cblx0Ly8gYWRkIHF1b3Rlc1xuXHRyY3MgPSByY3MucmVwbGFjZSgvKFtcXEBhLXowLTlcXC1cXC5cXDpcXCpdW2EtejAtOVxcLVxcLlxcOlxcc1xcKl0qKSg/OlxccyspPzpcXHMqKC4rKTsvZ2ksICdcIiQxXCI6IFwiJDJcIjsnKTtcblx0cmNzID0gcmNzLnJlcGxhY2UoLyhbXFxAYS16MC05XFwtXFwuXFw6XFwqXVthLXowLTlcXCVcXC1cXC5cXDpcXHNcXCpcXFtcXF1cXD1cXCdcXFwiXFwsXSo/KSg/OlxccyopKFtcXHtcXFtdKS9naSwgJ1wiJDFcIjogJDInKTtcblxuXHQvLyByZW1vdmUgdW5uZXNzYXJ5IHdoaXRlIHNwYWNlc1xuXHQvL3JjcyA9IHJjcy5yZXBsYWNlKC9cXG58XFx0L2csICcnKTtcblxuXHQvLyBkZWZhdWx0IG51bWJlciB2YWx1ZXMgdG8gcGl4ZWxzXG5cdC8vcmNzID0gcmNzLnJlcGxhY2UoLyhcXGQrKSg/IVxcZCkoPyElfHB4KS9naSwgJyQxcHgnKTtcblxuXHQvLyBhZGQgY29tbWFzXG5cdHJjcyA9IHJjcy5yZXBsYWNlKC9cXH0oPyFcXHMqW1xcfVxcXV18JCkvZywgJ30sJyk7XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC87KD8hXFxzKltcXH1cXF1dKS9nLCAnLCcpO1xuXHRyY3MgPSByY3MucmVwbGFjZSgvOyg/PVxccypbXFx9XFxdXSkvZywgJycpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocmNzKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0lzc3VlIFBhcnNpbmcgUkNTOiBcXG5vcmlnaW5hbDpcXG4nICsgb3JpZ2luYWwgKyAnXFxuXFxubWFsZm9ybWVkOlxcbicgKyByY3MpO1xuXHR9XG59XG5cbmV4cG9ydHMucGFyc2VSQ1MgPSBwYXJzZVJDUzsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFuYWdlcyBjc3MgcHJvcGVydHkvdmFsdWUgdHJhbnNmb3Jtcy5cbiAqL1xudmFyIHByb3BlcnR5VHJhbnNmb3JtcyA9IFtdLFxuXHRwcmVmaXhlZFByb3BlcnRpZXMgPSBbXSxcblx0YmFzZVVybCA9ICcnO1xuXG5mdW5jdGlvbiByZWdpc3RlclByb3BlcnR5IChwcm9wZXJ0eSwgdHJhbnNmb3JtKSB7XG5cdHByb3BlcnR5VHJhbnNmb3Jtcy5wdXNoKHtwcm9wZXJ0eTogcHJvcGVydHksIG1ldGhvZDogdHJhbnNmb3JtfSk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXMgKHByb3BlcnRpZXMpIHtcblx0cHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdHByZWZpeGVkUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0cnVlO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRUcmFuc2Zvcm0gKG5hbWUsIHZhbHVlKSB7XG5cdHJldHVybiBbXG5cdFx0e25hbWU6ICctd2Via2l0LScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW1zLScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW1vei0nICsgbmFtZSwgdmFsdWU6IHZhbHVlfSxcblx0XHR7bmFtZTogJy1vLScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9XG5cdF07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybSAobmFtZSwgdmFsdWUpIHtcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRwcm9wZXJ0eVRyYW5zZm9ybXMuZm9yRWFjaChmdW5jdGlvbiAodHJhbnNmb3JtKSB7XG5cdFx0aWYgKHRyYW5zZm9ybS5wcm9wZXJ0eSAhPT0gbmFtZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB0cmFuc2Zvcm1zID0gdHJhbnNmb3JtLm1ldGhvZChuYW1lLCB2YWx1ZSk7XG5cdFx0XG5cdFx0aWYgKHRyYW5zZm9ybXMpIHtcblx0XHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh0cmFuc2Zvcm1zKTtcblx0XHR9XG5cdH0pO1xuXG5cdGlmICghcmVzdWx0cy5sZW5ndGgpIHtcblx0XHRpZiAocHJlZml4ZWRQcm9wZXJ0aWVzW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gc3RhbmRhcmRUcmFuc2Zvcm0obmFtZSwgdmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufVxuXG4vLyByZWdpc3RlciBkZWZhdWx0c1xucmVnaXN0ZXJQcm9wZXJ0eSgnYmFja2dyb3VuZCcsIGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuXHR2YXIgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoKC91cmxcXChbJ1wiXSooLis/KVsnXCJdKlxcKS8pO1xuXHRcblx0aWYgKCFtYXRjaGVzIHx8ICFiYXNlVXJsKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIHVybCA9IG1hdGNoZXNbMV0sXG5cdFx0bmV3VXJsID0gYmFzZVVybCArIHVybDtcblxuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IG5hbWUsXG5cdFx0dmFsdWU6IHZhbHVlLnJlcGxhY2UodXJsLCBuZXdVcmwpXG5cdH07XG59KTtcblxuZXhwb3J0cy5zZXRCYXNlVXJsID0gIGZ1bmN0aW9uICh1cmwpIHtcblx0YmFzZVVybCA9IHVybDtcbn07XG5leHBvcnRzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbmV4cG9ydHMucmVnaXN0ZXJQcm9wZXJ0eSA9IHJlZ2lzdGVyUHJvcGVydHk7XG5leHBvcnRzLnJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXMgPSByZWdpc3RlclN0YW5kYXJkUHJlZml4ZWRQcm9wZXJ0aWVzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL3Byb3BlcnRpZXMnKSxcblx0UGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKSxcblx0dG9IeXBoZW5EZWxpbWl0ZWQgPSByZXF1aXJlKCcuL3V0aWxzL3RvSHlwaGVuRGVsaW1pdGVkJyk7XG5cbi8qKlxuICogTWFuYWdlcyBjc3MgcHJvcGVydHkvdmFsdWUgdHJhbnNmb3Jtcy5cbiAqL1xuZnVuY3Rpb24gU3R5bGUgKGRpc3BsYXlOYW1lLCBzdHlsZSwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XG5cdHRoaXMuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZTtcblxuXHR0aGlzLl9wcmVmaXggPSAncmVhY3QtJyArIHRvSHlwaGVuRGVsaW1pdGVkKGRpc3BsYXlOYW1lKSArICctJztcblx0XG5cdHRoaXMuX3NlbGVjdG9yUHJlZml4ID0gJy5yZWFjdC12aWV3LicgKyB0aGlzLl9wcmVmaXguc3Vic3RyKDAsIHRoaXMuX3ByZWZpeC5sZW5ndGgtMSkgKyAnICc7XG5cblx0dGhpcy5ydWxlcyA9IHt9O1xuXHR0aGlzLmFuaW1hdGlvbnMgPSB7fTtcblx0dGhpcy5pbnN0YW5jZVJ1bGVzID0ge307XG5cdHRoaXMubWVkaWFRdWVyaWVzID0ge307XG5cblx0dGhpcy5wYXJzZVN0eWxlKHN0eWxlKTtcbn1cblxuU3R5bGUucHJvdG90eXBlID0ge1xuXHRJTlRfUFJPUEVSVElFUzogWyd6LWluZGV4JywgJ29wYWNpdHknXSxcblxuXHRwYXJzZVN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcblx0XHR2YXIgcnVsZXM7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZiBzdHlsZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJ1bGVzID0gc3R5bGU7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0cnkge1xuXG5cdFx0XHRcdHJ1bGVzID0gUGFyc2VyLnBhcnNlUkNTKHN0eWxlKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUGFyc2luZyBjb21wb25lbnQgJyArIHRoaXMuZGlzcGxheU5hbWUgKyAnXFxuJyArIGVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9hZGRSdWxlcyhydWxlcyk7XG5cdH0sXG5cblx0X2FkZFJ1bGVzOiBmdW5jdGlvbiAocnVsZXMpIHtcblx0XHQvLyB0cmF2ZXJzZSBhcmd1bWVudHMgYW5kIHJ1biBhZGRSdWxlIG9uIGVhY2ggaXRlbVxuXHRcdGZvciAodmFyIHJ1bGUgaW4gcnVsZXMpIHtcblx0XHRcdHZhciBydWxlc0J1ZmZlciA9IHtydWxlczoge30sIGFuaW1hdGlvbnM6IHt9fTtcblxuXHRcdFx0aWYgKHJ1bGUubWF0Y2goL15AbWVkaWEvKSkge1x0XG5cdFx0XHRcdGZvciAodmFyIG1lZGlhUnVsZSBpbiBydWxlc1tydWxlXSkge1xuXHRcdFx0XHRcdHRoaXMuX2FkZFJ1bGUobWVkaWFSdWxlLCBydWxlc1tydWxlXVttZWRpYVJ1bGVdLCBydWxlc0J1ZmZlcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLm1lZGlhUXVlcmllc1tydWxlXSA9IHJ1bGVzQnVmZmVyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fYWRkUnVsZShydWxlLCBydWxlc1tydWxlXSwgcnVsZXNCdWZmZXIpO1xuXG5cdFx0XHRcdHZhciBidWZmZXJSdWxlc0tleXMgPSBPYmplY3Qua2V5cyhydWxlc0J1ZmZlci5ydWxlcyk7XG5cdFx0XHRcdGJ1ZmZlclJ1bGVzS2V5cy5zb3J0KCk7XG5cdFx0XHRcdGJ1ZmZlclJ1bGVzS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHR0aGlzLnJ1bGVzW2tleV0gPSBydWxlc0J1ZmZlci5ydWxlc1trZXldO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0Zm9yICh2YXIgYW5pbWF0aW9uIGluIHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnMpIHtcblx0XHRcdFx0XHR0aGlzLmFuaW1hdGlvbnNbYW5pbWF0aW9uXSA9IHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfYWRkUnVsZTogZnVuY3Rpb24gKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlciwgX3JlY3Vyc2l2ZSkge1xuXHRcdGlmIChzZWxlY3Rvci5tYXRjaCgvXkBrZXlmcmFtZXMvKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FkZEtleWZyYW1lQW5pbWF0aW9uKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlcik7XG5cdFx0fVxuXG5cdFx0aWYgKHNlbGVjdG9yLnN1YnN0cigwLCAzKSA9PT0gJzo6OicpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hZGRSdWxlKHRoaXMuX3Jlc29sdmVTdGF0ZVdpdGhTZWxlY3RvcihzZWxlY3RvciksIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHR9IGVsc2UgaWYgKHNlbGVjdG9yLm1hdGNoKC9eXFw6XFw6P1thLXpdLykpIHtcblx0XHRcdHNlbGVjdG9yID0gdGhpcy5fc2VsZWN0b3JQcmVmaXguc2xpY2UoMCwgLTEpICsgc2VsZWN0b3I7XG5cblx0XHRcdHJldHVybiB0aGlzLl9hZGRSdWxlKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlciwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0Ly8gcHJvcGVybHkgcHJvY2VzcyB0aGUgc2VsZWN0b3Jcblx0XHR2YXIgc2VsZWN0b3JzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcblx0XHRpZiAoc2VsZWN0b3JzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHNlbGVjdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFJ1bGUoaXRlbS50cmltKCksIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RvciA9IHRoaXMuX3Jlc29sdmVTZWxlY3RvcihzZWxlY3Rvcik7XG5cdFx0fVxuXG5cdFx0Ly8gdHJhY2sgYWx0ZXJlZCBwcm9wZXJ0aWVzXG5cdFx0dmFyIF9wcm9wZXJ0aWVzID0gcnVsZXNCdWZmZXIucnVsZXNbc2VsZWN0b3JdIHx8IFtdO1xuXG5cdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0aWYgKHR5cGVvZiBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9PT0gJ29iamVjdCcpIHtcblx0XHQgXHRcdGlmIChwcm9wZXJ0eS5zdWJzdHIoMCwgMykgPT09ICc6OjonKSB7XG5cdFx0XHRcdFx0dGhpcy5fYWRkUnVsZSh0aGlzLl9yZXNvbHZlU3RhdGVXaXRoU2VsZWN0b3IocHJvcGVydHksIHNlbGVjdG9yKSwgcHJvcGVydGllc1twcm9wZXJ0eV0sIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHQgXHRcdH0gZWxzZSB7XG5cdFx0IFx0XHRcdHRoaXMuX2FkZFJ1bGUodGhpcy5fYWRkUGFyZW50U2VsZWN0b3JUb1NlbGVjdG9yKHNlbGVjdG9yLCBwcm9wZXJ0eSksIHByb3BlcnRpZXNbcHJvcGVydHldLCBydWxlc0J1ZmZlciwgdHJ1ZSk7XG5cdFx0IFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgcmVzb2x2ZWQgPSBQcm9wZXJ0aWVzLnRyYW5zZm9ybShwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHRyZXNvbHZlZC5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRfcHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFkZCB0byBydWxlc1xuXHRcdHJ1bGVzQnVmZmVyLnJ1bGVzW3NlbGVjdG9yXSA9IF9wcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHJ1bGVzQnVmZmVyO1xuXHR9LFxuXG5cdF9yZXNvbHZlU2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdGlmICh0aGlzLl9wcmVmaXggIT09ICdyZWFjdC0nKSB7XG5cdFx0XHRpZiAoLyhefFxcc3wsKXZpZXcvLnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvKF58XFxzfCwpdmlldy9nLCAnJDEucmVhY3Qtdmlldy4nICsgdGhpcy5fcHJlZml4LnN1YnN0cigwLCB0aGlzLl9wcmVmaXgubGVuZ3RoLTEpKTtcblx0XHRcdH0gZWxzZSBpZiAoIXNlbGVjdG9yLm1hdGNoKC8ucmVhY3QtLykgJiYgc2VsZWN0b3IubWF0Y2goL1xcLnxcXCMvKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHRoaXMuX3NlbGVjdG9yUHJlZml4ICsgc2VsZWN0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhbI1xcXFwuXSkoPyFyZWFjdC0pKFthLXowLTlcXFxcLV9dKiknLCAnaWcnKSwgJyQxJyArIHRoaXMuX3ByZWZpeCArICckMicpO1xuXG5cdFx0cmV0dXJuIHNlbGVjdG9yLnRyaW0oKTtcblx0fSxcblxuXHRfcmVzb2x2ZVN0YXRlV2l0aFNlbGVjdG9yOiBmdW5jdGlvbiAoc3RhdGUsIHNlbGVjdG9yKSB7XG5cdFx0c3RhdGUgPSBzdGF0ZS5zdWJzdHIoMyk7XG5cdFx0c2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnJztcblxuXHRcdHZhciB2aWV3U2VsZWN0b3IgPSAnLnJlYWN0LXZpZXcuJyArIHRoaXMuX3ByZWZpeC5zdWJzdHIoMCwgdGhpcy5fcHJlZml4Lmxlbmd0aC0xKTtcblxuXHRcdGlmICghc3RhdGUubWF0Y2goL15yZWFjdC8pKSB7XG5cdFx0XHQvLyBwcmVwZW5kIHdpdGggc3RhdGVcblx0XHRcdHN0YXRlID0gc3RhdGUuc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKHN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiAnc3RhdGUtJyArIHN0YXRlO1xuXHRcdFx0fSkuam9pbignLicpO1xuXG5cdFx0XHRpZiAoIXNlbGVjdG9yKSB7XG5cdFx0XHRcdHNlbGVjdG9yICs9IHRoaXMuX3Jlc29sdmVTZWxlY3Rvcih0aGlzLl9zZWxlY3RvclByZWZpeC5zbGljZSgwLCAtMSkgKyAnLicgKyB0aGlzLl9wcmVmaXggKyBzdGF0ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2Uodmlld1NlbGVjdG9yLCB2aWV3U2VsZWN0b3IgKyAnLicgKyB0aGlzLl9wcmVmaXggKyBzdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghc2VsZWN0b3IpIHtcblx0XHRcdFx0c2VsZWN0b3IgPSB0aGlzLl9yZXNvbHZlU2VsZWN0b3IoJy4nICsgc3RhdGUpICsgJyAnICsgdmlld1NlbGVjdG9yO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZWN0b3IgPSB0aGlzLl9yZXNvbHZlU2VsZWN0b3IoJy4nICsgc3RhdGUpICsgJyAnICsgc2VsZWN0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlbGVjdG9yO1xuXHR9LFxuXG5cdF9hZGRQYXJlbnRTZWxlY3RvclRvU2VsZWN0b3I6IGZ1bmN0aW9uIChwYXJlbnQsIHNlbGVjdG9yKSB7XG5cdFx0cmV0dXJuIHNlbGVjdG9yLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRyZXR1cm4gcGFyZW50ICsgKGl0ZW0uc3Vic3RyKDAsIDEpID09PSAnOicgPyAnJyA6ICcgJykgKyBpdGVtO1xuXHRcdH0pLmpvaW4oJywnKTtcblx0fSxcblxuXHRfYWRkS2V5ZnJhbWVBbmltYXRpb246IGZ1bmN0aW9uIChzZWxlY3RvciwgbGlzdCwgcnVsZXNCdWZmZXIpIHtcblx0XHR2YXIgaWRlbnRpZmllciA9IHNlbGVjdG9yLnJlcGxhY2UoJ0BrZXlmcmFtZXMgJywgJycpLFxuXHRcdFx0a2V5ZnJhbWVzTmFtZSA9ICdrZXlmcmFtZXMnLFxuXHRcdFx0dmFsdWUgPSAnJztcblxuXHRcdGZvciAodmFyIHRpbWUgaW4gbGlzdCkge1xuXHRcdFx0dmFsdWUgKz0gdGltZSArICcgeyc7XG5cblx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGxpc3RbdGltZV0pIHtcblx0XHRcdFx0dmFyIHJlc29sdmVkID0gUHJvcGVydGllcy50cmFuc2Zvcm0ocHJvcGVydHksIGxpc3RbdGltZV1bcHJvcGVydHldKTtcblx0XHRcdFx0cmVzb2x2ZWQuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRcdFx0XHR2YWx1ZSArPSBwcm9wZXJ0eS5uYW1lICsgJzogJyArIHByb3BlcnR5LnZhbHVlICsgJzsnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHZhbHVlICs9ICd9Jztcblx0XHR9XG5cblx0XHRydWxlc0J1ZmZlci5hbmltYXRpb25zWydALXdlYmtpdC0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQC1tcy0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQC1tb3otJyArIGtleWZyYW1lc05hbWUgKyAnICcgKyBpZGVudGlmaWVyXSA9IHZhbHVlO1xuXHRcdHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnNbJ0Atby0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQCcgKyBrZXlmcmFtZXNOYW1lICsgJyAnICsgaWRlbnRpZmllcl0gPSB2YWx1ZTtcblx0fSxcblxuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdHlsZXNoZWV0VGV4dCA9ICcnLFxuXHRcdFx0cnVsZVN0cmluZ3MgPSB0aGlzLnJ1bGVzVG9TdHJpbmdzKHRoaXMucnVsZXMpO1xuXG5cdFx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gcnVsZVN0cmluZ3MpIHtcblx0XHRcdHN0eWxlc2hlZXRUZXh0ICs9IHNlbGVjdG9yICsgJyB7JyArIHJ1bGVTdHJpbmdzW3NlbGVjdG9yXSArICd9XFxuJztcblx0XHR9XG5cblx0XHRmb3IgKHZhciBhbmltYXRpb24gaW4gdGhpcy5hbmltYXRpb25zKSB7XG5cdFx0XHRzdHlsZXNoZWV0VGV4dCArPSBhbmltYXRpb24gKyAnIHsnICsgdGhpcy5hbmltYXRpb25zW2FuaW1hdGlvbl0gKyAnfVxcbic7XG5cdFx0fVxuXG5cdFx0c3R5bGVzaGVldFRleHQgKz0gdGhpcy5tZWRpYVF1ZXJpZXNUb1N0cmluZyh0aGlzLm1lZGlhUXVlcmllcyk7XG5cblx0XHRyZXR1cm4gc3R5bGVzaGVldFRleHQudHJpbSgpO1xuXHR9LFxuXG5cdG1lZGlhUXVlcmllc1RvU3RyaW5nOiBmdW5jdGlvbiAocXVlcmllcykge1xuXHRcdHZhciBzdHJpbmcgPSAnJztcblxuXHRcdGZvciAodmFyIHF1ZXJ5IGluIHF1ZXJpZXMpIHtcblx0XHRcdHZhciBhbmltYXRpb25zID0gcXVlcmllc1txdWVyeV0uYW5pbWF0aW9ucyxcblx0XHRcdFx0cnVsZXMgPSBxdWVyaWVzW3F1ZXJ5XS5ydWxlcztcblxuXHRcdFx0dmFyIHF1ZXJ5U3RyaW5nID0gcXVlcnkgKyAnIHtcXG4nLFxuXHRcdFx0XHRtZWRpYVF1ZXJ5UnVsZVN0cmluZ3MgPSB0aGlzLnJ1bGVzVG9TdHJpbmdzKHJ1bGVzKTtcblxuXHRcdFx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gbWVkaWFRdWVyeVJ1bGVTdHJpbmdzKSB7XG5cdFx0XHRcdHF1ZXJ5U3RyaW5nICs9ICdcXHQnICsgc2VsZWN0b3IgKyAnIHsnICsgbWVkaWFRdWVyeVJ1bGVTdHJpbmdzW3NlbGVjdG9yXSArICd9XFxuJztcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgYW5pbWF0aW9uIGluIGFuaW1hdGlvbnMpIHtcblx0XHRcdFx0cXVlcnlTdHJpbmcgKz0gICdcXHQnICsgYW5pbWF0aW9uICsgJyB7JyArIGFuaW1hdGlvbnNbYW5pbWF0aW9uXSArICd9XFxuJztcblx0XHRcdH1cblxuXHRcdFx0cXVlcnlTdHJpbmcgKz0gJ31cXG4nO1xuXG5cdFx0XHRzdHJpbmcgKz0gcXVlcnlTdHJpbmc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0cmluZztcblx0fSxcblxuXG5cdHJ1bGVzVG9TdHJpbmdzOiBmdW5jdGlvbiAocnVsZXMpIHtcblx0XHR2YXIgc3RyaW5ncyA9IHt9O1xuXHRcdGZvciAodmFyIHNlbGVjdG9yIGluIHJ1bGVzKSB7XG5cdFx0XHR2YXIgcHJvcGVydGllc1N0cmluZyA9ICcnLFxuXHRcdFx0XHRydWxlID0gcnVsZXNbc2VsZWN0b3JdO1xuXHRcdFx0XG5cdFx0XHRydWxlLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0XHRcdHByb3BlcnRpZXNTdHJpbmcgKz0gcHJvcGVydHkubmFtZSArICc6JyArIHByb3BlcnR5LnZhbHVlICsgJzsnO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcHJvcGVydGllc1N0cmluZykge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHN0cmluZ3Nbc2VsZWN0b3JdID0gcHJvcGVydGllc1N0cmluZztcblx0XHR9XG5cdFx0cmV0dXJuIHN0cmluZ3M7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3R5bGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBDYW1lbENhc2Ugc3RyaW5nIHRvIGEgaHlwaGVuLWRlbGltaXRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvSHlwaGVuRGVsaW1pdGVkIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW2Etel1bQS1aXSkvZywgZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gZ1swXSArICctJyArIGdbMV07XG4gIH0pLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvSHlwaGVuRGVsaW1pdGVkOyJdfQ==
