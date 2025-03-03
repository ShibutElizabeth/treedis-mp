import { useContext } from "react";
import { MatterportContext } from "../components/MatterportContext";

export const useMatterportContext = () => {
    const context = useContext(MatterportContext);
    if (!context) {
      throw new Error("useMatterport should be used inside MatterportProvider");
    }
    return context;
};