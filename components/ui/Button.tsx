import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    let variantClass = styles.variantSecondary;
    if (variant === 'primary') variantClass = styles.variantPrimary;
    else if (variant === 'danger') variantClass = styles.variantDanger;
    else if (variant === 'ghost') variantClass = styles.variantGhost;

    let sizeClass = styles.sizeMd;
    if (size === 'sm') sizeClass = styles.sizeSm;
    else if (size === 'lg') sizeClass = styles.sizeLg;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        className={`${styles.button} ${variantClass} ${sizeClass} ${className || ''}`}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        <span>{children}</span>
        {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
