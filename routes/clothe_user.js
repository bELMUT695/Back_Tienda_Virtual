const express = require("express");

var jd = require("jsdataframe");
var isodate = require("isodate");
const math = require("mathjs");
var linearAlgebra = require("linear-algebra")(), // initialise it
  Vector = linearAlgebra.Vector,
  Matrix = linearAlgebra.Matrix;

const ClotheUsersServices = require("../services/clothe_user");
var recommendations = require("../lib/jaccard");
var similarityVisual = require("../lib/attention_Visual");
var CoRatedItemsUser = require("../lib/coRatedItemsUser");
const ClothesServices = require("../services/clothe");
const cacheResponse = require("../utils/cacheResponse");
const clothesServices = new ClothesServices();
const {
  FIVE_MINUTES_IN_SECONDS,
  SIXTY_MINUTES_IN_SECONDS,
} = require("../utils/time");

function ClotheUserApi(app) {
  const router = express.Router();
  app.use("/api/rating", router);

  const clotheUsersServices = new ClotheUsersServices();
  const clothesServices = new ClothesServices();

  router.get("/consultrating/:userId", async function (req, res, next) {
    const { userId } = req.params;

    const { tags } = req.query;

    try {
      const userCluster = await clotheUsersServices.getKlusterId(userId);
      console.log("userCluster: ", userCluster);

      // nuevo usuario o usuario sin calificaiones
      if (userCluster.length === 0) {
        return res.status(200).json({
          message: false,
        });
      } else {
        console.log("true");
        return res.status(200).json({
          message: true,
        });
      }
    } catch (err) {
      next(err);
    }
  });

  router.post("/insert-rating/:Id", async function (req, res, next) {
    const { Id } = req.params;
    const cuerpo = req.body;
    console.log(typeof cuerpo.ID_USER);
    console.log(typeof cuerpo.ID_CLOTHE, "prenda");
    const variable = 0.67;

    try {
      const clothes = await clotheUsersServices.getUserUserByrating(
        Id,
        cuerpo.ID_CLOTHE
      );
      console.log(clothes, "ff");
      const columnratingvalue = { RATING: cuerpo.RATING };
      const fecha = new Date();
      if (clothes.length === 0) {
        const time_stamp = {
          TIME_STAMP: isodate(fecha.toISOString()),
        };

        const objecttoinsert = {
          ...time_stamp,
          ...cuerpo,
        };

        const clothes = await clotheUsersServices.postValueRating(
          objecttoinsert
        );
        return res.status(200).json({
          data: objecttoinsert,
          message: "Rating insertado",
        });
      } else {
        let IdRegisterObject = clothes[0]._id;
        const clothes = await clotheUsersServices.updateValueRating(
          IdRegisterObject,
          columnratingvalue
        );

        return res.status(200).json({
          data: clothes,
          message: "Rating modificado",
        });
      }
    } catch (error) {
      next(error);
    }
  });
  router.get("/consultaKluster/:kelegido", async function (req, res, next) {
    const { kelegido } = req.params;
    console.log("kelegido: ", kelegido);

    try {
      const ClotheUsers = await clotheUsersServices.getAllKluster1(
        parseInt(kelegido)
      );
      console.log("userCluster: ", ClotheUsers);

      return res.status(200).json({
        ClotheUsers: ClotheUsers,
        message: true,
      });
    } catch (err) {
      next(err);
    }
  });
  router.get("/value-rating/:Id", async function (req, res, next) {
    const { Id } = req.params;

    try {
      const clothes = await clotheUsersServices.getClotheUserByrating(Id);

      res.status(200).json({
        data: clothes,
        message: "rating encontradass",
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:userId", async function (req, res, next) {
    const { userId } = req.params;

    console.log("Lest's go!!!!!!!");

    const { tags } = req.query;

    try {
      const userCluster = await clotheUsersServices.getKlusterId(userId);
      console.log("userCluster: ", userCluster);

      // nuevo usuario o usuario sin calificaiones
      if (userCluster.length === 0) {
        return res.status(400).json({
          message: "Usuario nuevo",
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

      //const clasification1 = [];
      const clasification1 = ClotheUsers.filter((e) => e.RATING === 1);
      const clasification2 = ClotheUsers.filter(
        (e) => e.RATING === 2 || e.RATING === 3
      );
      const clasification3 = ClotheUsers.filter(
        (e) => e.RATING === 4 || e.RATING === 5
      );
      console.log("clasification1: ", clasification1);
      console.log("clasification2: ", clasification2);
      console.log("clasification3: ", clasification3);
      ("-------------------------------------------------------------------");

      const fechaActual = new Date();

      //actualizacion de las calificaciones
      // MUTATIONS .....
      const mutation1 = clasification1.map((e) => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = (
          (fechaActual.getTime() - createdAtt.getTime()) /
          (1000 * 60 * 60 * 24)
        ).toFixed(4);

        return {
          _id: e._id,
          RATING: Math.round(e.RATING * (Math.pow(fechafinal, -0.345) * 0.49)),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          TIME_STAMP: e.TIME_STAMP,
          VISUAL_ATTENTION: e.VISUAL_ATTENTION[0]?.vectorImage,
        };
      });
      const mutation2 = clasification2.map((e) => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = (
          (fechaActual.getTime() - createdAtt.getTime()) /
          (1000 * 60 * 60 * 24)
        ).toFixed(4);
        console.log("fecha final", fechafinal);
        return {
          _id: e._id,
          RATING: Math.round(
            e.RATING * (2 / (1 + Math.pow(Math.E, 0.08066 * fechafinal)))
          ),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          TIME_STAMP: e.TIME_STAMP,
          VISUAL_ATTENTION: e.VISUAL_ATTENTION[0]?.vectorImage,
        };
      });
      const mutation3 = clasification3.map((e) => {
        const createdAtt = new Date(e.TIME_STAMP.toString());
        const fechafinal = (
          (fechaActual.getTime() - createdAtt.getTime()) /
          (1000 * 60 * 60 * 24)
        ).toFixed(4);
        console.log("fecha final", fechafinal);
        return {
          _id: e._id,
          RATING: Math.round(e.RATING * Math.pow(Math.E, -0.0258 * fechafinal)),
          ID_USER: e.ID_USER,
          ID_CLOTHE: e.ID_CLOTHE,
          VISUAL_ATTENTION: e.VISUAL_ATTENTION[0]?.vectorImage,
        };
      });
      console.log("mutation1: ", mutation1);
      console.log("mutation2: ", mutation2);
      console.log("mutation3: ", mutation3);

      //prendas con sus calificaciones actualizadas en el tiempo
      const clotheusers1Concat = mutation1.concat(mutation2).concat(mutation3);
      console.log("clotheusers1Concat: ", clotheusers1Concat);
      console.log(
        "-------------------------------------------------------------------"
      );

      var dataframe = jd.dfFromObjArray(clotheusers1Concat);
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

      //--------------Extraer Valores de Atencion Visual---------------------------
      const arrayVisualAttention = [];

      for (let i = 0; i < ItemsValues.length; i++) {
        const user = clotheusers1Concat.find(
          (visualattention) =>
            visualattention.ID_CLOTHE === parseInt(ItemsValues[i])
        );

        if (user !== undefined) {
          arrayVisualAttention.push(user.VISUAL_ATTENTION);
        }
      }

      const IndexItemsRecomendationVisual = similarityVisual.AttentionVisual(
        arrayVisualAttention,
        arrayVisualAttention.length
      );
      console.log(
        "------------------Values Visual Attention---------",
        IndexItemsRecomendationVisual
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
      //const  CoItemsRatedUser=CoRatedItemsUser

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
      console.log("ratedItemsForUser: ", ratedItemsForUser);
      console.log(
        "-------------------------------------------------------------------"
      );

      const coMatrixDenominador = recommendations.CFilterJaccard(
        normalizedMatrix.data
      );

      console.log("Similitud de los items", coMatrixDenominador);
      const SimilitudFinal = math.add(
        math.multiply(0.8, coMatrixDenominador._data),
        math.multiply(0.2, IndexItemsRecomendationVisual)
      );

      console.log("----------------Matriz ..-------------", SimilitudFinal);
      const SimilitudFinalItems = SimilitudFinal.map(function (
        value,
        index,
        matrix
      ) {
        const power = math.pow(value, 0.05);

        return power;
      });
      console.log(
        "----------------Matriz General-------------",
        SimilitudFinalItems
      );

      const similitudElement1 = SimilitudFinalItems._data[0];
      console.log("ERRRRRRRRRRRR", similitudElement1);

      let sumValuesAttentionVisual = 0;
      let sumValuesAttentionVisualDenominador = 0;
      for (let i = 0; i < similitudElement1.length; i++) {
        sumValuesAttentionVisual =
          sumValuesAttentionVisual + similitudElement1[i] * RatedUser[i];
        sumValuesAttentionVisualDenominador =
          sumValuesAttentionVisualDenominador + similitudElement1[i];
      }

      const IndexItemsRecomendation =
        recommendations.CFilterJaccardRecomendation(
          normalizedMatrix.data,
          ratedItemsForUser,
          SimilitudFinalItems
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
          ItemsValues[IndexItemsRecomendation[index] + 1]
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

module.exports = ClotheUserApi;
