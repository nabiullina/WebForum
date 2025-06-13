import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';
import {UserService} from '../../services/user.service';
import {Router} from '@angular/router';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: 'register.component.html',
  styleUrl: 'register.component.scss'
})
export class RegisterComponent {
  userData = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: ''
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.userService.createUser(this.userData).subscribe({
      next: () => {
        this.authService.login(this.userData.username, this.userData.password)
          .subscribe(() => this.router.navigate(['/']));
      },
      error: (err) => console.error('Error creating user', err)
    });
  }
}


