import { Injectable } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';


@Injectable({
  providedIn: 'root'
})

export class InappbrowserService {

  public flightUrl = 'http://flights.triplanco.com/?marker=200540';
  public hotelUrl = 'http://apphotels.triplanco.com/?marker=200540&language=en';
  public bundlesUrl = 'https://bundles-zymhbwrfux.now.sh/';
  public activitesUrl = 'https://71136.m.viator.com';
  public carsUrl = 'https://cars-oqowcqjncf.now.sh/';
  public cruiseUrl = 'https://cruise-uigfglyiaw.now.sh';
  public otherDealsUrl = 'otherdeals-ugcqxgtgew.now.sh';
  // public bestDealsUrl = 'https://bestdeals-pfskdsgytb.now.sh';
  public bestDealsUrl = 'https://bestdeals-tkiyhzbald.now.sh';

  options: InAppBrowserOptions = {
    location: 'yes', // Or 'no'
    hidden: 'no', // Or  'yes'
    clearcache: 'yes',
    clearsessioncache: 'yes',
    zoom: 'yes', // Android only ,shows browser zoom controls
    hardwareback: 'yes',
    mediaPlaybackRequiresUserAction: 'no',
    shouldPauseOnSuspend: 'no', // Android only
    closebuttoncaption: 'Back', // iOS only
    disallowoverscroll: 'no', // iOS only
    hidenavigationbuttons: 'no', // iOS only
    toolbar: 'yes', // iOS only
    enableViewportScale: 'yes', // iOS only
    allowInlineMediaPlayback: 'no', // iOS only
  };

  constructor(private iab: InAppBrowser) { }

  openFlightSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.flightUrl, target, this.options);
  }
  openHotelSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.hotelUrl, target, this.options);
  }
  openCarSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.carsUrl, target, this.options);
  }

  openCruiseSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.cruiseUrl, target, this.options);
  }

  openActivitiesSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.activitesUrl, target, this.options);
  }

  openBundleSearchPage() {
    const target = '_blank';
    const browser = this.iab.create(this.bundlesUrl, target, this.options);
  }
  openOtherDealsPage() {
    const target = '_blank';
    const browser = this.iab.create(this.otherDealsUrl, target, this.options);
  }

  openBestDealsPage() {
    const target = '_blank';
    const browser = this.iab.create(this.bestDealsUrl, target, this.options);
  }
}
