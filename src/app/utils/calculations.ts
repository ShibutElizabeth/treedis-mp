import { Sweep } from "../../../public/showcase-bundle/sdk";
import { Position, Rotation } from "../types/utils";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const toDegrees = (rad: number) => rad * (180 / Math.PI);

const calculateRotation = (currentPos: Position, targetPos: Position): Rotation => {
    const { x: dx, y: dy, z: dz } = {
        x: targetPos.x - currentPos.x,
        y: targetPos.y - currentPos.y,
        z: targetPos.z - currentPos.z
    };

    const distance = Math.sqrt(dx * dx + dz * dz);
    const yRotation = ((toDegrees(Math.atan2(dx, dz)) + 360) % 360) - 180;
    const xRotation = toDegrees(Math.atan2(dy, distance));

    return {
        x: Math.max(-90, Math.min(90, xRotation)),
        y: yRotation
    };
};

const findMaxSweep = (sweeps: Sweep.ObservableSweepData[]) => {
    if (!sweeps.length) return null;
      
    sweeps.sort((a, b) => {
        if (b.position.x === a.position.x) {
            return b.position.z - a.position.z;
        }
        return b.position.x - a.position.x;
    });
      
    return sweeps[0]; 
};

export { delay, calculateRotation, findMaxSweep };