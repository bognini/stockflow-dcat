import { Zap, Flame, Tag } from 'lucide-react';

type PromoBadgeProps = {
  discount: number;
  variant?: 'default' | 'flash' | 'hot';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function PromoBadge({ 
  discount, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: PromoBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-red-500 text-white',
    flash: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    hot: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
  };

  const Icon = variant === 'flash' ? Zap : variant === 'hot' ? Flame : Tag;

  return (
    <div 
      className={`
        inline-flex items-center gap-1 font-bold rounded shadow-sm
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      <span>-{discount}%</span>
    </div>
  );
}

// Helper to determine badge variant based on discount
export function getPromoVariant(discount: number): 'default' | 'flash' | 'hot' {
  if (discount >= 50) return 'hot';
  if (discount >= 30) return 'flash';
  return 'default';
}
