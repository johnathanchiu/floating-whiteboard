// Helper function to calculate scaling factors for video-to-display mapping
function calculateVideoScaling(videoElement, videoRect) {
  // Get video dimensions
  const videoWidth = videoElement.width || 640;
  const videoHeight = videoElement.height || 480;

  // Calculate the aspect ratio of the video
  const videoAspectRatio = videoWidth / videoHeight;
  // Calculate the aspect ratio of the display area
  const displayAspectRatio = videoRect.width / videoRect.height;

  // Determine how the video is being scaled with objectFit: "cover"
  let scaleX,
    scaleY,
    offsetX = 0,
    offsetY = 0;

  if (displayAspectRatio > videoAspectRatio) {
    // Video is wider than display area, so it's scaled by width and cropped vertically
    scaleX = videoRect.width / videoWidth;
    scaleY = scaleX; // Maintain aspect ratio
    // Calculate vertical crop
    const scaledHeight = videoHeight * scaleX;
    offsetY = (scaledHeight - videoRect.height) / 2;
  } else {
    // Video is taller than display area, so it's scaled by height and cropped horizontally
    scaleY = videoRect.height / videoHeight;
    scaleX = scaleY; // Maintain aspect ratio
    // Calculate horizontal crop
    const scaledWidth = videoWidth * scaleY;
    offsetX = (scaledWidth - videoRect.width) / 2;
  }

  return { videoWidth, videoHeight, scaleX, scaleY, offsetX, offsetY };
}

export function drawHands(hands, videoWidth, videoHeight, ctx) {
  if (hands.length <= 0) {
    return;
  }

  // Get the actual canvas dimensions
  const canvas = ctx.canvas;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Get the display dimensions of both elements
  const canvasElement = document.getElementById("float-canvas");
  const videoElement = document.getElementById("video");
  const canvasRect = canvasElement
    ? canvasElement.getBoundingClientRect()
    : null;
  const videoRect = videoElement ? videoElement.getBoundingClientRect() : null;

  // If we have both elements, calculate the display scaling
  if (canvasRect && videoRect) {
    const { scaleX, scaleY, offsetX, offsetY } = calculateVideoScaling(
      videoElement,
      videoRect
    );

    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      ctx.fillStyle = hand.handedness === "Left" ? "black" : "blue";
      ctx.strokeStyle = "White";
      ctx.lineWidth = 2;

      for (let key in hand.keypoints) {
        // Make a copy of the keypoint to avoid modifying the original
        const keypointCopy = { ...hand.keypoints[key] };

        // Apply scaling and offset to account for objectFit: "cover"
        const keypoint = {
          x:
            ((keypointCopy.x * videoWidth * scaleX - offsetX) /
              canvasRect.width) *
            canvasWidth,
          y:
            ((keypointCopy.y * videoHeight * scaleY - offsetY) /
              canvasRect.height) *
            canvasHeight,
        };

        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  } else {
    // Fallback to simple scaling if we can't get the display dimensions
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      ctx.fillStyle = hand.handedness === "Left" ? "black" : "blue";
      ctx.strokeStyle = "White";
      ctx.lineWidth = 2;

      for (let key in hand.keypoints) {
        const keypointCopy = { ...hand.keypoints[key] };
        const keypoint = {
          x: keypointCopy.x * canvasWidth,
          y: keypointCopy.y * canvasHeight,
        };

        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

export function drawPath(points) {
  const lastPoint = points[points.length - 1];
  const editor = window["editor"];
  const point = getClientPointFromCanvasPoint({ point: lastPoint, editor });

  editor.dispatch({
    type: "pointer",
    target: "canvas",
    name: "pointer_move",
    // weird but true: we need to put the screen point back into client space
    point,
    pointerId: 0,
    ctrlKey: editor.inputs.ctrlKey,
    altKey: editor.inputs.altKey,
    shiftKey: editor.inputs.shiftKey,
    button: 0,
    isPen: false,
  });
}

export function getClientPointFromCanvasPoint({ point, editor }) {
  // Get the display dimensions of both elements
  const canvasElement = document.getElementById("float-canvas");
  const videoElement = document.getElementById("video");
  const canvasRect = canvasElement
    ? canvasElement.getBoundingClientRect()
    : null;
  const videoRect = videoElement ? videoElement.getBoundingClientRect() : null;

  // If we have both elements, calculate the display scaling
  if (canvasRect && videoRect) {
    const { videoWidth, videoHeight, scaleX, scaleY, offsetX, offsetY } =
      calculateVideoScaling(videoElement, videoRect);

    // Apply the same scaling and offset as in drawHands
    const scaledX = point.x * videoWidth * scaleX - offsetX;
    const scaledY = point.y * videoHeight * scaleY - offsetY;

    // Convert to client coordinates (with horizontal flip for mirroring)
    return {
      x: -scaledX + videoRect.width,
      y: scaledY,
    };
  }

  // Fallback to original behavior
  return {
    x: -point.x * window.innerWidth + window.innerWidth,
    y: point.y * window.innerHeight,
  };
}
