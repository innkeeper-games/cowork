import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AnalyticsService } from 'src/app/analytics.service';

@Component({
  selector: 'app-pro-badge',
  templateUrl: './pro-badge.component.html',
  styleUrls: ['./pro-badge.component.css']
})
export class ProBadgeComponent implements OnInit {

  location: Location;
  analyticsService: AnalyticsService;

  constructor(location: Location, analyticsService: AnalyticsService) {
    this.location = location;
    this.analyticsService = analyticsService;
  }

  ngOnInit(): void {
  }

  goToSubscription(event: Event): void {
    event.preventDefault();
    this.analyticsService.trackEvent("Select Pro badge");
    this.location.replaceState("/home/settings/subscribe");
  }

}
