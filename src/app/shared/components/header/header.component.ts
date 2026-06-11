import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, MatDividerModule, MatTooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  title = input('Dashboard');
  subtitle = input('');
  breadcrumbs = input<string[]>([]);
  userName = input('Usuario');
  userRole = input('Administrador');
  userInitials = input('?');
  isDark = input(false);
  collapsed = input(false);

  toggleTheme = output<void>();
  toggleSidebar = output<void>();
  logout = output<void>();
  navigate = output<string>();
}
