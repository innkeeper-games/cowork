import { GameObjectClass, Vector } from "kontra";
import { ObjectFactory } from "../object-factory";
import { PersistObject } from "./persist-object";

export class TileMap extends GameObjectClass {

    objectFactory: ObjectFactory;
    tiles: Map<Vector, PersistObject> = new Map<Vector, PersistObject>();

    constructor(objectFactory: ObjectFactory) {
        super();
        this.objectFactory = objectFactory;
    }

    placeTile(msg: any) {
        
    }

    removeTile(msg: any) {

    }
}