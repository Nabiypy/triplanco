import { Component, OnInit, NgZone } from '@angular/core';
import { AuthProvider } from '../provider/auth';
import { Router } from '@angular/router';
import { ModalController, ActionSheetController, AlertController, ToastController } from '@ionic/angular';
import { UsersProvider } from '../provider/users';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import * as firebase from 'firebase/app';
import { AngularFireDatabase } from 'angularfire2/database';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { Validator } from '../provider/validator';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { LanguageComponent } from '../component/language/language.component';
import { AngularFireAuth } from 'angularfire2/auth';
import { TranslateService } from '@ngx-translate/core';
import { DocumentService } from '../provider/document.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public user: any;
  public isHidden: boolean  = true;
  myNotify: boolean = true;
  chatSound: boolean = true;
  showOnline: any = false;
  status = true;

  constructor(public ngZone: NgZone,
              public authProvider: AuthProvider,
              public toastCtrl: ToastController,
              private spinnerDialog: SpinnerDialog,
              public userProvider: UsersProvider,
              public camera: Camera,
              public afAuth: AngularFireAuth,
              public translate: TranslateService,
              public router: Router,
              public modalCtrl: ModalController,
              public afDB: AngularFireDatabase,
              public actionSheetCtrl: ActionSheetController,
              public alertCtrl: AlertController,
              private documentService: DocumentService,
              private storage: Storage ) {
                this.showArabicFab();
  }

  ngOnInit() {
    // Get user details
    this.authProvider.getCurrentUser().valueChanges().subscribe(user => {
      this.user = <any>user;
      console.log(' user', this.user);
    });
    this.showArabicFab();
  }

  ionViewDidEnter() {
    // enable notification through toggle button
    firebase.database().ref('users' + firebase.auth().currentUser.uid).once('value', snapshot => {
      if (snapshot.hasChild('notifications')) {
        this.myNotify = snapshot.val().notifications;
      } else {
        this.myNotify = true;
      }
    });
  }

  toggle() {
    // enable notification through toggle button
    this.afDB.database.ref(`users/${this.afAuth.auth.currentUser.uid}`).update({
      notifications: this.myNotify,
    });
  }

  onChange() {
    if (this.status) {
      this.statusbuttonOn();
    } else {
      this.statusbuttonOff();
    }
  }

  // go online when user is offline
  statusbuttonOn() {
    this.afDB.database.ref(`users/${this.afAuth.auth.currentUser.uid}`).update({
      Status: 'Online'
    });
  }

  // go offline when user is online
  statusbuttonOff() {
    this.afDB.database.ref(`users/${this.afAuth.auth.currentUser.uid}`).update({
      Status: 'Offline'
    });
  }


  // The currentPassword is first checked, after which the new password should be entered twice.
  // Uses password validator from Validator.ts.
  async setPassword() {
    const alert = await this.alertCtrl
      .create({
        header: this.translate.instant('ALERT.changepassword'),
        message: this.translate.instant('ALERT.enternewpassword'),
        inputs: [
          {
            name: "currentPassword",
            placeholder: this.translate.instant('ALERT.currentpassword'),
            type: "password"
          },
          {
            name: "password",
            placeholder: this.translate.instant('ALERT.newpassword'),
            type: 'password'
          },
          {
            name: "confirmPassword",
            placeholder: this.translate.instant('ALERT.confirmpassword'),
            type: 'password'
          }
        ],
        buttons: [
          {
            text: this.translate.instant('ALERT.cancel'),
            handler: data => { }
          },
          {
            text: "Save",
            handler: data => {
              let currentPassword = data.currentPassword;
              let credential = firebase.auth.EmailAuthProvider.credential(
                this.user.Email,
                currentPassword
              );
              // Check if currentPassword entered is correct
              this.spinnerDialog.show(this.translate.instant('ALERT.changepassword'), this.translate.instant('ALERT.changingpassword'), false)
              firebase
                .auth()
                .currentUser.reauthenticateWithCredential(credential)
                .then(success => {
                  const password = data.password;
                  // Check if entered password is not the same as the currentPassword
                  if (password != currentPassword) {
                    if (
                      password.length >=
                      Validator.profilePasswordValidator.minLength
                    ) {
                      if (
                        Validator.profilePasswordValidator.pattern.test(
                          password
                        )
                      ) {
                        if (password == data.confirmPassword) {
                          // Update password on Firebase.
                          firebase
                            .auth()
                            .currentUser.updatePassword(password)
                            .then(success => {
                              this.spinnerDialog.hide();
                              Validator.profilePasswordValidator.pattern.test(
                                password
                              );
                              const message = this.translate.instant('ALERT.passwordchangesuccess');
                              this.ShowToast(message);
                            })
                            .catch(error => {
                              this.spinnerDialog.hide();
                              const code = error.code;
                              this.ShowToast(code);
                              if (code == 'auth/requires-recent-login') {
                                this.authProvider.offlineStatuss().then(() => {
                                  this.authProvider.logOut().then(() => {
                                    this.router.navigateByUrl('welcome');
                                    window.localStorage.clear();
                                  });
                                });
                              }
                            });
                        } else {
                          const message = 'passwords-do-not-match';
                          this.ShowToast(message);
                        }
                      } else {
                        const message = 'invalid-chars-password';
                        this.ShowToast(message);
                      }
                    } else {
                      const message = 'password-too-short';
                      this.ShowToast(message);
                    }
                  }
                })
                .catch(error => {
                  // Show error
                  this.spinnerDialog.hide();
                  const code = error.code;
                  this.ShowToast(code);
                });
            }
          }
        ]
      });
    await alert.present();
  }

  async ShowToast(message) {
    const toast = await this.toastCtrl.create({
      message,
      showCloseButton: true,
      position: 'bottom',
      closeButtonText: 'Done'
    });
    toast.present();
  }

  // Delete the user account. After deleting the Firebase user, the userData along with their profile pic uploaded on the storage will be deleted as well.
  // If you added some other info or traces for the account, make sure to account for them when deleting the account.
  async deleteAccount() {
    const alert = await this.alertCtrl
      .create({
        header: this.translate.instant('ALERT.confirmdelete'),
        message: this.translate.instant('ALERT.suredeleteaccount'),
        buttons: [
          {
            text: this.translate.instant('ALERT.cancel'),
          },
          {
            text: 'Delete',
            handler: data => {
              this.spinnerDialog.show(this.translate.instant('ALERT.deleteaccount'), this.translate.instant('ALERT.deletingaccount'), false);
              // Delete Firebase user
              firebase
                .auth()
                .currentUser.delete()
                .then(success => {
                  // Delete user data on Database
                  this.afDB
                    .object('/users/' + this.user.Id)
                    .remove()
                    .then(() => {
                      this.spinnerDialog.hide();
                      const message = this.translate.instant('ALERT.accountdeletesucess');
                      this.ShowToast(message);
                      this.authProvider.offlineStatuss().then(() => {
                        this.authProvider.logOut().then(() => {
                          this.router.navigateByUrl('welcome');
                          window.localStorage.clear();
                        });
                      });
                    });
                })
                .catch(error => {
                  this.spinnerDialog.hide();
                  const code = error.code;
                  this.ShowToast(code);
                  if (code === 'auth/requires-recent-login') {
                    this.authProvider.offlineStatuss().then(() => {
                      this.authProvider.logOut().then(() => {
                        this.router.navigateByUrl('welcome');
                        window.localStorage.clear();
                      });
                    });
                  }
                });
            }
          }
        ]
      });
    await alert.present();
  }

  // Change user's email. Uses Validator.ts to validate the entered email. After, update the userData on database.
  // When the user changed their email, they have to confirm the new email address.
  async setEmail() {
    const alert = await this.alertCtrl
      .create({
        header: this.translate.instant('ALERT.changemail'),
        message: this.translate.instant('ALERT.enterneweamil'),
        inputs: [
          {
            name: this.translate.instant('ALERT.email'),
            placeholder: this.translate.instant('ALERT.emailaddress'),
            value: this.user.Email
          }
        ],
        buttons: [
          {
            text: this.translate.instant('ALERT.cancel'),
            handler: data => { }
          },
          {
            text: 'Save',
            handler: data => {
              const Email = data.Email;
              // Check if entered email is different from the current email
              if (this.user.Email !== Email) {
                // Check if email is valid.
                if (Validator.profileEmailValidator.pattern.test(Email)) {
                  this.spinnerDialog.show(this.translate.instant('ALERT.changemail'), this.translate.instant('ALERT.changingemail'), false);
                  // Update email on Firebase.
                  firebase
                    .auth()
                    .currentUser.updateEmail(Email)
                    .then(success => {
                      // Update userData on Database.
                      this.afDB
                        .object('/users/' + this.user.Id)
                        .update({
                          Email
                        })
                        .then(success => {
                          Validator.profileEmailValidator.pattern.test(Email);
                          // Check if emailVerification is enabled, if it is go to verificationPage.
                          if (Validator.emailVerification) {
                            if (!firebase.auth().currentUser.emailVerified) {
                              // this.router.navigateByUrl('verification');
                            }
                          }
                        })
                        .catch(error => {
                          const message = 'error in changing email';
                          this.ShowToast(message);
                        });
                    })
                    .catch(error => {
                      // Show error
                      this.spinnerDialog.hide();
                      const code = error.code;
                      this.ShowToast(code);
                      if (code === 'auth/requires-recent-login') {
                        this.authProvider.offlineStatuss().then(() => {
                          this.authProvider.logOut().then(() => {
                            this.router.navigateByUrl('welcome');
                            window.localStorage.clear();
                          });
                        });
                      }
                    });
                } else {
                  const message = 'invalid email';
                  this.ShowToast(message);
                }
              }
            }
          }
        ]
      });
    await alert.present();
  }

  // Upload user profile picture, the user picture is store in firebase storage with user id
  // The profile is updated in user profile list in firebase
  async getProfilePicture(sourceType: PictureSourceType) {
    const Id = firebase.auth().currentUser.uid;
    try {
      const options: CameraOptions = {
        quality: 50,
        targetWidth: 384,
        targetHeight: 384,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true,
        sourceType,
        saveToPhotoAlbum: false,

      };
      const result = await this.camera.getPicture(options);
      const image = 'data:image/jpeg;base64,' + result;
      const pictures = firebase.storage().ref('/' + Id + '/' + 'profilePicure');
      pictures.putString(image, `data_url`);

      let returnVal;

      firebase.storage().ref(Id + '/' + 'profilePicure').getDownloadURL().then(function (url) {
        // Execute (unknown)
        returnVal = url;
        firebase.database().ref('/users/' + Id).child('Photo').set(returnVal);
        const profile = {
          displayName: this.user.Name,
          photoURL: returnVal
        };
        firebase.auth().currentUser.updateProfile(profile)
          .then((success) => {
            this.spinnerDialog.hide();
          });
      });
    } catch (e) {
      console.log(e);
    }

  }


  // upload user profile picture
  // The user has two option to select using camera and Gallery
  async proPic() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('ALERT.selectprofilepic'),
      buttons: [
        {
          text: this.translate.instant('ALERT.camera'),
          icon: 'camera',
          role: 'destructive',
          handler: () => {
            this.getProfilePicture(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: this.translate.instant('ALERT.gallery'),
          icon: 'albums',
          handler: () => {
            this.getProfilePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }, {
          text: this.translate.instant('ALERT.cancel'),
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
          }
        }
      ]
    });
    actionSheet.present();
  }


  async coverPic() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.translate.instant('ALERT.selectcoverpic'),
      cssClass: 'action-sheets-basic-page',
      buttons: [
        {
          text: this.translate.instant('ALERT.camera'),
          icon: 'camera',
          role: 'destructive',
          handler: () => {
            this.getCoverPicture(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: this.translate.instant('ALERT.gallery'),
          icon: 'albums',
          handler: () => {
            this.getCoverPicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }, {
          text: this.translate.instant('ALERT.cancel'),
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('cancel');
          }
        }
      ]
    });
    actionSheet.present();
  }

  // Upload user profile cover picture, the user picture is store in firebase storage with user id
  // The profile is updated in user profile list in firebase
  async getCoverPicture(sourceType: PictureSourceType) {
    const Id = firebase.auth().currentUser.uid;
    try {
      const options: CameraOptions = {
        quality: 50,
        targetWidth: 384,
        targetHeight: 384,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        correctOrientation: true,
        sourceType,
        saveToPhotoAlbum: false,
      };

      const result = await this.camera.getPicture(options);
      const image = 'data:image/jpeg;base64,' + result;
      const pictures = firebase.storage().ref('/' + Id + '/' + 'coverPicure');
      pictures.putString(image, `data_url`);

      this.spinnerDialog.show('Cover Picture', 'uploading..', false);
      let returnVal;
      firebase.storage().ref(Id + '/' + 'coverPicure').getDownloadURL().then(function (url) {
        // Execute (unknown)
        returnVal = url;
        firebase.database().ref('/users/' + Id).child('Cover').set(returnVal);
      });
      this.spinnerDialog.hide();
    } catch (e) {
      console.log(e);
    }

  }

  // Proceed to edit Profile page.
  editProfile() {
    this.router.navigateByUrl('edit-profile');
  }


  async selectLanguage() {
    // Show modal
    const modal = await this.modalCtrl.create({
      component: LanguageComponent,
    });
    modal.present();
  }

  async showArabicFab() {
    await this.storage.get('isLng').then(val => {
      console.log('@ Profile get select islng ====>', val);
      if ( val === 'ar') {
        this.isHidden = false;
      }
    });
  }
  // view image in large form in modal component
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





