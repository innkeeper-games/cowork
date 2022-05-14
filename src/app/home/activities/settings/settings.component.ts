import { Component, OnInit, ComponentFactoryResolver, ViewChild, ComponentRef } from "@angular/core";
import { Location } from "@angular/common";
import { SocketService } from "src/app/socket/socket.service";
import { RoomChangeService } from "../../room-change.service";
import { Activity } from "../activity";
import { RoomLinkDirective } from "./room-link.directive";
import { RoomLinkComponent } from "./room-link/room-link.component";
import { NgForm } from "@angular/forms";
import { RoomInvitationDirective } from "./room-invitation.directive";
import { RoomInvitationComponent } from "./room-invitation/room-invitation.component";
import { MenuComponent } from "../../menu/menu.component";

import { ProService } from "../../pro.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit, Activity {
  @ViewChild(RoomLinkDirective, { static: true }) roomLinkHost: RoomLinkDirective;
  @ViewChild(RoomInvitationDirective, { static: true }) roomInvitationHost: RoomInvitationDirective;

  header: string = "Settings";
  roomPrivate: boolean = true;
  roomTitle: string = sessionStorage.getItem("room_title");
  roomDescription: string = sessionStorage.getItem("room_description") || "";
  roomId: string = sessionStorage.getItem("room_id");
  roomLink: string = "https://joincowork.com/j/" + this.roomId;

  rooms: Set<string> = new Set<string>();

  sent: boolean;

  pro: boolean;

  socketService: SocketService;
  roomChangeService: RoomChangeService;
  proService: ProService;
  componentFactoryResolver: ComponentFactoryResolver;

  displayName: string;

  location: Location;

  subpage: string;

  paymentDeviceData: any;
  dropinInstance: any;

  constructor(socketService: SocketService, roomChangeService: RoomChangeService, proService: ProService, location: Location, componentFactoryResolver: ComponentFactoryResolver) {
    this.socketService = socketService;
    this.roomChangeService = roomChangeService;
    this.proService = proService;
    this.location = location;
    this.componentFactoryResolver = componentFactoryResolver;
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
    this.roomChangeService.roomId.subscribe(msg => this.onRoomChange(msg));
    this.proService.pro.subscribe(pro => {
      this.pro = pro;
      if (!this.pro) this.socketService.sendMessage({ channel: "settings", type: "request_payment_client_token" });
    });
    this.socketService.sendMessage({ channel: "settings", type: "request_rooms" });
    this.socketService.sendMessage({ channel: "settings", type: "request_listed_rooms" });
    this.socketService.sendMessage({ channel: "settings", type: "request_invitations" });
    if (sessionStorage.getItem("room_id") != undefined) {
      this.socketService.sendMessage({ channel: "settings", type: "enter_room", room_id: sessionStorage.getItem("room_id") });
    }
    if (sessionStorage.getItem("joinRoomId") != undefined) {
      this.socketService.sendMessage({ channel: "settings", type: "join_room", room_id: sessionStorage.getItem("joinRoomId") });
      sessionStorage.removeItem("joinRoomId");
      sessionStorage.removeItem("joinRoomTitle");
    }
    this.displayName = sessionStorage.getItem("display_name");

    this.location.onUrlChange(this.handleAddition.bind(this));
    this.handleAddition();
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "settings") {
      if (msg["type"] == "request_payment_client_token") {
        // braintree removed for now
      }
      if (msg["type"] == "checkout") {
        if (msg["success"]) {
          this.proService.setPro(true);
          this.dropinInstance.teardown(function (teardownErr) {
            if (teardownErr) {
              console.error("Could not tear down Drop-in UI!");
            } else {
              console.info("Drop-in UI has been torn down!");
              document.getElementById("submit-button").remove();
            }
          });
        }
      }
      if (msg["type"] == "request_rooms") {
        let numRooms = Object.keys(msg["rooms"]).length;
        if (numRooms == 0) {
          this.roomChangeService.setRoom(undefined);
          document.getElementById("room-settings").classList.add("hidden");
          document.getElementById("enter-room").classList.add("hidden");
        }
        else if (numRooms == 1) {
          document.getElementById("room-settings").classList.remove("hidden");
          document.getElementById("enter-room").classList.add("hidden");
        }
        else {
          document.getElementById("room-settings").classList.remove("hidden");
          document.getElementById("enter-room").classList.remove("hidden");
        }
        for (let room_id in msg["rooms"]) {
          if (sessionStorage.getItem("room_id") == null || sessionStorage.getItem("room_title") == null) {
            sessionStorage.setItem("room_id", room_id);
            sessionStorage.setItem("room_title", msg["rooms"][room_id]["room_title"]);
            sessionStorage.setItem("room_description", msg["rooms"][room_id]["room_description"]);
            this.socketService.sendMessage({ channel: "settings", type: "enter_room", room_id: room_id });
          }
          if (!(room_id == sessionStorage.getItem("room_id"))) {
            let data: any = msg["rooms"][room_id];
            this.loadRoomLink(data);
          }
        }
      }
      else if (msg["type"] == "request_listed_rooms") {
        for (let room_id in msg["listed_rooms"]) {
          if (!(room_id == sessionStorage.getItem("room_id"))) {
            let data: any = msg["listed_rooms"][room_id];
            this.loadRoomLink(data);
          }
        }
      }
      else if (msg["type"] == "request_room_privacy") {
        if (msg["private"] != this.roomPrivate) {
          this.roomPrivate = msg["private"];
          let privacyForms: HTMLCollectionOf<Element> = document.getElementsByClassName("privacy-form");
          for (let index = 0; index < privacyForms.length; index++) {
            const privacyForm = privacyForms[index];
            privacyForm.classList.toggle("hidden");
          }
        }
      }
      else if (msg["type"] == "set_room_privacy") {
        if (msg["success"] == true) {
          this.roomPrivate = !this.roomPrivate;
          let privacyForms: HTMLCollectionOf<Element> = document.getElementsByClassName("privacy-form");
          for (let index = 0; index < privacyForms.length; index++) {
            const privacyForm = privacyForms[index];
            privacyForm.classList.toggle("hidden");
          }
        }
      }
      else if (msg["type"] == "enter_room") {
        if (msg["success"] == true) {
          sessionStorage.setItem("room_title", msg["room_title"]);
          sessionStorage.setItem("room_description", msg["room_description"]);
          sessionStorage.setItem("room_id", msg["room_id"]);
          // TODO: use better permissioning systems
          sessionStorage.setItem("room_is_owner", msg["is_owner"]);
          this.roomTitle = sessionStorage.getItem("room_title");
          this.roomDescription = sessionStorage.getItem("room_description");
          this.roomChangeService.setRoomData({ "room_title": msg["room_title"], "room_description": msg["room_description"] });
          this.roomChangeService.setRoom(msg["room_id"]);
        }
      }
      else if (msg["type"] == "join_room") {
        this.reloadRooms();
      }
      else if (msg["type"] == "request_invitations") {
        const viewContainerRef = this.roomInvitationHost.viewContainerRef;
        viewContainerRef.clear();
        let invitations = msg["invitations"];
        if (invitations.length > 0) {
          document.getElementById("invitations").classList.remove("hidden");
          invitations.forEach(invitation => {
            let data: any = {
              title: invitation["room_title"], room_id: invitation["room_id"],
              username: invitation["username"], invitation_id: invitation["invitation_id"]
            };
            this.loadInvitation(data);
          });
        }
        else {
          document.getElementById("invitations").classList.add("hidden");
        }
      }
      else if (msg["type"] == "decline_invitation") {
        this.reloadInvitations();
      }
      else if (msg["type"] == "create_room") {
        this.socketService.sendMessage({ channel: "settings", type: "enter_room", room_id: msg["room_id"] });
      }
      else if (msg["type"] == "leave_room") {
        if (msg["success"] == true) {
          sessionStorage.removeItem("room_title");
          sessionStorage.removeItem("room_id");
          this.reloadRooms();
        }
      }
      else if (msg["type"] == "edit_display_name") {
        this.displayName = msg["display_name"];
        sessionStorage.setItem("display_name", msg["display_name"]);
        location.reload();
      }
      else if (msg["type"] == "edit_room_title") {
        this.roomTitle = msg["room_title"];
        sessionStorage.setItem("room_title", msg["room_title"]);
      }
      else if (msg["type"] == "edit_room_description") {
        this.roomDescription = msg["room_description"];
        sessionStorage.setItem("room_description", msg["room_description"]);
      }
    }
  }

  handleAddition(): void {
    if (MenuComponent.getActivity(this.location.path()) == "settings" && this.location.path().split("/").length > 3) {
      this.openSubpage(this.location.path().split("/")[3]);
    }
    else if (MenuComponent.getActivity(this.location.path()) == "settings") {
      this.openSubpage(undefined);
    }
  }

  navigate(subpage: string, event: Event) {
    event.preventDefault();
    this.location.replaceState("/home/settings/" + subpage);
  }

  openSubpage(subpage: string): void {
    this.subpage = subpage;
  }

  closeSubpage(): void {
    this.location.replaceState("/home/settings");
    this.openSubpage(undefined);
  }

  onSubmitDisplayName(f: NgForm) {
    let submission = { channel: "settings", type: "edit_display_name", display_name: <string>f.value["display_name"] };
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  onSubmitRoomTitle(f: NgForm) {
    let submission = { channel: "settings", type: "edit_room_title", room_id: this.roomId, room_title: <string>f.value["room_title"] };
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  onSubmitRoomDescription(f: NgForm) {
    let submission = { channel: "settings", type: "edit_room_description", room_id: this.roomId, room_description: <string>f.value["room_description"] };
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  loadRoomLink(data: any): void {
    if (!(this.rooms.has(data.room_id))) {
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(RoomLinkComponent);

      const viewContainerRef = this.roomLinkHost.viewContainerRef;

      const componentRef = viewContainerRef.createComponent(componentFactory);
      (<RoomLinkComponent>componentRef.instance).data = data;

      this.rooms.add(data.room_id);
    }
  }

  reloadRooms(): void {
    const viewContainerRef = this.roomLinkHost.viewContainerRef;
    viewContainerRef.clear();
    this.rooms.clear();
    this.socketService.sendMessage({ channel: "settings", type: "request_rooms" });
  }

  loadInvitation(data: any): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(RoomInvitationComponent);

    const viewContainerRef = this.roomInvitationHost.viewContainerRef;

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<RoomInvitationComponent>componentRef.instance).data = data;
  }

  reloadInvitations(): void {
    this.socketService.sendMessage({ channel: "settings", type: "request_invitations" });
  }

  onRoomChange(roomId: string): void {
    if (!(roomId == undefined)) {
      this.socketService.sendMessage({ channel: "settings", type: "request_room_privacy", room_id: roomId });
      this.roomId = roomId;
      this.roomLink = "https://joincowork.com/j/" + this.roomId;
      this.reloadRooms();
    }
  }

  onSubmitInvite(f: NgForm): void {
    let submission = { channel: "settings", type: "create_invitation", room_id: sessionStorage.getItem("room_id"), invitee: <string>f.value["username"] };
    this.socketService.sendMessage(submission);
    f.resetForm();
    this.sent = true;
  }

  onSubmitJoin(f: NgForm): void {
    let submission = { channel: "settings", type: "join_room", room_id: <string>f.value["joinCode"] };
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  onSubmitLeave(): void {
    let submission = { channel: "settings", type: "leave_room", room_id: sessionStorage.getItem("room_id") };
    this.socketService.sendMessage(submission);
  }

  onSubmitCreate(f: NgForm): void {
    let submission = { channel: "settings", type: "create_room", title: <string>f.value["title"] };
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  onToggleRoomPrivacy(): void {
    let submission = { channel: "settings", type: "set_room_privacy", room_id: sessionStorage.getItem("room_id"), private: !this.roomPrivate };
    this.socketService.sendMessage(submission);
  }
}
