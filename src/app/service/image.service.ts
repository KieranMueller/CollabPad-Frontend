import { Injectable } from '@angular/core'
import { TokenService } from './token.service'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { backendBaseURL } from '../shared/env.variables'

@Injectable({
    providedIn: 'root',
})
export class ImageService {

    constructor(private tokenService: TokenService, private http: HttpClient) {}

    changeProfilePicByUsername(username: string, file: File) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
          });

        const formData = new FormData()
        formData.append('multipartImage', file)
        return this.http.post(`${backendBaseURL}/avatar/${username}`, formData, {headers: headers})
    }
}