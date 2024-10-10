import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginNavBarComponent } from '../login-nav-bar/login-nav-bar.component';
import { CommonModule } from '@angular/common';
import { backendBaseURL } from '../../shared/env.variables';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [FormsModule, LoginNavBarComponent, CommonModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
    http = inject(HttpClient);
    router = inject(Router);
    usernameOrEmail = '';
    isLoading = false;
    invalidUser = false;
    badConnection = false;
    genericError = false;
    success = false;

    @HostListener('document:keyup.enter', ['$event'])
    onEnter() {
        if (this.usernameOrEmail.length >= 4) {
            this.sendEmail();
        }
    }

    sendEmail() {
        this.isLoading = true;
        this.http
            .post(`${backendBaseURL}/forgot-password`, this.usernameOrEmail)
            .subscribe({
                next: (res) => {
                    console.log(res);
                    this.isLoading = false;
                    this.success = true;
                    setTimeout(() => {
                        this.router.navigateByUrl('/login');
                    }, 2000);
                },
                error: (e) => {
                    console.log(e);
                    this.isLoading = false;
                    if (e.status === 404) {
                        this.invalidUser = true;
                    } else if (e.status === 0) {
                        this.badConnection = true;
                    } else {
                        this.genericError = true;
                    }
                },
            });
    }

    resetErrors() {
        this.invalidUser = false;
        this.badConnection = false;
        this.genericError = false;
    }

    backToLogin() {
        this.router.navigateByUrl('/login');
    }
}
