import { imageAssets, Sprite, SpriteSheet, Vector, SpriteClass, getCanvas, track, untrack } from 'kontra';
import { PersistObject } from '../../persist-object';
import { Tile } from '../tile';

export class WoodTile extends Tile {
    id: string;
    ownerAccountId: string;

    hovered: boolean;

    constructor() {
        let spriteSheet = SpriteSheet({
            image: imageAssets["tiles"],
            frameWidth: 160,
            frameHeight: 160,
            animations: {
                "0": {
                    frames: '0..0',
                    frameRate: 0
                }
            }
        });
        
        super();

        this.playAnimation("0");
    }

    draw(): void {
        if (this.hovered) this.context.filter = "grayscale(50%) brightness(120%)";
        super.draw();
    }
}