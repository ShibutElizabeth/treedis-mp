"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";

type WindowWithMP_SDK = Window & {
    MP_SDK: {
      connect: (window: Window) => Promise<unknown>;
    };
};

const MatterportScene = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
    const [currentSweep, setCurrentSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [cameraPose, setCameraPose] = useState<Camera.Pose | null>(null);


    useEffect(() => {
        if (!iframeRef.current){ 
            return;
        }

        const showcase = document.getElementById('showcase') as HTMLIFrameElement;
        
        if (!showcase) {
            return;
        }
        
        const showcaseWindow = showcase.contentWindow as WindowWithMP_SDK;

        const initMatterport = async () => {
            try {
                const mpSdk: any = await showcaseWindow.MP_SDK.connect(showcaseWindow);
                setMpSdk(mpSdk);

                console.log('Hello Bundle SDK', mpSdk);
            } catch (e) {
                console.error(e);

                return;
            }
        };

        if (showcaseWindow.document.readyState === 'complete') {
            initMatterport();
        } else {
            showcaseWindow.addEventListener('load', initMatterport);
        }

        return () => {
            showcaseWindow.removeEventListener('load', initMatterport);
            mpSdk?.disconnect();
        };
    }, []);

    useEffect(() => {
        if(!mpSdk){
            return;
        }
        
        const logCameraPose = () => {
            mpSdk.Camera.pose.subscribe((pose) => {
                setCameraPose(pose);
                console.log("Current Camera Position:", pose.position);
            });
        };
    
        const logCurrentSweep = () => {
            mpSdk.Sweep.current.subscribe((sweep) => {
                setCurrentSweep(sweep);
                console.log("Current Sweep Position:", sweep.position);
            });
        };

        logCameraPose();
        logCurrentSweep();

    }, [mpSdk])


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
