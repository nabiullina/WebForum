import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MatCardModule],
  template: `
    <mat-card class="not-found-card">
      <mat-card-content>
        <h1>404</h1>
        <p>Страница не найдена</p>
        <button mat-raised-button color="primary" routerLink="/">
          На главную
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .not-found-card {
      max-width: 400px;
      margin: 2rem auto;
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
  `]
})
export class NotFoundComponent {}