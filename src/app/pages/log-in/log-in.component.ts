import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LOGGEDIN_USER_KEY } from '../../constants/localStorage.constants';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-log-in',
  imports: [CommonModule, Button, InputText, InputGroup, InputGroupAddon, ReactiveFormsModule, FloatLabel],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loginForm = this.formBuilder.group({
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,11}$/)],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.userService.logIn(this.loginForm.value).subscribe({
        next: (response) => {
          if (response['statusCode'] === 200) {
            const expiresDate = new Date();
            expiresDate.setDate(expiresDate.getDate() + 1);
            this.cookieService.set(
              LOGGEDIN_USER_KEY,
              JSON.stringify(response['data']),
              expiresDate
            );
            this.userService.loggedInUser$.next(response['data']);
            this.router.navigate(['/']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Log in',
              detail: response['message'],
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Log in',
            detail: 'Error',
          });
        },
        complete: () => {},
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Log In',
        detail: 'Error',
      });
    }
  }
}
