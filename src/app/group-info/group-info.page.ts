import { Component, OnInit, NgZone } from '@angular/core';
import { GroupProvider } from '../provider/group';
import { Events, AlertController, ToastController, ModalController } from '@ionic/angular';
import * as firebase from "firebase/app";
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Router } from '@angular/router';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-group-info',
  templateUrl: './group-info.page.html',
  styleUrls: ['./group-info.page.scss'],
})
export class GroupInfoPage implements OnInit {

  groupDetails: any;
  GroupMembers = [];
  userId;

  constructor(
    public groupProvider: GroupProvider,  
    public ngZone : NgZone, 
    public alertCtrl: AlertController, 
    public modalCtrl: ModalController, 
    public events: Events, 
    public spinnerDialog: SpinnerDialog, 
    public toastCtrl: ToastController, 
    public router: Router, 
    public translate: TranslateService
    ) { }

 
  ngOnInit() {
    // get group members
    this.groupDetails = this.groupProvider.groupDetails
    this.events.subscribe('GroupMembers', () => {
      this.ngZone.run(() => {
        this.GroupMembers = this.groupProvider.groupMembers
      })
    })    

     // show wheather user login or not
     firebase.auth().onAuthStateChanged( user => {
      if (user) { this.userId = user.uid }
     console.log("UID: "+ this.userId);
    })
  }

  ionViewDidLeave(){
    this.events.subscribe('GroupMembers')
  }

  ionViewDidEnter(){
    this.groupProvider.getGroupMembers(this.groupDetails)
  }

  // alertcontroller is shown when group admin decide to delete member or not
  async showMemberConfirmation(userDetails){
  	if (this.groupDetails.Owner = this.userId) {
  		if (this.groupDetails.Owner == userDetails.Id) {
        console.log('You are the admin')
        this.showToast(this.translate.instant('ALERT.youareadmin'))
  		} else {
		    const confirm = await this.alertCtrl.create({
		      header: userDetails.Name,
		      message: this.translate.instant('ALERT.taponoption'),
		      buttons: [
		        {
		          text: this.translate.instant('ALERT.cancel'),
		          handler: () => {
                console.log('cancel')
		          }
		        },
		        {
		        	text: this.translate.instant('ALERT.delete') + userDetails.Name + this.translate.instant('ALERT.fromgroup'),
		        	handler: () => {
		        		this.deleteMember(userDetails, this.groupDetails)
		        	}
		        },
		      ]
		    })
		    confirm.present()
  		}
  	} else {
  		console.log('You are not admin')
  	}
  }

 // delete member function
  deleteMember(userDetails, groupDetails) {
  	this.spinnerDialog.show(this.translate.instant('ALERT.deletemember'), this.translate.instant('ALERT.deleting'), false);
  	this.groupProvider.deleteMember(userDetails, groupDetails).then(() => {
  	  this.spinnerDialog.hide()
  		this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeendeleted'))
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
    }) 
  }
    
    // Toast shown when user is deleted
  showToast(message) {
    const toast = this.toastCtrl.create({
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

  // Unfriend user alertController
  async leavegroup(){
    const confirm = await this.alertCtrl.create({
      header: this.translate.instant('ALERT.sureleavegroup'),
      buttons: [
        {
          text: this.translate.instant('ALERT.cancel'),
          handler: () => {
           console.log('cancel')
          }
        },
        {
          text: this.translate.instant('ALERT.leavegroup'),
          handler: () => {
            this.leaveGroup(this.groupDetails)
          }
        }
      ]
    });
    await confirm.present();
  }

// when user decided to leave the group
  leaveGroup(groupDetails){
  	this.spinnerDialog.show(this.translate.instant('ALERT.leavinggroup'), this.translate.instant('ALERT.pleasewait'), false);
  	this.groupProvider.leaveGroup(groupDetails).then(() => {
  		this.spinnerDialog.hide()
  		this.showToast(this.translate.instant('ALERT. youhaveleftgroup'),)
  		this.router.navigateByUrl('group')
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
  	})

  }

 // view or zoom image in modal page
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
