"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MpSdk } from "../../../public/showcase-bundle/sdk";
import { useMatterportContext } from "../hooks/UseMatterportContext";

const ThreeModel = () => {
    const [gltfUrl, setGltfUrl] = useState<string | null>(null);
    const {sdk, sweeps} = useMatterportContext();
    const [position, setPosition] = useState<MpSdk.Vector3 | THREE.Vector3>(new THREE.Vector3(0));

    useEffect(() => {
        if (gltfUrl && sdk && sweeps.length > 0) {
            setPosition(sweeps[6].position);
            addModelToMatterport(sdk, gltfUrl);
        }
    }, [sdk, sweeps]);

    useEffect(() => {
        generateGLB();
    }, [])

    const generateGLB = async () => {
        const scene = new THREE.Scene();
        const light = new THREE.AmbientLight('#fec76f');
        light.position.set(2, 2, 2);
        const lightD = new THREE.DirectionalLight('#ffffff');
        lightD.position.set(2, 10, 2);
        scene.add(lightD);
        // const geometry = new THREE.PlaneGeometry(1, 1);
    
        const chairSeatMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#8a806d'),
            side: THREE.DoubleSide,
        });

        const chairLegsMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#332e24'),
            side: THREE.DoubleSide,
        });
    
        const loadModel = () => {
            return new Promise<THREE.Object3D>((resolve, reject) => {
                const loader = new GLTFLoader();
                loader.load(
                    "/chair.glb",
                    (gltf) => {
                        const model = gltf.scene;
                        model.position.set(0, 0, 0);
                        model.scale.set(1, 1, 1);
                        model.rotateY(-Math.PI/2)
    
                        model.traverse((child: any) => {
                            if (child.isMesh) {
                                const name = child.name as string;
                                child.material = name.includes('Line') ? chairLegsMaterial : chairSeatMaterial;
                            }
                        });
    
                        resolve(model);
                    },
                    undefined,
                    (error) => reject(error)
                );
            });
        };
    
        try {
            const model = await loadModel();
            scene.add(model);
            console.log("3D model has been loaded: ", model);
    
            const exporter = new GLTFExporter();
            exporter.parse(
                scene,
                (gltf) => {
                    const blob = new Blob([JSON.stringify(gltf)], {
                        type: "application/json",
                    });
    
                    const blobUrl = URL.createObjectURL(blob);
                    setGltfUrl(blobUrl);
                    console.log("GLTF Blob URL: ", blobUrl);
                },
                (error) => {
                    console.error("Export GLTF error: ", error);
                }
            );
        } catch (error) {
            console.error("Loading model error: ", error);
        }
    };
    

    const addModelToMatterport = async (sdk: MpSdk, gltfUrl: string) => {
        try {
            const [sceneObject] = await sdk.Scene.createObjects(1);
            const modelNode = sceneObject.addNode();

            modelNode.addComponent(sdk.Scene.Component.GLTF_LOADER, { url: gltfUrl });
            modelNode.position.set(position.x, 0, position.z);
            modelNode.start();

            console.log("3D model has been added");
        } catch (error) {
            console.error("Error adding a 3D model:", error);
        }
    };

  return null;
};

export default ThreeModel;
