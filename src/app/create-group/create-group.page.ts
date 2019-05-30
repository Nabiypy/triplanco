import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController, ActionSheetController } from '@ionic/angular';
import { AuthProvider } from '../provider/auth';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { GroupProvider } from '../provider/group';
import { Camera } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';

declare var window: any;

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.page.html',
  styleUrls: ['./create-group.page.scss'],
})
export class CreateGroupPage implements OnInit {

  form: any;
  groupDetails: any;
  public toast;
  errorCreateMessage: any;
  disableCreate: boolean = false;
  errorMessage: any;
  buttonText: any = "Create";
  phone_model = 'iPhone';
  groupPicture;
 
  constructor(
    public toastController: ToastController, 
    private router: Router, 
    public alertController: AlertController, 
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController, 
    public camera: Camera, 
    public groupProvider: GroupProvider, 
    private spinnerDialog: SpinnerDialog, 
    public loadingCtrl: LoadingController, 
    public authProvider: AuthProvider, 
    public modalCtrl: ModalController
    ) {
  
    this.form = {}
    
  }

  ngOnInit() {
    console.log('ngOnInit LoginPage');
  }

   // update profile function
   create() {
    // spinnerdialog shows when user click update button
    if(this.validateRegister(this.form)){

      this.spinnerDialog.show(this.translate.instant('ALERT.creategroup'), this.translate.instant('ALERT.creating'), false);
      // the user details are updated in firebase user list
      this.groupDetails = {
        Name: this.form.Name,
        description: this.form.description,
        Picture: this.groupPicture
      }

   // details are submitted to creatGroup function from groupProvider
      this.groupProvider.createGroup(this.groupDetails).then(() => {
         this.router.navigateByUrl('group');
        this.showToast();
       this.spinnerDialog.hide();
      }) 
    } 
  }


// Handling create error
handleCreateError(err){
	console.log(err.code);
	this.errorCreateMessage = err.message;
	this.disableCreate = false;
	this.buttonText = "Create";
}

// Validation of the group details input
validateRegister(form){
	if(this.form.Name == undefined || this.form.Name == ''){
	 this.errorMessage = this.translate.instant('ALERT.pleasentergroupname');
	 return false;
 }
 if(this.form.description == undefined || this.form.description == ''){
	 this.errorMessage = this.translate.instant('ALERT.pleaseentergroupdescription');
	 return false;
 }

 if(this.groupPicture == undefined){
  this.errorMessage = this.translate.instant('ALERT.pleaseselectgrouppic');
  return false;
}

 return true;
  }

  // Toast shown when group is creted
  showToast() {
    this.toast = this.toastController.create({
      message: this.translate.instant('ALERT.groupcreatedsuccess'),
      position: 'bottom',
      duration: 4000,
      animated:true,
      cssClass:"my-custom-class"
    }).then((toastData)=>{
      console.log(toastData);
      toastData.present();
    });
  }

   /* When user select any camera option, Camera or Gallery, the resulting data is uploaded
   to firebase storage with current user ID */
  selectGalleryPhoto() {
    const cameraOptions = {
      quality : 50,
      sourceType : this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.PNG,
      destinationType: this.camera.DestinationType.DATA_URL
    }
    this.camera.getPicture(cameraOptions).then((ImageData) => {
      this.groupPicture = 'data:image/jpeg;base64,' + ImageData
    })
  }
  
}
