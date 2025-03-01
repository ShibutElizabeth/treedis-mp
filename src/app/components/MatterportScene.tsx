"use client";

import {useCallback, useEffect, useRef} from "react";

type WindowWithMP_SDK = Window & {
    MP_SDK: {
      connect: (window: Window) => Promise<unknown>;
    };
};

const MatterportScene = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const mpSdk = useRef<any | null>(null);

    const initializeMatterport = useCallback(async () => {
        const showcase = document.getElementById('showcase') as HTMLIFrameElement;
        if (!showcase) return;
    
        showcase.onload = async () => {
                const showcaseWindow = showcase.contentWindow as WindowWithMP_SDK;
                mpSdk.current = await showcaseWindow.MP_SDK.connect(showcaseWindow);

                console.log('Hello Bundle SDK', mpSdk.current);
            };
        }, []);
    
      useEffect(() => {
        initializeMatterport();
        
    
        return () => {
            mpSdk.current?.disconnect();
        };
    }, []);


    return (
        <div
            style={{
            position: "relative",
            width: "100vw",
            height: "100vh"
        }}>
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
export default MatterportScene;
