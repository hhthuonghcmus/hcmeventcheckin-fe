import { AppService } from './services/app.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared-components/footer/footer.component';
import { HeaderComponent } from './shared-components/header/header.component';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { PrimeNG } from 'primeng/config';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Dialog } from 'primeng/dialog';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    Toast,
    HeaderComponent,
    FooterComponent,
    ProgressSpinner,
    Dialog,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService, CookieService],
})
export class AppComponent {
  title = 'Event Check In';
  isLoading$: Observable<boolean>;
  
  constructor(
    private primeng: PrimeNG,
    private appService: AppService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoading$ = this.appService.isLoading$;
    this.changeDetectorRef.detectChanges();
    this.primeng.ripple.set(true);
  }
}
