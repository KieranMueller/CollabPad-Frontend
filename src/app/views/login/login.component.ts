import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginNavBarComponent } from '../login-nav-bar/login-nav-bar.component';
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, LoginNavBarComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  user = {
    username: '',
    password: '',
  };
  error = false;
  errorMessage = 'Oops, something went wrong...';
  route = inject(ActivatedRoute);
  isLoading = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const emailId = this.route.snapshot.params['emailId']
    if (emailId) {
      this.loginViaEmailId(emailId)
    }
  }

  onKey() {
    this.error = false;
  }

  login() {
    this.isLoading = true;
    this.http.post(`http://localhost:8081/login`, this.user).subscribe({
      next: (data: any) => {
        if (data.token) {
          localStorage.setItem('notepad-jwt', data.token);
          localStorage.setItem('notepad-username', this.user.username);
          localStorage.setItem('notepad-websocketId', data.websocketId);
          this.router.navigateByUrl('/home');
          this.isLoading = false;
        }
      },
      error: (e) => {
        console.log(e);
        this.isLoading = false;
        if (e.status === 0) {
          this.errorMessage = 'Unable to reach server';
        } else {
          this.errorMessage = 'Unable to find user';
        }
        this.error = true;
        this.user.username = '';
        this.user.password = '';
      },
    });
  }

  loginViaEmailId(emailId: string) {
    this.http.get(`http://localhost:8081/verify-email/${emailId}`).subscribe({
      next: (res: any) => {
        console.log(res)
        localStorage.setItem('notepad-jwt', res.token);
        localStorage.setItem('notepad-username', res.username);
        this.router.navigateByUrl('/home')
      },
      error: e => {
        console.log(e)
      }
    })
  }

  register() {
    this.router.navigateByUrl('/register');
  }

  forgotPassword() {
    this.router.navigateByUrl('/forgot-password')
  }
}
