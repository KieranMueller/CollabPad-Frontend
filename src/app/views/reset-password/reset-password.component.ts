import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginNavBarComponent } from '../login-nav-bar/login-nav-bar.component'
import { backendBaseURL } from '../../shared/env.variables'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule, LoginNavBarComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  http = inject(HttpClient);
  user = {
    emailId: '',
    newPassword: '',
    confirmedPassword: '',
  };
  invalidLink = false;
  success = false;
  username = ''
  isLoading = false;
  error = false;

  ngOnInit() {
    const emailId = this.route.snapshot.params['emailId'];
    this.http.get(`${backendBaseURL}/emailId-exists/${emailId}`).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res) {
          this.username = res.username;
          this.user.emailId = emailId;
        }
      },
      error: (e) => {
        console.log(e);
        this.invalidLink = true;
        setTimeout(() => {
          this.router.navigateByUrl('/login');
        }, 2000);
      },
    });
  }

  resetPassword() {
    this.isLoading = true
    if (
      this.user.emailId &&
      this.user.newPassword.length >= 6 &&
      this.user.newPassword === this.user.confirmedPassword
    ) {
      this.http
        .post(`${backendBaseURL}/reset-password`, this.user)
        .subscribe({
          next: (res) => {
            this.isLoading = false;
            console.log(res);
            if (res) {
              this.success = true
              setTimeout(() => {
                this.router.navigateByUrl('/login')
              }, 2000)
            }
          },
          error: (e) => {
            console.log(e);
            this.isLoading = false;
            this.error = true;
          },
        });
    } else {
      this.isLoading = false;
      this.error = true;
    }
  }
}
