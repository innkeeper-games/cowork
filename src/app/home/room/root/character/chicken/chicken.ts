import { imageAssets, Sprite, SpriteSheet, track, Vector, Text, Button, getCanvas, getWorldRect, SpriteClass, getPointer, initPointer, untrack } from 'kontra';
import { Character } from '../character';

export class Chicken extends Character {
    id: string;
    sceneId: number;
    ownerAccountId: string;

    target: Vector;
    direction: Vector;

    playingAnimation: string;

    shadow: Sprite;

    hovered: boolean;

    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, rotation: number, onDown: Function, displayName?: string) {
        let spriteSheet = SpriteSheet({
            image: imageAssets["chicken"],
            frameWidth: 128,
            frameHeight: 128,
            animations: {
                walkBL: {
                    frames: '0..47',
                    frameRate: 16
                },
                idleFR: {
                    frames: '147..194',
                    frameRate: 0
                },
                walkBR: {
                    frames: '48..95',
                    frameRate: 16
                },
                idleFL: {
                    frames: '98..195',
                    frameRate: 0
                },
                walkFL: {
                    frames: '96..143',
                    frameRate: 16
                },
                idleBR: {
                    frames: '49...195',
                    frameRate: 0
                },
                walkFR: {
                    frames: '144..191',
                    frameRate: 16
                },
                idleBL: {
                    frames: '0..195',
                    frameRate: 0
                }
            }
        });

        super(id, sceneId, ownerAccountId, position, rotation, onDown, displayName);

        this.speed = 2;

        this.playAnimation('idleFR');
        this.playingAnimation = 'idleFR';

        this.id = id;
        this.sceneId = sceneId;
        this.ownerAccountId = ownerAccountId;
        this.type = "chicken";

        this.target = Vector(this.x, this.y);
        this.direction = Vector(1, 1).normalize();
        
        this.shadow = Sprite({
            image: imageAssets["bear-shadow"],
            opacity: 0.5,
            scaleX: 0.8,
            scaleY: 0.8,
            x: 10,
            y: 80
        });
    }

    draw(): void {
        this.addChild(this.shadow);
        this.shadow.render();
        this.removeChild(this.shadow);
        super.draw();
    }
}