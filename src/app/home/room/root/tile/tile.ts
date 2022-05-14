import { imageAssets, Sprite, SpriteSheet, Vector, SpriteClass, getCanvas, track, untrack } from 'kontra';

export abstract class Tile extends SpriteClass {
    id: string;
    ownerAccountId: string;
    
    renderModifier: number;

    hovered: boolean;

    constructor() {
        super();
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