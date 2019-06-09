import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { DocumentService } from './document.service';

const LNG_KEY = 'SELECTED_LANGUAGE';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  selected = '';

  constructor(private translate: TranslateService,
              private storage: Storage,
              private plt: Platform,
              private documentService: DocumentService) { }

  setInitialAppLanguage() {
    const language = this.translate.getBrowserLang();
    this.translate.setDefaultLang(language);

    this.storage.get(LNG_KEY).then(val => {
      console.log('Get Selected LNG_KEY value ====>', val);
      if (val) {
        this.setLanguage(val);
        this.selected = val;
      }
    });
  }

  getLanguages() {
    // get available languages
    return [
      { text: 'English', value: 'en', img: 'assets/imgs/en.png' },
      { text: 'French', value: 'fr', img: 'assets/imgs/fr.png' },
      { text: 'Arabic', value: 'ar', img: 'assets/imgs/ar.png' }
    ];
  }

  async setLanguage(lng) {
    // set language and store by local storage
    await this.translate.use(lng);
    this.selected = lng;
    console.log('Set selected Language ==> ' + lng);
    await this.storage.set(LNG_KEY, lng);
    this.storage.set('isLng', lng);
    if (lng === 'ar') {
      await this.documentService.setReadingDirection('rtl');
    } else {
      await this.documentService.setReadingDirection('ltr');
    }
  }
}
