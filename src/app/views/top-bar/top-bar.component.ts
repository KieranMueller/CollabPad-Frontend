import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent implements OnInit {
  username = '';
  router = inject(Router);

  ngOnInit(): void {
    const username = localStorage.getItem('notepad-username');
    if (username) {
      this.username = username;
    }
  }

  logout() {
    if (window.confirm('Are you sure?')) {
      localStorage.removeItem('notepad-username');
      localStorage.removeItem('notepad-jwt');
      this.router.navigateByUrl('/login');
    }
  }
}
