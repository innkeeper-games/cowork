import { imageAssets, SpriteSheet, Vector } from 'kontra';
import { PersistObject } from '../persist-object';

export class BrickWall extends PersistObject {
    id: string;
    ownerAccountId: string;

    hovered: boolean;

    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, variant: number, onDown: Function, displayName?: string) {
        let spriteSheet = SpriteSheet({
            image: imageAssets["brick-wall"],
            frameWidth: 160,
            frameHeight: 160,
            animations: {
                "0": {
                    frames: '0..0',
                    frameRate: 0
                },
                "1": {
                    frames: '1..1',
                    frameRate: 0
                },
                "2": {
                    frames: '2..2',
                    frameRate: 0
                },
                "3": {
                    frames: '3..3',
                    frameRate: 0
                }
            }
        });
        
        super(id, sceneId, ownerAccountId, position, variant, onDown, spriteSheet, 160, 160, displayName);

        this.variants = 4;
        this.playAnimation((variant % this.variants).toString());
    }

    rotate(msg: any): void {
        super.rotate(msg);
        let variant: number = msg["rotation"]
        this.variant = variant % this.variants;
        this.playAnimation((this.variant).toString());
    }

    draw(): void {
        if (this.hovered) this.context.filter = "grayscale(50%) brightness(120%)";
        super.draw();
    }
}