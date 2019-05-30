import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { FriendsProvider } from './friends';
import { RequestProvider } from './request';


@Injectable({
    providedIn: 'root'
  })
export class BlockProvider {

	constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, 
		public friendsProvider: FriendsProvider, public requestProvider: RequestProvider) {

  }

  // Block user function
  blockUser(userDetails){
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Block List').child(userDetails.Id).push({
  			Id: this.afAuth.auth.currentUser.uid
  		}).then(() => {
  			this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).push({
  				Id: userDetails.Id
  			}).then(() => {
  				this.friendsProvider.unFriend(userDetails).then(() => {
  					resolve(true)
  				}).catch((err) => {
  					reject(err)
  				})
  			})
  		})
  	})
  	return promise
  }

  // get all block user for current user
  getBlockList() {
  	var promise = new Promise((resolve, reject) => {
  		let Details = []
  		this.afDB.database.ref('users').once('value', snap => {
  			var res = snap.val()
  			let userDetails = []
  			for (var i in res) {
  				userDetails.push(res[i])
  			}
	  		this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).once('value', snap => {
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

  // unblock user from blocked user list
  unBlock(userDetails) {
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).orderByChild('Id').equalTo(userDetails.Id).once('value', snap => {
  			var res = snap.val()
  			let tempstore = Object.keys(res)
  			this.afDB.database.ref('Block List').child(this.afAuth.auth.currentUser.uid).child(tempstore[0]).remove().then(() => {
  				this.afDB.database.ref('Block List').child(userDetails.Id).orderByChild('Id').equalTo(this.afAuth.auth.currentUser.uid).once('value', snap => {
  					var res = snap.val()
  					let tempstore = Object.keys(res)
  					this.afDB.database.ref('Block List').child(userDetails.Id).child(tempstore[0]).remove().then(() => {
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











}