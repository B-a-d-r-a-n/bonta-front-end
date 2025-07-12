import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { noop } from 'rxjs';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, MessageModule],
  template: `
    <div class="flex flex-col gap-1">
      @if (label) {
      <label [for]="inputId" class="font-semibold text-gray-700">{{
        label
      }}</label>
      }
      <input
        pInputText
        [id]="inputId"
        [type]="type"
        [placeholder]="placeholder"
        [value]="value"
        [disabled]="disabled"
        [invalid]="invalid"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        [attr.aria-label]="ariaLabel"
        [attr.aria-describedby]="errorId"
        [attr.tabindex]="tabindex"
        (input)="onInputChange($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
      />
      @if (invalid && errorMessage) {
      <p-message [id]="errorId" severity="error" size="small" variant="simple">
        {{ errorMessage }}
      </p-message>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() label: string = '';
  @Input() inputId: string = '';
  @Input() ariaLabel: string = '';
  @Input() tabindex: string = '0';
  @Input() invalid: boolean = false;
  @Input() errorMessage: string = '';

  value: string = '';
  disabled: boolean = false;

  get errorId(): string {
    return this.inputId ? `${this.inputId}-error` : 'input-error';
  }

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
