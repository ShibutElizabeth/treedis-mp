"use client";

import { RefObject, useEffect, useState } from "react";
import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";
import { WindowWithMP_SDK } from "../types/matterport";
import { delay, calculateRotation, findMaxSweep } from "../utils/calculations";

export const useMatterportScene = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
    const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
    const [currentSweep, setCurrentSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [officeSweep, setOfficeSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [allSweeps, setAllSweeps] = useState<Sweep.ObservableSweepData[]>([]);
    const [filteredSweeps, setFilteredSweeps] = useState<Sweep.ObservableSweepData[]>([]);
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
            if(filteredSweeps.length > 0){
                const farSweep = findMaxSweep(filteredSweeps);
                const tagPosition = farSweep?.position;
                setOfficeSweep(farSweep);
                
                const newTag: MpSdk.Tag.Descriptor[] = [{
                    label: 'Office',
                    anchorPosition: {
                        x: tagPosition?.x || 0,
                        y: 1,
                        z: tagPosition?.z || 0,
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
            });
        };
    
        const logCurrentSweep = () => {
            mpSdk.Sweep.current.subscribe((sweep) => {
                setCurrentSweep(sweep);
            });
        };

        const logAllSweeps = () => {
            mpSdk.Sweep.data.subscribe({
                onCollectionUpdated: (sweeps) => {
                    setAllSweeps(Object.values(sweeps));
                }
            });
        }

        logCameraPose();
        logCurrentSweep();
        logAllSweeps();
    }, [mpSdk]);

    useEffect(() => {
        if(allSweeps.length > 0){
            const filtered = allSweeps?.filter((sweep) => sweep.floorInfo.sequence === 1);
            setFilteredSweeps(filtered);
        }

    }, [allSweeps])

    const teleportToOffice = async() => {
        if(!mpSdk || !officeSweep) return;

        await mpSdk.Sweep.moveTo(officeSweep.id, {
            transition: mpSdk.Sweep.Transition.INSTANT,
        });
    }

    const navigateToOffice = async () => {
        if(!currentSweep || !officeSweep || !cameraPose || !mpSdk) return;

        const currentSweepId: string = currentSweep.id;
        const officeSweepId: string = officeSweep.id;

        const sweepGraph = await mpSdk.Sweep.createGraph();
        const path = mpSdk.Graph.createAStarRunner(
            sweepGraph,
            sweepGraph.vertex(currentSweepId)!,
            sweepGraph.vertex(officeSweepId)!
        ).exec().path;

        path.shift();

        for (const vertex of path) {
            const y = calculateRotation(cameraPose.position, vertex.data.position).y;

            await Promise.all([
                mpSdk.Camera.setRotation({ x: cameraPose.rotation.x, y }, { speed: 70 }),
                mpSdk.Sweep.moveTo(vertex.data.id, {
                    transition: mpSdk.Sweep.Transition.FLY,
                    transitionTime: 3300
                })
            ]);

            await delay(500);
        }
    };

    useEffect(() => {
        if(filteredSweeps.length > 0 && mpSdk){
            addTagToFarRoom(mpSdk);
        }

    }, [filteredSweeps, mpSdk])

    return {
        sdk: mpSdk,
        cameraPose: cameraPose,
        currentSweep: currentSweep,
        sweeps: filteredSweeps,
        teleportToOffice: teleportToOffice,
        navigateToOffice: navigateToOffice,
    };
};
