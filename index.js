const { config } = require("./config/config_env");
const authApi = require("./routes/auth");
const express = require("express");
const cors = require("cors");
const app = express();
const ClotheApi = require("./routes/clothe.js");
const ClotheUserApi = require("./routes/clothe_user.js");
const PersonalInformationApi = require("./routes/personal_information.js");

app.use(
  cors({ origin: "https://front-recomendacion-contenidos.herokuapp.com" })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(express.json());
ClotheApi(app);
ClotheUserApi(app);
PersonalInformationApi(app);
authApi(app);
app.listen(config.port, () => {
  console.log(`Listening http://localhost:${config.port}`);
});
