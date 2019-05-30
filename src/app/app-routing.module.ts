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
  { path: 'contacts', loadChildren: './contacts/contacts.module#ContactsPageModule', canActivate: [AuthGuard] },
  { path: 'group', loadChildren: './group/group.module#GroupPageModule', canActivate: [AuthGuard] },
  { path: 'notifications', loadChildren: './notifications/notifications.module#NotificationsPageModule', canActivate: [AuthGuard] },
  { path: 'edit-profile', loadChildren: './edit-profile/edit-profile.module#EditProfilePageModule', canActivate: [AuthGuard] },
  { path: 'chat', loadChildren: './chat/chat.module#ChatPageModule', canActivate: [AuthGuard] },
  { path: 'welcome', loadChildren: './welcome/welcome.module#WelcomePageModule'},
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'signup', loadChildren: './signup/signup.module#SignupPageModule' },
  { path: 'forgot-password', loadChildren: './forgot-password/forgot-password.module#ForgotPasswordPageModule' },
  { path: 'users', loadChildren: './users/users.module#UsersPageModule', canActivate: [AuthGuard] },
  { path: 'user-profile/:id', loadChildren: './user-profile/user-profile.module#UserProfilePageModule', canActivate: [AuthGuard]},
  { path: 'request', loadChildren: './request/request.module#RequestPageModule', canActivate: [AuthGuard]},
  { path: 'create-group', loadChildren: './create-group/create-group.module#CreateGroupPageModule', canActivate: [AuthGuard]},
  { path: 'group-chat', loadChildren: './group-chat/group-chat.module#GroupChatPageModule', canActivate: [AuthGuard] },
  { path: 'group-members', loadChildren: './group-members/group-members.module#GroupMembersPageModule', canActivate: [AuthGuard] },
  { path: 'add-group-member', loadChildren: './add-group-member/add-group-member.module#AddGroupMemberPageModule', canActivate: [AuthGuard] },
  { path: 'group-info', loadChildren: './group-info/group-info.module#GroupInfoPageModule', canActivate: [AuthGuard] },
  { path: 'blocklist', loadChildren: './blocklist/blocklist.module#BlocklistPageModule', canActivate: [AuthGuard] },
  { path: 'nearby-user', loadChildren: './nearby-user/nearby-user.module#NearbyUserPageModule', canActivate: [AuthGuard] },
  { path: 'nearby-map', loadChildren: './nearby-map/nearby-map.module#NearbyMapPageModule', canActivate: [AuthGuard] },
  { path: 'about-us', loadChildren: './about-us/about-us.module#AboutUsPageModule', canActivate: [AuthGuard] },
  { path: 'tutorials', loadChildren: './tutorials/tutorials.module#TutorialsPageModule' },
  { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardPageModule', canActivate: [AuthGuard] },
  { path: 'bundles', loadChildren: './bundles/bundles.module#BundlesPageModule' },
  { path: 'flights', loadChildren: './flights/flights.module#FlightsPageModule' },
  { path: 'hotels', loadChildren: './hotels/hotels.module#HotelsPageModule' },
  { path: 'activities', loadChildren: './activities/activities.module#ActivitiesPageModule' },
  { path: 'cars', loadChildren: './cars/cars.module#CarsPageModule' },
  { path: 'privacy', loadChildren: './privacy/privacy.module#PrivacyPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
