export async function teardownWebcam(video) {
  const tracks = video.srcObject.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
  video.srcObject = null;
}

export async function setupWebcam() {
  const video = document.getElementById("video");
  const stream = await window.navigator.mediaDevices.getUserMedia({
    video: true,
    // video: {
    //   width: { ideal: 480 },
    //   height: { ideal: 360 },
    // },
  });

  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => {
      console.log(
        "Video metadata loaded:",
        video.videoWidth,
        video.videoHeight
      );
      resolve();
    };
  });

  await video.play();
  console.log("Video should be playing now");

  video.width = video.videoWidth;
  video.height = video.videoHeight;

  return video;
}
