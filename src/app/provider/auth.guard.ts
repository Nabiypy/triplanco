import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})

export class AuthGuard implements CanActivate {
  isComplete: any;

  constructor(private storage: Storage, private router: Router) {
    this.getIsCompleteValue();
  }

  // canActivate determine whether the customer has logged in or not
   canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged((user: firebase.User) => {
        console.log('Auth state change value ==>', user);
        if (user) {
          resolve(true);
        } else {
          console.log('User is not logged in');
          if (!this.isComplete) {
            this.router.navigate(['/welcome']);
            resolve(false);
          } else {
            this.router.navigate(['/login']);
            resolve(false);
          }
        }
      });
    });
  }

  public getIsCompleteValue() {
    this.storage.get('tutorialComplete').then( value => {
      console.log('is tutorial complete value +++', value);
      this.isComplete = value;
    });
  }
}


