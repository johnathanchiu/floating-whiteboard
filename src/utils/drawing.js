function calculateVideoScaling(videoElement, videoRect) {
  const videoWidth = videoElement.width || 640;
  const videoHeight = videoElement.height || 480;

  const videoAspectRatio = videoWidth / videoHeight;
  const displayAspectRatio = videoRect.width / videoRect.height;

  let scaleX,
    scaleY,
    offsetX = 0,
    offsetY = 0;

  if (displayAspectRatio > videoAspectRatio) {
    scaleX = videoRect.width / videoWidth;
    scaleY = scaleX;
    const scaledHeight = videoHeight * scaleX;
    offsetY = (scaledHeight - videoRect.height) / 2;
  } else {
    scaleY = videoRect.height / videoHeight;
    scaleX = scaleY;
    const scaledWidth = videoWidth * scaleY;
    offsetX = (scaledWidth - videoRect.width) / 2;
  }

  return { videoWidth, videoHeight, scaleX, scaleY, offsetX, offsetY };
}

function transformKeypoint(keypoint, videoWidth, videoHeight, scaling, canvasWidth, canvasHeight, canvasRect) {
  const { scaleX, scaleY, offsetX, offsetY } = scaling;
  return {
    x:
      ((keypoint.x * videoWidth * scaleX - offsetX) /
        canvasRect.width) *
      canvasWidth,
    y:
      ((keypoint.y * videoHeight * scaleY - offsetY) /
        canvasRect.height) *
      canvasHeight,
  };
}

export function drawHands(hands, videoWidth, videoHeight, ctx) {
  if (hands.length <= 0) {
    return;
  }

  const canvas = ctx.canvas;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  const canvasElement = document.getElementById("float-canvas");
  const videoElement = document.getElementById("video");
  const canvasRect = canvasElement
    ? canvasElement.getBoundingClientRect()
    : null;
  const videoRect = videoElement ? videoElement.getBoundingClientRect() : null;

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    ctx.fillStyle = hand.handedness === "Left" ? "black" : "blue";
    ctx.strokeStyle = "White";
    ctx.lineWidth = 2;

    for (let key in hand.keypoints) {
      let keypoint;
      if (canvasRect && videoRect) {
        const scaling = calculateVideoScaling(videoElement, videoRect);
        keypoint = transformKeypoint(
          hand.keypoints[key], videoWidth, videoHeight,
          scaling, canvasWidth, canvasHeight, canvasRect
        );
      } else {
        keypoint = {
          x: hand.keypoints[key].x * canvasWidth,
          y: hand.keypoints[key].y * canvasHeight,
        };
      }

      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

export function drawPath(points, editor) {
  const lastPoint = points[points.length - 1];
  const point = getClientPointFromCanvasPoint({ point: lastPoint, editor });

  editor.dispatch({
    type: "pointer",
    target: "canvas",
    name: "pointer_move",
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
  const canvasElement = document.getElementById("float-canvas");
  const videoElement = document.getElementById("video");
  const canvasRect = canvasElement
    ? canvasElement.getBoundingClientRect()
    : null;
  const videoRect = videoElement ? videoElement.getBoundingClientRect() : null;

  if (canvasRect && videoRect) {
    const { videoWidth, videoHeight, scaleX, scaleY, offsetX, offsetY } =
      calculateVideoScaling(videoElement, videoRect);

    const scaledX = point.x * videoWidth * scaleX - offsetX;
    const scaledY = point.y * videoHeight * scaleY - offsetY;

    return {
      x: -scaledX + videoRect.width,
      y: scaledY,
    };
  }

  return {
    x: -point.x * window.innerWidth + window.innerWidth,
    y: point.y * window.innerHeight,
  };
}
