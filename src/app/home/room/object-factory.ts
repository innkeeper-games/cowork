// this might not be the best way to create these objects!
// simply exists to return object that matches server's id
// variant on factory pattern. May result in duplicate code; beware!

import { Player } from './root/character/player/player';
import { InteractionHandler } from './root/interaction-handler'
import { SocketService } from 'src/app/socket/socket.service';
import { GameObject, Vector } from 'kontra';
import { RoomComponent } from './room.component';
import { Tree } from './root/tree/tree';
import { Chicken } from './root/character/chicken/chicken';
import { Shrub } from './root/shrub/shrub';
import { Checkpoint } from './root/checkpoint/checkpoint';
import { BrickWall } from './root/brick-wall/brick-wall';

export class ObjectFactory {
    socketService: SocketService;
    room: RoomComponent;
    onItemDown: Function;

    constructor(room: RoomComponent, socketService: SocketService, onItemDown: Function) {
        this.room = room;
        this.socketService = socketService;
        this.onItemDown = onItemDown;
    }

    makeObject(data: any): GameObject {
        let sceneId: number = data["scene_id"];
        let object: GameObject;
        switch(sceneId) { 
            case 0: { 
                // tile map
                object = new InteractionHandler(data["layers"], this.socketService, this.room);
                break;
            } 
            case 1: { 
                // player
                object = new Player(this.room, data["id"], data["display_name"], Vector(data["position_x"], data["position_y"]));

                /* create the task popup
                OMITTED FOR USER TESTS--WILL ASK USERS WHAT THEY WOULD DO INSTEAD
                
                const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TaskPopupComponent);

                const viewContainerRef = this.taskHost.viewContainerRef;
            
                let componentRef: ComponentRef<TaskPopupComponent>;
            
                componentRef = viewContainerRef.createComponent(componentFactory, data.index);
            
                let instance: TaskPopupComponent = <TaskPopupComponent>componentRef.instance;
                instance.data = data;
                this.tasks.set(data.task_id, instance);
                this.taskViewRefs.set(data.task_id, componentRef.hostView);
                */
                break; 
            }
            case 2: {
                object = new Tree(data["id"], data["scene_id"], data["owner_account_id"], Vector(data["position_x"], data["position_y"]), data["rotation"], this.onItemDown, data["display_name"]);
                break;
            }
            case 3: {
                object = new Chicken(data["id"], data["scene_id"], data["owner_account_id"], Vector(data["position_x"], data["position_y"]), 0, this.onItemDown, data["display_name"]);
                break;
            }
            case 4: {
                object = new Shrub(data["id"], data["scene_id"], data["owner_account_id"], Vector(data["position_x"], data["position_y"]), data["rotation"], this.onItemDown, data["display_name"]);
                break;
            }
            case 5: {
                object = new Checkpoint(data["id"], data["scene_id"], data["owner_account_id"], Vector(data["position_x"], data["position_y"]), data["rotation"], this.onItemDown, data["display_name"]);
                break;
            }
            case 6: {
                object = new BrickWall(data["id"], data["scene_id"], data["owner_account_id"], Vector(data["position_x"], data["position_y"]), data["rotation"], this.onItemDown, data["display_name"]);
                break;
            }
        }
        return object;
    }
}