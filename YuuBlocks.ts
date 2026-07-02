import { Color } from "./Yuu API/Basic Types/Color";
import { Quaternion } from "./Yuu API/Basic Types/Quaternion";
import { Vector3 } from "./Yuu API/Basic Types/Vector3";
import { inWorldConsole } from "./Yuu API/Console";
import { Entity } from "./Yuu API/Entity";
import { Events } from "./Yuu API/Events";
import { Player } from "./Yuu API/Player";
import { registerStart } from "./Yuu API/RegisterStart";
import { spawnPrimitive } from "./Yuu API/SpawnPrimitive";


let colorHue = Math.random();
let color = Color.fromHSV(colorHue, 1, 1);

const rayCasts = {
  leftPointer: spawnPrimitive.cube(new Vector3(0, -10, 0), Vector3.one, Quaternion.one, color, 0.5, false, 'Empty', undefined),
  rightPointer: spawnPrimitive.cube(new Vector3(0, -10, 0), Vector3.one, Quaternion.one, color, 0.5, false, 'Empty', undefined),
}


registerStart(start);
function start() {
  inWorldConsole.visible(true, new Vector3(0, 1.5, -1.5));

  console.log('Hello World!');

  Events.onPhysicsUpdate(onUpdate);
}


function onUpdate(deltaTime: number) {
  drawRayCast(rayCasts.leftPointer, false);
  drawRayCast(rayCasts.rightPointer, true);
}


function drawRayCast(pointer: Entity, isRight: boolean) {
  const handPos = isRight ? Player.rightHand.position.get() : Player.leftHand.position.get();
  const handForward = isRight ? Player.rightHand.forward.get() : Player.leftHand.forward.get();

  if (handPos && handForward) {
    const placementPos = handPos.add(handForward.multiply(2.5));

    pointer.pos = placementPos;
    pointer.scale = new Vector3(0.001, 0.005, 5);
    pointer.rot = Quaternion.lookAt(handForward, Vector3.up);
  }
}

function updateRayColor() {
  colorHue = Math.random();
  color = Color.fromHSV(colorHue, 1, 1);

  rayCasts.leftPointer.mesh.color.set(color, 0.5);
  rayCasts.rightPointer.mesh.color.set(color, 0.5);
}