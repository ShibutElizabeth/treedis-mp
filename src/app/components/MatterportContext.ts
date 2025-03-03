import { createContext } from "react";

type MatterportContextType = {
    sdk: any | null;
  };
  
export const MatterportContext = createContext<MatterportContextType | null>(null);