import { MpSdk, Sweep } from "../../../public/showcase-bundle/sdk";

export const findMaxSweep = (sweeps: Sweep.ObservableSweepData[]) =>
    sweeps.reduce((max, sweep) =>
        (sweep.position.x > max.position.x ||
            (sweep.position.x === max.position.x && sweep.position.z > max.position.z))
            ? sweep : max
    );

export const addTagToFarRoom = async (sdk: MpSdk, farSweep: Sweep.ObservableSweepData) => {
    try {
        await sdk.Tag.add({
            label: "Office",
            anchorPosition: { ...farSweep.position, y: 1 },
            stemVector: { x: 0, y: 0.1, z: 0 },
            color: { r: 1.0, g: 0.0, b: 1.0 },
        });
    } catch (e) {
        console.error("Failed to add tag:", e);
    }
};
