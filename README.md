# controller-router
## Generic, path resolved controller router

Basic example of router configuration:

```javascript
var getRouter = require('controler-router');

// Provide a routes and get router:
var router = getRouter({
  // '/' route
  '/': function () {
    console.log("Root!");
  },
  // '/foo' route
  'foo': function () {
    console.log("Foo!");
  },
  // '/foo/bar' route
  'foo/bar': function () {
    console.log("Foo, Bar!");
  },
  // '/lorem/*' dynamic route
  'lorem/[0-9][0-9a-z]+': {
    match: function (id) {
      if (id !== '0abc') return false;
        // for demo purposes, pass only '0abc'
        this.name = id;
      },
    controller: function () {
      console.log("Lorem, " + this.name + "!");
    }
  }
});

router('/'); // Calls "/" controller (logs "Root!") and returns route call event object
router('/foo/'); // "Foo!"
router('/not-existing/'); // Not found, returns false
router('/foo/bar/'); // "Foo, Bar!"
router('/lorem/elo'); // Not found, returns false
router('/lorem/0abc'); // "Lorem, 0abc!"
```

### Installation

	$ npm install controller-router

### API

#### getRouter(routes)

```javascript
var getRouter = require('controller-router');

var router = getRouter({
  // .. routes configuration
});

router('/foo/bar'); // invoke controller for '/foo/bar' path
```

Main module exports `getRouter(routes)` function, which accepts routes configuration (typical hash map), and returns `router(path)` function.

##### Routes configuration

In routes map, _key_ is a path, and _value_ is a controller. Routes are defined as flat map, there are no nested route configurations.

###### Path keys

A valid path key is a series of tokens separated with `/` character. Where a token for typical static path is built strictly out of `a-z, 0-9, -` characters set.

We can also mix into path a dynamic path tokens, which we describe in regular expression format, but it is assumed that all tokens also resolve strictly to values built out of  `a-z, 0-9, -` character set.

Internally engine naturally distinguish between static and dynamic tokens on basis of fact that regular expression will use characters out of basic set.

In addition to above, a `/` key is understood as root url.

Examples of static path keys:
- __/__ - root url, matches strictly `/` route
- __foo__ - matches `/foo` or `/foo/` route
- __foo/bar/elo__ - matches `/foo/bar/elo` or `/foo/bar/elo/` route

Examples of dynamic path keys:
- __[a-z]{3}__ - matches e.g. `/abc` `/zws/` `/aaa/`, won't match e.g. `/ab0` or `/abcd`
- __user/[0-9][a-z0-9]{6}__ - matches e.g. `/user/0asd34d` or `/user/7few232` route
- __lorem/[0-9][a-z0-9]{6}/foo/[a-z]{1,2}__ - matches e.g. `/lorem/0asd34d/foo.` or `/user/7few232` route

Routes for dynamic path keys, can be combined with static that override them. e.g. we may have configuration for _user/[a-z]{3,10}_ and _user/mark_, and `/user/mark` url will be routed to __user/mark__ configuration, as it has higher specifity for given path

###### Controller values

For static path keys, controllers may be direct functions e.g.:
```javascript
'foo/bar': function () {
  // controller body
}
```

They can also be configured with objects which provide a `controller` property:
```javascript
'foo/bar': {
  controller: function () {
    // controller body
  }
};
```

Two of above configurations are equal in meaning.

If path key contains dynamic tokens, then `match` function is required, and configuration must be configured as:

```javascript
'lorem/[0-9][a-z0-9]{6}/foo/[a-z]{1,2}': {
  match: function (token1, token2) {
    if (!loremExists(token1) || !fooExists(token2)) {
      // while tokens matched pattern, no corresponding entities were found
      return false;
    }
    this.lorem = resolveLorem(token1);
    this.foo = resolve(token2);
    return true;
  },
  controller: function () {
    // controller body
    doSomethingWith(this.lorem, this.foo);
  }
};
```

Both `match` and `controller` are run in same _this_ context, which can be understood as route call event. For each route call, new context is created, it should be used as transport for values that we resolve at _match_ step, and want to access at _controller_ step.

#### nestRoutes(path, routes[, match])

```javascript
 var nestRoutes = require('controller-router/nest');

 var routes = {
   bar: function barController() { ... }
 };

  var nestedAgainstFoo = nestRoutes('foo', routes);
 console.log(nestedAgainstFoo);
 // { 'foo/bar': fuction barController() { ... } }

 var nestedAgainstUser = nestRoutes('user/[0-9][a-z0-9]{6}', routes, function (userId) {
   this.user = resolveUser(userId);
 });
 console.log(nestedAgainsUser);
 // { 'user/[0-9][a-z0-9]{6}/bar': {
 //    match: function (userId) {...} ,
 //    controller: function barController() { ... }
 // } }
```

Returns new routes map, where each route is additionally nested against provided path.
Provided nest path can contain regExp tokens, in such case also `match` function must be passed.

It's useful, when we have configured routes, which in some special cases we want to use against some nested route.

## Tests [![Build Status](https://travis-ci.org/medikoo/controller-router.svg)](https://travis-ci.org/medikoo/controller-router)

	$ npm test
