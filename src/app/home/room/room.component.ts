import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { init, TileEngine, load, setImagePath, imageAssets, GameLoop, GameObject, Vector, getCanvas, Scene, depthSort, Sprite, getWorldRect, getPointer, initPointer, lerp, Quadtree, collides } from 'kontra';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';
import { ChatService } from '../chat-service.service';
import { MembersService } from '../members.service';
import { RoomChangeService } from '../room-change.service';
import { CheckpointService } from './checkpoint.service';

import { images } from "./images";
import { InventoryPopupDirective } from './inventory-popup.directive';
import { InventoryPopupComponent } from './inventory-popup/inventory-popup.component';

import { ObjectFactory } from './object-factory'
import { Chicken } from './root/character/chicken/chicken';
import { Player } from './root/character/player/player';

import { PlayerTooltipDirective } from './root/character/player/player-tooltip.directive';
import { PlayerTooltipComponent } from './root/character/player/player-tooltip/player-tooltip.component';
import { Checkpoint } from './root/checkpoint/checkpoint';
import { EditItemTooltipDirective } from './root/edit-item-tooltip.directive';
import { EditItemTooltipComponent } from './root/edit-item-tooltip/edit-item-tooltip.component';
import { PersistObject } from './root/persist-object';
import { InteractionHandler } from './root/interaction-handler';
import { Tile } from './root/tile/tile';
import { VendorPopupDirective } from './vendor-popup.directive';
import { VendorPopupComponent } from './vendor-popup/vendor-popup.component';


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})

export class RoomComponent extends Handler implements OnInit {

  @ViewChild(PlayerTooltipDirective, { static: true }) public playerTooltipHost: PlayerTooltipDirective;
  @ViewChild(VendorPopupDirective, { static: true }) public vendorPopupHost: VendorPopupDirective;
  @ViewChild(InventoryPopupDirective, { static: true }) public inventoryPopupHost: InventoryPopupDirective;
  @ViewChild(EditItemTooltipDirective, { static: true }) public editItemTooltipHost: EditItemTooltipDirective;

  roomTitle: string;
  roomDescription: string;

  wealth: number = 0;

  objects: Map<string, any>;
  me: Player;
  target: {x: number, y: number};

  objectFactory: ObjectFactory;

  editMode: boolean = false;
  eraserMode: boolean = false;
  activeItem: number = 1;
  editingObject: PersistObject;

  roomChangeService: RoomChangeService;
  socketService: SocketService;
  membersService: MembersService;
  chatService: ChatService;
  checkpointService: CheckpointService;

  componentFactoryResolver: ComponentFactoryResolver;

  editButtonDisplay: string = "none";

  loop: GameLoop;

  cameraOrigin: {x: number, y: number};

  mobile: boolean;

  constructor(socketService: SocketService, roomChangeService: RoomChangeService, membersService: MembersService, chatService: ChatService, componentFactoryResolver: ComponentFactoryResolver, checkpointService: CheckpointService) {
    super();
    this.socketService = socketService;
    this.roomChangeService = roomChangeService;
    this.membersService = membersService;
    this.membersService.setRoom(this);
    this.chatService = chatService;
    this.checkpointService = checkpointService;

    this.chatService.chatMessage.subscribe(this.say.bind(this));

    this.objects = new Map<string, any>();
    this.objectFactory = new ObjectFactory(this, socketService, this.onItemDown.bind(this));
    this.componentFactoryResolver = componentFactoryResolver;
  }

  ngOnInit(): void {
    // register and observe socket channels
    if (!this.socketService.channelIsRegistered("room")) this.socketService.register("room");
    this.socketService.channelReply.get("room").subscribe(msg => {
      if (this[this.snakeToCamel(msg["type"])] != undefined) this[this.snakeToCamel(msg["type"])](msg);
    });

    if (!this.socketService.channelIsRegistered("settings")) this.socketService.register("settings");
    this.socketService.channelReply.get("settings").subscribe(msg => {
      if (msg["type"] == "edit_room_description") {
        this.roomDescription = msg["room_description"]
      }
      else if (msg["type"] == "edit_room_title") {
        this.roomTitle = msg["room_title"]
      }
    });

    this.roomChangeService.roomId.subscribe(msg => this.onRoomChange(msg));

    this.socketService.sendMessage({channel: "room", type: "request_wealth"});

    let { canvas, context } = init((document.getElementById("game") as HTMLCanvasElement));

    canvas.width = 9 * 128;
    canvas.height = 6 * 128;

    if (this.mobile) {
      canvas.setAttribute('width', window.getComputedStyle(canvas, null).getPropertyValue("width"));
      canvas.setAttribute('height', window.getComputedStyle(canvas, null).getPropertyValue("height"));
    }
    else {
      canvas.width = 9 * 128;
      canvas.height = 6 * 128;
    }
    
    /*canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    document.onresize = function() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };*/

    this.mobile = window.matchMedia('only screen and (max-width: 760px)').matches;

    setImagePath('/assets/room/');
    load.apply(
      null, images
    );

    let sort = function(obj1, obj2) {
      [obj1, obj2] = [obj1, obj2].map(getWorldRect);
      return (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    }

    initPointer();

    this.objects.set("scene", Scene({
      id: 'game',
      children: [],
      cullObjects: false,
      sortFunction: sort
    }));
  }

  requestWealth(msg: any): void {
    this.wealth = msg["wealth"];
  }

  requestSetTarget(): void {
    let pointer: any = getPointer();
  }

  onSendChat(event: any): void {
    let chatField: HTMLTextAreaElement = document.getElementById("chat-field-room") as HTMLTextAreaElement;
    let contents: string = chatField.value;
    this.socketService.sendMessage({channel: "chat", type: "send_message", room_id: sessionStorage.getItem("room_id"), contents: contents});
    chatField.value = "";
    event.preventDefault();
  }

  addPersistObject(msg: any): void {
    let object: any = this.objectFactory.makeObject(msg["data"]);
    let scene: Scene = this.objects.get("scene");

    /*if (this.mobile) {
      scene.camera.setScale(0.5, 0.5);
    }*/

    if (msg["data"]["parent_id"] != null) {
      
      scene.add(object);
      if (this.editMode) {
        if (typeof object.setEraserMode == "function") {
          object.setEraserMode(true);
        }
      }

      if (msg["data"]["scene_id"] == 1) {
        // this is a player
        // add to online members
        this.membersService.addMember(object);
        if (this.objects.has(msg["data"]["id"])) {
          // if this is me, reset the game loop as well
          this.objects.get("scene").remove(this.objects.get(msg["data"]["id"]));
        }
      }

      if (msg["data"]["id"] == sessionStorage.getItem("account_id")) {
        // this is me
        this.me = object;
        this.objects.get("root").setPlayer(object);
        this.objects.get("root").setScene(this.objects.get("scene"));
        this.target = {x: object.x, y: object.y};
        this.cameraOrigin = this.target;
        let scene: Scene = this.objects.get("scene");

        if (this.loop != undefined) this.loop.stop();

        let quadtree: Quadtree = Quadtree();

        this.loop = GameLoop({
          update: function() {
            quadtree.clear();
            let players: Player[] = [];
            for (let object of this.objects.values()) {
              (object as PersistObject).opacity = 1.0; // TODO: restore "original" opacity
              quadtree.add(object);
              if (object instanceof Player) players.push(object);
            }
            for (let player of players) {
              for (let potentialCollider of quadtree.get(player)) {
                let pCollider: PersistObject = potentialCollider as PersistObject;
                let collision: boolean = collides(pCollider, player);
                let playerBehind: boolean = ((pCollider.y + pCollider.height / 2) - (player.y + player.height / 2)) > 0;
                if (collision && playerBehind && player.height < pCollider.height) {
                  (potentialCollider as PersistObject).opacity = 0.2;
                }
              }
            }
            scene.update();
          }.bind(this),
          render: function() {
            this.target = {
              x: lerp(this.target.x, object.x + object.width / 2, 0.1),
              y: lerp(this.target.y, object.y + object.height / 2, 0.1)
            };
            scene.lookAt(this.target);
            scene.render();

            for (let persistObject of this.objects.values()) {
              if (persistObject != this.objects.get("scene")) {
                let t = {
                  x: this.target.x - this.cameraOrigin.x - (persistObject.width / 2),
                  y: this.target.y - this.cameraOrigin.y
                };
                persistObject.sx = t.x;
                persistObject.sy = t.y;
              }
            }
          }.bind(this)
        });
      
        // start the loop
        this.loop.start();
        
      }
    }
    else {
      scene.add(object);
    }
    if (object instanceof Checkpoint) this.checkpointService.addCheckpoint(object as Checkpoint);
    this.objects.set(msg["data"]["id"], object);
  }
  
  modifyPersistObject(msg: any): void {
	  if (this.objects.has(msg["id"])) {
      let object: GameObject = this.objects.get(msg["id"]);
      object[this.snakeToCamel(msg["method"])](msg);
    }
  }

  peerChangedActiveListing(msg: any): void {
    let player: any = this.objects.get(msg["persist_object_id"]);
    if (msg["public"] == true) {
      let player: any = this.objects.get(msg["persist_object_id"]);
    }
  }

  removePersistObject(msg: any): void {
    if (this.objects.has(msg["id"])) {
      let object: GameObject = this.objects.get(msg["id"]);
      this.objects.get("scene").remove(object);
      if (object instanceof Checkpoint) this.checkpointService.removeCheckpoint(object);
      if (object instanceof Player) this.membersService.removeMember(object);
    }
  }

  onRoomChange(roomId: string): void {
    //this.editButtonDisplay = (sessionStorage.getItem("room_is_owner") == 'true') ? "inherit" : "none";
    if (!this.mobile) this.editButtonDisplay = "inherit";
    (this.objects.get("scene") as Scene).destroy();
    this.objects = new Map<string, any>();

    if (!(roomId == undefined)) {
      let data: any = this.roomChangeService.getRoomData();
      this.roomTitle = data["room_title"];
      this.roomDescription = data["room_description"];
    }

    let sort = function(obj1, obj2) {
      [obj1, obj2] = [obj1, obj2].map(getWorldRect);
      return (obj1.y + obj1.height / 2) - (obj2.y + obj2.height / 2);
    }

    initPointer();

    this.objects.set("scene", Scene({
      id: 'game',
      children: [],
      cullObjects: false,
      sortFunction: sort
    }));
  }

  say(chat: any): void {
    this.objects.get(chat["account_id"]).say(chat);
  }

  openPlayerTooltip(displayName: string, id: string, position: Vector) {
    const viewContainerRef = this.playerTooltipHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PlayerTooltipComponent);

    let componentRef: ComponentRef<PlayerTooltipComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: PlayerTooltipComponent = <PlayerTooltipComponent>componentRef.instance;
    instance.onClose = this.closePlayerTooltip.bind(this);
    instance.displayName = displayName;
    instance.id = id;
    instance.position = this.getPointerPosition().subtract(Vector(0, 50));
  }

  closePlayerTooltip() {
    const viewContainerRef = this.playerTooltipHost.viewContainerRef;
    viewContainerRef.clear();
  }

  openInventoryPopup(): void {
    const viewContainerRef = this.inventoryPopupHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(InventoryPopupComponent);

    let componentRef: ComponentRef<InventoryPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: InventoryPopupComponent = <InventoryPopupComponent>componentRef.instance;

    instance.onClose = this.closeInventoryPopup.bind(this);
    instance.setActiveItem = this.setActiveItem.bind(this);
    document.getElementById("inventory-nav").blur();
  }

  closeInventoryPopup(): void {
    const viewContainerRef = this.inventoryPopupHost.viewContainerRef;
    viewContainerRef.clear();
  }

  openVendorPopup(): void {
    const viewContainerRef = this.vendorPopupHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(VendorPopupComponent);

    let componentRef: ComponentRef<VendorPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: VendorPopupComponent = <VendorPopupComponent>componentRef.instance;
    instance.onClose = this.closeVendorPopup.bind(this);
    document.getElementById("store-nav").blur();
  }

  closeVendorPopup(): void {
    const viewContainerRef = this.vendorPopupHost.viewContainerRef;
    viewContainerRef.clear();
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.eraserMode) this.eraserMode = this.editMode;
    if (this.editMode) {
      for (let persistObject of this.objects.values()) {
        if (typeof persistObject.setEraserMode == "function") {
          persistObject.setEraserMode(true);
        }
      }
    }
    else {
      for (let persistObject of this.objects.values()) {
        if (typeof persistObject.setEraserMode == "function") {
          persistObject.setEraserMode(false);
        }
      }
      this.closeEditItemTooltip();
      document.getElementById("edit-room-nav").blur();
    }
  }

  setActiveItem(itemId: number): void {
    let tileMap: InteractionHandler = this.objects.get("root");
    tileMap.setActiveItem(itemId);
  }

  setPreview(object: PersistObject): void {
    let tileMap: InteractionHandler = this.objects.get("root");
    tileMap.setPreview(object);
  }

  onItemDown(object: GameObject) {
    // this item can be edited. edit it!
    if (typeof object.setEraserMode == "function") {
      this.openEditItemTooltip(object);
    }
  }

  openEditItemTooltip(object) {
    const viewContainerRef = this.editItemTooltipHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(EditItemTooltipComponent);

    let componentRef: ComponentRef<EditItemTooltipComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: EditItemTooltipComponent = <EditItemTooltipComponent>componentRef.instance;
    instance.object = object;
    instance.onErase = this.onItemErase.bind(this);
    instance.onMove = this.onItemMove.bind(this);
    instance.onRotate = this.onItemRotate.bind(this);
    instance.onName = this.onItemName.bind(this);

    let coords: Vector = this.getPointerPosition();

    instance.x = coords.x + "px";
    instance.y = coords.y + "px";

    instance.displayName = object.displayName || "Unnamed object";
    instance.ownerAccountId = object.ownerAccountId;

    this.editingObject = object;
  }

  closeEditItemTooltip() {
    const viewContainerRef = this.editItemTooltipHost.viewContainerRef;
    viewContainerRef.clear();
  }

  onItemName(name: string): void {
    this.closeEditItemTooltip();
    this.socketService.sendMessage({"channel": "room", "type": "set_display_name", "id": this.editingObject.id, "display_name": name});
  }

  onItemErase(): void {
    this.socketService.sendMessage({"channel": "room", "type": "remove_persist_object", "id": this.editingObject.id});
    this.socketService.sendMessage({"channel": "room", "type": "request_inventory"});
    this.closeEditItemTooltip();
  }

  onItemMove(): void {
    this.setPreview(this.editingObject);
    this.toggleEditMode();
    this.closeEditItemTooltip();
  }

  onItemRotate(): void {
    this.socketService.sendMessage({"channel": "room", "type": "rotate_persist_object", "id": this.editingObject.id, "rotation": this.editingObject.variant + 1});
  }

  onMove(x: number, y: number): void {
    console.log(x, y);
    let worldPlayer: any = Vector(this.me.position.x, this.me.position.y + this.me.height / 2);
    console.log(worldPlayer.x, worldPlayer.y);
    console.log(Math.floor(worldPlayer.x + x), Math.floor(worldPlayer.y + y));
    this.socketService.sendMessage({channel: "room", type: "set_target", position_x: Math.floor(worldPlayer.x + x), position_y: Math.floor(worldPlayer.y + y)});
  }

  getPointerPosition(): Vector {
    let gameBoundingRect: any = document.getElementById("game").getBoundingClientRect();

    let canvas: any = {
      x: gameBoundingRect.x,
      y: gameBoundingRect.y,
      width: getCanvas().width,
      height: getCanvas().height
    }

    let pointer: any = getPointer();

    let relativePointerPosition: Vector = Vector(pointer.x / canvas.width, pointer.y / canvas.height);
    
    let pointerPosition: Vector = Vector(relativePointerPosition.x * gameBoundingRect.width, relativePointerPosition.y * gameBoundingRect.height);
    pointerPosition = pointerPosition.add(Vector(gameBoundingRect.x, gameBoundingRect.y));
    return pointerPosition;
  }
}
