"use client";

import { useRef } from "react";
import { useMatterportScene } from "../hooks/useMatterportScene";
import { MatterportContext } from "./MatterportContext";
import ThreeModel from "./ThreeModel";
import styles from "@/app/page.module.css";

const MatterportOverlay = ({ children }: { children: React.ReactNode | null }) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const matterportScene = useMatterportScene(iframeRef);
    const {sdk} = matterportScene;

    return (
        <div className={styles.container}>
            <MatterportContext.Provider value={matterportScene}>
                <ThreeModel sdk={sdk} />
            </MatterportContext.Provider>
            <iframe
                id="showcase"
                ref={iframeRef}
                src={`/showcase-bundle/showcase.html?m=${process.env.NEXT_PUBLIC_MP_MODEL_ID}&applicationKey=${process.env.NEXT_PUBLIC_MP_SDK_KEY}`}
                className={styles.scene}
                allow="vr"
                allowFullScreen></iframe>
        </div>
    );
};
export default MatterportOverlay;
