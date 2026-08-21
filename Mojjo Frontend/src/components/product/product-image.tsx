import Image from "next/image";
import { cn } from "@/lib/utils";

export interface ProductImageProps {
  src: string;
  alt: string;
  /** Responsive `sizes` hint — required for correct srcset selection. */
  sizes: string;
  className?: string;
  imageClassName?: string;
  /** Set on the LCP image (hero, product detail) to skip lazy loading. */
  eager?: boolean;
}

/**
 * Every catalogue image goes through here so aspect ratio, object-fit,
 * background and the hover zoom stay identical across the app.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  eager = false,
}: ProductImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-sunken", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
