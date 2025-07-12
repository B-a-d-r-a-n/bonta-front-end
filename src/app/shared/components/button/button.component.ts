import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() iconPos: 'left' | 'right' = 'left';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() size: 'small' | 'large' = 'small';
  @Input() severity: 'primary' | 'secondary' | 'success' | 'danger' | 'info' =
    'primary';
  @Input() rounded: boolean = true;
  @Input() outlined: boolean = false;
  @Input() text: boolean = false;
  @Input() raised: boolean = true;
  @Input() customClass: string = '';
  @Input() ariaLabel: string = '';

  @Output() onClick = new EventEmitter<any>();

  get severityClass(): string {
    const severityMap: Record<ButtonType, string> = {
      primary: 'p-button-primary',
      secondary: 'p-button-secondary',
      success: 'p-button-success',
      danger: 'p-button-danger',
      warning: 'p-button-warning',
      info: 'p-button-info',
    };
    return severityMap[this.severity] || 'p-button-primary';
  }
}
