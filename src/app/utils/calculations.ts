import { MpSdk, Sweep } from "../../../public/showcase-bundle/sdk";
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

const interpolatePositions = (start: MpSdk.Vector3, end: MpSdk.Vector3, segments: number) => {
    const positions: MpSdk.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        positions.push({
            x: start.x + t * (end.x - start.x),
            y: start.y + t * (end.y - start.y),
            z: start.z + t * (end.z - start.z),
        });
    }
    return positions;
};

export { delay, calculateYRotation, findMaxSweep, interpolatePositions };