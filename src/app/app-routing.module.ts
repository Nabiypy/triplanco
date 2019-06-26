import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './provider/auth.guard';

const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'},
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuard]
  },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] },
  { path: 'notifications', loadChildren: './notifications/notifications.module#NotificationsPageModule', canActivate: [AuthGuard] },
  { path: 'edit-profile', loadChildren: './edit-profile/edit-profile.module#EditProfilePageModule', canActivate: [AuthGuard] },
  { path: 'welcome', loadChildren: './welcome/welcome.module#WelcomePageModule'},
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  { path: 'forgot-password', loadChildren: './forgot-password/forgot-password.module#ForgotPasswordPageModule' },
  { path: 'users', loadChildren: './users/users.module#UsersPageModule', canActivate: [AuthGuard] },
  { path: 'user-profile/:id', loadChildren: './user-profile/user-profile.module#UserProfilePageModule', canActivate: [AuthGuard]},
  { path: 'about-us', loadChildren: './about-us/about-us.module#AboutUsPageModule', canActivate: [AuthGuard] },
  { path: 'privacy', loadChildren: './privacy/privacy.module#PrivacyPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
