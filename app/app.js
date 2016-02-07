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
        $interval(function () {
            var data = {
                id: Math.floor((Math.random() * 10) + 1) + "",
                teamName: Math.floor((Math.random() * 10) + 1),
                state: Date.now()/1000,
                overallHits: Math.floor((Math.random() * 100) + 1),
                hits: Math.floor((Math.random() * 61) + 1),
                name: "wand"
            };
            _ws.$emit("hit", data);
        }, 3000);
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
    $log.debug("WS created");
});

app.factory('Target', function ($log) {
    function Taget(id) {
        $log.debug("New Target created");
        this.id = id;
        this.acceleration = 0;
        this.timestamp = "";
        this.hitcount = 0;
    }
    $log.debug("Target init done");
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
        targets.teamHitcount = 0;
        targets.teamName = "";
    };


    WebsocketService.onmessage(function (message) {
        if (message.event == "hit") {
            var target = Targets.getTargetById(parseInt(message.data.id), true);
            if (message.data.len) {
                target.acceleration = message.data.len;
            }
            if (message.data.state) {
                target.timestamp = message.data.state;
            }
            if (message.data.hits) {
                target.hitcount = message.data.hits;
            }
            if (message.data.teamName) {
                Targets.setTeamName(message.data.teamName);
            }
            if (message.data.overallHits) {
                Targets.setTeamHitcount(message.data.overallHits);
            }
        }
    });
    $log.debug("Tagets init dones");
    return Targets;
});

app.controller('HitView', function ($scope, $timeout, $interval, $log, WebsocketService, Targets, amMoment) {
    //x$scope.wsService = WebsocketService;
    $timeout(function() {
        $scope.double = Targets.getTargets();
    }, 1000);
    $scope.reset = function(){
        Targets.clear();
    };
    $log.debug("MainController done");
});

