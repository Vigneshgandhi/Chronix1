"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  MonitorUp,
} from "lucide-react";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function CallManager({
  socket,
  selectedChat,
  currentDeviceId,
  incomingCall,
  callType,
  onClose,
}) {
  const [callStatus, setCallStatus] = useState("idle");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [callError, setCallError] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);
  const callStartedRef = useRef(false);

  const selectedChatRef = useRef(selectedChat);
  const incomingCallRef = useRef(incomingCall);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    incomingCallRef.current = incomingCall;
    onCloseRef.current = onClose;
  }, [selectedChat, incomingCall, onClose]);

  const endCall = useCallback(
    (notify = true) => {
      if (notify) {
        socket?.emit("call:end", {
          chatId:
            selectedChatRef.current?.chatId ||
            incomingCallRef.current?.chatId,
        });
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

      iceCandidatesQueueRef.current = [];
      setCallStatus("ended");
      onCloseRef.current?.();
    },
    [socket]
  );

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.onicecandidate = (event) => {
      if (!event.candidate) return;

      socket?.emit("call:ice-candidate", {
        chatId:
          selectedChatRef.current?.chatId ||
          incomingCallRef.current?.chatId,
        candidate: event.candidate,
      });
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        setCallStatus("connected");
      }

      if (
        peer.connectionState === "failed" ||
        peer.connectionState === "closed" ||
        peer.connectionState === "disconnected"
      ) {
        endCall(false);
      }
    };

    peerConnectionRef.current = peer;
    return peer;
  }, [socket, endCall]);

  const processIceCandidateQueue = async () => {
    const peer = peerConnectionRef.current;
    if (!peer || !peer.remoteDescription) return;

    while (iceCandidatesQueueRef.current.length > 0) {
      const candidate = iceCandidatesQueueRef.current.shift();
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error processing queued ICE candidate:", error);
      }
    }
  };

  async function getMedia(video = true) {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("This browser does not support camera or microphone calls.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });

    localStreamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    return stream;
  }

  const startCall = useCallback(
    async (type = "video") => {
      try {
        if (!socket?.connected) throw new Error("Chronix is disconnected.");
        if (!selectedChatRef.current?.chatId) throw new Error("Select a connected chat before starting a call.");
        setCallStatus("calling");
        setCallError("");

        const video = type === "video";
        setCameraEnabled(video);

        const stream = await getMedia(video);
        const peer = createPeerConnection();

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket?.emit("call:offer", {
          chatId: selectedChatRef.current?.chatId,
          callType: type,
          callerDeviceId: currentDeviceId,
          offer,
        });
      } catch (error) {
        const message = error?.name === "NotFoundError"
          ? "No compatible microphone or camera was found. Connect a device and try again."
          : error?.name === "NotAllowedError"
          ? "Microphone or camera permission was denied. Allow access and try again."
          : error?.message || "Unable to start the call.";
        console.error("Unable to start call:", error);
        setCallError(message);
        setCallStatus("error");
      }
    },
    [createPeerConnection, currentDeviceId, endCall, socket]
  );

  async function acceptCall() {
    if (!incomingCall) return;

    try {
      if (!socket?.connected) throw new Error("Chronix is disconnected.");
      setCallError("");
      setCallStatus("connecting");

      const video = incomingCall.callType === "video";
      setCameraEnabled(video);

      const stream = await getMedia(video);
      const peer = createPeerConnection();

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      await processIceCandidateQueue();

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket?.emit("call:answer", {
        chatId: incomingCall.chatId,
        answer,
      });
    } catch (error) {
      const message = error?.name === "NotFoundError"
        ? "No compatible microphone or camera was found."
        : error?.name === "NotAllowedError"
        ? "Microphone or camera permission was denied."
        : error?.message || "Unable to accept the call.";
      console.error("Unable to accept call:", error);
      setCallError(message);
      setCallStatus("error");
    }
  }

  function rejectCall() {
    socket?.emit("call:reject", {
      chatId: incomingCall?.chatId,
    });
    endCall(false);
  }

  function toggleMicrophone() {
    const stream = localStreamRef.current;
    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setMicEnabled(audioTrack.enabled);
  }

  async function toggleCamera() {
    const stream = localStreamRef.current;
    if (!stream) return;

    let videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoTrack = videoStream.getVideoTracks()[0];
        stream.addTrack(videoTrack);

        if (peerConnectionRef.current) {
          peerConnectionRef.current.addTrack(videoTrack, stream);
        }
        setCameraEnabled(true);
      } catch (error) {
        console.error("Unable to enable camera:", error);
      }
    } else {
      videoTrack.enabled = !videoTrack.enabled;
      setCameraEnabled(videoTrack.enabled);
    }
  }

  async function shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (!sender) return;

      await sender.replaceTrack(screenTrack);

      screenTrack.onended = async () => {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        if (cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }
      };
    } catch (error) {
      console.error("Screen sharing cancelled:", error);
    }
  }

  // Start an outgoing call only when ChatPage explicitly requested one.
  useEffect(() => {
    if (!incomingCall && selectedChat && callType && !callStartedRef.current) {
      callStartedRef.current = true;
      startCall(callType);
    }
  }, [callType, incomingCall, selectedChat, startCall]);

  useEffect(() => {
    if (incomingCall) callStartedRef.current = false;
  }, [incomingCall]);

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    async function handleAnswer({ answer }) {
      const peer = peerConnectionRef.current;
      if (!peer) return;

      await peer.setRemoteDescription(new RTCSessionDescription(answer));
      await processIceCandidateQueue();
    }

    async function handleIceCandidate({ candidate }) {
      const peer = peerConnectionRef.current;
      if (!candidate) return;

      if (peer && peer.remoteDescription) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("ICE candidate error:", error);
        }
      } else {
        iceCandidatesQueueRef.current.push(candidate);
      }
    }

    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:end", () => endCall(false));
    socket.on("call:reject", () => endCall(false));

    return () => {
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:end");
      socket.off("call:reject");
    };
  }, [socket, endCall]);

  const isIncoming = Boolean(incomingCall) && callStatus === "idle";
  const chatDisplayName =
    selectedChat?.name ||
    incomingCall?.callerDeviceId ||
    "Chronix User";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 text-white">
      <div className="relative h-full w-full overflow-hidden">
        {/* REMOTE VIDEO */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        {/* CALL STATUS OVERLAY */}
        {callStatus !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-lg">
                {chatDisplayName[0]?.toUpperCase() || "C"}
              </div>

              <h2 className="text-2xl font-semibold text-white">
                {chatDisplayName}
              </h2>

              <p className="mt-2 text-slate-300 font-medium">
                {callError || (callStatus === "calling"
                  ? "Calling..."
                  : callStatus === "connecting"
                  ? "Connecting..."
                  : isIncoming
                  ? "Incoming video call..."
                  : "Preparing call...")}
              </p>
              {callError && <button onClick={() => endCall(false)} className="mt-5 rounded-full bg-cyan-500 px-5 py-2 font-semibold text-black">Close</button>}
            </div>
          </div>
        )}

        {/* LOCAL CAMERA (Shown when connected or outgoing) */}
        {callStatus !== "idle" && (
          <div className="absolute right-6 top-6 h-48 w-36 overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          {isIncoming ? (
            /* INCOMING CALL CONTROLS */
            <div className="flex items-center gap-6 rounded-full bg-slate-900/90 px-8 py-4 shadow-2xl backdrop-blur-xl border border-white/10">
              <button
                onClick={acceptCall}
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-600 active:scale-95"
              >
                <Phone size={20} />
                Accept
              </button>

              <button
                onClick={rejectCall}
                className="flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-rose-600 active:scale-95"
              >
                <PhoneOff size={20} />
                Decline
              </button>
            </div>
          ) : (
            /* ACTIVE / OUTGOING CALL CONTROLS */
            <div className="flex items-center gap-4 rounded-full bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl border border-white/10">
              <button
                onClick={toggleMicrophone}
                className={`rounded-full p-4 text-white transition ${
                  micEnabled
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`rounded-full p-4 text-white transition ${
                  cameraEnabled
                    ? "bg-white/10 hover:bg-white/20"
                    : "bg-rose-500 hover:bg-rose-600"
                }`}
              >
                {cameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
              </button>

              <button
                onClick={shareScreen}
                className="rounded-full bg-white/10 p-4 text-white hover:bg-white/20 transition"
              >
                <MonitorUp size={22} />
              </button>

              <button
                onClick={() => endCall()}
                className="rounded-full bg-rose-500 p-4 text-white hover:bg-rose-600 transition"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
