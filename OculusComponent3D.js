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
        document.addEventListener("my.request.oculus3D", this.onOculus3D, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus3D", this.onOculus3D, false);
    }

    oculusComponent.prototype.onOculus3D = function () {
        var camera = API.getCamera();
        camera.moveLocal(new BABYLON.Vector3(0, 20, 0));
        camera.rotateLocal(new BABYLON.Vector3(0, Math.PI / 12, 0));

        console.log("done");
    }

    return oculusComponent;
})();