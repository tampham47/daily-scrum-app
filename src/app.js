/*!
 * Facebook React Starter Kit | https://github.com/kriasoft/react-starter-kit
 * Copyright (c) KriaSoft, LLC. All rights reserved. See LICENSE.txt
 * and
 * https://github.com/alduro/generator-flux-webapp
 */

'use strict';

var React = require('react');
var assign = require('react/lib/Object.assign');
var {Router} = require('director');
var AppDispatcher = require('./AppDispatcher');
var ActionTypes = require('./commons/enum/ActionTypes');
var AppConfig = require('./config.js');

// Export React so the dev tools can find it
(window !== window.top ? window.top : window).React = React;

/**
 * Check if Page component has a layout property; and if yes, wrap the page
 * into the specified layout, then mount to container in config file.
 */
function render(uri, page) {
  var child, props = {
    uri: uri
  };
  var obj = page();
  while (obj.props && obj.props.layout) {
    child = page(props, child);
    props = assign(props, obj.props);
    obj = obj.props.layout;
  }
  if (!obj || typeof obj !== 'function') {
    throw 'Did you set "layout" in "props" for "' + uri + '" route?';
  }
  React.render(obj(props, child), AppConfig.container);
}

// Initialize a router
// Define URL routes
// See https://github.com/flatiron/director
var router = new Router({
  // Main Route
  '/': function() {
    var page = React.createFactory(require('./views/Daily'));
    render(router.getRoute(), page);
  },
  '/daily': function() {
    var page = React.createFactory(require('./views/Daily'));
    render(router.getRoute(), page);
  },
  '/report': function() {
    var page = React.createFactory(require('./views/Report'));
    render(router.getRoute(), page);
  },
  '/project': function() {
    var page = React.createFactory(require('./views/Project'));
    render(router.getRoute(), page);
  },
  '/member': function() {
    var page = React.createFactory(require('./views/Member'));
    render(router.getRoute(), page);
  },
  '/login': function() {
    var page = React.createFactory(require('./views/Login'));
    render(router.getRoute(), page);
  },
  '/register': function() {
    var page = React.createFactory(require('./views/Register'));
    render(router.getRoute(), page);
  },
});

router.configure({
  html5history: false,
  before: function() {
    var currentRoute = this.getRoute()[0];
    if (currentRoute === 'register') {
      return true;
    }

    // check auth before access data
    var token = window.localStorage.getItem('token');
    if (!token) {
      var page = React.createFactory(require('./views/Login'));
      router.setRoute('/login');
      render('login', page);
      return false;
    }
  }
}).init('/');

// Register Main Application Dispatcher
AppDispatcher.register((payload) => {

  if (payload.actionType === ActionTypes.SET_CURRENT_ROUTE) {
    router.setRoute(payload.route);
  }

  return true; // No errors.  Needed by promise in Dispatcher.
});
