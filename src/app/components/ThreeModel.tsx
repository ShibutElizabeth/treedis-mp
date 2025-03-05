"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useMatterportContext } from "../hooks/UseMatterportContext";
import { addModelToMatterport, getBlobUrl } from "../utils/helpers";

const ThreeModel = () => {
    const [gltfUrl, setGltfUrl] = useState<string | null>(null);
    const {sdk, sweeps} = useMatterportContext();

    useEffect(() => {
        if (gltfUrl && sdk && sweeps.length > 0) {
            addModelToMatterport(sdk, gltfUrl, sweeps[6].position);
        }
    }, [sdk, sweeps]);

    useEffect(() => {
        generateGLB();
    }, [])

    const generateGLB = async () => {
        const scene = new THREE.Scene();

        const directionalLight = new THREE.DirectionalLight('#ffffff', 10);
        directionalLight.position.set(2, 5, 2);
        scene.add(directionalLight);
    
        const chairSeatMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#8a806d'),
            roughness: 1,
            side: THREE.DoubleSide,
        });

        const chairLegsMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#111111'),
            roughness: 1,
            metalness: 1,
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

            const url = await getBlobUrl(scene);
            setGltfUrl(url);
        } catch (error) {
            console.error("Loading model error: ", error);
        }
    };

  return null;
};

export default ThreeModel;
