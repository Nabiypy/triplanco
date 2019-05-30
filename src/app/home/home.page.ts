import { Component, OnInit, NgZone, OnDestroy, AfterViewInit } from '@angular/core';
import { AlertController, Platform, ToastController, ModalController, Events } from '@ionic/angular';
import { BlockProvider } from '../provider/block';
import { FriendsProvider } from '../provider/friends';
import { Router } from '@angular/router';
import { ChatProvider } from '../provider/chat';
import { AuthProvider } from '../provider/auth';
import { NotificationsProvider } from '../provider/notifications';
import * as firebase from 'firebase/app';
import { GroupProvider } from '../provider/group';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { AngularFireDatabase } from 'angularfire2/database';
import { FCM } from '@ionic-native/fcm/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { GeoFire } from 'geofire';
import { InappbrowserService } from '../provider/inappbrowser.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit, OnDestroy, AfterViewInit {

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
    toolbar: 'no', // iOS only
    enableViewportScale: 'yes', // iOS only
    allowInlineMediaPlayback: 'no', // iOS only
    presentationstyle: 'formsheet'// iOS only
  };

	slideSloganOpts = {
		initialSlide: 1,
  };

	slideSideOpts = {
		speed: 1000,
		spaceBetween: 16,
		loop: true,
		slidesPerView: 4,
  };
  
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };

  slideIndex = 0;

  // Slider Data
  slides = [
    {
      text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients',
      imageUrl: 'assets/imgs/background/deals1.png',
      url: '/deals'
    },
    {
      text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients',
      imageUrl: 'assets/imgs/background/deals2.png',
      url: '/deals'
    },
    {
      text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients',
      imageUrl: 'assets/imgs/background/deals3.png',
      url: '/deals'
    },
    {
      text: 'Find the best deals of Flight, Hotels, Car, Cruise and Activities',
      imageUrl: 'assets/imgs/background/deals4.png',
      url: '/recomended'
    }

  ];

  geoRef = firebase.database().ref('geo/');

  public unsubscribeBackEvent: any;
  subscription: any;
  public Friends = [];
  public FriendsList = [];
  public allUsers = [];
  public Conversations = [];
  public notifications;
  userList = firebase.database().ref('users');
  backButtonSubscription;
  user: any;


  constructor(
    private platform: Platform,
    public blockProvider: BlockProvider,
    public chatProvider: ChatProvider,
    public authProvider: AuthProvider,
    public ngZone: NgZone,
    public notificationsProvider: NotificationsProvider,
    public fcm: FCM,
    public events: Events,
    public friendsProvider: FriendsProvider,
    public afAuth: AngularFireAuth,
    public modalCtrl: ModalController,
    public groupProvider: GroupProvider,
    public router: Router,
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    public afDB: AngularFireDatabase,
    public browserService: InappbrowserService,
    private iab: InAppBrowser) {

      // this.openWithCordovaBrowser(this.url);
      // this.openWithInAppBrowser(this.flightUrl);
      // this.openWithSystemBrowser(this.url);
  }

  ngAfterViewInit() {
    // when user click on exit button, it subscribe to platform backbutton
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      navigator['app'].exitApp();
    });
  }

  ngOnDestroy() {
    // unscribe from platform back button after exit
    this.backButtonSubscription.unsubscribe();
  }


  // ngOnInit function to load conversation and all firends
  ngOnInit() {
    this.friendsProvider.getAllFriendsOnline().then((res: any) => {
      this.Friends = res;
    }).catch((err) => {
      console.log(err);
    });

    // Get user details
    this.authProvider.getCurrentUser().valueChanges().subscribe(user => {
      this.user = user as any;
      console.log(' user', this.user);
    });

    this.events.subscribe('Friends', () => {
      this.ngZone.run(() => {
        this.FriendsList = this.friendsProvider.Friends;
      });
    });

    // the event to subscribe to notification count
    this.events.subscribe('Notifications', () => {
      this.ngZone.run(() => {
        const res = this.notificationsProvider.NotificationsUnread;
        this.notifications = res.length;
      });
    });

    // update push notification token in user account
    this.fcm.getToken().then(token => {
      console.log(token);
      firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
        pushToken: token
      });
    });

    this.chatProvider.getLocation().then((data) => {
      this.afDB.database.ref(`users/${this.afAuth.auth.currentUser.uid}`).update({
        lat: data.coords.latitude,
        long: data.coords.longitude,
      });
    });

    this.events.subscribe('Conversations', () => {
      this.ngZone.run(() => {
        this.Conversations = this.chatProvider.Conversations;
        this.allUsers = this.chatProvider.allFriend;
      });
    });

  }


  ionViewDidEnter() {
    this.friendsProvider.getFriends();
    this.chatProvider.getConversations();
    // get unread notifications
    this.notificationsProvider.getMyNotificationsUnread();
    setInterval(() => {
      this.ngOnInit();
    }, 3000);  // load the page every 3 seconds
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
  // proceed to notification page
  goNotification() {
    this.router.navigateByUrl('notifications');
  }

  ionViewDidLeave() {
    this.events.subscribe('Friends');
    this.events.subscribe('Conversations');
    this.events.subscribe('Notifications');
  }

  // delete conversation from server and locally
  deleteConvs(id, item, user) {
    this.chatProvider.deleteConverstion(id);
    // Remove locally
    const index1 = this.allUsers.indexOf(user);
    if (index1 > -1) {
      this.allUsers.splice(index1, 1);
    }
    // Remove locally
    const index2 = this.Conversations.indexOf(item);

    if (index2 > -1) {
      this.Conversations.splice(index2, 1);
    }
  }

  ionRefresh(event) {
    console.log('Pull Event Triggered!');
    setTimeout(() => {
      console.log('Async operation has ended');
      // complete()  signify that the refreshing has completed and to close the refresher
      event.target.complete();
      this.friendsProvider.getAllFriends().then((res: any) => {
        this.Friends = res;
      }).catch((err) => {
        console.log(err);
      });
    }, 2000);
  }

  ionPull(event) {
    // Emitted while the user is pulling down the content and exposing the refresher.
    console.log('ionPull Event Triggered!');
  }

  ionStart(event) {
    // Emitted when the user begins to start pulling down.
    console.log('ionStart Event Triggered!');
  }

  // procced to users list to find user
  findUser() {
    this.router.navigateByUrl('users');
  }

  async goChat(friend, id) {
    this.chatProvider.initializebuddy(friend);
    // processed to chat page
    this.router.navigateByUrl('chat');
    return firebase.database().ref('/Coversations').child(firebase.auth().currentUser.uid).child(id).update({
      unread: 0,
    });
  }

  // view user image in large form in modal page
  async viewImage(src: string, title: string, description: string) {
    const modal = await this.modalCtrl.create({
      component: ImageViewerComponent,
      componentProps: {
        imgSource: src,
        imgTitle: title,
        imgDescription: description
      },
      cssClass: 'modal-fullscreen',
      keyboardClose: true,
      showBackdrop: true
    });

    return await modal.present();
  }
  goToFlights() {
    this.router.navigateByUrl('/flights');
  }
  goToHotels() {
    this.router.navigateByUrl('/hotels');
  }
  goToCars() {
    this.router.navigateByUrl('/cars');
  }
  // Go to Bundles page
  goToBundles() {
    this.router.navigateByUrl('/bundles');
  }
}

