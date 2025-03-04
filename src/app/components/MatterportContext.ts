import { createContext } from "react";
import { MatterportContextType } from "../types/matterport";
  
export const MatterportContext = createContext<MatterportContextType>({
    sdk: null,
    cameraPose: null,
    currentSweep: null,
    sweeps: []
});