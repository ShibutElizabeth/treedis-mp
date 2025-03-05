"use client";

import { RefObject, useEffect, useState } from "react";
import { MpSdk, Camera, Sweep } from "../../../public/showcase-bundle/sdk";
import { WindowWithMP_SDK } from "../types/matterport";
import { delay, calculateYRotation, findMaxSweep, interpolatePositions } from "../utils/calculations";
import { ToOffice } from "../types/utils";
import { addTagToFarRoom } from "../utils/helpers";

const SWEEP_FLOOR = 1;
const CAMERA_SPEED = 70;
const TRANSITION_TIME = 3500;

export const useMatterportScene = (iframeRef: RefObject<HTMLIFrameElement | null>) => {
    const [mpSdk, setMpSdk] = useState<MpSdk | null>(null);
    const [currentSweep, setCurrentSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [officeSweep, setOfficeSweep] = useState<Sweep.ObservableSweepData | null>(null);
    const [filteredSweeps, setFilteredSweeps] = useState<Sweep.ObservableSweepData[]>([]);
    const [pathPositions, setPathPositions] = useState<MpSdk.Vector3[]>([]);
    const [cameraPose, setCameraPose] = useState<Camera.Pose | null>(null);
    const [blueDotsModelNodes, setBlueDotsModelNodes] = useState<MpSdk.Scene.INode[]>([]);
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
        const sweepSubscription = mpSdk.Sweep.current.subscribe((sweep) => {
            setCurrentSweep(sweep);
            
        });
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
        setIsPlaying(true);

        await mpSdk.Sweep.moveTo(officeSweep.id, {
            transition: mpSdk.Sweep.Transition.INSTANT,
        }).finally(() => {
            setIsPlaying(false);
        });
    }

    const navigateToOffice = async () => {
        if (!currentSweep || !officeSweep || !cameraPose || !mpSdk) return;
        setIsPlaying(true);

        const { id: currentSweepId } = currentSweep;
        const { id: officeSweepId } = officeSweep;
    
        const sweepGraph = await mpSdk.Sweep.createGraph();
        const path = mpSdk.Graph.createAStarRunner(
            sweepGraph,
            sweepGraph.vertex(currentSweepId)!,
            sweepGraph.vertex(officeSweepId)!
        ).exec().path.slice(1); 

        const dotPositions: MpSdk.Vector3[] = [];
        const segments = 0.5;

        const updatePositions = (startSweep: MpSdk.Sweep.ObservableSweepData, endSweep: MpSdk.Sweep.ObservableSweepData) => {
            const { position: startPos } = startSweep;
            const { position: endPos } = endSweep;

            const interpolatedPositions = interpolatePositions(startPos, endPos, segments);
            dotPositions.push(...interpolatedPositions);
        }

        updatePositions(currentSweep, path[0].data);

        for (let i = 0; i < path.length - 1; i++) {
            updatePositions(path[i].data, path[i + 1].data);
        }

        setPathPositions(dotPositions);

        try {
            for (const { data: { id, position } } of path) {
                const yRotation = calculateYRotation(cameraPose.position, position);
    
                await mpSdk.Camera.setRotation(
                    { x: cameraPose.rotation.x, y: yRotation },
                    { speed: CAMERA_SPEED }
                );
    
                await mpSdk.Sweep.moveTo(id, {
                    transition: mpSdk.Sweep.Transition.FLY,
                    transitionTime: TRANSITION_TIME,
                });
    
                await delay(TRANSITION_TIME / 7);
            }
        } finally {
            setIsPlaying(false);
            blueDotsModelNodes.forEach(node => node.stop());
            setBlueDotsModelNodes([]);
        }
    };

    const toOffice = async (walkingStyle: ToOffice) => {
        if(isPlaying) return;

        if (walkingStyle === ToOffice.NAVIGATE) await navigateToOffice();
        if (walkingStyle === ToOffice.TELEPORT) await teleportToOffice();
    };

    return {
        sdk: mpSdk,
        cameraPose: cameraPose,
        currentSweep: currentSweep,
        sweeps: filteredSweeps,
        pathPositions: pathPositions,
        blueDotsModelNodes: blueDotsModelNodes,
        toOffice: toOffice
    };
};
