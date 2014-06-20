/**
 * @module Wanaplan
 * @submodule Component
 */

var OculusComponent2D = (function () {

    /**
     * OculusComponent2D.
     *
     * @class PerformanceComponent2D
     * @constructor
     * @extends BaseComponent2D
     */
    var oculusComponent = function (core) {
        BaseComponent2D.call(this, core, "OculusComponent2D");
        this.localPath = "http://localhost/hackaton/";
        this.path = [];
        this.pathMiddle = [];
        this.planPos = {};
        this.pathColor = "green";
        return this;
    };

    var api2D = wanaplan.engine2D;

    oculusComponent.prototype = new BaseComponent2D();

    oculusComponent.prototype.initialize = function () {
        var item = {
            title: _("Oculus"),
            icon: this.localPath + "images/oculus.png",
            action: "my.request.oculus",
            index: 1000
        };

        API.Menu.add(API.Menu.MENU_TOP_2, item);

        document.addEventListener("wnp.core.structure.loaded", this.onPlanReady.bind(this), false);
        this.onPlanReady();
        this.startListening();
    };

    oculusComponent.prototype.startListening = function () {
        this.onOculusClick = this.onOculusClick.bind(this);
        document.addEventListener("my.request.oculus", this.onOculusClick, false);
        api2D.registerEventCb("oculusComponent2D.dynamicRefresh", this.priority, "refresh", null, null, this.onOculusRefresh.bind(this), {});
        api2D.registerEventCb("oculusComponent2D.hover", this.priority, "hover", api2D.MODE_NORMAL, null, this.onOculusHover.bind(this), {});
    };

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus", this.onOculusClick, false);
    };

    oculusComponent.prototype.onOculusHover = function (event, target, mstate, params) {
        api2D.registerEventCb("oculusComponent2D.edit.mouseMove", this.priority, "mouse-move", api2D.MODE_NORMAL, BABYLON.Vector3, this.onOculusEditMouseMove.bind(this), target);
        api2D.registerEventCb("oculusComponent2D.edit.hover", this.priority, "dynamic-refresh", api2D.MODE_NORMAL, BABYLON.Vector3, this.onOculusHoverPoint.bind(this), target);
        api2D.registerEventCb("oculusComponent2D.edit.dragStart", this.priority, "drag-start", api2D.MODE_NORMAL, BABYLON.Vector3, this.onOculusEditDragStart.bind(this), {});
    };

    oculusComponent.prototype.onOculusEditMouseMove = function () {
        api2D.requestDynamicRefresh();
    };

    oculusComponent.prototype.onOculusHoverPoint = function (ctx, translation, zoom, data) {

        if (data) {
            this.pathColor = "grey";
            ctx.save();
            ctx.translate(translation.x, translation.y);
            ctx.scale(zoom, zoom);

            ctx.beginPath();
            ctx.lineWidth = "10";
            ctx.strokeStyle = "green";
            ctx.fillStyle = "white";
            ctx.arc(data.x, data.z, 25 * zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(data.x, data.z, 10 * zoom, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();

            ctx.restore();
        }

    };

    oculusComponent.prototype.onOculusEditDragStart = function (event, target, mstate, params) {
        api2D.registerEventCb("oculusComponent2D.edit.dragging", this.priority, "dragging", null, null, this.onOculusEditDragging.bind(this), target);
        api2D.registerEventCb("oculusComponent2D.edit.dragEnd", this.priority, "drag-end", null, null, this.onOculusEditDragEnd.bind(this), target);
        return false;
    };

    oculusComponent.prototype.onOculusEditDragEnd = function (event, target, mstate, params) {
        this.pathColor = "green";
        api2D.requestRefresh();
    };

    oculusComponent.prototype.onOculusEditDragging = function (event, target, mstate, params) {
        params.x += mstate.posDelta.x;
        params.z += mstate.posDelta.y;

        this.computeMiddlePath();

        api2D.requestRefresh();

    };

    oculusComponent.prototype.getTargeted = function (vector) {
        if (api2D.getMode() === api2D.MODE_NORMAL) {
            for (var i = 0; i < this.path.length; i++) {
                var myVector = {
                    x: vector.x,
                    y: this.path[i].y,
                    z: vector.y
                };

                var distance = BABYLON.Vector3.DistanceSquared(myVector, this.path[i]);
                if (distance <= 1000) {
                    return this.path[i];
                }
            }
        }
        return false;
    };

    oculusComponent.prototype.onOculusClick = function () {
        if (api2D.getMode() === api2D.MODE_DRAW) {
            API.setMode(api2D.MODE_NORMAL);
        } else {
            API.setMode(api2D.MODE_DRAW);
            api2D.registerEventCb("oculusComponent2D.dragStart", this.priority, "drag-start", api2D.MODE_DRAW, null, this.onOculusDragStart.bind(this), {});
        }
    };

    oculusComponent.prototype.onPlanReady = function () {
        // this.path = this.structure.params.pathOculus || [];
        // this.computeMiddlePath();
        // api2D.requestRefresh();
    };

    oculusComponent.prototype.onOculusDragStart = function () {
        this.path = [];
        this.pathMiddle = [];
        api2D.registerEventCb("oculusComponent2D.dragging", this.priority, "dragging", null, null, this.onOculusDragging.bind(this), {});
        api2D.registerEventCb("oculusComponent2D.dragEnd", this.priority, "drag-end", null, null, this.onOculusDragEnd.bind(this), {});
        return false;
    };

    oculusComponent.prototype.onOculusDragEnd = function () {
        this.structure.params.pathOculus = this.path;
    };

    oculusComponent.prototype.computeMiddlePath = function () {
        if (this.path.length > 0) {
            this.pathMiddle = [];
            var vector = new BABYLON.Vector3(this.path[0].x, this.path[0].y, this.path[0].z);

            this.path[0] = vector;

            for (var i = 1; i < this.path.length; i++) {
                this.pathMiddle.push(BABYLON.Vector3.Lerp(this.path[i], vector, 0.5));
                vector = new BABYLON.Vector3(this.path[i].x, this.path[i].y, this.path[i].z);
                //force vector3
                this.path[i] = vector;
            }
        }
    };

    oculusComponent.prototype.containsVector = function (vectorArray, vector) {
        for (var i = 0; i < vectorArray.length; i++) {
            if (vectorArray[i].equals(vector)) {
                return true;
            }
        }
        return false;
    };

    oculusComponent.prototype.findAndAddDoorInPath = function (vector) {
        var overtures = this.structure.members[0].overtures;

        var doors = [];

        if (overtures) {
            for (var i = 0; i < overtures.length; i++) {
                var position = overtures[i].getAbsolutePos().position;
                var overture = new BABYLON.Vector3(position.x, 175, position.y);
                var distance = BABYLON.Vector3.Distance(overture, vector);
                if (distance < 100) {
                    var door = { x: overture.x, y: overture.z, distance: distance};
                    if (doors[0] && doors[0].distance > distance) {
                        doors.unshift(door)
                    } else {
                        doors.push(door);
                    }
                }
            }
        }

        return doors[0];
    };

    oculusComponent.prototype.onOculusDragging = function (event, target, mstate, params) {

        var vector = new BABYLON.Vector3(mstate.planPos.x, 175, mstate.planPos.y);

        //find overtures
        if (this.path.length === 0 || (this.path.length > 0 && BABYLON.Vector3.Distance(this.path[this.path.length - 1], vector) >= 50)) {
            this.path.push(vector);
            if (this.path && this.path.length >= 2) {
                this.pathMiddle.push(BABYLON.Vector3.Lerp(this.path[this.path.length - 2], vector, 0.5));
            }
        }

        var foundDoor = this.findAndAddDoorInPath(vector);
        this.planPos = foundDoor || mstate.planPos;

        api2D.requestRefresh();
    };

    oculusComponent.prototype.onOculusRefresh = function (ctx, translation, zoom, data) {
        if (this.pathMiddle.length > 0 && this.path.length >= 2) {

            ctx.save();
            ctx.translate(translation.x, translation.y);
            ctx.scale(zoom, zoom);

            ctx.strokeStyle = this.pathColor;
            ctx.lineWidth = "20";
            ctx.beginPath();

            var point = this.pathMiddle[0];

            ctx.moveTo(point.x, point.z);

            for (var i = 1; i < this.pathMiddle.length; i++) {
                point = this.pathMiddle[i];
                var controlPoint = this.path[i];
                ctx.quadraticCurveTo(controlPoint.x, controlPoint.z, point.x, point.z);
            }

            ctx.lineTo(this.planPos.x, this.planPos.y);

            ctx.stroke();

            ctx.restore();
        }
    };

    return oculusComponent;

})();