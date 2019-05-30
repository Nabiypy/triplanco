import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from "firebase/app";
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { SpinnerDialog } from '@ionic-native/spinner-dialog/ngx';
import { AuthProvider } from './auth';


@Injectable({
    providedIn: 'root'
  })

export class UsersProvider {


  private profilePhotoOptions: CameraOptions;
  user: any;
  public id: any;
  private coverPhotoOptions: CameraOptions;

  constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase,  public authProvider: AuthProvider, public camera: Camera, public spinnerDialog: SpinnerDialog) {
		
    firebase.auth().onAuthStateChanged( user => {
      if (user) {
       // console.log(user)
        this.user = user;
        //console.log(this.user)
        this.id = this.user.uid;
      }
    })
   
  }


  getAllUsers(){
		// get current user with all child
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('users').once('value', snap => {
  			var res = snap.val()
  			let array = []

  			for(var i in res) {
  				array.push(res[i])
  			}
  			for (var aa = array.length - 1; aa >= 0; aa--) {
  				if (array[aa].Id === this.afAuth.auth.currentUser.uid) {
  					array.splice(aa, 1)
  				}
				}
				// sent request is push and return in an array in user request child
  			this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Sent Requests').once('value', snap => {
  				var res = snap.val()
  				let array2 = []
  				for(var i in res) {
  					array2.push(res[i])
  				}

          for (var aa = array.length - 1; aa >= 0; aa--) {
            for(var bb = 0; bb < array2.length; bb++){
              if(array[aa].Id === array2[bb].Id){
                array.splice(aa, 1)
              }
            }
					}
					// Received request is push and return in an array in user request child
	  			this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Received Requests').once('value', snap => {
	  				var res = snap.val()
	  				let array3 = []
	  				for(var i in res) {
	  					array3.push(res[i])
	  				}

            for (var aa = array.length - 1; aa >= 0; aa--) {
	  				  for (var bb = array3.length - 1; bb >= 0; bb--) {
	  						if(array[aa].Id === array3[bb].Id){
	  							array.splice(aa, 1)
	  						}
	  					}
	  				}
          // Friends list is push and return in an array in user child
	  				this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
		  				var res = snap.val()
		  				let array4 = []
		  				for(var i in res) {
		  					array4.push(res[i])
		  				}

		  				for (var aa = array.length - 1; aa >= 0; aa--) {
		  					for(var bb = 0; bb < array4.length; bb++){
		  						if(array[aa].Id === array4[bb].Id){
		  							array.splice(aa, 1)
		  						}
		  					}
		  				}	
             // Block list is push and return in an array in user block child
              this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
                var res = snap.val()
                let array5 = []
                for(var i in res) {
                  array5.push(res[i])
                }

                for (var aa = array.length - 1; aa >= 0; aa--) {
                  for(var bb = 0; bb < array5.length; bb++){
                    if(array[aa].Id === array5[bb].Id){
                      array.splice(aa, 1)
                    }
                  }
                }  

                resolve(array)
              }).catch((err) => {
                reject(err)
              })
	  				}).catch((err) => {
	  					reject(err)
	  				})

	  			}).catch((err) => {
	  				reject(err)
	  			})

  			}).catch((err) => {
  				reject(err)
  			})

  		}).catch((err) => {
  			reject(err)
  		})
  	})
  	return promise
	}

	  
	 // Function to convert dataURI to Blob needed by Firebase
	 imgURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {
      type: mimeString
    });
  }


 // Get user by their userId
 getUser(userId) {
  return this.afDB.object("/users/" + userId);
}


}


 


