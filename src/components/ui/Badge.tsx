import React, { forwardRef, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'income' | 'expense' | 'savings' | 'warning' | 'info' | 'success';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: 'bg-dark-100 text-dark-700',
      income: 'bg-secondary-100 text-secondary-700',
      expense: 'bg-red-100 text-red-700',
      savings: 'bg-accent-100 text-accent-700',
      warning: 'bg-amber-100 text-amber-700',
      info: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
    };
    
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };
    
    const dotColors = {
      default: 'bg-dark-400',
      income: 'bg-secondary-500',
      expense: 'bg-red-500',
      savings: 'bg-accent-500',
      warning: 'bg-amber-500',
      info: 'bg-blue-500',
      success: 'bg-green-500',
    };
    
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 font-medium rounded-full
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left';
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      name,
      size = 'md',
      shape = 'circle',
      status,
      statusPosition = 'bottom-right',
      className = '',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
    };
    
    const shapeClasses = {
      circle: 'rounded-full',
      square: 'rounded-xl',
    };
    
    const statusSizeClasses = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
    };
    
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-dark-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    };
    
    const statusPositionClasses = {
      'bottom-right': 'bottom-0 right-0',
      'top-right': 'top-0 right-0',
      'bottom-left': 'bottom-0 left-0',
      'top-left': 'top-0 left-0',
    };
    
    // Generate initials from name
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };
    
    // Generate consistent color from name
    const getColorFromName = (name: string) => {
      const colors = [
        'bg-primary-500',
        'bg-secondary-500',
        'bg-accent-500',
        'bg-amber-500',
        'bg-blue-500',
        'bg-blue-600',
        'bg-pink-500',
        'bg-teal-500',
        'bg-primary-400',
        'bg-indigo-500',
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };
    
    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${shapeClasses[shape]} overflow-hidden bg-dark-100 ${className}`}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : name ? (
          <span className={`${getColorFromName(name)} text-white font-medium`}>
            {getInitials(name)}
          </span>
        ) : (
          <svg className="w-full h-full text-dark-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        
        {status && (
          <span
            className={`
              absolute rounded-full border-2 border-white
              ${statusSizeClasses[size]} ${statusColors[status]} ${statusPositionClasses[statusPosition]}
            `}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'income' | 'expense' | 'savings' | 'warning';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      size = 'md',
      variant = 'default',
      showLabel = false,
      label,
      animated = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const sizeClasses = {
      sm: 'h-1.5',
      md: 'h-2.5',
      lg: 'h-4',
    };
    
    const variantClasses = {
      default: 'bg-primary-500',
      income: 'bg-secondary-500',
      expense: 'bg-red-500',
      savings: 'bg-accent-500',
      warning: 'bg-amber-500',
    };
    
    return (
      <div ref={ref} className={className} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-dark-700">{label || `${Math.round(percentage)}%`}</span>
            {showLabel && <span className="text-sm text-dark-500 font-mono">{value} / {max}</span>}
          </div>
        )}
        <div className={`w-full bg-dark-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <div
            className={`
              h-full rounded-full transition-all duration-500 ease-out
              ${variantClasses[variant]} ${animated ? 'animate-pulse-soft' : ''}
            `}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={label || 'Progress'}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';