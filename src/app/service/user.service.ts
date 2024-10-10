import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, OnInit } from '@angular/core';
import { backendBaseURL } from '../shared/env.variables'
import { TokenService } from './token.service'

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {
    headers: HttpHeaders = new HttpHeaders()

  constructor(private http: HttpClient, private tokenService: TokenService) { }

    ngOnInit() {
        this.headers = this.tokenService.getHeaders()
    }

  getUsersByUsernameStartsWith(username: string) {
    return this.http.get(`${backendBaseURL}/search?user=${username}`, 
        {headers: this.tokenService.getHeaders()})
  }

  getUserById(id: number) {
    return this.http.get(`${backendBaseURL}/user/${id}`, {headers: this.headers})
  }

  getUserByUsername(username: string) {
    const url = `${backendBaseURL}/user?user=${username}`
    return this.http.get(url, {headers: this.tokenService.getHeaders()})
  }
}
