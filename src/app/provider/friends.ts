import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from "firebase/app";


@Injectable({
    providedIn: 'root'
  })
export class FriendsProvider {

	Friends = []
  constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public evente: Events) {

  }


 // Get all friends list 
  getAllFriends() {
  	var promise = new Promise((resolve, reject) => {
  		let Details = []
  		this.afDB.database.ref('users').once('value', snap => {
  			var res = snap.val()
  			let userDetails = []
  			for (var i in res) {
  				userDetails.push(res[i])
  			}
	  		this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
	  			var res = snap.val()
	  			let array = []
	  			for (var i in res) {
	  				array.push(res[i])
	  			}

	  			for(var ia in userDetails) {
	  				for (var ii in array) {
	  					if (userDetails[ia].Id === array[ii].Id) {
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


	// Get all firends list that belong to current user
	getAllUserFriends(userId) {
		this.afDB.database.ref('users').on('value', snap => {
			var res = snap.val()
			let userDetails = []
			for (var i in res) {
				userDetails.push(res[i])
			}
			this.afDB.database.ref('Friends').child(userId).on('value', snap => {
				this.Friends = []
				var res = snap.val()
				let array = []
				for (var i in res) {
					array.push(res[i])
				}

				for(var ia in userDetails) {
					for (var ii in array) {
						if (userDetails[ia].Id === array[ii].Id) {
							this.Friends.push(userDetails[ia])
						}
					}
				}

				this.evente.publish('Friends')

			})
		})    
  }

 // get all friends details that belong to current user
  getFriends(){
      this.afDB.database.ref('users').on('value', snap => {
        
        var res = snap.val()
        let userDetails = []
        for (var i in res) {
          userDetails.push(res[i])
        }
        this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).on('value', snap => {
          this.Friends = []
          var res = snap.val()
          let array = []
          for (var i in res) {
            array.push(res[i])
          }

          for(var ia in userDetails) {
            for (var ii in array) {
              if (userDetails[ia].Id === array[ii].Id) {
                this.Friends.push(userDetails[ia])
              }
            }
          }

          this.evente.publish('Friends')

        })
      })    
  }


 // unfriend current user friend from Friends List
  unFriend(userDetails) {
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).orderByChild('Id').equalTo(userDetails.Id).once('value', snap => {
  			var res = snap.val()
  			let tempstore = Object.keys(res)
  			this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).child(tempstore[0]).remove().then(() => {
  				this.afDB.database.ref('Friends').child(userDetails.Id).orderByChild('Id').equalTo(this.afAuth.auth.currentUser.uid).once('value', snap => {
  					var res = snap.val()
  					let tempstore = Object.keys(res)
  					this.afDB.database.ref('Friends').child(userDetails.Id).child(tempstore[0]).remove().then(() => {
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
  		}).catch((err) => {
  			reject(err)
  		})
  	})
  	return promise
  }



// Get all friends list 
getAllFriendsOnline() {
	var promise = new Promise((resolve, reject) => {
		let Details = []
		let ref = firebase.database().ref("users");
		ref.orderByChild("Status").equalTo('Online').once("value", snap => {
	//	this.afDB.database.ref('users').once('value', snap => {
			var res = snap.val()
			let userDetails = []
			for (var i in res) {
				userDetails.push(res[i])
			}
			this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
				var res = snap.val()
				let array = []
				for (var i in res) {
					array.push(res[i])
				}

				for(var ia in userDetails) {
					for (var ii in array) {
						if (userDetails[ia].Id === array[ii].Id) {
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













}