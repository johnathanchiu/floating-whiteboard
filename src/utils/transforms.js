export const euclideanDistance = (dimensionPointPairs) =>
  Math.sqrt(
    dimensionPointPairs.reduce(
      (acc, pair) => (acc += (pair[0] - pair[1]) ** 2),
      0
    )
  );

export function normalize(keypoint, width, height) {
  keypoint.x = keypoint.x / width;
  keypoint.y = keypoint.y / height;
  return keypoint;
}

export function inverseNormalize(keypoint, width, height) {
  keypoint.x = keypoint.x * width;
  keypoint.y = keypoint.y * height;
  return keypoint;
}
