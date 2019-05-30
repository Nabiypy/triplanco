import { Component, OnInit, NgZone } from '@angular/core';
import { NotificationsProvider } from '../provider/notifications';
import { Events } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  Notifications = []
  ReadNotifications = []
  allUsers = []
  allUserss = []

  constructor(
    public notificationsProvider: NotificationsProvider, 
    public ngZone: NgZone, 
    public events: Events, 
    public router: Router, 
    public afDB: AngularFireDatabase, 
    public afAuth: AngularFireAuth) {
   	
  } 

  ngOnInit() {
    // get all notifications that has been read by the user
    this.events.subscribe('Notifications', () => {
      this.ngZone.run(() => {
        this.Notifications = this.notificationsProvider.NotificationsUnread
        this.allUsers = this.notificationsProvider.buddyUsersUnread
      })
    }) 
    // get all notifications that has not been read by the user
    this.events.subscribe('Notifications', () => {
      this.ngZone.run(() => {
        this.ReadNotifications = this.notificationsProvider.NotificationsRead
        this.allUserss = this.notificationsProvider.buddyUsersRead
      })
    })  	
  }

  
  ionViewDidLeave(){
    // event subscribe to notifications from the provider
    this.events.subscribe('Notifications')
  }

  // load read and unread notifications from provider
  ionViewDidEnter(){
    this.notificationsProvider.getMyNotificationsUnread()
    this.notificationsProvider.getMyNotificationsRead()
  }

  // if the notification type is Request navigate to request page
  // if the notification type is Friend navigate to user profile page
  // then make the unread notification to read
	showNotificationsConfirmation(details, id){
		if (details.Type == 'Request') {
      this.router.navigateByUrl('request')
		} else if (details.Type == 'Friend') {
      this.router.navigate(['/user-profile', id ]);
    } else { 
    }
		this.notificationsProvider.makeNotificationAsRead(details)
  }

   // if the notification type is Request navigate to request page
  // if the notification type is Friend navigate to user profile page
  showNotificationsReadConfirmation(details, id){
		if (details.Type == 'Request') {
      this.router.navigateByUrl('request')
		} else if (details.Type == 'Friend') {
    this.router.navigate(['/user-profile', id]);
		} else {
      
    }

  }
    // delete notification for me
    delete(id){
      this.afDB.database.ref('Notifications').child(this.afAuth.auth.currentUser.uid).child('Read').child(id).remove()
    }
	}






