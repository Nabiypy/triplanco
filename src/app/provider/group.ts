import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from "firebase/app";
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

@Injectable({
    providedIn: 'root'
  })

export class GroupProvider {

  Groups = []
  groupDetails
  AllFriends = []
  groupMembers = []
  messages = []
  users = []
  userId;
  unread = 0;

  constructor(public geolocation: Geolocation, public afAuth: AngularFireAuth, public afDB: AngularFireDatabase, public evente: Events) {

  }

  initialize(groupDetails) {
  	this.groupDetails = groupDetails
  }


  createGroup(groupDetails){
    // Create group function with group details
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('hhhh').push({
  			key : "ket"
  		}).then((snap) => {
  			var key = snap.key
  			this.afDB.database.ref('hhhh').child(key).remove().then(() => {
  				this.afDB.database.ref('Groups').child(this.afAuth.auth.currentUser.uid).child(key).set({
  					Owner: this.afAuth.auth.currentUser.uid,
            Key: key,
            Name: groupDetails.Name,
            Picture: groupDetails.Picture,
            description: groupDetails.description,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
  				}).then(() => {
  					this.afDB.database.ref('Groups').child(this.afAuth.auth.currentUser.uid).child(key).child('Members').push({
  						Id: this.afAuth.auth.currentUser.uid
  					}).then(() => {
  						resolve(true)
  					})
  				})
  			}).catch((err) => {
  				reject(err)
  			})
  		})
  	})
  	return promise
  }

  getGroups(){
    // current user get all group list that has the user id
    firebase.auth().onAuthStateChanged( user => {
      if (user) { this.userId = user.uid }
    console.log("UID: "+ this.userId);
     firebase.database().ref('Groups').child(this.userId).on('value', snap => {
        this.Groups = []
        var res = snap.val()
        for (var i in res){
          this.Groups.push(res[i])
        }
        this.evente.publish('Groups')
      }) 
    })   
  }


  getAllFriends(groupDetails) {
      // get all friends to be added to the group
  		this.afDB.database.ref('users').on('value', snap => {
  			var res = snap.val()
  			let userDetails = []
  			for (var i in res) {
  				userDetails.push(res[i])
  			}
	  		this.afDB.database.ref('Friends').child(this.afAuth.auth.currentUser.uid).on('value', snap => {
	  			var res = snap.val()
	  			let array = []
	  			for (var i in res) {
	  				array.push(res[i])
	  			}

	  			this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').on('value', snap => {
            this.AllFriends = []
	  				var res = snap.val()
		  			let array1 = []
		  			for (var io in res) {
		  				array1.push(res[io])
		  			}

	  				for( var bb = array.length - 1; bb >= 0; bb--){
						for( var cc = 0; cc < array1.length; cc++){
							if(array[bb].Id === array1[cc].Id){
								array.splice(bb, 1);
							}
						}
					}

			  		for (var c in array) {
		  				for (var d in userDetails) {
		  					if (array[c].Id === userDetails[d].Id) {
		  						this.AllFriends.push(userDetails[d]);
		  					}
		  				}
		  			}

            this.evente.publish('AllFriends')

	  			})
	  		})
  		})
  }



  addMember(userDetails, groupDetails) {
    // Add member to the group 
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').push({
  			Id: userDetails.Id
  		}).then(() => {
  			this.afDB.database.ref('Groups').child(userDetails.Id).child(groupDetails.Key).set(groupDetails).then(() => {
  				this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').once('value', snap => {
  					var res = snap.val()
            for(var i in res) {
              this.afDB.database.ref('Groups').child(res[i].Id).child(groupDetails.Key).child('Members').set(res).then(() => {
                
                this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Chats').once('value', snap => {
                  var res1 = snap.val()
                  this.afDB.database.ref('Groups').child(userDetails.Id).child(groupDetails.Key).child('Chats').set(res1).then(() => {
                    resolve(true)
                  }).catch((err) => {
                    reject(err)
                  })
                }).catch((err) => {
                  reject(err)
                })

                
              })
            }
  				}).catch((err) => {
  					reject(err)
  				})
  			})
  		})
  	})
  	return promise
  }


  deleteGroup(groupDetails){
    // Delete group by group owner
  	var promise = new Promise((resolve, reject) => {
  		this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').once('value', snap => {
  			var res = snap.val()
  			for (var i in res) {
	  			this.afDB.database.ref('Groups').child(res[i].Id).child(groupDetails.Key).remove().then(() => {
	  				resolve(true)
	  			}).catch((err) => {
	  				reject(err)
	  			})  				
  			}
  		}).catch((err) => {
  			reject(err)
  		})
  	})
  	return promise
  }


  leaveGroup(groupDetails){
    // user leave group function
    var promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').once('value', snap => {
        var res = snap.val()
        this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').orderByChild('Id').equalTo(this.afAuth.auth.currentUser.uid).once('value', snapshot => {
          var res1 = snapshot.val()
          var temp = Object.keys(res1)
          for (var i in res) {
            this.afDB.database.ref('Groups').child(res[i].Id).child(groupDetails.Key).child('Members').child(temp[0]).remove().then(() => {
              this.afDB.database.ref('Groups').child(this.afAuth.auth.currentUser.uid).child(groupDetails.Key).remove().then(() => {
                resolve(true)
              }).catch((err) => {
                reject(err)
              })
            }).catch((err) => {
              reject(err)
            })
          }
        }).catch((err) => {
          reject(err)
        })
      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }


  getGroupMembers(groupDetails) {
      // Get all group members
      this.afDB.database.ref('users').on('value', snap => {
        this.groupMembers = []
        var res = snap.val()
        let userDetails = []
        for (var i in res) {
          userDetails.push(res[i])
        }
        this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').on('value', snap => {
          this.groupMembers = []
          var res = snap.val()
          let array = []
          for (var i in res) {
            array.push(res[i])
          } 

          for(var ia in userDetails) {
            for (var ii in array) {
              if (userDetails[ia].Id === array[ii].Id) {
                this.groupMembers.push(userDetails[ia])
              }
            }
          }

          this.evente.publish('GroupMembers')

        })

      })
  }



  deleteMember(userDetails, groupDetails){
    // Delete member from the group
    var promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').once('value', snap => {
        var res = snap.val()

        this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').orderByChild('Id').equalTo(userDetails.Id).once('value', snapshot => {
          var res1 = snapshot.val()
          var temp = Object.keys(res1)

          for(var i in res) {
            this.afDB.database.ref('Groups').child(res[i].Id).child(groupDetails.Key).child('Members').child(temp[0]).remove().then(() => {
              this.afDB.database.ref('Groups').child(userDetails.Id).child(groupDetails.Key).remove().then(() => {
                resolve(true)
              }).catch((err) => {
                reject(err)
              })
            }).catch((err) => {
              reject(err)
            })
          }

        }).catch((err) => {
          reject(err)
        })

      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }


  sendMessage(messageDetails, groupDetails, type) {
    // send message in the group
    var promise = new Promise((resolve, reject) => {
      this.afDB.database.ref('Groups').child(groupDetails.Owner).child(groupDetails.Key).child('Members').once('value', snap => {
        var res = snap.val()

        this.afDB.database.ref('dsad').push({
          Id: 'fasdf'
        }).then((snapshot) => {
          var key = snapshot.key

          for (var i in res) {
            this.afDB.database.ref('Groups').child(res[i].Id).child(groupDetails.Key).child('Chats').child(key).set({
              message : messageDetails,
              Id: this.afAuth.auth.currentUser.uid,
              Time: firebase.database.ServerValue.TIMESTAMP,
              Key: key,
              type: type,
              timestamp: firebase.database.ServerValue.TIMESTAMP,
              unread: ++this.unread
            }).then(() => {
              this.afDB.database.ref('dsad').child(key).remove().then(() => {
                resolve(true)
              }).catch((err) => {
                reject(err)
              })
            })
          }

        })

      }).catch((err) => {
        reject(err)
      })
    })
    return promise
  }

  

  // Get all group messages
  getAllMessages() {
    let array1 = []

    this.afDB.database.ref('Groups').child(this.afAuth.auth.currentUser.uid).child(this.groupDetails.Key).child('Chats').on('value', snap => {
      this.messages = []
      array1 = []
      var res = snap.val()
      for(var i in res) {
        this.messages.push(res[i])
        array1.push(res[i].Id)
      }
      this.users = []
      this.afDB.database.ref('users').once('value', snapshot => {
        var res = snapshot.val()
        let array = []
        for (var a in res) {
          array.push(res[a])
        }

        for(var c in array1) {
          for (var d in array) {
            if(array1[c] === array[d].Id) {
              this.users.push(array[d])
            }
          }
        }

        this.evente.publish('Messages')

      })
    })
  }

  getLocation(): Promise<Geoposition> {
    console.log('get location');
    return this.geolocation.getCurrentPosition();
  }



}