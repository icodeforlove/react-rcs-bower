/**
 * React Component Styles (RCS) v0.0.3
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('react-rcs/browser');
},{"react-rcs/browser":3}],2:[function(require,module,exports){
'use strict';

var toHyphenDelimited = require('../utils/toHyphenDelimited');

function addPrefixToClassName (prefix, className) {
	return prefix + '_' + toHyphenDelimited(className);
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

	// continue walking the node tree
	if (props.children && props.children !== 'string') {
		traverseDOMTree(displayName, props.children);
	}
}

function traverseDOMTree (displayName, item) {
	if (Array.isArray(item)) {
		item.forEach(function (item) {
			traverseDOMTree(displayName, item);
		});
	} else if (item && item.props) {
		addClassPrefixToNode(item, displayName, true);
	}
}

exports.addClassPrefixToNode = addClassPrefixToNode;
},{"../utils/toHyphenDelimited":6}],3:[function(require,module,exports){
'use strict';

var wrappedCreateClass = require('./wrappedCreateClass');

window.React.RCS = {
	Properties: require('../properties')
};

window.React.createClass = wrappedCreateClass(window.React.createClass);
},{"../properties":5,"./wrappedCreateClass":4}],4:[function(require,module,exports){
var DOM = require('./dom');

var wrappedCreateClass = function (createClass) {
	return function (spec) {
		var render = spec.render;
		spec.render = function () {
			var node = render.apply(this, arguments);
			DOM.addClassPrefixToNode(node, spec.displayName);
			return node;
		};

		return createClass(spec);
	};
};

module.exports = wrappedCreateClass;
},{"./dom":2}],5:[function(require,module,exports){
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
		if (!name.match(transform.property)) {
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

// handle all properties that support url
registerProperty(/^(?:list-style|list-style-image|content|cursor|border-image|border-image-source|background|background-image|src)$/, function (name, value) {
	var matches = value.match(/url\(['"]?(.+?)['"]?\)/);

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
},{}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC1yY3MtYm93ZXIvbGliL3Jjcy5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2RvbS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2luZGV4LmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvd3JhcHBlZENyZWF0ZUNsYXNzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3Byb3BlcnRpZXMuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdyZWFjdC1yY3MvYnJvd3NlcicpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvSHlwaGVuRGVsaW1pdGVkID0gcmVxdWlyZSgnLi4vdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQnKTtcblxuZnVuY3Rpb24gYWRkUHJlZml4VG9DbGFzc05hbWUgKHByZWZpeCwgY2xhc3NOYW1lKSB7XG5cdHJldHVybiBwcmVmaXggKyAnXycgKyB0b0h5cGhlbkRlbGltaXRlZChjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcgKHByZWZpeCwgY2xhc3NTdHJpbmcpIHtcblx0cmV0dXJuIGNsYXNzU3RyaW5nLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRyZXR1cm4gYWRkUHJlZml4VG9DbGFzc05hbWUocHJlZml4LCBjbGFzc05hbWUpO1xuXHR9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzUHJlZml4VG9Ob2RlIChub2RlLCBkaXNwbGF5TmFtZSwgX2lzQ2hpbGQpIHtcdFx0XG5cdGlmICghbm9kZSB8fCAhbm9kZS5wcm9wcykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBwcm9wcyA9IG5vZGUucHJvcHMsXG5cdFx0cHJlZml4ID0gJ3JlYWN0LScgKyB0b0h5cGhlbkRlbGltaXRlZChkaXNwbGF5TmFtZSk7XG5cblx0aWYgKHByb3BzLmNsYXNzZXMpIHtcblx0XHQvLyBwcmVjb21wdXRlIGNsYXNzIG5hbWVzXG5cdFx0cHJvcHMuY2xhc3NlcyA9IHByb3BzLmNsYXNzZXMuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBzdGF0ZSBzaG9ydGhhbmRcblx0XHRcdGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKC9eXFw6XFw6XFw6LywgJ3N0YXRlLScpO1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZTtcblx0XHR9KS5qb2luKCcgJyk7XG5cdH1cblxuXHQvLyBtb2RpZnkgY2xhc3Mgc3RyaW5nc1xuXHRpZiAocHJvcHMuY2xhc3NlcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzc2VzID0gWydyZWFjdC12aWV3JywgcHJlZml4LCBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzc2VzKV0uam9pbignICcpO1xuXHR9IGVsc2UgaWYgKHByb3BzLmNsYXNzZXMgJiYgX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzc2VzID0gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3Nlcyk7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzZXMgJiYgIV9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3NlcyA9ICdyZWFjdC12aWV3ICcgKyBwcmVmaXg7XG5cdH1cblxuXHQvLyBhZGQgdG8gY2xhc3NOYW1lXG5cdGlmIChwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3Nlcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSArPSAnICcgKyBwcm9wcy5jbGFzc2VzO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3Nlcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSA9IHByb3BzLmNsYXNzZXM7XG5cdH1cblx0ZGVsZXRlIHByb3BzLmNsYXNzZXM7XG5cblx0Ly8gY29udGludWUgd2Fsa2luZyB0aGUgbm9kZSB0cmVlXG5cdGlmIChwcm9wcy5jaGlsZHJlbiAmJiBwcm9wcy5jaGlsZHJlbiAhPT0gJ3N0cmluZycpIHtcblx0XHR0cmF2ZXJzZURPTVRyZWUoZGlzcGxheU5hbWUsIHByb3BzLmNoaWxkcmVuKTtcblx0fVxufVxuXG5mdW5jdGlvbiB0cmF2ZXJzZURPTVRyZWUgKGRpc3BsYXlOYW1lLCBpdGVtKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG5cdFx0aXRlbS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHR0cmF2ZXJzZURPTVRyZWUoZGlzcGxheU5hbWUsIGl0ZW0pO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGl0ZW0gJiYgaXRlbS5wcm9wcykge1xuXHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKGl0ZW0sIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0fVxufVxuXG5leHBvcnRzLmFkZENsYXNzUHJlZml4VG9Ob2RlID0gYWRkQ2xhc3NQcmVmaXhUb05vZGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgd3JhcHBlZENyZWF0ZUNsYXNzID0gcmVxdWlyZSgnLi93cmFwcGVkQ3JlYXRlQ2xhc3MnKTtcblxud2luZG93LlJlYWN0LlJDUyA9IHtcblx0UHJvcGVydGllczogcmVxdWlyZSgnLi4vcHJvcGVydGllcycpXG59O1xuXG53aW5kb3cuUmVhY3QuY3JlYXRlQ2xhc3MgPSB3cmFwcGVkQ3JlYXRlQ2xhc3Mod2luZG93LlJlYWN0LmNyZWF0ZUNsYXNzKTsiLCJ2YXIgRE9NID0gcmVxdWlyZSgnLi9kb20nKTtcblxudmFyIHdyYXBwZWRDcmVhdGVDbGFzcyA9IGZ1bmN0aW9uIChjcmVhdGVDbGFzcykge1xuXHRyZXR1cm4gZnVuY3Rpb24gKHNwZWMpIHtcblx0XHR2YXIgcmVuZGVyID0gc3BlYy5yZW5kZXI7XG5cdFx0c3BlYy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgbm9kZSA9IHJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0RE9NLmFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIHNwZWMuZGlzcGxheU5hbWUpO1xuXHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0fTtcblxuXHRcdHJldHVybiBjcmVhdGVDbGFzcyhzcGVjKTtcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcHBlZENyZWF0ZUNsYXNzOyIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBNYW5hZ2VzIGNzcyBwcm9wZXJ0eS92YWx1ZSB0cmFuc2Zvcm1zLlxuICovXG52YXIgcHJvcGVydHlUcmFuc2Zvcm1zID0gW10sXG5cdHByZWZpeGVkUHJvcGVydGllcyA9IFtdLFxuXHRiYXNlVXJsID0gJyc7XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyUHJvcGVydHkgKHByb3BlcnR5LCB0cmFuc2Zvcm0pIHtcblx0cHJvcGVydHlUcmFuc2Zvcm1zLnB1c2goe3Byb3BlcnR5OiBwcm9wZXJ0eSwgbWV0aG9kOiB0cmFuc2Zvcm19KTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTdGFuZGFyZFByZWZpeGVkUHJvcGVydGllcyAocHJvcGVydGllcykge1xuXHRwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0cHJlZml4ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5XSA9IHRydWU7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzdGFuZGFyZFRyYW5zZm9ybSAobmFtZSwgdmFsdWUpIHtcblx0cmV0dXJuIFtcblx0XHR7bmFtZTogJy13ZWJraXQtJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6ICctbXMtJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6ICctbW96LScgKyBuYW1lLCB2YWx1ZTogdmFsdWV9LFxuXHRcdHtuYW1lOiAnLW8tJyArIG5hbWUsIHZhbHVlOiB2YWx1ZX0sXG5cdFx0e25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX1cblx0XTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtIChuYW1lLCB2YWx1ZSkge1xuXHR2YXIgcmVzdWx0cyA9IFtdO1xuXG5cdHByb3BlcnR5VHJhbnNmb3Jtcy5mb3JFYWNoKGZ1bmN0aW9uICh0cmFuc2Zvcm0pIHtcblx0XHRpZiAoIW5hbWUubWF0Y2godHJhbnNmb3JtLnByb3BlcnR5KSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB0cmFuc2Zvcm1zID0gdHJhbnNmb3JtLm1ldGhvZChuYW1lLCB2YWx1ZSk7XG5cdFx0XG5cdFx0aWYgKHRyYW5zZm9ybXMpIHtcblx0XHRcdHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh0cmFuc2Zvcm1zKTtcblx0XHR9XG5cdH0pO1xuXG5cdGlmICghcmVzdWx0cy5sZW5ndGgpIHtcblx0XHRpZiAocHJlZml4ZWRQcm9wZXJ0aWVzW25hbWVdKSB7XG5cdFx0XHRyZXR1cm4gc3RhbmRhcmRUcmFuc2Zvcm0obmFtZSwgdmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRzLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiB2YWx1ZX0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHRzO1xufVxuXG4vLyBoYW5kbGUgYWxsIHByb3BlcnRpZXMgdGhhdCBzdXBwb3J0IHVybFxucmVnaXN0ZXJQcm9wZXJ0eSgvXig/Omxpc3Qtc3R5bGV8bGlzdC1zdHlsZS1pbWFnZXxjb250ZW50fGN1cnNvcnxib3JkZXItaW1hZ2V8Ym9yZGVyLWltYWdlLXNvdXJjZXxiYWNrZ3JvdW5kfGJhY2tncm91bmQtaW1hZ2V8c3JjKSQvLCBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcblx0dmFyIG1hdGNoZXMgPSB2YWx1ZS5tYXRjaCgvdXJsXFwoWydcIl0/KC4rPylbJ1wiXT9cXCkvKTtcblxuXHRpZiAoIW1hdGNoZXMgfHwgIWJhc2VVcmwpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgdXJsID0gbWF0Y2hlc1sxXSxcblx0XHRuZXdVcmwgPSBiYXNlVXJsICsgdXJsO1xuXG5cdHJldHVybiB7XG5cdFx0bmFtZTogbmFtZSxcblx0XHR2YWx1ZTogdmFsdWUucmVwbGFjZSh1cmwsIG5ld1VybClcblx0fTtcbn0pO1xuXG5leHBvcnRzLnNldEJhc2VVcmwgPSAgZnVuY3Rpb24gKHVybCkge1xuXHRiYXNlVXJsID0gdXJsO1xufTtcbmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuZXhwb3J0cy5yZWdpc3RlclByb3BlcnR5ID0gcmVnaXN0ZXJQcm9wZXJ0eTtcbmV4cG9ydHMucmVnaXN0ZXJTdGFuZGFyZFByZWZpeGVkUHJvcGVydGllcyA9IHJlZ2lzdGVyU3RhbmRhcmRQcmVmaXhlZFByb3BlcnRpZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBDYW1lbENhc2Ugc3RyaW5nIHRvIGEgaHlwaGVuLWRlbGltaXRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvSHlwaGVuRGVsaW1pdGVkIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW2Etel1bQS1aXSkvZywgZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gZ1swXSArICctJyArIGdbMV07XG4gIH0pLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvSHlwaGVuRGVsaW1pdGVkOyJdfQ==
