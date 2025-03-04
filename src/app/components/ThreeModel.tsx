"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { MpSdk } from "../../../public/showcase-bundle/sdk";

const ThreeModel = ({sdk}: {sdk: MpSdk | null}) => {
    const [gltfUrl, setGltfUrl] = useState<string | null>(null);

    useEffect(() => {
        if (gltfUrl && sdk) {
          addModelToMatterport(sdk, gltfUrl);
        }
    }, [sdk]);

    useEffect(() => {
        generateGLB();
    }, [])

    const generateGLB = () => {
        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color('#ff00ff'),
            side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        const exporter = new GLTFExporter();
        exporter.parse(
            scene,
            (gltf) => {
                const blob = new Blob([JSON.stringify(gltf)], {
                    type: "application/json",
                });

            const blobUrl = URL.createObjectURL(blob);
            setGltfUrl(blobUrl);
            console.log("GLTF Blob URL:", blobUrl);
            },
            (error) => {
                console.log(error)
            }
        );
    };

    const addModelToMatterport = async (sdk: MpSdk, gltfUrl: string) => {
        try {
            const [sceneObject] = await sdk.Scene.createObjects(1);
            const modelNode = sceneObject.addNode();

            modelNode.addComponent(sdk.Scene.Component.GLTF_LOADER, { url: gltfUrl });
            modelNode.position.set(2, 1, 2);
            modelNode.start();

            console.log("3D model has been added");
        } catch (error) {
            console.error("Error adding a 3D model:", error);
        }
    };

  return null;
};

export default ThreeModel;
