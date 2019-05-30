import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { BlockProvider } from '../provider/block';
import { FriendsProvider } from '../provider/friends';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Router } from '@angular/router';
import { ChatProvider } from '../provider/chat';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

	public Friends = []
  public toast: any;
  public loadedFreiendList: any;
  public nouser;

  constructor(public blockProvider: BlockProvider,
    private spinnerDialog: SpinnerDialog, 
    public modalCtrl: ModalController, 
    public translate: TranslateService, 
    public chatProvider: ChatProvider, 
    public router: Router, 
    public alertCtrl: AlertController, 
    public friendsProvider: FriendsProvider, 
    public toastCtrl: ToastController
    ) {
  }

  // ngOnInit fuction load all friends belonging to current user
  ngOnInit() {
    this.friendsProvider.getAllFriends().then((res: any) => {
      this.Friends = res
      this.loadedFreiendList = res;
  	}).catch((err) => {
  		console.log(err)
  	})
  }

  ionRefresh(event) {
    console.log('Pull Event Triggered!');
    setTimeout(() => {
      console.log('Async operation has ended');
      //complete()  signify that the refreshing has completed and to close the refresher
      event.target.complete();
      this.friendsProvider.getAllFriends().then((res: any) => {
        this.Friends = res
        this.loadedFreiendList = res;
      }).catch((err) => {
        console.log(err)
      })
    }, 10000);
}

ionPull(event){
  //Emitted while the user is pulling down the content and exposing the refresher.
  console.log('ionPull Event Triggered!');
}

ionStart(event){
  //Emitted when the user begins to start pulling down.
  console.log('ionStart Event Triggered!');
}


// initialize function use in filter
initializeItems(){
  this.Friends = this.loadedFreiendList;
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
    if(this.Friends.length === 0){
      this.nouser = true;
    }else{
      this.nouser = false;
    }
  }
  
 // ToastController function
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

 // ngOnInit function is refresh every 5 seconds
  ionViewDidEnter() {
    setInterval(()=> {
   this.ngOnInit(); },10000); 
}

// Unfriend user alertController
  async Unfrienduser(userDetails){
    const confirm = await this.alertCtrl.create({
      header: userDetails.Name,
      message: this.translate.instant('ALERT.unfriend') + '' + userDetails.Name,
      buttons: [
        {
          text: this.translate.instant('ALERT.cancel'),
          handler: () => {
           console.log('cancel')
          }
        },
        {
          text: this.translate.instant('ALERT.unfriend') + userDetails.Name,
          handler: () => {
            this.unfriend(userDetails)
          }
        }
      ]
    });
    await confirm.present();
  }

// Block user alertController
async Blockuser(userDetails){
  const confirm = await this.alertCtrl.create({
    header: userDetails.Name,
     message: this.translate.instant('ALERT.block') + '' + userDetails.Name,
    buttons: [
      {
        text: this.translate.instant('ALERT.cancel'),
        handler: () => {
          
        }
      },
      {
        text: this.translate.instant('ALERT.block') + userDetails.Name,
        handler: () => {
          this.block(userDetails)
        }
      }
    ]
  });
  await confirm.present();
}

  // Unfriend user function
  unfriend(userDetails) {
    this.spinnerDialog.show(this.translate.instant('ALERT.unfriend'), this.translate.instant('ALERT.unfriendling'), false);
  	this.friendsProvider.unFriend(userDetails).then(() => {
  		if (this.Friends.length > 1) {
  			this.friendsProvider.getAllFriends().then((res: any) => {
  				this.Friends = res
  			}).then(() => {
  				this.spinnerDialog.hide()
  				this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenunfriend'))
  			}).catch((err) => {
  				this.spinnerDialog.hide()
  				this.showToast(err)
  			})
  		} else {
  			this.spinnerDialog.hide()
  			this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenunfriend'))
  		}
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
  	})
  }


// Block friend function
  block(userDetails) {
  	this.spinnerDialog.show(this.translate.instant('ALERT.block'), this.translate.instant('ALERT.blocking'), false);
  	this.blockProvider.blockUser(userDetails).then(() => {
  		if (this.Friends.length > 1) {
  			this.friendsProvider.getAllFriends().then((res: any) => {
  				this.Friends = res
  			}).then(() => {
  				this.spinnerDialog.hide()
  				this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenblocked'))
  			}).catch((err) => {
  				this.spinnerDialog.hide()
  				this.showToast(err)
  			})
  		} else {
  			this.spinnerDialog.hide()
  			this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenblocked'))
  		}
  	}).catch((err) => {
  		this.spinnerDialog.hide()
  		this.showToast(err)
  	})
  }

  // procced to users list to find user
  findUser(){
    this.router.navigateByUrl('users');
  }

  // initialize friend detail and proceed to chat page
  goChat(friend){
  this.chatProvider.initializebuddy(friend)
  this.router.navigateByUrl('chat');
  }

  // View image in large form in modal page
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