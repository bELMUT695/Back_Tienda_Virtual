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
      let vectors1 = new Array();
      for (let i = 0; i < ClotheUsers.length; i++) {
        vectors[i] = [
          ClotheUsers[i]["ID_CLOTHE"],
          ClotheUsers[i]["RATING"],
          ClotheUsers[i]["ID_USER"],
        ];

        vectors1[i] = [ClotheUsers[i]["_id"]];
      }
      console.log("vectors: ", vectors[0]);
      console.log("vectors1: ", vectors1);

      const kmeans = require("node-kmeans");

      const clusterPromise = new Promise(async (resolve, reject) => {
        let responsed = [];

        const recive = await kmeans.clusterize(
          vectors,
          { k: 4 },
          (err, res) => {
            responsed.push(res);
            if (err) console.error(err);
            else return res;
          }
        );
        resolve(recive);
      });

      clusterPromise.then(async (response) => {
        console.log("groups[0]", response.groups[0].clusterInd);
        console.log("groups[1]", response.groups[1].clusterInd);
        console.log("groups[2]", response.groups[2].clusterInd);
        console.log("groups[3]", response.groups[3].clusterInd);

        const ind1 = response.groups[0].clusterInd;
        const ind2 = response.groups[1].clusterInd;
        const ind3 = response.groups[2].clusterInd;
        const ind4 = response.groups[3].clusterInd;

        console.log("ind1", ind1);
        console.log("ind2", ind2);
        console.log("ind3", ind3);
        console.log("ind4", ind4);

        console.log("ind1", ind1);
        for (let i = 0; i < ind1.length; i++) {
          let index = vectors1[ind1[i]][0];
          console.log("index", i, ":", index);

          const a = await clotheUsersServices.updateClotheUser(index, { k: 1 });
          console.log(a);
        }

        //let ind2 = response.groups[1].clusterInd;
        console.log("ind2", ind2);
        for (let i = 0; i < ind2.length; i++) {
          let index = vectors1[ind2[i]][0];
          console.log("index", i, ":", index);

          const a = await clotheUsersServices.updateClotheUser(index, { k: 2 });
          console.log(a);
        }

        //let ind3 = response.groups[2].clusterInd;
        console.log("ind3", ind3);
        for (let i = 0; i < ind3.length; i++) {
          let index = vectors1[ind3[i]][0];
          console.log("index", i, ":", index);

          const a = await clotheUsersServices.updateClotheUser(index, { k: 3 });
          console.log(a);
        }

        //let ind4 = response.groups[3].clusterInd;
        console.log("ind4", ind4);
        for (let i = 0; i < ind4.length; i++) {
          let index = vectors1[ind4[i]][0];
          console.log("index", i, ":", index);

          const a = await clotheUsersServices.updateClotheUser(index, { k: 4 });
          console.log(a);
        }
      });

      /*const ClotheUsers1 = await clotheUsersServices.getClotheUser1(1233526510, 1297468800);
      console.log('mi funcion 1:', ClotheUsers1);


      const ClotheUsers2 = {
        ...ClotheUsers1,
        k: 1
      }
      
      const idCC= ClotheUsers2._id;
      console.log('mi id:', ClotheUsers2._id);
      console.log('mi funcion 2:', ClotheUsers2);

      //update
      const updatedNewId = await clotheUsersServices.updateClotheUser(idCC,ClotheUsers2);
      console.log(updatedNewId);*/

      const ClotheUsers1 = await clotheUsersServices.getClotheUser();

      res.status(200).json({
        data: ClotheUsers1,
        message: "Clusters Actualizados",
      });
    } catch (err) {
      next(err);
    }
  });
}

module.exports = ClotheUserApi;
