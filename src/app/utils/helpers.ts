import { MpSdk, Sweep } from "../../../public/showcase-bundle/sdk";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as THREE from "three";

export const addTagToFarRoom = async (sdk: MpSdk, farSweep: Sweep.ObservableSweepData) => {
    try {
        await sdk.Tag.add({
            label: "Office",
            anchorPosition: { ...farSweep.position, y: 1 },
            stemVector: { x: 0, y: 0.1, z: 0 },
            color: { r: 1.0, g: 0.0, b: 1.0 },
        });
    } catch (e) {
        console.error("Failed to add tag:", e);
    }
};

export const addModelToMatterport = async (
    sdk: MpSdk,
    gltfUrl: string,
    position: MpSdk.Vector3
): Promise<MpSdk.Scene.INode | null> => {
    try {
        const [sceneObject] = await sdk.Scene.createObjects(1);
        const modelNode = sceneObject.addNode();

        modelNode.addComponent(sdk.Scene.Component.GLTF_LOADER, { url: gltfUrl });
        modelNode.position.set(position.x, 0, position.z);

        modelNode.start();

        console.log("3D model has been added to Matterport");

        return modelNode;
    } catch (error) {
        console.error("Error adding a 3D model:", error);
        return null;
    }
}

export const getBlobUrl = async (scene: THREE.Scene): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const exporter = new GLTFExporter();
            exporter.parse(
                scene,
                (gltf) => {
                    const blob = new Blob([JSON.stringify(gltf)], {
                        type: "application/json",
                    });
                    const blobUrl = URL.createObjectURL(blob);
                    console.log("GLTF Blob URL: ", blobUrl);
                    resolve(blobUrl);
                },
                (error) => {
                    console.error("Export GLTF error: ", error);
                    reject(error);
                }
            );
        } catch (error) {
            console.error("Loading model error: ", error);
            reject(error);
        }
    });
};