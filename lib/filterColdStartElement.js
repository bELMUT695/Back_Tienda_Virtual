const math = require("mathjs");
const ONLY_RECOMMEND_FROM_SIMILAR_TASTE = 1;
const allowedRatings = [1, 2, 3, 4, 5, 6];
function getRecommendationsColdStartItems(numItems, coMatrix, userIndex) {
  console.log(numItems, userIndex.length);
  const similarities = math.zeros(userIndex.length, numItems);

  for (let rated = 0; rated < userIndex.length; rated += 1) {
    for (let item = 0; item < numItems; item += 1) {
      similarities.set([rated, item], coMatrix.get([userIndex[rated], item]));
      //console.log(coMatrix.get([ratedItemsForUser[rated], item]))
    }
  }

  let recommendations = math.zeros(numItems);
  for (let y = 0; y < userIndex.length; y += 1) {
    for (let x = 0; x < numItems; x += 1) {
      recommendations.set(
        [x],
        recommendations.get([x]) + similarities.get([y, x])
      );
      //console.log(similarities.get([y, x]))
    }
  }

  recommendations = math.dotDivide(recommendations, userIndex.length);
  // console.log(recommendations)
  const rec = recommendations.toArray();
  let recSorted = recommendations.toArray();
  //console.log(recSorted+ "VVVVVVVVV")
  recSorted.sort((a, b) => b - a);
  //console.log(recSorted+ "FFFFFFFFFF")

  if (ONLY_RECOMMEND_FROM_SIMILAR_TASTE) {
    recSorted = recSorted.filter((element) => element !== 0);
  }

  let recOrder = recSorted.map((element) => {
    const index = rec.indexOf(element);
    rec[index] = null; // To ensure no duplicate indices in the future iterations.

    return index;
  });

  recOrder = recOrder.filter((index) => !userIndex.includes(index));
  console.log(recOrder);
  return recOrder;
}

module.exports = {
  getColdStartItems: getRecommendationsColdStartItems,
};
