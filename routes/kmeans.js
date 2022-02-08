const express = require("express");
const math = require("mathjs");
const ClotheUsersServices = require("../services/clothe_user");
var recommendations = require("../lib/jaccard");
var CoRatedItemsUser = require("../lib/coRatedItemsUser");
const cacheResponse = require("../utils/cacheResponse");
var linearAlgebra = require("linear-algebra")(), // initialise it
  Vector = linearAlgebra.Vector,
  Matrix = linearAlgebra.Matrix;
var jd = require("jsdataframe");

const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS,
} = require("../utils/time");

function ClotheUserApi(app) {
  const router = express.Router();
  app.use("/api/kmeas", router);
  const clotheUsersServices = new ClotheUsersServices();

  router.get("/", async function (req, res, next) {
    console.log("Fffffff");
    //cacheResponse(res, FIVE_MINUTES_IN_SECONDS);
    const { tags } = req.query;

    try {
      const ClotheUsers = await clotheUsersServices.getClotheUser();

      let vectors = new Array();
      for (let i = 0; i < ClotheUsers.length; i++) {
        vectors[i] = [
          ClotheUsers[i]["ID_CLOTHE"],
          ClotheUsers[i]["RATING"],
          ClotheUsers[i]["ID_USER"],
        ];
      }
      const responsed = [];
      const kmeans = require("node-kmeans");
      kmeans.clusterize(vectors, { k: 4 }, (err, res) => {
        responsed.push(res);
        if (err) console.error(err);
        else console.log("%o", res);
      });

      res.status(200).json({
        data: ClotheUsers,
        message: "Item recomendation listed",
      });
    } catch (err) {
      next(err);
    }
  });
}

module.exports = ClotheUserApi;
