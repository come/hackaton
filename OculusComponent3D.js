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
    }

    oculusComponent.prototype.startListening = function () {
        this.onOculus3D = this.onOculus3D.bind(this);
        document.addEventListener("my.request.oculus3D", this.onOculus3D, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus3D", this.onOculus3D, false);
    }

    oculusComponent.prototype.onOculus3D = function () {
        this.camera = API.getCamera();
        var positions = [];
        var pos;

        for (var i = 0; i < 10; i++) {
            pos = this.camera.position.clone();
            positions.push(pos);
            pos.x += 30*i;
        }

        this.moveBaby(positions);

        console.log("done");
    }

    oculusComponent.prototype.moveTo = function(params) {
        var begin = params.begin;
        var end = params.end;
        this.computeAnimation(this.camera, { position : begin } , {position : end}, {
            smooth: "linear",
            duration : 1100,
            isACamera: true,
            callback : params.callback
        });
    }

    oculusComponent.prototype.moveBaby = function(positions, index) {
        console.log(index);
        this.camera.animations = [];
        var index = index !== undefined ? index : 0;
        if (index >= 10) return;

        this.moveTo({
            begin: positions[index],
            end: positions[index+1],
            callback : oculusComponent.prototype.moveBaby.bind(this, positions, index+1)
        });
    };

    var smoothFns = {
        linear : function(x){
            return x;
        },
        ease : function(x){
            return cubicBezier( x ,  0.5,0  ,  0.5,1 );
        },
        easeOut : function(x){
            return cubicBezier( x ,  0.64,0.47  ,  0.34,1 );
        },
    };


    /*
     * return the point on the cubic bezier at the t param
     */
    var pAtt = function( t , Ax,Ay ,  Bx,By   , resultat){
        
        resultat = resultat || {x:null,y:null}

        var t_ = 1-t;

        resultat.x = 3*t*t_*t_*Ax + 3*t*t*t_*Bx + t*t*t
        resultat.y = 3*t*t_*t_*Ay + 3*t*t*t_*By + t*t*t
        
        return resultat
    };
    /*
     * return param t for which the point on the cubic bezier x coordinate worth x
     */
    var tForx = function( x   , Ax,Ay , Bx,By ){

        var a=0,b=1,e,tmp={x:null,y:null};

        while( b-a > 0.001 )
            if(  pAtt( (e=(a+b)/2) , Ax,Ay , Bx,By , tmp  ).x > x )
                b=e;
            else
                a=e;
        
        return (a+b)/2;
    };
    /*
     * return the y coordinate of the point on the cubic bezier where x worth x
     */
    var cubicBezier = function( x , Ax,Ay ,  Bx,By ){
        return pAtt( tForx( x , Ax,Ay ,  Bx,By ) ,  Ax,Ay ,  Bx,By  ).y
    };

    var launchAnimation = function(target, src, dst, duration, property, callback) {
        var t = 0;
        var frameDuration = 16; // 60FPS
        var interval = setInterval(function() {
            t += frameDuration;

            if (t <= duration) {
                target[property] = src[property] + (dst[property] - src[property]) * t / duration;
            } 
            else {
                target[property] = dst[property];
                clearInterval(interval);
                if (callback) callback()
            }  
        }, frameDuration);
    }

    oculusComponent.prototype.computeAnimation = function( target , src , dst , options ) {
        options = options || {};

        var   duration = Math.max( 0.01 , options.duration || 0 )
            , callback = options.callback
            , isACamera = options.isACamera
            , smoothFn = typeof options.smooth == 'function' ? options.smooth : smoothFns[ options.smooth || 'linear' ]

        for( var property in src ){
            if (src[property] instanceof BABYLON.Vector3) {
                launchAnimation(target[property], src[property], dst[property], duration, "x");
                launchAnimation(target[property], src[property], dst[property], duration, "y");
                launchAnimation(target[property], src[property], dst[property], duration, "z", callback);
            }
            else {
                launchAnimation(target, src[property], dst[property], duration, property, callback);
            }
        }

        // if( isACamera ){
        //     //// as the object animated is a camera, camera.move event should be triggered
        //     // let's register a function that will throw it every frame, and be killed with the cancelor
        //     var eventThrower = function eventThrower(){
        //         ujs.notify("wnp.engine3D.camera.move" );
        //     }
        //     var scene = target.getScene();

        //     scene.registerBeforeRender( eventThrower )
        // }

        return;
    }

    return oculusComponent;
})();