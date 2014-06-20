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
      
    }

    oculusComponent.prototype.startListening = function () {
        this.onOculus3D = this.onOculus3D.bind(this);
        document.addEventListener("my.request.oculus3D", this.onOculus3D, false);
        document.addEventListener("my.request.oculus", this.onOculus3D, false);
        //document.addEventListener("keydown", this.onOculus3D, false);
    }

    oculusComponent.prototype.stopListening = function () {
        document.removeEventListener("my.request.oculus", this.onOculus3D, false);
    }

    oculusComponent.prototype.moveForward = function (evt) {
              var normal = new BABYLON.Vector3(-newCameras.leftCamera._actualDirection.z, 0, newCameras.leftCamera._actualDirection.x)
              var direction = newCameras.leftCamera._actualDirection;
              direction.y=0
              normal.scaleInPlace(10);
              direction.scaleInPlace(10);
              if (evt.keyCode == 38){
                var currentCamera = API.getCamera();
                newCameras.leftCamera.position.addInPlace(direction);
                newCameras.rightCamera.position.addInPlace(direction);
              }
              else if (evt.keyCode == 39){
                var currentCamera = API.getCamera();
                newCameras.leftCamera.position.subtractInPlace(normal);
                newCameras.rightCamera.position.subtractInPlace(normal);
              }
              else if (evt.keyCode == 37){
                var currentCamera = API.getCamera();
                newCameras.leftCamera.position.addInPlace(normal);
                newCameras.rightCamera.position.addInPlace(normal);
              }
              else if (evt.keyCode == 40){
                var currentCamera = API.getCamera();
                newCameras.leftCamera.position.subtractInPlace(direction);
                newCameras.rightCamera.position.subtractInPlace(direction);
              }
    }

    oculusComponent.prototype.onOculus3D = function () {
        var body = document.body;

        for (var i = 0; i < body.children.length; i ++) {
            if (body.children[i].id != "container3d") {
                body.children[i].style.visibility = "hidden";
            }
        }

        document.getElementById("container3d").children[0].style.width = window.innerWidth+"px";

        wanaplan.setSize(window.innerWidth, window.innerHeight);
        var currentScene = API.getScene();
        var currentCamera = currentScene.activeCamera;
        newCameras = BABYLON.OculusOrientedCamera.BuildOculusStereoCamera(currentScene, "Oculus", currentCamera.minZ, currentCamera.maxZ, currentCamera.position, { yaw: 3, pitch: 0, roll: 0 }, false, true, true);
        document.addEventListener("keydown", this.moveForward, false);
        this.camera = API.getCamera();

        var params = wanaplan.structure.params.pathOculus;

        var pyr = {
            pitch : 0,
            yaw : Math.atan2(params[0].z - params[1].z, params[0].x - params[1].x) - Math.PI / 2,
            roll : 0
        };
        newCameras.leftCamera._currentOrientation = pyr
        newCameras.rightCamera._currentOrientation = pyr;

        this.moveBaby(params);
    }

    oculusComponent.prototype.moveTo = function(params) {
        anims = [];
        var begin = params.begin;
        var end = params.end;
        var speed = 100;
        var duration = begin.distanceTo(end) / speed * 1000;

        var beginRotation = newCameras.leftCamera._currentOrientation;
        var pyr = {
            pitch : 0,
            yaw :  (3 * Math.PI / 2 - Math.atan2(begin.z - end.z, begin.x - end.x)) % (2 * Math.PI),
            roll : 0
        };
        if(pyr.yaw > Math.PI) {
            pyr.yaw = pyr.yaw - 2 * Math.PI;
        }
        if(pyr.yaw < -Math.PI) {
            pyr.yaw = pyr.yaw + 2 * Math.PI;
        }
        console.log(pyr.yaw);

        var endRotation = { 
            yaw : pyr.yaw,
            pitch : pyr.pitch,
            roll : pyr.roll
        };

        this.computeAnimation(newCameras.leftCamera, { position : begin, _currentOrientation : beginRotation  } , { position : end, _currentOrientation : endRotation }, {
            smooth: "linear",
            duration : duration,
            isACamera: true,
            callback : params.callback
        });
        this.computeAnimation(newCameras.rightCamera, { position : begin, _currentOrientation : beginRotation  } , { position : end, _currentOrientation : endRotation }, {
            smooth: "linear",
            duration : duration,
            isACamera: true,
            callback : params.callback
        });
        this.launchAnimation();
    }

      oculusComponent.prototype.moveBaby2 = function(positions, index) {
        var index = index !== undefined ? index : 0;
        if (index >= (positions.length - 1)) return;

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
                anims.push(new Animation(target[property], src[property], dst[property], duration, "z"));
                // launchAnimation(target[property], src[property], dst[property], duration, "x");
                // launchAnimation(target[property], src[property], dst[property], duration, "y");
                // launchAnimation(target[property], src[property], dst[property], duration, "z", callback);
            } else if (src[property].yaw) {
                anims.push(new Animation(target[property], src[property], dst[property], duration, "yaw"));
                anims.push(new Animation(target[property], src[property], dst[property], duration, "pitch"));
                anims.push(new Animation(target[property], src[property], dst[property], duration, "roll", target == newCameras.rightCamera ? callback : null));
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

    oculusComponent.prototype.setFromEuler = function (euler, update) {

        // http://www.mathworks.com/matlabcentral/fileexchange/
        //  20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
        //  content/SpinCalc.m

        var c1 = Math.cos( euler._x / 2 );
        var c2 = Math.cos( euler._y / 2 );
        var c3 = Math.cos( euler._z / 2 );
        var s1 = Math.sin( euler._x / 2 );
        var s2 = Math.sin( euler._y / 2 );
        var s3 = Math.sin( euler._z / 2 );

        var quaternion = { _w : 0, _x : 0, _y : 0, _z : 0 };

        if ( !euler.order || euler.order === 'XYZ' ) {

            quaternion._x = s1 * c2 * c3 + c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 - s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 + s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if ( euler.order === 'YXZ' ) {

            quaternion._x = s1 * c2 * c3 + c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 - s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 - s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 + s1 * s2 * s3;

        } else if ( euler.order === 'ZXY' ) {

            quaternion._x = s1 * c2 * c3 - c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 + s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 + s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if ( euler.order === 'ZYX' ) {

            quaternion._x = s1 * c2 * c3 - c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 + s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 - s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 + s1 * s2 * s3;

        } else if ( euler.order === 'YZX' ) {

            quaternion._x = s1 * c2 * c3 + c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 + s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 - s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 - s1 * s2 * s3;

        } else if ( euler.order === 'XZY' ) {

            quaternion._x = s1 * c2 * c3 - c1 * s2 * s3;
            quaternion._y = c1 * s2 * c3 - s1 * c2 * s3;
            quaternion._z = c1 * c2 * s3 + s1 * s2 * c3;
            quaternion._w = c1 * c2 * c3 + s1 * s2 * s3;

        }



        return quaternion;

    }

    return oculusComponent;
})();