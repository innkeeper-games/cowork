import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LandingPageComponent } from './landing-page/landing-page/landing-page.component';
import { AuthComponent } from './auth/auth.component';
import { PricingComponent } from './landing-page/pricing/pricing.component';
import { AppInstructionsComponent } from './landing-page/app-instructions/app-instructions.component';

const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent

  },
  {
    path: 'pricing',
    component: PricingComponent
  },
  {
    path: 'app',
    component: AppInstructionsComponent
  },
  {
    path: 'auth',
    component: AuthComponent
  },
  {
    path: 'auth/sign-in',
    component: AuthComponent
  },
  {
    path: 'auth/sign-up',
    component: AuthComponent
  },
  {
    path: 'auth/forgot-password',
    component: AuthComponent
  },
  {
    path: 'auth/reset-password/:token',
    component: AuthComponent
  },
  {
    path: 'home',
    component: HomeComponent

  },
  {
    path: 'home/room',
    component: HomeComponent

  },
  {
    path: 'home/settings/profile',
    component: HomeComponent
  },
  {
    path: 'home/settings/subscribe',
    component: HomeComponent
  },
  {
    path: 'home/settings/current-room',
    component: HomeComponent
  },
  {
    path: 'home/settings/other-rooms',
    component: HomeComponent
  },
  {
    path: 'home/settings/invitations',
    component: HomeComponent
  },
  {
    path: 'home/stats',
    component: HomeComponent
  },
  {
    path: 'home/timer',
    component: HomeComponent
  },
  {
    path: 'home/chat',
    component: HomeComponent
  },
  {
    path: 'home/tasks/:taskId',
    component: HomeComponent
  },
  {
    path: 'home/tasks',
    component: HomeComponent
  },
  {
    path: 'home/settings',
    component: HomeComponent
  },
  {
    path: 'j/:roomId',
    component: AuthComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy', initialNavigation: 'enabledBlocking' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
