import { imageAssets, Sprite, SpriteSheet, Vector, SpriteClass, getCanvas, track, untrack } from 'kontra';
import { PersistObject } from '../persist-object';

export class Shrub extends PersistObject {
    id: string;
    ownerAccountId: string;

    hovered: boolean;

    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, variant: number, onDown: Function, displayName?: string) {
        let spriteSheet = SpriteSheet({
            image: imageAssets["shrub"],
            frameWidth: 180,
            frameHeight: 180,
            animations: {
                "0": {
                    frames: '0..0',
                    frameRate: 0
                },
                "1": {
                    frames: '7..7',
                    frameRate: 0
                },
                "2": {
                    frames: '6..6',
                    frameRate: 0
                },
                "3": {
                    frames: '5..5',
                    frameRate: 0
                },
                "4": {
                    frames: '2..2',
                    frameRate: 0
                },
                "5": {
                    frames: '4..4',
                    frameRate: 0
                },
                "6": {
                    frames: '3..3',
                    frameRate: 0
                },
                "7": {
                    frames: '1..1',
                    frameRate: 0
                },
            }
        });
        
        super(id, sceneId, ownerAccountId, position, variant, onDown, spriteSheet, 180, 180, displayName);

        this.variants = 8;
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