import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { faHome, faStore, faComments, faHourglass, faChartPie, faTasks, faCalendar, faCog } from '@fortawesome/free-solid-svg-icons';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateNotesPopupComponent } from '../update-notes-popup/update-notes-popup.component';
import { UpdateNotesPopupDirective } from '../update-notes-popup.directive';
import { SocketService } from 'src/app/socket/socket.service';
import { Handler } from 'src/app/handler';
import { RoomChangeService } from '../room-change.service';
import { OnboardingPopupDirective } from './onboarding-popup.directive';
import { OnboardingPopupComponent } from './onboarding-popup/onboarding-popup.component';
import { AnalyticsService } from 'src/app/analytics.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})

export class MenuComponent extends Handler implements OnInit{
  @ViewChild(UpdateNotesPopupDirective, { static: true }) public updateNotesPopupHost: UpdateNotesPopupDirective;
  @ViewChild(OnboardingPopupDirective, { static: true }) public onboardingPopupHost: OnboardingPopupDirective;

  notificationsService: NotificationsService;
  socketService: SocketService;
  roomChangeService: RoomChangeService;
  analyticsService: AnalyticsService;
  location: Location;
  faHome = faHome;
  faStore = faStore;
  faComments = faComments;
  faHourglass = faHourglass;
  faChartPie = faChartPie;
  faTasks = faTasks;
  faCalendar = faCalendar;
  faCog = faCog;

  updateNotesDisplay: string = "none";
  updateNotesData: string[] = [];

  currentTabIndex: number = 0;

  componentFactoryResolver: ComponentFactoryResolver;

  audio: HTMLAudioElement;

  constructor(notificationsService: NotificationsService, location: Location, componentFactoryResolver: ComponentFactoryResolver, socketService: SocketService, roomChangeService: RoomChangeService, analyticsService: AnalyticsService) {
    super();
    
    this.notificationsService = notificationsService;
    this.componentFactoryResolver = componentFactoryResolver;
    this.socketService = socketService;
    this.roomChangeService = roomChangeService;
    this.analyticsService = analyticsService;
    this.location = location;
    this.location.onUrlChange(this.updateActivity.bind(this));

    this.audio = new Audio();
    this.audio.src = "../../../assets/notifications/notification.ogg";
    this.audio.load();
  }

  navigate(s: string, event: Event): void {
    let activity: string = MenuComponent.getActivity(s);
    event.preventDefault();
    document.getElementById(activity + "-nav").blur();
    this.location.replaceState(s);
  }

  ngOnInit(): void {
    this.notificationsService.notificationsSource.subscribe(activity => this.notifyActivity(activity));
    this.updateActivity(this.location.path(), this.location.getState());

    this.roomChangeService.roomId.subscribe(roomId => {
      if (roomId == undefined) {
        // there are no rooms, so start the onboarding/tutorial process
        this.openOnboarding();
      }
    });

    this.socketService.setOnUpdateNotes(this.onUpdateNotes.bind(this));
  }

  onUpdateNotes(updateNotesData: any[]): void {
    for (let i = 0; i < updateNotesData.length; i++) {
      this.updateNotesData.push(updateNotesData[i]);
      this.notificationsService.pushNotification('update-notes');
    }
    if (this.updateNotesData.length > 0) {
      this.updateNotesDisplay = "inherit";
    }
  }

  notifyActivity(activity: string): void {
    if (!(MenuComponent.getActivity(this.location.path()) == activity) || document.hidden) {
      let notificationsActivity: Element = document.getElementById(activity + "-notification");
      notificationsActivity.innerHTML = (Number.parseInt(notificationsActivity.innerHTML) + 1).toString();
      if (notificationsActivity.classList.contains("hidden")) notificationsActivity.classList.remove("hidden");
      this.audio.play();
    } 
  }

  clearNotificationsForActivity(activity: string): void {
    let notificationsActivity: Element = document.getElementById(activity + "-notification");
    notificationsActivity.innerHTML = "0";
    if (!notificationsActivity.classList.contains("hidden")) notificationsActivity.classList.add("hidden");
  }

  updateActivity(url: string, state: unknown): void {
    // ALERT: REDUNDANCY
    let activity: string = MenuComponent.getActivity(url);
    let selectedElements: HTMLCollection = document.getElementsByClassName("selected");
    let i: number = 0;
    for (let i: number = 0; i < selectedElements.length; i++) {
      let selectedElement: Element = selectedElements[i];
      selectedElement.classList.remove("selected");
      selectedElement.setAttribute('tabindex', "-1");
      selectedElement.setAttribute('aria-selected', 'false');
    }
    let newVisibleActivity: Element = document.getElementById(activity + "-nav");
    newVisibleActivity.classList.add("selected");

    newVisibleActivity.setAttribute('tabindex', "0");
    newVisibleActivity.setAttribute('aria-selected', 'true');
    (newVisibleActivity as HTMLElement).focus();

    let children: HTMLCollectionOf<Element> = (document.getElementsByClassName("nav-tab") as HTMLCollectionOf<Element>);
    for (let i: number = 0; i < children.length; i++) {
      if (children.item(i) == newVisibleActivity) {
        this.currentTabIndex = i;
      }
    }

    this.clearNotificationsForActivity(activity);
  }

  static getActivity(path: string): string {
    let splitPath: string[] = path.split('/');
    let activity: string = splitPath[2];
    activity = activity.replace('/', '');
    return activity;
  }


  openOnboarding(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(OnboardingPopupComponent);

    const viewContainerRef = this.onboardingPopupHost.viewContainerRef;

    let componentRef: ComponentRef<OnboardingPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: OnboardingPopupComponent = <OnboardingPopupComponent>componentRef.instance;
    instance.onClose = this.closeOnboarding.bind(this);
  }

  closeOnboarding(): void {
    const viewContainerRef = this.onboardingPopupHost.viewContainerRef;
    viewContainerRef.clear();
  }

  openUpdateNotes(): void {
    this.analyticsService.trackEvent("PHLC5RJG");

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(UpdateNotesPopupComponent);

    const viewContainerRef = this.updateNotesPopupHost.viewContainerRef;

    let componentRef: ComponentRef<UpdateNotesPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: UpdateNotesPopupComponent = <UpdateNotesPopupComponent>componentRef.instance;
    instance.data = this.updateNotesData;
    instance.onClose = this.closeUpdateNotes.bind(this);
  }

  closeUpdateNotes(event: Event): void {
    if ((event.target as HTMLElement).classList.contains("modal") ||
      (event.target as HTMLElement).classList.contains("close-update-notes") ||
      (event.target as HTMLElement).classList.contains("close-button")) {
      const viewContainerRef = this.updateNotesPopupHost.viewContainerRef;
      viewContainerRef.clear();
      this.clearNotificationsForActivity("update-notes");
      this.updateNotesDisplay = "none";
    }
  }

}
