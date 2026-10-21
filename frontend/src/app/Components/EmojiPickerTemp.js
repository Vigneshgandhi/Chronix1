"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Smile,
  Heart,
  PawPrint,
  Utensils,
  Trophy,
  Car,
  Lightbulb,
  Clock3,
  X,
} from "lucide-react";

const EMOJI_CATEGORIES = {
  recent: {
    label: "Recent",
    icon: Clock3,
    emojis: [],
  },

  smileys: {
    label: "Smileys",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
      "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
      "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
      "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒",
      "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖",
      "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡",
      "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰",
      "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢", "🫡",
      "🤫", "🫠", "🤥", "😶", "😐", "😑", "😬", "🙄",
      "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤",
      "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷",
    ],
  },

  people: {
    label: "People",
    icon: Heart,
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏",
      "✌️", "🤞", "🫰", "🤟", "🤘", "🤙", "👈", "👉",
      "👆", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛",
      "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏",
      "✍️", "💅", "🤳", "💪", "🦾", "🦵", "🦶", "👂",
      "👃", "🧠", "🫀", "🫁", "🦷", "👀", "👁️", "👅",
      "👄", "🫦", "💋", "👶", "🧒", "👦", "👧", "🧑",
      "👱", "👨", "🧔", "👩", "🧓", "👴", "👵",
    ],
  },

  animals: {
    label: "Animals",
    icon: PawPrint,
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
      "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵",
      "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤",
      "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄",
      "🐝", "🪱", "🐛", "🦋", "🐌", "🐞", "🐜", "🪰",
      "🕷️", "🦂", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀",
      "🐠", "🐟", "🐡", "🐬", "🐳", "🦈", "🐊",
    ],
  },

  food: {
    label: "Food",
    icon: Utensils,
    emojis: [
      "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇",
      "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥",
      "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️",
      "🌽", "🥕", "🧄", "🧅", "🥔", "🍠", "🥐", "🥯",
      "🍞", "🥖", "🥨", "🧀", "🥚", "🍳", "🥞", "🧇",
      "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯",
      "🍜", "🍝", "🍣", "🍱", "🍛", "🍚", "🍰", "🎂",
      "🍫", "🍿", "☕", "🍵", "🥤",
    ],
  },

  activities: {
    label: "Activities",
    icon: Trophy,
    emojis: [
      "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
      "🥏", "🎱", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏",
      "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊",
      "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🎿", "🏂",
      "🏋️", "🤸", "🏊", "🚴", "🎮", "🎲", "🧩", "♟️",
      "🎨", "🎭", "🎤", "🎧", "🎸", "🎹", "🥁",
    ],
  },

  travel: {
    label: "Travel",
    icon: Car,
    emojis: [
      "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
      "🚒", "🚐", "🛻", "🚚", "🚛", "🏍️", "🛵", "🚲",
      "🛴", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠",
      "🚃", "🚋", "🚞", "🚝", "🚄", "🚅", "🚈", "🚂",
      "✈️", "🛫", "🛬", "🚀", "🛸", "🚁", "⛵", "🚤",
      "🛳️", "⛴️", "🚢", "🗺️", "🗽", "🗼", "🏰", "🏝️",
    ],
  },

  objects: {
    label: "Objects",
    icon: Lightbulb,
    emojis: [
      "⌚", "📱", "💻", "⌨️", "🖥️", "🖨️", "🖱️", "💾",
      "💿", "📷", "📸", "📹", "🎥", "📞", "☎️", "📺",
      "📻", "🎙️", "⏰", "⌛", "🔋", "🔌", "💡", "🔦",
      "🕯️", "🧯", "💰", "💎", "🔧", "🔨", "🛠️", "🧲",
      "🔑", "🗝️", "🚪", "🪑", "🛏️", "📦", "✉️", "📧",
      "📚", "📖", "📝", "✏️", "📌", "📎", "🔒", "🔐",
    ],
  },
};

const DEFAULT_RECENTS = ["😂", "❤️", "👍", "😭", "🔥", "😊", "🙏", "🤣"];

const RECENT_KEY = "chronix-recent-emojis";

export default function EmojiPicker({
  onEmojiSelect,
  onClose,
  className = "",
}) {
  const [activeCategory, setActiveCategory] = useState("smileys");
  const [search, setSearch] = useState("");
  const [recentEmojis, setRecentEmojis] = useState(DEFAULT_RECENTS);

  const pickerRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setRecentEmojis(parsed);
        }
      }
    } catch (error) {
      console.error("Unable to load recent emojis:", error);
    }
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        onClose?.();
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const displayedEmojis = useMemo(() => {
    if (search.trim()) {
      /*
       * Without a full emoji metadata database, search is performed
       * against category names.
       */

      const query = search.toLowerCase();

      return Object.entries(EMOJI_CATEGORIES)
        .filter(([key, category]) => {
          return (
            key.toLowerCase().includes(query) ||
            category.label.toLowerCase().includes(query)
          );
        })
        .flatMap(([key, category]) =>
          key === "recent" ? recentEmojis : category.emojis
        );
    }

    if (activeCategory === "recent") {
      return recentEmojis;
    }

    return EMOJI_CATEGORIES[activeCategory]?.emojis || [];
  }, [activeCategory, search, recentEmojis]);

  function handleEmojiClick(emoji) {
    const updated = [
      emoji,
      ...recentEmojis.filter((item) => item !== emoji),
    ].slice(0, 24);

    setRecentEmojis(updated);

    try {
      localStorage.setItem(
        RECENT_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Unable to save recent emoji:", error);
    }

    onEmojiSelect?.(emoji);
  }

  return (
    <div
      ref={pickerRef}
      className={`
        w-[350px]
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
        shadow-2xl
        ${className}
      `}
    >
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            Emojis
          </h3>

          <p className="text-xs text-slate-500">
            Add an emoji to your message
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* SEARCH */}

      <div className="p-3">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="
              w-full
              rounded-xl
              border border-slate-200
              bg-slate-50
              py-2.5
              pl-10
              pr-4
              text-sm
              text-slate-900
              outline-none
              transition
              focus:border-cyan-500
              focus:ring-2
              focus:ring-cyan-500/10
            "
          />
        </div>
      </div>

      {/* CATEGORY NAVIGATION */}

      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-100 px-3 pb-2">
        {Object.entries(EMOJI_CATEGORIES).map(
          ([key, category]) => {
            const Icon = category.icon;
            const active = activeCategory === key;

            return (
              <button
                key={key}
                type="button"
                title={category.label}
                onClick={() => {
                  setSearch("");
                  setActiveCategory(key);
                }}
                className={`
                  flex min-w-10 items-center justify-center
                  rounded-lg p-2
                  transition
                  ${
                    active
                      ? "bg-cyan-50 text-cyan-600"
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  }
                `}
              >
                <Icon size={18} />
              </button>
            );
          }
        )}
      </div>

      {/* CATEGORY TITLE */}

      <div className="px-4 pb-1 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {search
            ? "Search results"
            : EMOJI_CATEGORIES[activeCategory]?.label}
        </p>
      </div>

      {/* EMOJIS */}

      <div className="h-[270px] overflow-y-auto px-3 pb-4">
        {displayedEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {displayedEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="
                  flex h-10 w-10
                  items-center
                  justify-center
                  rounded-lg
                  text-2xl
                  transition
                  hover:scale-110
                  hover:bg-slate-100
                  active:scale-95
                "
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Smile
              size={32}
              className="mb-3 text-slate-300"
            />

            <p className="text-sm font-medium text-slate-600">
              No emojis found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try another category
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}

      <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
        <p className="text-center text-[11px] text-slate-400">
          Chronix Emoji Picker
        </p>
      </div>
    </div>
  );
}