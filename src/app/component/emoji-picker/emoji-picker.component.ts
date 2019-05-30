import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EmojiService } from 'src/app/provider/emoji.service';
import { Emoji } from 'src/app/provider/emoji.model';

@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
 
})

export class EmojiPickerComponent implements OnInit  {

  emojis: Emoji[] = [];
  emojisAll: Emoji[] = [];
  size = 'default';
  loading = false;
  searchValue = '';
  loadedEmojiList;
  noemoji;

  constructor(private emojiService: EmojiService, private modalController: ModalController) {}
  
  // get emoji list with model name and link
  getEmojisFirstTime(): void {
    this.loading = true;
    localStorage.clear();
    this.emojiService.getEmojis().subscribe(emojis => {
      this.emojisAll = Object.entries(emojis).map(([name, link]) => ({
        name,
        link
      }));
      this.emojis = this.emojisAll;
      this.loading = false;

      localStorage.setItem('emojis', JSON.stringify(this.emojisAll));
    });
  }

  ngOnInit(){}

  ionViewDidEnter() {
    const emojisFromLS = localStorage.getItem('emojis');
    if (!emojisFromLS) {
      this.getEmojisFirstTime();
    } else {
      this.emojisAll = JSON.parse(emojisFromLS);
    } 
  }

    // Close modal if no emoji is selected
    closeModal() {
      this.modalController.dismiss();
    }
  
    // pass the data of the emoji selected on modal dismiss
    onSelect(image){
        this.modalController.dismiss(image)
    }

}