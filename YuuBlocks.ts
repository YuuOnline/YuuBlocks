import { Color } from "./Yuu API/Basic Types/Color";
import { Quaternion } from "./Yuu API/Basic Types/Quaternion";
import { Vector3 } from "./Yuu API/Basic Types/Vector3";
import { inWorldConsole } from "./Yuu API/Console";
import { Controller } from "./Yuu API/Controller";
import { Entity } from "./Yuu API/Entity";
import { Events } from "./Yuu API/Events";
import { Player } from "./Yuu API/Player";
import { registerStart } from "./Yuu API/RegisterStart";
import { spawnPrimitive } from "./Yuu API/SpawnPrimitive";


let colorIndex = 0;
// Add intermediary colors and such
let colors: Color[] = [Color.lavender, Color.magenta, Color.pink, Color.red, Color.orange, Color.yellow, Color.green, Color.cyan, Color.blue, Color.purple, Color.black, new Color(0.5, 0.5, 0.5), Color.white];


type RayCastPerHandData = { pointer: Entity, previewCube: Entity, placementPos: Vector3 };

const leftRayCastPerHandData: RayCastPerHandData = {
  pointer: spawnPrimitive.cube(new Vector3(0, -10, 0), Vector3.one, Quaternion.one, colors[colorIndex], 0.5, false, 'Empty', undefined),
  previewCube: spawnPrimitive.cube(new Vector3(0, -5, 0), Vector3.one, Quaternion.one, colors[colorIndex], 0.35, false, 'Animated', undefined),
  placementPos: Vector3.zero,
}

const rightRayCastPerHandData: RayCastPerHandData = {
  pointer: spawnPrimitive.cube(new Vector3(0, -10, 0), Vector3.one, Quaternion.one, colors[colorIndex], 0.5, false, 'Empty', undefined),
  previewCube: spawnPrimitive.cube(new Vector3(0, -7.5, 0), Vector3.one, Quaternion.one, colors[colorIndex], 0.35, false, 'Animated', undefined),
  placementPos: Vector3.zero,
}


registerStart(start);
function start() {
  // inWorldConsole.visible(true, new Vector3(0, 1.5, -1.5));

  // console.log('Hello World!');

  Events.onPhysicsUpdate(onUpdate);

  Controller.subscribe('rightB', 'Pressed', updateRayColor);
  Controller.subscribe('leftY', 'Pressed', updateRayColor);

  Controller.subscribe('rightTrigger', 'Pressed', () => { placeBlock(true); });
  Controller.subscribe('leftTrigger', 'Pressed', () => { placeBlock(false); });
}


function onUpdate(deltaTime: number) {
  drawRayCast(leftRayCastPerHandData, false);
  drawRayCast(rightRayCastPerHandData, true);
}


function drawRayCast(perHandData: RayCastPerHandData, isRight: boolean) {
  const handPos = isRight ? Player.rightHand.position.get() : Player.leftHand.position.get();
  const handForward = isRight ? Player.rightHand.forward.get() : Player.leftHand.forward.get();

  if (handPos && handForward) {
    const rayPlacementPos = handPos.add(handForward.multiply(1.75));
    perHandData.placementPos = handPos.add(handForward.multiply(3.5));

    perHandData.pointer.pos = rayPlacementPos;
    perHandData.pointer.scale = new Vector3(0.001, 0.005, 3.5);
    perHandData.pointer.rot = Quaternion.lookAt(handForward, Vector3.up);

    perHandData.previewCube.pos = perHandData.placementPos;
  }
}

function updateRayColor() {
  colorIndex = (colorIndex + 1) % colors.length;

  leftRayCastPerHandData.pointer.mesh.color.set(colors[colorIndex], 0.5);
  rightRayCastPerHandData.pointer.mesh.color.set(colors[colorIndex], 0.5);

  leftRayCastPerHandData.previewCube.mesh.color.set(colors[colorIndex], 0.5);
  rightRayCastPerHandData.previewCube.mesh.color.set(colors[colorIndex], 0.5);
}

function placeBlock(isRight: boolean) {
  const perHandData = isRight ? rightRayCastPerHandData : leftRayCastPerHandData;

  spawnPrimitive.cube(perHandData.placementPos, Vector3.one, Quaternion.one, colors[colorIndex], 1, true, 'Static', undefined);
}