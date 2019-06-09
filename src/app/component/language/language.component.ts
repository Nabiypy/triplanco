import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LanguageService } from 'src/app/provider/language';
import { DocumentService } from '../../provider/document.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {

  languages = [];
  selected = '';
  setSelectLanguage: any;

  constructor(private modalController: ModalController,
              private languageService: LanguageService,
              private documentService: DocumentService,
              private storage: Storage) {
  }

  ionViewWillEnter() {
    console.log(`@Language select modal page registered ...`);
  }

  // ionViewDidEnter() {
  //   this.getSelectedLanguage();
  // }
  ngOnInit() {
    // get available languages
    this.languages = this.languageService.getLanguages();
    this.selected = this.languageService.selected;
    const logSelectedLng = this.selected;
    this.storage.set('selectedLng', logSelectedLng);
    console.log('@ model set logSelected ==>', logSelectedLng);
  }

  select(lng) {
    // select language and store in local storage then dismiss
    this.languageService.setLanguage(lng);
    this.setSelectLanguage = this.languageService.setLanguage(lng);
    console.log('selected language from @modal', this.setSelectLanguage);
    if (this.setSelectLanguage === 'ar') {
      console.log('call right to left @modal select .....', this.setSelectLanguage);
      this.rightToLeft();
    }
    this.modalController.dismiss();
  }

  closeModal() {
    // close modal component when no language is selected
    this.modalController.dismiss();
  }

  async rightToLeft() {
    console.log('@modal rlt is called ====>>>>', this.setSelectLanguage);
    this.storage.set('appDir', this.setSelectLanguage);
    await this.documentService.setReadingDirection('rtl');
  }
}


