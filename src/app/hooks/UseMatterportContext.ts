import { useContext } from "react";
import { MatterportContext } from "../components/matterport/MatterportContext";

export const useMatterportContext = () => {
    const context = useContext(MatterportContext);
    if (!context) {
      throw new Error("useMatterportContext should be used inside Matterport component");
    }
    return context;
};