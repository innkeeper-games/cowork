import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  millisecondsPerListing: Map<string, number>;

  constructor() {
    this.millisecondsPerListing = new Map<string, any>();
  }

  setMillisecondsForListing(listingId: string, milliseconds: number): void {
    this.millisecondsPerListing.set(listingId, milliseconds);
  }

  getMillisecondsForListing(listingId: string): number {
    return this.millisecondsPerListing.get(listingId);
  }

  hasListing(listingId: string): boolean {
    return this.millisecondsPerListing.has(listingId);
  }
}
