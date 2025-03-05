import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { MyTopicsComponent } from './pages/admin/my-topics/my-topics.component';
import { CreateTopicComponent } from './pages/admin/create-topic/create-topic.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'log-in', component: LogInComponent },
  {
    path: 'topic',
    children: [
      { path: 'my-topics', component: MyTopicsComponent },
      { path: 'create', component: CreateTopicComponent },
    ],
  },
];
