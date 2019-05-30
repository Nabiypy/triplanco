import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


@Injectable({
  providedIn: 'root'
})
export class GifsProvider {

  api_key = 'YOUR_GIF_API_KEY_HERE'; // get api_key from Giphy developer account

  constructor(public http: HttpClient) {
    console.log('Hello GifsProvider Provider');
  }

  // return list of gifs
  getGifs() :Observable<any> {
    return this.http.get<any>('http://api.giphy.com/v1/gifs/trending?api_key='+this.api_key)
      .map(result => {
        return result.data;
      });
  }

  // search for gifs
  searchGifs(searchText) :Observable<any> {
    return this.http.get<any>('http://api.giphy.com/v1/gifs/search?q='+searchText+'&api_key='+this.api_key)
      .map(result => {
        return result.data;
      });
  }

}
