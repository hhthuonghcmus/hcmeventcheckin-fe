import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LogInComponent } from './pages/log-in/log-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { MyTopicsComponent } from './pages/admin/topic/my-topics/my-topics.component';
import { CreateTopicComponent } from './pages/admin/topic/create-topic/create-topic.component';
import { EditTopicComponent } from './pages/admin/topic/edit-topic/edit-topic.component';
import { MyEventsComponent } from './pages/admin/event/my-events/my-events.component';
import { CreateEventComponent } from './pages/admin/event/create-event/create-event.component';
import { EditEventComponent } from './pages/admin/event/edit-event/edit-event.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'log-in', component: LogInComponent },
  {
    path: 'topic',
    children: [
      { path: 'my-topics', component: MyTopicsComponent },
      { path: 'create', component: CreateTopicComponent },
      { path: 'edit/:id', component: EditTopicComponent },
    ],
  },
  {
    path: 'event',
    children: [
      { path: 'my-events', component: MyEventsComponent },
      { path: 'create', component: CreateEventComponent },
      { path: 'edit/:id', component: EditEventComponent },
    ],
  },
];
