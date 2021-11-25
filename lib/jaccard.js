const math = require('mathjs');
const ONLY_RECOMMEND_FROM_SIMILAR_TASTE = 1;
var recommendations =require('./jaccardTest')
const allowedRatings = [1,2,3,4,5,6];

function arraysAreEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }
  for (let index = 0; index < array1.length; index += 1) {
    if (array1[index] !== array2[index]) {
      return false;
    }
  }
  return true;
}
function typeCheckCoOccurrenceMatrix(coMatrix, numItems) {
  if (!(coMatrix instanceof math.Matrix)) {
    throw new TypeError('The occurrence matrix should be a mathJS Matrix object generated by createCoMatrix');
  }
  if (!arraysAreEqual(coMatrix.size(), [numItems, numItems])) {
    throw new RangeError('Co matrix has wrong dimensions. Make sure to generate it using createCoMatrix');
  }
}

function getRecommendationsJaccard(ratings, coMatrix, userIndex) {
 // typeCheckRatings(ratings);
  let ratingsMatrix;
  try {
    ratingsMatrix = math.matrix(ratings);
  } catch (error) {
    throw new RangeError('Dimension error in ratings matrix');
  }
  const numItems = ratingsMatrix.size()[1];
  typeCheckCoOccurrenceMatrix(coMatrix, numItems);
  //typeCheckUserIndex(userIndex, ratings);
 

  console.log(userIndex)
  const numRatedItems = userIndex.length;
  //console.log(numRatedItems)
 
  const similarities = math.zeros(numRatedItems, numItems);

  for (let rated = 0; rated < numRatedItems; rated += 1) {
    for (let item = 0; item < numItems; item += 1) {
      similarities.set([rated, item], coMatrix.get([userIndex[rated], item])
                                     );

                                 //    console.log(coMatrix.get([ratedItemsForUser[rated], item]))
                                     
    }
  }

  let recommendations = math.zeros(numItems);
  for (let y = 0; y < numRatedItems; y += 1) {
    for (let x = 0; x < numItems; x += 1) {
      recommendations.set([x], recommendations.get([x]) + similarities.get([y, x]));
      //console.log(similarities.get([y, x]))
    }
  }

  recommendations = math.dotDivide(recommendations, numRatedItems);
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
  console.log(recOrder)
  return recOrder;
}












function createCoMatrix(ratings) {
    recommendations.typeCheckRatings(ratings)
    let ratingsMatrix;
  try {
    ratingsMatrix = math.matrix(ratings);
  } catch (error) {
    throw new RangeError('Dimension error in ratings matrix');
  }

  recommendations.checkRatingValues(ratingsMatrix )
  const nUsers = ratingsMatrix.size()[0];
  const nItems = ratingsMatrix.size()[1];
  const coMatrixCalif = math.identity(nItems, nItems);
  const coMatriA = math.zeros(nItems, nItems);
  //const coMatrixCalif = math.zeros(0, nItems);
  const normalizerMatrix = math.zeros(nItems,nItems);

  for (let y = 0; y < nUsers; y += 1) {
    // User
    for (let x = 0; x < (nItems - 1); x += 1) {
      // Items in the user
      for (let index = x + 1; index < nItems; index += 1) {
      // Co-occurrence
        if (allowedRatings.includes(ratings[y][x]) && allowedRatings.includes(ratings[y][index]) ){
            coMatrixCalif.set([x, index], coMatrixCalif.get([x, index]) + 1);
            coMatrixCalif.set([index, x], coMatrixCalif.get([index, x]) + 1); // mirror
        }
        if ( allowedRatings.includes(ratings[y][x]) ) {
            coMatriA.set([x, index], coMatriA.get([x, index]) + 1);
            coMatriA.set([index, x], coMatriA.get([index, x]) + 1);
        }

        if (allowedRatings.includes(ratings[y][index])) {
            normalizerMatrix.set([x, index], normalizerMatrix.get([x, index]) + 1);
            normalizerMatrix.set([index, x], normalizerMatrix.get([index, x]) + 1);
          }
          
      }
      
    }
  }
 // console.log(coMatrixCalif)
 // console.log(normalizerMatrix)
  const JaccardBest=math.dotDivide(1,math.add(1,math.add(math.add(math.dotDivide(1,coMatrixCalif),math.dotDivide(coMatriA,math.add(1,coMatriA))),math.dotDivide(1,math.add(1,normalizerMatrix)))))
 // const var1=math.dotDivide(math.add(coMatrix,1))
 //console.log(var1)
 return JaccardBest;
}

function collaborativeFilterBasedItems(ratings, coRatedUserItems) {
    if (!Array.isArray(ratings)) return false;
    const coMatrixDenominador = createCoMatrix(ratings);
    const recommendations = getRecommendationsJaccard(ratings, coMatrixDenominador, coRatedUserItems);
    return recommendations;
    

  }

  module.exports = {
    CFilterJaccard: collaborativeFilterBasedItems
   
  };