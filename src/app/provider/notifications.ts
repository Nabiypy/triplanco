import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from "firebase/app";


@Injectable({
    providedIn: 'root'
  })
export class NotificationsProvider {

  NotificationsUnread = [];
  buddyUsersUnread = [];
  NotificationsRead = [];
  buddyUsersRead = [];

  constructor(public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public evente: Events) {
  }

  getMyNotificationsUnread() {
    // Get all unread notifications
     this.afDB.database.ref('Notifications').child(this.afAuth.auth.currentUser.uid).child('unread').on('value', snap => {
        this.NotificationsUnread = [];

        var res = snap.val();
        var array1 = [];
        for (var i in res) {
          this.NotificationsUnread.push(res[i])
          array1.push(res[i].Id);
        }
		this.afDB.database.ref('users').on('value', snap => {
          this.buddyUsersUnread = [];

          var res = snap.val();
          var array = [];
          for (var i in res) {
            array.push(res[i]);
          }
            
          for(var d in array1) {
            for(var c in array) {
              if(array[c].Id === array1[d]) {
                this.buddyUsersUnread.push(array[c])
              }              
            }
          }
          this.evente.publish('Notifications');
        });
      });
  }

  getMyNotificationsRead() {
    // Get all read notifications
     this.afDB.database.ref('Notifications').child(this.afAuth.auth.currentUser.uid).child('read').on('value', snap => {
        this.NotificationsRead = []

        var res = snap.val()
        var array1 = []
        for (var i in res) {
          this.NotificationsRead.push(res[i])
          array1.push(res[i].Id)
        }

		this.afDB.database.ref('users').on('value', snap => {
          this.buddyUsersRead = []

          var res = snap.val()
          var array = []
          for (var i in res) {
            array.push(res[i])
          }
            
          for(var d in array1) {
            for(var c in array) {
              if(array[c].Id === array1[d]) {
                this.buddyUsersRead.push(array[c])
              }              
            }
          }
          this.evente.publish('Notifications')

        })
      })    
  }

  pushNotification(userDetails, notificationDetails) {
    // push notification unread to notification list
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('dsa').push({
  			Id: 'fdf'
  		}).then((snap) => {
  			var key = snap.key

	  		this.afDB.database.ref('Notifications').child(userDetails.Id).child('unread').child(key).set({
	  			Type: notificationDetails.Type,
	  			Id: this.afAuth.auth.currentUser.uid,
          Key: key,
          time: firebase.database.ServerValue.TIMESTAMP
	  		}).then(() => {
	  			this.afDB.database.ref('dsa').child(key).remove().then(() => {
	  				resolve(true)
	  			}).catch((err) => {
	  				reject(err)
	  			})
	  		})


  		})
  	})
  	return promise
  }


  makeNotificationAsRead(notificationDetails) {
    // make unread notification to read
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Notifications').child(this.afAuth.auth.currentUser.uid).child('read').child(notificationDetails.Key).set(notificationDetails).then(() => {
  			this.afDB.database.ref('Notifications').child(this.afAuth.auth.currentUser.uid).child('unread').child(notificationDetails.Key).remove().then(() => {
  				resolve(true)
  			}).catch((err) => {
  				reject(err)
  			})
  		})
  	})
  	return promise
  }





}