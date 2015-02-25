Brahma
====
Is very young project. Brahmajs is a platform for develop widgets and Front-end applications. Main idea is to reject of the jQuery and the formation own semis. I'm not in a hurry to make it special. It just supports my needs.

## Getting Started

Get via Bower:
```npm
bower install brahma
```

## Simple example
Creating new application
```javascript
Brahma.app('myapp', {
  run: function() {
    // App run here
    this.scope.html('Hello by app');
  }
});
```
Calling application
```javascript
Brahma("#myelement").app('myapp');
```

Edit application
```javascript
Brahma('myapp').myNewMethod = foo;
```

## Selectors and operands
Brahma using selectors just like in jQuery, but without old browsers support (no Sizzle).
```
Brahma("h1[foo=bar]");
```

Like in jQuery It returns an object with kit of methods: html,empty,parent,each,createNode,put,and,wrapAll,find,tie,bind,addClass,removeClass,hasClass,css,data,attr
```
Brahma("h1[foo=bar]").find("span").addClass("foo").data("one", "two").bind("click", handler);
```

### Life example
http://morulus.github.io/brahma.screens/

### About
Author: Vladimir Kalmykov ([@morulus](https://guthub.com/morulus))

### License
[MIT](https://github.com/morulus/brahma/blob/gh-pages/LICENSE.md)
