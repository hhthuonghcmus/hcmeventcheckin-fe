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

@Component({
  selector: 'app-sign-up',
  imports: [
    CommonModule,
    Button,
    InputText,
    InputGroup,
    InputGroupAddon,
    ReactiveFormsModule,
    FloatLabel,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  signUpForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router,
  ) {
    const loggedInUser = this.userService.getLoggedInUser();
    if (loggedInUser) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.signUpForm = this.formBuilder.group(
      {
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^\d{10,11}$/)],
        ],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(signUpForm: FormGroup) {
    const password = signUpForm.get('password')?.value;
    const confirmPassword = signUpForm.get('confirmPassword')?.value;
    return password === confirmPassword ? true : { passwordsDoNotMatch: true };
  }

  onSubmit() {
    if (this.signUpForm.valid) {
      this.userService.signUp(this.signUpForm.value).subscribe({
        next: (response) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Sign Up',
              detail: 'Successfully',
            });

            this.router.navigate(['/']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Sign Up',
              detail: response['message'],
              life: 3000,
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Sign Up',
            detail: 'error',
          });
        },
        complete: () => {},
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Sign Up',
        detail: 'Error',
      });
    }
  }
}
