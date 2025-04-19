import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn = false;

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    // Hardcoded credentials for demonstration
    if (username === 'admin@gmail.com' && password === '123') {
      this.isLoggedIn = true;
      this.router.navigate(['/dashboard']); // Redirect to home on successful login
      return true;
    }
    return false;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.router.navigate(['/login']); // Redirect to login on logout
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

}
