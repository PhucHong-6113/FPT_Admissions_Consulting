interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-colors inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#ff6b35] text-white hover:bg-[#ff8c42]',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button 
      type={type}
      className={classes} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}
