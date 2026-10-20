import React from 'react';
import styles from './Input.module.css';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  errorText?: string;
  isDirectionalLtr?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helpText,
      errorText,
      isDirectionalLtr = false,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className={`${styles.fieldGroup} ${className || ''}`}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div
          className={`${styles.inputWrapper} ${
            errorText ? styles.inputWrapperError : ''
          }`}
        >
          <input
            ref={ref}
            id={inputId}
            className={`${styles.input} ${
              isDirectionalLtr ? styles.directionLtr : ''
            }`}
            aria-invalid={Boolean(errorText)}
            aria-describedby={
              errorText
                ? `${inputId}-error`
                : helpText
                ? `${inputId}-help`
                : undefined
            }
            {...props}
          />
        </div>
        {errorText && (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        )}
        {!errorText && helpText && (
          <span id={`${inputId}-help`} className={styles.helpText}>
            {helpText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
