import { Component, OnInit, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tutorials',
  templateUrl: './tutorials.page.html',
  styleUrls: ['./tutorials.page.scss'],
})
export class TutorialsPage implements OnInit {

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: true
  };
  slideIndex = 0;

  // Slider Data
  slides = [
    {
      text: 'Your All Time Trusted Travel Partner, Over Thousands of Happy Clients',
      imageUrl: 'assets/imgs/background/img3.jpeg',
    },
    {
      text: 'Find the best deals of Flight, Hotels, Car, Cruise and Activities',
      imageUrl: 'assets/imgs/background/img1.jpeg'
    },
    {
      text: 'Filter for reviews, star categories, ratings and much more',
      imageUrl: 'assets/imgs/background/img4.jpeg',
    },
    {
      text: 'Book the best trip on your demand',
      imageUrl: 'assets/imgs/background/img2.jpeg',
    }
  ];
  constructor(private storage: Storage, private router: Router) { }

  ngOnInit() {
  }

  onSlideChanged() {
  }

  async finish() {
    await this.storage.set('tutorialComplete', true);
    this.router.navigateByUrl('/welcome');
  }

  public async skipNext() {
    await this.storage.set('tutorialComplete', true);
    this.router.navigateByUrl('/welcome');
  }


}
