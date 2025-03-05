"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useMatterportContext } from "@/app/hooks/useMatterportContext";
import { addModelToMatterport, getBlobUrl } from "../../utils/helpers";

const BlueDotPath = () => {
    const {sdk, pathPositions, blueDotsModelNodes} = useMatterportContext();

    useEffect(() => {
        if (!sdk || pathPositions.length === 0) return;

        const scene = new THREE.Scene();

        pathPositions.forEach((position) => {
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: "#56b6e8" });
            const blueDot = new THREE.Mesh(geometry, material);
            blueDot.position.set(position.x, 0, position.z);
            scene.add(blueDot);
        });

        (async () => {
            try {
                const gltfUrl = await getBlobUrl(scene);
                const modelNode = await addModelToMatterport(sdk, gltfUrl, {x: 0, y: 0, z: 0});
                
                if(modelNode) blueDotsModelNodes.push(modelNode);
                
            } catch (error) {
                console.error("Error adding spheres to Matterport:", error);
            }
        })();

        return () => {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        };
    }, [pathPositions, sdk]);

    return null;
};

export default BlueDotPath;
