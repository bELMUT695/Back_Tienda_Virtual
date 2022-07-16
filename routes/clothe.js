const express = require("express");
const { typeOf } = require("mathjs");
const ClothesServices = require("../services/clothe");
var jd = require("jsdataframe");
var CoRatedItemsUser = require("../lib/coRatedItemsUser");
var similarityVisual = require("../lib/attention_Visual");
var linearAlgebra = require("linear-algebra")(), // initialise it
  Vector = linearAlgebra.Vector,
  Matrix = linearAlgebra.Matrix;
const math = require("mathjs");
var getColdStartItems = require("../lib/filterColdStartElement");
const cacheResponse = require("../utils/cacheResponse");
const ClotheUsersServices = require("../services/clothe_user");
const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS,
} = require("../utils/time");

function ClotheApi(app) {
  const clotheUsersServices = new ClotheUsersServices();
  const router = express.Router();
  app.use("/api/clothe", router);
  const clothesServices = new ClothesServices();
  router.get("/", async function (req, res, next) {
    const { tags } = req.query;

    try {
      const Clothes = await clothesServices.geClothes(/*{ tags }*/);

      // throw new Error("Error getting movies");
      res.status(200).json({
        data: Clothes,
        message: "movies listed",
      });
    } catch (error) {
      next(error);
    }
  });
  router.get("/topselling/categorys", async function (req, res, next) {
    try {
      const Clothes = await clothesServices.geClothes(/*{ tags }*/);

      var dataframe = jd.dfFromObjArray(Clothes);

      var dataframeSort = dataframe.sort("numSales");

      const id_prendas_Sort = dataframeSort._cols[0].values;

      const ClotheRecomended11 = [];

      for (let i = 0; i < id_prendas_Sort.length; i++) {
        ClotheRecomended11[i] = await clothesServices.getClothe(
          id_prendas_Sort[id_prendas_Sort.length - i - 1]
        );
      }
      return res.status(200).json({
        message: "Item recomendation Top10 more sales",
        data: ClotheRecomended11,
      });
    } catch (error) {
      next(error);
    }
  });
  router.get(
    "/topselling/category/:categoryId",
    async function (req, res, next) {
      const { categoryId } = req.params;
      try {
        const Clothes = await clothesServices.geClothes(/*{ tags }*/);

        console.log(
          "-------------------------------------------------------------------"
        );
        const CloteCategory1 = Clothes.filter(
          (e) => e.id_categoria === parseInt(categoryId)
        );

        var dataframe = jd.dfFromObjArray(CloteCategory1);
        console.log("dataframe: ");
        dataframe.p();
        console.log(
          "-------------------------------------------------------------------"
        );

        var dataframeSort = dataframe.sort("numSales");
        console.log("dataframeSort: ");
        dataframeSort.p();
        console.log(
          "-------------------------------------------------------------------"
        );
        const id_prendas_Sort = dataframeSort._cols[0].values;
        console.log(id_prendas_Sort, "DD");

        const ClotheRecomended11 = [];
        console.log(dataframeSort._cols[9].values);
        for (let i = 0; i < 10; i++) {
          ClotheRecomended11[i] = await clothesServices.getClothe(
            id_prendas_Sort[id_prendas_Sort.length - i - 1]
          );
        }
        return res.status(200).json({
          message: "Item recomendation Top10 more sales",
          data: ClotheRecomended11,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get("/:clotheId", async function (req, res, next) {
    console.log(req.params);
    const { clotheId } = req.params;
    try {
      const Clothe = await clothesServices.getClothe(clotheId);

      res.status(200).json({
        data: Clothe,
        message: "Clothe encontrado",
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/category/:categoryId", async function (req, res, next) {
    console.log(req.params);
    const { categoryId } = req.params;
    try {
      const clothes = await clothesServices.getClohtebyId(categoryId);
      res.status(200).json({
        data: clothes,
        message: "categorias encontrada",
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/gender/:female", async function (req, res, next) {
    const { female } = req.params;
    try {
      const clothes = await clothesServices.getClohtebyGender(female);
      res.status(200).json({
        data: clothes,
        message: "categorias encontrada",
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/user/clothe/:userId", async function (req, res, next) {
    const { userId } = req.params;

    console.log("Lest's go!!!!!!!");

    const { tags } = req.query;

    try {
      const userCluster = await clotheUsersServices.getKlusterId(userId);

      // nuevo usuario o usuario sin calificaiones
      if (userCluster.length === 0) {
        return res.status(400).json({
          message: "Usuario no tiene ninguna calificacion",
        });
      }

      const kuser = [];
      for (let i = 0; i < userCluster.length; i++) {
        kuser.push(userCluster[i].k);
      }

      const highest = (arr) =>
        (arr || []).reduce(
          (acc, el) => {
            acc.k[el] = acc.k[el] ? acc.k[el] + 1 : 1;
            acc.max = acc.max ? (acc.max < acc.k[el] ? el : acc.max) : el;
            return acc;
          },
          {
            k: {},
          }
        ).max;

      const kelegido = highest(kuser);

      //seleccion de usuarios de pertenecen  al cluster elegido
      const ClotheUsers = await clotheUsersServices.getAllKluster(kelegido);

      var dataframe = jd.dfFromObjArray(ClotheUsers);

      var dataframeSort = dataframe.sort("ID_USER");

      var Newdataframe = dataframeSort.s(jd.rng(0, 3300), [
        "ID_CLOTHE",
        "RATING",
        "ID_USER",
      ]);

      var pivotedMatrix = Newdataframe.pivot("ID_CLOTHE", "RATING");

      var pivotedMatrixItems = Newdataframe.pivot("ID_USER", "RATING");

      var interaction_matrix = pivotedMatrix
        .s(null, jd.rng(1, pivotedMatrix.nCol()))
        .toMatrix();

      var clusterRatingMatrix = new Matrix(interaction_matrix);

      var IndiceUser = pivotedMatrixItems._names.values.indexOf(userId);

      var ItemsValues = pivotedMatrix._names.values;

      const ClotheUserrating = await clothesServices.getAllClotheRatingUsers();

      const clotheswithoutrating = ClotheUserrating.filter(
        (e) => e.Rating.length === 0
      );

      const clothesanycalification = [];
      for (let i = 0; i < clotheswithoutrating.length; i++) {
        clothesanycalification.push(clotheswithoutrating[i]._id.toString());
      }
      const selected_id = ItemsValues.concat(clothesanycalification);

      const clothesanycalification2 = [];
      for (let i = 1; i < selected_id.length; i++) {
        const ClotheUsersra =
          await clothesServices.getAllClothesVisualAtentionKluster(
            selected_id[i]
          );
        clothesanycalification2.push(ClotheUsersra[0]);
      }

      const clothesformatreturn = clothesanycalification2.map((e) => {
        return {
          _id: e._id,
          VISUAL_ATTENTION: e.VISUAL_ATTENTION[0]?.vectorImage,
        };
      });

      const arrayVisualAttention2 = [];
      for (let i = 0; i < selected_id.length; i++) {
        const user = clothesformatreturn.find(
          (visualattention) => visualattention._id === parseInt(selected_id[i])
        );

        if (user !== undefined) {
          arrayVisualAttention2.push(user.VISUAL_ATTENTION);
        }
      }

      const IndexItemsRecomendationVisual2 = similarityVisual.AttentionVisual(
        arrayVisualAttention2,
        arrayVisualAttention2.length
      );

      var clusterRatingMatrix = new Matrix(interaction_matrix);

      var normalizedMatrix = clusterRatingMatrix.map(function (v) {
        //console.log((isNaN(v)))
        return isNaN(v) ? 0 : v;
      });

      const RatedUser = normalizedMatrix.data[IndiceUser - 1];

      ratingsMatrix = math.matrix(normalizedMatrix.data);

      const ratedItemsForUser = CoRatedItemsUser.CoRatedItemsUser(
        RatedUser,
        ratingsMatrix.size()[1]
      );

      const IndexItemsRecomendation = getColdStartItems.getColdStartItems(
        selected_id.length - 1,
        IndexItemsRecomendationVisual2,
        ratedItemsForUser
      );

      const Items_ID_Recomendation = [];
      for (let index = 0; index < IndexItemsRecomendation.length; index += 1) {
        Items_ID_Recomendation.push(
          selected_id[IndexItemsRecomendation[index] + 1]
        );
      }

      /* PROBAR */

      const ClotheRecomended13 = [];
      for (let i = 0; i < Items_ID_Recomendation.length; i++) {
        const elementfind = clothesanycalification.find(
          (item) => item === Items_ID_Recomendation[i]
        );
        if (elementfind) {
          ClotheRecomended13.push(elementfind);
        }
      }
      console.log(ClotheRecomended13);
      const ClotheRecomended11 = [];
      for (let i = 0; i < ClotheRecomended13.length; i++) {
        ClotheRecomended11[i] = await clothesServices.getClothe(
          ClotheRecomended13[i]
        );
      }

      res.status(200).json({
        data: ClotheRecomended11,
        message: "Item recomendation listed",
      });
    } catch (err) {
      next(err);
    }
  });
}

module.exports = ClotheApi;
