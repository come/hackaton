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


    var AnimationCancelor = function( animations , target ){ 
        this.animations=animations
        this.target=target;

        if( this.target._animationCancelor )
            this.target._animationCancelor.cancel();

        this.target._animationCancelor = this;
    }
    AnimationCancelor.prototype.cancel = function(){
        
        if( this.target._animationCancelor != this )
            return;

        this.target.getScene().stopAnimation( this.target );

        this._onAnimationEnd();
    }
    AnimationCancelor.prototype._onAnimationEnd = function(){

        if( this.target._animationCancelor != this )
            return;

        this.target._animationCancelor = null;

        if( this._moreCleanUp )
            this._moreCleanUp();

        if( this._callBack )
            this._callBack();

        if( !this.animations )
            return;

        for(var i=this.animations.length;i--;)
            for(var k=this.target.animations.length;k--;)
                if( this.animations[i] == this.target.animations[k] )
                    this.target.animations.splice(k,1);

        this.animations = null;
    }

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