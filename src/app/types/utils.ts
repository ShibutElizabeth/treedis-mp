export type Position = { x: number; y: number; z: number };
export type Rotation = { x: number; y: number };

export enum ToOffice { TELEPORT, NAVIGATE };

export type MenuItem = {
    title: string,
    walkingStyle: ToOffice
}