/**
 * First tab stop on every page. Visually hidden until focused, then it lets
 * keyboard users jump past the header, search and category nav.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-secondary focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
