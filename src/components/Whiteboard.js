import { useEffect, useState, useRef } from "react";
import { DefaultSizeStyle, Tldraw } from "tldraw";

import LaserScribble from "./LaserScribble";
import FloatingMenu from "./FloatingMenu";

import { createKeyMap, getUserHandGesture } from "../utils/gestures";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { setupWebcam, teardownWebcam } from "../utils/webcam";
import { euclideanDistance } from "../utils/math";
import {
  drawHands,
  drawPath,
  getClientPointFromCanvasPoint,
} from "../utils/drawing";

const MIN_DRAWING_POINT_DISTANCE = 0.005;

async function setupCanvas(video, canvasID) {
  const canvas = document.getElementById(canvasID);
  const ctx = canvas.getContext("2d");

  canvas.width = video.width;
  canvas.height = video.height;

  return [canvas, ctx];
}

export default function CanvasComponent({ detector, isModelLoaded }) {
  const editorRef = useRef(null);
  const videoRef = useRef(null);
  const [floatingCanvasCtx, setFloatingCanvasCtx] = useState(null);

  const [isStreaming, setStreaming] = useState(false);
  const [isDrawing, setDrawing] = useState(false);

  const drawingPointsRef = useRef([]);
  const lastVideoTimeRef = useRef(-1);
  const previousGestureRef = useRef(null);

  const availableTools = ["select", "hand", "draw", "eraser", "geo"];

  const cycleCanvasTool = (gesture) => {
    if (gesture === previousGestureRef.current) {
      return;
    }

    previousGestureRef.current = gesture;

    switch (gesture) {
      case "middle_pinch":
        const editor = editorRef.current;
        const currentTool = editor.getCurrentTool();
        const currentToolIndex = availableTools.indexOf(currentTool.id);

        const nextToolIndex =
          currentToolIndex !== -1
            ? (currentToolIndex + 1) % availableTools.length
            : 0;

        editor.setCurrentTool(availableTools[nextToolIndex]);
        return;
      default:
        return;
    }
  };

  const nextDrawingPointIsFarEnough = (trackingPoint, previousPoint) => {
    return (
      euclideanDistance([
        [trackingPoint.x, previousPoint.x],
        [trackingPoint.y, previousPoint.y],
      ]) >= MIN_DRAWING_POINT_DISTANCE
    );
  };

  const draw = (hands) => {
    const editor = editorRef.current;
    if (hands.length < 1 || !editor) {
      setDrawing(false);
      return;
    }

    for (let i = 0; i < hands.length; i++) {
      const [gesture, trackingPoint] = getUserHandGesture(hands[i]);
      cycleCanvasTool(gesture);

      if (gesture === "index_pinch" && trackingPoint) {
        if (drawingPointsRef.current.length > 0) {
          let previousPoint =
            drawingPointsRef.current[drawingPointsRef.current.length - 1];
          if (!nextDrawingPointIsFarEnough(trackingPoint, previousPoint)) {
            return;
          }
        }

        drawingPointsRef.current = [
          ...drawingPointsRef.current,
          { x: trackingPoint.x, y: trackingPoint.y },
        ];
        setDrawing(true);

        if (editor && !editor.inputs.buttons.has(0)) {
          const point = getClientPointFromCanvasPoint({
            point: trackingPoint,
            editor,
          });

          editor.dispatch({
            type: "pointer",
            target: "canvas",
            name: "pointer_down",
            point,
            pointerId: 0,
            ctrlKey: editor.inputs.ctrlKey,
            altKey: editor.inputs.altKey,
            shiftKey: editor.inputs.shiftKey,
            button: 0,
            isPen: false,
          });
        }

        drawPath(drawingPointsRef.current, editor);
      } else {
        setDrawing(false);
      }
    }
  };

  useEffect(() => {
    async function initialize() {
      if (!videoRef.current) {
        try {
          videoRef.current = await setupWebcam();
        } catch (error) {
          console.error("Failed to setup webcam:", error);
          setStreaming(false);
          return;
        }
      }
      if (!floatingCanvasCtx) {
        const [, ctx] = await setupCanvas(videoRef.current, "float-canvas");
        setFloatingCanvasCtx(ctx);
      }
    }

    async function destroy() {
      if (videoRef.current) {
        await teardownWebcam(videoRef.current);
        videoRef.current = null;
      }
      if (floatingCanvasCtx) {
        floatingCanvasCtx.clearRect(
          0,
          0,
          floatingCanvasCtx.canvas.width,
          floatingCanvasCtx.canvas.height
        );
        setFloatingCanvasCtx(null);
      }
    }

    if (isStreaming) {
      initialize();
    } else {
      destroy();
    }
  }, [isStreaming, floatingCanvasCtx]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!isDrawing) {
      const lastPoint =
        drawingPointsRef.current[drawingPointsRef.current.length - 1];
      if (lastPoint && editor) {
        const point = getClientPointFromCanvasPoint({
          point: drawingPointsRef.current[drawingPointsRef.current.length - 1],
          editor,
        });
        editor.dispatch({
          type: "pointer",
          target: "canvas",
          name: "pointer_up",
          point,
          pointerId: 0,
          ctrlKey: editor.inputs.ctrlKey,
          altKey: editor.inputs.altKey,
          shiftKey: editor.inputs.shiftKey,
          button: 0,
          isPen: false,
        });
      }
      drawingPointsRef.current = [];
    }
  }, [isDrawing]);

  useAnimationFrame(async (delta) => {
    let hands;
    if (!detector.current) return;

    let nowInMs = Date.now();
    if (videoRef.current.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = videoRef.current.currentTime;

      hands = await detector.current.recognizeForVideo(videoRef.current, nowInMs);
      hands = createKeyMap(hands);

      floatingCanvasCtx.clearRect(
        0,
        0,
        videoRef.current.videoWidth,
        videoRef.current.videoHeight
      );
      draw(hands);
      drawHands(
        hands,
        videoRef.current.width,
        videoRef.current.height,
        floatingCanvasCtx
      );
    }
  }, isStreaming && isModelLoaded && !!videoRef.current);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <FloatingMenu
        isStreaming={isStreaming}
        setStreaming={setStreaming}
        videoRef={videoRef}
        isModelLoaded={isModelLoaded}
      />
      <canvas
        style={{
          position: "fixed",
          backgroundColor: "transparent",
          transform: "scaleX(-1)",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 100000,
        }}
        id="float-canvas"
      />
      <video
        style={{
          display: isStreaming ? "block" : "none",
          transform: "scaleX(-1)",
          position: "fixed",
          pointerEvents: "none",
          objectFit: "cover",
          top: "0px",
          left: "0px",
          width: "100vw",
          height: "100vh",
          opacity: "0.3",
          zIndex: 10,
          filter: "blur(25px)",
          background: "transparent",
        }}
        id="video"
        autoPlay
        muted
        playsInline
      />
      <Tldraw
        components={{
          Scribble: LaserScribble,
        }}
        onMount={(editor) => {
          editor.updateInstanceState({
            isDebugMode: false,
          });
          editorRef.current = editor;
          editor.setCurrentTool("draw");
          editor.setStyleForNextShapes(DefaultSizeStyle, "xl");
        }}
      />
    </div>
  );
}
