import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Events, ActionSheetController, Platform, ToastController, IonContent, ModalController } from '@ionic/angular';
import { GroupProvider } from '../provider/group';
import * as firebase from "firebase/app";
import { Router } from '@angular/router';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { ChatProvider } from '../provider/chat';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { Camera, CameraOptions, PictureSourceType  } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.page.html',
  styleUrls: ['./group-chat.page.scss'],
})
export class GroupChatPage implements OnInit {

	groupDetails
	@ViewChild(IonContent) content: IonContent;
	allMessages = []
  allUsers = []
  userId;
  public newmessage; 
  phone_model = 'iPhone';
  location: any;
  captureDataUrl;
  GroupMembers = [];
  toggled: boolean = false;
  showEmojiPicker = false;

  constructor(
    public ngZone: NgZone, 
    public events: Events, 
    private platform: Platform, 
    public spinnerDialog: SpinnerDialog, 
    public camera: Camera, public router: Router, 
    public toastCtrl: ToastController, 
    public actionSheetCtrl: ActionSheetController,
    public translate: TranslateService,
    public groupProvider: GroupProvider, 
    public chatProvider: ChatProvider, 
    public modalCtrl: ModalController
    ) {

  }

  ngOnInit() {
    // get group details
    this.groupDetails = this.groupProvider.groupDetails
    this.events.subscribe('Messages', () => {
      this.ngZone.run(() => {
        this.allMessages = this.groupProvider.messages
        this.allUsers = this.groupProvider.users
      })
    })

    firebase.auth().onAuthStateChanged( user => {
      if (user) { this.userId = user.uid }
     console.log("UID: "+ this.userId);
    })
  }


  ionViewDidLeave(){
    this.events.subscribe('Messages')
  }

  
  ionViewDidEnter() {
    //
    this.events.subscribe('GroupMembers', () => {
      this.ngZone.run(() => {
        this.GroupMembers = this.groupProvider.groupMembers
      })
    })  

    this.groupProvider.getAllMessages()
    setTimeout(() => {
     this.content.scrollToBottom(300);
    }, 1000);

    setInterval(()=> {
   this.ngOnInit(); },3000); 
}


// Toast shown when group is creted
async showToast(message) {
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

  async showActionSheet() {
  	if (this.groupDetails.Owner == firebase.auth().currentUser.uid) {

	    const actionSheet = await this.actionSheetCtrl.create({
	      header: this.groupDetails.Name,
	      buttons: [
	        {
	          text: this.translate.instant('ALERT.groupmembers'),
	          icon:'contacts',
	          handler: () => {
	          	this.showMembers(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.addmembers'),
	          icon:'add',
	          handler: () => {
	          	this.addMember(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.groupinfo'),
	          icon:'alert',
	          handler: () => {
	          	this.groupInfo(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.deletegroup'),
	          icon:'trash',
	          handler: () => {
	          	this.deleteGroup(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.cancel'),
	          icon:'close',
	          handler: () => {
	            this.showToast('Cancel clicked');
	          }
	        }
	      ]
	    })
	    actionSheet.present()
  	} else {
	    const actionSheet = await this.actionSheetCtrl.create({
	      header: this.groupDetails.Name,
	      buttons: [
	        {
	          text: this.translate.instant('ALERT.groupmembers'),
	          icon:'contacts',
	          handler: () => {
	          	this.showMembers(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.groupinfo'),
	          icon:'alert',
	          handler: () => {
	          	this.groupInfo(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.leavegroup'),
	          icon:'log-out',
	          handler: () => {
	          	this.leaveGroup(this.groupDetails)
	          }
	        },{
	          text: this.translate.instant('ALERT.cancel'),
	          icon:'close',
	          handler: () => {
	            this.showToast('Cancel clicked');
	          }
	        }
	      ]
	    })
	    actionSheet.present()
  	}
  }


// leave group when current user is member
  leaveGroup(groupDetails){
  	this.spinnerDialog.show(this.translate.instant('ALERT.leavingroup'), this.translate.instant('ALERT.pleasewait'), false);
  	this.groupProvider.leaveGroup(groupDetails).then(() => {
  		this.spinnerDialog.hide()
  		this.showToast(this.translate.instant('ALERT.youhaveleftgroup'))
  		this.router.navigateByUrl('group')
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
  	})

  }

  // delete group if current user is Admin
  deleteGroup(groupDetails){
  	this.spinnerDialog.show(this.translate.instant('ALERT.deletingroup'), this.translate.instant('ALERT.pleasewait'), false);
  	this.groupProvider.deleteGroup(groupDetails).then(() => {
  		this.spinnerDialog.hide()
  		this.showToast(this.translate.instant('ALERT.grouphasbeendeleted'))
  		this.router.navigateByUrl('group')
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
  	})

  }


  showMembers(groupDetails){
    this.groupProvider.initialize(groupDetails)
     //this.router.navigate(['/chat', { friend: friend }]);
     this.router.navigateByUrl('group-members');
  }

  addMember(groupDetails){
    this.groupProvider.initialize(groupDetails)
     //this.router.navigate(['/chat', { friend: friend }]);
     this.router.navigateByUrl('add-group-member');
  }

  groupInfo(groupDetails){
    this.groupProvider.initialize(groupDetails);
    this.router.navigateByUrl('group-info');
  }

  logScrollStart(){
    console.log("logScrollStart : When Scroll Starts");
  }
  // start scrolling function
  logScrolling(){
    console.log("logScrolling : When Scrolling");
  }
 
  // if you want to scroll top from bottom use this function
  logScrollEnd(){
    console.log("logScrollEnd : When Scroll Ends");
  }
 
  // if you want to scroll bottom from top use this function
 
  ScrollToBottom(){
    setTimeout(() => {
       this.content.scrollToBottom(300);
   }, 1000);

  }

  // if you want to scroll top from bottom use this function
  ScrollToTop(){
    this.content.scrollToTop(1500);
  }
 
  ScrollToPoint(X,Y){
    this.content.scrollToPoint(X,Y,1500);
  }


 // add message when message type is text
  addmessage() {
    let type = 'text'
    //this.ScrollToBottom()
    let res = this.newmessage
    this.newmessage = '';
    this.groupProvider.sendMessage(res, this.groupDetails, type).then(() => {
      this.ScrollToBottom()
      this.newmessage = '';
    })
  }


  // When user click on attach button an actionSheet shows options - PhotoLibrary, Camera and Location
async attach(){
  const actionSheet = await this.actionSheetCtrl.create({
    header: this.translate.instant('ALERT.sendattachment'),
    cssClass: 'action-sheets-basic-page',
    buttons: [
      {
        text: this.translate.instant('ALERT.image'),
        icon: 'images',
        role: 'destructive',
        handler: () => {
          this.selectGalleryPhoto()
        }
      },{
        text: this.translate.instant('ALERT.camera'),
        icon: 'camera',
        handler: () => {
          this.CameraPhoto()
        }
      },
      {
        text: this.translate.instant('ALERT.location'),
        icon: 'pin',
        handler: () => {
          this.locationShare()
        }
      },
      {
        text: this.translate.instant('ALERT.cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('cancel')
        }
      }
    ]
  })
  actionSheet.present() 
}

// Location sharing function
locationShare(){
  let type = 'location'
  this.groupProvider.getLocation().then((data) => {  
    this.location = {lat: data.coords.latitude, long: data.coords.longitude}
    this.groupProvider.sendMessage(this.location, this.groupDetails, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
    })
  })
}

   
// get image through camera plugin with option to use camera only
// then the resulting data is converted to base64
// Then it is stored in firebase storage with unique current user id and then send to chat list
// message type is equal to cameraPhoto in this case
CameraPhoto() {
  const cameraOptions = {
    quality: 100,
    correctOrientation: true,
    cameraDirection: 1
  }
  this.camera.getPicture(cameraOptions).then((ImageData) => {
    this.captureDataUrl = 'data:image/jpeg;base64,' + ImageData
    let type = 'image'
    this.groupProvider.sendMessage(this.captureDataUrl, this.groupDetails, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
    }).catch((err) => {
      this.showToast(err)
    })
  }, (err) => {
    var error = JSON.stringify(err)
    this.showToast(error)
  })
}


// get image through camera plugin with option to use gallery only
// then the resulting data is converted to base64
// Then it is stored in firebase storage with unique current user id and then send to chat list
// message type is equal to cameraPhoto in this case
selectGalleryPhoto() {

  const cameraOptions = {
    quality : 50,
    sourceType : this.camera.PictureSourceType.PHOTOLIBRARY,
    encodingType: this.camera.EncodingType.PNG,
    destinationType: this.camera.DestinationType.DATA_URL
  }
  this.camera.getPicture(cameraOptions).then((ImageData) => {
    this.captureDataUrl = 'data:image/jpeg;base64,' + ImageData
    let type = 'image'
    this.groupProvider.sendMessage(this.captureDataUrl, this.groupDetails, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
    }).catch((err) => {
      this.showToast(err)
    })
  }, (err) => {
    var error = JSON.stringify(err)
    this.showToast(error)
  })
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



