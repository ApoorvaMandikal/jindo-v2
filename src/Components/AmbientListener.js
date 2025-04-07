import React, { useState, useEffect, useRef } from "react";

const AmbientListener = ({
  isAmbientListening,
  setIsAmbientListening,
  setTranscription,
  setLoading,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const timerRef = useRef(null);
  const openAiKey = process.env.REACT_APP_OPENAI_API_KEY;
  let peerConnection;
let mediaStream;

  // useEffect(() => {
  //   if (isAmbientListening) {
  //     startTimer();
  //     startRecording();
  //   } else {
  //     stopTimer();
  //     stopRecording(); // Ensures the microphone is released
  //   }
  //   return () => {
  //     stopTimer();
  //     stopRecording();
  //   };
  // }, [isAmbientListening]);

  // Timer Logic
  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1); // Increment elapsed time by 1 second
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current); // Clear the interval
      timerRef.current = null; // Reset the timer reference to allow restarting
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Recording Logic
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Save chunks for transcription
        setAudioChunks(chunks);
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      let recordedChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (recordedChunks.length > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, ...recordedChunks]); // Append new chunks
          sendToWhisper([...audioChunks, ...recordedChunks]) // Send all recorded chunks
            .then(() => setAudioChunks([])) // Clear after successful transcription
            .catch((err) => console.error("Error during transcription:", err));
        } else {
          console.warn("No audio chunks available to send for transcription.");
        }
      };

      mediaRecorder.stop();
      setIsPaused(true);
      stopTimer();
    }
  };

  const resumeRecording = async () => {
    if (isPaused) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        let newChunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            newChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          setAudioChunks((prevChunks) => [...prevChunks, ...newChunks]); // Append instead of overwriting
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsPaused(false);
        startTimer();
      } catch (error) {
        console.error("Error resuming microphone:", error);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
      }
      setMediaRecorder(null); // Reset recorder
      setAudioChunks([]); // Clear chunks
      setIsPaused(false);
      stopTimer(); // Stop the timer completely
    }
  };

  const sendToWhisper = async (chunks) => {
    setLoading(true);
    const audioBlob = new Blob(chunks, { type: "audio/wav" });
    console.log("Audio Blob:", audioBlob); // Debug log
    console.log("Audio Blob Type:", audioBlob.type); // Should be "audio/wav"
    console.log("Blob size:", audioBlob.size); // Verify Blob size

    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");

    try {
      const response = await fetch("http://127.0.0.1:8000/transcribe/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to transcribe audio.");
      }
      const data = await response.json();
      setTranscription((prev) => prev + " " + data.transcription); // Append new text
    } catch (error) {
      console.error("Error sending audio for transcription:", error);
    } finally {
      setLoading(false); // Hide loading state after processing
    }
  };


  const toggleListening = () => {
    if (isAmbientListening) {
      stopRecording(); // Stop everything
      setIsAmbientListening(false);
    } else {
      setIsPaused(false); // Reset paused state
      setIsAmbientListening(true); // Start listening
      startTimer(); // Start the timer
      startRecording(); // Start recording
    }
  };

  return (
    <div className="md:absolute">
      <div className="flex items-center gap-2 w-full border rounded-md bg-white shadow flex-row h-1/4 max-w-sm p-2">
        {/* Start/Stop Listening Button */}
        <button
          onClick={stopRecording}
          className="px-2 py-1 text-xs text-white rounded bg-red-500"
        >
          {/*   className={`px-2 py-1 text-xs text-white rounded ${
        //     isAmbientListening ? "bg-red-500" : "bg-green-500"
        //   }`}
           {isAmbientListening ? "Stop Listening" : "Start Listening"}*/}
          Stop Listening
        </button>
       
        {/* <p>{transcription || "Waiting for speech..."}</p> */}

        {/* Pause/Resume Button and Elapsed Time */}
        {isAmbientListening && (
          <div className="flex flex-row items-center gap-2 flex-grow">
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="px-2 py-1 bg-orange-500 text-xs text-white font-bold rounded-md hover:bg-orange-600"
            >
              {isPaused ? "Resume" : "Pause"}
            </button>
            <div className="text-xs font-medium truncate">
              Elapsed Time: {formatTime(elapsedTime)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmbientListener;
