function CoRatedItemsUser(RatedUser, numItems) {
  const ratedItems = [];
  // console.log(userIndex,"www")
  for (let index = 0; index < numItems; index += 1) {
    if (RatedUser[index] !== 0) {
      //console.log(ratings[userIndex][index],"aqui")
      ratedItems.push(index);
    }
  }
  //console.log(ratedItems,"www")
  return ratedItems;
}

module.exports = {
  CoRatedItemsUser: CoRatedItemsUser,
};
