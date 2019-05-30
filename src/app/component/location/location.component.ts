import { Component, ViewChild, ElementRef, OnInit, NgZone} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { ChatProvider } from 'src/app/provider/chat';

declare var google;
 
@Component({
    selector: 'app-locaation',
    templateUrl: './location.component.html',
    styleUrls: ['./location.component.scss']
  })
  export class LocationComponent implements OnInit {

  
  latLng:any;
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
  anyAdress: any;
  service = new google.maps.places.AutocompleteService();
  places = [];
  restaurants  = [];
  banks  = [];
  hospitals = [];
  segmentTab: any;
  place_dustance;

  constructor(private geolocation: Geolocation, public modalCtrl: ModalController, 
    public chatProvider: ChatProvider, public zone: NgZone) {}
  

  ionViewDidEnter() {
    this.options = {
      enableHighAccuracy : false
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
    // declare autocompleteItems as an array and query the list
    this.autocompleteItems = [];
    this.autocomplete = {
      query: ''
    };
  }

 

  // close modal page if nothing is selected
  closeModal() {
    this.modalCtrl.dismiss();
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
    this.addMarker();
    // Get restaurants nearby and add the markers to the map
    this.getRestaurants(latLng).then((results : Array<any>)=>{
      this.restaurants = results;
      for(let i = 0 ;i < results.length ; i++)
      {
          this.createMarker(results[i]);
      }
     },(status)=>console.log(status));
     // Get banks nearby and add the markers to the map
     this.getBanks(latLng).then((results : Array<any>)=>{
      this.banks = results;
      for(let i = 0 ;i < results.length ; i++)
      {
          this.createMarker(results[i]);
      }
     },(status)=>console.log(status));
    // Get hospitals nearby and add the markers to the map
     this.getHospital(latLng).then((results : Array<any>)=>{
      this.hospitals = results;
      for(let i = 0 ;i < results.length ; i++)
      {
          this.createMarker(results[i]);
      }
     },(status)=>console.log(status));
    
     this.addInfoMarker();

}

addInfoMarker(){
  // Get information from current user marker on the map
     let marker = new google.maps.Marker({
       map: this.map,
       animation: google.maps.Animation.DROP,
       position: this.map.getCenter()
    });
       let content = "<p>This is your current position !</p>";          
       let infoWindow = new google.maps.InfoWindow({
       content: content
    });
       google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
  });

}

createMarker(place){
  // All neraby places marker
    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: place.geometry.location,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'blue',
      fillOpacity: .6,
      scale: 5,
      strokeColor: 'white',
      strokeWeight: .5 
   },
    });   
}   

  addMarker() {
   // Customize current user marker
    const marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: 'lightblue',
          fillOpacity: .6,
          scale: 60,
          strokeColor: 'white',
          strokeWeight: .5 
       },
    });
    google.maps.event.addListener(marker, 'click', () => {
    });
  }

  // Location sharing function
  onSelect(){
     this.chatProvider.getLocation().then((data) => {  
  // geolocation detect the latitude and Longitude
  // Then google geocoder convert the latitude and longitude to address
      let latLng = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      let geocoder = new google.maps.Geocoder;
    var request = {
      latLng: latLng,
    };
  geocoder.geocode(request, (results, status)=>{
   //console.log(JSON.parse(results));
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        console.log(results[1]);
        // the formatted address is gotten
        this.anyAdress= results[1].formatted_address;;
      
      }
        if (results[0]) {
        console.log(results[0]);

          } else {
            console.log("Results not available");
          }
        }
        else {
          console.log("Geocoder failed due to: ", status);
        }
    // latitude, longitude and the address are sent to the chat list server on modal dismiss
    this.location = {lat: data.coords.latitude, long: data.coords.longitude, address: this.anyAdress}
    this.modalCtrl.dismiss(this.location)
      })
    
  })

}

segmentChanged(event: any) {
  this.segmentTab = event.detail.value;
  console.log(this.segmentTab);
}

  chooseItem(item: any) {
    //convert Address to lat and long
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': item }, (results, status) => {
    this.latitude = results[0].geometry.location.lat();
    this.longitude = results[0].geometry.location.lng();
    console.log("lat: " + this.latitude + ", long: " + this.longitude);
    this.location = {lat: this.latitude, long: this.longitude, address: item}
    this.modalCtrl.dismiss(this.location);
     });
  }


  selectPlace(place: any){
     //convert Address to lat and long
     let geocoder = new google.maps.Geocoder();
     geocoder.geocode({ 'address': place }, (results, status) => {
     this.latitude = results[0].geometry.location.lat();
     this.longitude = results[0].geometry.location.lng();
     console.log("lat: " + this.latitude + ", long: " + this.longitude);
     this.location = {lat: this.latitude, long: this.longitude, address: place}
     this.modalCtrl.dismiss(this.location);
      });
  }


  updateSearch() {
    // Autocomplete search, if autocomplete query is empty return list of items in an array
    if (this.autocomplete.query == '') {
     this.autocompleteItems = [];
     return;
    }
   // Places prediction, you can add more to it
    let me = this;
    this.service.getPlacePredictions({
    input: this.autocomplete.query,
    componentRestrictions: {country: ['NG', "DZ", "AR", "AU", 'US', "AT", "AZ", "BS", "BH", "BD", "CV", "BE", "BR", "BF", "CM", "CA", "CL", "CN", "CR", "HR", "CU", "CZ", "DK", "EC", "EG", "ET", "FI", "FR", "GA", "GM", "DE", "GH", "IN", "ID", "IR", "IQ", "IL", "IT", "JM", "JP", "JO", "KE", "LB", "LR", "LY", "MW", "MY", "ML", "MX", "MA", "MZ", "NA", "NR", "NP", "NL", "NZ", "NI", "NE", "NO", "PY", "PE", "PH", "PL", "PT", "QA", "RO", "RU", "SA", "SG", "ZA", "ES", "LK", "SE", "CH", "SI", "TW", "TH", "TN", "TR", "GB", "UA", "AE", "UY", "US", "VE", "ZM", "ZW" ]}
   }, (predictions, status) => {
     me.autocompleteItems = [];
   me.zone.run(() => {
     if (predictions != null) {
        predictions.forEach((prediction) => {
          me.autocompleteItems.push(prediction.description);
        });
       }
     });
   });
  }

 // Get nearby Restaurant with radius equal to 1000, you can adjust that
 getRestaurants(latLng){
    var service = new google.maps.places.PlacesService(this.map);
    let request = {
        location : latLng,
        radius : 1000 ,
        types: ["restaurant"]
    };
    return new Promise((resolve,reject)=>{
        service.nearbySearch(request,function(results,status){
            if(status === google.maps.places.PlacesServiceStatus.OK)
            {
                resolve(results);    
            }else
            {
                reject(status);
            }
        }); 
    });
}

// Get nearby Bank with radius equal to 8047, you can adjust that
getBanks(latLng){
  var service = new google.maps.places.PlacesService(this.map);
  let request = {
      location : latLng,
      radius : 1000 ,
      types: ["bank"]
  };
  return new Promise((resolve,reject)=>{
      service.nearbySearch(request,function(results,status){
          if(status === google.maps.places.PlacesServiceStatus.OK)
          {
              resolve(results);    
          }else
          {
              reject(status);
          }

      }); 
  });

}

// Get nearby Hospital with radius equal to 8047, you can adjust that
getHospital(latLng){
  var service = new google.maps.places.PlacesService(this.map);
  let request = {
      location : latLng,
      radius : 1000,
      types: ["hospital"]
  };
  return new Promise((resolve,reject)=>{
      service.nearbySearch(request,function(results,status){
          if(status === google.maps.places.PlacesServiceStatus.OK)
          {
              resolve(results);    
          }else
          {
              reject(status);
          }

      }); 
  });

}


}








