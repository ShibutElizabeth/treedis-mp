"use client";

import { RefObject, useEffect, useState } from "react";
import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";
import { WindowWithMP_SDK } from "../types/matterport";
import { delay, calculateYRotation, findMaxSweep } from "../utils/calculations";
import { ToOffice } from "../types/utils";
import { addTagToFarRoom } from "../utils/mpSdkHelpers";

const SWEEP_FLOOR = 1;
const CAMERA_SPEED = 70;
const TRANSITION_TIME = 3500;

export const useMatterportScene = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
    const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
    const [currentSweep, setCurrentSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [officeSweep, setOfficeSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [filteredSweeps, setFilteredSweeps] = useState<Sweep.ObservableSweepData[]>([]);
    const [cameraPose, setCameraPose] = useState<Camera.Pose | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!iframeRef.current) return;

        const showcase = document.getElementById('showcase') as HTMLIFrameElement;
        
        if (!showcase) return;
        
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
        if (!mpSdk) return;

        const poseSubscription = mpSdk.Camera.pose.subscribe(setCameraPose);
        const sweepSubscription = mpSdk.Sweep.current.subscribe(setCurrentSweep);
        const sweepDataSubscription = mpSdk.Sweep.data.subscribe({
            onCollectionUpdated: (sweeps) => {
                setFilteredSweeps(Object.values(sweeps).filter((sweep) => sweep.floorInfo.sequence === SWEEP_FLOOR));
            },
        });

        return () => {
            poseSubscription.cancel();
            sweepSubscription.cancel();
            sweepDataSubscription.cancel();
        };
    }, [mpSdk]);

    useEffect(() => {
        if (filteredSweeps.length > 0 && mpSdk) {
            const farSweep = findMaxSweep(filteredSweeps);

            if(farSweep){
                setOfficeSweep(farSweep);
                addTagToFarRoom(mpSdk, farSweep);
            }   
        }

    }, [filteredSweeps, mpSdk]);

    const teleportToOffice = async() => {
        if(!mpSdk || !officeSweep) return;

        await mpSdk.Sweep.moveTo(officeSweep.id, {
            transition: mpSdk.Sweep.Transition.INSTANT,
        }).finally(() => {
            setIsPlaying(false);
        });
    }

    const navigateToOffice = async () => {
        if (!currentSweep || !officeSweep || !cameraPose || !mpSdk) return;
    
        const { id: currentSweepId } = currentSweep;
        const { id: officeSweepId } = officeSweep;
    
        const sweepGraph = await mpSdk.Sweep.createGraph();
        const path = mpSdk.Graph.createAStarRunner(
            sweepGraph,
            sweepGraph.vertex(currentSweepId)!,
            sweepGraph.vertex(officeSweepId)!
        ).exec().path.slice(1); 

        for (const { data: { id, position } } of path) {
            const yRotation = calculateYRotation(cameraPose.position, position);
    
            await mpSdk.Camera.setRotation({ 
                x: cameraPose.rotation.x, 
                y: yRotation 
            }, { 
                speed: CAMERA_SPEED 
            });
    
            await mpSdk.Sweep.moveTo(id, {
                transition: mpSdk.Sweep.Transition.FLY,
                transitionTime: TRANSITION_TIME,
            }).finally(() => {
                setIsPlaying(false);
            });
    
            await delay(TRANSITION_TIME / 7);
        }
    };
    

    const toOffice = async (walkingStyle: ToOffice) => {
        if(isPlaying) return;
        setIsPlaying(true)
        if (walkingStyle === ToOffice.NAVIGATE) await navigateToOffice();
        if (walkingStyle === ToOffice.TELEPORT) await teleportToOffice();
    };

    return {
        sdk: mpSdk,
        cameraPose: cameraPose,
        currentSweep: currentSweep,
        sweeps: filteredSweeps,
        toOffice: toOffice
    };
};
