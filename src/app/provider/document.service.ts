import { Injectable, Inject } from '@angular/core';
import {DOCUMENT} from '@angular/common';

type ReadingDirection = 'ltr' | 'rtl';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  constructor(@Inject(DOCUMENT) private doc) {}

  public setReadingDirection(dir: ReadingDirection) {
    this.doc.dir = dir;
  }
}
