"use client";

import { useRef } from "react";
import { useMatterportScene } from "../hooks/useMatterportScene";
import { MatterportContext } from "./MatterportContext";

const MatterportOverlay = ({ children }: { children: React.ReactNode | null }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const matterportScene = useMatterportScene(iframeRef);

    return (
        <div
            style={{
            position: "relative",
            width: "100vw",
            height: "100vh"
        }}>
            <MatterportContext.Provider value={matterportScene}>{children}</MatterportContext.Provider>
            <iframe
                id="showcase"
                ref={iframeRef}
                src={`/showcase-bundle/showcase.html?m=${process.env.NEXT_PUBLIC_MP_MODEL_ID}&applicationKey=${process.env.NEXT_PUBLIC_MP_SDK_KEY}`}
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none"
                }}
                allow="vr"
                allowFullScreen></iframe>
        </div>
    );
};
export default MatterportOverlay;
