import { Component, OnInit, NgZone } from '@angular/core';
import { Events, AlertController, Platform, ToastController, ModalController } from '@ionic/angular';
import { GroupProvider } from '../provider/group';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Router } from '@angular/router';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-group-member',
  templateUrl: './add-group-member.page.html',
  styleUrls: ['./add-group-member.page.scss'],
})
export class AddGroupMemberPage implements OnInit {

  public groupDetails
  public Friends = [];
  public loadedFriendsList;
  public nouser;

  constructor(
    public ngZone : NgZone, 
    public events: Events, 
    public groupProvider: GroupProvider, 
    private platform: Platform, 
    public alertCtrl: AlertController, 
    public router: Router, 
    public translate: TranslateService,
    public toastCtrl: ToastController, 
    public spinnerDialog: SpinnerDialog, 
    public modalCtrl: ModalController
    ) {
  }

// get friend list
// Admin of the group can only add firends to the Group
ngOnInit(){
  this.groupDetails = this.groupProvider.groupDetails
  this.events.subscribe('AllFriends', () => {
    this.ngZone.run(() => {
      this.Friends = this.groupProvider.AllFriends
      this.loadedFriendsList = this.Friends
    })
  }) 

}

// initialize function use in filter
initializeItems(){
  this.Friends = this.loadedFriendsList;
  console.log('reset')  
}
  
// Searchbar function
getUser(searchbar) {
  // Reset items back to all of the items
  this.initializeItems();
  // set q to the value of the searchbar
  var q = searchbar.srcElement.value;
  // if the value is an empty string don't filter the items
  if (!q) {
    return;
  }
  this.Friends = this.Friends.filter((v) => {
    if(v.Name && q) {
      if (v.Name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
         return true;
      }
        return false;
      }
    });
    console.log(q, this.Friends.length);
  // if the filter Friends length is 0, it returns nouser
  if(this.Friends.length === 0){
    this.nouser = true;
    }else{
      this.nouser = false;
  }
}
  
// event subscribe to allfirends
ionViewDidLeave(){
  this.events.subscribe('AllFriends')
}

// get all friends details
ionViewDidEnter(){
  this.groupProvider.getAllFriends(this.groupDetails)
}

// Toast shown when friend is added to the group
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

// this function is only shown to the user that is admin
// when click, alert is prompt to add member or cancel
async showFriendsConfirmation(userDetails) {
  const confirm = await this.alertCtrl.create({
    header: userDetails.Name,
    message: this.translate.instant('ALERT.taponoption'),
    buttons: [
      {
        text: 'Cancel',
        handler: () => {
        //this.showToast('Cancel')
        }
        },
        {
          text: this.translate.instant('ALERT.add') + userDetails.Name + this.translate.instant('ALERT.togroup'), 
          handler: () => {
          	this.addMember(userDetails, this.groupDetails)
          }
        }
      ]
    });
  confirm.present();
}

// Add user to the group, only show this function for the Admin
addMember(userDetails, groupDetails){
  this.spinnerDialog.show(this.translate.instant('ALERT.addtogroup'), this.translate.instant('ALERT.adding') + userDetails.Name + this.translate.instant('ALERT.togroup'), false);
  this.groupProvider.addMember(userDetails, groupDetails).then(() => {
  	this.spinnerDialog.hide()
  	this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenaddedtogroup'))
  }).catch((err) => {
  	this.spinnerDialog.hide()
  	this.showToast(err)
  })
}

//View image in large form and information in Modal page
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
