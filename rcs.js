/**
 * React Component Styles (RCS) v0.0.0
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('react-rcs/browser');
},{"react-rcs/browser":3}],2:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9saWIvcmNzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2RvbS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci9pbmRleC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdyZWFjdC1yY3MvYnJvd3NlcicpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvSHlwaGVuRGVsaW1pdGVkID0gcmVxdWlyZSgnLi4vdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQnKTtcblxuZnVuY3Rpb24gYWRkUHJlZml4VG9DbGFzc05hbWUgKHByZWZpeCwgY2xhc3NOYW1lKSB7XG5cdHJldHVybiBwcmVmaXggKyAnLScgKyB0b0h5cGhlbkRlbGltaXRlZChjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcgKHByZWZpeCwgY2xhc3NTdHJpbmcpIHtcblx0cmV0dXJuIGNsYXNzU3RyaW5nLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRyZXR1cm4gYWRkUHJlZml4VG9DbGFzc05hbWUocHJlZml4LCBjbGFzc05hbWUpO1xuXHR9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzUHJlZml4VG9Ob2RlIChub2RlLCBkaXNwbGF5TmFtZSwgX2lzQ2hpbGQpIHtcdFx0XG5cdGlmICghbm9kZSB8fCAhbm9kZS5wcm9wcykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBwcm9wcyA9IG5vZGUucHJvcHMsXG5cdFx0cHJlZml4ID0gJ3JlYWN0LScgKyB0b0h5cGhlbkRlbGltaXRlZChkaXNwbGF5TmFtZSk7XG5cblx0aWYgKHByb3BzLmNsYXNzKSB7XG5cdFx0Ly8gcHJlY29tcHV0ZSBjbGFzcyBuYW1lc1xuXHRcdHByb3BzLmNsYXNzID0gcHJvcHMuY2xhc3Muc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBzdGF0ZSBzaG9ydGhhbmRcblx0XHRcdGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKC9eXFw6XFw6XFw6LywgJ3N0YXRlLScpO1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZTtcblx0XHR9KS5qb2luKCcgJyk7XG5cdH1cblxuXHQvLyBtb2RpZnkgY2xhc3Mgc3RyaW5nc1xuXHRpZiAocHJvcHMuY2xhc3MgJiYgIV9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3MgPSBbJ3JlYWN0LXZpZXcnLCBwcmVmaXgsIGFkZENsYXNzUHJlZml4VG9DbGFzc1N0cmluZyhwcmVmaXgsIHByb3BzLmNsYXNzKV0uam9pbignICcpO1xuXHR9IGVsc2UgaWYgKHByb3BzLmNsYXNzICYmIF9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3MgPSBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzcyk7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzICYmICFfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzID0gJ3JlYWN0LXZpZXcgJyArIHByZWZpeDtcblx0fVxuXG5cdC8vIGFkZCB0byBjbGFzc05hbWVcblx0aWYgKHByb3BzLmNsYXNzTmFtZSAmJiBwcm9wcy5jbGFzcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSArPSAnICcgKyBwcm9wcy5jbGFzcztcblx0fSBlbHNlIGlmICghcHJvcHMuY2xhc3NOYW1lICYmIHByb3BzLmNsYXNzKSB7XG5cdFx0cHJvcHMuY2xhc3NOYW1lID0gcHJvcHMuY2xhc3M7XG5cdH1cblx0ZGVsZXRlIHByb3BzLmNsYXNzO1xuXG5cdGlmICh0eXBlb2YgcHJvcHMuY2hpbGRyZW4gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gdHJhdmVyc2UgY2hpbGRyZW5cblx0aWYgKEFycmF5LmlzQXJyYXkocHJvcHMuY2hpbGRyZW4pKSB7XG5cdFx0cHJvcHMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuXHRcdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUobm9kZSwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBwcm9wcy5jaGlsZHJlbiA9PT0gJ29iamVjdCcpIHtcblx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShwcm9wcy5jaGlsZHJlbiwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHR9IGVsc2UgaWYgKHByb3BzLmNoaWxkcmVuICYmIHByb3BzLmNoaWxkcmVuLl9zdG9yZSkge1xuXHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKHByb3BzLmNoaWxkcmVuLCBkaXNwbGF5TmFtZSwgdHJ1ZSk7XG5cdH1cbn1cblxuZXhwb3J0cy5hZGRDbGFzc1ByZWZpeFRvTm9kZSA9IGFkZENsYXNzUHJlZml4VG9Ob2RlOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gd2luZG93LlJlYWN0LFxuXHRET00gPSByZXF1aXJlKCcuL2RvbScpO1xuXG5pZiAodHlwZW9mIFJlYWN0ICE9PSAndW5kZWZpbmVkJykge1xuXHRSZWFjdC5jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoY3JlYXRlQ2xhc3MpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHNwZWMpIHtcblx0XHRcdHZhciByZW5kZXIgPSBzcGVjLnJlbmRlcjtcblx0XHRcdHNwZWMucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgbm9kZSA9IHJlbmRlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRET00uYWRkQ2xhc3NQcmVmaXhUb05vZGUobm9kZSwgc3BlYy5kaXNwbGF5TmFtZSk7XG5cdFx0XHRcdHJldHVybiBub2RlO1xuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIGNyZWF0ZUNsYXNzKHNwZWMpO1xuXHRcdH07XG5cdH0pKFJlYWN0LmNyZWF0ZUNsYXNzKTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENvbnZlcnRzIGEgQ2FtZWxDYXNlIHN0cmluZyB0byBhIGh5cGhlbi1kZWxpbWl0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiB0b0h5cGhlbkRlbGltaXRlZCAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFthLXpdW0EtWl0pL2csIGZ1bmN0aW9uIChnKSB7XG4gICAgcmV0dXJuIGdbMF0gKyAnLScgKyBnWzFdO1xuICB9KS50b0xvd2VyQ2FzZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0b0h5cGhlbkRlbGltaXRlZDsiXX0=
