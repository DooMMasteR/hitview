'use strict';

var app = angular.module('hitviewapp', ['ngWebsocket', 'ngLodash']);

app.service('WebsocketService', function ($websocket, $interval) {
        var _messagecallback = [];
        var _ws = $websocket.$new({
            url: 'ws://'+ location.hostname +':8000/',
            protocols: []
        });

        _ws.$on('$open', function () {
            $interval(function() {
                var data = {
                    id: Math.floor((Math.random() * 10) + 1),
                    eventType: Math.floor((Math.random() * 10) + 1),
                    name: "wand"
                };
                _ws.$emit("target.event", data);
            }, 1000);
        });

        _ws.$on('$message', function (data) {
            angular.forEach(_messagecallback, function(callback){
                callback(data);
            });
        });

        _ws.$on('$close', function (event) {
            console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
            console.log(event);
        });

        this.onmessage = function(func){
        _messagecallback.push(func);
        };
    });

app.factory('Target', function($log){
    var _targets = [];
    function Taget(id){
        $log.debug("New Target created");
        this.id = id;
        this.eventType = ""
    }
    return Taget;
});


app.factory('Targets', function(WebsocketService, $log, lodash, Target){
    var _ = lodash;
    var targets = null;
    function Targets(){
        this.targetList = [];
        if(!targets){
            $log.debug("Saving self for later");
            targets = this;
        }
    }

    Targets.getTargets = function(){
        if(targets == null){
            targets = new Targets();
        }
        return targets.targetList;
    };

    Targets.getTargetById = function(id, createIfNotExists){
        var res = _.find(targets.targetList, ['id', id]);
        if(!res && createIfNotExists) {
            res = new Target(id);
            targets.targetList.push(res);
        }
        return res;
    };

    WebsocketService.onmessage(function(message){
        $log.debug("Targets model got an event");
        $log.debug(message);
        if(message.event == "target.event"){
            $log.debug("It is a target.event");
            var target = Targets.getTargetById(message.data.id, true);
            if(message.data.eventType){
                target.eventType = message.data.eventType;
            }
        }
    });
    return Targets;
});

app.controller('HitView', function($scope, $interval, $log, WebsocketService, Targets) {
    WebsocketService.onmessage(function(message){
        $log.debug("HitView controller got an event");
        $log.debug(message)
    });
    $scope.wsService = WebsocketService;
    $scope.double = Targets.getTargets();
});