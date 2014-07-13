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

	if (props.classes) {
		// precompute class names
		props.classes = props.classes.split(' ').map(function (className) {
			// replace state shorthand
			className = className.replace(/^\:\:\:/, 'state-');
			return className;
		}).join(' ');
	}

	// modify class strings
	if (props.classes && !_isChild) {
		props.classes = ['react-view', prefix, addClassPrefixToClassString(prefix, props.classes)].join(' ');
	} else if (props.classes && _isChild) {
		props.classes = addClassPrefixToClassString(prefix, props.classes);
	} else if (!props.classes && !_isChild) {
		props.classes = 'react-view ' + prefix;
	}

	// add to className
	if (props.className && props.classes) {
		props.className += ' ' + props.classes;
	} else if (!props.className && props.classes) {
		props.className = props.classes;
	}
	delete props.classes;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9saWIvcmNzLXdpdGgtdHJhbnNmb3JtZXIuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvY29udGVudExvYWRlZC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci9kb20uanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvc2VuZFJlcXVlc3QuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvc3R5bGVzaGVldC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci90cmFuc2Zvcm1lci5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcGFyc2VyLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9wcm9wZXJ0aWVzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9zdHlsZS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncmVhY3QtcmNzL2Jyb3dzZXIvdHJhbnNmb3JtZXInKTsiLCIndXNlIHN0cmljdCc7XG5cbi8qIVxuICogY29udGVudExvYWRlZC5qc1xuICpcbiAqIEF1dGhvcjogRGllZ28gUGVyaW5pIChkaWVnby5wZXJpbmkgYXQgZ21haWwuY29tKVxuICogU3VtbWFyeTogY3Jvc3MtYnJvd3NlciB3cmFwcGVyIGZvciBET01Db250ZW50TG9hZGVkXG4gKiBVcGRhdGVkOiAyMDEwMTAyMFxuICogTGljZW5zZTogTUlUXG4gKiBWZXJzaW9uOiAxLjJcbiAqXG4gKiBVUkw6XG4gKiBodHRwOi8vamF2YXNjcmlwdC5ud2JveC5jb20vQ29udGVudExvYWRlZC9cbiAqIGh0dHA6Ly9qYXZhc2NyaXB0Lm53Ym94LmNvbS9Db250ZW50TG9hZGVkL01JVC1MSUNFTlNFXG4gKlxuICovXG4gXG4vLyBAd2luIHdpbmRvdyByZWZlcmVuY2Vcbi8vIEBmbiBmdW5jdGlvbiByZWZlcmVuY2VcbmZ1bmN0aW9uIGNvbnRlbnRMb2FkZWQod2luLCBmbikge1xuIFxuXHR2YXIgZG9uZSA9IGZhbHNlLCB0b3AgPSB0cnVlLFxuIFxuXHRkb2MgPSB3aW4uZG9jdW1lbnQsIHJvb3QgPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuIFxuXHRhZGQgPSBkb2MuYWRkRXZlbnRMaXN0ZW5lciA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdhdHRhY2hFdmVudCcsXG5cdHJlbSA9IGRvYy5hZGRFdmVudExpc3RlbmVyID8gJ3JlbW92ZUV2ZW50TGlzdGVuZXInIDogJ2RldGFjaEV2ZW50Jyxcblx0cHJlID0gZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyAnJyA6ICdvbicsXG4gXG5cdGluaXQgPSBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUudHlwZSA9PT0gJ3JlYWR5c3RhdGVjaGFuZ2UnICYmIGRvYy5yZWFkeVN0YXRlICE9PSAnY29tcGxldGUnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdChlLnR5cGUgPT09ICdsb2FkJyA/IHdpbiA6IGRvYylbcmVtXShwcmUgKyBlLnR5cGUsIGluaXQsIGZhbHNlKTtcblx0XHRpZiAoIWRvbmUgJiYgKGRvbmUgPSB0cnVlKSkge1xuXHRcdFx0Zm4uY2FsbCh3aW4sIGUudHlwZSB8fCBlKTtcblx0XHR9XG5cdH0sXG4gXG5cdHBvbGwgPSBmdW5jdGlvbigpIHtcblx0XHR0cnkgeyByb290LmRvU2Nyb2xsKCdsZWZ0Jyk7IH0gY2F0Y2goZSkgeyBzZXRUaW1lb3V0KHBvbGwsIDUwKTsgcmV0dXJuOyB9XG5cdFx0aW5pdCgncG9sbCcpO1xuXHR9O1xuIFxuXHRpZiAoZG9jLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcblx0XHRmbi5jYWxsKHdpbiwgJ2xhenknKTtcblx0fSBlbHNlIHtcblx0XHRpZiAoZG9jLmNyZWF0ZUV2ZW50T2JqZWN0ICYmIHJvb3QuZG9TY3JvbGwpIHtcblx0XHRcdHRyeSB7IHRvcCA9ICF3aW4uZnJhbWVFbGVtZW50OyB9IGNhdGNoKGUpIHsgfVxuXHRcdFx0aWYgKHRvcCkge1xuXHRcdFx0XHRwb2xsKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGRvY1thZGRdKHByZSArICdET01Db250ZW50TG9hZGVkJywgaW5pdCwgZmFsc2UpO1xuXHRcdGRvY1thZGRdKHByZSArICdyZWFkeXN0YXRlY2hhbmdlJywgaW5pdCwgZmFsc2UpO1xuXHRcdHdpblthZGRdKHByZSArICdsb2FkJywgaW5pdCwgZmFsc2UpO1xuXHR9XG4gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29udGVudExvYWRlZDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b0h5cGhlbkRlbGltaXRlZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3RvSHlwaGVuRGVsaW1pdGVkJyk7XG5cbmZ1bmN0aW9uIGFkZFByZWZpeFRvQ2xhc3NOYW1lIChwcmVmaXgsIGNsYXNzTmFtZSkge1xuXHRyZXR1cm4gcHJlZml4ICsgJy0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoY2xhc3NOYW1lKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nIChwcmVmaXgsIGNsYXNzU3RyaW5nKSB7XG5cdHJldHVybiBjbGFzc1N0cmluZy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG5cdFx0cmV0dXJuIGFkZFByZWZpeFRvQ2xhc3NOYW1lKHByZWZpeCwgY2xhc3NOYW1lKTtcblx0fSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvTm9kZSAobm9kZSwgZGlzcGxheU5hbWUsIF9pc0NoaWxkKSB7XHRcdFxuXHRpZiAoIW5vZGUgfHwgIW5vZGUucHJvcHMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgcHJvcHMgPSBub2RlLnByb3BzLFxuXHRcdHByZWZpeCA9ICdyZWFjdC0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoZGlzcGxheU5hbWUpO1xuXG5cdGlmIChwcm9wcy5jbGFzc2VzKSB7XG5cdFx0Ly8gcHJlY29tcHV0ZSBjbGFzcyBuYW1lc1xuXHRcdHByb3BzLmNsYXNzZXMgPSBwcm9wcy5jbGFzc2VzLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRcdC8vIHJlcGxhY2Ugc3RhdGUgc2hvcnRoYW5kXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxcOlxcOlxcOi8sICdzdGF0ZS0nKTtcblx0XHRcdHJldHVybiBjbGFzc05hbWU7XG5cdFx0fSkuam9pbignICcpO1xuXHR9XG5cblx0Ly8gbW9kaWZ5IGNsYXNzIHN0cmluZ3Ncblx0aWYgKHByb3BzLmNsYXNzZXMgJiYgIV9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3NlcyA9IFsncmVhY3QtdmlldycsIHByZWZpeCwgYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3NlcyldLmpvaW4oJyAnKTtcblx0fSBlbHNlIGlmIChwcm9wcy5jbGFzc2VzICYmIF9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3NlcyA9IGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyhwcmVmaXgsIHByb3BzLmNsYXNzZXMpO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzc2VzICYmICFfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzZXMgPSAncmVhY3QtdmlldyAnICsgcHJlZml4O1xuXHR9XG5cblx0Ly8gYWRkIHRvIGNsYXNzTmFtZVxuXHRpZiAocHJvcHMuY2xhc3NOYW1lICYmIHByb3BzLmNsYXNzZXMpIHtcblx0XHRwcm9wcy5jbGFzc05hbWUgKz0gJyAnICsgcHJvcHMuY2xhc3Nlcztcblx0fSBlbHNlIGlmICghcHJvcHMuY2xhc3NOYW1lICYmIHByb3BzLmNsYXNzZXMpIHtcblx0XHRwcm9wcy5jbGFzc05hbWUgPSBwcm9wcy5jbGFzc2VzO1xuXHR9XG5cdGRlbGV0ZSBwcm9wcy5jbGFzc2VzO1xuXG5cdGlmICh0eXBlb2YgcHJvcHMuY2hpbGRyZW4gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gdHJhdmVyc2UgY2hpbGRyZW5cblx0aWYgKEFycmF5LmlzQXJyYXkocHJvcHMuY2hpbGRyZW4pKSB7XG5cdFx0cHJvcHMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUobm9kZSwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBwcm9wcy5jaGlsZHJlbiA9PT0gJ29iamVjdCcpIHtcblx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShwcm9wcy5jaGlsZHJlbiwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHR9IGVsc2UgaWYgKHByb3BzLmNoaWxkcmVuICYmIHByb3BzLmNoaWxkcmVuLl9zdG9yZSkge1xuXHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKHByb3BzLmNoaWxkcmVuLCBkaXNwbGF5TmFtZSwgdHJ1ZSk7XG5cdH1cbn1cblxuZXhwb3J0cy5hZGRDbGFzc1ByZWZpeFRvTm9kZSA9IGFkZENsYXNzUHJlZml4VG9Ob2RlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFhNTEh0dHBGYWN0b3JpZXMgPSBbXG4gICAgZnVuY3Rpb24gKCkge3JldHVybiBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7fSxcbiAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAnKTt9LFxuICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KCdNc3htbDMuWE1MSFRUUCcpO30sXG4gICAgZnVuY3Rpb24gKCkge3JldHVybiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7fVxuXTtcblxuZnVuY3Rpb24gY3JlYXRlWE1MSFRUUE9iamVjdCgpIHtcbiAgICB2YXIgeG1saHR0cCA9IGZhbHNlO1xuICAgIGZvciAodmFyIGk9MDtpPFhNTEh0dHBGYWN0b3JpZXMubGVuZ3RoO2krKykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgeG1saHR0cCA9IFhNTEh0dHBGYWN0b3JpZXNbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiB4bWxodHRwO1xufVxuXG5mdW5jdGlvbiBzZW5kUmVxdWVzdCh1cmwsY2FsbGJhY2sscG9zdERhdGEpIHtcbiAgICB2YXIgcmVxID0gY3JlYXRlWE1MSFRUUE9iamVjdCgpO1xuICAgIGlmICghcmVxKSB7XG4gICAgXHRyZXR1cm47XG4gICAgfVxuICAgIHZhciBtZXRob2QgPSAocG9zdERhdGEpID8gJ1BPU1QnIDogJ0dFVCc7XG4gICAgcmVxLm9wZW4obWV0aG9kLHVybCx0cnVlKTtcbiAgICBpZiAocG9zdERhdGEpIHtcbiAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpO1xuICAgIH1cbiAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgIT09IDQpIHtcbiAgICAgICAgXHRyZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgIT09IDIwMCAmJiByZXEuc3RhdHVzICE9PSAzMDQpIHtcbi8vICAgICAgICAgIGFsZXJ0KCdIVFRQIGVycm9yICcgKyByZXEuc3RhdHVzKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhyZXEpO1xuICAgIH07XG5cbiAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICBcdHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgcmVxLnNlbmQocG9zdERhdGEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbmRSZXF1ZXN0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFN0eWxlID0gcmVxdWlyZSgnLi4vc3R5bGUnKTtcblxudmFyIGVsZW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcblx0cmVhZHkgPSBmYWxzZSxcblx0d3JpdGVUaW1lb3V0ID0gbnVsbCxcblx0Zmlyc3RSdW4gPSB0cnVlLFxuXHRzdHlsZXMgPSBbXSxcblx0d3JpdGVRdWV1ZSA9IFtdLFxuXHRzdHlsZUlkZW5maWVycyA9IFtdO1xuXG5mdW5jdGlvbiBnZXRTdHlsZXNoZWV0T2JqZWN0Rm9ySW5zdGFuY2UgKCkge1xuXHR2YXIgc3R5bGVzaGVldCA9IGZhbHNlO1xuXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgd2luZG93LmRvY3VtZW50LnN0eWxlU2hlZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKCh3aW5kb3cuZG9jdW1lbnQuc3R5bGVTaGVldHNbaV0ub3duZXJOb2RlIHx8IHdpbmRvdy5kb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5vd25pbmdFbGVtZW50KSA9PT0gZWxlbWVudClcdHtcblx0XHRcdHN0eWxlc2hlZXQgPSB3aW5kb3cuZG9jdW1lbnQuc3R5bGVTaGVldHNbaV07XG5cdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gc3R5bGVzaGVldDtcbn1cblxuZnVuY3Rpb24gY2hlY2tJZlN0eWxlc2hlZXRJc1JlYWR5IChjYWxsYmFjaykge1xuXHR2YXIgc3R5bGUgPSBnZXRTdHlsZXNoZWV0T2JqZWN0Rm9ySW5zdGFuY2UoKTtcblxuXHQvLyBjaGVjayBpZiB0aGUgc3R5bGVzaGVldCBpcyBwcm9jZXNzZWQgYW5kIHJlYWR5XG5cdHRyeSB7XG5cdFx0aWYgKHN0eWxlICYmIHN0eWxlLnJ1bGVzICYmIHN0eWxlLnJ1bGVzLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZWFkeSA9IHRydWU7XG5cdFx0fSBlbHNlIGlmIChzdHlsZSAmJiBzdHlsZS5jc3NSdWxlcyAmJiBzdHlsZS5ydWxlcy5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmVhZHkgPSB0cnVlO1xuXHRcdH1cblx0fSBjYXRjaCAoZSkge31cblxuXHQvLyB3cml0ZSBodG1sIGlmIHdlIGFyZSByZWFsbHkgcmVhZHlcblx0aWYgKHJlYWR5KSB7XG5cdFx0aWYgKGNhbGxiYWNrKSB7XG5cdFx0XHR3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMCk7XG5cdFx0fVxuXHRcdHJldHVybjtcblx0fVxuXG5cdHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRjaGVja0lmU3R5bGVzaGVldElzUmVhZHkoY2FsbGJhY2spO1xuXHR9LCAwKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVSdWxlc0ZvclN0eWxlcyAoc3R5bGVzKSB7XG5cdHZhciBzdHlsZXNoZWV0VGV4dCA9ICcnO1xuXG5cdGZvciAodmFyIHN0eWxlIGluIHN0eWxlcykge1xuXHRcdHN0eWxlc2hlZXRUZXh0ICs9ICdcXG4vKiBTdHlsZXMgZm9yICcgKyBzdHlsZXNbc3R5bGVdLmRpc3BsYXlOYW1lICsgJyBjb21wb25lbnQgKi9cXG4nO1xuXHRcdHN0eWxlc2hlZXRUZXh0ICs9IHN0eWxlc1tzdHlsZV0udG9TdHJpbmcoKTtcblx0fVxuXHRcblx0ZWxlbWVudC5pbm5lckhUTUwgKz0gc3R5bGVzaGVldFRleHQ7XG59XG5cbmZ1bmN0aW9uIGFkZFN0eWxlIChzdHlsZSkge1xuXHRpZiAoc3R5bGVJZGVuZmllcnMuaW5kZXhPZihzdHlsZS5kaXNwbGF5TmFtZSkgPj0gMCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHN0eWxlcy5wdXNoKHN0eWxlKTtcblx0d3JpdGVRdWV1ZS5wdXNoKHN0eWxlKTtcblx0c3R5bGVJZGVuZmllcnMucHVzaChzdHlsZS5kaXNwbGF5TmFtZSk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlU3R5bGVzICgpIHtcblx0aWYgKGZpcnN0UnVuICYmIHJlYWR5KSB7XG5cdFx0cmV0dXJuIHdyaXRlUnVsZXNGb3JTdHlsZXMod3JpdGVRdWV1ZS5zcGxpY2UoMCkpO1xuXHR9XG5cblx0Y2xlYXJUaW1lb3V0KHdyaXRlVGltZW91dCk7XG5cblx0d3JpdGVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0d3JpdGVSdWxlc0ZvclN0eWxlcyh3cml0ZVF1ZXVlLnNwbGljZSgwKSk7XG5cdH0sIDApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHlsZSAoZGlzcGxheU5hbWUsIHN0eWxlKSB7XG5cdGFkZFN0eWxlKG5ldyBTdHlsZShzdHlsZSwgZGlzcGxheU5hbWUpKTtcblx0d3JpdGVTdHlsZXMoKTtcbn1cblxuLy8gaW5pdGlhbGl6YXRpb25cbihmdW5jdGlvbiAoKSB7XG5cdC8vIGFwcGVuZCBvdXIgc3R5bGVzaGVldCB0byB0aGUgaGVhZFxuXHR3aW5kb3cuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChlbGVtZW50KTtcblxuXHQvLyB0cmFjayB0aGUgZmlyc3QgZXZlbnQgbG9vcFxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRmaXJzdFJ1biA9IGZhbHNlO1xuXHR9LCAwKTtcblxuXHQvLyBjaGVjayB0aGUgRE9NIGZvciB0aGUgc3R5bGVzaGVldFxuXHRjaGVja0lmU3R5bGVzaGVldElzUmVhZHkoZnVuY3Rpb24gKCkge1xuXHRcdHdyaXRlU3R5bGVzKCk7XG5cdH0pO1xufSkoKTtcblxuZXhwb3J0cy5jcmVhdGVTdHlsZSA9IGNyZWF0ZVN0eWxlO1xuZXhwb3J0cy5hZGRTdHlsZSA9IGFkZFN0eWxlO1xuZXhwb3J0cy53cml0ZVN0eWxlcyA9IHdyaXRlU3R5bGVzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gd2luZG93LlJlYWN0LFxuXHRTdHlsZSA9IHJlcXVpcmUoJy4uL3N0eWxlJyksXG5cdFN0eWxlU2hlZXQgPSByZXF1aXJlKCcuL3N0eWxlc2hlZXQnKSxcblx0RE9NID0gcmVxdWlyZSgnLi9kb20nKSxcblx0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL3Byb3BlcnRpZXMnKSxcblx0UGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2VyJyksXG5cdGNvbnRlbnRMb2FkZWQgPSByZXF1aXJlKCcuL2NvbnRlbnRMb2FkZWQnKSxcblx0c2VuZFJlcXVlc3QgPSByZXF1aXJlKCcuL3NlbmRSZXF1ZXN0Jyk7XG5cbi8vIGluaXRpYWxpemVzIFJlYWN0U3R5bGUsIG1haW5seSB1c2VkIGZvciBhZGRpbmcgbWl4aW5zXG5pZiAodHlwZW9mIHdpbmRvdy5SQ1NQcm9wZXJ0aWVzSW5pdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0d2luZG93LlJDU1Byb3BlcnRpZXNJbml0KFByb3BlcnRpZXMpO1xufVxuXG5pZiAodHlwZW9mIFJlYWN0ICE9PSAndW5kZWZpbmVkJykge1xuXHRSZWFjdC5jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoY3JlYXRlQ2xhc3MpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHNwZWMpIHtcblx0XHRcdGlmIChzcGVjLnN0eWxlKSB7XG5cdFx0XHRcdFN0eWxlU2hlZXQuYWRkU3R5bGUobmV3IFN0eWxlKHNwZWMuZGlzcGxheU5hbWUsIHNwZWMuc3R5bGUpKTtcblx0XHRcdFx0U3R5bGVTaGVldC53cml0ZVN0eWxlcygpO1xuXG5cdFx0XHRcdGRlbGV0ZSBzcGVjLnN0eWxlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmVuZGVyID0gc3BlYy5yZW5kZXI7XG5cdFx0XHRzcGVjLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIG5vZGUgPSByZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0RE9NLmFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIHNwZWMuZGlzcGxheU5hbWUpO1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBjcmVhdGVDbGFzcyhzcGVjKTtcblx0XHR9O1xuXHR9KShSZWFjdC5jcmVhdGVDbGFzcyk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NSQ1NTb3VyY2UgKHNvdXJjZSwgbmFtZSkge1xuXHR2YXIgY3NzID0gJyc7XG5cdHZhciByY3MgPSBQYXJzZXIucGFyc2VSQ1Moc291cmNlKTtcblxuXHRmb3IgKHZhciBzZWxlY3RvciBpbiByY3MpIHtcblx0XHRpZiAoc2VsZWN0b3IubWF0Y2goL1xcQGNvbXBvbmVudC8pKSB7XG5cdFx0XHR2YXIgY29tcG9uZW50TmFtZSA9IHNlbGVjdG9yLm1hdGNoKC9AY29tcG9uZW50ICguKykvKVsxXTtcblx0XHRcdHZhciBzdHlsZSA9IG5ldyBTdHlsZShjb21wb25lbnROYW1lLCByY3Nbc2VsZWN0b3JdKTtcblx0XHRcdGNzcyArPSAnLyogU3R5bGUgZm9yIGNvbXBvbmVudCAnICsgY29tcG9uZW50TmFtZSArICcgKi9cXG4nO1xuXHRcdFx0Y3NzICs9IHN0eWxlLnRvU3RyaW5nKCkgKyAnXFxuXFxuJztcblx0XHRcdGRlbGV0ZSByY3Nbc2VsZWN0b3JdO1xuXHRcdH1cblx0fVxuXG5cdGlmIChuYW1lKSB7XG5cdFx0Y3NzICs9IG5ldyBTdHlsZShuYW1lLCByY3MpO1xuXHR9XG5cblx0cmV0dXJuIGNzcy50cmltKCk7XG59XG5cbi8vIHByb2Nlc3MgaHRtbFxuY29udGVudExvYWRlZCh3aW5kb3csIGZ1bmN0aW9uICgpIHtcblx0Ly8gcmVwbGFjZSByY3Mgc3R5bGUgdGFnc1xuXHR2YXIgcmNzU3R5bGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc3R5bGVbdHlwZT1cInRleHQvcmNzXCJdJykpO1xuXHRyY3NTdHlsZXMuZm9yRWFjaChmdW5jdGlvbiAoc3R5bGUpIHtcblx0XHR2YXIgbmFtZSA9IHN0eWxlLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50Jyk7XG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdGVsZW1lbnQuaW5uZXJIVE1MID0gcHJvY2Vzc1JDU1NvdXJjZShzdHlsZS5pbm5lckhUTUwsIG5hbWUpO1xuXHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG5cdFx0aWYgKG5hbWUpIHtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCdjb21wb25lbnQnLCBuYW1lKTtcblx0XHR9XG5cblx0XHRzdHlsZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbGVtZW50LCBzdHlsZSk7XG5cdH0pO1xuXG5cdC8vIHJlcGxhY2UgcmNzIGxpbmsgdGFnc1xuXHR2YXIgcmNzTGlua3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaW5rW3JlbD1cInN0eWxlc2hlZXQvcmNzXCJdW3R5cGU9XCJ0ZXh0L2Nzc1wiXScpKTtcblx0cmNzTGlua3MuZm9yRWFjaChmdW5jdGlvbiAobGluaykge1xuXHRcdHZhciBuYW1lID0gbGluay5nZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcpO1xuXG5cdFx0c2VuZFJlcXVlc3QobGluay5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSwgZnVuY3Rpb24gKHJlcXVlc3QpIHtcblx0XHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblx0XHRcdGVsZW1lbnQuaW5uZXJIVE1MID0gcHJvY2Vzc1JDU1NvdXJjZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCwgbmFtZSk7XG5cdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0L2NzcycpO1xuXHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcsIG5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0bGluay5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbGVtZW50LCBsaW5rKTtcblx0XHR9KTtcblx0fSk7XG59KTtcblxuZXhwb3J0cy5TdHlsZSA9IFN0eWxlO1xuZXhwb3J0cy5TdHlsZVNoZWV0ID0gU3R5bGVTaGVldDtcbmV4cG9ydHMuUHJvcGVydGllcyA9IFByb3BlcnRpZXM7XG5leHBvcnRzLlBhcnNlciA9IFBhcnNlcjsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUGFyc2VzIGEgUkNTIHN0cmluZyB0byBhIEpTT04gb2JqZWN0LlxuICovXG5mdW5jdGlvbiBwYXJzZVJDUyAocmNzKSB7XG5cdHZhciBvcmlnaW5hbCA9IHJjcztcblxuXHRyY3MgPSAne1xcbicgKyByY3MgKyAnXFxufSc7XG5cdFxuXHRyY3MgPSByY3MucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpO1xuXG5cdC8vIHN0cmlwIGNvbW1lbnRzXG5cdHJjcyA9IHJjcy5yZXBsYWNlKC9eW1xcdF0rXFwvXFwvLiskL2dpbSwgJycpO1xuXHRyY3MgPSByY3MucmVwbGFjZSgvXFwvXFwqW1xcU1xcc10qP1xcKlxcLy9naW0sICcnKTtcblxuXHQvLyBhZGQgcXVvdGVzXG5cdHJjcyA9IHJjcy5yZXBsYWNlKC8oW1xcQGEtejAtOVxcLVxcLlxcOlxcKl1bYS16MC05XFwtXFwuXFw6XFxzXFwqXSopKD86XFxzKyk/OlxccyooLispOy9naSwgJ1wiJDFcIjogXCIkMlwiOycpO1xuXHRyY3MgPSByY3MucmVwbGFjZSgvKFtcXEBhLXowLTlcXC1cXC5cXDpcXCpdW2EtejAtOVxcJVxcLVxcLlxcOlxcc1xcKlxcW1xcXVxcPVxcJ1xcXCJcXCxdKj8pKD86XFxzKikoW1xce1xcW10pL2dpLCAnXCIkMVwiOiAkMicpO1xuXG5cdC8vIHJlbW92ZSB1bm5lc3Nhcnkgd2hpdGUgc3BhY2VzXG5cdC8vcmNzID0gcmNzLnJlcGxhY2UoL1xcbnxcXHQvZywgJycpO1xuXG5cdC8vIGRlZmF1bHQgbnVtYmVyIHZhbHVlcyB0byBwaXhlbHNcblx0Ly9yY3MgPSByY3MucmVwbGFjZSgvKFxcZCspKD8hXFxkKSg/ISV8cHgpL2dpLCAnJDFweCcpO1xuXG5cdC8vIGFkZCBjb21tYXNcblx0cmNzID0gcmNzLnJlcGxhY2UoL1xcfSg/IVxccypbXFx9XFxdXXwkKS9nLCAnfSwnKTtcblx0cmNzID0gcmNzLnJlcGxhY2UoLzsoPyFcXHMqW1xcfVxcXV0pL2csICcsJyk7XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC87KD89XFxzKltcXH1cXF1dKS9nLCAnJyk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gSlNPTi5wYXJzZShyY3MpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHRocm93IG5ldyBFcnJvcignSXNzdWUgUGFyc2luZyBSQ1M6IFxcbm9yaWdpbmFsOlxcbicgKyBvcmlnaW5hbCArICdcXG5cXG5tYWxmb3JtZWQ6XFxuJyArIHJjcyk7XG5cdH1cbn1cblxuZXhwb3J0cy5wYXJzZVJDUyA9IHBhcnNlUkNTOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYW5hZ2VzIGNzcyBwcm9wZXJ0eS92YWx1ZSB0cmFuc2Zvcm1zLlxuICovXG52YXIgcHJvcGVydHlUcmFuc2Zvcm1zID0gW10sXG5cdHByZWZpeGVkUHJvcGVydGllcyA9IFtdLFxuXHRiYXNlVXJsID0gJyc7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyUHJvcGVydHkgKHByb3BlcnR5LCB0cmFuc2Zvcm0pIHtcblx0cHJvcGVydHlUcmFuc2Zvcm1zLnB1c2goe3Byb3BlcnR5OiBwcm9wZXJ0eSwgbWV0aG9kOiB0cmFuc2Zvcm19KTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTdGFuZGFyZFByZWZpeGVkUHJvcGVydGllcyAocHJvcGVydGllcykge1xuXHRwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0cHJlZml4ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRydWU7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzdGFuZGFyZFRyYW5zZm9ybSAobmFtZSwgdmFsdWUpIHtcblx0cmV0dXJuIFtcblx0XHR7bmFtZTogJy13ZWJraXQtJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6ICctbXMtJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6ICctbW96LScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW8tJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX1cblx0XTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtIChuYW1lLCB2YWx1ZSkge1xuXHR2YXIgcmVzdWx0cyA9IFtdO1xuXG5cdHByb3BlcnR5VHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcblx0XHRpZiAodHJhbnNmb3JtLnByb3BlcnR5ICE9PSBuYW1lKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHRyYW5zZm9ybXMgPSB0cmFuc2Zvcm0ubWV0aG9kKG5hbWUsIHZhbHVlKTtcblx0XHRcblx0XHRpZiAodHJhbnNmb3Jtcykge1xuXHRcdFx0cmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHRyYW5zZm9ybXMpO1xuXHRcdH1cblx0fSk7XG5cblx0aWYgKCFyZXN1bHRzLmxlbmd0aCkge1xuXHRcdGlmIChwcmVmaXhlZFByb3BlcnRpZXNbbmFtZV0pIHtcblx0XHRcdHJldHVybiBzdGFuZGFyZFRyYW5zZm9ybShuYW1lLCB2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJlc3VsdHMucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHJlc3VsdHM7XG59XG5cbi8vIHJlZ2lzdGVyIGRlZmF1bHRzXG5yZWdpc3RlclByb3BlcnR5KCdiYWNrZ3JvdW5kJywgZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG5cdHZhciBtYXRjaGVzID0gdmFsdWUubWF0Y2goL3VybFxcKFsnXCJdKiguKz8pWydcIl0qXFwpLyk7XG5cdFxuXHRpZiAoIW1hdGNoZXMgfHwgIWJhc2VVcmwpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgdXJsID0gbWF0Y2hlc1sxXSxcblx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdXJsO1xuXG5cdHJldHVybiB7XG5cdFx0bmFtZTogbmFtZSxcblx0XHR2YWx1ZTogdmFsdWUucmVwbGFjZSh1cmwsIG5ld1VybClcblx0fTtcbn0pO1xuXG5leHBvcnRzLnNldEJhc2VVcmwgPSAgZnVuY3Rpb24gKHVybCkge1xuXHRiYXNlVXJsID0gdXJsO1xufTtcbmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuZXhwb3J0cy5yZWdpc3RlclByb3BlcnR5ID0gcmVnaXN0ZXJQcm9wZXJ0eTtcbmV4cG9ydHMucmVnaXN0ZXJTdGFuZGFyZFByZWZpeGVkUHJvcGVydGllcyA9IHJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXM7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUHJvcGVydGllcyA9IHJlcXVpcmUoJy4vcHJvcGVydGllcycpLFxuXHRQYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcicpLFxuXHR0b0h5cGhlbkRlbGltaXRlZCA9IHJlcXVpcmUoJy4vdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQnKTtcblxuLyoqXG4gKiBNYW5hZ2VzIGNzcyBwcm9wZXJ0eS92YWx1ZSB0cmFuc2Zvcm1zLlxuICovXG5mdW5jdGlvbiBTdHlsZSAoZGlzcGxheU5hbWUsIHN0eWxlLCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcblx0dGhpcy5kaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lO1xuXG5cdHRoaXMuX3ByZWZpeCA9ICdyZWFjdC0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoZGlzcGxheU5hbWUpICsgJy0nO1xuXHRcblx0dGhpcy5fc2VsZWN0b3JQcmVmaXggPSAnLnJlYWN0LXZpZXcuJyArIHRoaXMuX3ByZWZpeC5zdWJzdHIoMCwgdGhpcy5fcHJlZml4Lmxlbmd0aC0xKSArICcgJztcblxuXHR0aGlzLnJ1bGVzID0ge307XG5cdHRoaXMuYW5pbWF0aW9ucyA9IHt9O1xuXHR0aGlzLmluc3RhbmNlUnVsZXMgPSB7fTtcblx0dGhpcy5tZWRpYVF1ZXJpZXMgPSB7fTtcblxuXHR0aGlzLnBhcnNlU3R5bGUoc3R5bGUpO1xufVxuXG5TdHlsZS5wcm90b3R5cGUgPSB7XG5cdElOVF9QUk9QRVJUSUVTOiBbJ3otaW5kZXgnLCAnb3BhY2l0eSddLFxuXG5cdHBhcnNlU3R5bGU6IGZ1bmN0aW9uIChzdHlsZSkge1xuXHRcdHZhciBydWxlcztcblx0XHRcblx0XHRpZiAodHlwZW9mIHN0eWxlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cnVsZXMgPSBzdHlsZTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcblx0XHRcdHRyeSB7XG5cblx0XHRcdFx0cnVsZXMgPSBQYXJzZXIucGFyc2VSQ1Moc3R5bGUpO1xuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdQYXJzaW5nIGNvbXBvbmVudCAnICsgdGhpcy5kaXNwbGF5TmFtZSArICdcXG4nICsgZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2FkZFJ1bGVzKHJ1bGVzKTtcblx0fSxcblxuXHRfYWRkUnVsZXM6IGZ1bmN0aW9uIChydWxlcykge1xuXHRcdC8vIHRyYXZlcnNlIGFyZ3VtZW50cyBhbmQgcnVuIGFkZFJ1bGUgb24gZWFjaCBpdGVtXG5cdFx0Zm9yICh2YXIgcnVsZSBpbiBydWxlcykge1xuXHRcdFx0dmFyIHJ1bGVzQnVmZmVyID0ge3J1bGVzOiB7fSwgYW5pbWF0aW9uczoge319O1xuXG5cdFx0XHRpZiAocnVsZS5tYXRjaCgvXkBtZWRpYS8pKSB7XHRcblx0XHRcdFx0Zm9yICh2YXIgbWVkaWFSdWxlIGluIHJ1bGVzW3J1bGVdKSB7XG5cdFx0XHRcdFx0dGhpcy5fYWRkUnVsZShtZWRpYVJ1bGUsIHJ1bGVzW3J1bGVdW21lZGlhUnVsZV0sIHJ1bGVzQnVmZmVyKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMubWVkaWFRdWVyaWVzW3J1bGVdID0gcnVsZXNCdWZmZXI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9hZGRSdWxlKHJ1bGUsIHJ1bGVzW3J1bGVdLCBydWxlc0J1ZmZlcik7XG5cblx0XHRcdFx0dmFyIGJ1ZmZlclJ1bGVzS2V5cyA9IE9iamVjdC5rZXlzKHJ1bGVzQnVmZmVyLnJ1bGVzKTtcblx0XHRcdFx0YnVmZmVyUnVsZXNLZXlzLnNvcnQoKTtcblx0XHRcdFx0YnVmZmVyUnVsZXNLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHRoaXMucnVsZXNba2V5XSA9IHJ1bGVzQnVmZmVyLnJ1bGVzW2tleV07XG5cdFx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0XHRmb3IgKHZhciBhbmltYXRpb24gaW4gcnVsZXNCdWZmZXIuYW5pbWF0aW9ucykge1xuXHRcdFx0XHRcdHRoaXMuYW5pbWF0aW9uc1thbmltYXRpb25dID0gcnVsZXNCdWZmZXIuYW5pbWF0aW9uc1thbmltYXRpb25dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9hZGRSdWxlOiBmdW5jdGlvbiAoc2VsZWN0b3IsIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCBfcmVjdXJzaXZlKSB7XG5cdFx0aWYgKHNlbGVjdG9yLm1hdGNoKC9eQGtleWZyYW1lcy8pKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWRkS2V5ZnJhbWVBbmltYXRpb24oc2VsZWN0b3IsIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyKTtcblx0XHR9XG5cblx0XHRpZiAoc2VsZWN0b3Iuc3Vic3RyKDAsIDMpID09PSAnOjo6Jykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FkZFJ1bGUodGhpcy5fcmVzb2x2ZVN0YXRlV2l0aFNlbGVjdG9yKHNlbGVjdG9yKSwgcHJvcGVydGllcywgcnVsZXNCdWZmZXIsIHRydWUpO1xuXHRcdH0gZWxzZSBpZiAoc2VsZWN0b3IubWF0Y2goL15cXDpcXDo/W2Etel0vKSkge1xuXHRcdFx0c2VsZWN0b3IgPSB0aGlzLl9zZWxlY3RvclByZWZpeC5zbGljZSgwLCAtMSkgKyBzZWxlY3RvcjtcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2FkZFJ1bGUoc2VsZWN0b3IsIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHR9XG5cblx0XHQvLyBwcm9wZXJseSBwcm9jZXNzIHRoZSBzZWxlY3RvclxuXHRcdHZhciBzZWxlY3RvcnMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpO1xuXHRcdGlmIChzZWxlY3RvcnMubGVuZ3RoID4gMSkge1xuXHRcdFx0c2VsZWN0b3JzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdFx0dGhpcy5fYWRkUnVsZShpdGVtLnRyaW0oKSwgcHJvcGVydGllcywgcnVsZXNCdWZmZXIsIHRydWUpO1xuXHRcdFx0fSwgdGhpcyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdG9yID0gdGhpcy5fcmVzb2x2ZVNlbGVjdG9yKHNlbGVjdG9yKTtcblx0XHR9XG5cblx0XHQvLyB0cmFjayBhbHRlcmVkIHByb3BlcnRpZXNcblx0XHR2YXIgX3Byb3BlcnRpZXMgPSBydWxlc0J1ZmZlci5ydWxlc1tzZWxlY3Rvcl0gfHwgW107XG5cblx0XHRmb3IgKHZhciBwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRpZiAodHlwZW9mIHByb3BlcnRpZXNbcHJvcGVydHldID09PSAnb2JqZWN0Jykge1xuXHRcdCBcdFx0aWYgKHByb3BlcnR5LnN1YnN0cigwLCAzKSA9PT0gJzo6OicpIHtcblx0XHRcdFx0XHR0aGlzLl9hZGRSdWxlKHRoaXMuX3Jlc29sdmVTdGF0ZVdpdGhTZWxlY3Rvcihwcm9wZXJ0eSwgc2VsZWN0b3IpLCBwcm9wZXJ0aWVzW3Byb3BlcnR5XSwgcnVsZXNCdWZmZXIsIHRydWUpO1xuXHRcdCBcdFx0fSBlbHNlIHtcblx0XHQgXHRcdFx0dGhpcy5fYWRkUnVsZSh0aGlzLl9hZGRQYXJlbnRTZWxlY3RvclRvU2VsZWN0b3Ioc2VsZWN0b3IsIHByb3BlcnR5KSwgcHJvcGVydGllc1twcm9wZXJ0eV0sIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHQgXHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciByZXNvbHZlZCA9IFByb3BlcnRpZXMudHJhbnNmb3JtKHByb3BlcnR5LCBwcm9wZXJ0aWVzW3Byb3BlcnR5XSk7XG5cdFx0XHRcdHJlc29sdmVkLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5LnZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdF9wcm9wZXJ0aWVzLnB1c2gocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHRvIHJ1bGVzXG5cdFx0cnVsZXNCdWZmZXIucnVsZXNbc2VsZWN0b3JdID0gX3Byb3BlcnRpZXM7XG5cblx0XHRyZXR1cm4gcnVsZXNCdWZmZXI7XG5cdH0sXG5cblx0X3Jlc29sdmVTZWxlY3RvcjogZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cdFx0aWYgKHRoaXMuX3ByZWZpeCAhPT0gJ3JlYWN0LScpIHtcblx0XHRcdGlmICgvKF58XFxzfCwpdmlldy8udGVzdChzZWxlY3RvcikpIHtcblx0XHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKC8oXnxcXHN8LCl2aWV3L2csICckMS5yZWFjdC12aWV3LicgKyB0aGlzLl9wcmVmaXguc3Vic3RyKDAsIHRoaXMuX3ByZWZpeC5sZW5ndGgtMSkpO1xuXHRcdFx0fSBlbHNlIGlmICghc2VsZWN0b3IubWF0Y2goLy5yZWFjdC0vKSAmJiBzZWxlY3Rvci5tYXRjaCgvXFwufFxcIy8pKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gdGhpcy5fc2VsZWN0b3JQcmVmaXggKyBzZWxlY3Rvcjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFsjXFxcXC5dKSg/IXJlYWN0LSkoW2EtejAtOVxcXFwtX10qKScsICdpZycpLCAnJDEnICsgdGhpcy5fcHJlZml4ICsgJyQyJyk7XG5cblx0XHRyZXR1cm4gc2VsZWN0b3IudHJpbSgpO1xuXHR9LFxuXG5cdF9yZXNvbHZlU3RhdGVXaXRoU2VsZWN0b3I6IGZ1bmN0aW9uIChzdGF0ZSwgc2VsZWN0b3IpIHtcblx0XHRzdGF0ZSA9IHN0YXRlLnN1YnN0cigzKTtcblx0XHRzZWxlY3RvciA9IHNlbGVjdG9yIHx8ICcnO1xuXG5cdFx0dmFyIHZpZXdTZWxlY3RvciA9ICcucmVhY3Qtdmlldy4nICsgdGhpcy5fcHJlZml4LnN1YnN0cigwLCB0aGlzLl9wcmVmaXgubGVuZ3RoLTEpO1xuXG5cdFx0aWYgKCFzdGF0ZS5tYXRjaCgvXnJlYWN0LykpIHtcblx0XHRcdC8vIHByZXBlbmQgd2l0aCBzdGF0ZVxuXHRcdFx0c3RhdGUgPSBzdGF0ZS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbiAoc3RhdGUpIHtcblx0XHRcdFx0cmV0dXJuICdzdGF0ZS0nICsgc3RhdGU7XG5cdFx0XHR9KS5qb2luKCcuJyk7XG5cblx0XHRcdGlmICghc2VsZWN0b3IpIHtcblx0XHRcdFx0c2VsZWN0b3IgKz0gdGhpcy5fcmVzb2x2ZVNlbGVjdG9yKHRoaXMuX3NlbGVjdG9yUHJlZml4LnNsaWNlKDAsIC0xKSArICcuJyArIHRoaXMuX3ByZWZpeCArIHN0YXRlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSh2aWV3U2VsZWN0b3IsIHZpZXdTZWxlY3RvciArICcuJyArIHRoaXMuX3ByZWZpeCArIHN0YXRlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFzZWxlY3Rvcikge1xuXHRcdFx0XHRzZWxlY3RvciA9IHRoaXMuX3Jlc29sdmVTZWxlY3RvcignLicgKyBzdGF0ZSkgKyAnICcgKyB2aWV3U2VsZWN0b3I7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxlY3RvciA9IHRoaXMuX3Jlc29sdmVTZWxlY3RvcignLicgKyBzdGF0ZSkgKyAnICcgKyBzZWxlY3Rvcjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gc2VsZWN0b3I7XG5cdH0sXG5cblx0X2FkZFBhcmVudFNlbGVjdG9yVG9TZWxlY3RvcjogZnVuY3Rpb24gKHBhcmVudCwgc2VsZWN0b3IpIHtcblx0XHRyZXR1cm4gc2VsZWN0b3Iuc3BsaXQoJywnKS5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHJldHVybiBwYXJlbnQgKyAoaXRlbS5zdWJzdHIoMCwgMSkgPT09ICc6JyA/ICcnIDogJyAnKSArIGl0ZW07XG5cdFx0fSkuam9pbignLCcpO1xuXHR9LFxuXG5cdF9hZGRLZXlmcmFtZUFuaW1hdGlvbjogZnVuY3Rpb24gKHNlbGVjdG9yLCBsaXN0LCBydWxlc0J1ZmZlcikge1xuXHRcdHZhciBpZGVudGlmaWVyID0gc2VsZWN0b3IucmVwbGFjZSgnQGtleWZyYW1lcyAnLCAnJyksXG5cdFx0XHRrZXlmcmFtZXNOYW1lID0gJ2tleWZyYW1lcycsXG5cdFx0XHR2YWx1ZSA9ICcnO1xuXG5cdFx0Zm9yICh2YXIgdGltZSBpbiBsaXN0KSB7XG5cdFx0XHR2YWx1ZSArPSB0aW1lICsgJyB7JztcblxuXHRcdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gbGlzdFt0aW1lXSkge1xuXHRcdFx0XHR2YXIgcmVzb2x2ZWQgPSBQcm9wZXJ0aWVzLnRyYW5zZm9ybShwcm9wZXJ0eSwgbGlzdFt0aW1lXVtwcm9wZXJ0eV0pO1xuXHRcdFx0XHRyZXNvbHZlZC5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHZhbHVlICs9IHByb3BlcnR5Lm5hbWUgKyAnOiAnICsgcHJvcGVydHkudmFsdWUgKyAnOyc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dmFsdWUgKz0gJ30nO1xuXHRcdH1cblxuXHRcdHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnNbJ0Atd2Via2l0LScgKyBrZXlmcmFtZXNOYW1lICsgJyAnICsgaWRlbnRpZmllcl0gPSB2YWx1ZTtcblx0XHRydWxlc0J1ZmZlci5hbmltYXRpb25zWydALW1zLScgKyBrZXlmcmFtZXNOYW1lICsgJyAnICsgaWRlbnRpZmllcl0gPSB2YWx1ZTtcblx0XHRydWxlc0J1ZmZlci5hbmltYXRpb25zWydALW1vei0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQC1vLScgKyBrZXlmcmFtZXNOYW1lICsgJyAnICsgaWRlbnRpZmllcl0gPSB2YWx1ZTtcblx0XHRydWxlc0J1ZmZlci5hbmltYXRpb25zWydAJyArIGtleWZyYW1lc05hbWUgKyAnICcgKyBpZGVudGlmaWVyXSA9IHZhbHVlO1xuXHR9LFxuXG5cdHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHN0eWxlc2hlZXRUZXh0ID0gJycsXG5cdFx0XHRydWxlU3RyaW5ncyA9IHRoaXMucnVsZXNUb1N0cmluZ3ModGhpcy5ydWxlcyk7XG5cblx0XHRmb3IgKHZhciBzZWxlY3RvciBpbiBydWxlU3RyaW5ncykge1xuXHRcdFx0c3R5bGVzaGVldFRleHQgKz0gc2VsZWN0b3IgKyAnIHsnICsgcnVsZVN0cmluZ3Nbc2VsZWN0b3JdICsgJ31cXG4nO1xuXHRcdH1cblxuXHRcdGZvciAodmFyIGFuaW1hdGlvbiBpbiB0aGlzLmFuaW1hdGlvbnMpIHtcblx0XHRcdHN0eWxlc2hlZXRUZXh0ICs9IGFuaW1hdGlvbiArICcgeycgKyB0aGlzLmFuaW1hdGlvbnNbYW5pbWF0aW9uXSArICd9XFxuJztcblx0XHR9XG5cblx0XHRzdHlsZXNoZWV0VGV4dCArPSB0aGlzLm1lZGlhUXVlcmllc1RvU3RyaW5nKHRoaXMubWVkaWFRdWVyaWVzKTtcblxuXHRcdHJldHVybiBzdHlsZXNoZWV0VGV4dC50cmltKCk7XG5cdH0sXG5cblx0bWVkaWFRdWVyaWVzVG9TdHJpbmc6IGZ1bmN0aW9uIChxdWVyaWVzKSB7XG5cdFx0dmFyIHN0cmluZyA9ICcnO1xuXG5cdFx0Zm9yICh2YXIgcXVlcnkgaW4gcXVlcmllcykge1xuXHRcdFx0dmFyIGFuaW1hdGlvbnMgPSBxdWVyaWVzW3F1ZXJ5XS5hbmltYXRpb25zLFxuXHRcdFx0XHRydWxlcyA9IHF1ZXJpZXNbcXVlcnldLnJ1bGVzO1xuXG5cdFx0XHR2YXIgcXVlcnlTdHJpbmcgPSBxdWVyeSArICcge1xcbicsXG5cdFx0XHRcdG1lZGlhUXVlcnlSdWxlU3RyaW5ncyA9IHRoaXMucnVsZXNUb1N0cmluZ3MocnVsZXMpO1xuXG5cdFx0XHRmb3IgKHZhciBzZWxlY3RvciBpbiBtZWRpYVF1ZXJ5UnVsZVN0cmluZ3MpIHtcblx0XHRcdFx0cXVlcnlTdHJpbmcgKz0gJ1xcdCcgKyBzZWxlY3RvciArICcgeycgKyBtZWRpYVF1ZXJ5UnVsZVN0cmluZ3Nbc2VsZWN0b3JdICsgJ31cXG4nO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKHZhciBhbmltYXRpb24gaW4gYW5pbWF0aW9ucykge1xuXHRcdFx0XHRxdWVyeVN0cmluZyArPSAgJ1xcdCcgKyBhbmltYXRpb24gKyAnIHsnICsgYW5pbWF0aW9uc1thbmltYXRpb25dICsgJ31cXG4nO1xuXHRcdFx0fVxuXG5cdFx0XHRxdWVyeVN0cmluZyArPSAnfVxcbic7XG5cblx0XHRcdHN0cmluZyArPSBxdWVyeVN0cmluZztcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RyaW5nO1xuXHR9LFxuXG5cblx0cnVsZXNUb1N0cmluZ3M6IGZ1bmN0aW9uIChydWxlcykge1xuXHRcdHZhciBzdHJpbmdzID0ge307XG5cdFx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gcnVsZXMpIHtcblx0XHRcdHZhciBwcm9wZXJ0aWVzU3RyaW5nID0gJycsXG5cdFx0XHRcdHJ1bGUgPSBydWxlc1tzZWxlY3Rvcl07XG5cdFx0XHRcblx0XHRcdHJ1bGUuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRcdFx0cHJvcGVydGllc1N0cmluZyArPSBwcm9wZXJ0eS5uYW1lICsgJzonICsgcHJvcGVydHkudmFsdWUgKyAnOyc7XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKCFwcm9wZXJ0aWVzU3RyaW5nKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0c3RyaW5nc1tzZWxlY3Rvcl0gPSBwcm9wZXJ0aWVzU3RyaW5nO1xuXHRcdH1cblx0XHRyZXR1cm4gc3RyaW5ncztcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdHlsZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIENhbWVsQ2FzZSBzdHJpbmcgdG8gYSBoeXBoZW4tZGVsaW1pdGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gdG9IeXBoZW5EZWxpbWl0ZWQgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbYS16XVtBLVpdKS9nLCBmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiBnWzBdICsgJy0nICsgZ1sxXTtcbiAgfSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdG9IeXBoZW5EZWxpbWl0ZWQ7Il19
