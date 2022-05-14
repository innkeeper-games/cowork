import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { SafePipeModule } from 'safe-pipe';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './home/menu/menu.component';
import { HeaderComponent } from './home/header/header.component';
import { ActivityContainerComponent } from './home/activity-container.component';
import { PanelHeaderComponent } from './panel-header/panel-header.component';
import { ChatComponent } from './home/activities/chat/chat.component';
import { TimerComponent } from './home/activities/timer/timer.component';
import { TasksComponent } from './home/activities/tasks/tasks.component';
import { LandingPageComponent } from './landing-page/landing-page/landing-page.component';
import { RoomComponent } from './home/room/room.component';
import { SignInComponent } from './auth/goals/sign-in/sign-in.component';
import { SignUpComponent } from './auth/goals/sign-up/sign-up.component';
import { JoinRoomComponent } from './auth/goals/join-room/join-room.component';
import { AuthComponent } from './auth/auth.component';
import { GoalContainerComponent } from './auth/goal-container/goal-container.component';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './home/activities/settings/settings.component';
import { RoomLinkDirective } from './home/activities/settings/room-link.directive';
import { RoomLinkComponent } from './home/activities/settings/room-link/room-link.component';
import { ChatMessageDirective } from './home/activities/chat/chat-message.directive';
import { ChatMessageComponent } from './home/activities/chat/chat-message/chat-message.component';
import { RoomInvitationDirective } from './home/activities/settings/room-invitation.directive';
import { RoomInvitationComponent } from './home/activities/settings/room-invitation/room-invitation.component';
import { ListDirective } from './home/activities/tasks/list.directive';
import { ListComponent } from './home/activities/tasks/list/list.component';
import { TaskComponent } from './home/activities/tasks/list/task/task.component';
import { TaskDirective } from './home/activities/tasks/list/task.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { StatsComponent } from './home/activities/stats/stats.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TaskEditorPopupComponent } from './home/activities/tasks/task-editor-popup/task-editor-popup.component';
import { TaskEditorPopupDirective } from './home/activities/tasks/task-editor-popup.directive';
import { PlayerTooltipDirective } from './home/room/root/character/player/player-tooltip.directive';
import { PlayerTooltipComponent } from './home/room/root/character/player/player-tooltip/player-tooltip.component';
import { NotMonetizedComponent } from './home/activities/stats/not-monetized/not-monetized.component';
import { LoadingMonetizationComponent } from './home/activities/stats/loading-monetization/loading-monetization.component';
import { MonetizedComponent } from './home/activities/stats/monetized/monetized.component';
import { FilterPopupComponent } from './home/activities/tasks/list/filter-popup/filter-popup.component';
import { FilterPopupDirective } from './home/activities/tasks/list/filter-popup.directive';
import { TagComponent } from './home/activities/tasks/list/filter-popup/tag/tag.component';
import { TagDirective } from './home/activities/tasks/list/filter-popup/tag.directive';
import { TagsPopupComponent } from './home/activities/tasks/task-editor-popup/tags-popup/tags-popup.component';
import { TagsPopupDirective } from './home/activities/tasks/task-editor-popup/tags-popup.directive';
import { NavbarComponent } from './landing-page/navbar/navbar.component';
import { PricingComponent } from './landing-page/pricing/pricing.component';
import { FooterComponent } from './landing-page/footer/footer.component';
import { UpdateNotesPopupComponent } from './home/update-notes-popup/update-notes-popup.component';
import { UpdateNotesPopupDirective } from './home/update-notes-popup.directive';
import { MemberListComponent } from './home/room/member-list/member-list.component';
import { ActiveTaskPickerPopupComponent } from './home/activities/timer/active-task-picker-popup/active-task-picker-popup.component';
import { ActiveTaskPickerPopupDirective } from './home/activities/timer/active-task-picker-popup.directive';
import { ForgotPasswordComponent } from './auth/goals/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/goals/reset-password/reset-password.component';
import { OnboardingPopupDirective } from './home/menu/onboarding-popup.directive';
import { OnboardingPopupComponent } from './home/menu/onboarding-popup/onboarding-popup.component';
import { VendorPopupComponent } from './home/room/vendor-popup/vendor-popup.component';
import { InventoryPopupComponent } from './home/room/inventory-popup/inventory-popup.component';
import { InventoryPopupDirective } from './home/room/inventory-popup.directive';
import { VendorPopupDirective } from './home/room/vendor-popup.directive';
import { EditItemTooltipComponent } from './home/room/root/edit-item-tooltip/edit-item-tooltip.component';
import { EditItemTooltipDirective } from './home/room/root/edit-item-tooltip.directive';
import { CheckpointListComponent } from './home/room/checkpoint-list/checkpoint-list.component';
import { AppInstructionsComponent } from './landing-page/app-instructions/app-instructions.component';
import { SubpageLinkComponent } from './home/activities/settings/subpage-link/subpage-link.component';
import { ProBadgeComponent } from './home/pro-badge/pro-badge.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MenuComponent,
        HeaderComponent,
        ActivityContainerComponent,
        PanelHeaderComponent,
        ChatComponent,
        TimerComponent,
        TasksComponent,
        StatsComponent,
        LandingPageComponent,
        RoomComponent,
        GoalContainerComponent,
        SignInComponent,
        SignUpComponent,
        AuthComponent,
        SettingsComponent,
        RoomLinkDirective,
        RoomLinkComponent,
        ChatMessageDirective,
        ChatMessageComponent,
        RoomInvitationDirective,
        RoomInvitationComponent,
        JoinRoomComponent,
        ListDirective,
        ListComponent,
        TaskComponent,
        TaskDirective,
        TaskEditorPopupComponent,
        TaskEditorPopupDirective,
        PlayerTooltipComponent,
        PlayerTooltipDirective,
        NotMonetizedComponent,
        LoadingMonetizationComponent,
        MonetizedComponent,
        FilterPopupComponent,
        FilterPopupDirective,
        TagComponent,
        TagDirective,
        TagsPopupComponent,
        TagsPopupDirective,
        NavbarComponent,
        PricingComponent,
        AppInstructionsComponent,
        FooterComponent,
        UpdateNotesPopupComponent,
        UpdateNotesPopupDirective,
        MemberListComponent,
        ActiveTaskPickerPopupComponent,
        ActiveTaskPickerPopupDirective,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        OnboardingPopupDirective,
        OnboardingPopupComponent,
        VendorPopupComponent,
        InventoryPopupComponent,
        InventoryPopupDirective,
        VendorPopupDirective,
        EditItemTooltipComponent,
        EditItemTooltipDirective,
        CheckpointListComponent,
        SubpageLinkComponent,
        ProBadgeComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        DragDropModule,
        FontAwesomeModule,
        ClipboardModule,
        SafePipeModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
