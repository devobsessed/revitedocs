import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../utils.js";

export interface TabItem {
  /** Tab label shown in tab button */
  label: string;
  /** Tab content */
  content: ReactNode;
}

export interface TabsProps {
  /** Array of tab items */
  items: TabItem[];
  /** Default active tab index */
  defaultIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tabs component for displaying tabbed content.
 * SSR-compatible with fallback to showing first tab only.
 */
export function Tabs({ items, defaultIndex = 0, className }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (items.length === 0) return null;

  // SSR fallback: show all content as static content
  if (!isMounted) {
    return (
      <div className={cn("not-prose my-6", className)}>
        <div className="w-full border-b border-border">
          <div className="flex">
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2",
                  index === defaultIndex
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground"
                )}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4">{items[defaultIndex]?.content}</div>
      </div>
    );
  }

  // Client-side interactive tabs
  return (
    <div className={cn("not-prose my-6", className)}>
      <div className="w-full border-b border-border">
        <div className="flex" role="tablist">
          {items.map((item, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                index === activeIndex
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4" role="tabpanel">
        {items[activeIndex]?.content}
      </div>
    </div>
  );
}

/**
 * TabGroup wrapper for direct use in markdown (pre-parsed tabs)
 */
export interface TabGroupProps {
  /** Tab labels array */
  labels: string[];
  /** Children must be the same count as labels */
  children: ReactNode[];
  /** Additional CSS classes */
  className?: string;
}

export function TabGroup({ labels, children, className }: TabGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];
  const items: TabItem[] = labels.map((label, i) => ({
    label,
    content: childArray[i] || null,
  }));

  return <Tabs items={items} className={className} />;
}
