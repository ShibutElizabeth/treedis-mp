import { MpSdk, Sweep } from "../../../public/showcase-bundle/sdk";
import { WindowWithMP_SDK } from "../types/matterport";

export const initMatterport = async (
    showcaseWindow: WindowWithMP_SDK,
    setMpSdk: (sdk: MpSdk) => void
) => {
    try {
        const mpSdk = await showcaseWindow.MP_SDK.connect(showcaseWindow) as MpSdk;
        setMpSdk(mpSdk);
        console.log("Hello Bundle SDK", mpSdk);
    } catch (e) {
        console.error("Failed to initialize Matterport SDK:", e);
    }
};

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
