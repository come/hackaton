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

    var newCameras;
    var anims = [];

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
        //document.addEventListener("keydown", this.onOculus3D, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus3D", this.onOculus3D, false);
    }

/*    oculusComponent.prototype.moveForward = function () {
              if (that.keysUp.indexOf(evt.keyCode) !== -1 ||
                that.keysDown.indexOf(evt.keyCode) !== -1 ||
                that.keysLeft.indexOf(evt.keyCode) !== -1 ||
                that.keysRight.indexOf(evt.keyCode) !== -1) {
                var index = that._keys.indexOf(evt.keyCode);

                if (index === -1) {
                  that._keys.push(evt.keyCode);
                }
              }
              console.log("test");
    });*/

    oculusComponent.prototype.onOculus3D = function () {
        var body = document.body;

        for (var i = 0; i < body.children.length; i ++) {
            if (body.children[i].id != "container3d") {
                body.children[i].style.visibility = "hidden";
            }
        }

        document.getElementById("container3d").children[0].style.width = window.innerWidth+"px";

        wanaplan.setSize(window.innerWidth, window.innerHeight);
        var originScene = API.getScene();
        var originCamera = originScene.activeCamera;
        newCameras = BABYLON.OculusOrientedCamera.BuildOculusStereoCamera(originScene, "Oculus", originCamera.minZ, originCamera.maxZ, originCamera.position, { yaw: 3, pitch: 0, roll: 0 }, false, true, true);
        this.camera = API.getCamera();

        this.moveBaby(wanaplan.structure.params.pathOculus);

        console.log("done");
    }

    oculusComponent.prototype.moveTo = function(params) {
        anims = [];
        var begin = params.begin;
        var end = params.end;
        var speed = 330;
        var duration = begin.distanceTo(end) / speed * 1000;

        this.computeAnimation(newCameras.leftCamera, { position : begin } , {position : end}, {
            smooth: "linear",
            duration : duration,
            isACamera: true,
            callback : params.callback
        });
        this.computeAnimation(newCameras.rightCamera, { position : begin } , {position : end}, {
            smooth: "linear",
            duration : duration,
            isACamera: true,
            callback : params.callback
        });
        this.launchAnimation();
    }

    oculusComponent.prototype.moveBaby = function(positions, index) {
        var index = index !== undefined ? index : 0;
        if (index >= (wanaplan.structure.params.pathOculus.length - 1)) return;

        var begin = positions[index].clone();
        var end = positions[index+1].clone();
        begin.z = -begin.z;
        end.z = -end.z;

        this.moveTo({
            begin: begin,
            end: end,
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

    var Animation = function(target, src, dst, duration, property, callback) {
        this.target = target;
        this.src = src;
        this.dst = dst;
        this.duration = duration;
        this.property = property;
        this.callback = callback;
        return this;
    }

    oculusComponent.prototype.launchAnimation = function() {
        var t = 0;
        var frameDuration = 16; // 60FPS
        var interval;
        var animationStep = function() {
            t += frameDuration;

            for (var i = 0; i < anims.length; i++) {
                if (t <= anims[i].duration) {
                    anims[i].target[anims[i].property] = anims[i].src[anims[i].property] + (anims[i].dst[anims[i].property] - anims[i].src[anims[i].property]) * t / anims[i].duration;
                    if (anims[i].property == 'z') {
                        newCameras.leftCamera.resetViewMatrix();
                        newCameras.rightCamera.resetViewMatrix();
                    }
                } 
                else {
                    anims[i].target[anims[i].property] = anims[i].dst[anims[i].property];
                    if (anims[i].callback) {
                        clearInterval(interval);
                        anims[i].callback()
                    }
                }  
            }
        }

        interval = setInterval(animationStep, frameDuration);
    }

    oculusComponent.prototype.computeAnimation = function( target , src , dst , options ) {
        options = options || {};

        var   duration = Math.max( 0.01 , options.duration || 0 )
            , callback = options.callback
            , isACamera = options.isACamera
            , smoothFn = typeof options.smooth == 'function' ? options.smooth : smoothFns[ options.smooth || 'linear' ]

        for( var property in src ){
            if (src[property] instanceof BABYLON.Vector3) {
                anims.push(new Animation(target[property], src[property], dst[property], duration, "x"));
                anims.push(new Animation(target[property], src[property], dst[property], duration, "y"));
                anims.push(new Animation(target[property], src[property], dst[property], duration, "z", target == newCameras.rightCamera ? callback : null));
                // launchAnimation(target[property], src[property], dst[property], duration, "x");
                // launchAnimation(target[property], src[property], dst[property], duration, "y");
                // launchAnimation(target[property], src[property], dst[property], duration, "z", callback);
            }
            else {
                this.launchAnimation(target, src[property], dst[property], duration, property, callback);
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