import type { SocialPlatform } from "@/config/site";

/**
 * Brand marks are shipped locally rather than pulled from an icon library:
 * lucide dropped brand glyphs in v1, and logos need their own artwork anyway.
 */
const paths: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M15.4 8.2h-1.9c-.5 0-.9.4-.9.9v2h2.8l-.4 2.9h-2.4v7.4H9.6v-7.4H7.2v-2.9h2.4V9.1a3.8 3.8 0 0 1 3.8-3.8h2v2.9Z" />
  ),
  x: (
    <path d="M3 3h4.9l4.5 6 5.2-6H21l-6.9 7.9L21.4 21h-4.9l-4.9-6.5L5 21H2.4l7.4-8.4L3 3Z" />
  ),
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[platform]}
    </svg>
  );
}
