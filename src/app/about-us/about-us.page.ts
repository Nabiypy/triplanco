import { Component, OnInit } from '@angular/core';
import { InappbrowserService } from '../provider/inappbrowser.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {

  constructor(public browserService: InappbrowserService ) { }

  ngOnInit() {}

}
