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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2NoYWRzY2lyYS9sb2NhbC90b2RvbXZjL2FyY2hpdGVjdHVyZS1leGFtcGxlcy9yZWFjdC9ub2RlX21vZHVsZXMvcmVhY3QtcmNzLWJvd2VyL2xpYi9yY3MuanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3RvZG9tdmMvYXJjaGl0ZWN0dXJlLWV4YW1wbGVzL3JlYWN0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy9icm93c2VyL2RvbS5qcyIsIi9Vc2Vycy9jaGFkc2NpcmEvbG9jYWwvdG9kb212Yy9hcmNoaXRlY3R1cmUtZXhhbXBsZXMvcmVhY3Qvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy1ib3dlci9ub2RlX21vZHVsZXMvcmVhY3QtcmNzL2Jyb3dzZXIvaW5kZXguanMiLCIvVXNlcnMvY2hhZHNjaXJhL2xvY2FsL3RvZG9tdmMvYXJjaGl0ZWN0dXJlLWV4YW1wbGVzL3JlYWN0L25vZGVfbW9kdWxlcy9yZWFjdC1yY3MtYm93ZXIvbm9kZV9tb2R1bGVzL3JlYWN0LXJjcy91dGlscy90b0h5cGhlbkRlbGltaXRlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncmVhY3QtcmNzL2Jyb3dzZXInKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b0h5cGhlbkRlbGltaXRlZCA9IHJlcXVpcmUoJy4uL3V0aWxzL3RvSHlwaGVuRGVsaW1pdGVkJyk7XG5cbmZ1bmN0aW9uIGFkZFByZWZpeFRvQ2xhc3NOYW1lIChwcmVmaXgsIGNsYXNzTmFtZSkge1xuXHRyZXR1cm4gcHJlZml4ICsgJy0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoY2xhc3NOYW1lKTtcbn1cblxuZnVuY3Rpb24gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nIChwcmVmaXgsIGNsYXNzU3RyaW5nKSB7XG5cdHJldHVybiBjbGFzc1N0cmluZy5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7XG5cdFx0cmV0dXJuIGFkZFByZWZpeFRvQ2xhc3NOYW1lKHByZWZpeCwgY2xhc3NOYW1lKTtcblx0fSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiBhZGRDbGFzc1ByZWZpeFRvTm9kZSAobm9kZSwgZGlzcGxheU5hbWUsIF9pc0NoaWxkKSB7XHRcdFxuXHRpZiAoIW5vZGUgfHwgIW5vZGUucHJvcHMpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgcHJvcHMgPSBub2RlLnByb3BzLFxuXHRcdHByZWZpeCA9ICdyZWFjdC0nICsgdG9IeXBoZW5EZWxpbWl0ZWQoZGlzcGxheU5hbWUpO1xuXG5cdGlmIChwcm9wcy5jbGFzcykge1xuXHRcdC8vIHByZWNvbXB1dGUgY2xhc3MgbmFtZXNcblx0XHRwcm9wcy5jbGFzcyA9IHByb3BzLmNsYXNzLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcblx0XHRcdC8vIHJlcGxhY2Ugc3RhdGUgc2hvcnRoYW5kXG5cdFx0XHRjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXlxcOlxcOlxcOi8sICdzdGF0ZS0nKTtcblx0XHRcdHJldHVybiBjbGFzc05hbWU7XG5cdFx0fSkuam9pbignICcpO1xuXHR9XG5cblx0Ly8gbW9kaWZ5IGNsYXNzIHN0cmluZ3Ncblx0aWYgKHByb3BzLmNsYXNzICYmICFfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzID0gWydyZWFjdC12aWV3JywgcHJlZml4LCBhZGRDbGFzc1ByZWZpeFRvQ2xhc3NTdHJpbmcocHJlZml4LCBwcm9wcy5jbGFzcyldLmpvaW4oJyAnKTtcblx0fSBlbHNlIGlmIChwcm9wcy5jbGFzcyAmJiBfaXNDaGlsZCkge1xuXHRcdHByb3BzLmNsYXNzID0gYWRkQ2xhc3NQcmVmaXhUb0NsYXNzU3RyaW5nKHByZWZpeCwgcHJvcHMuY2xhc3MpO1xuXHR9IGVsc2UgaWYgKCFwcm9wcy5jbGFzcyAmJiAhX2lzQ2hpbGQpIHtcblx0XHRwcm9wcy5jbGFzcyA9ICdyZWFjdC12aWV3ICcgKyBwcmVmaXg7XG5cdH1cblxuXHQvLyBhZGQgdG8gY2xhc3NOYW1lXG5cdGlmIChwcm9wcy5jbGFzc05hbWUgJiYgcHJvcHMuY2xhc3MpIHtcblx0XHRwcm9wcy5jbGFzc05hbWUgKz0gJyAnICsgcHJvcHMuY2xhc3M7XG5cdH0gZWxzZSBpZiAoIXByb3BzLmNsYXNzTmFtZSAmJiBwcm9wcy5jbGFzcykge1xuXHRcdHByb3BzLmNsYXNzTmFtZSA9IHByb3BzLmNsYXNzO1xuXHR9XG5cdGRlbGV0ZSBwcm9wcy5jbGFzcztcblxuXHRpZiAodHlwZW9mIHByb3BzLmNoaWxkcmVuID09PSAnc3RyaW5nJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRyYXZlcnNlIGNoaWxkcmVuXG5cdGlmIChBcnJheS5pc0FycmF5KHByb3BzLmNoaWxkcmVuKSkge1xuXHRcdHByb3BzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdGFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIGRpc3BsYXlOYW1lLCB0cnVlKTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChwcm9wcy5jaGlsZHJlbiAmJiBwcm9wcy5jaGlsZHJlbi5fc3RvcmUpIHtcblx0XHRhZGRDbGFzc1ByZWZpeFRvTm9kZShwcm9wcy5jaGlsZHJlbiwgZGlzcGxheU5hbWUsIHRydWUpO1xuXHR9XG59XG5cbmV4cG9ydHMuYWRkQ2xhc3NQcmVmaXhUb05vZGUgPSBhZGRDbGFzc1ByZWZpeFRvTm9kZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHdpbmRvdy5SZWFjdCxcblx0RE9NID0gcmVxdWlyZSgnLi9kb20nKTtcblxuaWYgKHR5cGVvZiBSZWFjdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0UmVhY3QuY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKGNyZWF0ZUNsYXNzKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uIChzcGVjKSB7XG5cdFx0XHR2YXIgcmVuZGVyID0gc3BlYy5yZW5kZXI7XG5cdFx0XHRzcGVjLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIG5vZGUgPSByZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0XHRcdFx0RE9NLmFkZENsYXNzUHJlZml4VG9Ob2RlKG5vZGUsIHNwZWMuZGlzcGxheU5hbWUpO1xuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBjcmVhdGVDbGFzcyhzcGVjKTtcblx0XHR9O1xuXHR9KShSZWFjdC5jcmVhdGVDbGFzcyk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIENhbWVsQ2FzZSBzdHJpbmcgdG8gYSBoeXBoZW4tZGVsaW1pdGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gdG9IeXBoZW5EZWxpbWl0ZWQgKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyhbYS16XVtBLVpdKS9nLCBmdW5jdGlvbiAoZykge1xuICAgIHJldHVybiBnWzBdICsgJy0nICsgZ1sxXTtcbiAgfSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gdG9IeXBoZW5EZWxpbWl0ZWQ7Il19
