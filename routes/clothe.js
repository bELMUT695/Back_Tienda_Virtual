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
      console.log("userCluster: ", userCluster);

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
      console.log("kuser", kuser);

      // Selecciona el cluster con mas fuerza
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
      console.log("kelegido", kelegido);

      //seleccion de usuarios de pertenecen  al cluster elegido
      const ClotheUsers = await clotheUsersServices.getAllKluster(kelegido);
      console.log("ClotheUsers: ", ClotheUsers);
      console.log(
        "-------------------------------------------------------------------"
      );
      var dataframe = jd.dfFromObjArray(ClotheUsers);
      console.log("dataframe: ");
      dataframe.p();
      console.log(
        "-------------------------------------------------------------------"
      );

      var dataframeSort = dataframe.sort("ID_USER");
      console.log("dataframeSort: ");
      dataframeSort.p();
      console.log(
        "-------------------------------------------------------------------"
      );

      var Newdataframe = dataframeSort.s(jd.rng(0, 3300), [
        "ID_CLOTHE",
        "RATING",
        "ID_USER",
      ]);
      console.log("Newdataframe: ");
      Newdataframe.p();
      console.log(
        "-------------------------------------------------------------------"
      );

      var pivotedMatrix = Newdataframe.pivot("ID_CLOTHE", "RATING");
      console.log("pivotedMatrix: ");
      pivotedMatrix.p();
      console.log(
        "-------------------------------------------------------------------"
      );

      var pivotedMatrixItems = Newdataframe.pivot("ID_USER", "RATING");
      console.log("pivotedMatrixItems: ");
      pivotedMatrixItems.p();
      console.log(
        "-------------------------------------------------------------------"
      );

      //console.log(pivotedMatrix.nCol(), "fssdsds");
      // console.log(pivotedMatrix.p()[1])

      var interaction_matrix = pivotedMatrix
        .s(null, jd.rng(1, pivotedMatrix.nCol()))
        .toMatrix();
      console.log("interaction_matrix: ", interaction_matrix);
      console.log(
        "-------------------------------------------------------------------"
      );

      var clusterRatingMatrix = new Matrix(interaction_matrix);
      console.log("clusterRatingMatrix: ", clusterRatingMatrix);
      console.log(
        "-------------------------------------------------------------------"
      );

      var IndiceUser = pivotedMatrixItems._names.values.indexOf(userId);
      console.log("IndiceUser: ", IndiceUser);
      console.log(
        "-------------------------------------------------------------------"
      );

      var ItemsValues = pivotedMatrix._names.values;
      console.log("ItemsValues: ", ItemsValues);
      console.log(
        "-------------------------------------------------------------------"
      );

      const ClotheUserrating = await clothesServices.getAllClotheRatingUsers();

      const clotheswithoutrating = ClotheUserrating.filter(
        (e) => e.Rating.length === 0
      );

      const clothesanycalification = [];
      for (let i = 0; i < clotheswithoutrating.length; i++) {
        clothesanycalification.push(clotheswithoutrating[i]._id.toString());
      }
      const selected_id = ItemsValues.concat(clothesanycalification);

      console.log("Arranque en frio de elementos", selected_id);
      const clothesanycalification2 = [];
      for (let i = 1; i < selected_id.length; i++) {
        console.log(typeof selected_id[i]);
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
      console.log("clusterRatingMatrix: ", clusterRatingMatrix);
      console.log(
        "-------------------------------------------------------------------"
      );

      console.log(
        "------------------Values Visual Attention2---------",
        IndexItemsRecomendationVisual2
      );
      var normalizedMatrix = clusterRatingMatrix.map(function (v) {
        //console.log((isNaN(v)))
        return isNaN(v) ? 0 : v;
      });

      const RatedUser = normalizedMatrix.data[IndiceUser - 1];
      console.log("RatedUser: ", RatedUser);
      console.log(
        "-------------------------------------------------------------------"
      );
      ratingsMatrix = math.matrix(normalizedMatrix.data);
      console.log("ratingsMatrix: ", ratingsMatrix);
      console.log("ratingsMatrix.size()[1]: ", ratingsMatrix.size()[1]);
      console.log(
        "-------------------------------------------------------------------"
      );
      const ratedItemsForUser = CoRatedItemsUser.CoRatedItemsUser(
        RatedUser,
        ratingsMatrix.size()[1]
      );
      console.log("Identificadores", clothesformatreturn);
      const IndexItemsRecomendation = getColdStartItems.getColdStartItems(
        selected_id.length - 1,
        IndexItemsRecomendationVisual2,
        ratedItemsForUser
      );
      console.log("IndexItemsRecomendation: ", IndexItemsRecomendation);
      console.log(
        "IndexItemsRecomendation.length: ",
        IndexItemsRecomendation.length
      );
      console.log(
        "-------------------------------------------------------------------"
      );

      const Items_ID_Recomendation = [];
      for (let index = 0; index < IndexItemsRecomendation.length; index += 1) {
        Items_ID_Recomendation.push(
          selected_id[IndexItemsRecomendation[index] + 1]
        );
      }
      console.log("Items_ID_Recomendation: ", Items_ID_Recomendation);
      console.log(
        "-------------------------------------------------------------------"
      );

      /* PROBAR */
      const ClotheRecomended11 = [];
      console.log(
        "Items_ID_Recomendation.length",
        Items_ID_Recomendation.length
      );
      for (let i = 0; i < Items_ID_Recomendation.length; i++) {
        ClotheRecomended11[i] = await clothesServices.getClothe(
          Items_ID_Recomendation[i]
        );
      }
      console.log("ClotheRecomended11: ", ClotheRecomended11);
      console.log(
        "-------------------------------------------------------------------"
      );

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
