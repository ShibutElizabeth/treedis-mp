import { createContext } from "react";
import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";

type MatterportContextType = {
    sdk: MpSdk | null;
    cameraPose: Camera.Pose | null,
	currentSweep: Sweep.ObservableSweepData | null,
  };
  
export const MatterportContext = createContext<MatterportContextType>({
    sdk: null,
    cameraPose: null,
    currentSweep: null
});