import { Component, OnInit } from '@angular/core';
import { BlockProvider } from '../provider/block';
import { AlertController, ToastController } from '@ionic/angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-blocklist',
  templateUrl: './blocklist.page.html',
  styleUrls: ['./blocklist.page.scss'],
})
export class BlocklistPage implements OnInit {

public blockList = [];
public toast;
 
constructor(
  public alertCtrl: AlertController, 
  public blockProvider: BlockProvider, 
  public toastCtrl: ToastController, 
  public spinnerDialog: SpinnerDialog, 
  public translate: TranslateService
  ) {
}

ngOnInit() {}
  
// get list of block user that are blocked by the current user
ionViewWillEnter() {
  this.blockProvider.getBlockList().then((res: any) => {
  	this.blockList = res
  }).catch((err) => {
  	console.log(err)
  })
}

// this is alert function that prompt when user click unblock button
// the current user can either unblock the user or ignore by cancel
async showBlockConfirmation(userDetails){
  const confirm = await this.alertCtrl.create({
    header: userDetails.Name,
    message: this.translate.instant('ALERT.unblock') + userDetails.Name + this.translate.instant('ALERT.forchating'),
    buttons: [
       {
        text: this.translate.instant('ALERT.cancel'),
        cssClass: 'half-alert-button',
        handler: () => {
          console.log('Cancel')
        }
      },
        {
        text: this.translate.instant('ALERT.unblock'),
        cssClass: 'half-alert-button',
        handler: () => {
          this.unBlock(userDetails)
        }
      }
    ]
  });
    confirm.present();
}

// Toast shown when user login
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

// this is the function to unblock user
unBlock(userDetails) {
  this.spinnerDialog.show(this.translate.instant('ALERT.unblock'), this.translate.instant('ALERT.unblocking') + userDetails.Name + ' ...', false);
  this.blockProvider.unBlock(userDetails).then(() => {
  	if (this.blockList.length > 1) {
  		this.blockProvider.getBlockList().then((res: any) => {
  			this.blockList = res
  		}).then(() => {
        this.spinnerDialog.hide();
  			this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenunblock'))
  		}).catch((err) => {
  			this.spinnerDialog.hide();
  			this.showToast(err)
  		})
  	} else {
  		  this.spinnerDialog.hide();
  			this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenunblock'))
  	}
  }).catch((err) => {
  		 this.spinnerDialog.hide();
  		 this.showToast(err)
    })  	
  }
}