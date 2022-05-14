import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { AnalyticsService } from '../analytics.service';

export interface monetizedDocument extends Document {monetization: any}

@Injectable({
  providedIn: 'root'
})
export class WebMonetizationService {
  monetizationSource: Subject<string>;
  public monetization: Observable<string>;
  document: monetizedDocument;

  analyticsService: AnalyticsService;

  constructor(@Inject(DOCUMENT) document: Document, analyticsService: AnalyticsService) {
    this.document = <monetizedDocument> document;
    this.monetizationSource = new Subject<string>();
    this.monetization = this.monetizationSource.asObservable();
    if (this.webMonetizationExists()) {
      this.document.monetization.addEventListener('monetizationpending', (paymentPointer: string, requestId: string) => this.monetizationSource.next("pending"));
      this.document.monetization.addEventListener('monetizationstart', (paymentPointer: string, requestId: string) => {
        this.monetizationSource.next("started");
        analyticsService.trackEvent("9GP9H801");
      });
      this.document.monetization.addEventListener('monetizationstop', (paymentPointer: string, requestId: string) => this.monetizationSource.next("stopped"));
    }
    this.analyticsService = analyticsService;
  }

  public webMonetizationExists(): boolean {
    return !!this.document && !!this.document.monetization;
  }
}
