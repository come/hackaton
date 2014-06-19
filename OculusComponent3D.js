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
        this.computeAnimation(this.camera, begin, end, {smooth: "linear"});
    }

    oculusComponent.prototype.moveBaby = function(positions) {
        for(var i=0; i<positions.length-1; i++) {
            this.moveTo({
                begin: positions[i],
                end: positions[i+1]
            });
        }
    };

    oculusComponent.prototype.computeAnimation = function( target , src , dst , options ) {
        options = options || {};

        var   duration = Math.max( 0.01 , options.duration || 0 )
            , callback = options.callback
            , cleanAfterAnimation = typeof options.cleanAfterAnimation == 'undefined' ? true : options.cleanAfterAnimation
            , name = options.name || "animation"
            , isACamera = options.isACamera
            , smoothFn = typeof options.smooth == 'function' ? options.smooth : smoothFns[ options.smooth || 'linear' ]

        var anims = [];
        for( var property in src ){

            var animation = new BABYLON.Animation(
                name+"_"+property,
                property,
                60,
                src[ property ] instanceof BABYLON.Vector3 ? BABYLON.Animation.ANIMATIONTYPE_VECTOR3 : BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            var keys = [];

            // compute key frames
            var  km= (smoothFn==smoothFns.linear ? 2 : Math.max(2,duration/40))>>0 
                ,r
                ,v
            for(var k=km;k--;){

                r = k/(km-1);

                var t = r===0?0:r===1?1 : smoothFn( r );

                switch( animation.dataType ){
                    case BABYLON.Animation.ANIMATIONTYPE_VECTOR3 :
                        v = animation.vector3InterpolateFunction( src[ property ] , dst[ property ] , t );
                    break;
                    case BABYLON.Animation.ANIMATIONTYPE_FLOAT :
                        v = animation.floatInterpolateFunction( src[ property ] , dst[ property ] , t );
                    break;
                }

                keys.unshift({
                    frame: r*100,
                    value: v
                })

            }

            animation.setKeys( keys );

            anims.push( animation );
        }

        if( duration < 0.1 )
            return new AnimationCancelor( anims , target );

        // attach animations to the target
        target.animations = target.animations.concat( anims )


        var cancelor = new AnimationCancelor( anims , target );
        cancelor._callBack = callback;

        // ( ( 100 frame for the total animation ) / ( 60 frame per second ) ) * animationSpeed = duration
        var animationSpeed = ( 100 / 60 ) / ( duration / 1000 )

        // start the animation
        target.getScene().beginAnimation( target , 0, 100 , false , animationSpeed , cancelor._onAnimationEnd.bind(cancelor) ); 


        if( isACamera ){
            //// as the object animated is a camera, camera.move event should be triggered
            // let's register a function that will throw it every frame, and be killed with the cancelor
            var eventThrower = function eventThrower(){
                ujs.notify("wnp.engine3D.camera.move" );
            }
            var scene = target.getScene();

            scene.registerBeforeRender( eventThrower )
            cancelor._moreCleanUp = function(){
                scene.unregisterBeforeRender( eventThrower );
                eventThrower = null;
            }
        }

        return cancelor;
    }

    return oculusComponent;
})();