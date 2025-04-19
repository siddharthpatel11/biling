import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule,
    MatIconModule, MatListModule, CommonModule,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // loginForm: FormGroup;

  // constructor(private fb: FormBuilder) {
  //   this.loginForm = this.fb.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', Validators.required]
  //   });
  // }

  // onSubmit() {
  //   if (this.loginForm.valid) {
  //     console.log('Login Data:', this.loginForm.value);
  //     // Perform login logic here
  //   }
  // }
  loginForm: FormGroup;
  errorMessage: string = '';
  userName: string = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      // ✅ Dummy user for demonstration
      const dummyUser = {
        email: 'admin@gmail.com',
        password: 'admin@gmail.com',
        name: 'siddharth patel'
      };

      if (email === dummyUser.email && password === dummyUser.password) {
        this.userName = dummyUser.name;
        this.errorMessage = '';

        // ✅ Redirect to Invoice page
        this.router.navigate(['/invoice']);
      } else {
        this.errorMessage = 'Invalid email or password.';
        this.userName = '';
      }
    }
  }


}
