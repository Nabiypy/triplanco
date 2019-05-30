import { Component, NgZone, OnInit } from '@angular/core';
import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { AuthProvider } from './provider/auth';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import * as firebase from 'firebase/app';
import { UsersProvider } from './provider/users';
import { AngularFireAuth } from 'angularfire2/auth';
import { NotificationsProvider } from './provider/notifications';
import { FCM } from '@ionic-native/fcm/ngx';
import { LanguageService } from './provider/language';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { NetworkProvider } from './provider/network';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  public displayName;
  public photoURL;
  public notifyme;
  public userId;
  public pages;


  // pages list at sidemenu


  notifications;


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userProvider: UsersProvider,
    public fcm: FCM,
    public newtworkProvider: NetworkProvider,
    public socialSharing: SocialSharing,
    private router: Router,
    private appRate: AppRate,
    private languageService: LanguageService,
    public notificationsProvider: NotificationsProvider,
    public afAuth: AngularFireAuth,
    public ngZone: NgZone,
    public events: Events,
    public translate: TranslateService,
    private spinnerDialog: SpinnerDialog,
    public authProvider: AuthProvider,
  ) {
    this.initializeApp();
    this.PushNotification();
    this.pages = [
      {
        title: this.translate.instant('MENU.messages'),
        url: '/home',
        icon: 'cloud'
      },
      // {
      //   title: this.translate.instant('MENU.dashboard'),
      //   url: '/dashboard',
      //   icon: 'partly-sunny'
      // },
      {
        title: this.translate.instant('MENU.profile'),
        url: '/profile',
        icon: 'person'
      },
      // {
      //   title: this.translate.instant('MENU.friends'),
      //   url: '/contacts',
      //   icon: 'people'
      // },
      // {
      //   title: this.translate.instant('MENU.groups'),
      //   url: '/group',
      //   icon: 'people'
      // },
      {
        title: this.translate.instant('MENU.notifications'),
        url: '/notifications',
        icon: 'notifications'
      },
      // {
      //   title: this.translate.instant('MENU.request'),
      //   url: '/request',
      //   icon: 'settings'
      // },
      // {
      //   title: this.translate.instant('MENU.blocklist'),
      //   url: '/blocklist',
      //   icon: 'people'
      // },
      {
        title: this.translate.instant('MENU.aboutus'),
        url: '/about-us',
        icon: 'people'
      },

      {
        title: this.translate.instant('MENU.privacy'),
        url: '/privacy',
        icon: 'unlock'
      }

    ];

  }

  // initialise splashscreen, statusbar, userdetails, and status
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.checkUserState();
      // this.newtworkProvider.runFunction();
      this.notification();
      this.languageService.setInitialAppLanguage();
      // get notification token
    });
  }

  PushNotification() {
    this.platform.ready().then(() => {
      this.fcm.getToken().then(token => {
        console.log(token);
      });
      // refresh token
      this.fcm.onTokenRefresh().subscribe(token => {
        console.log(token);
      });
      // receive notification
      this.fcm.onNotification().subscribe(data => {
        console.log(data);
        if (data.wasTapped) {
          console.log(JSON.stringify(data));
          // this.vibration.vibrate(500);
        } else {
          console.log('Received in foreground');
        }
      });
    });
  }
  // get notification count
  notification() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.notificationsProvider.getMyNotificationsUnread();
        this.events.subscribe('Notifications', () => {
          this.ngZone.run(() => {
            const res = this.notificationsProvider.NotificationsUnread;
            this.notifications = res.length;
          });
        });
      }
    });
  }

  // navigate to pages through router
  ngOnInit() {
    this.PushNotification();
    this.setUserData();
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.pages.map(p => {
          return p['active'] = (event.url === p.url);
        });
      }
    });
  }

  // share app
  shareApp() {
    // Common sharing event will open all available application to share
    this.socialSharing.share('Download ChatMe', 'A geolocation chat application')
      .then((entries) => {
        console.log('success ' + JSON.stringify(entries));
      })
      .catch((error) => {
        alert('error ' + JSON.stringify(error));
      });
  }

  // App rating
  showRatePrompt() {
    if (this.platform.is('cordova')) {
      this.appRate.preferences.storeAppURL = {
        android: 'market://details?id=io.ionicchatmeforionic.starter'
      };
      this.appRate.promptForRating(true);
    }
  }

  // check user status, if user login, status online and navigate home
  // when user logout the status offline and navigate to welcome page
  checkUserState() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        console.log('user is logged in');
        this.authProvider.offlineStatus();
        this.authProvider.onlineStatus();
        this.router.navigateByUrl('home');
        this.authProvider.isLoggedIn = true;
      } else {
        console.log('user not logged in');
        this.router.navigateByUrl('welcome');
      }
    });
  }

  // get user details
  setUserData() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) { this.userId = user.uid; }
      console.log('UID: ' + this.userId);
      const ref = firebase.database().ref('/users').child(this.userId);
      ref.once('value').then(snapshot => {
        this.displayName = snapshot.val().Name;
        this.photoURL = snapshot.val().Photo;
        this.notifyme = snapshot.val().notifications;
      }, error => {
        console.error(error);
      });

    });
  }

  // user logout and navigate to welcome page
  async logOut() {
    this.spinnerDialog.show('ChatMe', 'Logout..', false);
    this.authProvider.offlineStatuss().then(() => {
      this.authProvider.logOut().then(() => {
        window.localStorage.clear();
        this.spinnerDialog.hide();
        this.router.navigateByUrl('login');
        this.authProvider.isLoggedIn = false;
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

}
