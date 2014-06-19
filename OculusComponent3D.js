/**
 * @module Wanaplan
 * @submodule Component
 */

var OculusComponent3D = (function () {

    /**
     * OculusComponent3D.
     *
     * @class PerformanceComponent3D
     * @constructor
     * @extends BaseComponent3D
     */
    var oculusComponent = function(core) {
        BaseComponent3D.call(this, core, "OculusComponent3D");
        this.localPath = "http://localhost/hackaton/";
        this.camera = null;

        return this;
    };

    oculusComponent.prototype = new BaseComponent3D();

    oculusComponent.prototype.initialize = function () {
       var item = {
         title : _("Oculus 3D"),
         icon : this.localPath + "images/oculus.png",
         action : "my.request.oculus3D",
         index: 1001
       }

       API.Menu.add(API.Menu.MENU_TOP_2, item);
       this.startListening();
    }

    oculusComponent.prototype.startListening = function () {
        document.addEventListener("my.request.oculus3D", this.onOculus3D.bind(this), false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus3D", this.onOculus3D.unbind(this), false);
    }

    oculusComponent.prototype.onOculus3D = function () {
        this.camera = API.getCamera();
        this.moveBaby([
            new BABYLON.Vector3(0,0,0),
            new BABYLON.Vector3(0,0,-60)
        ]);

        console.log("done");
    }

    oculusComponent.prototype.moveTo = function(params) {
        var begin = params.begin;
        var end = params.end;
        API.computeAnimation(this.camera, begin, end, {smooth: "linear"});
    }

    oculusComponent.prototype.moveBaby = function(positions) {
        for(var i=0; i<positions.length-1; i++) {
            this.moveTo({
                begin: positions[i],
                end: positions[i+1]
            });
        }
    }

    return oculusComponent;
})();