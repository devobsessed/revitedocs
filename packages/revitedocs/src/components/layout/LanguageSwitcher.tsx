import { Check, ChevronDown, Globe } from "lucide-react";
import { Badge } from "../ui/badge.js";
import { Button } from "../ui/button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { cn } from "../utils.js";

export interface LocaleConfig {
  label: string;
  lang: string;
}

export interface LanguageSwitcherProps {
  locales: Record<string, LocaleConfig>;
  currentLocale?: string;
  defaultLocale?: string;
  currentPath: string;
  className?: string;
}

/**
 * Remove locale prefix from a path
 * e.g., /en/guide/intro -> /guide/intro
 */
export function stripLocaleFromPath(path: string, locale: string): string {
  const localePrefix = `/${locale}`;
  if (path.startsWith(localePrefix)) {
    const stripped = path.slice(localePrefix.length);
    return stripped || "/";
  }
  return path;
}

/**
 * Add locale prefix to a path
 * e.g., /guide/intro + ja -> /ja/guide/intro
 */
export function addLocaleToPath(path: string, locale: string): string {
  if (path === "/") {
    return `/${locale}/`;
  }
  return `/${locale}${path}`;
}

/**
 * Language switcher dropdown component
 * Allows users to switch between documentation locales while staying on the same page.
 * Uses shadcn/ui DropdownMenu for polished appearance.
 */
export function LanguageSwitcher({
  locales,
  currentLocale,
  defaultLocale,
  currentPath,
  className,
}: LanguageSwitcherProps) {
  const localeKeys = Object.keys(locales);
  if (!locales || localeKeys.length === 0) {
    return null;
  }

  const activeLocale = currentLocale || defaultLocale || localeKeys[0];
  const activeLocaleConfig = locales[activeLocale];

  /**
   * Get the target URL when switching to a different locale
   * Tries to maintain the same page path, with locale prefix adjusted
   */
  function getLocaleUrl(targetLocale: string): string {
    // Strip current locale from path to get the base path
    const basePath = currentLocale
      ? stripLocaleFromPath(currentPath, currentLocale)
      : currentPath;

    // Add target locale prefix
    return addLocaleToPath(basePath, targetLocale);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5", className)}
        >
          <Globe className="h-4 w-4" />
          <span>{activeLocaleConfig?.label || activeLocale}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[140px]">
        {localeKeys.map((localeKey) => {
          const localeConfig = locales[localeKey];
          const isSelected = localeKey === activeLocale;
          const isDefault = localeKey === defaultLocale;

          return (
            <DropdownMenuItem key={localeKey} asChild>
              <a
                href={getLocaleUrl(localeKey)}
                className={cn(
                  "flex items-center justify-between",
                  isSelected && "text-primary font-medium"
                )}
              >
                <span className="flex items-center gap-2">
                  {localeConfig.label}
                  {isDefault && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1 py-0"
                    >
                      default
                    </Badge>
                  )}
                </span>
                {isSelected && <Check className="h-4 w-4" />}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
