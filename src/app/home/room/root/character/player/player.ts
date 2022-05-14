import { imageAssets, Sprite, SpriteSheet, track, Vector, Text, Button, getCanvas, getWorldRect, SpriteClass, getPointer, initPointer } from 'kontra';
import { RoomComponent } from '../../../room.component';
import { ChatSprite } from './chat-sprite';

const speed: number = 5;

export class Player extends SpriteClass {
    room: RoomComponent;
    id: string;
    displayName: string;
    target: Vector;
    direction: Vector;

    chatMessage: ChatSprite;
    handle: number;

    me: boolean;

    playingAnimation: string;

    shadow: Sprite;

    constructor(room: RoomComponent, id: string, displayName: string, position: Vector) {

        initPointer();

        let spriteSheet = SpriteSheet({
            image: imageAssets["bear"],
            frameWidth: 128,
            frameHeight: 128,
            animations: {
                walkFR: {
                    frames: '0..47',
                    frameRate: 90
                },
                idleFR: {
                    frames: '48..195',
                    frameRate: 0
                },
                walkFL: {
                    frames: '49..96',
                    frameRate: 90
                },
                idleFL: {
                    frames: '97..195',
                    frameRate: 0
                },
                walkBR: {
                    frames: '98..145',
                    frameRate: 90
                },
                idleBR: {
                    frames: '146...195',
                    frameRate: 0
                },
                walkBL: {
                    frames: '147..194',
                    frameRate: 90
                },
                idleBL: {
                    frames: '195..200',
                    frameRate: 0
                }
            }
        });


        super({
            type: 'player',
            x: position.x,
            y: position.y,
            dx: 0,
            dy: 0,
            image: spriteSheet.frame[48],
            animations: spriteSheet.animations,
            onDown: function() {
                this.room.membersService.openTooltip(displayName, id);
            },
            onUp: function() {

            },
            onOver: function() {
                getCanvas().style.cursor = "pointer";
            },
            onOut: function() {
                getCanvas().style.cursor = "default";
            }
        });

        this.room = room;

        this.playAnimation('idleFR');
        this.playingAnimation = 'idleFR';

        this.id = id;
        this.displayName = displayName;
        this.target = Vector(this.x, this.y);

        if (this.id == sessionStorage.getItem("account_id")) {
            this.me = true;
        }

        this.shadow = Sprite({
            image: imageAssets["bear-shadow"],
            opacity: 0.5,
            y: 96
        });

        track(this);
    }

    update(): void {
        let distance: number = this.target.distance(this.position);
        // also cancel movement upon collision! maybe upon collision, set target to position?
        if (distance > 0 && (this.lastDistance == undefined || distance < this.lastDistance)) {
            this.dx = this.direction.x * speed;
            this.dy = this.direction.y * speed;
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
        this.addChild(this.shadow);
        this.shadow.render();
        this.removeChild(this.shadow);

        if (this.me && this.dx == 0 && this.dy == 0) {
            let pointer: any = getPointer();
            let lookTarget: Vector = Vector(pointer.x, pointer.y - 128 / 2);
            let lookDirection: Vector = Vector(lookTarget.x - getCanvas().width / 2, lookTarget.y - getCanvas().height / 2).normalize();
            let left: boolean = lookDirection.x <= 0;
            let right: boolean = !left;
            let backward: boolean = lookDirection.y <= 0;
            let forward: boolean = !backward;
            if (forward && right) {
                this.playingAnimation = 'idleFR';
            }
            if (forward && left) {
                this.playingAnimation = 'idleFL';
            }
            if (backward && right) {
                this.playingAnimation = 'idleBR';
            }
            if (backward && left) {
                this.playingAnimation = 'idleBL';
            }
            this.playAnimation(this.playingAnimation);
        }

        super.draw();

        let nameTag: Text = Text({
            text: this.displayName,
            font: '32px Arial',
            color: 'black',
            width: 128,
            x: 0,
            y: 128,
            anchor: {x: 0, y: 0},
            textAlign: 'center'
        });

        nameTag.render();
    }

    say(chat: any): void {
        if (this.chatMessage != undefined) this.clearChat();
        this.chatMessage = new ChatSprite(chat.contents);
        this.addChild(this.chatMessage);
        this.handle = window.setTimeout(this.clearChat.bind(this), 5000);
    }

    clearChat(): void {
        this.removeChild(this.chatMessage);
        window.clearTimeout(this.handle);
        this.chatMessage = undefined;
    }

    setTarget(msg: any): void {
        this.target = Vector(msg["position_x"], msg["position_y"] - 128 / 2);
        this.direction = Vector(this.target.x - this.x, this.target.y - this.y).normalize();
        this.dx = this.direction.x * speed;
        this.dy = this.direction.y * speed;
        this.lastDistance = undefined;
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

    warpTo(msg: any): void {
        this.position = Vector(msg["position_x"], msg["position_y"]);
        this.x = msg["position_x"];
        this.y = msg["position_y"];
        this.target = this.position;
        this.direction = Vector(this.target.x - this.x, this.target.y - this.y).normalize();
        this.lastDistance = undefined;
    }

    reportLocation(): void {
        let log: HTMLElement = document.getElementById("game-log");
        let message: HTMLParagraphElement = document.createElement("p");
        message.innerHTML = this.displayName + " moved to " + Math.round(this.x) + " on the x-axis and " + Math.round(this.y) + " on the y-axis.";
        log.appendChild(message);
    }
}