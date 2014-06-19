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
    var oculusComponent = function(core) {
        BaseComponent2D.call(this, core, "OculusComponent2D");
        this.localPath = "http://localhost/hackaton/";

        return this;
    };

    oculusComponent.prototype = new BaseComponent2D();

    oculusComponent.prototype.initialize = function () {
         
        var item = {
          title : _("Oculus"),
          icon : this.localPath + "images/oculus.png",
          action : "onOculusClick",
          index: 1000
        }

        API.Menu.add(API.Menu.MENU_TOP_2, item);

        this.startListening();
    }

    oculusComponent.prototype.startListening = function () {
        document.addEventListener("onOculusClick", this.onOculus, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("onOculusClick", this.onOculus, false);
    }

    oculusComponent.prototype.onOculus = function () {
        console.log('"ok');
    }

    return oculusComponent;
})();