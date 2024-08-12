import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginNavBarComponent } from '../login-nav-bar/login-nav-bar.component';
import { CommonModule } from '@angular/common';
import { User } from '../../shared/types';

const passContainsSpecialChar = (control: AbstractControl) => {
  const specialChars = '!?@$%^&*#+';
  const pattern = new RegExp(`[${specialChars}]`);
  if (pattern.test(control.value)) {
    return null;
  }
  return {
    doesNotContainSpecialChar: true,
  };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, LoginNavBarComponent, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  router = inject(Router);
  http = inject(HttpClient);

  myForm = new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl('', {
      validators: [
        Validators.email,
        Validators.required,
        Validators.minLength(6),
      ],
    }),
    username: new FormControl('', {
      validators: [Validators.required, Validators.minLength(4)],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        passContainsSpecialChar,
      ],
    }),
    confirmedPassword: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        passContainsSpecialChar,
      ],
    }),
  });

  checkUsernameText = 'Check';
  signupBtnText = 'Sign up';
  isLoading = false;
  errorMessage = '';
  emailed = false;

  ngOnInit() {}

  return() {
    this.router.navigateByUrl('/login');
  }

  onSubmit() {
    if (this.myForm.invalid) return;
    const user = this.createUser();
    this.isLoading = true;
    this.http.post(`http://localhost:8081/register`, user).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.token) {
          this.isLoading = false;
          this.emailed = true;
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 2000);
        }
      },
      error: (e) => {
        console.log(e);
        this.isLoading = false;
        if (e.status === 0) {
          this.signupBtnText = 'No connection...';
        } else {
          this.errorMessage = e.error.message;
        }
      },
    });
  }

  createUser(): User {
    return {
      firstName: this.myForm.value.firstName!,
      lastName: this.myForm.value.lastName!,
      email: this.myForm.value.email!,
      username: this.myForm.value.username!,
      password: this.myForm.value.password!,
      confirmedPassword: this.myForm.value.confirmedPassword!,
      role: 'USER',
    };
  }

  checkUsername() {
    this.isLoading = true;
    this.http
      .post(
        `http://localhost:8081/username-exists`,
        this.myForm.controls.username.value
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.checkUsernameText = '❌Taken';
          } else if (!res) {
            this.checkUsernameText = '✅Available';
          }
        },
        error: (e) => {
          console.log(e);
          this.isLoading = false;
          this.checkUsernameText = 'Oops...';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  passwordsMatch() {
    return (
      this.myForm.controls.password.value ===
      this.myForm.controls.confirmedPassword.value
    );
  }

  test() {
    console.log(this.myForm);
  }
}
