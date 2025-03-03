"use client";

import { RefObject, useEffect, useState } from "react";
import { MpSdk, Camera, Sweep, Tag } from "../../../public/showcase-bundle/sdk";
import { WindowWithMP_SDK } from "../types/matterport";

export const useMatterportScene = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
    const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
    const [currentSweep, setCurrentSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [sweeps, setSweeps] = useState<Sweep.ObservableSweepData[] | null>([]);
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

    const addTagToFarRoom = async (sdk: MpSdk) => {
        try {
            if(currentSweep && sweeps){
                const graph = await sdk.Sweep.createGraph();

                const filteredSweeps = sweeps.filter((sweep) => sweep.floorInfo.sequence === 1);
                const allowedSweepIds = filteredSweeps.map((sweep) => sweep.sid);

                let farthestSweep: Sweep.ObservableSweepData | null = filteredSweeps[0];
                let maxDistance = 0;

                for (const edge of graph.edges) {
                    const { src, dst, weight } = edge;
    
                    const srcId = (src as unknown as Sweep.ObservableSweepData).sid;
                    const dstId = (dst as unknown as Sweep.ObservableSweepData).sid;
    
                    if (srcId === currentSweep.sid && allowedSweepIds.includes(dstId) && weight > maxDistance) {
                        maxDistance = weight;
                        farthestSweep = filteredSweeps.find((sweep) => sweep.sid === dstId) || null;
                    }
                }

                console.log("Farthest Sweep:", farthestSweep);

                const tagPosition = farthestSweep ? farthestSweep.position : {x: 1, y: 1, z: 1};
                console.log("Tag position:", tagPosition);

                const newTag: MpSdk.Tag.Descriptor[] = [{
                    label: 'Office',
                    anchorPosition: {
                        x: 60.89,
                        y: 3,
                        z: -4.7,
                    },
                    stemVector: {
                        x: 0,
                        y: 0.1,
                        z: 0,
                    },
                    color: {
                        r: 1.0,
                        g: 0.0,
                        b: 1.0,
                    }
                }];

                await sdk.Tag.add(...newTag);
            }
            
        } catch (e) {
            console.error("Failed to add tag: ", e);
        }
    };

    useEffect(() => {
        if(!mpSdk){
            return;
        }
        
        const logCameraPose = () => {
            mpSdk.Camera.pose.subscribe((pose) => {
                setCameraPose(pose);
                // console.log("Current Camera Position:", pose.position);
            });
        };
    
        const logCurrentSweep = () => {
            mpSdk.Sweep.current.subscribe((sweep) => {
                setCurrentSweep(sweep);
                // console.log("Current Sweep Position:", sweep.position);
            });
        };

        const logAllSweeps = () => {
            mpSdk.Sweep.data.subscribe({
                onCollectionUpdated: (sweeps) => {
                    setSweeps(Object.values(sweeps));
                }
            });
        }

        logCameraPose();
        logCurrentSweep();
        logAllSweeps();

    }, [mpSdk])

    useEffect(()=>{
        if(sweeps && mpSdk){
            addTagToFarRoom(mpSdk);
        }
    }, [sweeps, mpSdk])

    return {
        sdk: mpSdk,
        cameraPose: cameraPose,
        currentSweep: currentSweep
    };
};
