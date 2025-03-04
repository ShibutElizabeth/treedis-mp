import { Sweep } from "../../../public/showcase-bundle/sdk";
import { Position } from "../types/utils";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const toDegrees = (rad: number) => rad * (180 / Math.PI);

const calculateYRotation = (currentPos: Position, targetPos: Position): number => {
    const { x: dx, z: dz } = {
        x: targetPos.x - currentPos.x,
        z: targetPos.z - currentPos.z
    };

    return ((toDegrees(Math.atan2(dx, dz)) + 360) % 360) - 180;
};

const findMaxSweep = (sweeps: Sweep.ObservableSweepData[]): Sweep.ObservableSweepData | null =>
    sweeps.reduce((max, sweep) =>
        (sweep.position.x > max.position.x ||
            (sweep.position.x === max.position.x && sweep.position.z > max.position.z))
            ? sweep : max
    );

export { delay, calculateYRotation, findMaxSweep };