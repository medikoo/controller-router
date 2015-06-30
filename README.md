# controller-router
## URL to controller, router

Basic example of router configuration:

```javascript
var ControllerRouter = require('controler-router');

// Get router for provided routes
var router = new ControllerRouter({
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

router.route('/'); // Calls "/" controller (logs "Root!") and returns route call event object
router.route('/foo/'); // "Foo!"
router.route('/not-existing/'); // Not found, returns false
router.route('/foo/bar/'); // "Foo, Bar!"
router.route('/lorem/elo'); // Not found, returns false
router.route('/lorem/0abc'); // "Lorem, 0abc!"
```

### Installation

	$ npm install controller-router

### API
#### ControllerRouter constructor properties
##### ControllerRouter.ensureRoutes(routes)

Validates provided routes configuration, it is also used internally on router initialization

#### ControllerRouter initialization
##### new ControllerRouter(routes[, options])

```javascript
var ControllerRouter = require('controller-router');

var router = new ControllerRouter({
  // .. routes configuration
});
```

ControllerRouter on initalizaton accepts [routes map](#routes-map-configuration), and eventual options:
- __eventProto__ - Prototype for route events. If provided, then each event, will be an instance that inherits from this object.
For more information about _event_ object, see [Handling of router function](https://github.com/medikoo/controller-router#handling-of-router-function) section.

###### Routes map configuration

In routes map, _key_ is a path, and _value_ is a controller. Routes are defined as flat map, there are no nested route configurations.

####### Routes map: path keys

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

####### Routes map: controller values

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

`match` function would be invoked in same _event_ context as controller, and arguments it receives is resolved tokens from url which match all route regexp tokens.

#### ControllerRouter instance properties
##### controllerRouter.route(path[, ...controllerArgs])

Resolves controller for given path, and if one is found, it is invoked. Additionally after a path argument, we can pass arguments for _controller_ function (mind that those arguments won't be provided to eventual _match_ function)

For each method call, a new _event_ is created (as a plain object, or as an extension to provided at initialization `eventProto` object).
It is used as a context for _match_ and _controller_ invocations, _event_ object should be used as a transport for values that we resolve at _match_ step, and want to access at _controller_ step.

`router` method when invoked returns either `false` when no controller for given path was found, or in case of a valid route, a result object with following properties is returned:
- `conf` a route configuration for chosen path (as it's provided on routes object)
- `event`, an event for given router call
- `result` a result value as returned by invoked controller

If internally invoked controller function crashes, then `conf` and `event` objects, can be found as properties on error instance.

##### controllerRouter.routeEvent(event, path[, ...controllerArgs])

With `routeEvent` method we can force specific _event_ (controller context) for given route call. Aside of that it behaves exactly as `route` method.

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

### Available Extensions

__controller-router__ on its own is a generic utility and doesn't provide functionalities which you would need for certain use cases. Following is a list of extensions which address specific scenarios:

- [post-controller-router](https://github.com/medikoo/post-controller-router#post-controller-router) -  Router dedicated for update requests (e.g. form submissions in browsers, or POST requests on server-side)
- [site-tree-router](https://github.com/medikoo/site-tree-router#site-tree-router) - A view engine router (to switch between pages in response to url changes in address bar)

### Tests [![Build Status](https://travis-ci.org/medikoo/controller-router.svg)](https://travis-ci.org/medikoo/controller-router)

	$ npm test
