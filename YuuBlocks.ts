import { Color } from "./Yuu API/Basic Types/Color";
import { Quaternion } from "./Yuu API/Basic Types/Quaternion";
import { Vector3 } from "./Yuu API/Basic Types/Vector3";
import { inWorldConsole } from "./Yuu API/Console";
import { Controller } from "./Yuu API/Controller";
import { Entity } from "./Yuu API/Entity";
import { entityRayClick_Data } from "./Yuu API/EntityRayClick_Data";
import { Events } from "./Yuu API/Events";
import { Player } from "./Yuu API/Player";
import { Raycast } from "./Yuu API/Raycast";
import { registerStart } from "./Yuu API/RegisterStart";
import { spawnPrimitive } from "./Yuu API/SpawnPrimitive";


let colorIndex = 0;
// Add intermediary colors and such
let colors: Color[] = [Color.purple, Color.magenta, Color.lavender, Color.pink, Color.red, Color.orange, Color.yellow, Color.green, Color.cyan, Color.blue, Color.black, Color.darkGray, Color.gray, Color.lightGray, Color.white];


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

let mode = 0;

registerStart(start);
function start() {
  Events.onPhysicsUpdate(onUpdate);

  Controller.subscribe('leftY', 'Pressed', () => { updateRayColor(true); });
  Controller.subscribe('leftX', 'Pressed', () => { updateRayColor(false); });

  Controller.subscribe('rightB', 'Pressed', updateMode);

  Controller.subscribe('rightTrigger', 'Pressed', () => { placeBlock(true); });
  Controller.subscribe('leftTrigger', 'Pressed', () => { placeBlock(false); });
}


function onUpdate(deltaTime: number) {
  console.log(JSON.stringify(entityRayClick_Data.rightRayProperties.rayHit?.pos));

  drawRayCast(leftRayCastPerHandData, false);
  drawRayCast(rightRayCastPerHandData, true);
}


function drawRayCast(perHandData: RayCastPerHandData, isRight: boolean) {
  const handPos = (isRight ? Player.rightHand.position.get() : Player.leftHand.position.get()) ?? Vector3.zero;
  const handForward = (isRight ? Player.rightHand.forward.get() : Player.leftHand.forward.get()) ?? Vector3.zero;
  
  const rayHit = Raycast.directional(handPos, handForward, 3.5);
  
  const isDeleteMode = mode === 1;
  
  let destPos =  rayHit?.entity?.pos;
  
  if (destPos === undefined) {
    destPos = handPos.add(handForward.multiply(3.5));
  }
  else {
    if (!isDeleteMode && rayHit) {
      destPos.add(rayHit.normal);
    }
  }
  
  const rayPlacementPos = handPos.lerp(destPos, 0.5);
  perHandData.placementPos = destPos;
  perHandData.placementPos.x = Math.floor(perHandData.placementPos.x) + 0.5;
  perHandData.placementPos.y = Math.max(0.5, Math.floor(perHandData.placementPos.y) + 0.5);
  perHandData.placementPos.z = Math.floor(perHandData.placementPos.z) + 0.5;

  perHandData.pointer.pos = rayPlacementPos;
  perHandData.pointer.scale = new Vector3(0.001, 0.005, 3.5);
  perHandData.pointer.rot = Quaternion.lookAt(handForward, Vector3.up);

  let showCube = true;

  if (isDeleteMode) {
    const key = perHandData.placementPos.toString();

    const curBlock = blocks.get(key);

    showCube = (curBlock !== undefined);
  }

  if (showCube) {
    perHandData.previewCube.pos = perHandData.placementPos;
  }
  else {
    perHandData.previewCube.pos = new Vector3(0, -5, 0);
  }
}

function updateRayColor(isForward: boolean) {
  const addAmount = isForward ? 1 : (colors.length - 1);

  colorIndex = (colorIndex + addAmount) % colors.length;

  leftRayCastPerHandData.pointer.mesh.color.set(colors[colorIndex], 0.5);
  rightRayCastPerHandData.pointer.mesh.color.set(colors[colorIndex], 0.5);

  leftRayCastPerHandData.previewCube.mesh.color.set(colors[colorIndex], 0.5);
  rightRayCastPerHandData.previewCube.mesh.color.set(colors[colorIndex], 0.5);
}

function updateMode() {
  mode = (mode + 1) % 2;

  const isPlaceMode = mode === 0;

  const scale = isPlaceMode ? Vector3.one : new Vector3(1.05, 1.05, 1.05);
  const color = isPlaceMode ? colors[colorIndex] : new Color(0.5, 0, 0);
  const alpha = isPlaceMode ? 0.5 : 0.8;

  leftRayCastPerHandData.previewCube.mesh.color.set(color, alpha);
  rightRayCastPerHandData.previewCube.mesh.color.set(color, alpha);

  leftRayCastPerHandData.previewCube.scale = scale;
  rightRayCastPerHandData.previewCube.scale = scale;
}


const blocks = new Map<string, Entity>();

function placeBlock(isRight: boolean) {
  const perHandData = isRight ? rightRayCastPerHandData : leftRayCastPerHandData;

  const key = perHandData.placementPos.toString();

  const curBlock = blocks.get(key);
  curBlock?.destroy();

  const isPlaceMode = mode === 0;

  if (isPlaceMode) {
    const newBlock = spawnPrimitive.cube(perHandData.placementPos, Vector3.one, Quaternion.one, colors[colorIndex], 1, true, 'Static', undefined);

    newBlock.rayClick.initialize(false);

    blocks.set(key, newBlock);
  }
  else {
    blocks.delete(key);
  }
}