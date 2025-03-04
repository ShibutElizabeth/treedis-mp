import { Sweep } from "../../../public/showcase-bundle/sdk";
import { Position } from "../types/utils";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const toDegrees = (rad: number) => rad * (180 / Math.PI);

const calculateYRotation = (currentPos: Position, targetPos: Position): number => {
    const { x: dx, z: dz } = {
        x: targetPos.x - currentPos.x,
        z: targetPos.z - currentPos.z
    };

    const yRotation = ((toDegrees(Math.atan2(dx, dz)) + 360) % 360) - 180;

    return yRotation;
};

const findMaxSweep = (sweeps: Sweep.ObservableSweepData[]): Sweep.ObservableSweepData | null => {
    if (!sweeps.length) return null;
      
    sweeps.sort((a, b) => {
        if (b.position.x === a.position.x) {
            return b.position.z - a.position.z;
        }
        return b.position.x - a.position.x;
    });
      
    return sweeps[0]; 
};

export { delay, calculateYRotation, findMaxSweep };