import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from 'src/app/provider/language';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
 
    languages = [];
    selected = '';

  constructor(private modalController: ModalController, private languageService: LanguageService) {}

  ngOnInit() {
    // get available languages
    this.languages = this.languageService.getLanguages();
    this.selected = this.languageService.selected;
  }

  select(lng) {
    // select language and store in local storage then dismiss
    this.languageService.setLanguage(lng);
    this.modalController.dismiss();
  }

  closeModal() {
    // close modal component when no language is selected
    this.modalController.dismiss();
  }

}


