import "./App.css";

import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import React, { useState, useEffect, useRef } from "react";
import CanvasComponent from "./components/Whiteboard";
import { Analytics } from "@vercel/analytics/react";

const MODEL_PATH = process.env.PUBLIC_URL + "/models/gesture_recognizer.task";

function App() {
  const [isModelLoaded, setModelLoaded] = useState(false);
  const detectorRef = useRef(null);

  useEffect(() => {
    async function setupModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        detectorRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          customGesturesClassifierOptions: { scoreThreshold: 0.9 },
        });
        setModelLoaded(true);
      } catch (error) {
        console.error("Failed to load gesture recognition model:", error);
      }
    }

    setupModel();
  }, []);

  return (
    <div
      className="flex flex-col h-screen"
      style={{ background: "transparent" }}
    >
      <Analytics />
      <CanvasComponent
        detector={detectorRef}
        isModelLoaded={isModelLoaded}
      />
    </div>
  );
}

export default App;
