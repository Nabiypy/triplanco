import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, Platform, AlertController } from '@ionic/angular';
import { AuthProvider } from '../provider/auth';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { GeoFire } from 'geofire';
import { ChatProvider } from '../provider/chat';
import { TranslateService } from '@ngx-translate/core';



declare var window: any;

@Component({
	selector: 'app-signup',
	templateUrl: './signup.page.html',
	styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

	public userDetails: any;
	form: any;
	public errorMessage: any;
	public buttonText: any = 'Register Account';
	public toast;
	errorRegisterMessage: any;
	errorSigninMessage: any;
	disableRegister = false;
	phone_model = 'iPhone';
	userProfile: any = null;
	geoRef = firebase.database().ref('geo/');
	lat: any;
	long: any;

	constructor(
		private router: Router,
		public loadingCtrl: LoadingController,
		public facebook: Facebook,
		public afDB: AngularFireDatabase,
		public alertCtrl: AlertController,
		public translate: TranslateService,
		public platform: Platform,
		public afAuth: AngularFireAuth,
		public chatProvider: ChatProvider,
		private spinnerDialog: SpinnerDialog,
		public toastCtrl: ToastController,
		public authProvider: AuthProvider
	) {

		this.form = {};

	}

	ngOnInit() {
		console.log('RegisterPage');
	}

	// Register function, when user register, the details user enter are setup in user firebase account
	// Then navigate to homepage
	register() {
		if (this.validateRegister(this.form)) {
			this.spinnerDialog.show('Triplanco', this.translate.instant('ALERT.creatingprofile'), false);
			this.disableRegister = true;
			this.buttonText = 'Registering...';
			this.userDetails = {
				Name: this.form.Name,
				Email: this.form.Email,
				Mobile: this.form.Mobile,
				Password: this.form.Password
			};
			console.log(`Register user details ==> ${JSON.stringify(this.userDetails)}`);
			this.authProvider.register(this.userDetails).then(() => {
				this.spinnerDialog.hide();
				this.router.navigateByUrl('home');
				this.authProvider.isLoggedIn = true;
				this.showToast(this.translate.instant('ALERT.welcometochatme'));
				window.localStorage.setItem('userstate', 'logedIn');
				window.localStorage.setItem('userid', this.authProvider.afAuth.auth.currentUser.uid);
				this.disableRegister = false;
				this.buttonText = 'Register Account';
			}).catch(err => { this.handleRegisterError(err); });
		}
	}

	// Handling registration error
	handleRegisterError(err) {
		console.log('handling registration error ==> ', err.code);
		this.errorRegisterMessage = err.message;
		this.disableRegister = false;
		this.buttonText = 'Register Account';
	}

	// Validation of the user details input
	validateRegister(form) {
		if (this.form.Name === undefined || this.form.Name === '') {
			this.errorMessage = this.translate.instant('ALERT.entervalidname');
			return false;
		}
		if (this.form.Email === undefined || this.form.Email === '') {
			this.errorMessage = this.translate.instant('ALERT.entervalidemail');
			return false;
		}
		if (this.form.Password === undefined || this.form.Password === '') {
			this.errorMessage = this.translate.instant('ALERT.entervalidpassword');
			return false;
		}

		return true;
	}

	// Proceed to Login page.
	goLogin() {
		this.router.navigateByUrl('/login');
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
						about: 'Hey there! I\'m using Triplanco mobile app',
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

		}).catch((error) => { console.log(error); });
	}



}
