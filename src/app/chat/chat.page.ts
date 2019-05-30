import { Component, OnInit, ViewChild, NgZone} from '@angular/core';
import { IonContent, ModalController, Events, AlertController, ActionSheetController, 
  ToastController, Platform} from '@ionic/angular';
import * as firebase from "firebase/app";
import { ChatProvider } from '../provider/chat';
import { AuthProvider } from '../provider/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from "@ionic-native/file/ngx";
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { GifComponent } from '../component/gif/gif.component';
import { LocationComponent } from '../component/location/location.component';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { TranslateService } from '@ngx-translate/core';
import { EmojiPickerComponent } from '../component/emoji-picker/emoji-picker.component';
import { FilePath } from '@ionic-native/file-path/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { StreamingMedia, StreamingVideoOptions, StreamingAudioOptions } from '@ionic-native/streaming-media/ngx';
import { VideoEditor, CreateThumbnailOptions } from '@ionic-native/video-editor/ngx';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit{

@ViewChild(IonContent) content: IonContent;  
public friend: any;
public newmessage;  
public friendName: any;
public friendImage: any;
public friendStatus: any;
public friendTyping: any;
public friendLastSeen: any;
public friendAbout: any;
public allmessages = [];
public userId: any;
public myDetails ={}
public location: any;
public captureDataUrl;
public hideStatus: boolean = true;
public gifImage;
public emoji;
public user: any;
chatsList = firebase.database().ref('/Chat');
friendmessages = [];
public myBlob;
public uri: any;
fileName:any;

constructor(public activeRoute: ActivatedRoute, 
  public alertCtrl: AlertController, 
  public modalCtrl: ModalController,
  public router: Router, 
  private spinnerDialog: SpinnerDialog, 
  public chatProvider: ChatProvider, 
  public events: Events, 
  public platform: Platform, 
  public translate: TranslateService, 
  private nativeAudio: NativeAudio, 
  private streamingMedia: StreamingMedia, 
  private videoEditor: VideoEditor,
  public toastCtrl: ToastController, 
  public filePath: FilePath,
  private file: File, 
  public fileChooser: FileChooser,
  public mediaCapture: MediaCapture,
  public camera: Camera, 
  public zone: NgZone, 
  public authProvider: AuthProvider, 
  public actionSheetCtrl: ActionSheetController
    ) {
    this.friend = this.chatProvider.friend;  
  }

// ngOnInit shows the event to subscribe to allmessages between friend and Current User
// It also get Current user details and all friend chat
ngOnInit(){
  this.getChatlist()
  this.getbuddymessages()
  this.ScrollToBottom();
  this.getFriendInfo()
    // get current user details
    this.events.subscribe('myDetails', () => {
      this.zone.run(() => {
        this.myDetails = this.authProvider.myDetails
      })
    })
    setInterval(()=> {
    this.getFriendInfo(); },3000); 
    // Preload the audio sound with unique id
    this.platform.ready().then(() => {
      this.nativeAudio.preloadSimple('uniqueId1', 'assets/audio/sound.wav').then((success)=> {
        console.log("success");
      },(error)=> {
          console.log(error);
         });
      }); 

       // Get user details
      this.authProvider.getCurrentUser().valueChanges().subscribe(user => {
      this.user = <any>user;
      console.log(" user", this.user);
      console.log(this.user.sound)
    });
  }

  // get friend messages
 /* gefriendMessage(){
    this.chatProvider.getbuddymessages();
    this.ScrollToBottom();
  }*/

  // get my friends messages
  getbuddymessages() {
    let temp;
    this.ScrollToBottom();
    this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).on('value', (snapshot) => {
      this.friendmessages = [];
      this.ScrollToBottom();
      temp = snapshot.val();
      for (var tempkey in temp) {
        this.friendmessages.push(temp[tempkey]);
      }
      this.events.publish('newmessage');
      this.ScrollToBottom();

    })
  }


  // get all messages list
  getChatlist(){
    this.events.subscribe('newmessage', () => {
      this.allmessages = [];
      this.zone.run(() => {
        this.allmessages = this.chatProvider.friendmessages;
      }) 
    })
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
       this.chatProvider.getbuddymessages()
   }, 1000);

  }

  // if you want to scroll top from bottom use this function
  ScrollToTop(){
    this.content.scrollToTop(1500);
  }
 
  ScrollToPoint(X,Y){
    this.content.scrollToPoint(X,Y,1500);
  }

 // Send message when the message is a text
 // when message is sent the message input becomes empty and the content scroll to bottom
 // typing of current user is updated to false when the messge is sent
  addmessage() {
    let type = 'text'
    this.ScrollToBottom()
    let res = this.newmessage
    this.newmessage = '';
    // audio sound initialize here
    this.nativeAudio.play('uniqueId1').then((success)=> {
      console.log('success')
      console.log(this.user.sound)
    })
    this.chatProvider.addnewmessage(res, type).then(() => {
      this.ScrollToBottom()
      this.hideStatus = !this.hideStatus
      this.hideStatus = true;
      return firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
        typing: 'false'
      }).catch((err) => {
  			console.log(err)
  		})
    })
  }
 
  //when emoji function button is clicked, it move to modal emojicomponent
  //Then return data from the emoji component and pass the data to chatlist
  async EmojiPicker(){
    const modal = await this.modalCtrl.create({
    component: EmojiPickerComponent,
   });
   modal.present();
  //Get returned data
     const { data } = await modal.onWillDismiss();
     console.log('this is the data', data)
        this.emoji = data
        let type = "emoji"
        this.ScrollToBottom()
        this.chatProvider.addnewmessage(this.emoji, type).then(() => {
        this.ScrollToBottom();
        this.newmessage = '';
        this.nativeAudio.play('uniqueId1').then((success)=> {
        console.log('success')
        console.log(this.user.sound)
      })
    })
  }

  //when gif function button is clicked, it move to modal gifcomponent
  //Then return data from the gif component and pass the data to chatlist
  async selectgif(){
    const modal = await this.modalCtrl.create({
    component: GifComponent,
  });
    modal.present();
   //Get returned data
    const { data } = await modal.onWillDismiss();
    console.log('this is the data', data)
      this.gifImage = data
      let type = "gif"
      this.ScrollToBottom()
      this.chatProvider.addnewmessage(this.gifImage, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
      this.nativeAudio.play('uniqueId1').then((success)=> {
      console.log('success')
      console.log(this.user.sound)
    })
  })
}

  // when user select location function, modal is present
  // if user select location at modalcomponent, it return data
  // it can then be pass to the chat list
  async shareLocation(){
     const modal = await this.modalCtrl.create({
     component: LocationComponent,
   });
   modal.present();
  //Get returned data
    const { data } = await modal.onWillDismiss();
    console.log('this is the data', data) 
      this.location = data
      let type = "location"
      this.ScrollToBottom()
      this.chatProvider.addnewmessage(this.location, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
      this.nativeAudio.play('uniqueId1').then((success)=> {
      console.log('success')
      console.log(this.user.sound)
      })
     })
  }

 // When current user navigate to the current page the current user status is updated in firebse
 // The ion-content also scroll to bottom immediatelly
  ionViewDidEnter() {
     firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
      Status: 'Online'
    })
     setTimeout(() => {
      this.content.scrollToBottom(300);
     }, 1000);
  }
 
  // When the current begins to start typing the ion-content scroll to bottom
  // the typing is updated in firebase to true
  onFocus() {
    this.ScrollToBottom()
    this.hideStatus = !this.hideStatus
    return firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
      typing: 'true'
    })
    
  }

  // the needed Friend information are gotten from the users list
  getFriendInfo(){
    return firebase.database().ref('users/' + this.friend.Id).once('value', (snapshot) => {
      //console.log(snapshot.val().name);
      this.friendName = snapshot.val().Name;
      this.friendImage = snapshot.val().Photo;
      this.friendStatus = snapshot.val().Status;
      this.friendTyping = snapshot.val().typing;
      this.friendAbout = snapshot.val().about;
      this.friendLastSeen = snapshot.val().lastseen;
      }); 
  }

// close modal function, the typing, status and lastseen of current user is updated respectivelly
goBack(){
 //this.modalCtrl.dismiss()
   firebase.database().ref('users').child(firebase.auth().currentUser.uid).update({
   typing: 'false',
   Status: 'Offline',
   lastseen: Date.now()
  })
}

// when user click on a message, an alertController pop up
// user can delete message for himself only not to see
// user can also delete message for friend not to see
async showMessageConfirm(message){
  const confirm = await this.alertCtrl.create({
    header: this.translate.instant('ALERT.deletemessage'),
    message: this.translate.instant('ALERT.taponoption'),
    buttons: [
      {
        text: this.translate.instant('ALERT.deleteforme'),
        handler: () => {
          this.deleteMessageForMe(message)
        }
      },
      {
        text: this.translate.instant('ALERT.deleteforall'),
        handler: () => {
          this.deleteMessageForAll(message)
        }
      },
      {
        text: this.translate.instant('ALERT.cancel'),
        handler: () => {
          console.log('cancel')
        }
      }  
    ]
  });
  confirm.present();
}

// Toast shown 
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

// delete message for me function
deleteMessageForMe(message){
  this.spinnerDialog.show(this.translate.instant('ALERT.deletemessage'), this.translate.instant('ALERT.deleting'), false);
  this.chatProvider.deleteMessageForMe(message).then(() => {
    this.spinnerDialog.hide()
    this.showToast(this.translate.instant('ALERT.messagehasbeendeleted'))
  }).catch((err) => {
    this.spinnerDialog.hide()
  })
}

// delete messge for all function
deleteMessageForAll(message){
  this.spinnerDialog.show("Delete Message", "deleting..", false);   
  this.chatProvider.deleteMessageForAll(message).then(() => {
    this.spinnerDialog.hide()
    this.showToast(this.translate.instant('ALERT.messagehasbeendeleted'))
  }).catch((err) => {
    this.spinnerDialog.hide()
    this.showToast(err)
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
        icon: 'image',
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
    /*  {
        text: this.translate.instant('ALERT.video'),
        icon: 'videocam',
        handler: () => {
          this.postVideo()
         
        }
      },*/
      {
        text: this.translate.instant('ALERT.gif'), 
        icon: 'image',
        handler: () => {
          this.selectgif()
        }
      },
      {
        text: this.translate.instant('ALERT.location'),
        icon: 'pin',
        handler: () => {
          this.shareLocation()
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

// get image through camera plugin with option to use camera only
// then the resulting data is converted to base64
// Then it is stored in firebase storage with unique current user id and then send to chat list
// message type is equal to cameraPhoto in this case
CameraPhoto() {
  const cameraOptions = {
    quality: 100,
    targetWidth: 600,
    targetHeight: 600,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true
              
  }
  this.camera.getPicture(cameraOptions).then((ImageData) => {
    this.captureDataUrl = 'data:image/jpeg;base64,' + ImageData
    let type = 'image'
    this.chatProvider.addnewmessage(this.captureDataUrl, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = '';
        this.nativeAudio.play('uniqueId1').then((success)=> {
          console.log('success')
          console.log(this.user.sound)
        })
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
    this.chatProvider.addnewmessage(this.captureDataUrl, type).then(() => {
      this.ScrollToBottom();
      this.newmessage = ''
        this.nativeAudio.play('uniqueId1').then((success)=> {
          console.log('success')
          console.log(this.user.sound)
        })
    }).catch((err) => {
      this.showToast(err)
    })
  }, (err) => {
    var error = JSON.stringify(err)
    this.showToast(error)
  })
}

// View image in large form and information in modal page
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


// play video function, when user click on the video it started playing
/*startVideo(url) {
  const options: StreamingVideoOptions = {
    successCallback: () => { console.log('Video played') },
    errorCallback: (e) => { console.log(e) },
    orientation: 'portrait',
    shouldAutoClose: true,
    controls: true
  };
  this.streamingMedia.playVideo(url, options);
}

// user can capture video through media capture plugin
// the video data is converted to blog upload to firebase storage and send to chat message list
  postVideo() {
    let userId = firebase.auth().currentUser.uid;
    this.mediaCapture.captureVideo({limit: 1, duration: 30, quality: 1 }).then((data: MediaFile[]) => {
        let index = data[0].fullPath.lastIndexOf('/'), finalPath = data[0].fullPath.substr(0, index);
        this.file.readAsArrayBuffer(finalPath, data[0].name).then((file) => {

            const videoRef = firebase.storage().ref('/' + userId + '/' + 'video');

            let blob = new Blob([file], { type: data[0].type });
            videoRef.put(blob).then(function (snapshot) {
                console.log('Uploaded a video');
                var videourl = snapshot.downloadURL;
              
            let numstr = 1;
            let filedir = this.file.dataDirectory;

            var path = data[0].fullPath.replace('/private', 'file://');
            var ind = (path.lastIndexOf('/') + 1);
            var orgFilename = path.substring(ind);
            var orgFilePath = path.substring(0, ind);

            console.log("videopath", path);
            //SAVE FILE

            var option: CreateThumbnailOptions = { fileUri: path, width: 500, height: 500, atTime: 1, outputFileName: 'sample' + numstr, quality: 100 };
                this.videoEditor.createThumbnail(option).then(result => {
                    //result-path of thumbnail
                    //localStorage.setItem('videoNum', numstr.toString());
                    console.log("result: " + result);

                    let path2 = 'file://' + result;

                    const videoRef2 = firebase.storage().ref('/' + userId + '/' + 'thumb');

                    let index = path2.lastIndexOf('/'), finalPath = path2.substr(0, index);
                    this.file.readAsArrayBuffer(finalPath, 'sample1.jpg').then((file) => {

                        let thumbBlob = new Blob([file], { type: 'image/jpeg' });
                        videoRef2.put(thumbBlob).then(function (snapshot) {
                            console.log('Uploaded a thumbnail');
                            var thumburl = snapshot.downloadURL;
                            console.log("thumb url: " + thumburl);
                            //add it to firestore
                            let videomessge = {source: videourl, thumbnail: thumburl}
                            var type = 'video'
                            this.chatProvider.addnewmessage(videomessge, type).then(() => {
                            this.ScrollToBottom();
                            this.newmessage = ''
                          })
                        });

                    }).catch(err => { console.log(err); });
                    
                  
                }).catch(e => {
                    // alert('fail video editor');
                });
           
        }).catch(err => { console.log(err); });
    })

  })
}*/

      
 
}
  




 
            

