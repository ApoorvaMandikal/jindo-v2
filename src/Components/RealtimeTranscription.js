import React, { useEffect, useRef } from "react";

const RealtimeTranscription = ({
  setLiveTranscription,
  isAmbientListening,
  setIsAmbientListening,
}) => {
  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (isAmbientListening) {
      startWebRTCTranscription();
    } else {
      stopWebRTCTranscription();
    }
    return () => {
      stopWebRTCTranscription();
    };
  }, [isAmbientListening]);

  const getEphemeralToken = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-token"
        //"https://54.80.147.140/generate-token"
        //"https://demo.jindolabs.com/generate-token"
      );
      const data = await response.json();
      return data.client_secret?.value || null;
    } catch (error) {
      console.error("Error fetching ephemeral token:", error);
      return null;
    }
  };

  const startWebRTCTranscription = async () => {
    const token = await getEphemeralToken();
    if (!token) {
      console.error("❌ No token available");
      return;
    }

    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;

    pc.oniceconnectionstatechange = () => {
      console.log("🔄 ICE Connection State:", pc.iceConnectionState);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📡 Local ICE candidate:", event.candidate);
      }
    };

    const channel = pc.createDataChannel("oai-events");
    dataChannelRef.current = channel;

    channel.onopen = () => console.log("🎤 Data channel opened!");
    channel.onclose = () => console.log("❌ Data channel closed!");

    channel.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data);
        if (message.transcript) {
          console.log("📝 Live Transcription:", message.transcript);

          setLiveTranscription((prev) => prev + " " + message.transcript);
        }
      } catch (error) {
        console.error("🚨 Failed to parse message:", e.data, error);
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("🚨 Error accessing microphone:", error);
      return;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    try {
      const response = await fetch("https://api.openai.com/v1/realtime", {
        method: "POST",
        headers: {
          "Content-Type": "application/sdp",
          Authorization: `Bearer ${token}`,
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to connect to OpenAI Realtime API",
          await response.text()
        );
        return;
      }

      const answer = {
        type: "answer",
        sdp: await response.text(),
      };
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error("🚨 Error during WebRTC signaling:", error);
    }
  };

  const stopWebRTCTranscription = () => {
    console.log("🛑 Stopping transcription...");

    // Close data channel
    const dc = dataChannelRef.current;
    if (dc) {
      dc.onmessage = null;
      dc.onopen = null;
      dc.onclose = null;
      if (dc.readyState === "open") {
        dc.close();
      }
      dataChannelRef.current = null;
    }

    // Stop and close peer connection
    const pc = peerConnectionRef.current;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        sender.track?.stop();
      });

      pc.getTransceivers().forEach((transceiver) => {
        try {
          transceiver.stop?.();
        } catch (err) {
          console.warn("⚠️ Error stopping transceiver:", err);
        }
      });

      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.ontrack = null;
      pc.close();
      peerConnectionRef.current = null;
    }

    // Stop media stream
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    console.log("✅ Transcription stopped successfully.");
  };

  return (
    <div>
      <div className="space-x-4">
        <button
          onClick={startWebRTCTranscription}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
          Start Transcription
        </button>
        <button
          onClick={stopWebRTCTranscription}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
        >
          Stop Transcription
        </button>
      </div>

      {/* <div>
        <h3>Transcription:</h3>
        <p>{transcription}</p>
      </div> */}
    </div>
  );
};

export default RealtimeTranscription;
