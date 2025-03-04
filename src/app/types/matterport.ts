import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";

export type WindowWithMP_SDK = Window & {
    MP_SDK: {
      connect: (window: Window) => Promise<unknown>;
    };
};

export type MatterportContextType = {
    sdk: MpSdk | null;
    cameraPose: Camera.Pose | null,
    currentSweep: Sweep.ObservableSweepData | null
};