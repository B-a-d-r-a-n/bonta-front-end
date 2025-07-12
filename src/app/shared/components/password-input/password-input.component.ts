import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { noop } from 'rxjs';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModule],
  template: `
    <p-password
      [placeholder]="placeholder"
      [styleClass]="styleClass"
      [disabled]="disabled"
      [toggleMask]="toggleMask"
      [feedback]="feedback"
      [promptLabel]="promptLabel"
      [weakLabel]="weakLabel"
      [mediumLabel]="mediumLabel"
      [strongLabel]="strongLabel"
      (input)="onInputChange($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() styleClass: string = '';
  @Input() toggleMask: boolean = true;
  @Input() feedback: boolean = false;
  @Input() promptLabel: string = 'Enter password';
  @Input() weakLabel: string = 'Too simple';
  @Input() mediumLabel: string = 'Average complexity';
  @Input() strongLabel: string = 'Complex password';

  value: string = '';
  disabled: boolean = false;

  onChange: (value: string) => void = noop;
  onTouched: () => void = noop;

  onInputChange(event: any): void {
    const value = event.target.value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }

  onFocus(): void {
    // Optional: handle focus if needed
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
