import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import   { GeoFire }   from 'geofire';
import { ChatProvider } from '../provider/chat';
import * as firebase from "firebase/app";
import { IonSlides, ToastController, AlertController, ModalController } from '@ionic/angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { RequestProvider } from '../provider/request';
import { UsersProvider } from '../provider/users';
import { ImageViewerComponent } from '../component/image-viewer/image-viewer.component';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
  
  
  declare var google;
  
  @Component({
    selector: 'app-nearby-user',
    templateUrl: './nearby-user.page.html',
    styleUrls: ['./nearby-user.page.scss'],
  })
  export class NearbyUserPage implements OnInit {

  @ViewChild('map') mapElement: ElementRef;
  nearbyList = [];
  ref = firebase.database().ref('users/');
  geoRef = firebase.database().ref('geo/')
  geoFire = new GeoFire(this.geoRef);
  map: any;
  marker: any;
  user;
  toast;
  phone_model = 'iPhone';
  
 
  constructor(
    public chatProvider: ChatProvider,
    public usersProvider: UsersProvider, 
    public toastCtrl: ToastController, 
    public alertCtrl: AlertController, 
    public requestProvider: RequestProvider,
     public spinnerDialog: SpinnerDialog, 
     public modalCtrl: ModalController) {

  }

  ngOnInit() {
    
  }

  ionViewDidEnter() {
    this.getLocationNear()
  }

  getLocationNear(): Promise<any> {
    return new Promise((resolve, reject) => {
     // this.loading = true;
      this.nearbyList = [];
      this.chatProvider.getLocation().then((data) => {
        var geoQuery = this.geoFire.query({
          center: [data.coords.latitude, data.coords.longitude],
          radius: 0.3 // 0.1 km or 100 meters
        });
        geoQuery.on("key_entered", (key, location, distance) => {
          console.log(key + " entered query at " + location + " (" + distance + " km from center)");
          this.ref.child(key)
            .once('value')
            .then((snapshot) => {
              var value = snapshot.val();
              this.nearbyList.push(snapshot.val());
              this.nearbyList.forEach((user) => {
              let lat = user.lat
              let lng = user.long
                //calculate the distance of this place from that of the user
                let units = 'm';
                let earthRadius = {
                  miles: 3958.8,
                  m: 6378137
                };
          
                let R = earthRadius[units];
                let lat1 = data.coords.latitude; 
                let lon1 = data.coords.longitude; 
                let lat2 = lat;
                let lon2 = lng;
          
                let dLat = (lat2 - lat1) * (Math.PI / 180);
                let dLon = (lon2 - lon1) * (Math.PI / 180);;
                let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
                let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                let d = Math.round((R * c));
                user.distance = d
                //toFixed(2);
              resolve(true);
            })
          })
        });
      }).catch(err => {
        //this.loading = false;
        reject(err);
        console.error(err);
      });
    })
  }

    
  // view user image in large form at modal page
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