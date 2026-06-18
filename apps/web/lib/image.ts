export interface EmojiInfo {
  isEmoji: boolean;
  emoji: string;
  bg: string;
  bgColor: string;
}

export function parseEmojiImage(url: string | null | undefined): EmojiInfo {
  if (url && url.startsWith("emoji://")) {
    const match = url.match(/emoji:\/\/([^?]+)\?bg=(.+)/);
    if (match) {
      const emoji = decodeURIComponent(match[1]);
      const bg = decodeURIComponent(match[2]);
      
      // Extract inline background color if it matches bg-[#...]
      let bgColor = "#edf6ee";
      if (bg.startsWith("#")) {
        bgColor = bg;
      } else {
        const hexMatch = bg.match(/bg-\[([^\]]+)\]/);
        if (hexMatch) {
          bgColor = hexMatch[1];
        }
      }
      
      return {
        isEmoji: true,
        emoji,
        bg,
        bgColor,
      };
    }
  }
  return {
    isEmoji: false,
    emoji: "🌿",
    bg: "bg-[#edf6ee]",
    bgColor: "#edf6ee",
  };
}
