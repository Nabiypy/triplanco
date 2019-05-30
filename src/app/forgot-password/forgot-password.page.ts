import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthProvider } from '../provider/auth';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

declare var window: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

	userDetails = {
		Email: ''
	}

	isenabled = false
  email = false
  phone_model = 'iPhone';
  toast: any;

  constructor(public authProvider: AuthProvider, 
    private spinnerDialog: SpinnerDialog, 
    public toastCtrl: ToastController, 
    public router: Router, 
    public translate: TranslateService
    ) {
  }

  ionViewWillEnter() {
  	this.userDetails.Email = ''
  }

  ngOnInit() { }

   // Toast shown when submit email for reset
   showToast(message) {
    this.toast = this.toastCtrl.create({
      message,
      position: 'bottom',
      duration: 4000,
      animated:true,
      cssClass:"my-custom-class"
    }).then((toastData)=>{
      console.log(toastData);
      toastData.present();
    });
  }

  forgrtPassword() {
    // spinnerdialog show up when user submit password for rest
     this.spinnerDialog.show("ChatMe", this.translate.instant('ALERT.sendingpasswordlink'), false);
	     this.authProvider.forgetPassword(this.userDetails).then(() => {
        //spinner hide 
        this.spinnerDialog.hide();
        this.userDetails.Email = '';
        // toast shown and navigate to login page
	     	this.showToast(this.translate.instant('ALERT.followemail'));
	   	this.router.navigateByUrl('login')
    	}).catch((err) => {  
    this.spinnerDialog.hide();
		var error = err.message
		this.showToast(error)
	})  	
  }

   // Email validation
	emailInput(value){
		if (this.userDetails.Email == '' || !this.userDetails.Email.match(/^[a-zA-Z0-9-_\.]+@[a-z]{2,}\.[a-z]{2,4}$/)) {
			this.email = false
			this.isenabled = false
		} else {
			this.email = true
			this.isenabled = true
		}	
	}
}