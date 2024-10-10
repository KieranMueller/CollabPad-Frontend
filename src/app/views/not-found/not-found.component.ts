import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent implements OnInit {
    count = 5
    interval: any;

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.interval = setInterval(() => {
            if (this.count > 1) {
                this.count--
            } else {
                clearInterval(this.interval)
                this.goHome()
            }
        }, 1000)
    }

    goHome() {
        clearInterval(this.interval)
        this.router.navigateByUrl('/home')
    }
}
