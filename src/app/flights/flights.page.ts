import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.page.html',
  styleUrls: ['./flights.page.scss'],
})
export class FlightsPage implements OnInit {

  public flightUrl = 'http://flights.triplanco.com/?marker=200540';

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
    toolbar: 'no', // iOS only
    enableViewportScale: 'yes', // iOS only
    allowInlineMediaPlayback: 'no', // iOS only
    presentationstyle: 'formsheet'// iOS only
  };
  constructor( public iab: InAppBrowser) { }

  ngOnInit() {
    // this.openWithCordovaBrowser(this.flightUrl);
  }
  public openWithSystemBrowser(url: string) {
    const target = '_system';
    this.iab.create(url, target, this.options);
  }
  public openWithInAppBrowser(url: string) {
    const target = '_blank';
    this.iab.create(url, target, this.options);
  }
  public openWithCordovaBrowser(url: string) {
    const target = '_self';
    const browser = this.iab.create(url, target, this.options);
  }
}
