import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthProvider } from './auth';
import { NotificationsProvider } from './notifications';
import * as firebase from 'firebase/app';

@Injectable({
    providedIn: 'root'
  })
export class RequestProvider {


    myDetails

  constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public authProvider: AuthProvider, 
    public notificationProvider: NotificationsProvider) {
			
  }

	// Get requests given the userId.
	getRequests(userId) {
		return this.afDB.object("/Requests/" + userId);
	}

	// Get sent friend request
  getSentRequests() {
  	var promise = new Promise((resolve, reject) => {
  		let Details = []
  		this.afDB.database.ref('users').once('value', snap => {
  			var res = snap.val()
  			let userDetails = []
  			for (var i in res) {
  				userDetails.push(res[i])
  			}
	  		this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Sent Requests').once('value', snap => {
	  			var res = snap.val()
	  			let sentArray = []
	  			for (var i in res) {
	  				sentArray.push(res[i])
	  			} 

	  			for(var ia in userDetails) {
	  				for (var ii in sentArray) {
	  					if (userDetails[ia].Id === sentArray[ii].Id) {
	  						Details.push(userDetails[ia])
	  					}
	  				}
	  			}

	  			resolve(Details)
	  		}).catch((err) => {
	  			reject(err)
	  		})

  		}).catch((err) => {
  			reject(err)
  		})
  	})
  	return promise
  }

// Get friend request
  getReceivedRequests() {
  	var promise = new Promise((resolve, reject) => {
  		let Details = []
  		this.afDB.database.ref('users').once('value', snap => {
  			var res = snap.val()
  			let userDetails = []
  			for (var i in res) {
  				userDetails.push(res[i])
  			}
	  		this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Received Requests').once('value', snap => {
	  			var res = snap.val()
	  			let receivedArray = []
	  			for (var i in res) {
	  				receivedArray.push(res[i])
	  			} 
	  			for(var ia in userDetails) {
	  				for (var ii in receivedArray) {
	  					if (userDetails[ia].Id === receivedArray[ii].Id) {
	  						Details.push(userDetails[ia])
	  					}
	  				}
	  			}

	  			resolve(Details)
	  			resolve()
	  		}).catch((err) => {
	  			reject(err)
	  		})

  		}).catch((err) => {
  			reject(err)
  		})
  	})
  	return promise	
  }



// Snd friend request to friend
  makeRequest(userDetails) {    
    var notificationDetails = {
      Type: 'Request'
    }

  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Sent Requests').push({
  			Id: userDetails.Id
  		}).then(() => {
  			this.afDB.database.ref('Requests').child(userDetails.Id).child('Received Requests').push({
  				Id: this.afAuth.auth.currentUser.uid
  			}).then(() => {
  				
          this.notificationProvider.pushNotification(userDetails, notificationDetails).then(() => {
            resolve(true)
          }).catch((err) => {
            reject(err)
          })
  			})
  		})
  	})
  	return promise
  }

// Delete sent firend request function
  deleteSentRequest(userDetails) {
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Sent Requests').orderByChild('Id').equalTo(userDetails.Id).once('value', snap => {
  			var res = snap.val()
  			let tempstore = Object.keys(res)
  			this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Sent Requests').child(tempstore[0]).remove().then(() => {
  				this.afDB.database.ref('Requests').child(userDetails.Id).child('Received Requests').orderByChild('Id').equalTo(this.afAuth.auth.currentUser.uid).once('value', snap => {
  					var res = snap.val()
  					let tempstore = Object.keys(res)
  					this.afDB.database.ref('Requests').child(userDetails.Id).child('Received Requests').child(tempstore[0]).remove().then(() => {
  						resolve(true)
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
  	})
  	return promise
  }

 // Delete friend Request function
  deleteReceivedRequest(userDetails) {
    var promise = new Promise((resolve, reject) => {
         this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Received Requests').orderByChild('Id').equalTo(userDetails.Id).once('value', snap => {
           var res = snap.val()
            let tempstore = Object.keys(res)
            this.afDB.database.ref('Requests').child(this.afAuth.auth.currentUser.uid).child('Received Requests').child(tempstore[0]).remove().then(() => {
              this.afDB.database.ref('Requests').child(userDetails.Id).child('Sent Requests').orderByChild('Id').equalTo(this.afAuth.auth.currentUser.uid).once('value', snap => {
                var res = snap.val()
                let tempstore = Object.keys(res)
                this.afDB.database.ref('Requests').child(userDetails.Id).child('Sent Requests').child(tempstore[0]).remove().then(() => {
                  resolve(true)
                }).catch((err) => {
                  reject(err)
                })
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

 // Accept friend request
  acceptRquest(userDetails) {
    var notificationDetails = {
      Type: 'Friend'
    }
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Friends').child(userDetails.Id).push({
  			Id: this.afAuth.auth.currentUser.uid
  		}).then(() => {
  			this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).push({
  				Id: userDetails.Id
  			}).then(() => {

          this.deleteReceivedRequest(userDetails).then(() => {
            
            this.notificationProvider.pushNotification(userDetails, notificationDetails).then(() => {
              resolve(true)
            }).catch((err) => {
              reject(err)
            })
          }).catch((err) => {
            reject(err)
          })

  			})
  		})
  	})
  	return promise
  }

// when current user send friend request to user, it can be block and move to block list
  blockSentRequest(userDetails) {
    var promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('Block List').child(userDetails.Id).push({
        Id: this.afAuth.auth.currentUser.uid
      }).then(() => {
        this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).push({
          Id: userDetails.Id
        }).then(() => {
          this.deleteSentRequest(userDetails).then(() => {
            resolve(true)
          }).catch((err) => {
            reject(err)
          })
        })
      })
    })
    return promise
  }

	// when user send friend request to current user, it can block and move to block list
  blockReceivedRequest(userDetails) {
    var promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('Block List').child(userDetails.Id).push({
        Id: this.afAuth.auth.currentUser.uid
      }).then(() => {
        this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).push({
          Id: userDetails.Id
        }).then(() => {
          this.deleteReceivedRequest(userDetails).then(() => {
            resolve(true)
          }).catch((err) => {
            reject(err)
          })
        })
      })
    })
    return promise
  }
}