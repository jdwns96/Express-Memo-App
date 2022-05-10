const express = require("express"); // express
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const nunjucks = require("nunjucks");
const path = require("path"); // 경로 설정
const bcrypt = require("bcrypt");
const User = require("./models/user");

dotenv.config();

const { sequelize } = require("./models"); // sequlize

const app = express();

app.set("port", process.env.PORT || 8080);

app.use("/", express.static(path.join(__dirname, "public"))); // 정적파일 라우터
// 넌적스 템플릿 엔진
nunjucks.configure("page", {
  autoescape: true,
  express: app,
});
app.set("view engine", "html");

sequelize
  .sync({ force: false })
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

app.get("/", (req, res) => {
  res.render("index.html", {
    title: "메모장",
  });
});

app.get("/login", (req, res) => {
  res.render("login.html", {
    title: "로그인",
  });
});

app.get("/join", (req, res) => {
  res.render("join.html", {
    title: "회원가입",
  });
});

app.post("/join", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist");
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      password: hash,
    });
    return res.redirect("/login");
  } catch (e) {
    console.error(e);
    return next(e);
  }
});

app.post("/login", (req, res) => {});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), " : server listening !!");
});
