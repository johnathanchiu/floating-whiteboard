import React, { useState, useRef, useEffect, useCallback } from "react";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { FiHelpCircle } from "react-icons/fi";

const FloatingMenu = ({
  isStreaming,
  setStreaming,
  videoRef,
  isModelLoaded,
}) => {
  // Load saved position from localStorage or use default
  const [position, setPosition] = useState(() => {
    const savedPosition = localStorage.getItem("menuPosition");
    return savedPosition ? JSON.parse(savedPosition) : { x: 20, y: 100 };
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPositionRef = useRef({ x: 0, y: 0 });

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("menuPosition", JSON.stringify(position));
  }, [position]);

  const updatePosition = useCallback((dx, dy) => {
    // Ensure menu stays within viewport bounds
    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 120, initialPositionRef.current.x + dx)
    );
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 200, initialPositionRef.current.y + dy)
    );

    setPosition({
      x: newX,
      y: newY,
    });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      updatePosition(dx, dy);
    },
    [updatePosition]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;

      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;

      updatePosition(dx, dy);
      e.preventDefault(); // Prevent scrolling while dragging
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  }, [handleTouchMove]);

  const handleMouseDown = (e) => {
    // Allow dragging from the menu container or the title area, but not from buttons
    const isDraggableArea =
      e.target === e.currentTarget ||
      e.target.classList.contains("draggable-area") ||
      e.target.closest(".draggable-area");

    if (!isDraggableArea) return;

    isDraggingRef.current = true;
    const point = e.touches ? e.touches[0] : e;
    dragStartRef.current = { x: point.clientX, y: point.clientY };
    initialPositionRef.current = position;

    // Add both mouse and touch event listeners
    if (e.type === "mousedown") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else if (e.type === "touchstart") {
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    e.preventDefault();
  };

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <>
      <div
        className="rounded-lg absolute bg-gray-800 bg-opacity-90 backdrop-blur-sm p-3 cursor-move flex flex-col gap-2 group shadow-lg border border-white/20"
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          zIndex: 1000,
          minWidth: "auto",
          maxWidth: "95vw",
          width: "auto",
          transform: "translate3d(0,0,0)",
          willChange: "transform",
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Title */}
        <div className="text-white text-sm font-medium text-center border-b border-white/20 pb-2 draggable-area cursor-move">
          Controls
        </div>

        {/* Main buttons */}
        <div className="flex gap-3 justify-center">
          {/* Webcam Button */}
          {isModelLoaded && (
            <button
              className="text-white opacity-80 hover:opacity-100 transition-all transform hover:scale-110 relative group/tooltip p-2 rounded-md hover:bg-white/10"
              onClick={() => setStreaming(!isStreaming)}
              title={isStreaming ? "Close Webcam" : "Open Webcam"}
            >
              {isStreaming ? (
                <BsCameraVideoOff size={20} />
              ) : (
                <BsCameraVideo size={20} />
              )}
            </button>
          )}

          {/* Instructions Button */}
          <button
            className="text-white opacity-80 hover:opacity-100 transition-all transform hover:scale-110 relative group/tooltip p-2 rounded-md hover:bg-white/10"
            onClick={() => setShowInstructions(!showInstructions)}
            title="Instructions"
          >
            <FiHelpCircle size={20} />
          </button>
        </div>

        {/* Credits */}
        <div className="text-white text-xs opacity-60 text-center border-t border-white/20 pt-2 draggable-area cursor-move">
          by johnathan chiu
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-6 max-w-md mx-4 border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white">
              <h2 className="text-xl font-bold mb-8 text-center">
                How to Use Floating Whiteboard
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 font-bold">1.</div>
                  <div>
                    <strong>Enable Webcam:</strong> Click "Open Webcam" to start
                    hand tracking
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-blue-400 font-bold">2.</div>
                  <div>
                    <strong>Draw:</strong> Pinch your index finger and thumb
                    together to draw; pretend as if drawing with a pen
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-blue-400 font-bold">3.</div>
                  <div>
                    <strong>Change Tools:</strong> Pinch your middle finger and
                    thumb to cycle through tools
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-blue-400 font-bold">4.</div>
                  <div>
                    <strong>Close Webcam:</strong> Pinch your ring finger and
                    thumb to turn off webcam
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  onClick={() => setShowInstructions(false)}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMenu;
