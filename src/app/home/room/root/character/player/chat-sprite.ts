import { imageAssets, Sprite, Text, SpriteClass } from 'kontra';

export class ChatSprite extends SpriteClass {
    contents: string;

    constructor(contents: string) {
        super({
            type: 'chat',
        });

        let text: Text = Text({
            text: contents,
            font: '18px Tahoma',
            width: 192,
            x: 64,
            anchor: {x: 0.5, y: 0.5},
            textAlign: 'center',
        });

        this.y = -10 - text.height / 2;

        this.addChild(Sprite({
            image: imageAssets["chat-top"],
            y: -text.height / 2 - 8,
            anchor: {x: 0.25, y: 0.5},
        }))

        this.addChild(Sprite({
            color: 'white',
            width: 256,
            height: text.height + 16,
            anchor: {x: 0.25, y: 0.5},
        }));

        let chatBottom: Sprite = Sprite({
            image: imageAssets["chat-bottom"],
            y: text.height / 2 + 8,
            anchor: {x: 0.25, y: 0.5}
        });

        this.addChild(chatBottom);

        this.addChild(text);

        this.addChild(Sprite({
            image: imageAssets["chat-triangle"],
            y: chatBottom.y + chatBottom.height / 2 - 2,
            x: 64,
            anchor: {x: 0.5, y: 0.5}
        }));
    }
}