// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Smile,
//   Paperclip,
//   Mic,
//   SendHorizontal,
//   Image as ImageIcon,
//   X,
//   FileText,
//   Music,
//   Video,
//   File,
// } from "lucide-react";
// import Emojipicker from "EmojiPicker";
// // import EmojiPicker from "./EmojiPicker";
// const TYPING_STOP_DELAY_MS = 5000;

// // Accepted file types
// const FILE_TYPES = {
//   image: { accept: "image/*", icon: ImageIcon, label: "Photo" },
//   video: { accept: "video/*", icon: Video, label: "Video" },
//   document: {
//     accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg",
//     icon: FileText,
//     label: "Document",
//   },
// };

// // Format file size for display
// const formatFileSize = (bytes) => {
//   if (bytes === 0) return "0 B";
//   const k = 1024;
//   const sizes = ["B", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
// };

// // Get file type category
// const getFileCategory = (file) => {
//   if (file.type.startsWith("image/")) return "image";
//   if (file.type.startsWith("video/")) return "video";
//   return "document";
// };

// // Get icon for file type
// const getFileIcon = (file) => {
//   if (file.type.startsWith("image/")) return ImageIcon;
//   if (file.type.startsWith("video/")) return Music;
//   if (file.type.includes("pdf")) return FileText;
//   return File;
// };

// export default function MessageInput({ onSend, onTyping, disabled = false, attachedFiles1 }) {
//   const [message, setMessage] = useState("");
//   const [attachedFiles, setAttachedFiles] = useState([]);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const fileInputRef = useRef(null);
//   const fileTypeRef = useRef(null);

//   const isTypingRef = useRef(false);
//   const typingTimeoutRef = useRef(null);

//   const stopTyping = () => {
//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = null;
//     }

//     if (isTypingRef.current) {
//       isTypingRef.current = false;
//       onTyping?.(false);
//     }
//   };

//   const handleChange = (e) => {
//     const value = e.target.value;
//     setMessage(value);

//     if (!onTyping) return;

//     if (!value.trim()) {
//       stopTyping();
//       return;
//     }

//     if (!isTypingRef.current) {
//       isTypingRef.current = true;
//       onTyping(true);
//     }

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       isTypingRef.current = false;
//       onTyping(false);
//     }, TYPING_STOP_DELAY_MS);
//   };

//   const handleSend = () => {
//     const hasMessage = message.trim();
//     const hasFiles = attachedFiles.length > 0;

//     if ((!hasMessage && !hasFiles) || disabled) return;

//     if (onSend) {
//       onSend({
//         id: Date.now(),
//         text: message.trim(),
//         files: attachedFiles,
//         time: new Date().toLocaleTimeString([], {
//           day:"2-digit",
//           month:"2-digit",
//           year:"2-digit",
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         status: "sent",
//       });
//     }
//     console.log(attachedFiles)
//     setMessage("");
//     setAttachedFiles([]);
//     stopTyping();
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleFileSelect = (e, fileType = null) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Check file size (max 50MB)
//     const maxSize = 50000 * 1024 * 1024;
//     if (file.size > maxSize) {
//       alert(`File is too large. Maximum size is 50MB. Got ${formatFileSize(file.size)}`);
//       return;
//     }

//     // Create file object with metadata
//     const fileObj = {
//       id: Date.now() + Math.random(),
//       file,
//       name: file.name,
//       size: file.size,
//       type: file.type,
//       category: getFileCategory(file),
//     };

//     setAttachedFiles([...attachedFiles, fileObj]);

//     // Reset input
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     if (fileTypeRef.current) fileTypeRef.current.value = "";
//   };

//   const removeFile = (fileId) => {
//     setAttachedFiles(attachedFiles.filter((f) => f.id !== fileId));
//   };

//   useEffect(() => {
//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       if (isTypingRef.current) {
//         onTyping?.(false);
//       }
//     };
//   }, []);

//   return (
//     <>
//       <input
//         ref={fileInputRef}
//         type="file"
//         onChange={handleFileSelect}
//         hidden
//       />

//       <div className="border-t border-chronix-deep/10 bg-white p-5">
//         {/* Attached Files Preview */}
//         {attachedFiles.length > 0 && (
//           <div className="mb-4 flex flex-wrap gap-3">
//             {attachedFiles.map((fileObj) => {
//               const IconComponent = getFileIcon(fileObj.file);
//               return (
//                 <div
//                   key={fileObj.id}
//                   className="flex items-center gap-2 rounded-lg border border-chronix-secondary/30 bg-chronix-elevated px-3 py-2 text-sm"
//                 >
//                   <IconComponent size={16} className="text-chronix-accent" />
//                   <div className="flex flex-col">
//                     <span className="max-w-[150px] truncate text-chronix-label">
//                       {fileObj.name}
//                     </span>
//                     <span className="text-xs text-slate-400">
//                       {formatFileSize(fileObj.size)}
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => removeFile(fileObj.id)}
//                     className="ml-1 rounded p-1 hover:bg-chronix-primary/20"
//                     title="Remove file"
//                   >
//                     <X size={14} className="text-chronix-label" />
//                   </button>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Input Controls */}
//         <div className="flex items-end gap-3">
//           {/* Emoji */}
//           <div className="relative">
//             <button
//               type="button"
//               disabled={disabled}
//               onClick={() => setShowEmojiPicker((current) => !current)}
//               className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-600"
//               title="Emoji"
//             >
//               <Smile size={22} />
//             </button>

//             {showEmojiPicker && (
//               <div className="absolute bottom-14 left-0 z-50">
//                 <Emojipicker
//                   onEmojiSelect={(emoji) => {
//                     setMessage((current) => current + emoji);
//                   }}
//                   onClose={() => setShowEmojiPicker(false)}
//                 />

//                 </div>
//             )}
//           </div>

//           {/* Photo */}
//           <button
//             onClick={() => {
//               const input = document.createElement("input");
//               input.type = "file";
//               input.accept = FILE_TYPES.image.accept;
//               input.onchange = (e) => handleFileSelect(e, "image");
//               input.click();
//             }}
//             disabled={disabled}
//             className="rounded-xl p-3 text-slate-400 transition hover:bg-chronix-secondary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//             title="Attach Photo"
//           >
//             <ImageIcon size={22} />
//           </button>

//           {/* Video */}
//           <button
//             onClick={() => {
//               const input = document.createElement("input");
//               input.type = "file";
//               input.accept = FILE_TYPES.video.accept;
//               input.onchange = (e) => handleFileSelect(e, "video");
//               input.click();
//             }}
//             disabled={disabled}
//             className="rounded-xl p-3 text-slate-400 transition hover:bg-chronix-secondary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//             title="Attach Video"
//           >
//             {/* <Music size={22} /> */}
//             <Video size={22} />
//           </button>

//           {/* Document */}
//           <button
//             onClick={() => {
//               const input = document.createElement("input");
//               input.type = "file";
//               input.accept = FILE_TYPES.document.accept;
//               input.onchange = (e) => handleFileSelect(e, "document");
//               input.click();
//             }}
//             disabled={disabled}
//             className="rounded-xl p-3 text-slate-400 transition hover:bg-chronix-secondary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//             title="Attach Document"
//           >
//             <Paperclip size={22} />
//           </button>

//           {/* Message Box */}
//           <textarea
//             rows={1}
//             placeholder="Type a secure message..."
//             value={message}
//             onChange={handleChange}
//             onKeyDown={handleKeyDown}
//             disabled={disabled}
//             className="max-h-40 min-h-[52px] flex-1 resize-none rounded-2xl border border-chronix-deep/15 bg-chronix-surface px-5 py-3 text-black outline-none transition hover:border-chronix-secondary focus:border-chronix-primary focus:ring-2 focus:ring-chronix-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
//           />

//           {/* Microphone */}
//           <button
//             disabled={disabled}
//             className="rounded-xl p-3 text-slate-400 transition hover:bg-chronix-secondary/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
//             title="Voice Message"
//           >
//             <Mic size={22} />
//           </button>

//           {/* Send */}
//           <button
//             onClick={handleSend}
//             disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
//             className="chronix-primary rounded-2xl p-4 disabled:cursor-not-allowed disabled:opacity-50"
//             title="Send"
//           >
//             <SendHorizontal size={20} />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Smile,
  Paperclip,
  Mic,
  SendHorizontal,
  Image as ImageIcon,
  X,
  FileText,
  Video,
  File,
} from "lucide-react";
import EmojiPicker from "./EmojiPickerTemp";

const TYPING_STOP_DELAY_MS = 5000;

// Accepted file types
const FILE_TYPES = {
  image: { accept: "image/*", icon: ImageIcon, label: "Photo" },
  video: { accept: "video/*", icon: Video, label: "Video" },
  document: {
    accept: ".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg",
    icon: FileText,
    label: "Document",
  },
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Get file type category
const getFileCategory = (file) => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "document";
};

// Get icon for file type
const getFileIcon = (file) => {
  if (file.type.startsWith("image/")) return ImageIcon;
  if (file.type.startsWith("video/")) return Video;
  if (file.type.includes("pdf")) return FileText;
  return File;
};

export default function MessageInput({ onSend, onTyping, disabled = false }) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping?.(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!onTyping) return;

    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, TYPING_STOP_DELAY_MS);
  };

  const handleSend = () => {
    const hasMessage = message.trim();
    const hasFiles = attachedFiles.length > 0;

    if ((!hasMessage && !hasFiles) || disabled) return;

    if (onSend) {
      onSend({
        id: Date.now(),
        text: message.trim(),
        files: attachedFiles,
        time: new Date().toLocaleString([], {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      });
    }

    setMessage("");
    setAttachedFiles([]);
    stopTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create file object with metadata
    const fileObj = {
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file),
    };

    setAttachedFiles((prev) => [...prev, fileObj]);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = (acceptType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptType;
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTyping?.(false);
      }
    };
  }, []);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        hidden
      />

      <div className="border-t border-chronix-deep/10 bg-white p-5">
        {/* Attached Files Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {attachedFiles.map((fileObj) => {
              const IconComponent = getFileIcon(fileObj.file);
              return (
                <div
                  key={fileObj.id}
                  className="flex items-center gap-2 rounded-lg border border-chronix-secondary/30 bg-chronix-elevated px-3 py-2 text-sm"
                >
                  <IconComponent size={16} className="text-chronix-accent" />
                  <div className="flex flex-col">
                    <span className="max-w-[150px] truncate text-chronix-label">
                      {fileObj.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatFileSize(fileObj.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(fileObj.id)}
                    className="ml-1 rounded p-1 hover:bg-chronix-primary/20"
                    title="Remove file"
                  >
                    <X size={14} className="text-chronix-label" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Input Controls */}
        <div className="flex items-end gap-3">
          {/* Emoji */}
          <div className="relative">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowEmojiPicker((current) => !current)}
              className="rounded-xl p-3 text-slate-500 transition hover:bg-slate-100 hover:text-cyan-600"
              title="Emoji"
            >
              <Smile size={22} />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-14 left-0 z-50">
                <EmojiPicker
                  onEmojiSelect={(emoji) => {
                    setMessage((current) => current + emoji);
                  }}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Photo */}
          <button
            type="button"
            onClick={() => triggerFileInput(FILE_TYPES.image.accept)}
            disabled={disabled}
            className="rounded-xl p-3 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Attach Photo"
          >
            <ImageIcon size={22} />
          </button>

          {/* Video */}
          <button
            type="button"
            onClick={() => triggerFileInput(FILE_TYPES.video.accept)}
            disabled={disabled}
            className="rounded-xl p-3 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Attach Video"
          >
            <Video size={22} />
          </button>

          {/* Document */}
          <button
            type="button"
            onClick={() => triggerFileInput(FILE_TYPES.document.accept)}
            disabled={disabled}
            className="rounded-xl p-3 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Attach Document"
          >
            <Paperclip size={22} />
          </button>

          {/* Message Box */}
          <textarea
            rows={1}
            placeholder="Type a secure message..."
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="max-h-40 min-h-[52px] flex-1 resize-none rounded-2xl border border-chronix-deep/15 bg-chronix-surface px-5 py-3 text-black outline-none transition hover:border-chronix-secondary focus:border-chronix-primary focus:ring-2 focus:ring-chronix-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Microphone */}
          <button
            type="button"
            disabled={disabled}
            className="rounded-xl p-3 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Voice Message"
          >
            <Mic size={22} />
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={(!message.trim() && attachedFiles.length === 0) || disabled}
            className="rounded-2xl bg-cyan-700 p-4 text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-40"
            title="Send"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
