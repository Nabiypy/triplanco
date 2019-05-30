import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-hotels',
  templateUrl: './hotels.page.html',
  styleUrls: ['./hotels.page.scss'],
})
export class HotelsPage implements OnInit {
  public flightUrl = 'http://flights.triplanco.com/?marker=200540';
  public hotelUrl = 'http://apphotels.triplanco.com/?marker=200540&language=en';
  public bundlesUrl = '';
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
    presentationstyle: 'formsheet'// iOS only
  };

  constructor(public iab: InAppBrowser) { }

  ngOnInit() {
    this.openWithSystemBrowser(this.hotelUrl);
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
