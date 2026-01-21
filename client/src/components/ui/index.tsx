import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all duration-200 rounded-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 dark:shadow-rose-900/30',
    };

    const sizes = {
        sm: 'px-4 py-2 text-[9px]',
        md: 'px-6 py-3 text-[10px]',
        lg: 'px-8 py-4 text-[11px]',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {icon && !loading && <i className={`fa-solid ${icon} mr-2`} />}
            {children}
        </button>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    className = '',
    ...props
}) => {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className={`fa-solid ${icon}`} />
                    </div>
                )}
                <input
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all ${icon ? 'pl-11' : ''} ${error ? 'border-rose-400' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>
            )}
        </div>
    );
};

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick,
}) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 ${hover ? 'hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer transition-all duration-300' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
                {title && (
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            <i className="fa-solid fa-times text-slate-500" />
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
    };

    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        info: 'bg-indigo-500',
    };

    React.useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3 animate-in slide-in-from-bottom-4 z-50`}>
            <i className={`fa-solid ${icons[type]}`} />
            <span className="text-sm font-bold">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
                <i className="fa-solid fa-times" />
            </button>
        </div>
    );
};

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
}) => {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div
            className={`${sizes[size]} border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin ${className}`}
        />
    );
};

interface EmptyStateProps {
    icon: string;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <i className={`fa-solid ${icon} text-3xl text-slate-300 dark:text-slate-600`} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
};
