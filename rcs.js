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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3Byb2plY3RzLXByaXZhdGUvcmVhY3QtdGhhaS1hbHBoYWJldC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL3JlYWN0LXJjcy1ib3dlci9saWIvcmNzLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC9wcm9qZWN0cy1wcml2YXRlL3JlYWN0LXRoYWktYWxwaGFiZXQvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2RvbS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvYnJvd3Nlci9pbmRleC5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvcHJvamVjdHMtcHJpdmF0ZS9yZWFjdC10aGFpLWFscGhhYmV0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvcmVhY3QtcmNzLWJvd2VyL25vZGVfbW9kdWxlcy9yZWFjdC1yY3MvdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdyZWFjdC1yY3MvYnJvd3NlcicpOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRvSHlwaGVuRGVsaW1pdGVkID0gcmVxdWlyZSgnLi4vdXRpbHMvdG9IeXBoZW5EZWxpbWl0ZWQnKTtcblxuZnVuY3Rpb24gYWRkUHJlZml4VG9DbGFzc05hbWUgKHByZWZpeCwgY2xhc3NOYW1lKSB7XG5cdHJldHVybiBwcmVmaXggKyAnLScgKyB0b0h5cGhlbkRlbGltaXRlZChjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcgKHByZWZpeCwgY2xhc3NTdHJpbmcpIHtcblx0cmV0dXJuIGNsYXNzU3RyaW5nLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRyZXR1cm4gYWRkUHJlZml4VG9DbGFzc05hbWUocHJlZml4LCBjbGFzc05hbWUpO1xuXHR9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIGFkZENsYXNzUHJlZml4VG9Ob2RlIChub2RlLCBkaXNwbGF5TmFtZSwgX2lzQ2hpbGQpIHtcdFx0XG5cdGlmICghbm9kZSB8fCAhbm9kZS5wcm9wcykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBwcm9wcyA9IG5vZGUucHJvcHMsXG5cdFx0cHJlZml4ID0gJ3JlYWN0LScgKyB0b0h5cGhlbkRlbGltaXRlZChkaXNwbGF5TmFtZSk7XG5cblx0aWYgKHByb3BzLmNsYXNzZXMpIHtcblx0XHQvLyBwcmVjb21wdXRlIGNsYXNzIG5hbWVzXG5cdFx0cHJvcHMuY2xhc3NlcyA9IHByb3BzLmNsYXNzZXMuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24gKGNsYXNzTmFtZSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBzdGF0ZSBzaG9ydGhhbmRcblx0XHRcdGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5yZXBsYWNlKC9eXFw6XFw6XFw6LywgJ3N0YXRlLScpO1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZTtcblx0XHR9KS5qb2luKCcgJyk7XG5cdH1cblxuXHQvLyBtb2RpZnkgY2xhc3Mgc3RyaW5nc1xuXHRpZiAocHJvcHMuY2xhc3NlcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzc2VzID0gWydyZWFjdC12aWV3JywgcHJlZml4LCBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzc2VzKV0uam9pbignICcpO1xuXHR9IGVsc2UgaWYgKHByb3BzLmNsYXNzZXMgJiYgX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzc2VzID0gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3Nlcyk7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzZXMgJiYgIV9pc0NoaWxkKSB7XG5cdFx0cHJvcHMuY2xhc3NlcyA9ICdyZWFjdC12aWV3ICcgKyBwcmVmaXg7XG5cdH1cblxuXHQvLyBhZGQgdG8gY2xhc3NOYW1lXG5cdGlmIChwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3Nlcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSArPSAnICcgKyBwcm9wcy5jbGFzc2VzO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3Nlcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSA9IHByb3BzLmNsYXNzZXM7XG5cdH1cblx0ZGVsZXRlIHByb3BzLmNsYXNzZXM7XG5cblx0aWYgKHR5cGVvZiBwcm9wcy5jaGlsZHJlbiA9PT0gJ3N0cmluZycpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0cmF2ZXJzZSBjaGlsZHJlblxuXHRpZiAoQXJyYXkuaXNBcnJheShwcm9wcy5jaGlsZHJlbikpIHtcblx0XHRwcm9wcy5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShub2RlLCBkaXNwbGF5TmFtZSwgdHJ1ZSk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIHByb3BzLmNoaWxkcmVuID09PSAnb2JqZWN0Jykge1xuXHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKHByb3BzLmNoaWxkcmVuLCBkaXNwbGF5TmFtZSwgdHJ1ZSk7XG5cdH0gZWxzZSBpZiAocHJvcHMuY2hpbGRyZW4gJiYgcHJvcHMuY2hpbGRyZW4uX3N0b3JlKSB7XG5cdFx0YWRkQ2xhc3NQcmVmaXhUb05vZGUocHJvcHMuY2hpbGRyZW4sIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0fVxufVxuXG5leHBvcnRzLmFkZENsYXNzUHJlZml4VG9Ob2RlID0gYWRkQ2xhc3NQcmVmaXhUb05vZGU7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSB3aW5kb3cuUmVhY3QsXG5cdERPTSA9IHJlcXVpcmUoJy4vZG9tJyk7XG5cbmlmICh0eXBlb2YgUmVhY3QgIT09ICd1bmRlZmluZWQnKSB7XG5cdFJlYWN0LmNyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uIChjcmVhdGVDbGFzcykge1xuXHRcdHJldHVybiBmdW5jdGlvbiAoc3BlYykge1xuXHRcdFx0dmFyIHJlbmRlciA9IHNwZWMucmVuZGVyO1xuXHRcdFx0c3BlYy5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBub2RlID0gcmVuZGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdERPTS5hZGRDbGFzc1ByZWZpeFRvTm9kZShub2RlLCBzcGVjLmRpc3BsYXlOYW1lKTtcblx0XHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gY3JlYXRlQ2xhc3Moc3BlYyk7XG5cdFx0fTtcblx0fSkoUmVhY3QuY3JlYXRlQ2xhc3MpO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogQ29udmVydHMgYSBDYW1lbENhc2Ugc3RyaW5nIHRvIGEgaHlwaGVuLWRlbGltaXRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIHRvSHlwaGVuRGVsaW1pdGVkIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oW2Etel1bQS1aXSkvZywgZnVuY3Rpb24gKGcpIHtcbiAgICByZXR1cm4gZ1swXSArICctJyArIGdbMV07XG4gIH0pLnRvTG93ZXJDYXNlKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvSHlwaGVuRGVsaW1pdGVkOyJdfQ==
