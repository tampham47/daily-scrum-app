/**
 * @jsx React.DOM
 */
'use strict';

var moment = require('moment');
var lodash = require('lodash');
var React = require('react');
var DefaultLayout = React.createFactory(require('./layouts/Default'));
var Rating = React.createFactory(require('react-rating'));
var Select = React.createFactory(require('react-select'));

var ProjectActions = require('../actions/ProjectActions');
var ProjectStore = require('../stores/ProjectStore');
var TaskActions = require('../actions/TaskActions');
var TaskStore = require('../stores/TaskStore');
var UserActions = require('../actions/UserActions');
var UserStore = require('../stores/UserStore');

var ReportPage = React.createClass({
  displayName: 'Report',

  getDefaultProps: function() {
    return {
      layout: DefaultLayout
    };
  },

  getInitialState: function() {
    var currentDate = moment();

    return {
      projectList: [],
      taskList: [],
      userList: [],
      currentDate: currentDate,
      currentDateStr: currentDate.format('DD/MM/YYYY'),
      filterProject: null
    };
  },

  getTotalTime: function(arr) {
    var total = 0;
    arr.forEach(function(item) {
      total += parseFloat(item.estimation) || 0;
    });
    return total;
  },

  componentDidMount: function() {
    ProjectStore.addListenerGetAllProjectSuccess(this._onGetAllProjectSuccess, this);
    ProjectStore.addListenerGetAllProjectFail(this._onGetAllProjectFail, this);

    TaskStore.addListenerOnFindTaskSuccess(this._onFindTaskSuccess, this);
    TaskStore.addListenerOnFindTaskFail(this._onFindTaskFail, this);

    UserStore.addListenerOnGetAllUsersSuccess(this._onGetAllUserSuccess, this);
    UserStore.addListenerOnGetAllUsersFail(this._onGetAllUserFail, this);

    TaskActions.find({
      q: { date: moment().format('YYYYMMDD') },
      l: {}
    });
    ProjectActions.all();
    UserActions.getAllUsers();
  },

  componentWillUnmount: function() {
    ProjectStore.rmvListenerGetAllProjectSuccess(this._onGetAllProjectSuccess);
    ProjectStore.rmvListenerGetAllProjectFail(this._onGetAllProjectFail);

    TaskStore.rmvListenerOnFindTaskSuccess(this._onFindTaskSuccess, this);
    TaskStore.rmvListenerOnFindTaskFail(this._onFindTaskFail, this);

    UserStore.rmvListenerOnGetAllUsersSuccess(this._onGetAllUserSuccess);
    UserStore.rmvListenerOnGetAllUsersFail(this._onGetAllUserFail);
  },

  _onGetAllUserSuccess: function(body) {
    console.log('_onGetAllUserSuccess', body);
    this.setState({
      userList: body.data
    });
  },

  _onGetAllUserFail: function(err) {
  },

  /**
   * function for handle data of task
   */
  _onFindTaskSuccess: function(data) {
    // map for usage data
    var data2 = data.map(function(item) {
      var newItem = lodash.clone(item);
      // parse data for view
      newItem.id = newItem._id;
      newItem._project = newItem._project && newItem._project._id;
      newItem.estimation = newItem.estimation && newItem.estimation.toString();
      // return the new one
      return newItem;
    });
    console.log('_onFindTaskSuccess', data2);
    this.setState({
      taskList: data2
    });
  },
  _onFindTaskFail: function(data) {
  },

  _onGetAllProjectSuccess: function(body) {
    var pList = body.data.map(function(item) {
      return {
        value: item._id,
        label: item.name
      };
    });
    this.setState({
      projectList: pList
    });
  },

  _onGetAllProjectFail: function() {
  },

  onSelectChanged: function() {
    console.log('onSelectChanged');
  },

  renderUserTask: function(arr, userId) {
    console.log('renderUserTask', arr, userId);
    var projectOptions = this.state.projectList;
    var timeRangeOptions = [
      { value: '0.5', label: '30 mins' },
      { value: '1', label: '1 hour' },
      { value: '1.5', label: '1 hours 30 mins' },
      { value: '2', label: '2 hours' },
      { value: '2.5', label: '2 hours 30 mins' },
      { value: '3', label: '3 hours' },
      { value: '3.5', label: '3 hours 30 mins' },
      { value: '4', label: '4 hours' },
      { value: '4.5', label: '4 hours 30 mins' },
      { value: '5', label: '5 hours' },
      { value: '5.5', label: '5 hours 30 mins' },
      { value: '6', label: '6 hours' },
      { value: '6.5', label: '6 hours 30 mins' },
      { value: '7', label: '7 hours' },
      { value: '7.5', label: '7 hours 30 mins' },
      { value: '8', label: '8 hours' },
    ];
    var projectId = this.state.filterProject;
    var filterUserList = lodash.filter(arr, function(item) {
      return ((item._user._id === userId) && (item._project === projectId || projectId === null));
    });
    var item = {};
    var renderList = (
      <li className="daily-item row" key={item.id}>
        <div className="col-sm-6">
          <div className="input-group">
            <span className="input-group-addon">
              <input type="checkbox" checked={item.isCompleted} disabled />
            </span>
            <input className="form-control" id="prependedcheckbox"
              placeholder="your task" type="text" disabled
              ref="content" name="content"
              value={item.content} />
          </div>
        </div>
        <div className="col-sm-2">
          <Select name="_project" clearable={false} disabled={true} value={item._project}
            options={projectOptions} />
        </div>
        <div className="col-sm-2">
          <Select name="estimation" clearable={false} disabled={true}
            value={item.estimation} options={timeRangeOptions} />
        </div>
      </li>
    );

    if (filterUserList.length > 0) {
      renderList = filterUserList.map(function(item, i) {
        return (
          <li className="daily-item row" key={item.id}>
            <div className="col-sm-6">
              <div className="input-group">
                <span className="input-group-addon">
                  <input type="checkbox" checked={item.isCompleted} disabled />
                </span>
                <input className="form-control" id="prependedcheckbox"
                  placeholder="your task" type="text" disabled
                  ref="content" name="content"
                  value={item.content} />
              </div>
            </div>
            <div className="col-sm-2">
              <Select name="_project" clearable={false} disabled={true} value={item._project}
                options={projectOptions} />
            </div>
            <div className="col-sm-2">
              <Select name="estimation" clearable={false} disabled={true}
                value={item.estimation} options={timeRangeOptions} />
            </div>
          </li>
        )
      }.bind(this));
    }

    return renderList;
  },

  setNewDate: function(m) {
    TaskActions.find({
      q: { date: m.format('YYYYMMDD') },
      l: {}
    });

    this.setState({
      currentDate: m,
      currentDateStr: m.format('DD/MM/YYYY'),
    });
  },

  onPrevClicked: function(e) {
    var currentDate = this.state.currentDate.add(-1, 'days');
    this.setNewDate(currentDate);
  },

  onNextClicked: function(e) {
    var currentDate = this.state.currentDate.add(1, 'days');
    this.setNewDate(currentDate);
  },

  onDateChanged: function(e) {
    console.log('onDateChanged', e.target.value);
    this.setState({
      currentDateStr: e.target.value
    });
  },

  onFilterProjectChanged: function(value) {
    console.log('onFilterProjectChanged', value);
    if (!value) {
      value = null;
    }
    this.setState({
      filterProject: value
    });
  },

  inputDateOnKeyDown: function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      e.stopPropagation();

      var dateStr = this.state.currentDateStr;
      var m = moment(dateStr, 'DD/MM/YYYY');

      if (m == null || !m.isValid()) {
        alert('Input date is not valid!');
      } else {
        this.setNewDate(m);
      }
    }
  },

  render: function() {
    var userListRender = (
      <div className="day-block"></div>
    );

    if (this.state.userList.length) {
      userListRender = this.state.userList.map(function(item) {
        var taskByUser = this.state.taskList.filter(function(task) {
          return (task._user._id === item._id);
        });
        var totalTime = this.getTotalTime(taskByUser);

        return (
          <div className="day-block">
            <p className="username-title">{item.fullName}</p>
            <ul className="daily-list">
              {this.renderUserTask(this.state.taskList, item._id)}
              <li className="row daily-item">
                <div className="col-sm-6">
                  {/*<div className="pull-right">
                    <Rating />
                  </div>*/}
                </div>
                <div className="col-sm-4">
                  <span className="pull-right">
                    Total: { totalTime || 0 } hours
                  </span>
                </div>
              </li>
            </ul>
          </div>
        );
      }.bind(this));
    }

    return (
      <div className="">
        <div className="row">
          <div className="col-sm-4">
            <h3 className="title-label">REPORTS</h3>
          </div>
          <div className="col-sm-2">
            <Select name="_project" clearable={true} value={this.state.filterProject}
              options={this.state.projectList}
              onChange={this.onFilterProjectChanged} />
          </div>
          <div className="col-sm-2">
            <div className="input-group">
              <span className="input-group-addon" id=""><i className="glyphicon glyphicon-calendar"></i></span>
              <input className="form-control" placeholder="dd/mm/yyyy"
                type="text" name="inputCurrentDate"
                value={this.state.currentDateStr}
                onKeyDown={this.inputDateOnKeyDown}
                onChange={this.onDateChanged} />
            </div>
          </div>
          <div className="col-sm-2">
            <div className="btn-group btn-group-justified" role="group" aria-label="...">
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-success" onClick={this.onPrevClicked}>
                  <i className="glyphicon _default glyphicon-menu-left"></i> Prev</button>
              </div>
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-success" onClick={this.onNextClicked}>
                  Next <i className="glyphicon _default glyphicon-menu-right"></i></button>
              </div>
            </div>
          </div>
        </div>

        {userListRender}
      </div>
    );
  }
});

module.exports = ReportPage;
