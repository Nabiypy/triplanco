import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ToastController, Platform, AlertController, LoadingController} from '@ionic/angular';
import {Facebook} from '@ionic-native/facebook/ngx';
import * as firebase from 'firebase/app';
import {AuthProvider} from '../provider/auth';
import {AngularFireDatabase} from 'angularfire2/database';
import {ChatProvider} from '../provider/chat';
import {GeoFire} from 'geofire';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import {ConstantPool} from '@angular/compiler';

declare var window: any;

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.page.html',
    styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

    phone_model = 'iPhone';
    toast;
    userProfile: any = null;
    geoRef = firebase.database().ref('geo/');
    lat: any;
    long: any;

    slideOpts = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true
    };

    slideIndex = 0;

    // Slider Data
    slides = [
        {
            text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients.',
            imageUrl: 'assets/imgs/background/deals1.png',
            url: '/deals'
        },
        {
            text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients.',
            imageUrl: 'assets/imgs/background/deals2.png',
            url: '/deals'
        },
        {
            text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients.',
            imageUrl: 'assets/imgs/background/deals3.png',
            url: '/deals'
        },
        {
            text: 'Find the best deals of Flights, Hotels, Cars, Cruise and Activities.',
            imageUrl: 'assets/imgs/background/deals4.png',
            url: '/recomended'
        },
        {
            text: 'Swipe Menus to left or right for user friendly, easy to use and smooth travel booking experience.',
            imageUrl: 'assets/imgs/background/deals4.png',
            url: '/recomended'
        }
    ];

    constructor(
        public router: Router,
        public toastCtrl: ToastController,
        public platform: Platform,
        public afDB: AngularFireDatabase,
        public chatProvider: ChatProvider,
        public translate: TranslateService,
        public facebook: Facebook,
        public authProvider: AuthProvider,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public storage: Storage
    ) {
    }

    ionViewDidLoad() {
        console.log(`current view ===> Welcome Page`);
        this.storage.set('tutorialComplete', true);
    }

    ngOnInit() {
    }

    // Proceed to Login page.
    goLogin() {
        this.router.navigateByUrl('login');
    }

    // Proceed to Register page.
    goRegister() {
        this.router.navigateByUrl('signup');
    }

    // this toast shows when the user is successfully signup
    showToast(message) {
        this.toast = this.toastCtrl.create({
            message,
            position: 'bottom',
            duration: 4000,
            animated: true,
            cssClass: 'my-custom-class'
        }).then((toastData) => {
            console.log(toastData);
            toastData.present();
        });
    }

    // login with facebook and setup profile
    // when user click facebook login, the user details from facebook are setup in user firebase account
    // the geolocattion of the user is also setup
    // then navigate to homepage
    facebookLogin(): void {
        const permissions = ['public_profile', 'email'];
        this.facebook.login(permissions).then((response) => {
            const facebookCredential = firebase.auth.FacebookAuthProvider
                .credential(response.authResponse.accessToken);
            firebase.auth().signInWithCredential(facebookCredential)
                .then((success) => {
                    console.log('Firebase success: ' + JSON.stringify(success));
                    this.userProfile = success;
                    this.afDB.database.ref('users').child(this.userProfile.uid).set({
                        Name: this.userProfile.displayName,
                        Email: this.userProfile.email,
                        Id: this.userProfile.uid,
                        Status: 'Offline',
                        about: 'Hey there! I\'m using Triplanco mobile app.',
                        Cover: 'assets/imgs/cover.png',
                        notifications: true,
                        sound: true,
                        distance: '',
                        Photo: this.userProfile.photoURL
                    }).then(() => {
                        this.chatProvider.getLocation().then((data) => {
                            console.log('locationServices');
                            const geoFire = new GeoFire(this.geoRef);
                            const geoRef = geoFire.ref;
                            geoFire.set(this.userProfile.uid, [data.coords.latitude, data.coords.longitude]).then(() => {
                                this.router.navigateByUrl('home');
                                this.authProvider.isLoggedIn = true;
                                this.showToast(this.translate.instant('ALERT.welcometochatme'));
                            });
                        });
                    });
                }).catch((error) => {
                console.log('Firebase failure: ' + JSON.stringify(error));
            });

        }).catch((error) => {
            console.log(error);
        });
    }

    signInAsGuest() {
        this.authProvider.loginAsGuest().then((guest) => {
            console.log('Anonymous user response', guest);
            this.router.navigateByUrl('home');
            this.authProvider.onlineStatus();
            this.authProvider.isLoggedIn = true;
            window.localStorage.setItem('userstate', 'logedIn');
            window.localStorage.setItem('userid', this.authProvider.afAuth.auth.currentUser.uid);
        }).catch(error => {
            console.log('error sign as a guest ==>' + JSON.stringify(error));
        });
    }

}
