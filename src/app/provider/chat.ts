import { Injectable } from '@angular/core';
// import * as firebase from 'Firebase';
import * as firebase from 'firebase/app';
import { Events } from '@ionic/angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import { AngularFireDatabase } from 'angularfire2/database';


declare var window: any;

@Injectable({
  providedIn: 'root'
})

export class ChatProvider {
  chatsList = firebase.database().ref('/Chat');
  conversationList = firebase.database().ref('/Coversations');
  userList = firebase.database().ref('/users');
  friend: any;
  friendmessages = [];
  Conversations = [];
  allFriend = [];
  unread = 0;
  conversationId;

  constructor(public events: Events, public geolocation: Geolocation, public afDB: AngularFireDatabase) {

  }

  resultsList: any;

  initializebuddy(friend) {
    this.friend = friend;
  }

  // send message
  addnewmessage(msg, type) {
    var promise = new Promise((resolve, reject) => {
      // let timestamp = firebase.database.ServerValue.TIMESTAMP
      this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).push({
        Id: firebase.auth().currentUser.uid,
        message: msg,
        type: type,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      }).then((snap) => {
        var key = snap.key
        this.chatsList.child(this.friend.Id).child(firebase.auth().currentUser.uid).child(key).set({
          Id: firebase.auth().currentUser.uid,
          message: msg,
          type: type,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          Key: key
        }).then(() => {
          this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).child(key).update({
            Key: key
          }).then(() => {
           
            this.conversationList.child(firebase.auth().currentUser.uid).orderByChild('Id').equalTo(this.friend.Id).once('value', snapshot => {
              var res = snapshot.val()

              if (res != null){
                var store = Object.keys(res)
                this.conversationList.child(firebase.auth().currentUser.uid).child(store[0]).remove().then(() => {
                  this.conversationList.child(firebase.auth().currentUser.uid).push({
                    Id: this.friend.Id,
                    message: msg,
                    type: type,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                    //unread: ++this.unread
                  }).then( newConversation => {
                    this.conversationList.child(firebase.auth().currentUser.uid).child(newConversation.key).child('convId').set(newConversation.key);
                    this.conversationList.child(this.friend.Id).orderByChild('Id').equalTo(firebase.auth().currentUser.uid).once('value', snapshot => {
                      var res = snapshot.val()

                      if (res != null) {
                        let store = Object.keys(res)
                         this.conversationList.child(this.friend.Id).child(store[0]).remove().then(() => {
                          this.conversationList.child(this.friend.Id).push({
                            Id: firebase.auth().currentUser.uid,
                            message: msg,
                            type: type,
                            timestamp: firebase.database.ServerValue.TIMESTAMP,
                            unread: ++this.unread
                          }).then(newConversation => {
                            this.conversationList.child(this.friend.Id).child(newConversation.key).child('convId').set(newConversation.key);
                            resolve(true)
                          })
                         }).catch((err) => {
                           reject(err)
                         })
                      } else {
                        this.conversationList.child(this.friend.Id).push({
                          Id: firebase.auth().currentUser.uid,
                          message: msg,
                          type: type,
                          timestamp: firebase.database.ServerValue.TIMESTAMP,
                          unread: ++this.unread
                        }).then(newConversation => {
                          this.conversationList.child(this.friend.Id).child(newConversation.key).child('convId').set(newConversation.key);
                          resolve(true);
                        });
                      }

                    }).catch((err) => {
                      reject(err);
                    });
                  });
                }).catch((err) => {
                  reject(err);
                });

              } else {
                this.conversationList.child(firebase.auth().currentUser.uid).push({
                  Id: this.friend.Id,
                  message: msg,
                  type: type,
                  timestamp: firebase.database.ServerValue.TIMESTAMP
                }).then(newConversation => {
                  this.conversationList.child(firebase.auth().currentUser.uid).child(newConversation.key).child('convId').set(newConversation.key);
                  this.conversationList.child(this.friend.Id).orderByChild('Id').equalTo(this.friend.Id).once('value', snapshot => {
                    var res = snapshot.val();

                    if (res != null) {
                      let store = Object.keys(res);
                      this.conversationList.child(this.friend.Id).child(store[0]).remove().then(() => {
                        this.conversationList.child(this.friend.Id).push({
                          Id: firebase.auth().currentUser.uid,
                          message: msg,
                          type: type,
                          timestamp: firebase.database.ServerValue.TIMESTAMP,
                          unread: ++this.unread
                        }).then(newConversation => {
                         this.conversationList.child(this.friend.Id).child(newConversation.key).child('convId').set(newConversation.key);
                          resolve(true);
                        });
                      }).catch((err) => {
                        reject(err);
                      });
                    } else {
                      this.conversationList.child(this.friend.Id).push({
                        Id: firebase.auth().currentUser.uid,
                        message: msg,
                        type: type,
                        timestamp: firebase.database.ServerValue.TIMESTAMP,
                        unread: ++this.unread
                      }).then( newConversation => {
                         this.conversationList.child(this.friend.Id).child(newConversation.key).child('convId').set(newConversation.key);
                          resolve(true);
                        });
                    }

                  }).catch((err) => {
                    reject(err);
                  });
                });
              }

            }).catch((err) => {
              reject(err);
            });

          }).catch((err) => {
            reject(err);
          });
        });
      });
    });
    return promise;
  }

// get my friends messages
  getbuddymessages() {
    let temp;
    this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).on('value', (snapshot) => {
      this.friendmessages = [];
      temp = snapshot.val();
      for (var tempkey in temp) {
        this.friendmessages.push(temp[tempkey]);
      }
      this.events.publish('newmessage');

    });
  }


  deleteConverstion(key: any) {
    this.conversationList.child(firebase.auth().currentUser.uid).child(key).remove();
  }

  // get conversation between user and current user
  getConversations() {
    this.conversationList.child(firebase.auth().currentUser.uid).on('value', snap => {
      this.Conversations = [];
      // this.conversationId = snap.val().key
      var res = snap.val();
      var array1 = [];
      for (var i in res) {
        this.Conversations.push(res[i])
        this.Conversations;
        array1.push(res[i].Id);
      }

      this.userList.on('value', snap => {
          this.allFriend = [];

          var res = snap.val();
          var array = [];
          for (var i in res){
            array.push(res[i]);
          }
            
            array1.reverse();
            
          for(var d in array1) {
            for(var c in array){
              if(array[c].Id === array1[d]) {
                this.allFriend.push(array[c])
                this.allFriend
              }              
            }
          }

          this.events.publish('Conversations');

        });
      });
  }

// Delete message for me, when this function is callled only the current user will not see the message again
  deleteMessageForMe(message) {
    var promise = new Promise((resolve, reject) => {
      this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).child(message.Key).remove().then(() => {
        this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).limitToLast(1).once('value', snap => {
          var res = snap.val();
          this.conversationList.child(firebase.auth().currentUser.uid).orderByChild('Id').equalTo(this.friend.Id).once('value', snapshot => {
            var res1 = snapshot.val();
            var temp = Object.keys(res1);

              for(var i in res){
                this.conversationList.child(firebase.auth().currentUser.uid).child(temp[0]).update({
                  message: res[i].message,
                  timestamp: res[i].timestamp
                }).then(() => {
                  resolve(true)
                })
              }

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

 // Delete my message for all user, when this function is called both current user and friend will no longer see message
  deleteMessageForAll(message) {
    var promise = new Promise((resolve, reject) => {
      this.chatsList.child(firebase.auth().currentUser.uid).child(this.friend.Id).child(message.Key).remove().then(() => {
        this.chatsList.child(this.friend.Id).child(firebase.auth().currentUser.uid).child(message.Key).remove().then(() => {
          resolve(true);
        }).catch((err) => {
          reject(err);
        });
      }).catch((err) => {
        reject(err);
      });
    });
    return promise;
  }

  getLocation(): Promise<Geoposition> {
    console.log('get location');
    return this.geolocation.getCurrentPosition();
  }

}
