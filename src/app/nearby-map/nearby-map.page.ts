import { Component, ViewChild, ElementRef, OnInit, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { GeoFire } from 'geofire';
import { ChatProvider } from '../provider/chat';
import * as firebase from 'firebase/app';


declare var google;

@Component({
  selector: 'app-nearby-map',
  templateUrl: './nearby-map.page.html',
  styleUrls: ['./nearby-map.page.scss'],
})
export class NearbyMapPage implements OnInit {


  latLng: any;
  @ViewChild('map') mapElement: ElementRef;
  private options: GeolocationOptions;
  private currentPos: Geoposition;
  private userLat: any;
  private userLong: any;
  private map: any;
  location: any;
  autocompleteItems;
  autocomplete;
  latitude: number;
  longitude: number;
  nearbyList = [];
  ref = firebase.database().ref('users/');
  geoRef = firebase.database().ref('geo/');
  geoFire = new GeoFire(this.geoRef);
  infoWindows: any = [];


  constructor(private geolocation: Geolocation, public modalCtrl: ModalController,
    public chatProvider: ChatProvider, public zone: NgZone) { }


  ionViewDidEnter() {
    this.options = {
      enableHighAccuracy: false
    };
    // get current user geolocation with latitude and longitude
    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
      this.currentPos = pos;
      this.userLat = pos.coords.latitude;
      this.userLong = pos.coords.longitude;
      this.addMap(pos.coords.latitude, pos.coords.longitude);
      this.latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    }, (err: PositionError) => {
      console.log('error: ' + err.message);
    });
  }


  ngOnInit() {
    this.getLocationNear();
  }

  getLocationNear(): Promise<any> {
    return new Promise((resolve, reject) => {
      // this.loading = true;
      this.nearbyList = [];
      this.chatProvider.getLocation().then((data) => {
        const geoQuery = this.geoFire.query({
          center: [data.coords.latitude, data.coords.longitude],
          radius: 0.3 // 0.1 km or 100 meters
        });
        geoQuery.on('key_entered', (key, location, distance) => {
          console.log(key + ' entered query at ' + location + ' (' + distance + ' km from center)');
          this.ref.child(key)
            .once('value')
            .then((snapshot) => {
              const value = snapshot.val();
              this.nearbyList.push(snapshot.val());
              resolve(true);
            });
        });
      }).catch(err => {
        // this.loading = false;
        reject(err);
        console.error(err);
      });
    });
  }


  addMap(lat, long) {
    // add all markers to the map including current location
    const latLng = new google.maps.LatLng(lat, long);
    const mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    this.createMarker();
  }

  addInfoWindowToMarker(marker) {

    const infoWindowContent = '<div id="iw-container">' +
      '<div class="iw-content">' +
      '<div class="iw-subTitle">' + marker.title + '</div>' +
      '<b>Distance:</b> ' + marker.distance + '<b>m</b>' +
      '</div>' +
      // '<div id="do-something-button">button</div>' +
      '</div>';

    const infoWindow = new google.maps.InfoWindow();
    // infoWindow.setOptions({
    //     disableAutoPan:false
    // });
    infoWindow.setContent(infoWindowContent);

    marker.addListener('click', () => {
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);
      // add listener that will capture the click event of the infoWindow
      // google.maps.event.addListener(infoWindow, 'domready', () => {
      //   document.getElementById('do-something-button').addEventListener('click', () => {
      //      this.doSomething();
      //   });
      // });

    });
    this.infoWindows.push(infoWindow);
  }

  closeAllInfoWindows() {
    for (const window of this.infoWindows) {
      window.close();
    }
  }

  createMarker() {
    // All neraby places marker
    this.nearbyList.forEach((user) => {
      const position = new google.maps.LatLng(user.lat, user.long);
      const lat = user.lat;
      const lng = user.long;
      // calculate the distance of this place from that of the user
      const units = 'm';
      const earthRadius = {
        miles: 3958.8,
        m: 6378137
      };

      const R = earthRadius[units];
      const lat1 = this.userLat;
      const lon1 = this.userLong;
      const lat2 = lat;
      const lon2 = lng;

      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1) * (Math.PI / 180)) * Math.cos((lat2) * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = Math.round((R * c));
      user.distance = d;
      // toFixed(2);
      const marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: position,
        title: user.Name,
        distance: user.distance,
        icon: {
          url: user.Photo,
          // The size image file.
          size: new google.maps.Size(72, 96),
          // we want to render @ 30x30 logical px (@2x dppx or 'Retina')
          scaledSize: new google.maps.Size(40, 52),
          // The point on the image to measure the anchor from. 0, 0 is the top left.
          origin: new google.maps.Point(0, 0),
          // The x y coordinates of the anchor point on the marker. e.g. If your map marker was a drawing pin then the anchor would be the tip of the pin.
          anchor: new google.maps.Point(20, 40),
          labelOrigin: new google.maps.Point(20, 12)
        },

      });
      marker.setMap(this.map);
      this.map.setCenter(position);
      this.addInfoWindowToMarker(marker);
    });
  }

}








