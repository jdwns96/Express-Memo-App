const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: true, // 세션에 저장 여부
        // passReqToCallback: false,
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          console.log(email, password, done);
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              console.log("비밀번호 불일치");
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            console.log("가입되지 않은 회원");
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
