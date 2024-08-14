// src/services/whisper.ts

import { initWhisper } from "whisper.rn";

async function setupWhisper() {
  try {
    const whisperContext = await initWhisper({
      filePath: "file://.../ggml-tiny.en.bin",
    });

    const sampleFilePath = "file://.../sample.wav";
    const options = { language: "en" };

    // Function to perform transcription
    async function performTranscription() {
      const { stop, promise } = whisperContext.transcribe(
        sampleFilePath,
        options
      );
      const { result } = await promise;
      console.log("Transcription result:", result);
      return result;
    }

    // Function to start realtime transcription
    async function startRealtimeTranscription() {
      const { stop, subscribe } = await whisperContext.transcribeRealtime(
        options
      );

      subscribe((evt) => {
        const { isCapturing, data, processTime, recordingTime } = evt;
        console.log(
          `Realtime transcribing: ${isCapturing ? "ON" : "OFF"}\n` +
            `Result: ${data?.result}\n\n` +
            `Process time: ${processTime}ms\n` +
            `Recording time: ${recordingTime}ms`
        );
        if (!isCapturing) console.log("Finished realtime transcribing");
      });

      return stop; // Return the stop function so it can be called later
    }

    return {
      performTranscription,
      startRealtimeTranscription,
    };
  } catch (error) {
    console.error("Error setting up Whisper:", error);
    throw error;
  }
}

// Export the setup function
export default setupWhisper;
