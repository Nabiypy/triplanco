import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GifsProvider } from 'src/app/provider/gif';

@Component({
  selector: 'app-gif',
  templateUrl: './gif.component.html',
  styleUrls: ['./gif.component.scss']
})
export class GifComponent implements OnInit {
  
  images;
  searchText;

  constructor(private modalController: ModalController, public GifsProvider: GifsProvider) {}

  // Close modal if no gif is selected
  closeModal() {
    this.modalController.dismiss();
  }

  // pass the data of the gif selected on modal dismiss
  onSelect(image){
      this.modalController.dismiss(image)
  }

  // get list of gifs
  ngOnInit() {
    this.GifsProvider.getGifs().subscribe(result => {
      this.images = result;
    });
  }

 // search gif
  getItems() {
    this.GifsProvider.searchGifs(this.searchText).subscribe(result => {
      this.images = result;
    });
  }
}



