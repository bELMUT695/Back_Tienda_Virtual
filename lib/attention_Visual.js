const math = require("mathjs");

var recommendations = require("./jaccardTest");

function item_similarity_based_on_visual_attention(Values_Visual, nItems) {
  const coMatrixCalif = math.identity(nItems, nItems);
  const coMatriA = math.zeros(nItems, nItems);
  //const coMatrixCalif = math.zeros(0, nItems);
  const normalizerMatrix = math.zeros(nItems, nItems);

  // User
  for (let x = 0; x < nItems - 1; x += 1) {
    // Items in the user
    for (let index = x + 1; index < nItems; index += 1) {
      // Co-occurrence
      let valueAttentionItemnow =
        typeof Values_Visual[x] === "string"
          ? Values_Visual[x].split("-")
          : null;
      let valueAttentionItemnext =
        typeof Values_Visual[index] === "string"
          ? Values_Visual[index].split("-")
          : null;

      let sumValuesAttentionVisual = 0.0;
      if (valueAttentionItemnow && valueAttentionItemnext !== null) {
        if ((valueAttentionItemnow.length = valueAttentionItemnext.length)) {
          for (let i = 0; i < valueAttentionItemnow.length; i++) {
            if (
              parseFloat(valueAttentionItemnow[i]) >
              parseFloat(valueAttentionItemnext[i])
            ) {
              console.log(
                parseFloat(sumValuesAttentionVisual),
                parseFloat(valueAttentionItemnext[i])
              );
              sumValuesAttentionVisual =
                parseFloat(sumValuesAttentionVisual) +
                parseFloat(valueAttentionItemnext[i]);
            }

            if (
              parseFloat(valueAttentionItemnow[i]) <
              parseFloat(valueAttentionItemnext[i])
            ) {
              sumValuesAttentionVisual =
                parseFloat(sumValuesAttentionVisual) +
                parseFloat(valueAttentionItemnow[i]);
            }
          }
        }
      }
      sumValuesAttentionVisual = sumValuesAttentionVisual / nItems;
      coMatrixCalif.set([x, index], sumValuesAttentionVisual);
      coMatrixCalif.set([index, x], sumValuesAttentionVisual); // mirror
      /*
            coMatrixCalif.set([x, index], coMatrixCalif.get([x, index]) + 1);
            coMatrixCalif.set([index, x], coMatrixCalif.get([index, x]) + 1); // mirror
         */
    }
  }

  return coMatrixCalif;
}

module.exports = {
  AttentionVisual: item_similarity_based_on_visual_attention,
};
