import { Component, OnInit, NgZone } from '@angular/core';
import { Events} from '@ionic/angular';
import { Router } from '@angular/router';
import { GroupProvider } from '../provider/group';

@Component({
  selector: 'app-group',
  templateUrl: './group.page.html',
  styleUrls: ['./group.page.scss'],
})
export class GroupPage implements OnInit {

  phone_model = 'iPhone';
  Groups = []
  loadedGroupsList: any;
  nogroup;

  constructor(public router: Router, public ngZone : NgZone, public events: Events, 
    public groupProvider: GroupProvider) {
  }

  // get group list
  ngOnInit() {
    this.groupProvider.getGroups()
    this.events.subscribe('Groups', () => {
      this.ngZone.run(() => {
        this.Groups = this.groupProvider.Groups
        this.loadedGroupsList = this.Groups;
      })
    }) 
  }

  createGroup(){
    this.router.navigateByUrl('create-group')
  }

  ionViewDidLeave(){
    this.events.subscribe('Groups')
  }

  ionViewDidEnter(){
    
    setInterval(()=> {
      this.ngOnInit(); },3000); 
  }

  // initialize function use in filter
initializeItems(){
  this.Groups = this.loadedGroupsList;
  console.log('reset')
  
}

  // Searchbar function
  getGroup(searchbar) {
    // Reset items back to all of the items
    this.initializeItems();
  
    // set q to the value of the searchbar
    var q = searchbar.srcElement.value;
  
    // if the value is an empty string don't filter the items
    if (!q) {
      return;
    }
    this.Groups = this.Groups.filter((v) => {
      if(v.Name && q) {
        if (v.Name.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
        
      }
    });
    // when no group returns 
    console.log(q, this.Groups.length);
    if(this.Groups.length === 0){
      this.nogroup = true;
    }else{
      this.nogroup = false;
    }
  }

 // initialize group details and proceed to group-chat
  openGroupBody(groupDetails){
     this.groupProvider.initialize(groupDetails)
     this.router.navigateByUrl('group-chat');
     }

}



