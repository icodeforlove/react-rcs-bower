/**
 * React Component Styles (RCS) v0.0.2
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
},{"../utils/toHyphenDelimited":4}],3:[function(require,module,exports){
'use strict';

var React = window.React,
	DOM = require('./dom');

if (typeof React !== 'undefined') {
	React.createClass = (function (createClass) {
		return function (spec) {
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

},{"./dom":2}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL2xpYi9yY3MuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2RvbS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvaW5kZXguanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy91dGlscy90b0h5cGhlbkRlbGltaXRlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ3JlYWN0LXJjcy9icm93c2VyJyk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdG9IeXBoZW5EZWxpbWl0ZWQgPSByZXF1aXJlKCcuLi91dGlscy90b0h5cGhlbkRlbGltaXRlZCcpO1xuXG5mdW5jdGlvbiBhZGRQcmVmaXhUb0NsYXNzTmFtZSAocHJlZml4LCBjbGFzc05hbWUpIHtcblx0cmV0dXJuIHByZWZpeCArICdfJyArIHRvSHlwaGVuRGVsaW1pdGVkKGNsYXNzTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyAocHJlZml4LCBjbGFzc1N0cmluZykge1xuXHRyZXR1cm4gY2xhc3NTdHJpbmcuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuXHRcdHJldHVybiBhZGRQcmVmaXhUb0NsYXNzTmFtZShwcmVmaXgsIGNsYXNzTmFtZSk7XG5cdH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3NQcmVmaXhUb05vZGUgKG5vZGUsIGRpc3BsYXlOYW1lLCBfaXNDaGlsZCkge1x0XHRcblx0aWYgKCFub2RlIHx8ICFub2RlLnByb3BzKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dmFyIHByb3BzID0gbm9kZS5wcm9wcyxcblx0XHRwcmVmaXggPSAncmVhY3QtJyArIHRvSHlwaGVuRGVsaW1pdGVkKGRpc3BsYXlOYW1lKTtcblxuXHRpZiAocHJvcHMuY2xhc3Nlcykge1xuXHRcdC8vIHByZWNvbXB1dGUgY2xhc3MgbmFtZXNcblx0XHRwcm9wcy5jbGFzc2VzID0gcHJvcHMuY2xhc3Nlcy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG5cdFx0XHQvLyByZXBsYWNlIHN0YXRlIHNob3J0aGFuZFxuXHRcdFx0Y2xhc3NOYW1lID0gY2xhc3NOYW1lLnJlcGxhY2UoL15cXDpcXDpcXDovLCAnc3RhdGUtJyk7XG5cdFx0XHRyZXR1cm4gY2xhc3NOYW1lO1xuXHRcdH0pLmpvaW4oJyAnKTtcblx0fVxuXG5cdC8vIG1vZGlmeSBjbGFzcyBzdHJpbmdzXG5cdGlmIChwcm9wcy5jbGFzc2VzICYmICFfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzZXMgPSBbJ3JlYWN0LXZpZXcnLCBwcmVmaXgsIGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyhwcmVmaXgsIHByb3BzLmNsYXNzZXMpXS5qb2luKCcgJyk7XG5cdH0gZWxzZSBpZiAocHJvcHMuY2xhc3NlcyAmJiBfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzZXMgPSBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzc2VzKTtcblx0fSBlbHNlIGlmICghcHJvcHMuY2xhc3NlcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzc2VzID0gJ3JlYWN0LXZpZXcgJyArIHByZWZpeDtcblx0fVxuXG5cdC8vIGFkZCB0byBjbGFzc05hbWVcblx0aWYgKHByb3BzLmNsYXNzTmFtZSAmJiBwcm9wcy5jbGFzc2VzKSB7XG5cdFx0cHJvcHMuY2xhc3NOYW1lICs9ICcgJyArIHByb3BzLmNsYXNzZXM7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzTmFtZSAmJiBwcm9wcy5jbGFzc2VzKSB7XG5cdFx0cHJvcHMuY2xhc3NOYW1lID0gcHJvcHMuY2xhc3Nlcztcblx0fVxuXHRkZWxldGUgcHJvcHMuY2xhc3NlcztcblxuXHQvLyBjb250aW51ZSB3YWxraW5nIHRoZSBub2RlIHRyZWVcblx0aWYgKHByb3BzLmNoaWxkcmVuICYmIHByb3BzLmNoaWxkcmVuICE9PSAnc3RyaW5nJykge1xuXHRcdHRyYXZlcnNlRE9NVHJlZShkaXNwbGF5TmFtZSwgcHJvcHMuY2hpbGRyZW4pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRyYXZlcnNlRE9NVHJlZSAoZGlzcGxheU5hbWUsIGl0ZW0pIHtcblx0aWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcblx0XHRpdGVtLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHRyYXZlcnNlRE9NVHJlZShkaXNwbGF5TmFtZSwgaXRlbSk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoaXRlbSAmJiBpdGVtLnByb3BzKSB7XG5cdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUoaXRlbSwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHR9XG59XG5cbmV4cG9ydHMuYWRkQ2xhc3NQcmVmaXhUb05vZGUgPSBhZGRDbGFzc1ByZWZpeFRvTm9kZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHdpbmRvdy5SZWFjdCxcblx0RE9NID0gcmVxdWlyZSgnLi9kb20nKTtcblxuaWYgKHR5cGVvZiBSZWFjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0UmVhY3QuY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKGNyZWF0ZUNsYXNzKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChzcGVjKSB7XG5cdFx0XHR2YXIgcmVuZGVyID0gc3BlYy5yZW5kZXI7XG5cdFx0XHRzcGVjLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIG5vZGUgPSByZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0RE9NLmFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIHNwZWMuZGlzcGxheU5hbWUpO1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBjcmVhdGVDbGFzcyhzcGVjKTtcblx0XHR9O1xuXHR9KShSZWFjdC5jcmVhdGVDbGFzcyk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIENhbWVsQ2FzZSBzdHJpbmcgdG8gYSBoeXBoZW4tZGVsaW1pdGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gdG9IeXBoZW5EZWxpbWl0ZWQgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbYS16XVtBLVpdKS9nLCBmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiBnWzBdICsgJy0nICsgZ1sxXTtcbiAgfSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdG9IeXBoZW5EZWxpbWl0ZWQ7Il19
