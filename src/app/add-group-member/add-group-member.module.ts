import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { AddGroupMemberPage } from './add-group-member.page';

const routes: Routes = [
  {
    path: '',
    component: AddGroupMemberPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,  
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddGroupMemberPage]
})
export class AddGroupMemberPageModule {}
