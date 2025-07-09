import math
import numpy as np

euclidean_dist = lambda a, b: math.sqrt((a["x"] - b["x"]) ** 2 + (a["y"] - b["y"]) ** 2)


mixed_hand_cluster_centroids = np.array(
    [
        [
            0.05308381,
            0.3700525,
            0.41723969,
            0.39024684,
            0.37723414,
            0.41324361,
            0.69598563,
            0.70869242,
            0.61507006,
        ],
        [
            0.33720596,
            0.41143391,
            0.37406228,
            0.04879374,
            0.35137312,
            0.67957793,
            0.75993423,
            0.71995237,
            0.38494225,
        ],
        [
            0.27317758,
            0.04913904,
            0.31499614,
            0.33584301,
            0.38314826,
            0.65005824,
            0.41986455,
            0.66316381,
            0.61389367,
        ],
        [
            0.33288283,
            0.39859269,
            0.05819739,
            0.32172614,
            0.34419366,
            0.67576879,
            0.73676922,
            0.38224947,
            0.6028739,
        ],
        [
            0.26643064,
            0.36104879,
            0.38666625,
            0.37098103,
            0.42066665,
            0.65149052,
            0.71653372,
            0.69513723,
            0.58063184,
        ],
    ]
)


# centroid_label_to_name = {
#     0: "ring_pinch",
#     1: "middle_pinch",
#     2: "pinky_pinch",
#     3: "palm",
#     4: "fist",
#     5: "index_pinch",
# }


def find_near_centroid(feature_vec, right_hand=True):
    nearest_centroid_idx = 0
    min_dist = float("inf")

    cluster_centroids = mixed_hand_cluster_centroids

    for idx, centroid in enumerate(cluster_centroids):
        dist = np.sqrt(np.sum((centroid - feature_vec) ** 2))

        if dist < min_dist:
            nearest_centroid_idx = idx
            min_dist = dist

    return nearest_centroid_idx
