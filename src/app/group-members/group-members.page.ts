import { Component, NgZone, OnInit } from '@angular/core';
import { Events, Platform, AlertController, ToastController, ModalController } from '@ionic/angular';
import { GroupProvider } from '../provider/group';
import * as firebase from "firebase/app";
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.page.html',
  styleUrls: ['./group-members.page.scss'],
})
export class GroupMembersPage implements OnInit {

	public GroupMembers = []
	public groupDetails
  userId;
  loadedGroupMembersList;
  nouser;

  constructor(private platform: Platform, public ngZone : NgZone, 
    public events: Events, public toastCtrl: ToastController,
    public translate: TranslateService, 
    public modalCtrl: ModalController, 
    public groupProvider: GroupProvider, 
    public alertCtrl: AlertController, 
    public spinnerDialog: SpinnerDialog
    ) {

  }

  ngOnInit() {
    // get group members
    this.groupDetails = this.groupProvider.groupDetails
    this.events.subscribe('GroupMembers', () => {
      this.ngZone.run(() => {
        this.GroupMembers = this.groupProvider.groupMembers
        this.loadedGroupMembersList = this.GroupMembers
      })
    })    

    // show wheather user login or not
    firebase.auth().onAuthStateChanged( user => {
      if (user) { this.userId = user.uid }
     console.log("UID: "+ this.userId);
    })
  }

  // initialize function use in filter
initializeItems(){
  this.GroupMembers = this.loadedGroupMembersList;
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
    this.GroupMembers = this.GroupMembers.filter((v) => {
      if(v.Name && q) {
        if (v.Name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
        
      }
    });

    console.log(q, this.GroupMembers.length);
    if(this.GroupMembers.length === 0){
      this.nouser = true;
    }else{
      this.nouser = false;
    }
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









