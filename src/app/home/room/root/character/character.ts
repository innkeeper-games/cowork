import { on } from "events";
import { imageAssets, Sprite, SpriteSheet, Vector } from "kontra";
import { PersistObject } from "../persist-object";

export class Character extends PersistObject {

    speed: number;

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

        super(id, sceneId, ownerAccountId, position, rotation, onDown, spriteSheet, 128, 128, displayName);

        this.speed = 5;

        this.playAnimation('idleFR');
        this.playingAnimation = 'idleFR';

        this.target = Vector(this.x, this.y);
        this.direction = Vector(1, 1).normalize();
    }

    update(): void {
        let distance: number = this.target.distance(this.position);
        // also cancel movement upon collision! maybe upon collision, set target to position?
        if (distance > 0 && (this.lastDistance == undefined || distance < this.lastDistance)) {
            this.dx = this.direction.x * this.speed;
            this.dy = this.direction.y * this.speed;
            this.lastDistance = distance;
        }
        else if (this.target.subtract(this.position).length() != 0) {
            this.playingAnimation = this.playingAnimation.replace('walk', 'idle');
            this.playAnimation(this.playingAnimation);
            this.reportLocation();
            this.target = this.position;
            this.direction = Vector(0, 0);
            this.dx = 0;
            this.dy = 0;
        }
        super.update();
    }

    draw(): void {
        super.draw();
    }

    setTarget(msg: any): void {
        this.target = Vector(msg["position_x"], msg["position_y"] - 128 / 2);
        this.direction = Vector(this.target.x - this.x, this.target.y - this.y).normalize();
        let left: boolean = this.direction.x <= 0;
        let right: boolean = !left;
        let backward: boolean = this.direction.y <= 0;
        let forward: boolean = !backward;
        if (forward && right) {
            this.playingAnimation = 'walkFR';
        }
        if (forward && left) {
            this.playingAnimation = 'walkFL';
        }
        if (backward && right) {
            this.playingAnimation = 'walkBR';
        }
        if (backward && left) {
            this.playingAnimation = 'walkBL';
        }
        this.playAnimation(this.playingAnimation);
    }

    reportLocation(): void {
        let log: HTMLElement = document.getElementById("game-log");
        let message: HTMLParagraphElement = document.createElement("p");
        message.innerHTML = this.displayName + " the " + this.type + " moved to " + Math.round(this.x) + " on the x-axis and " + Math.round(this.y) + " on the y-axis.";
        log.appendChild(message);
    }

    move(msg: any): void {
        super.move(msg);
        this.target = this.position;
        this.velocity = Vector(0, 0);
    }

}