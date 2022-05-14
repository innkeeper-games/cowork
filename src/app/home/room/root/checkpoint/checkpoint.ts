import { imageAssets, SpriteSheet, Vector, Text } from "kontra";
import { PersistObject } from "../persist-object";

export class Checkpoint extends PersistObject {
    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, rotation: number, onDown: Function, displayName?: string) {

        let spriteSheet = SpriteSheet({
            image: imageAssets["checkpoint"],
            frameWidth: 128,
            frameHeight: 128,
            animations: {
                walkFR: {
                    frames: '0..0',
                    frameRate: 0
                }
            }
        });

        super(id, sceneId, ownerAccountId, position, rotation, onDown, spriteSheet, 128, 128, displayName);
        
        this.opacity = 0.5;

        this.removeChild(this.nameTag);

        this.nameTag = Text({
            text: this.displayName,
            font: '16px Arial',
            color: 'black',
            width: 128,
            x: 0,
            y: this.height / 2 + 32,
            anchor: {x: 0, y: 0},
            textAlign: 'center'
        });

        this.addChild(this.nameTag);
    }
}