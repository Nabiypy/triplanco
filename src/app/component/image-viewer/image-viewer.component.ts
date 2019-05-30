import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {
  @Input() imgSource = '';
  @Input() imgTitle = '';
  @Input() imgDescription = '';

  slideOpts = {
    centeredSlides: 'true'
  };
  picImage: any;

  constructor(private modalController: ModalController, public socialSharing: SocialSharing, private _sanitizer: DomSanitizer) {}

  ngOnInit() {
  }

  // close modal component
  closeModal() {
    this.modalController.dismiss();
  }
}