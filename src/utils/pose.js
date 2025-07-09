import { euclideanDistance } from "./transforms";

const FINGER_LOOKUP_INDICES = [
  "WRIST",
  "THUMB_CMC",
  "THUMB_MCP",
  "THUMB_IP",
  "THUMB_TIP",
  "INDEX_FINGER_MCP",
  "INDEX_FINGER_PIP",
  "INDEX_FINGER_DIP",
  "INDEX_FINGER_TIP",
  "MIDDLE_FINGER_MCP",
  "MIDDLE_FINGER_PIP",
  "MIDDLE_FINGER_DIP",
  "MIDDLE_FINGER_TIP",
  "RING_FINGER_MCP",
  "RING_FINGER_PIP",
  "RING_FINGER_DIP",
  "RING_FINGER_TIP",
  "PINKY_MCP",
  "PINKY_PIP",
  "PINKY_DIP",
  "PINKY_TIP",
];

export function getUserHandGesture(handGestureInformation) {
  const gestures = handGestureInformation.gestures;
  if (gestures) {
    const gesture_name = gestures[0].categoryName;
    const indexKeypoint = handGestureInformation.keypoints.INDEX_FINGER_TIP;
    const thumbKeypoint = handGestureInformation.keypoints.THUMB_TIP;
    if (gesture_name) {
      if (gesture_name !== "none") {
        return [
          gesture_name,
          handGestureInformation.keypoints.INDEX_FINGER_TIP,
        ];
      }
    }

    if (
      euclideanDistance([
        [indexKeypoint.x, thumbKeypoint.x],
        [indexKeypoint.y, thumbKeypoint.y],
      ]) <= 0.06
    ) {
      return ["index_pinch", handGestureInformation.keypoints.INDEX_FINGER_TIP];
    }
  }
  return [null, null];
}

export function createKeyMap(handPoseEstimations) {
  const handPoseKeyMap = [];
  for (let i = 0; i < handPoseEstimations.landmarks.length; i++) {
    let keypoints = handPoseEstimations.landmarks[i].reduce((acc, obj, idx) => {
      acc[FINGER_LOOKUP_INDICES[idx]] = obj;
      return acc;
    }, {});
    let keypoints3D = handPoseEstimations.worldLandmarks[i].reduce(
      (acc, obj, idx) => {
        acc[FINGER_LOOKUP_INDICES[idx]] = obj;
        return acc;
      },
      {}
    );

    handPoseKeyMap.push({
      handedness:
        handPoseEstimations.handedness[i].categoryName === "Left"
          ? "Right"
          : "Left",
      keypoints: keypoints,
      keypoints3D: keypoints3D,
      gestures: handPoseEstimations.gestures[i],
    });
  }
  return handPoseKeyMap;
}
