import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
})
export class ActivitiesPage implements OnInit {
 public activityUrl = 'https://71136.m.viator.com';

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

  constructor( public iab: InAppBrowser) { }

  ngOnInit() {
    this.openWithSystemBrowser(this.activityUrl);
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
