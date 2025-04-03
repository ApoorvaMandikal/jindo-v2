import React, { useState, useEffect } from "react";

const RealtimeTranscription = ({
  setLiveTranscription,
  isAmbientListening,
  setIsAmbientListening,
}) => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);

  useEffect(() => {
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [peerConnection]);

  const getEphemeralToken = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/generate-token");
      if (!response.ok) {
        throw new Error("Failed to fetch ephemeral token");
      }

      const data = await response.json();
      if (!data.client_secret || !data.client_secret.value) {
        throw new Error("No ephemeral token received");
      }
      console.log(data);
      console.log("Ephemeral Token:", data.client_secret.value); // Debugging

      return data.client_secret.value;
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
    console.log("✅ Created PeerConnection");

    // Debugging ICE connection states
    pc.oniceconnectionstatechange = () => {
      console.log("🔄 ICE Connection State:", pc.iceConnectionState);
    };

    // Debugging ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📡 Local ICE candidate:", event.candidate);
      }
    };

    // Creating data channel explicitly
    const channel = pc.createDataChannel("oai-events");
    console.log("📶 Created data channel");

    channel.onopen = () => console.log("🎤 Data channel opened!");
    channel.onclose = () => console.log("❌ Data channel closed!");

    channel.onmessage = (e) => {
      console.log("📩 Received message:", e.data);
      try {
        const message = JSON.parse(e.data);
        console.log(message);
        if (message.transcript) {
          console.log("📝 Live Transcription:", message.transcript);
          console.log(
            "🔍 setLiveTranscription type:",
            typeof setLiveTranscription
          );
          setLiveTranscription((prev) => prev + " " + message.transcript);
        }
      } catch (error) {
        console.error("🚨 Failed to parse message:", e.data, error);
      }
    };

    setDataChannel(channel);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("🎙️ Microphone Stream:", stream);
      stream.getTracks().forEach((track) => {
        console.log("🎤 Adding track:", track);
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("🚨 Error accessing microphone:", error);
      return;
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("📡 Sending SDP Offer:", offer.sdp);

    // Send the offer and token to OpenAI's signaling server
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
      console.log("✅ OpenAI Response SDP:", answer.sdp);
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error("🚨 Error during WebRTC signaling:", error);
    }
  };

  const stopWebRTCTranscription = () => {
    console.log("🛑 Stopping transcription...");

    if (peerConnection) {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop(); // Stop microphone track
        }
      });

      peerConnection.onicecandidate = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.ontrack = null;
      peerConnection.close();
      setPeerConnection(null);
    }

    if (dataChannel) {
      dataChannel.onmessage = null; // Remove event listeners
      dataChannel.onopen = null;
      dataChannel.onclose = null;
      dataChannel.close();
      setDataChannel(null);
    }

    console.log("✅ Transcription stopped successfully.");
  };

  return (
    <div>
      <button onClick={startWebRTCTranscription}>Start Transcription</button>
      <button onClick={stopWebRTCTranscription}>Stop Transcription</button>
      {/* <div>
        <h3>Transcription:</h3>
        <p>{transcription}</p>
      </div> */}
    </div>
  );
};

export default RealtimeTranscription;
