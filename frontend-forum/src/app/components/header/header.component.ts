import {Component} from '@angular/core';
import {CommonModule, NgIf} from '@angular/common';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {AuthService} from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, NgIf],
  selector : 'app-header',
  templateUrl: './header.component.html',
  styles: [`
    .spacer { flex: 1 1 auto; }
  `]
})
export class HeaderComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
