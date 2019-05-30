import { Component, OnInit } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { RequestProvider } from '../provider/request';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { TranslateService } from '@ngx-translate/core';

declare var window: any;

@Component({
  selector: 'app-request',
  templateUrl: './request.page.html',
  styleUrls: ['./request.page.scss'],
})

export class RequestPage implements OnInit {
	sentRequests = [];
	receivedRequests = [];
  toast: any;

  constructor(
    private platform: Platform,
    private spinnerDialog: SpinnerDialog,
    public requestProvider: RequestProvider,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public toastCtrl: ToastController
    ) {
  }

  ngOnInit() {
    console.log('RequestPage');
  }

  ionViewWillEnter() {
    // Get received request from friend for a user
  	this.requestProvider.getReceivedRequests().then((res: any) => {
  		this.receivedRequests = res;
  	});
   // Get Sent request to friend for a user
  	this.requestProvider.getSentRequests().then((res: any) => {
  		this.sentRequests = res;
  	});
  }

 // show toast function
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

// Delete sent request when the user has not accept the request
  deleteSentRequest(userDetails) {
    this.spinnerDialog.show(this.translate.instant('ALERT.cancelrequest'), this.translate.instant('ALERT.cancellingrequest'), false);
    this.requestProvider.deleteSentRequest(userDetails).then(() => {
      if (this.sentRequests.length > 1) {
        this.requestProvider.getSentRequests().then((res: any) => {
          this.sentRequests = res;
          this.spinnerDialog.hide();
          this.showToast(this.translate.instant('ALERT.requestto') + userDetails.Name + this.translate.instant('ALERT.hasbeencancelled'));
        }).catch((err) => {
          this.spinnerDialog.hide();
          this.showToast(err);
        });
      } else {
        this.sentRequests = [];
        this.spinnerDialog.hide();
        if (this.receivedRequests.length < 1) {
        }
        this.showToast(this.translate.instant('ALERT.requestto') + userDetails.Name + this.translate.instant('ALERT.hasbeencancelled'));
      }

    }).catch((err) => {
      this.spinnerDialog.hide();
      this.showToast(err);
    });
  }

  // Cancel or delete received request from a user
  deleteReceivedRequest(userDetails) {
    this.spinnerDialog.show(this.translate.instant('ALERT.cancelrequest'), this.translate.instant('ALERT.cancellingrequest'), false);
    this.requestProvider.deleteReceivedRequest(userDetails).then(() => {
      if (this.sentRequests.length > 1) {
        this.requestProvider.getReceivedRequests().then((res: any) => {
          this.receivedRequests = res;
          this.spinnerDialog.hide();
          this.showToast(this.translate.instant('ALERT.requestfrom') + userDetails.Name + this.translate.instant('ALERT.hasbeendeleted'))
        }).catch((err) => {
          this.spinnerDialog.hide();
          this.showToast(err);
        });
      } else {
        this.receivedRequests = [];

        if (this.sentRequests.length < 1) {
        }
        this.spinnerDialog.hide();
        this.showToast(this.translate.instant('ALERT.requestfrom') + userDetails.Name + this.translate.instant('ALERT.hasbeendeleted'));
      }

    }).catch((err) => {
      this.spinnerDialog.hide();
      this.showToast(err);
    });

  }

  // Accept request from a user
  acceptRequest(userDetails) {
    this.spinnerDialog.show(this.translate.instant('ALERT.acceptrequest'), this.translate.instant('ALERT.acceptingrequest'), false);
    this.requestProvider.acceptRquest(userDetails).then(() => {
      if (this.sentRequests.length > 1) {
        this.requestProvider.getReceivedRequests().then((res: any) => {
          this.receivedRequests = res;
          this.spinnerDialog.hide();
          this.showToast(this.translate.instant('ALERT.youand') + userDetails.Name + this.translate.instant('ALERT.arenowfriend'))
        }).catch((err) => {
          this.spinnerDialog.hide();
          this.showToast(err);
        });
      } else {
        this.receivedRequests = [];

        if (this.sentRequests.length < 1) {

        }
        this.spinnerDialog.hide();
        this.showToast(this.translate.instant('ALERT.youand') + userDetails.Name + this.translate.instant('ALERT.arenowfriend'));
      }

    }).catch((err) => {
      this.spinnerDialog.hide();
      this.showToast(err);
    });
  }

}
