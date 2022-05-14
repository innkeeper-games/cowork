import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare global {
  interface Window {
      plausible: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  httpClient: HttpClient;
  
  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  trackEvent(eventName: string, options?: any) {
    window.plausible(eventName, options);
  }
}
