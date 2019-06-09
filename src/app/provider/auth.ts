import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import { ChatProvider } from './chat';
import { GeoFire } from 'geofire';

@Injectable({
    providedIn: 'root'
  })
export class AuthProvider {

  ProfileDetails;
  myDetails;
  userList: any;
  isLoggedIn = false;
  geoRef = firebase.database().ref('geo/');
  lat;
  long;


  constructor(public chatProvider: ChatProvider, public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public evente: Events) {
    this.userList = firebase.database().ref('/users' );
  }

  // Get all the details of the user for both current user and friend
  getUserDetails() {
    const promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
        const res = snap.val();
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

 // User can update their profile details
  updateProfile(userDetails) {
    const promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).update({
        Name: userDetails.Name,
        Phone: userDetails.Phone,
        about: userDetails.about,
      }).then(() => {
        resolve(true);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

// Get user details by id
  getMyDetails() {
      this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).on('value', snap => {
        this.myDetails;
        this.myDetails = snap.val();
        this.evente.publish('myDetails');
      });
  }

// Get user profile details from other users
  getProfileDetails(userDetails) {
      this.afDB.database.ref('users').child(userDetails.Id).on('value', snap => {
        this.ProfileDetails;
        this.ProfileDetails = snap.val();

        this.evente.publish('ProfileDetails');
      });
  }

// Upload profile picture
  uploadProfilePhoto(picURL) {
    const promise = new Promise((resolve, reject) => {
      firebase.storage().ref('Profile Picture').child(this.afAuth.auth.currentUser.uid + '.jpg').putString(picURL, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).update({
            Photo: downloadURL
          }).then(() => {
            resolve(true);
          }).catch((err) => {
            reject(err);
          });
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

// Upload Background picture
  uploadCover(picURL) {
    const promise = new Promise((resolve, reject) => {
      firebase.storage().ref('Covers').child(this.afAuth.auth.currentUser.uid + '.jpg').putString(picURL, firebase.storage.StringFormat.DATA_URL).then((snapshot) => {
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).update({
            bgPhoto: downloadURL
          }).then(() => {
            resolve(true);
          }).catch((err) => {
            reject(err);
          });
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

 // Login function with email and password
  login(userDetails) {
  	const promise = new Promise((resolve, reject) => {
  		this.afAuth.auth.signInWithEmailAndPassword(userDetails.Email, userDetails.Password).then(() => {
  			resolve(true);
  		}).catch((err) => {
  			reject(err);
  		});
  	});
  	return promise;
  }

   // Login function for guest
   loginAsGuest() {
     const promise  = new Promise((resolve, reject) => {
      this.afAuth.auth.signInAnonymously().then(() => {
        resolve(true);
      }).catch((error) => {
        reject(error);
      });
     });
     return promise;
  }

// Forgot password function
  forgetPassword(userDetails) {
  	const promise = new Promise((resolve, reject) => {
  		this.afAuth.auth.sendPasswordResetEmail(userDetails.Email).then(() => {
  			resolve(true);
  		}).catch((err) => {
  			reject(err);
  		});
  	});
  	return promise;
  }

  // Users  register with their email, password and details
    register(userDetails) {
  	const promise = new Promise((resolve, reject) => {
      this.chatProvider.getLocation().then((data) => {
        this.lat = data.coords.latitude,
        this.long = data.coords.longitude,
  		this.afAuth.auth.createUserWithEmailAndPassword(userDetails.Email, userDetails.Password).then(() => {
  			this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).set({
  		    Name: userDetails.Name,
          Email: userDetails.Email,
          Mobile: userDetails.Mobile,
          Id: this.afAuth.auth.currentUser.uid,
          lat: this.lat,
          long: this.long,
          notifications: true,
          sound: true,
          distance: '',
          Status: 'Online',
          about: 'Hey there! I\'m using Triplanco mobile app.',
          Cover: 'assets/imgs/cover.png',
          Photo: 'https://firebasestorage.googleapis.com/v0/b/chat-app-f6a12.appspot.com/o/user.png?alt=media&token=79419e48-423a-42c3-92b2-16027651b931'
  			}).then(() => {
          this.chatProvider.getLocation().then((data) => {
            console.log('locationServices >>>');
            const geoFire = new GeoFire(this.geoRef);
            const geoRef = geoFire.ref;
            geoFire.set(this.afAuth.auth.currentUser.uid, [data.coords.latitude, data.coords.longitude]).then(() => {
            resolve(true);
            });
          });
  			}).catch((err) => {
  				reject(err);
  			});
  		}).catch((err) => {
  			reject(err);
  		});
    });
  });
  	return promise;
  }

  // Users register with annimosity
  registerGuest() {
  	const promise = new Promise((resolve, reject) => {
      this.chatProvider.getLocation().then((data) => {
        this.lat = data.coords.latitude,
        this.long = data.coords.longitude,
        this.afAuth.auth.signInAnonymously().then(() => {
  			this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).set({
  		    Name: 'Anonymous',
          Email: 'Null',
          Mobile: 'Null',
          Id: this.afAuth.auth.currentUser.uid,
          lat: this.lat,
          long: this.long,
          notifications: false,
          sound: true,
          distance: '',
          Status: 'Online',
          about: 'Hey there! I\'m a Triplanco fun and a Guest',
          Cover: 'assets/imgs/cover.png',
          Photo: 'https://firebasestorage.googleapis.com/v0/b/chat-app-f6a12.appspot.com/o/user.png?alt=media&token=79419e48-423a-42c3-92b2-16027651b931'
  			}).then(() => {
          this.chatProvider.getLocation().then((data) => {
            console.log('locationServices >>>');
            const geoFire = new GeoFire(this.geoRef);
            const geoRef = geoFire.ref;
            geoFire.set(this.afAuth.auth.currentUser.uid, [data.coords.latitude, data.coords.longitude]).then(() => {
            resolve(true);
            });
          });
  			}).catch((err) => {
  				reject(err);
  			});
  		}).catch((err) => {
  			reject(err);
  		});
    });
  });
  	return promise;
  }

 // logout function
  logOut() {
  	const promise = new Promise((resolve, reject) => {
  		this.afAuth.auth.signOut().then(() => {
  			resolve(true);
  		}).catch((err) => {
  			reject(err);
  		});
  	});
  	return  promise;
  }

// update online status
  onlineStatus() {
    const promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).update({
        Status: 'Online'
      }).then(() => {
        resolve(true);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

// update offline status
  offlineStatuss() {
    const promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid).update({
        Status: 'Offline'
      }).then(() => {
        resolve(true);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  // Dynamic update offline status
  offlineStatus() {
    const promise = new Promise((resolve, reject) => {
      const ref = this.afDB.database.ref('users').child(this.afAuth.auth.currentUser.uid);
      ref.onDisconnect().update({
        Status: 'Offline'
      }).then(() => {
        resolve(true);
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  saveUserProfile(Name: String, about: String, id: any) {
    return this.userList.child(id).update({
      Name: Name,
      about: about,
    });
  }

  // Get user by their userId
  getUser(userId) {
    return this.userList.child(userId);
  }


  // Get logged in user data
  getCurrentUser() {
    return this.afDB.object(
      '/users/' + firebase.auth().currentUser.uid
    );
  }



}
