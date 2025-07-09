import os

import pickle
import numpy as np
import mediapipe as mp
import cv2

from clusters import *


mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands


finger_mapping = {
    0: "WRIST",
    1: "THUMB_CMC",
    2: "THUMB_MCP",
    3: "THUMB_IP",
    4: "THUMB_TIP",
    5: "INDEX_FINGER_MCP",
    6: "INDEX_FINGER_PIP",
    7: "INDEX_FINGER_DIP",
    8: "INDEX_FINGER_TIP",
    9: "MIDDLE_FINGER_MCP",
    10: "MIDDLE_FINGER_PIP",
    11: "MIDDLE_FINGER_DIP",
    12: "MIDDLE_FINGER_TIP",
    13: "RING_FINGER_MCP",
    14: "RING_FINGER_PIP",
    15: "RING_FINGER_DIP",
    16: "RING_FINGER_TIP",
    17: "PINKY_MCP",
    18: "PINKY_PIP",
    19: "PINKY_DIP",
    20: "PINKY_TIP",
}
pairwise_points = [
    ("THUMB_TIP", "INDEX_FINGER_TIP"),
    ("THUMB_TIP", "MIDDLE_FINGER_TIP"),
    ("THUMB_TIP", "RING_FINGER_TIP"),
    ("THUMB_TIP", "PINKY_TIP"),
    ("THUMB_TIP", "WRIST"),
    ("INDEX_FINGER_TIP", "WRIST"),
    ("MIDDLE_FINGER_TIP", "WRIST"),
    ("RING_FINGER_TIP", "WRIST"),
    ("PINKY_TIP", "WRIST"),
]


# POSE = "index_pinch"
# POSE = "middle_pinch"
# POSE = "ring_pinch"
POSE = "pinky_pinch"
# POSE = "none"

# POSE = "fist"
# POSE = "palm"

folder = f"dataset/{POSE}"
os.makedirs(folder, exist_ok=True)

num_samples_so_far = len(os.listdir(folder))


pose_data = []

cap = cv2.VideoCapture(1)  # cv2.VideoCapture(0)
with mp_hands.Hands(min_detection_confidence=0.8, min_tracking_confidence=0.5) as hands:
    while cap.isOpened():
        ret, frame = cap.read()

        # BGR 2 RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Flip on horizontal
        image = cv2.flip(image, 1)

        # Set flag
        image.flags.writeable = False

        # Detections
        results = hands.process(image)

        # Set flag to true
        image.flags.writeable = True

        # RGB 2 BGR
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Rendering results
        if results.multi_hand_landmarks:
            cv2.imwrite(
                os.path.join(folder, f"{len(pose_data) + num_samples_so_far}.jpg"),
                image,
            )
            print(os.path.join(folder, f"{len(pose_data) + num_samples_so_far}.jpg"))
            for num, hand in enumerate(results.multi_hand_landmarks):
                mp_drawing.draw_landmarks(
                    image,
                    hand,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(
                        color=(121, 22, 76), thickness=2, circle_radius=4
                    ),
                    mp_drawing.DrawingSpec(
                        color=(250, 44, 250), thickness=2, circle_radius=2
                    ),
                )

                handedness = results.multi_handedness[num].classification[0].label
                landmarks = {
                    finger_mapping[idx]: {
                        "x": landmark.x,
                        "y": landmark.y,
                        "z": landmark.z,
                    }
                    for idx, landmark in enumerate(hand.landmark)
                }

                pose_data.append({"handedness": handedness, "landmarks": landmarks})

        cv2.imshow("Hand Tracking", image)

        print(len(pose_data))
        if len(pose_data) >= 400:
            break

        if cv2.waitKey(10) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()

# with open(f"{POSE}.pkl", "wb") as f:
#     pickle.dump(pose_data, f)
