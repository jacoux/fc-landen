import {Routes} from '@angular/router';
import {BlogPostComponent} from './pages/blog-post/blog-post.component';
import {HomeComponent} from './pages/home/home.component';
import {editorAccessGuard} from './services/aditorGuard';
import {authGuard} from './services/authGuard';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';


export const routes: Routes = [
  // Homepage
  {path: '', component: HomeComponent, pathMatch: 'full'},

  // Authentication routes
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent, pathMatch: 'full', canActivate: [authGuard]},

  // Dynamic blog routes - handles all content
  {path: 'blog/:category/:postName', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'blog/nieuw', component: BlogPostComponent, pathMatch: 'full'},

  // Catch-all redirect to home
  {path: '**', redirectTo: '', pathMatch: 'full'}
];
