describe('OculusComponent2D', function () {

    function buildDoor(x, y) {
        return  {
            getAbsolutePos: function () {
                return {
                    position: {
                        x: x,
                        y: y
                    }
                }
            }
        }
    }

    it('should instantiate component', function () {

        //when
        var oculusComponent = new OculusComponent2D()

        //then
        expect(oculusComponent).toBeDefined();

    });

    it('should findAndAddDoorInPath', function () {

        //given
        var oculusComponent = new OculusComponent2D();

        //when
        oculusComponent.structure.members[0].overtures = [
            buildDoor(200, 300),
            buildDoor(110, 90),
            buildDoor(105, 95),
            buildDoor(1000, 300)
        ];

        var mousePosition = new BABYLON.Vector3(100, 175, 100);

        //then
        var door = oculusComponent.findAndAddDoorInPath(mousePosition);
        expect(door.x).toEqual(105);
        expect(door.y).toEqual(95);
    });

});