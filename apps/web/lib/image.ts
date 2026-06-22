export interface EmojiInfo {
  isEmoji: boolean;
  emoji: string;
  bg: string;
  bgColor: string;
  imageUrl: string;
}

export function parseEmojiImage(url: string | null | undefined): EmojiInfo {
  const placeholder = "https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&q=80&w=400";
  const isInvalid = !url || url.startsWith("emoji://") || (!url.startsWith("http://") && !url.startsWith("https://"));
  const safeUrl = isInvalid ? placeholder : url;

  // Since we want to temporarily replace all images with the placeholder,
  // we will return isEmoji: false and use the placeholder URL.
  return {
    isEmoji: false,
    emoji: "🌿",
    bg: "bg-[#edf6ee]",
    bgColor: "#edf6ee",
    imageUrl: safeUrl,
  };
}
