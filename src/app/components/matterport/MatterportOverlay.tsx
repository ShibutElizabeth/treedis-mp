"use client";

import { useRef } from "react";
import { useMatterportScene } from "../../hooks/useMatterportScene";
import { MatterportContext } from "./MatterportContext";
import ThreeModel from "../three/ThreeModel";
import styles from "@/app/page.module.css";
import { Menu } from "../menu/Menu";
import BlueDotPath from "../three/BlueDotPath";

const MatterportOverlay = () => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const matterportScene = useMatterportScene(iframeRef);

    return (
        <div className={styles.container}>
            <MatterportContext.Provider value={matterportScene}>
                <ThreeModel />
                <BlueDotPath />
                <Menu></Menu>
            </MatterportContext.Provider>
            <iframe
                id="showcase"
                ref={iframeRef}
                src={`/showcase-bundle/showcase.html?m=${process.env.NEXT_PUBLIC_MP_MODEL_ID}&applicationKey=${process.env.NEXT_PUBLIC_MP_SDK_KEY}`}
                className={styles.scene}
                allowFullScreen></iframe>
        </div>
    );
};
export default MatterportOverlay;
