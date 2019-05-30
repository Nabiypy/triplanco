import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProvider } from '../provider/auth';
import { FriendsProvider } from '../provider/friends';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { RequestProvider } from '../provider/request';
import { UsersProvider } from '../provider/users';
import { NotificationsProvider } from '../provider/notifications';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { BlockProvider } from '../provider/block';
import { ChatProvider } from '../provider/chat';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { TranslateService } from '@ngx-translate/core';

declare var window: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {

	public Friends = [];
  public userId: string;
  public segment: number;
	public toast: any;
	public user: any;
	
  constructor(public afDB: AngularFireDatabase, 
    public alertCtrl: AlertController, 
    public requestProvider: RequestProvider, 
    public blockProvider: BlockProvider, 
    public chatProvider: ChatProvider, 
    public translate: TranslateService,
    public toastCtrl: ToastController, 
    public spinnerDialog: SpinnerDialog, 
    public notificationProvider: NotificationsProvider, 
    public userProvider: UsersProvider, 
    public modalCtrl: ModalController, 
    public router: Router, 
    public route: ActivatedRoute, 
    public authProvider: AuthProvider, 
    public friendsProvider: FriendsProvider
    ) { 

    this.segment = 0;
  }
  
  // get segment index number
  public async setSegment(activeIndex: Promise<number>) {
   this.segment = await activeIndex;
  }

  ngOnInit() {
		this.getAllUserFriends()
	  // get user details with user id
    this.userId  = this.route.snapshot.paramMap.get('id');
		this.userProvider.getUser(this.userId).valueChanges().subscribe((user) => {
      this.user = user;
		});
	  // Get friends of current logged in user.
 /*   this.userProvider.getUser(firebase.auth().currentUser.uid).valueChanges().subscribe((user: any) => {
      this.friends = user.friends;
		});*/
  }

  // Get the all the friends that belong to a user with id
	getAllUserFriends() {
    this.userId  = this.route.snapshot.paramMap.get('id');
		this.afDB.database.ref('users').on('value', snap => {
			var res = snap.val()
			let userDetails = []
			for (var i in res) {
				userDetails.push(res[i])
			}
			this.afDB.database.ref('Friends').child(this.userId).on('value', snap => {
				this.Friends = []
				var res = snap.val()
				let array = []
				for (var i in res) {
					array.push(res[i])
				}
				for(var ia in userDetails) {
					for (var ii in array) {
						if (userDetails[ia].Id === array[ii].Id) {
							this.Friends.push(userDetails[ia])
						}
					}
				}
			})
		})    
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

  // Unfriend user alert function
  // user can unfriend the user or cancel
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

// Block user alert function
async Blockuser(userDetails){
  const confirm = await this.alertCtrl.create({
    header: userDetails.Name,
     message: this.translate.instant('ALERT.block') + '' + userDetails.Name,
    buttons: [
      {
        text: this.translate.instant('ALERT.cancel'),
        handler: () => {
          console.log('cancel')
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
  			this.friendsProvider.getAllFriends().then((res: any) => {
  				this.Friends = res
  			}).then(() => {
  				this.spinnerDialog.hide()
					this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenunfriend'))
					window.localStorage.clear()
					this.router.navigateByUrl('home')
				})
  	})
  }

  // Block user function
  block(userDetails) {
  	this.spinnerDialog.show(this.translate.instant('ALERT.block'), this.translate.instant('ALERT.blocking'), false);
  	this.blockProvider.blockUser(userDetails).then(() => {
  			this.friendsProvider.getAllFriends().then((res: any) => {
  				this.Friends = res
  			}).then(() => {
          this.spinnerDialog.hide()
          // show toast after block
					this.showToast(userDetails.Name + this.translate.instant('ALERT.hasbeenblocked'))
					this.router.navigateByUrl('home')
				})
  	})
  }

  async goChat(friend){
    // initialize friend details and proceesd to chat page
     this.chatProvider.initializebuddy(friend)
     this.router.navigateByUrl('chat');
     }

     // View user image in large form in modal page 
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
