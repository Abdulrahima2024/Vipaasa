import React from "react";
import Image, { ImageProps } from "next/image";
import { parseEmojiImage } from "../../lib/image";

interface ProductImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
  emojiClassName?: string;
}

export default function ProductImage({
  src,
  fallbackSrc = "/placeholder.jpg",
  alt,
  className = "",
  emojiClassName = "text-5xl",
  ...props
}: ProductImageProps) {
  const imageSrc = src || fallbackSrc;
  const emojiInfo = parseEmojiImage(imageSrc);

  if (emojiInfo.isEmoji || (imageSrc && imageSrc.startsWith("emoji://"))) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center select-none ${className}`}
        style={{ backgroundColor: emojiInfo.bgColor }}
      >
        <span className={emojiClassName}>{emojiInfo.emoji}</span>
      </div>
    );
  }

  // Standardize relative paths to make sure they start with "/"
  let cleanSrc = imageSrc;
  if (!cleanSrc.startsWith("/") && !cleanSrc.startsWith("http://") && !cleanSrc.startsWith("https://")) {
    cleanSrc = `/${cleanSrc}`;
  }

  return (
    <Image
      src={cleanSrc}
      alt={alt || "Product image"}
      className={className}
      {...props}
    />
  );
}
