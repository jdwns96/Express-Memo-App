const express = require("express"); // express
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const path = require("path"); // 경로 설정
const passport = require("passport");

const { sequelize } = require("./models"); // sequlize
const passportConfig = require("./passport");
const router = require("./routes");

dotenv.config();

const app = express();

passportConfig(); // 패스포트 설정
app.set("port", process.env.PORT || 8080);

app.use("/img", express.static(path.join(__dirname, "uploads"))); // /img 로 요청하지만 실제로는 uploads dir 에서 찾는다.
app.use("/", express.static(path.join(__dirname, "public"))); // 정적파일 라우터
// 넌적스 템플릿 엔진
nunjucks.configure("page", {
  noCache: true,
  autoescape: true,
  express: app,
  watch: true,
});
app.set("view engine", "html");

sequelize
  .sync({ force: false })
  // .sync({ force: true })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev")); // console 도구
app.use(express.json()); // body 정보 처리
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 해석기
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    name: "session-cookie",
  })
); // 세션 처리기

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

app.listen(app.get("port"), () => {
  console.log(app.get("port"), " : server listening !!");
});
