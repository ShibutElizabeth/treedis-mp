import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";
import { ToOffice } from "./utils";

export type WindowWithMP_SDK = Window & {
    MP_SDK: {
      connect: (window: Window) => Promise<unknown>;
    };
};

export type MatterportContextType = {
    sdk: MpSdk | null;
    cameraPose: Camera.Pose | null,
    currentSweep: Sweep.ObservableSweepData | null,
    sweeps: Sweep.ObservableSweepData[],
    toOffice: (walkingStyle: ToOffice) => void
};