import { useEffect, useRef, useState } from "react";

export function useWebRTC(isCaller: boolean, isVideo: boolean = false) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      setLocalStream(stream);

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        const [remote] = event.streams;
        setRemoteStream(remote);
      };

      pcRef.current = pc;

      if (isCaller) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // TODO: send offer via WebSocket
      }

      // TODO: receive offer/answer/candidates via WebSocket
    };

    init();

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [isCaller]);

  return { localStream, remoteStream, peerConnection: pcRef.current };
}