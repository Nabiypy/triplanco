import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { AgmCoreModule } from '@agm/core';
import { GroupChatPage } from './group-chat.page';


const routes: Routes = [
  {
    path: '',
    component: GroupChatPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDhQSnHQDqzyi0blXVSv63hK_lj-sATedg'
    }),
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GroupChatPage]
})
export class GroupChatPageModule {}
