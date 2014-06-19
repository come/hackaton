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
        this.path = this.structure.params.pathOculus || [];
        this.pathMiddle = [];
        this.planPos = {};
        return this;
    };

    var api2D = wanaplan.engine2D;

    oculusComponent.prototype = new BaseComponent2D();

    oculusComponent.prototype.initialize = function () {

        var item = {
            title: _("Oculus"),
            icon: this.localPath + "images/oculus.png",
            action: "oculusComponent2D.click",
            index: 1000
        }

        API.Menu.add(API.Menu.MENU_TOP_2, item);

        document.addEventListener("wnp.core.structure.loaded", this.onPlanReady.bind(this), false);

        this.startListening();
    };

    oculusComponent.prototype.startListening = function () {
        this.onOculusClick = this.onOculusClick.bind(this);
        document.addEventListener("oculusComponent2D.click", this.onOculusClick, false);
        api2D.registerEventCb("oculusComponent2D.dynamicRefresh", this.priority, "refresh", null, null, this.onOculusRefresh.bind(this), {});
    };

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("oculusComponent2D.click", this.onOculusClick, false);
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

        this.path = this.structure.params.pathOculus || [];
        this.computeMiddlePath();

        api2D.requestRefresh();

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

            for (var i = 1; i < this.path.length; i++) {
                this.pathMiddle.push(BABYLON.Vector3.Lerp(this.path[i], vector, 0.5));
                vector = new BABYLON.Vector3(this.path[i].x, this.path[i].y, this.path[i].z);
            }
        }
    };

    oculusComponent.prototype.onOculusDragging = function (event, target, mstate, params) {

        var vector = new BABYLON.Vector3(mstate.planPos.x, 175, mstate.planPos.y);

        if (this.path.length === 0 || (this.path.length > 0 && BABYLON.Vector3.Distance(this.path[this.path.length - 1], vector) >= 50)) {
            this.path.push(vector);
            if (this.path && this.path.length >= 2) {
                this.pathMiddle.push(BABYLON.Vector3.Lerp(this.path[this.path.length - 2], vector, 0.5));
            }
        }

        this.planPos = mstate.planPos;
        api2D.requestRefresh();
    };

    oculusComponent.prototype.onOculusRefresh = function (ctx, translation, zoom, data) {
        if (this.path.length >= 2) {

            ctx.save();
            ctx.translate(translation.x, translation.y);
            ctx.scale(zoom, zoom);

            ctx.strokeStyle = "green";
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