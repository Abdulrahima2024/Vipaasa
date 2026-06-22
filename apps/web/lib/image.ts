export interface EmojiInfo {
  isEmoji: boolean;
  emoji: string;
  bg: string;
  bgColor: string;
}

export function parseEmojiImage(url: string | null | undefined): EmojiInfo {
  if (url && typeof url === "string" && url.startsWith("emoji://")) {
    // Extract emoji part before any query parameters
    const questionMarkIndex = url.indexOf("?");
    const emojiPart = questionMarkIndex !== -1 ? url.substring(8, questionMarkIndex) : url.substring(8);
    const emoji = decodeURIComponent(emojiPart) || "🌿";

    // Extract background color robustly
    let bgColor = "#edf6ee";
    let bg = "bg-[#edf6ee]";

    try {
      const decodedUrl = decodeURIComponent(url);
      
      // Look for a hex color code (e.g., #fffde7 or #fff)
      const hexMatch = decodedUrl.match(/#([0-9a-fA-F]{3,6})/);
      if (hexMatch) {
        bgColor = `#${hexMatch[1]}`;
        bg = `bg-[${bgColor}]`;
      } else {
        // Check for Tailwind bg-[color] pattern
        const tailwindMatch = decodedUrl.match(/bg-\[([^\]]+)\]/);
        if (tailwindMatch) {
          bgColor = tailwindMatch[1];
          bg = `bg-[${bgColor}]`;
        }
      }
    } catch (e) {
      console.error("Failed to parse emoji background color:", e);
    }

    return {
      isEmoji: true,
      emoji,
      bg,
      bgColor,
    };
  }
  return {
    isEmoji: false,
    emoji: "🌿",
    bg: "bg-[#edf6ee]",
    bgColor: "#edf6ee",
  };
}
