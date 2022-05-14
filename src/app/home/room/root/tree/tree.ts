import { imageAssets, Sprite, SpriteSheet, Vector, SpriteClass, initPointer, track, getCanvas, untrack } from 'kontra';
import { PersistObject } from '../persist-object';

export class Tree extends PersistObject {
    id: string;
    ownerAccountId: string;

    hovered: boolean;

    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, variant: number, onDown: Function, displayName?: string) {

        let spriteSheet = SpriteSheet({
            image: imageAssets["tree"],
            frameWidth: 128,
            frameHeight: 192,
            animations: {
                "0": {
                    frames: '0..0',
                    frameRate: 1
                },
                "2": {
                    frames: '1..1',
                    frameRate: 1
                },
                "1": {
                    frames: '2..2',
                    frameRate: 1
                },
                "3": {
                    frames: '3..3',
                    frameRate: 1
                },
            }
        });

        super(id, sceneId, ownerAccountId, position, variant, onDown, spriteSheet, 128, 192, displayName);

        this.variants = 4;
        this.playAnimation((variant % this.variants).toString());
    }

    rotate(msg: any): void {
        let variant: number = msg["rotation"]
        this.variant = variant % this.variants;
        this.playAnimation((this.variant).toString());
    }

    draw(): void {
        //super.render();
        if (this.hovered) this.context.filter = "grayscale(50%) brightness(120%)";
        super.draw();
    }
}