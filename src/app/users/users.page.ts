import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { UsersProvider } from '../provider/users';
import { RequestProvider } from '../provider/request';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

public users = [];
public loadedUserList: any;
public nouser;
phone_model = 'iPhone';
public toast;

  constructor(
    public usersProvider: UsersProvider,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public translate: TranslateService,
    public requestProvider: RequestProvider,
    public spinnerDialog: SpinnerDialog,
    public modalCtrl: ModalController
    ) {

  }

  // Get all users
  ngOnInit() {
    this.usersProvider.getAllUsers().then((res: any) => {
      this.users = res;
      this.loadedUserList = res;
  	}).catch((err) => {
  		console.log(err);
  	});
  }

 // initialize loadeduserlist with list of users
  initializeItems() {
    this.users = this.loadedUserList;
    console.log('reset');
  }

  // Search for user with name
  getUser(searchbar) {
    // Reset users back to all of the users
    this.initializeItems();
    // set q to the value of the searchbar
    const q = searchbar.srcElement.value;
    // if the value is an empty string don't filter the users
    if (!q) {
      return;
    }

    this.users = this.users.filter((v) => {
      if (v.Name && q) {
        if (v.Name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });

    console.log(q, this.users.length);
    // if the length of user is equal zero return false
    if (this.users.length === 0) {
      this.nouser = true;
    } else {
      this.nouser = false;
    }
  }

  // show toast when friend request is sent
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


 // send friend request to the user
  async sendRequest(userDetails) {
    const confirm = await this.alertCtrl.create({
      header: this.translate.instant('ALERT.sendrequest'),
      message: this.translate.instant('ALERT.therequestwillbesendto') + userDetails.Name,
      buttons: [
        {
          text: this.translate.instant('ALERT.cancel'),
          handler: () => {
           console.log('cancel');
          }
        },
        {
          text: this.translate.instant('ALERT.send'),
          handler: () => {
            this.send(userDetails);
          }
        }
      ]
    });
    confirm.present();
  }

 // send friend request to the user
  async send(userDetails) {
    this.spinnerDialog.show(this.translate.instant('ALERT.request'), this.translate.instant('ALERT.sending'), false);
  	this.requestProvider.makeRequest(userDetails).then(() => {
  		if (this.users.length > 1) {
  			this.usersProvider.getAllUsers().then((res: any) => {
  				this.users = res;
  				this.spinnerDialog.hide();
  				this.showToast(this.translate.instant('ALERT.requesthasbeensento') + userDetails.Name);
  			}).catch((err) => {
  				this.spinnerDialog.hide();
  				this.showToast(err);
  			});
  		} else {
  			this.spinnerDialog.hide();
  			this.showToast(this.translate.instant('ALERT.requesthasbeensento') + userDetails.Name);
  		}
  	}).catch((err) => {
  		this.spinnerDialog.hide();
  		this.showToast(err);
    });

  }

  // view user image in large form at modal page
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


  }


