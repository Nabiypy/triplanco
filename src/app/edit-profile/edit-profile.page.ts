import { Component, OnInit } from '@angular/core';
import { Events, ActionSheetController, Platform, ToastController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import * as firebase from "firebase/app";
import { ActivatedRoute, Router } from '@angular/router';
import { AuthProvider } from '../provider/auth';
import { UsersProvider } from '../provider/users';
import { TranslateService } from '@ngx-translate/core';


declare var window: any;

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
    public users = [];
    public editProfileForm;
    toast: any;
    public user: any;
    phone_model = 'iPhone';
    coverImage = 'assets/imgs/bg.png';

    constructor(public formBuilder: FormBuilder, 
      private activatedRoute: ActivatedRoute, 
      private spinnerDialog: SpinnerDialog,
      public events: Events, 
      public camera: Camera, 
      public toastCtrl: ToastController, 
      public router: Router, 
      public translate: TranslateService,
      public actionSheetCtrl: ActionSheetController,
       public userProvider: UsersProvider, 
       public authProvider: AuthProvider
       ) {
        // Validate user information
        this.editProfileForm = formBuilder.group({
            Name: ['', Validators.compose([Validators.required])],
            about: ['', Validators.compose([Validators.required])]
        });
  }

  // get user profile details
  ngOnInit(){
    this.getMyProfile()
    this.authProvider.getCurrentUser().valueChanges().subscribe(user => {
      this.user = <any>user;
      console.log(" user", this.user);
    });
  }

 // Toast shown when user update profile
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

 // update profile function
  updateProfile() {
    // spinnerdialog shows when user click update button
    this.spinnerDialog.show("ChatMe", this.translate.instant('ALERT.updatingprofile'), false);
      let userId = firebase.auth().currentUser.uid
      let Name = this.editProfileForm.value.Name || this.users[0].Name;
      let about = this.editProfileForm.value.about || this.users[0].about;
      // the user details are updated in firebase user list
      firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
          firebase.database().ref('/users/' + userId).child('Name').set(Name);
          firebase.database().ref('/users/' + userId).child('about').set(about); 
      }); 
      // spinnerdialog is hide after after
      this.spinnerDialog.hide();
      // then the user is automatically navigate back to profile page and show toast
      this.router.navigateByUrl('profile')
      this.showToast(this.translate.instant('ALERT.detailsupload'))   
  }

  // Get current user details
  getMyProfile() {
    let userId = firebase.auth().currentUser.uid;
    let userClone = this.users;
    let Name;
    let Photo;
    let about;
    let userQuery = firebase.database().ref('/users/' + userId).once('value').then(function (snapshot) {
        Name =snapshot.val().Name;
        Photo = snapshot.val().Photo;
        about = snapshot.val().about;
        userClone.push({ "Name": Name, "Photo": Photo, "about": about });
    });
}

}

