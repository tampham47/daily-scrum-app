/**
 * ToDo Store
 */
'use strict';

/**
 * Libraries
 */
var AppDispatcher = require('../AppDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('react/lib/Object.assign');
var Actions = require('../commons/enum/ActionTypes');
var Events = require('../commons/enum/EventTypes');
var ProjectApis = require('../commons/service-api').ProjectApis;
var UProjectApis = require('../commons/service-api').UProjectApis;
var async = require('async');

/**
 * Variables
 */
var DEBUG = false;
var _name = 'ProjectStore';

/**
 * Store Start
 */
var ProjectStore = assign({}, EventEmitter.prototype, {
  // listener events zone
  addListenerOnCreateSuccess: function(callback, context) {
    this.on(Events.CreateProjectSuccess, callback, context);
  },
  rmvListenerOnCreateSuccess: function(context) {
    this.removeListener(Events.CreateProjectSuccess, context);
  },
  addListenerOnCreateFail: function(callback, context) {
    this.on(Events.CreateProjectFail, callback, context);
  },
  rmvListenerOnCreateFail: function(context) {
    this.removeListener(Events.CreateProjectFail, context);
  },

  addListenerGetAllProjectSuccess: function(callback, context) {
    this.on(Events.GetAllProjectSuccess, callback, context);
  },
  rmvListenerGetAllProjectSuccess: function(context) {
    this.removeListener(Events.GetAllProjectSuccess, context);
  },
  addListenerGetAllProjectFail: function(callback, context) {
    this.on(Events.GetAllProjectFail, callback, context);
  },
  rmvListenerGetAllProjectFail: function(context) {
    this.removeListener(Events.GetAllProjectFail, context);
  },

  addListenerGetAllUserProjectSuccess: function(callback, context) {
    this.on(Events.GetAllUserProjectSuccess, callback, context);
  },
  rmvListenerGetAllUserProjectSuccess: function(context) {
    this.removeListener(Events.GetAllUserProjectSuccess, context);
  },
  addListenerGetAllUserProjectFail: function(callback, context) {
    this.on(Events.GetAllUserProjectFail, callback, context);
  },
  rmvListenerGetAllUserProjectFail: function(context) {
    this.removeListener(Events.GetAllUserProjectFail, context);
  },

  // functions
  create: function(data) {
  // data must be include 2 part
  // data.project is object
  // data.uproject is []
    ProjectApis.create(data).then(function(projectData){
      async.each(data._user, function(user, callback){
        UProjectApis.create({_project: projectData.data._id, _user: user.value});
        callback();
      }, function(err){
        console.log(err);
      });
      this.emit(Events.CreateProjectSuccess, projectData);
    }.bind(this),
    function(err){
      this.emit(Events.CreateProjectFail, err);
    }.bind(this));
},

  all: function() {

    ProjectApis.all().then(
    function(body) {
      this.emit(Events.GetAllProjectSuccess, body);
    }.bind(this),
    function(err) {
      this.emit(Events.GetAllProjectFail, err);
    }.bind(this));
  },

  getAllUserProjects: function(){
    UProjectApis.all().then(
    function(body) {
      this.emit(Events.GetAllUserProjectSuccess, body);
    }.bind(this),
    function(err) {
      this.emit(Events.GetAllUserProjectFail, err);
    }.bind(this));
  }
});

/**
 * Integrated with Dispatcher
 */
AppDispatcher.register(function(payload) {

  var action = payload.actionType;

  if (DEBUG) {
    console.log('[*] ' + _name + ':Dispatch-Begin --- ' + action);
    console.log('     Payload:');
    console.log(payload);
  }

  // Route Logic
  switch (action) {
    case Actions.CreateProject:
      ProjectStore.create(payload.data);
      break;

    case Actions.All:
      ProjectStore.all(payload.data);
      break;

    case Actions.getAllUserProjects:
      ProjectStore.getAllUserProjects(payload.data);
      break;

    default:
      if (DEBUG) {
        console.log('[x] ' + _name + ':actionType --- NOT MATCH');
      }
      return true;
  }

  // If action was responded to, emit change event
  // UserStore.emitChange();

  if (DEBUG) {
    console.log('[*] ' + _name + ':emitChange ---');
  }

  return true;
});

module.exports = ProjectStore;
