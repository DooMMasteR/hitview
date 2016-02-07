'use strict';

var app = angular.module('hitviewapp', ['ngWebsocket', 'ngLodash', 'angularMoment']);

app.service('WebsocketService', function ($websocket, $log, $interval) {
    var _messagecallback = [];
    var _closecallback = [];
    var _ws = $websocket.$new({
        url: 'ws://' + "192.168.179.44" + ':10080/',
        protocols: []
    });

    //var _ws = $websocket.$new({
    //    url: 'ws://' + location.hostname + ':8000/',
    //    protocols: []
    //});

    _ws.$on('$open', function () {
        $log.debug("Wer are connected");
        //$interval(function () {
        //    var data = {
        //        id: Math.floor((Math.random() * 10) + 1),
        //        eventType: Math.floor((Math.random() * 10) + 1),
        //        timestamp: Date.now(),
        //        name: "wand"
        //    };
        //    _ws.$emit("target.event", data);
        //}, 3000);
    });

    _ws.$on('$message', function (data) {
        $log.debug("Got Message");
        $log.debug(data);
        angular.forEach(_messagecallback, function (callback) {
            callback(data);
        });
    });

    _ws.$on('$close', function (event) {
        console.log(event);
        angular.forEach(_closecallback, function (callback) {
            callback();
        });
    });

    this.onmessage = function (func) {
        _messagecallback.push(func);
    };
});

app.factory('Target', function ($log) {
    function Taget(id) {
        $log.debug("New Target created");
        this.id = id;
        this.eventType = "";
        this.timestamp = "";
        this.hitcount = 0;
    }
    return Taget;
});


app.factory('Targets', function (WebsocketService, $log, lodash, Target) {
    $log.debug("Targets instantiated");
    var _ = lodash;
    var targets = null;

    function Targets() {
        this.targetList = [];
        this.teamName = "";
        this.teamHitcount = "";
        if (!targets) {
            targets = this;
        }
    }

    Targets.getTargets = function () {
        if (targets == null) {
            targets = new Targets();
        }
        return targets;
    };

    Targets.getTargetById = function (id, createIfNotExists) {
        var res = _.find(targets.targetList, ['id', id]);
        if (!res && createIfNotExists) {
            res = new Target(id);
            targets.targetList.push(res);
        }
        return res;
    };

    Targets.setTeamName = function(name){
        targets.teamName = name;
    };

    Targets.setTeamHitcount = function(count){
        targets.teamHitcount = count;
    };

    Targets.clear = function(){
        targets.targetList = [];
    };


    WebsocketService.onmessage(function (message) {
        if (message.event == "hit") {
            var target = Targets.getTargetById(parseInt(message.data.id), true);
            if (message.data.eventType) {
                target.eventType = message.data.eventType;
            }
            if (message.data.state) {
                target.timestamp = message.data.state;
            }
            if (message.data.hits) {
                target.hitcount = message.data.hits;
            }
            //Targets.setTeamName(message.data.team);
        }
    });

    return Targets;
});

app.controller('HitView', function ($scope, $interval, $log, WebsocketService, Targets, amMoment) {
    $scope.wsService = WebsocketService;
    $scope.double = Targets.getTargets();
    $interval(function(){
        $log.debug($scope.double);
    }, 3000);
});

