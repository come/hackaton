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
          title : _("Oculus"),
          icon : this.localPath + "images/oculus.png",
          action : "my.request.oculus",
          index: 1000
        }

        API.Menu.add(API.Menu.MENU_TOP_2, item);

        this.startListening();
    }

    oculusComponent.prototype.startListening = function () {
        document.addEventListener("my.request.oculus", this.onOculus, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus", this.onOculus, false);
    }

    oculusComponent.prototype.onOculus = function () {
        
    }

    return oculusComponent;
})();