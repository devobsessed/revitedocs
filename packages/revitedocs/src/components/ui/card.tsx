import * as React from 'react'
import { cn } from '../utils.js'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border bg-card text-card-foreground',
        // Subtle shadow with inner highlight
        'shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.05)]',
        // Smooth transition for hover effects
        'transition-all duration-300 ease-out',
        // Hover: lift and enhanced shadow
        'hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1),0_4px_10px_-4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.08)]',
        'hover:translate-y-[-2px]',
        // Border refinement
        'border-zinc-200/60 dark:border-zinc-800/60',
        'hover:border-zinc-300/60 dark:hover:border-zinc-700/60',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'font-semibold leading-none tracking-tight',
        'transition-colors duration-200',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-muted-foreground leading-relaxed', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
