import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "@tensorflow/tfjs-backend-webgl";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import React, { useState, useEffect } from "react";
import CanvasComponent from "./components/canvas";
import { Analytics } from "@vercel/analytics/react";

let detector;

const DEV_MODE = false;
const MODEL_PATH = process.env.PUBLIC_URL + "/models/gesture_recognizer.task";

function App() {
  const [isModelLoaded, setModelLoaded] = useState(false);
  useEffect(() => {
    async function setupModel() {
      // if (!DEV_MODE) {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      detector = await GestureRecognizer.createFromOptions(vision, {
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
        detector={detector}
        isModelLoaded={isModelLoaded}
        development={DEV_MODE}
      />
    </div>
  );
}

export default App;
