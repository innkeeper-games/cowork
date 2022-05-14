import { Injectable } from '@angular/core';
import { Vector } from 'kontra';
import { Observable, Subject } from 'rxjs';
import { SocketService } from '../socket/socket.service';
import { RoomChangeService } from './room-change.service';
import { RoomComponent } from './room/room.component';
import { Player } from './room/root/character/player/player';

/*

Responsible for:
- keeping track of all online members
- keeping track of which members are working
- keeping track of which members are idling?
- opening player tooltips I think (that way, it's easier to do that from chat or comments)

*/

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  roomChangeService: RoomChangeService;
  socketService: SocketService;

  addedMemberSource: Subject<Player> = new Subject<Player>();
  removedMemberSource: Subject<Player> = new Subject<Player>();

  public addedMember: Observable<Player> = this.addedMemberSource.asObservable();
  public removedMember: Observable<Player> = this.removedMemberSource.asObservable();

  members: Set<{displayName: string, id: string}>;
  onlineMembers: Set<Player> = new Set<Player>();
  
  offlineMembersSource: Subject<Set<{displayName: string, id: string}>> = new Subject<Set<{displayName: string, id: string}>>();
  public offlineMembers: Observable<Set<{displayName: string, id: string}>> = this.offlineMembersSource.asObservable();

  roomId: string;

  room: RoomComponent;

  constructor(roomChangeService: RoomChangeService, socketService: SocketService) {
    this.roomChangeService = roomChangeService;
    this.socketService = socketService;
    if (!this.socketService.channelIsRegistered("settings")) this.socketService.register("settings");
    this.socketService.channelReply.get("settings").subscribe(msg => {
      if (msg["type"] == "request_room_members") {
        let newOfflineMembers: Set<{displayName: string, id: string}> = new Set<{displayName: string, id: string}>();
        this.members = new Set<{displayName: string, id: string}>();

        for (let offlineMember of msg["members"]) {
          let duplicate: boolean = false;
          for (let member of this.onlineMembers.values()) {
            // TODO: inefficient
            if (member.id == offlineMember.account_id) {
              duplicate = true;
            }
          }
          if (!duplicate) {
            newOfflineMembers.add(
              {
                displayName: offlineMember.display_name,
                id: offlineMember.account_id
              }
            );

            this.members.add(
              {
                displayName: offlineMember.display_name,
                id: offlineMember.account_id
              }
            );
          }
        }
        this.offlineMembersSource.next(newOfflineMembers);
      }
    });
    this.roomChangeService.roomId.subscribe((roomId: string) => {
      this.roomId = roomId;
      this.socketService.sendMessage({channel: "settings", type: "request_room_members", room_id: roomId});
      let members: Player[] = Array.from(this.onlineMembers);
      this.members = new Set<{displayName: string, id: string}>();
      for (let member of members) this.removeMember(member);
    });
  }

  setRoom(room: RoomComponent) {
    this.room = room;
  }

  addMember(member: Player): void {
    this.addedMemberSource.next(member);
    this.onlineMembers.add(member);
    this.socketService.sendMessage({channel: "settings", type: "request_room_members", room_id: this.roomId});
  }

  removeMember(member: Player): void {
    this.removedMemberSource.next(member);
    this.onlineMembers.delete(member);
    this.socketService.sendMessage({channel: "settings", type: "request_room_members", room_id: this.roomId});
  }

  getMembers(): Set<Player> {
    return this.onlineMembers;
  }

  openTooltip(displayName: string, id: string): void {
    this.room.openPlayerTooltip(displayName, id, Vector(window.innerWidth / 2, window.innerHeight / 2))
  }
}
