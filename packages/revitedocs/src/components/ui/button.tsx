import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils.js'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
    // Smooth transitions
    'transition-all duration-200 ease-out',
    // Focus states
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Disabled states
    'disabled:pointer-events-none disabled:opacity-50',
    // SVG handling
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    // Press effect
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          // Subtle inner highlight
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]',
          // Hover: subtle lift and glow
          'hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_-2px_rgba(0,0,0,0.15),0_2px_4px_-2px_rgba(0,0,0,0.1)]',
          'hover:brightness-110',
        ].join(' '),
        destructive: [
          'bg-destructive text-destructive-foreground',
          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_1px_3px_0_rgba(0,0,0,0.1)]',
          'hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_-2px_rgba(220,38,38,0.25)]',
          'hover:brightness-110',
        ].join(' '),
        outline: [
          'border border-input bg-background',
          'shadow-sm',
          // Hover: glass-like effect
          'hover:bg-accent/50 hover:border-foreground/20 hover:text-accent-foreground',
          'hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]',
        ].join(' '),
        secondary: [
          'bg-secondary text-secondary-foreground',
          'shadow-sm',
          'hover:bg-secondary/80',
          'hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]',
        ].join(' '),
        ghost: [
          'text-foreground/80',
          'hover:bg-accent hover:text-accent-foreground',
          'hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]',
        ].join(' '),
        link: [
          'text-foreground underline-offset-4',
          'hover:underline hover:text-foreground/80',
        ].join(' '),
        // New: Premium glass button
        glass: [
          'bg-white/10 dark:bg-white/5 backdrop-blur-md',
          'border border-white/20 dark:border-white/10',
          'text-foreground',
          'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.1)]',
          'hover:bg-white/20 dark:hover:bg-white/10',
          'hover:border-white/30 dark:hover:border-white/20',
          'hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.15)]',
        ].join(' '),
        // New: Shimmer/glow button
        glow: [
          'bg-primary text-primary-foreground',
          'shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)]',
          'hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.4)]',
          'hover:brightness-110',
          // Animated gradient border
          'relative overflow-hidden',
          'before:absolute before:inset-0 before:rounded-lg before:p-[1px]',
          'before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]',
          'before:bg-[length:200%_100%]',
          'hover:before:animate-[shimmer_1.5s_ease-out]',
        ].join(' '),
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
