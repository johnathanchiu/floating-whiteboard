export const euclideanDistance = (dimensionPointPairs) =>
  Math.sqrt(
    dimensionPointPairs.reduce(
      (acc, pair) => (acc += (pair[0] - pair[1]) ** 2),
      0
    )
  );
