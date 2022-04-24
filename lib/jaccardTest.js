function typeCheckRatings(ratings) {
  if (!Array.isArray(ratings)) {
    throw new TypeError(
      "The ratings and coMatrix field should be an array of arrays (matrix)"
    );
  }
}


function checkRatingValues(ratingMatrix) {
  const allowedRatings = [0, 1, 2, 3, 4, 5, 6];
  ratingMatrix.forEach((value) => {
    if (!Number.isInteger(value) || !allowedRatings.includes(value)) {
      throw new TypeError(
        "Wrong rating in rating array. Currently permitted values are 0 ,1,2,3,4,5,6"
      );
    }
  });
  return true;
}


module.exports = {
  typeCheckRatings: typeCheckRatings,
  checkRatingValues: checkRatingValues,
};
