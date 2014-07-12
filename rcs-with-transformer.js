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
	rcs = rcs.replace(/([\@a-z0-9-.:][a-z0-9-.:\s]*)(?:\s+)?:\s*(.+);/gi, '"$1": "$2";');
	rcs = rcs.replace(/([\@a-z0-9-.:][a-z0-9%-.:\s\[\]\=\'\",]*?)(?:\s*)([\{\[])/gi, '"$1": $2');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC90b2RvbXZjL2FyY2hpdGVjdHVyZS1leGFtcGxlcy9yZWFjdC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzLWJvd2VyL2xpYi9yY3Mtd2l0aC10cmFuc2Zvcm1lci5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvY29udGVudExvYWRlZC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvZG9tLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC90b2RvbXZjL2FyY2hpdGVjdHVyZS1leGFtcGxlcy9yZWFjdC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci9zZW5kUmVxdWVzdC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvc3R5bGVzaGVldC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvdHJhbnNmb3JtZXIuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3RvZG9tdmMvYXJjaGl0ZWN0dXJlLWV4YW1wbGVzL3JlYWN0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9wYXJzZXIuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3RvZG9tdmMvYXJjaGl0ZWN0dXJlLWV4YW1wbGVzL3JlYWN0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9wcm9wZXJ0aWVzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC90b2RvbXZjL2FyY2hpdGVjdHVyZS1leGFtcGxlcy9yZWFjdC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3Mvc3R5bGUuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3RvZG9tdmMvYXJjaGl0ZWN0dXJlLWV4YW1wbGVzL3JlYWN0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy91dGlscy90b0h5cGhlbkRlbGltaXRlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3JlYWN0LXJjcy9icm93c2VyL3RyYW5zZm9ybWVyJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiFcbiAqIGNvbnRlbnRMb2FkZWQuanNcbiAqXG4gKiBBdXRob3I6IERpZWdvIFBlcmluaSAoZGllZ28ucGVyaW5pIGF0IGdtYWlsLmNvbSlcbiAqIFN1bW1hcnk6IGNyb3NzLWJyb3dzZXIgd3JhcHBlciBmb3IgRE9NQ29udGVudExvYWRlZFxuICogVXBkYXRlZDogMjAxMDEwMjBcbiAqIExpY2Vuc2U6IE1JVFxuICogVmVyc2lvbjogMS4yXG4gKlxuICogVVJMOlxuICogaHR0cDovL2phdmFzY3JpcHQubndib3guY29tL0NvbnRlbnRMb2FkZWQvXG4gKiBodHRwOi8vamF2YXNjcmlwdC5ud2JveC5jb20vQ29udGVudExvYWRlZC9NSVQtTElDRU5TRVxuICpcbiAqL1xuIFxuLy8gQHdpbiB3aW5kb3cgcmVmZXJlbmNlXG4vLyBAZm4gZnVuY3Rpb24gcmVmZXJlbmNlXG5mdW5jdGlvbiBjb250ZW50TG9hZGVkKHdpbiwgZm4pIHtcbiBcblx0dmFyIGRvbmUgPSBmYWxzZSwgdG9wID0gdHJ1ZSxcbiBcblx0ZG9jID0gd2luLmRvY3VtZW50LCByb290ID0gZG9jLmRvY3VtZW50RWxlbWVudCxcbiBcblx0YWRkID0gZG9jLmFkZEV2ZW50TGlzdGVuZXIgPyAnYWRkRXZlbnRMaXN0ZW5lcicgOiAnYXR0YWNoRXZlbnQnLFxuXHRyZW0gPSBkb2MuYWRkRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCcsXG5cdHByZSA9IGRvYy5hZGRFdmVudExpc3RlbmVyID8gJycgOiAnb24nLFxuIFxuXHRpbml0ID0gZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnR5cGUgPT09ICdyZWFkeXN0YXRlY2hhbmdlJyAmJiBkb2MucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQoZS50eXBlID09PSAnbG9hZCcgPyB3aW4gOiBkb2MpW3JlbV0ocHJlICsgZS50eXBlLCBpbml0LCBmYWxzZSk7XG5cdFx0aWYgKCFkb25lICYmIChkb25lID0gdHJ1ZSkpIHtcblx0XHRcdGZuLmNhbGwod2luLCBlLnR5cGUgfHwgZSk7XG5cdFx0fVxuXHR9LFxuIFxuXHRwb2xsID0gZnVuY3Rpb24oKSB7XG5cdFx0dHJ5IHsgcm9vdC5kb1Njcm9sbCgnbGVmdCcpOyB9IGNhdGNoKGUpIHsgc2V0VGltZW91dChwb2xsLCA1MCk7IHJldHVybjsgfVxuXHRcdGluaXQoJ3BvbGwnKTtcblx0fTtcbiBcblx0aWYgKGRvYy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG5cdFx0Zm4uY2FsbCh3aW4sICdsYXp5Jyk7XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGRvYy5jcmVhdGVFdmVudE9iamVjdCAmJiByb290LmRvU2Nyb2xsKSB7XG5cdFx0XHR0cnkgeyB0b3AgPSAhd2luLmZyYW1lRWxlbWVudDsgfSBjYXRjaChlKSB7IH1cblx0XHRcdGlmICh0b3ApIHtcblx0XHRcdFx0cG9sbCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRkb2NbYWRkXShwcmUgKyAnRE9NQ29udGVudExvYWRlZCcsIGluaXQsIGZhbHNlKTtcblx0XHRkb2NbYWRkXShwcmUgKyAncmVhZHlzdGF0ZWNoYW5nZScsIGluaXQsIGZhbHNlKTtcblx0XHR3aW5bYWRkXShwcmUgKyAnbG9hZCcsIGluaXQsIGZhbHNlKTtcblx0fVxuIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnRlbnRMb2FkZWQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdG9IeXBoZW5EZWxpbWl0ZWQgPSByZXF1aXJlKCcuLi91dGlscy90b0h5cGhlbkRlbGltaXRlZCcpO1xuXG5mdW5jdGlvbiBhZGRQcmVmaXhUb0NsYXNzTmFtZSAocHJlZml4LCBjbGFzc05hbWUpIHtcblx0cmV0dXJuIHByZWZpeCArICctJyArIHRvSHlwaGVuRGVsaW1pdGVkKGNsYXNzTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyAocHJlZml4LCBjbGFzc1N0cmluZykge1xuXHRyZXR1cm4gY2xhc3NTdHJpbmcuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuXHRcdHJldHVybiBhZGRQcmVmaXhUb0NsYXNzTmFtZShwcmVmaXgsIGNsYXNzTmFtZSk7XG5cdH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3NQcmVmaXhUb05vZGUgKG5vZGUsIGRpc3BsYXlOYW1lLCBfaXNDaGlsZCkge1x0XHRcblx0aWYgKCFub2RlIHx8ICFub2RlLnByb3BzKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIHByb3BzID0gbm9kZS5wcm9wcyxcblx0XHRwcmVmaXggPSAncmVhY3QtJyArIHRvSHlwaGVuRGVsaW1pdGVkKGRpc3BsYXlOYW1lKTtcblxuXHRpZiAocHJvcHMuY2xhc3MpIHtcblx0XHQvLyBwcmVjb21wdXRlIGNsYXNzIG5hbWVzXG5cdFx0cHJvcHMuY2xhc3MgPSBwcm9wcy5jbGFzcy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG5cdFx0XHQvLyByZXBsYWNlIHN0YXRlIHNob3J0aGFuZFxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lLnJlcGxhY2UoL15cXDpcXDpcXDovLCAnc3RhdGUtJyk7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lO1xuXHRcdH0pLmpvaW4oJyAnKTtcblx0fVxuXG5cdC8vIG1vZGlmeSBjbGFzcyBzdHJpbmdzXG5cdGlmIChwcm9wcy5jbGFzcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzcyA9IFsncmVhY3QtdmlldycsIHByZWZpeCwgYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3MpXS5qb2luKCcgJyk7XG5cdH0gZWxzZSBpZiAocHJvcHMuY2xhc3MgJiYgX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzcyA9IGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyhwcmVmaXgsIHByb3BzLmNsYXNzKTtcblx0fSBlbHNlIGlmICghcHJvcHMuY2xhc3MgJiYgIV9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3MgPSAncmVhY3QtdmlldyAnICsgcHJlZml4O1xuXHR9XG5cblx0Ly8gYWRkIHRvIGNsYXNzTmFtZVxuXHRpZiAocHJvcHMuY2xhc3NOYW1lICYmIHByb3BzLmNsYXNzKSB7XG5cdFx0cHJvcHMuY2xhc3NOYW1lICs9ICcgJyArIHByb3BzLmNsYXNzO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3MpIHtcblx0XHRwcm9wcy5jbGFzc05hbWUgPSBwcm9wcy5jbGFzcztcblx0fVxuXHRkZWxldGUgcHJvcHMuY2xhc3M7XG5cblx0aWYgKHR5cGVvZiBwcm9wcy5jaGlsZHJlbiA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0cmF2ZXJzZSBjaGlsZHJlblxuXHRpZiAoQXJyYXkuaXNBcnJheShwcm9wcy5jaGlsZHJlbikpIHtcblx0XHRwcm9wcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShub2RlLCBkaXNwbGF5TmFtZSwgdHJ1ZSk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAocHJvcHMuY2hpbGRyZW4gJiYgcHJvcHMuY2hpbGRyZW4uX3N0b3JlKSB7XG5cdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUocHJvcHMuY2hpbGRyZW4sIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0fVxufVxuXG5leHBvcnRzLmFkZENsYXNzUHJlZml4VG9Ob2RlID0gYWRkQ2xhc3NQcmVmaXhUb05vZGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgWE1MSHR0cEZhY3RvcmllcyA9IFtcbiAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTt9LFxuICAgIGZ1bmN0aW9uICgpIHtyZXR1cm4gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpO30sXG4gICAgZnVuY3Rpb24gKCkge3JldHVybiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoJ01zeG1sMy5YTUxIVFRQJyk7fSxcbiAgICBmdW5jdGlvbiAoKSB7cmV0dXJuIG5ldyB3aW5kb3cuQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTt9XG5dO1xuXG5mdW5jdGlvbiBjcmVhdGVYTUxIVFRQT2JqZWN0KCkge1xuICAgIHZhciB4bWxodHRwID0gZmFsc2U7XG4gICAgZm9yICh2YXIgaT0wO2k8WE1MSHR0cEZhY3Rvcmllcy5sZW5ndGg7aSsrKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB4bWxodHRwID0gWE1MSHR0cEZhY3Rvcmllc1tpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHhtbGh0dHA7XG59XG5cbmZ1bmN0aW9uIHNlbmRSZXF1ZXN0KHVybCxjYWxsYmFjayxwb3N0RGF0YSkge1xuICAgIHZhciByZXEgPSBjcmVhdGVYTUxIVFRQT2JqZWN0KCk7XG4gICAgaWYgKCFyZXEpIHtcbiAgICBcdHJldHVybjtcbiAgICB9XG4gICAgdmFyIG1ldGhvZCA9IChwb3N0RGF0YSkgPyAnUE9TVCcgOiAnR0VUJztcbiAgICByZXEub3BlbihtZXRob2QsdXJsLHRydWUpO1xuICAgIGlmIChwb3N0RGF0YSkge1xuICAgICAgICByZXEuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgfVxuICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgICBcdHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVxLnN0YXR1cyAhPT0gMjAwICYmIHJlcS5zdGF0dXMgIT09IDMwNCkge1xuLy8gICAgICAgICAgYWxlcnQoJ0hUVFAgZXJyb3IgJyArIHJlcS5zdGF0dXMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKHJlcSk7XG4gICAgfTtcblxuICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgIFx0cmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICByZXEuc2VuZChwb3N0RGF0YSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2VuZFJlcXVlc3Q7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3R5bGUgPSByZXF1aXJlKCcuLi9zdHlsZScpO1xuXG52YXIgZWxlbWVudCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuXHRyZWFkeSA9IGZhbHNlLFxuXHR3cml0ZVRpbWVvdXQgPSBudWxsLFxuXHRmaXJzdFJ1biA9IHRydWUsXG5cdHN0eWxlcyA9IFtdLFxuXHR3cml0ZVF1ZXVlID0gW10sXG5cdHN0eWxlSWRlbmZpZXJzID0gW107XG5cbmZ1bmN0aW9uIGdldFN0eWxlc2hlZXRPYmplY3RGb3JJbnN0YW5jZSAoKSB7XG5cdHZhciBzdHlsZXNoZWV0ID0gZmFsc2U7XG5cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB3aW5kb3cuZG9jdW1lbnQuc3R5bGVTaGVldHMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoKHdpbmRvdy5kb2N1bWVudC5zdHlsZVNoZWV0c1tpXS5vd25lck5vZGUgfHwgd2luZG93LmRvY3VtZW50LnN0eWxlU2hlZXRzW2ldLm93bmluZ0VsZW1lbnQpID09PSBlbGVtZW50KVx0e1xuXHRcdFx0c3R5bGVzaGVldCA9IHdpbmRvdy5kb2N1bWVudC5zdHlsZVNoZWV0c1tpXTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzdHlsZXNoZWV0O1xufVxuXG5mdW5jdGlvbiBjaGVja0lmU3R5bGVzaGVldElzUmVhZHkgKGNhbGxiYWNrKSB7XG5cdHZhciBzdHlsZSA9IGdldFN0eWxlc2hlZXRPYmplY3RGb3JJbnN0YW5jZSgpO1xuXG5cdC8vIGNoZWNrIGlmIHRoZSBzdHlsZXNoZWV0IGlzIHByb2Nlc3NlZCBhbmQgcmVhZHlcblx0dHJ5IHtcblx0XHRpZiAoc3R5bGUgJiYgc3R5bGUucnVsZXMgJiYgc3R5bGUucnVsZXMubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJlYWR5ID0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKHN0eWxlICYmIHN0eWxlLmNzc1J1bGVzICYmIHN0eWxlLnJ1bGVzLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZWFkeSA9IHRydWU7XG5cdFx0fVxuXHR9IGNhdGNoIChlKSB7fVxuXG5cdC8vIHdyaXRlIGh0bWwgaWYgd2UgYXJlIHJlYWxseSByZWFkeVxuXHRpZiAocmVhZHkpIHtcblx0XHRpZiAoY2FsbGJhY2spIHtcblx0XHRcdHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdGNoZWNrSWZTdHlsZXNoZWV0SXNSZWFkeShjYWxsYmFjayk7XG5cdH0sIDApO1xufVxuXG5mdW5jdGlvbiB3cml0ZVJ1bGVzRm9yU3R5bGVzIChzdHlsZXMpIHtcblx0dmFyIHN0eWxlc2hlZXRUZXh0ID0gJyc7XG5cblx0Zm9yICh2YXIgc3R5bGUgaW4gc3R5bGVzKSB7XG5cdFx0c3R5bGVzaGVldFRleHQgKz0gJ1xcbi8qIFN0eWxlcyBmb3IgJyArIHN0eWxlc1tzdHlsZV0uZGlzcGxheU5hbWUgKyAnIGNvbXBvbmVudCAqL1xcbic7XG5cdFx0c3R5bGVzaGVldFRleHQgKz0gc3R5bGVzW3N0eWxlXS50b1N0cmluZygpO1xuXHR9XG5cdFxuXHRlbGVtZW50LmlubmVySFRNTCArPSBzdHlsZXNoZWV0VGV4dDtcbn1cblxuZnVuY3Rpb24gYWRkU3R5bGUgKHN0eWxlKSB7XG5cdGlmIChzdHlsZUlkZW5maWVycy5pbmRleE9mKHN0eWxlLmRpc3BsYXlOYW1lKSA+PSAwKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0c3R5bGVzLnB1c2goc3R5bGUpO1xuXHR3cml0ZVF1ZXVlLnB1c2goc3R5bGUpO1xuXHRzdHlsZUlkZW5maWVycy5wdXNoKHN0eWxlLmRpc3BsYXlOYW1lKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVTdHlsZXMgKCkge1xuXHRpZiAoZmlyc3RSdW4gJiYgcmVhZHkpIHtcblx0XHRyZXR1cm4gd3JpdGVSdWxlc0ZvclN0eWxlcyh3cml0ZVF1ZXVlLnNwbGljZSgwKSk7XG5cdH1cblxuXHRjbGVhclRpbWVvdXQod3JpdGVUaW1lb3V0KTtcblxuXHR3cml0ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHR3cml0ZVJ1bGVzRm9yU3R5bGVzKHdyaXRlUXVldWUuc3BsaWNlKDApKTtcblx0fSwgMCk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0eWxlIChkaXNwbGF5TmFtZSwgc3R5bGUpIHtcblx0YWRkU3R5bGUobmV3IFN0eWxlKHN0eWxlLCBkaXNwbGF5TmFtZSkpO1xuXHR3cml0ZVN0eWxlcygpO1xufVxuXG4vLyBpbml0aWFsaXphdGlvblxuKGZ1bmN0aW9uICgpIHtcblx0Ly8gYXBwZW5kIG91ciBzdHlsZXNoZWV0IHRvIHRoZSBoZWFkXG5cdHdpbmRvdy5kb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuXG5cdC8vIHRyYWNrIHRoZSBmaXJzdCBldmVudCBsb29wXG5cdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdGZpcnN0UnVuID0gZmFsc2U7XG5cdH0sIDApO1xuXG5cdC8vIGNoZWNrIHRoZSBET00gZm9yIHRoZSBzdHlsZXNoZWV0XG5cdGNoZWNrSWZTdHlsZXNoZWV0SXNSZWFkeShmdW5jdGlvbiAoKSB7XG5cdFx0d3JpdGVTdHlsZXMoKTtcblx0fSk7XG59KSgpO1xuXG5leHBvcnRzLmNyZWF0ZVN0eWxlID0gY3JlYXRlU3R5bGU7XG5leHBvcnRzLmFkZFN0eWxlID0gYWRkU3R5bGU7XG5leHBvcnRzLndyaXRlU3R5bGVzID0gd3JpdGVTdHlsZXM7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3QsXG5cdFN0eWxlID0gcmVxdWlyZSgnLi4vc3R5bGUnKSxcblx0U3R5bGVTaGVldCA9IHJlcXVpcmUoJy4vc3R5bGVzaGVldCcpLFxuXHRET00gPSByZXF1aXJlKCcuL2RvbScpLFxuXHRQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vcHJvcGVydGllcycpLFxuXHRQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXInKSxcblx0Y29udGVudExvYWRlZCA9IHJlcXVpcmUoJy4vY29udGVudExvYWRlZCcpLFxuXHRzZW5kUmVxdWVzdCA9IHJlcXVpcmUoJy4vc2VuZFJlcXVlc3QnKTtcblxuLy8gaW5pdGlhbGl6ZXMgUmVhY3RTdHlsZSwgbWFpbmx5IHVzZWQgZm9yIGFkZGluZyBtaXhpbnNcbmlmICh0eXBlb2Ygd2luZG93LlJDU1Byb3BlcnRpZXNJbml0ICE9PSAndW5kZWZpbmVkJykge1xuXHR3aW5kb3cuUkNTUHJvcGVydGllc0luaXQoUHJvcGVydGllcyk7XG59XG5cbmlmICh0eXBlb2YgUmVhY3QgIT09ICd1bmRlZmluZWQnKSB7XG5cdFJlYWN0LmNyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uIChjcmVhdGVDbGFzcykge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoc3BlYykge1xuXHRcdFx0aWYgKHNwZWMuc3R5bGUpIHtcblx0XHRcdFx0U3R5bGVTaGVldC5hZGRTdHlsZShuZXcgU3R5bGUoc3BlYy5kaXNwbGF5TmFtZSwgc3BlYy5zdHlsZSkpO1xuXHRcdFx0XHRTdHlsZVNoZWV0LndyaXRlU3R5bGVzKCk7XG5cblx0XHRcdFx0ZGVsZXRlIHNwZWMuc3R5bGU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZW5kZXIgPSBzcGVjLnJlbmRlcjtcblx0XHRcdHNwZWMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgbm9kZSA9IHJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRET00uYWRkQ2xhc3NQcmVmaXhUb05vZGUobm9kZSwgc3BlYy5kaXNwbGF5TmFtZSk7XG5cdFx0XHRcdHJldHVybiBub2RlO1xuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIGNyZWF0ZUNsYXNzKHNwZWMpO1xuXHRcdH07XG5cdH0pKFJlYWN0LmNyZWF0ZUNsYXNzKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1JDU1NvdXJjZSAoc291cmNlLCBuYW1lKSB7XG5cdHZhciBjc3MgPSAnJztcblx0dmFyIHJjcyA9IFBhcnNlci5wYXJzZVJDUyhzb3VyY2UpO1xuXG5cdGZvciAodmFyIHNlbGVjdG9yIGluIHJjcykge1xuXHRcdGlmIChzZWxlY3Rvci5tYXRjaCgvXFxAY29tcG9uZW50LykpIHtcblx0XHRcdHZhciBjb21wb25lbnROYW1lID0gc2VsZWN0b3IubWF0Y2goL0Bjb21wb25lbnQgKC4rKS8pWzFdO1xuXHRcdFx0dmFyIHN0eWxlID0gbmV3IFN0eWxlKGNvbXBvbmVudE5hbWUsIHJjc1tzZWxlY3Rvcl0pO1xuXHRcdFx0Y3NzICs9ICcvKiBTdHlsZSBmb3IgY29tcG9uZW50ICcgKyBjb21wb25lbnROYW1lICsgJyAqL1xcbic7XG5cdFx0XHRjc3MgKz0gc3R5bGUudG9TdHJpbmcoKSArICdcXG5cXG4nO1xuXHRcdFx0ZGVsZXRlIHJjc1tzZWxlY3Rvcl07XG5cdFx0fVxuXHR9XG5cblx0aWYgKG5hbWUpIHtcblx0XHRjc3MgKz0gbmV3IFN0eWxlKG5hbWUsIHJjcyk7XG5cdH1cblxuXHRyZXR1cm4gY3NzLnRyaW0oKTtcbn1cblxuLy8gcHJvY2VzcyBodG1sXG5jb250ZW50TG9hZGVkKHdpbmRvdywgZnVuY3Rpb24gKCkge1xuXHQvLyByZXBsYWNlIHJjcyBzdHlsZSB0YWdzXG5cdHZhciByY3NTdHlsZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzdHlsZVt0eXBlPVwidGV4dC9yY3NcIl0nKSk7XG5cdHJjc1N0eWxlcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHlsZSkge1xuXHRcdHZhciBuYW1lID0gc3R5bGUuZ2V0QXR0cmlidXRlKCdjb21wb25lbnQnKTtcblx0XHR2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG5cdFx0ZWxlbWVudC5pbm5lckhUTUwgPSBwcm9jZXNzUkNTU291cmNlKHN0eWxlLmlubmVySFRNTCwgbmFtZSk7XG5cdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcblx0XHRpZiAobmFtZSkge1xuXHRcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2NvbXBvbmVudCcsIG5hbWUpO1xuXHRcdH1cblxuXHRcdHN0eWxlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQsIHN0eWxlKTtcblx0fSk7XG5cblx0Ly8gcmVwbGFjZSByY3MgbGluayB0YWdzXG5cdHZhciByY3NMaW5rcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpbmtbcmVsPVwic3R5bGVzaGVldC9yY3NcIl1bdHlwZT1cInRleHQvY3NzXCJdJykpO1xuXHRyY3NMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uIChsaW5rKSB7XG5cdFx0dmFyIG5hbWUgPSBsaW5rLmdldEF0dHJpYnV0ZSgnY29tcG9uZW50Jyk7XG5cblx0XHRzZW5kUmVxdWVzdChsaW5rLmdldEF0dHJpYnV0ZSgnaHJlZicpLCBmdW5jdGlvbiAocmVxdWVzdCkge1xuXHRcdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXHRcdFx0ZWxlbWVudC5pbm5lckhUTUwgPSBwcm9jZXNzUkNTU291cmNlKHJlcXVlc3QucmVzcG9uc2VUZXh0LCBuYW1lKTtcblx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG5cdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZSgnY29tcG9uZW50JywgbmFtZSk7XG5cdFx0XHR9XG5cdFx0XHRsaW5rLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQsIGxpbmspO1xuXHRcdH0pO1xuXHR9KTtcbn0pO1xuXG5leHBvcnRzLlN0eWxlID0gU3R5bGU7XG5leHBvcnRzLlN0eWxlU2hlZXQgPSBTdHlsZVNoZWV0O1xuZXhwb3J0cy5Qcm9wZXJ0aWVzID0gUHJvcGVydGllcztcbmV4cG9ydHMuUGFyc2VyID0gUGFyc2VyOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYXJzZXMgYSBSQ1Mgc3RyaW5nIHRvIGEgSlNPTiBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlUkNTIChyY3MpIHtcblx0dmFyIG9yaWdpbmFsID0gcmNzO1xuXG5cdHJjcyA9ICd7XFxuJyArIHJjcyArICdcXG59Jztcblx0XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG5cblx0Ly8gc3RyaXAgY29tbWVudHNcblx0cmNzID0gcmNzLnJlcGxhY2UoL15bXFx0XStcXC9cXC8uKyQvZ2ltLCAnJyk7XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC9cXC9cXCpbXFxTXFxzXSo/XFwqXFwvL2dpbSwgJycpO1xuXG5cdC8vIGFkZCBxdW90ZXNcblx0cmNzID0gcmNzLnJlcGxhY2UoLyhbXFxAYS16MC05LS46XVthLXowLTktLjpcXHNdKikoPzpcXHMrKT86XFxzKiguKyk7L2dpLCAnXCIkMVwiOiBcIiQyXCI7Jyk7XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC8oW1xcQGEtejAtOS0uOl1bYS16MC05JS0uOlxcc1xcW1xcXVxcPVxcJ1xcXCIsXSo/KSg/OlxccyopKFtcXHtcXFtdKS9naSwgJ1wiJDFcIjogJDInKTtcblxuXHQvLyByZW1vdmUgdW5uZXNzYXJ5IHdoaXRlIHNwYWNlc1xuXHQvL3JjcyA9IHJjcy5yZXBsYWNlKC9cXG58XFx0L2csICcnKTtcblxuXHQvLyBkZWZhdWx0IG51bWJlciB2YWx1ZXMgdG8gcGl4ZWxzXG5cdC8vcmNzID0gcmNzLnJlcGxhY2UoLyhcXGQrKSg/IVxcZCkoPyElfHB4KS9naSwgJyQxcHgnKTtcblxuXHQvLyBhZGQgY29tbWFzXG5cdHJjcyA9IHJjcy5yZXBsYWNlKC9cXH0oPyFcXHMqW1xcfVxcXV18JCkvZywgJ30sJyk7XG5cdHJjcyA9IHJjcy5yZXBsYWNlKC87KD8hXFxzKltcXH1cXF1dKS9nLCAnLCcpO1xuXHRyY3MgPSByY3MucmVwbGFjZSgvOyg/PVxccypbXFx9XFxdXSkvZywgJycpO1xuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIEpTT04ucGFyc2UocmNzKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0lzc3VlIFBhcnNpbmcgUkNTOiBcXG5vcmlnaW5hbDpcXG4nICsgb3JpZ2luYWwgKyAnXFxuXFxubWFsZm9ybWVkOlxcbicgKyByY3MpO1xuXHR9XG59XG5cbmV4cG9ydHMucGFyc2VSQ1MgPSBwYXJzZVJDUzsiLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWFuYWdlcyBjc3MgcHJvcGVydHkvdmFsdWUgdHJhbnNmb3Jtcy5cbiAqL1xudmFyIHByb3BlcnR5VHJhbnNmb3JtcyA9IFtdLFxuXHRwcmVmaXhlZFByb3BlcnRpZXMgPSBbXSxcblx0YmFzZVVybCA9ICcnO1xuXG5mdW5jdGlvbiByZWdpc3RlclByb3BlcnR5IChwcm9wZXJ0eSwgdHJhbnNmb3JtKSB7XG5cdHByb3BlcnR5VHJhbnNmb3Jtcy5wdXNoKHtwcm9wZXJ0eTogcHJvcGVydHksIG1ldGhvZDogdHJhbnNmb3JtfSk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXMgKHByb3BlcnRpZXMpIHtcblx0cHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdHByZWZpeGVkUHJvcGVydGllc1twcm9wZXJ0eV0gPSB0cnVlO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gc3RhbmRhcmRUcmFuc2Zvcm0gKG5hbWUsIHZhbHVlKSB7XG5cdHJldHVybiBbXG5cdFx0e25hbWU6ICctd2Via2l0LScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW1zLScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW1vei0nICsgbmFtZSwgdmFsdWU6IHZhbHVlfSxcblx0XHR7bmFtZTogJy1vLScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9XG5cdF07XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybSAobmFtZSwgdmFsdWUpIHtcblx0dmFyIHJlc3VsdHMgPSBbXTtcblxuXHRwcm9wZXJ0eVRyYW5zZm9ybXMuZm9yRWFjaChmdW5jdGlvbiAodHJhbnNmb3JtKSB7XG5cdFx0aWYgKHRyYW5zZm9ybS5wcm9wZXJ0eSAhPT0gbmFtZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB0cmFuc2Zvcm1zID0gdHJhbnNmb3JtLm1ldGhvZChuYW1lLCB2YWx1ZSk7XG5cdFx0XG5cdFx0aWYgKHRyYW5zZm9ybXMpIHtcblx0XHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh0cmFuc2Zvcm1zKTtcblx0XHR9XG5cdH0pO1xuXG5cdGlmICghcmVzdWx0cy5sZW5ndGgpIHtcblx0XHRpZiAocHJlZml4ZWRQcm9wZXJ0aWVzW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gc3RhbmRhcmRUcmFuc2Zvcm0obmFtZSwgdmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufVxuXG4vLyByZWdpc3RlciBkZWZhdWx0c1xucmVnaXN0ZXJQcm9wZXJ0eSgnYmFja2dyb3VuZCcsIGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuXHR2YXIgbWF0Y2hlcyA9IHZhbHVlLm1hdGNoKC91cmxcXChbJ1wiXSooLis/KVsnXCJdKlxcKS8pO1xuXHRcblx0aWYgKCFtYXRjaGVzIHx8ICFiYXNlVXJsKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIHVybCA9IG1hdGNoZXNbMV0sXG5cdFx0bmV3VXJsID0gYmFzZVVybCArIHVybDtcblxuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IG5hbWUsXG5cdFx0dmFsdWU6IHZhbHVlLnJlcGxhY2UodXJsLCBuZXdVcmwpXG5cdH07XG59KTtcblxuZXhwb3J0cy5zZXRCYXNlVXJsID0gIGZ1bmN0aW9uICh1cmwpIHtcblx0YmFzZVVybCA9IHVybDtcbn07XG5leHBvcnRzLnRyYW5zZm9ybSA9IHRyYW5zZm9ybTtcbmV4cG9ydHMucmVnaXN0ZXJQcm9wZXJ0eSA9IHJlZ2lzdGVyUHJvcGVydHk7XG5leHBvcnRzLnJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXMgPSByZWdpc3RlclN0YW5kYXJkUHJlZml4ZWRQcm9wZXJ0aWVzOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL3Byb3BlcnRpZXMnKSxcblx0UGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXInKSxcblx0dG9IeXBoZW5EZWxpbWl0ZWQgPSByZXF1aXJlKCcuL3V0aWxzL3RvSHlwaGVuRGVsaW1pdGVkJyk7XG5cbi8qKlxuICogTWFuYWdlcyBjc3MgcHJvcGVydHkvdmFsdWUgdHJhbnNmb3Jtcy5cbiAqL1xuZnVuY3Rpb24gU3R5bGUgKGRpc3BsYXlOYW1lLCBzdHlsZSwgb3B0aW9ucykge1xuXHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XG5cdHRoaXMuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZTtcblxuXHR0aGlzLl9wcmVmaXggPSAncmVhY3QtJyArIHRvSHlwaGVuRGVsaW1pdGVkKGRpc3BsYXlOYW1lKSArICctJztcblx0XG5cdHRoaXMuX3NlbGVjdG9yUHJlZml4ID0gJy5yZWFjdC12aWV3LicgKyB0aGlzLl9wcmVmaXguc3Vic3RyKDAsIHRoaXMuX3ByZWZpeC5sZW5ndGgtMSkgKyAnICc7XG5cblx0dGhpcy5ydWxlcyA9IHt9O1xuXHR0aGlzLmFuaW1hdGlvbnMgPSB7fTtcblx0dGhpcy5pbnN0YW5jZVJ1bGVzID0ge307XG5cdHRoaXMubWVkaWFRdWVyaWVzID0ge307XG5cblx0dGhpcy5wYXJzZVN0eWxlKHN0eWxlKTtcbn1cblxuU3R5bGUucHJvdG90eXBlID0ge1xuXHRJTlRfUFJPUEVSVElFUzogWyd6LWluZGV4JywgJ29wYWNpdHknXSxcblxuXHRwYXJzZVN0eWxlOiBmdW5jdGlvbiAoc3R5bGUpIHtcblx0XHR2YXIgcnVsZXM7XG5cdFx0XG5cdFx0aWYgKHR5cGVvZiBzdHlsZSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdHJ1bGVzID0gc3R5bGU7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHR0cnkge1xuXG5cdFx0XHRcdHJ1bGVzID0gUGFyc2VyLnBhcnNlUkNTKHN0eWxlKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcignUGFyc2luZyBjb21wb25lbnQgJyArIHRoaXMuZGlzcGxheU5hbWUgKyAnXFxuJyArIGVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9hZGRSdWxlcyhydWxlcyk7XG5cdH0sXG5cblx0X2FkZFJ1bGVzOiBmdW5jdGlvbiAocnVsZXMpIHtcblx0XHQvLyB0cmF2ZXJzZSBhcmd1bWVudHMgYW5kIHJ1biBhZGRSdWxlIG9uIGVhY2ggaXRlbVxuXHRcdGZvciAodmFyIHJ1bGUgaW4gcnVsZXMpIHtcblx0XHRcdHZhciBydWxlc0J1ZmZlciA9IHtydWxlczoge30sIGFuaW1hdGlvbnM6IHt9fTtcblxuXHRcdFx0aWYgKHJ1bGUubWF0Y2goL15AbWVkaWEvKSkge1x0XG5cdFx0XHRcdGZvciAodmFyIG1lZGlhUnVsZSBpbiBydWxlc1tydWxlXSkge1xuXHRcdFx0XHRcdHRoaXMuX2FkZFJ1bGUobWVkaWFSdWxlLCBydWxlc1tydWxlXVttZWRpYVJ1bGVdLCBydWxlc0J1ZmZlcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLm1lZGlhUXVlcmllc1tydWxlXSA9IHJ1bGVzQnVmZmVyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fYWRkUnVsZShydWxlLCBydWxlc1tydWxlXSwgcnVsZXNCdWZmZXIpO1xuXG5cdFx0XHRcdHZhciBidWZmZXJSdWxlc0tleXMgPSBPYmplY3Qua2V5cyhydWxlc0J1ZmZlci5ydWxlcyk7XG5cdFx0XHRcdGJ1ZmZlclJ1bGVzS2V5cy5zb3J0KCk7XG5cdFx0XHRcdGJ1ZmZlclJ1bGVzS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHR0aGlzLnJ1bGVzW2tleV0gPSBydWxlc0J1ZmZlci5ydWxlc1trZXldO1xuXHRcdFx0XHR9LCB0aGlzKTtcblx0XHRcdFx0Zm9yICh2YXIgYW5pbWF0aW9uIGluIHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnMpIHtcblx0XHRcdFx0XHR0aGlzLmFuaW1hdGlvbnNbYW5pbWF0aW9uXSA9IHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnNbYW5pbWF0aW9uXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRfYWRkUnVsZTogZnVuY3Rpb24gKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlciwgX3JlY3Vyc2l2ZSkge1xuXHRcdGlmIChzZWxlY3Rvci5tYXRjaCgvXkBrZXlmcmFtZXMvKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FkZEtleWZyYW1lQW5pbWF0aW9uKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlcik7XG5cdFx0fVxuXG5cdFx0aWYgKHNlbGVjdG9yLnN1YnN0cigwLCAzKSA9PT0gJzo6OicpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hZGRSdWxlKHRoaXMuX3Jlc29sdmVTdGF0ZVdpdGhTZWxlY3RvcihzZWxlY3RvciksIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHR9IGVsc2UgaWYgKHNlbGVjdG9yLm1hdGNoKC9eXFw6XFw6P1thLXpdLykpIHtcblx0XHRcdHNlbGVjdG9yID0gdGhpcy5fc2VsZWN0b3JQcmVmaXguc2xpY2UoMCwgLTEpICsgc2VsZWN0b3I7XG5cblx0XHRcdHJldHVybiB0aGlzLl9hZGRSdWxlKHNlbGVjdG9yLCBwcm9wZXJ0aWVzLCBydWxlc0J1ZmZlciwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0Ly8gcHJvcGVybHkgcHJvY2VzcyB0aGUgc2VsZWN0b3Jcblx0XHR2YXIgc2VsZWN0b3JzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcblx0XHRpZiAoc2VsZWN0b3JzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHNlbGVjdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFJ1bGUoaXRlbS50cmltKCksIHByb3BlcnRpZXMsIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3RvciA9IHRoaXMuX3Jlc29sdmVTZWxlY3RvcihzZWxlY3Rvcik7XG5cdFx0fVxuXG5cdFx0Ly8gdHJhY2sgYWx0ZXJlZCBwcm9wZXJ0aWVzXG5cdFx0dmFyIF9wcm9wZXJ0aWVzID0gcnVsZXNCdWZmZXIucnVsZXNbc2VsZWN0b3JdIHx8IFtdO1xuXG5cdFx0Zm9yICh2YXIgcHJvcGVydHkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0aWYgKHR5cGVvZiBwcm9wZXJ0aWVzW3Byb3BlcnR5XSA9PT0gJ29iamVjdCcpIHtcblx0XHQgXHRcdGlmIChwcm9wZXJ0eS5zdWJzdHIoMCwgMykgPT09ICc6OjonKSB7XG5cdFx0XHRcdFx0dGhpcy5fYWRkUnVsZSh0aGlzLl9yZXNvbHZlU3RhdGVXaXRoU2VsZWN0b3IocHJvcGVydHksIHNlbGVjdG9yKSwgcHJvcGVydGllc1twcm9wZXJ0eV0sIHJ1bGVzQnVmZmVyLCB0cnVlKTtcblx0XHQgXHRcdH0gZWxzZSB7XG5cdFx0IFx0XHRcdHRoaXMuX2FkZFJ1bGUodGhpcy5fYWRkUGFyZW50U2VsZWN0b3JUb1NlbGVjdG9yKHNlbGVjdG9yLCBwcm9wZXJ0eSksIHByb3BlcnRpZXNbcHJvcGVydHldLCBydWxlc0J1ZmZlciwgdHJ1ZSk7XG5cdFx0IFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgcmVzb2x2ZWQgPSBQcm9wZXJ0aWVzLnRyYW5zZm9ybShwcm9wZXJ0eSwgcHJvcGVydGllc1twcm9wZXJ0eV0pO1xuXHRcdFx0XHRyZXNvbHZlZC5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eS52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRfcHJvcGVydGllcy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFkZCB0byBydWxlc1xuXHRcdHJ1bGVzQnVmZmVyLnJ1bGVzW3NlbGVjdG9yXSA9IF9wcm9wZXJ0aWVzO1xuXG5cdFx0cmV0dXJuIHJ1bGVzQnVmZmVyO1xuXHR9LFxuXG5cdF9yZXNvbHZlU2VsZWN0b3I6IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdGlmICh0aGlzLl9wcmVmaXggIT09ICdyZWFjdC0nKSB7XG5cdFx0XHRpZiAoLyhefFxcc3wsKXZpZXcvLnRlc3Qoc2VsZWN0b3IpKSB7XG5cdFx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3IucmVwbGFjZSgvKF58XFxzfCwpdmlldy9nLCAnJDEucmVhY3Qtdmlldy4nICsgdGhpcy5fcHJlZml4LnN1YnN0cigwLCB0aGlzLl9wcmVmaXgubGVuZ3RoLTEpKTtcblx0XHRcdH0gZWxzZSBpZiAoIXNlbGVjdG9yLm1hdGNoKC8ucmVhY3QtLykgJiYgc2VsZWN0b3IubWF0Y2goL1xcLnxcXCMvKSkge1xuXHRcdFx0XHRzZWxlY3RvciA9IHRoaXMuX3NlbGVjdG9yUHJlZml4ICsgc2VsZWN0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5yZXBsYWNlKG5ldyBSZWdFeHAoJyhbI1xcXFwuXSkoPyFyZWFjdC0pKFthLXowLTlcXFxcLV9dKiknLCAnaWcnKSwgJyQxJyArIHRoaXMuX3ByZWZpeCArICckMicpO1xuXG5cdFx0cmV0dXJuIHNlbGVjdG9yLnRyaW0oKTtcblx0fSxcblxuXHRfcmVzb2x2ZVN0YXRlV2l0aFNlbGVjdG9yOiBmdW5jdGlvbiAoc3RhdGUsIHNlbGVjdG9yKSB7XG5cdFx0c3RhdGUgPSBzdGF0ZS5zdWJzdHIoMyk7XG5cdFx0c2VsZWN0b3IgPSBzZWxlY3RvciB8fCAnJztcblxuXHRcdHZhciB2aWV3U2VsZWN0b3IgPSAnLnJlYWN0LXZpZXcuJyArIHRoaXMuX3ByZWZpeC5zdWJzdHIoMCwgdGhpcy5fcHJlZml4Lmxlbmd0aC0xKTtcblxuXHRcdGlmICghc3RhdGUubWF0Y2goL15yZWFjdC8pKSB7XG5cdFx0XHQvLyBwcmVwZW5kIHdpdGggc3RhdGVcblx0XHRcdHN0YXRlID0gc3RhdGUuc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24gKHN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiAnc3RhdGUtJyArIHN0YXRlO1xuXHRcdFx0fSkuam9pbignLicpO1xuXG5cdFx0XHRpZiAoIXNlbGVjdG9yKSB7XG5cdFx0XHRcdHNlbGVjdG9yICs9IHRoaXMuX3Jlc29sdmVTZWxlY3Rvcih0aGlzLl9zZWxlY3RvclByZWZpeC5zbGljZSgwLCAtMSkgKyAnLicgKyB0aGlzLl9wcmVmaXggKyBzdGF0ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2Uodmlld1NlbGVjdG9yLCB2aWV3U2VsZWN0b3IgKyAnLicgKyB0aGlzLl9wcmVmaXggKyBzdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICghc2VsZWN0b3IpIHtcblx0XHRcdFx0c2VsZWN0b3IgPSB0aGlzLl9yZXNvbHZlU2VsZWN0b3IoJy4nICsgc3RhdGUpICsgJyAnICsgdmlld1NlbGVjdG9yO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2VsZWN0b3IgPSB0aGlzLl9yZXNvbHZlU2VsZWN0b3IoJy4nICsgc3RhdGUpICsgJyAnICsgc2VsZWN0b3I7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNlbGVjdG9yO1xuXHR9LFxuXG5cdF9hZGRQYXJlbnRTZWxlY3RvclRvU2VsZWN0b3I6IGZ1bmN0aW9uIChwYXJlbnQsIHNlbGVjdG9yKSB7XG5cdFx0cmV0dXJuIHNlbGVjdG9yLnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRyZXR1cm4gcGFyZW50ICsgKGl0ZW0uc3Vic3RyKDAsIDEpID09PSAnOicgPyAnJyA6ICcgJykgKyBpdGVtO1xuXHRcdH0pLmpvaW4oJywnKTtcblx0fSxcblxuXHRfYWRkS2V5ZnJhbWVBbmltYXRpb246IGZ1bmN0aW9uIChzZWxlY3RvciwgbGlzdCwgcnVsZXNCdWZmZXIpIHtcblx0XHR2YXIgaWRlbnRpZmllciA9IHNlbGVjdG9yLnJlcGxhY2UoJ0BrZXlmcmFtZXMgJywgJycpLFxuXHRcdFx0a2V5ZnJhbWVzTmFtZSA9ICdrZXlmcmFtZXMnLFxuXHRcdFx0dmFsdWUgPSAnJztcblxuXHRcdGZvciAodmFyIHRpbWUgaW4gbGlzdCkge1xuXHRcdFx0dmFsdWUgKz0gdGltZSArICcgeyc7XG5cblx0XHRcdGZvciAodmFyIHByb3BlcnR5IGluIGxpc3RbdGltZV0pIHtcblx0XHRcdFx0dmFyIHJlc29sdmVkID0gUHJvcGVydGllcy50cmFuc2Zvcm0ocHJvcGVydHksIGxpc3RbdGltZV1bcHJvcGVydHldKTtcblx0XHRcdFx0cmVzb2x2ZWQuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcblx0XHRcdFx0XHR2YWx1ZSArPSBwcm9wZXJ0eS5uYW1lICsgJzogJyArIHByb3BlcnR5LnZhbHVlICsgJzsnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHZhbHVlICs9ICd9Jztcblx0XHR9XG5cblx0XHRydWxlc0J1ZmZlci5hbmltYXRpb25zWydALXdlYmtpdC0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQC1tcy0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQC1tb3otJyArIGtleWZyYW1lc05hbWUgKyAnICcgKyBpZGVudGlmaWVyXSA9IHZhbHVlO1xuXHRcdHJ1bGVzQnVmZmVyLmFuaW1hdGlvbnNbJ0Atby0nICsga2V5ZnJhbWVzTmFtZSArICcgJyArIGlkZW50aWZpZXJdID0gdmFsdWU7XG5cdFx0cnVsZXNCdWZmZXIuYW5pbWF0aW9uc1snQCcgKyBrZXlmcmFtZXNOYW1lICsgJyAnICsgaWRlbnRpZmllcl0gPSB2YWx1ZTtcblx0fSxcblxuXHR0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBzdHlsZXNoZWV0VGV4dCA9ICcnLFxuXHRcdFx0cnVsZVN0cmluZ3MgPSB0aGlzLnJ1bGVzVG9TdHJpbmdzKHRoaXMucnVsZXMpO1xuXG5cdFx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gcnVsZVN0cmluZ3MpIHtcblx0XHRcdHN0eWxlc2hlZXRUZXh0ICs9IHNlbGVjdG9yICsgJyB7JyArIHJ1bGVTdHJpbmdzW3NlbGVjdG9yXSArICd9XFxuJztcblx0XHR9XG5cblx0XHRmb3IgKHZhciBhbmltYXRpb24gaW4gdGhpcy5hbmltYXRpb25zKSB7XG5cdFx0XHRzdHlsZXNoZWV0VGV4dCArPSBhbmltYXRpb24gKyAnIHsnICsgdGhpcy5hbmltYXRpb25zW2FuaW1hdGlvbl0gKyAnfVxcbic7XG5cdFx0fVxuXG5cdFx0c3R5bGVzaGVldFRleHQgKz0gdGhpcy5tZWRpYVF1ZXJpZXNUb1N0cmluZyh0aGlzLm1lZGlhUXVlcmllcyk7XG5cblx0XHRyZXR1cm4gc3R5bGVzaGVldFRleHQudHJpbSgpO1xuXHR9LFxuXG5cdG1lZGlhUXVlcmllc1RvU3RyaW5nOiBmdW5jdGlvbiAocXVlcmllcykge1xuXHRcdHZhciBzdHJpbmcgPSAnJztcblxuXHRcdGZvciAodmFyIHF1ZXJ5IGluIHF1ZXJpZXMpIHtcblx0XHRcdHZhciBhbmltYXRpb25zID0gcXVlcmllc1txdWVyeV0uYW5pbWF0aW9ucyxcblx0XHRcdFx0cnVsZXMgPSBxdWVyaWVzW3F1ZXJ5XS5ydWxlcztcblxuXHRcdFx0dmFyIHF1ZXJ5U3RyaW5nID0gcXVlcnkgKyAnIHtcXG4nLFxuXHRcdFx0XHRtZWRpYVF1ZXJ5UnVsZVN0cmluZ3MgPSB0aGlzLnJ1bGVzVG9TdHJpbmdzKHJ1bGVzKTtcblxuXHRcdFx0Zm9yICh2YXIgc2VsZWN0b3IgaW4gbWVkaWFRdWVyeVJ1bGVTdHJpbmdzKSB7XG5cdFx0XHRcdHF1ZXJ5U3RyaW5nICs9ICdcXHQnICsgc2VsZWN0b3IgKyAnIHsnICsgbWVkaWFRdWVyeVJ1bGVTdHJpbmdzW3NlbGVjdG9yXSArICd9XFxuJztcblx0XHRcdH1cblxuXHRcdFx0Zm9yICh2YXIgYW5pbWF0aW9uIGluIGFuaW1hdGlvbnMpIHtcblx0XHRcdFx0cXVlcnlTdHJpbmcgKz0gICdcXHQnICsgYW5pbWF0aW9uICsgJyB7JyArIGFuaW1hdGlvbnNbYW5pbWF0aW9uXSArICd9XFxuJztcblx0XHRcdH1cblxuXHRcdFx0cXVlcnlTdHJpbmcgKz0gJ31cXG4nO1xuXG5cdFx0XHRzdHJpbmcgKz0gcXVlcnlTdHJpbmc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHN0cmluZztcblx0fSxcblxuXG5cdHJ1bGVzVG9TdHJpbmdzOiBmdW5jdGlvbiAocnVsZXMpIHtcblx0XHR2YXIgc3RyaW5ncyA9IHt9O1xuXHRcdGZvciAodmFyIHNlbGVjdG9yIGluIHJ1bGVzKSB7XG5cdFx0XHR2YXIgcHJvcGVydGllc1N0cmluZyA9ICcnLFxuXHRcdFx0XHRydWxlID0gcnVsZXNbc2VsZWN0b3JdO1xuXHRcdFx0XG5cdFx0XHRydWxlLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0XHRcdHByb3BlcnRpZXNTdHJpbmcgKz0gcHJvcGVydHkubmFtZSArICc6JyArIHByb3BlcnR5LnZhbHVlICsgJzsnO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICghcHJvcGVydGllc1N0cmluZykge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdHN0cmluZ3Nbc2VsZWN0b3JdID0gcHJvcGVydGllc1N0cmluZztcblx0XHR9XG5cdFx0cmV0dXJuIHN0cmluZ3M7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3R5bGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBDYW1lbENhc2Ugc3RyaW5nIHRvIGEgaHlwaGVuLWRlbGltaXRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvSHlwaGVuRGVsaW1pdGVkIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW2Etel1bQS1aXSkvZywgZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gZ1swXSArICctJyArIGdbMV07XG4gIH0pLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvSHlwaGVuRGVsaW1pdGVkOyJdfQ==
