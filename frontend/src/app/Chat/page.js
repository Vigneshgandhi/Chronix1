"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import ChatHeader from "../Components/ChatHeader";
import ChatSidebar from "../Components/ChatSidebar";
import MessageList from "../Components/MessageList";
import TypingIndicator from "../Components/TypingIndicator";
import MessageInput from "../Components/MessageInput";
import ChatProfile from "../Components/ChatProfile";
import ProfileSetup from "../Components/ProfileSetup";
import DeviceLogin from "../Components/DeviceLogin";
import SecurityUnlock from "../Components/SecurityUnlock";
import CallManager from "../Components/CallManager";
import { initializeChronixStorage } from "../utils/Storagemanager";
import { createSecuritySetup, decryptMessage, encryptFile, encryptMessage, getSecurityRecord, storeSecurityRecord, unlockSecurity } from "../utils/crypto";

const PROFILE_STORAGE_KEY = "chronix-profile";
const DEVICE_ID_DATABASE = "chronix";
const DEVICE_ID_STORE = "device-settings";
const LEGACY_MESSAGE_STORE = "chat-messages";

const AVATAR_CHOICES = ["🙂", "😎", "🦊", "🐼", "🚀", "🌙", "⚡", "🎧"];

// Keep the fallback aligned with backend/.env. Set NEXT_PUBLIC_SOCKET_URL for
// production or when the backend is running on another host.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

function buildDefaultProfile(deviceId) {
  return {
    name: `Device ${deviceId.slice(0, 8)}`,
    avatarEmoji: AVATAR_CHOICES[0],
    statusMessage: "",
  };
}

/* =========================================================
   IndexedDB
   ========================================================= */

function openDeviceDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DEVICE_ID_DATABASE, 3);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(DEVICE_ID_STORE)) {
        database.createObjectStore(DEVICE_ID_STORE);
      }

      // Messages now come exclusively from the authenticated backend history.
      if (database.objectStoreNames.contains(LEGACY_MESSAGE_STORE)) {
        database.deleteObjectStore(LEGACY_MESSAGE_STORE);
      }

    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getStoredProfile() {
  const database = await openDeviceDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(DEVICE_ID_STORE, "readonly");
      const store = transaction.objectStore(DEVICE_ID_STORE);
      const request = store.get(PROFILE_STORAGE_KEY);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } finally {
    database.close();
  }
}

async function storeProfile(profile) {
  const database = await openDeviceDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(DEVICE_ID_STORE, "readwrite");
      const store = transaction.objectStore(DEVICE_ID_STORE);

      store.put(profile, PROFILE_STORAGE_KEY);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

function createChatId(deviceA, deviceB) {
  if (!deviceA || !deviceB) return null;
  return [deviceA, deviceB].sort().join(":");
}

export default function ChatPage() {
  const [deviceId, setDeviceId] = useState(null);
  const [deviceLoginRequired, setDeviceLoginRequired] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);
  const [securityUnlockRequired, setSecurityUnlockRequired] = useState(false);
  const [securityRecord, setSecurityRecord] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [typingChatIds, setTypingChatIds] = useState({});
  const [moderationNotice, setModerationNotice] = useState("");

  /* Calling States */
  const [showCall, setShowCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  /* Socket States */
  const [connectionStatus, setConnectionStatus] = useState("Connecting");
  const [connectionError, setConnectionError] = useState("");
  const [socket, setSocket] = useState(null);

  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);

  const currentChatId = selectedChat?.chatId;
  const messages = currentChatId ? messagesByChat[currentChatId] || [] : [];
  const isTyping = currentChatId
    ? Boolean(typingChatIds[currentChatId])
    : false;

  function handleCloseCall() {
    setShowCall(false);
    setIncomingCall(null);
    setCallType(null);
  }

  useEffect(() => {
    let activeSocket = null;
    let cancelled = false;
    initializeChronixStorage();
    async function initializeChronix() {
      try {
        setConnectionStatus("Connecting");
        setConnectionError("");

        /* Step 1: Device ID */
        let storedDeviceId = window.localStorage.getItem("chronix-device-login");

        if (!storedDeviceId) {
          setDeviceLoginRequired(true);
          setConnectionStatus("Disconnected");
          return;
        }

        if (cancelled) return;
        setDeviceId(storedDeviceId);

        /* Step 2: Profile */
        let storedProfile = await getStoredProfile();
        const needsSetup = !storedProfile || /^Device\s/i.test(storedProfile.name || "");
        if (needsSetup) {
          storedProfile = buildDefaultProfile(storedDeviceId);
        }

        if (cancelled) return;
        setProfile(storedProfile);
        setProfileSetupRequired(needsSetup);

        const storedSecurity = await getSecurityRecord();
        if (!storedSecurity || !privateKey) {
          setSecurityRecord(storedSecurity);
          setSecurityUnlockRequired(Boolean(storedSecurity));
          setProfileSetupRequired(!storedSecurity);
          return;
        }

        /* Step 3: Socket Connection. Messages are retrieved from the backend
           for the selected conversation and are never cached in IndexedDB. */
        activeSocket = io(BACKEND_URL, {
          auth: {
            deviceId: storedDeviceId,
            profile: storedProfile,
            publicKey: storedSecurity.publicKey,
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          timeout: false,
        });

        socketRef.current = activeSocket;
        setSocket(activeSocket);

        activeSocket.on("connect", () => {
          if (cancelled) return;
          setConnectionStatus("Connected");
          setConnectionError("");

          activeSocket.emit("device:list", (deviceList) => {
            if (cancelled || !Array.isArray(deviceList)) return;
            setDevices(
              deviceList
                .filter((device) => device?.deviceId && device.deviceId !== storedDeviceId)
                .map((device) => ({
                  deviceId: device.deviceId,
                  online: Boolean(device.online),
                  name: device.name,
                  avatarEmoji: device.avatarEmoji,
                  statusMessage: device.statusMessage || "",
                }))
            );
          });

          if (selectedChatRef.current?.chatId) {
            activeSocket.emit("chat:join", selectedChatRef.current.chatId);
          }
        });

        activeSocket.on("disconnect", (reason) => {
          if (cancelled) return;
          setConnectionStatus("Disconnected");
        });

        activeSocket.on("connect_error", (error) => {
          if (cancelled) return;
          setConnectionStatus("Disconnected");
          setConnectionError(
            error?.message || "Unable to connect to Chronix server."
          );
        });

        activeSocket.on("device:online", (device) => {
          if (!device?.deviceId || device.deviceId === storedDeviceId) return;

          const profileFields = {
            name: device.profile?.name,
            avatarEmoji: device.profile?.avatarEmoji,
            statusMessage: device.profile?.statusMessage,
          };

          setDevices((currentDevices) => {
            const exists = currentDevices.some(
              (item) => item.deviceId === device.deviceId
            );

            if (!exists) return currentDevices;

            return currentDevices.map((item) =>
              item.deviceId === device.deviceId
                ? { ...item, online: true, ...profileFields }
                : item
            );
          });

          setSelectedChat((currentChat) => {
            if (currentChat?.deviceId !== device.deviceId) return currentChat;
            return {
              ...currentChat,
              online: true,
              name: device.profile?.name || currentChat.name,
              avatarEmoji:
                device.profile?.avatarEmoji || currentChat.avatarEmoji,
            };
          });
        });

        activeSocket.on("device:connected", (device) => {
          if (cancelled || !device?.deviceId || device.deviceId === storedDeviceId) {
            return;
          }

          const profileFields = {
            name: device.profile?.name,
            avatarEmoji: device.profile?.avatarEmoji,
            statusMessage: device.profile?.statusMessage,
          };

          setDevices((currentDevices) => {
            const exists = currentDevices.some(
              (item) => item.deviceId === device.deviceId
            );

            if (exists) {
              return currentDevices.map((item) =>
                item.deviceId === device.deviceId
                  ? { ...item, online: true, ...profileFields }
                  : item
              );
            }

            return [
              ...currentDevices,
              { deviceId: device.deviceId, online: true, ...profileFields },
            ];
          });
        });

        activeSocket.on(
          "profile:update",
          ({ deviceId: updatedDeviceId, profile: updatedProfile } = {}) => {
            if (!updatedDeviceId || !updatedProfile) return;
            if (updatedDeviceId === storedDeviceId) return;

            setDevices((currentDevices) =>
              currentDevices.map((item) =>
                item.deviceId === updatedDeviceId
                  ? {
                      ...item,
                      name: updatedProfile.name,
                      avatarEmoji: updatedProfile.avatarEmoji,
                      statusMessage: updatedProfile.statusMessage,
                    }
                  : item
              )
            );

            setSelectedChat((currentChat) => {
              if (currentChat?.deviceId !== updatedDeviceId) return currentChat;
              return {
                ...currentChat,
                name: updatedProfile.name || currentChat.name,
                avatarEmoji:
                  updatedProfile.avatarEmoji || currentChat.avatarEmoji,
                statusMessage: updatedProfile.statusMessage,
              };
            });
          }
        );

        activeSocket.on("device:offline", (device) => {
          if (!device?.deviceId) return;

          setDevices((currentDevices) =>
            currentDevices.map((item) =>
              item.deviceId === device.deviceId
                ? { ...item, online: false }
                : item
            )
          );

          setSelectedChat((currentChat) => {
            if (currentChat?.deviceId !== device.deviceId) return currentChat;
            return { ...currentChat, online: false };
          });
        });

        activeSocket.on("chat:message", async (message) => {
          if (!message || (!message.chatId && message.chatId !== 0)) return;
          try {
            const decrypted = await decryptMessage(message, privateKey);
            const chatId = String(message.chatId);
            const receivedMessage = { ...decrypted, ...message, chatId, type: "received" };

            setMessagesByChat((current) => ({ ...current, [chatId]: [...(current[chatId] || []), receivedMessage] }));
          } catch {
            setConnectionError("A message could not be decrypted on this device.");
          }

        });

        activeSocket.on("chat:message-pinned", ({ chatId, messageId }) => {
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).map((item) => String(item.id) === String(messageId) ? { ...item, pinned: true } : item) }));
        });
        activeSocket.on("chat:message-unpinned", ({ chatId, messageId }) => {
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).map((item) => String(item.id) === String(messageId) ? { ...item, pinned: false } : item) }));
        });
        activeSocket.on("chat:message-edited", ({ chatId, messageId, text }) => {
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).map((item) => String(item.id) === String(messageId) ? { ...item, text, edited: true } : item) }));
        });
        activeSocket.on("chat:message-deleted", ({ chatId, messageId }) => {
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).filter((item) => String(item.id) !== String(messageId)) }));
        });
        activeSocket.on("message:moderation:started", () => setModerationNotice("Checking message…"));
        activeSocket.on("message:moderation:completed", ({ status }) => {
          setModerationNotice(status === "removed" ? "Message removed by Chronix moderation." : status === "not_violation" ? "No violation was confirmed." : "Report submitted. Chronix is reviewing this message…");
        });
        activeSocket.on("message:moderated", ({ chatId, messageId, status }) => {
          if (status !== "removed") return;
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).map((item) => String(item.id) === String(messageId) ? { ...item, moderationStatus: "removed", pinned: false } : item) }));
          setModerationNotice("Message removed by Chronix moderation.");
        });
        activeSocket.on("moderation:content-removed", ({ chatId, messageId, dissolveAfterMs = 8000 }) => {
          if (!chatId || !messageId) return;
          setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).map((item) => String(item.id) === String(messageId) || String(item.id) === `${messageId}-sent` ? { ...item, text: "This content was removed by Chronix moderation.", files: [], moderationStatus: "removed", pinned: false } : item) }));
          setModerationNotice("Content removed by Chronix moderation.");
          window.setTimeout(() => {
            setMessagesByChat((current) => ({ ...current, [String(chatId)]: (current[String(chatId)] || []).filter((item) => String(item.id) !== String(messageId) && String(item.id) !== `${messageId}-sent`) }));
          }, Math.min(Math.max(Number(dissolveAfterMs) || 8000, 5000), 10000));
        });

        activeSocket.on("chat:typing", ({ chatId, isTyping }) => {
          if (!chatId) return;
          setTypingChatIds((current) => ({
            ...current,
            [String(chatId)]: Boolean(isTyping),
          }));
        });

        activeSocket.on("call:incoming", (call) => {
          console.log("Incoming call event:", call);
          setIncomingCall(call);
          setCallType(call.callType || "video");
          setShowCall(true);
        });
      } catch (error) {
        console.error("Chronix initialization failed:", error);
        if (cancelled) return;
        setConnectionStatus("Disconnected");
        setConnectionError(
          error?.message || "Unable to initialize Chronix."
        );
      }
    }

    initializeChronix();

    return () => {
      cancelled = true;
      if (activeSocket) {
        activeSocket.removeAllListeners();
        activeSocket.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
    };
  }, [privateKey]);

  /* =========================================================
     Chat Selection & Messaging
     ========================================================= */

  function handleSelectChat(chat) {
    if (!chat || !deviceId) return;
    const remoteDeviceId = chat.deviceId || chat.id;
    if (!remoteDeviceId) return;

    const chatId = createChatId(deviceId, remoteDeviceId);
    if (!chatId) return;

    if (
      selectedChatRef.current?.chatId &&
      selectedChatRef.current.chatId !== chatId
    ) {
      socketRef.current?.emit("chat:leave", selectedChatRef.current.chatId);
    }

    const normalizedChat = {
      ...chat,
      id: chatId,
      chatId,
      deviceId: remoteDeviceId,
      name: chat.name || `Device ${remoteDeviceId.slice(0, 8)}`,
      avatarEmoji: chat.avatarEmoji || AVATAR_CHOICES[0],
      statusMessage: chat.statusMessage || "",
      chronixId: remoteDeviceId,
      online: Boolean(chat.online),
    };

    selectedChatRef.current = normalizedChat;
    setSelectedChat(normalizedChat);

    if (socketRef.current?.connected) {
      socketRef.current.emit("chat:join", chatId);
      socketRef.current.emit("messages:history", { chatId }, (result) => {
        if (!result?.success || selectedChatRef.current?.chatId !== chatId) return;
        Promise.all((result.messages || []).map(async (storedMessage) => {
          try {
            return { ...await decryptMessage(storedMessage, privateKey), ...storedMessage, chatId, type: storedMessage.type || "received" };
          } catch {
            return null;
          }
        })).then((decryptedMessages) => setMessagesByChat((current) => ({ ...current, [chatId]: decryptedMessages.filter(Boolean) })));
      });
    }

    setTypingChatIds((current) => ({
      ...current,
      [chatId]: false,
    }));
  }

  function handleDeviceConnected(device) {
    if (!device?.deviceId) return;

    const connectedDevice = {
      deviceId: device.deviceId,
      online: typeof device.online === "boolean" ? device.online : true,
      name: device.name,
      avatarEmoji: device.avatarEmoji,
      statusMessage: device.statusMessage || "",
    };

    setDevices((currentDevices) => {
      const exists = currentDevices.some(
        (item) => item.deviceId === connectedDevice.deviceId
      );

      if (exists) {
        return currentDevices.map((item) =>
          item.deviceId === connectedDevice.deviceId
            ? { ...item, ...connectedDevice }
            : item
        );
      }

      return [...currentDevices, connectedDevice];
    });

    handleSelectChat(connectedDevice);
  }

  async function handleSend(message) {
    if (!selectedChat?.chatId) return;

    if (!socketRef.current?.connected) {
      setConnectionError("Chronix is disconnected. Message was not sent.");
      return;
    }

    const chatId = selectedChat.chatId;
    const targetDeviceId = selectedChat.deviceId;
    const publicKeyResponse = await fetch(`${BACKEND_URL}/api/security/public-key/${encodeURIComponent(targetDeviceId)}`);
    const publicKeyData = await publicKeyResponse.json();
    if (!publicKeyResponse.ok || !publicKeyData.publicKey) {
      setConnectionError("The recipient has not completed security setup.");
      return;
    }
    const rawFiles = Array.isArray(message.files)
      ? message.files
      : message.file
      ? [message.file]
      : [];
    const encryptedFiles = [];
    for (const fileEntry of rawFiles) {
      const file = fileEntry?.file instanceof File ? fileEntry.file : fileEntry instanceof File ? fileEntry : null;
      if (!file) {
        continue;
      }
      const transferId = `${deviceId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const emitAck = (event, payload) => new Promise((resolve) => socketRef.current.emit(event, payload, resolve));
      const encryptedFile = await encryptFile(file, publicKeyData.publicKey);
      const started = await emitAck("file:start", { transferId, chatId, name: `${file.name}.enc`, type: "application/octet-stream", size: encryptedFile.bytes.byteLength });
      if (!started?.success) throw new Error(started?.message || "Unable to start file upload.");
      const bytes = encryptedFile.bytes;
      const chunkSize = 256 * 1024;
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const result = await emitAck("file:chunk", { transferId, chunk: bytes.slice(offset, offset + chunkSize) });
        if (!result?.success) throw new Error("File upload failed.");
      }
      const completed = await emitAck("file:complete", { transferId });
      if (!completed?.success) throw new Error(completed?.message || "Unable to finish file upload.");
      encryptedFiles.push({ name: file.name, type: file.type, size: file.size, url: `${BACKEND_URL}${completed.url}`, encryptedFileKey: encryptedFile.encryptedFileKey, iv: encryptedFile.iv, authTag: encryptedFile.authTag, encryptionVersion: 1 });
    }

    const messageId = message.id || `${deviceId}-${Date.now()}`;
    const messagePayload = {
      text: message.text?.trim() || "",
      files: encryptedFiles,
      time: message.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    if (!messagePayload.text && encryptedFiles.length === 0) return;
    const encryptedEnvelope = await encryptMessage(messagePayload, publicKeyData.publicKey, deviceId, targetDeviceId);
    const outgoingMessage = {
      ...message,
      id: messageId,
      chatId,
      senderDeviceId: deviceId,
      sender: profile?.name || "You",
      text: message.text?.trim() || "",
      files: rawFiles,
      type: "sent",
      status: "sent",
      time:
        message.time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    setMessagesByChat((current) => ({
      ...current,
      [chatId]: [...(current[chatId] || []), outgoingMessage],
    }));

    socketRef.current.emit("chat:message", { ...encryptedEnvelope, id: messageId, chatId, timestamp: Date.now() });
    socketRef.current.emit("chat:typing", {
      chatId,
      isTyping: false,
    });
  }

  function handleTyping(isTypingNow) {
    if (!selectedChat?.chatId || !socketRef.current?.connected) return;

    socketRef.current.emit("chat:typing", {
      chatId: selectedChat.chatId,
      isTyping: Boolean(isTypingNow),
    });
  }

  function handleUpdateProfile(updates) {
    setProfile((current) => {
      const base = current || buildDefaultProfile(deviceId || "");
      const merged = { ...base, ...updates };

      storeProfile(merged).catch((error) => {
        console.error("Failed to save profile locally:", error);
      });

      if (socketRef.current?.connected) {
        socketRef.current.emit("profile:update", merged);
      }

      return merged;
    });
  }

  function handleProfileSetup(profileUpdates) {
    const completedProfile = {
      ...profileUpdates.profile,
      deviceId,
    };
    createSecuritySetup(profileUpdates.password).then(async (setup) => {
      const response = await fetch(`${BACKEND_URL}/api/security/setup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deviceId, publicKey: setup.publicKey, passwordSalt: setup.passwordSalt, passwordVerifier: setup.passwordVerifier, encryptionVersion: setup.encryptionVersion }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to complete security setup.");
      await storeSecurityRecord(setup);
      await storeProfile(completedProfile);
      window.location.reload();
    }).catch((error) => setConnectionError(error.message || "Unable to complete security setup."));
  }

  async function handleSecurityUnlock(password) {
    const key = await unlockSecurity(securityRecord, password);
    setPrivateKey(key);
    setSecurityUnlockRequired(false);
  }

  function handleDeleteDevice(device) {
    if (!device?.deviceId) return;
    socketRef.current?.emit("contact:deleted", { deviceId: device.deviceId });
    setDevices((current) => current.filter((item) => item.deviceId !== device.deviceId));
    if (selectedChat?.deviceId === device.deviceId) setSelectedChat(null);
  }

  function handleBlockDevice(device) {
    if (!device?.deviceId) return;
    socketRef.current?.emit("contact:blocked", { deviceId: device.deviceId });
    setDevices((current) => current.filter((item) => item.deviceId !== device.deviceId));
    if (selectedChat?.deviceId === device.deviceId) setSelectedChat(null);
  }

  function handleReportDevice(device) {
    if (!device?.deviceId) return;
    const reason = window.prompt("Reason for reporting this contact:");
    if (!reason) return;
    socketRef.current?.emit("report:create", { reportedDeviceId: device.deviceId, chatId: selectedChat?.chatId, reason, description: reason }, (result) => {
      setModerationNotice(result?.success ? `Report submitted for manual verification (${result.reportId}).` : (result?.error || "Report could not be submitted."));
    });
  }

  /* =========================================================
     Render UI
     ========================================================= */

  return (
    deviceLoginRequired ? <DeviceLogin backendUrl={BACKEND_URL} /> :
    profileSetupRequired ? <ProfileSetup initialProfile={profile} onComplete={handleProfileSetup} /> :
    securityUnlockRequired ? <SecurityUnlock onUnlock={handleSecurityUnlock} /> :
    <main className="chronix-page h-screen overflow-hidden relative">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="hidden w-[320px] shrink-0 lg:block">
          <ChatSidebar
            socket={socket}
            deviceId={deviceId}
            profile={profile}
            onEditProfile={() => setIsEditingProfile(true)}
            devices={devices}
            selectedChat={selectedChat}
            setSelectedChat={handleSelectChat}
            onDeviceConnected={handleDeviceConnected}
            onDeleteDevice={handleDeleteDevice}
            onBlockDevice={handleBlockDevice}
            onReportDevice={handleReportDevice}
          />
        </div>

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {selectedChat ? (
            <>
              <ChatHeader
                selectedChat={selectedChat}
                connectionStatus={connectionStatus}
                onVoiceCall={() => {
                  if (!socket?.connected || !selectedChat.online) {
                    setConnectionError("This device is currently offline.");
                    return;
                  }
                  setIncomingCall(null);
                  setCallType("audio");
                  setShowCall(true);
                }}
                onVideoCall={() => {
                  if (!socket?.connected || !selectedChat.online) {
                    setConnectionError("This device is currently offline.");
                    return;
                  }
                  setIncomingCall(null);
                  setCallType("video");
                  setShowCall(true);
                }}
              />

              {connectionError && (
                <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-3">
                  <p className="text-sm text-red-200">{connectionError}</p>
                </div>
              )}

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {moderationNotice && <div className="border-b border-amber-200 bg-amber-50 px-5 py-2 text-center text-sm text-amber-800">{moderationNotice}</div>}
                <MessageList
                  messages={messages}
                  selectedChat={selectedChat}
                  socket={socket}
                  chatId={currentChatId}
                  privateKey={privateKey}
                />
                <TypingIndicator
                  name={selectedChat.name}
                  avatarEmoji={selectedChat.avatarEmoji || AVATAR_CHOICES[0]}
                  isTyping={isTyping}
                />
              </div>

              <MessageInput
                onSend={handleSend}
                onTyping={handleTyping}
                disabled={connectionStatus !== "Connected"}
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-500/10">
                <span className="text-4xl">🔐</span>
              </div>

              <h1 className="mt-7 text-3xl font-bold">Chronix</h1>

              <p className="mt-3 max-w-md leading-7 text-slate-500">
                Private conversations, designed for privacy. Connect a Chronix
                device to start a secure conversation.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    connectionStatus === "Connected"
                      ? "bg-green-500"
                      : connectionStatus === "Connecting"
                      ? "animate-pulse bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-slate-600">
                  {connectionStatus}
                </span>
              </div>

              {deviceId && profile && (
                <div className="mt-5 w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-2xl">
                      {profile.avatarEmoji}
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {profile.name}
                      </p>
                      {profile.statusMessage && (
                        <p className="truncate text-xs text-slate-500">
                          {profile.statusMessage}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="shrink-0 rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-medium text-cyan-700 hover:bg-cyan-50"
                    >
                      Edit
                    </button>
                  </div>

                  <p className="mt-3 break-all font-mono text-[10px] text-slate-400">
                    Device ID: {deviceId}
                  </p>
                </div>
              )}

              {/* Profile Editor */}
              {isEditingProfile && profile && (
                <div className="mt-5 w-full max-w-lg rounded-xl border border-cyan-500/20 bg-[#07111d] px-5 py-4 text-left">
                  <p className="text-sm font-semibold text-white">
                    Edit profile
                  </p>

                  <label className="mt-4 block text-xs text-slate-400">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.name}
                    maxLength={40}
                    id="chronix-profile-name-input"
                    className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-[#050816] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                  />

                  <label className="mt-4 block text-xs text-slate-400">
                    Avatar
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {AVATAR_CHOICES.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          handleUpdateProfile({ avatarEmoji: emoji })
                        }
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl ${
                          profile.avatarEmoji === emoji
                            ? "border-cyan-400 bg-cyan-500/20"
                            : "border-cyan-500/10 hover:bg-cyan-500/10"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <label className="mt-4 block text-xs text-slate-400">
                    Status
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.statusMessage}
                    maxLength={140}
                    placeholder="e.g. Available"
                    id="chronix-profile-status-input"
                    className="mt-1 w-full rounded-lg border border-cyan-500/20 bg-[#050816] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                  />

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nameInput = document.getElementById(
                          "chronix-profile-name-input"
                        );
                        const statusInput = document.getElementById(
                          "chronix-profile-status-input"
                        );

                        handleUpdateProfile({
                          name:
                            nameInput?.value?.trim() || profile.name,
                          statusMessage:
                            statusInput?.value?.trim() || "",
                        });

                        setIsEditingProfile(false);
                      }}
                      className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-[#050816] hover:bg-cyan-400"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {selectedChat && <div className="hidden w-[340px] shrink-0 2xl:block"><ChatProfile selectedChat={selectedChat} messages={messages} /></div>}
      </div>

      {/* =========================================================
         Call Manager Overlay Component
         ========================================================= */}
      {showCall && (
        <CallManager
          socket={socket}
          selectedChat={
            selectedChat || {
              name: incomingCall?.callerDeviceId
                ? `Device ${incomingCall.callerDeviceId.slice(0, 8)}`
                : "Chronix User",
              chatId: incomingCall?.chatId,
            }
          }
          currentDeviceId={deviceId}
          incomingCall={incomingCall}
          callType={callType}
          onClose={handleCloseCall}
        />
      )}
    </main>
  );
}
