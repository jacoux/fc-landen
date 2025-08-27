import {Routes} from '@angular/router';
import {BlogPostComponent} from './pages/blog-post/blog-post.component';
import {HomeComponent} from './pages/home/home.component';
import {editorAccessGuard} from './services/aditorGuard';
import {LoginComponent} from './pages/login/login.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';


export const routes: Routes = [
  // Homepage
  {path: '', component: HomeComponent, pathMatch: 'full'},

  // FC Landen main navigation routes
  // Clubinfo main route and subroutes
  {path: 'clubinfo', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/clubgegevens', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/visie', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/organogram', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/infrastructuur', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/route', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/contact', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/intern-reglement', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'clubinfo/privacy', component: BlogPostComponent, pathMatch: 'full'},

  // Jeugdvoetbal
  {path: 'jeugdvoetbal', component: BlogPostComponent, pathMatch: 'full'},  // Jeugdvoetbal
  {path: 'ongevallen', component: BlogPostComponent, pathMatch: 'full'},

  // Lid worden main route and subroutes
  {path: 'lid-worden', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'lid-worden/visie-jeugd', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'lid-worden/doorstroming', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'lid-worden/ethiek-en-fairplay', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'lid-worden/organogram-jeugd', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'lid-worden/come-together', component: BlogPostComponent, pathMatch: 'full'},

  // Ledeninfo main route and subroutes
  {path: 'ledeninfo', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/prosoccerdata', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/huisregels', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/attesten-mutualiteit', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/gezinskorting', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/ehbso', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/lifestyle', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'ledeninfo/sportvoeding', component: BlogPostComponent, pathMatch: 'full'},

  // Other main navigation routes
  {path: 'wedstrijdinfo', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'techniek', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'sponsoren', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'club-api', component: BlogPostComponent, pathMatch: 'full'},
  {path: 'word-medewerker', component: BlogPostComponent, pathMatch: 'full'},

  // Authentication routes
  {path: 'login', component: LoginComponent, pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent, pathMatch: 'full'},

  // Dynamic blog routes
  {path: 'blog/:category/:postName', component: BlogPostComponent, pathMatch: 'full', canActivate: [editorAccessGuard]},
  {path: 'blog/nieuw', component: BlogPostComponent, pathMatch: 'full'},

  // Catch-all redirect to home
  {path: '**', redirectTo: '', pathMatch: 'full'}
];
