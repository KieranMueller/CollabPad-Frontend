import { Routes } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { LoginComponent } from './views/login/login.component';
import { authGuard } from './guard/auth.guard';
import { RegisterComponent } from './views/register/register.component';
import { ForgotPasswordComponent } from './views/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './views/reset-password/reset-password.component';
import { SharedNotesPageComponent } from './views/shared-notes-page/shared-notes-page.component';
import { ViewSharedNoteComponent } from './views/view-shared-note/view-shared-note.component';
import { userIsSharedOnNote } from './guard/is-shared.guard';
import { NotFoundComponent } from './views/not-found/not-found.component'
import { SearchUsersComponent } from './views/search-users/search-users.component'
import { ProfileComponent } from './views/profile/profile.component'

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  {
    path: 'shared',
    component: SharedNotesPageComponent,
    canActivate: [authGuard],
  },
  {
    path: 'view-shared/:noteId',
    component: ViewSharedNoteComponent,
    canActivate: [authGuard, userIsSharedOnNote],
  },
  { path: 'login', component: LoginComponent },
  { path: 'login/:emailId', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:emailId', component: ResetPasswordComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: 'search', component: SearchUsersComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'not-found' },
];
