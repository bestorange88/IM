import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const emojis = [
    "😀", "😊", "😂", "😍", "😎", "😭", "😤", "😴",
    "👍", "👎", "👌", "✌️", "🤞", "🙏", "💪", "❤️",
    "💔", "💕", "🔥", "💯", "🎉", "🎊", "🎁", "🌟",
    "⭐", "🌈", "🌞", "🌙", "☀️", "⛅", "🌧️", "⛄",
    "🍎", "🍊", "🍋", "🍌", "🍇", "🍓", "🍑", "🍒",
    "🍕", "🍔", "🍟", "🌭", "🍿", "🍩", "🍪", "🎂",
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
    "⚽", "🏀", "🏈", "🎾", "🏐", "🏓", "🏸", "🥅",
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose} />
      <div className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border max-w-md mx-auto z-40 h-64">
        <ScrollArea className="p-4 h-full">
          <div className="grid grid-cols-8 gap-2">
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                className="text-2xl hover:bg-gray-100 p-1 rounded h-12 w-12"
                onClick={() => onEmojiSelect(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}