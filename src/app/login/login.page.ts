import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController, Platform } from '@ionic/angular';
import { AuthProvider } from '../provider/auth';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { TranslateService } from '@ngx-translate/core';

declare var window: any;

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

	form: any;
	userDetails: any;
	public toast;
	errorLoginMessage: any;
	disableLogin = false;
	errorMessage: any;
	buttonText: any = 'Login';
	phone_model = 'iPhone';
	userProfile: any = null;

	constructor(public toastController: ToastController,
		private router: Router, public alertController: AlertController,
		public translate: TranslateService,
		public afDB: AngularFireDatabase, private platform: Platform,
		public facebook: Facebook, private spinnerDialog: SpinnerDialog,
		public loadingCtrl: LoadingController, public authProvider: AuthProvider,
		public modalCtrl: ModalController) {

		this.form = {};

	}

	ngOnInit() {
		console.log('ngOnInit LoginPage');
	}

	// Login function
	signin() {
		if (this.validateRegister(this.form)) {
			this.spinnerDialog.show('Triplanco', this.translate.instant('ALERT.logging'), false);
			this.disableLogin = true;
			this.buttonText = 'Login...';
			this.userDetails = {
				Email: this.form.Email,
				Password: this.form.Password,
			};

			this.authProvider.login(this.userDetails).then(() => {
				this.spinnerDialog.hide();
				this.router.navigateByUrl('home');
				this.authProvider.onlineStatus();
				this.authProvider.isLoggedIn = true;
				this.showToast(this.translate.instant('ALERT.welcomeback'));
				window.localStorage.setItem('userstate', 'logedIn');
				window.localStorage.setItem('userid', this.authProvider.afAuth.auth.currentUser.uid);
				// 	});
				this.disableLogin = false;
				this.buttonText = 'Register Account';
			}).catch(err => { this.handleLoginError(err); });
		}
	}

	// signInAsGuest() {
	// 	this.authProvider.loginAsGuest().then((guest) => {
	// 		console.log('Anonymous user response', guest);
	// 		this.router.navigateByUrl('home');
	// 		this.authProvider.onlineStatus();
	// 		this.authProvider.isLoggedIn = true;
	// 		window.localStorage.setItem('userstate', 'logedIn');
	// 		window.localStorage.setItem('userid', this.authProvider.afAuth.auth.currentUser.uid);
	// 	}).catch(error => {
	// 		this.handleLoginError(error);
	// 	});
	// }

	// Handling login error
	handleLoginError(err) {
		console.log(err.code);
		this.errorLoginMessage = err.message;
		this.disableLogin = false;
		this.buttonText = 'Login';
	}

	// Validation of the user details input
	validateRegister(form) {
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

	// Toast shown when user login
	showToast(message) {
		this.toast = this.toastController.create({
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

	// proceed to register page
	goRegister() {
		this.router.navigateByUrl('signup');
	}

	// proceed to forgot password page
	goForgotPassword() {
		this.router.navigateByUrl('forgot-password');
	}

	// facebook login
	facebookLogin(): void {
		const permissions = ['public_profile', 'email'];
		this.facebook.login(permissions).then((response) => {
			const facebookCredential = firebase.auth.FacebookAuthProvider
				.credential(response.authResponse.accessToken);
			firebase.auth().signInWithCredential(facebookCredential)
				.then((success) => {
					console.log('Firebase success: ' + JSON.stringify(success));
					this.userProfile = success;
					// since the user have login once with facebook, update the user profile
					this.afDB.database.ref('users').child(this.userProfile.uid).update({
						Name: this.userProfile.displayName,
						Email: this.userProfile.email,
						Photo: this.userProfile.photoURL
					}).then(() => {
						this.router.navigateByUrl('home');
						this.authProvider.isLoggedIn = true;
						this.showToast(this.translate.instant('ALERT.welcomeback'));
					});
				}).catch((error) => {
					console.log('Firebase failure: ' + JSON.stringify(error));
				});

		}).catch((error) => { console.log(error); });

	}

}
