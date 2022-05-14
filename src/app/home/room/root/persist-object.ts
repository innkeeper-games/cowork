import { imageAssets, Sprite, Text, SpriteSheet, Vector, SpriteClass, initPointer, track, getCanvas, untrack } from 'kontra';

export class PersistObject extends SpriteClass {

    id: string;
    ownerAccountId: string;
    displayName: string;

    hovered: boolean;

    variants: number;
    variant: number;

    nameTag: Text;

    constructor(id: string, sceneId: number, ownerAccountId: string, position: Vector, variant: number, onDown: Function, spriteSheet: SpriteSheet, width: number, height: number, displayName?: string) {
        initPointer();
        
        super({
            type: 'persistObject',
            x: position.x,
            y: position.y,
            width: width,
            height: height,
            image: spriteSheet.frame[0],
            animations: spriteSheet.animations,
            onDown: function() {
                onDown(this);
            },
            onUp: function() {

            },
            onOver: function() {
                getCanvas().style.cursor = "pointer";
                this.hovered = true;
            },
            onOut: function() {
                getCanvas().style.cursor = "default";
                this.hovered = false;
            }
        });

        this.id = id;
        this.sceneId = sceneId;
        this.variant = variant;
        this.displayName = displayName;
        this.ownerAccountId = ownerAccountId;

        if (this.nameTag) {
            this.children[this.children.indexOf(this.nameTag)].text = this.displayName;
        }
        else if (this.displayName != "" && this.displayName != undefined) {
            this.nameTag = Text({
                text: this.displayName,
                font: '16px Arial',
                color: 'black',
                width: 128,
                x: 0,
                y: this.height,
                anchor: {x: 0, y: 0},
                textAlign: 'center'
            });

            this.addChild(this.nameTag);
        }
    }

    draw(): void {
        if (this.nameTag) {
            this.children[this.children.indexOf(this.nameTag)].text = this.displayName;
        }
        else if (this.displayName != "" && this.displayName != undefined) {
            this.nameTag = Text({
                text: this.displayName,
                font: '16px Arial',
                color: 'black',
                width: 128,
                x: 0,
                y: this.height,
                anchor: {x: 0, y: 0},
                textAlign: 'center'
            });

            this.context.filter = "";

            this.addChild(this.nameTag);
        }

        super.draw();
    }

    setEraserMode(eraserMode: boolean): void {
        if (eraserMode) track(this);
        else untrack(this);
    }

    warpTo(msg: any): void {
        this.position = Vector(msg["position_x"], msg["position_y"]);
    }

    rotate(msg: any) {
        this.variant = msg["variant"];
    }

    move(msg: any): void {
        this.position = Vector(msg["position_x"], msg["position_y"]);
    }

    setDisplayName(msg: any): void {
        this.displayName = msg["display_name"];
    }
}