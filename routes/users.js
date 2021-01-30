var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var session = require("express-session");
var bcypt = require("bcrypt");
var passport = require("passport");
var nodemailer = require("nodemailer");
var loginface = require("passport-facebook").Strategy;
var gmaillogin = require("passport-google-oauth").OAuth2Strategy;
var cookieParesr = require("cookie-parser");
var validator = require("email-validator");
var request = require("request");
var shortid = require("shortid");
var multer = require("multer");

require("dotenv").config();


const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY ;
var stripe = require('stripe')(stripeSecretKey);

var middleware = require("../middleware/middleware");
/* var upload = multer({dest : './public/upload'}); */
var upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => { // filFilter nó sẽ kiểm soát việc file nào nên tải lên và file nào không 
    if (!file.mimetype.match(/jpe|jpeg|png|gif$i/)) { // Nếu không đúng loại file ảnh thì sẽ không cho upload file và ngược lại 
      callback(new Error('File is not supported'), false)
      return
    }

    callback(null, true)
  },
  limits: {
    fileSize:  1024 * 1024 * 5,
  }
})

const { route } = require("./users");

var database = require("../mongo_model/mongo_model");
const { log } = require("debug");
router.use(cookieParesr());
router.use(bodyParser());
router.use(
  session({
    secret: "KhangNguyen",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);
router.use(passport.initialize());
router.use(passport.session());

/* GET home page. */

router.get("/", async (req, res) => {
  let login ="";
  let userid = "";
  if(req.session.userid)
  {
    login = 'yes';
    userid = req.session.userid;
  }
  if(req.isAuthenticated())
  {
    login = 'passport';
  }
  
  let page;
  let perpage = 12;
  if (!req.query.page) {
    page = 1;
  } else {
    page = parseInt(req.query.page);
  }
  let next = page + 1;
  let back = page - 1;
  if (req.query.page === 1) {
    back = 1;
  }
  if (req.query.page === 4) {
    next = 4;
  }
  if (!req.query.page) {
    next = 2;
    back = 1;
  }
  let start = (page - 1) * perpage;
  let end = start + perpage;
  if (!req.session.ghinho) {
    req.session.ghinho = [];
  }
  if (req.query.sorttype === "new") {
    database.profile.find({}, (err, data) => {
      res.render("../views/home.ejs", {
        profiles: data.reverse().slice(start, end),
        fullname: req.session.fullname,
        ghinho: req.session.ghinho,
        login: login,
        sorttype: "new",
        userid : userid,
        next: next,
        back: back,
      });
    });
  } else if (req.query.sorttype === "rate") {
    let data = await database.profile.find().sort({ avgrate: -1 });
    res.render("../views/home.ejs", {
      profiles: data.slice(start, end),
      fullname: req.session.fullname,
      ghinho: req.session.ghinho,
      userid : userid,
      login: login,
      sorttype: "rate",
      next: next,
      back: back,
    });
  } else {
    database.profile.find({}, (err, data) => {
      res.render("../views/home.ejs", {
        profiles: data.slice(start, end),
        fullname: req.session.fullname,
        ghinho: req.session.ghinho,
        login: login,
        userid : userid,
        sorttype: "",
        next: next,
        back: back,
      });
    });
  }
});

router.get("/register", (req, res) => {
  res.render("../views/register.ejs", {
    error: [],
    username: "",
    fullname: "",
  });
});

router.post("/register", async (req, res) => {
  let error = [];
  let { fullname, username, password, repassword } = req.body;
  var hashpass = await bcypt.hash(password, 10);
  if (!fullname ||!username || !password ) {
    error.push("Vui lòng không để trống các trường ");
  }
  if (validator.validate(username) === false) {
    error.push("Email không đúng định dạng");
    username = "";
  }
  if (password.length < 7) {
    error.push("Mật khẩu phải có nhiều hơn 6 ký tự");
  }
  if (password != repassword) {
    error.push("Mật khẩu xác nhận không khớp ");
  }
  if (error.length) {
    res.render("../views/register.ejs", {
      error: error,
      username: username,
      fullname: fullname,
    });
  } else {
    database.account.findOne({ username: username }, (err, dataf) => {
      if (dataf) {
        error.push("Username đã tồn tại");
        username = "";
        res.render("../views/register.ejs", {
          error: error,
          username: username,
          fullname: fullname,
        });
      } else {
        database.account.create(
          {
            username,
            password: hashpass,
            fullname,
            email: "",
            phone: "",
            birthday: "",
            address: "",
            image: "",
          },
          (err, datacr) => {
            if (err) {
              console.log(err);
            } else {
              let transports = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                tls: {
                  rejectUnauthorized: false,
                },
                auth: {
                  user: "namkhangnguyendang@gmail.com",
                  pass: "Babyboy_99",
                },
              });
              let optiongml = {
                from: "namkhangnguyendang@gmail.com",
                to: datacr.username,
                subject:
                  "Chúc mừng bạn đã đăng ký thành công website của chúng tôi",
                text:
                  "You recieved message from " + "namkhangnguyendang@gmail.com",
                html:
                  "<p>Chúc bạn một ngày tốt lành mọi thắc mắc hay phàn nàn về website của chúng tối xin liên hệ tới gmail này</p>",
              };
              transports.sendMail(optiongml, (err) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("đã gửi thư");
                }
              });
              res.redirect("/login");
            }
          }
        );
      }
    });
  }
});

router.get("/login", (req, res) => {
  res.render("../views/login.ejs", { error: [], username: "" });
});

router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  let error = [];
  database.account.findOne({ username: username }, (err, data) => {
    if (data) {
      bcypt.compare(password, data.password, (err, result) => {
        if (result === true) {
          res.cookie("userid", data._id);
          req.session.userid = data._id;
          req.session.fullname = data.fullname;
          res.redirect("/");
        } else {
          error.push("Tên đăng nhập hoặc mật khẩu không đúng");
          res.render("../views/login.ejs", {
            error: error,
            username: username,
          });
        }
      });
    } else {
      error.push("Tên đăng nhập hoặc mật khẩu không đúng");
      res.render("../views/login.ejs", { error: error, username: "" });
    }
  });
});

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    res.cookie("userid", req.user.id);
    req.session.userid = req.user.id;
    req.session.fullname = req.user.fullname;
    res.redirect("/");
  }
);
passport.use(
  new loginface(
    {
      clientID: "832137347356922",
      clientSecret: "4914d204ffb0b33c0e2130b9e42f2209",
      callbackURL: "http://localhost:3216/auth/facebook/callback",
      profileFields: ["email", "displayName"],
    },
    async (accessToken, refreshToken, profiles, done) => {
      let data = await database.accountface.findOne({ id: profiles.id });
      if (data) {
        done(null, data);
      } else {
        let datacr = await database.accountface.create({
          id: profiles.id,
          username: profiles._json.email,
          fullname: profiles.displayName,
          phone: "",
          address: "",
          gender: "",
          birthday: "",
          image: "",
        });
        done(null, datacr);
      }
    }
  )
);

router.get(
  "/auth/gmail",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth/gmail/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.cookie("userid", req.user.id);
    req.session.userid = req.user.id;
    req.session.fullname = req.user.fullname;
    res.redirect("/");
  }
);

passport.use(
  new gmaillogin(
    {
      clientID:
        "157905671856-uppk2beqdubvbmhpe9nk7msq2cfv00pf.apps.googleusercontent.com",
      clientSecret: "bVQ5BJydDCeWmpfojqjXSUSn",
      callbackURL: "http://localhost:3216/auth/gmail/callback",
    },
    async (accessToken, refreshToken, profiles, done) => {
      let data = await database.accountgmail.findOne({ id: profiles.id });
      if (data) {
        done(null, data);
      } else {
        let datacr = await database.accountgmail.create({
          id: profiles.id,
          username: profiles._json.email,
          fullname: profiles.displayName,
          phone: "",
          address: "",
          gender: "",
          birthday: "",
          image: "",
        });
        done(null, datacr);
        const transport = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          tls: {
            rejectUnauthorized: false,
          },
          auth: {
            user: "namkhangnguyendang@gmail.com",
            pass: "Babyboy_99",
          },
        });
        const optiongm = {
          from: "namkhangnguyendang@gmail.com",
          to: profile._json.email,
          subject:
            "Chúc mừng bạn đã đăng nhập thành công website của chúng tôi",
          text: "You recieved message from " + "namkhangnguyendang@gmail.com",
          html:
            "<p>Chúc bạn một ngày tốt lành mọi thắc mắc hay phàn nàn về website của chúng tối xin liên hệ tới gmail này</p>",
        };
        transport.sendMail(optiongm, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("đã gửi thư");
          }
        });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

router.get("/information", async (req, res) => {
  let login ="";
  if (req.session.userid) {
    if (req.isAuthenticated()) {
      login = "passport";
      let datafb = await database.accountface.findOne({
        id: req.session.userid,
      });
      if (datafb) {
        res.render("../views/informationcus.ejs", {
          profile: datafb,
          login: login,
          ghinho: req.session.ghinho,
          fullname: req.session.fullname,
        });
      } else {
        let datagm = await database.accountgmail.findOne({
          id: req.session.userid,
        });
        res.render("../views/informationcus.ejs", {
          profile: datagm,
          login: login,
          ghinho: req.session.ghinho,
          fullname: req.session.fullname,
        });
      }
    } else {
      login = "yes";
      let data = await database.account.findOne({ _id: req.session.userid });
      res.render("../views/informationcus.ejs", {
        profile: data,
        login: login,
        ghinho: req.session.ghinho,
        fullname: req.session.fullname,
      });
    }
  } else {
    res.redirect("/login");
  }
});

router.post("/information", upload.single("image"), async (req, res) => {
  if (req.session.userid) {
    let parseBase64 = req.file.buffer.toString('base64');
    let image = `data:image/jpg;base64,${parseBase64}`;     
    let {
      fullname,
      phone,
      gender,
      address,
      day,
      month,
      year,
    } = req.body;
    let birthday = `${day}/${month}/${year}`;
    let dataFb = await database.accountface.findOne({id : req.session.userid});
    let dataGm = await database.accountgmail.findOne({id : req.session.userid});
    if(dataFb)
    {
        await database.accountface.update({id : req.session.userid} , {fullname: fullname,phone: phone,gender: gender,address: address, birthday: birthday,  image: image});
    }
    else if(dataGm){
        await database.accountgmail.update({id : req.session.userid} , {fullname: fullname,phone: phone,gender: gender,address: address, birthday: birthday,  image: image});
    }
    else{
      await database.account.updateOne(
        { _id: req.session.userid },
        {
          fullname: fullname,
          phone: phone,
          gender: gender,
          address: address,
          birthday: birthday,
          image: image,
        }
      );
    }
    req.session.fullname = fullname ; //sau khi cập nhậ thành công thì cập nhật lại biến req.session
    await database.chat.update({IdCustomer : req.session.userid} , {CusName  : fullname , imageCus : image});
    res.redirect("/information");
  } else {
    res.redirect("/login");
  }
});

router.get("/chitiet", (req, res) => {
  let login ="";
  if(req.session.userid)
  {
    login = 'yes';
  }
  if(req.isAuthenticated())
  {
    login = 'passport';
  }
  if (!req.session.ghinho) {
    req.session.ghinho = [];
  }
  if (req.query.idprofile) {
    let idprofile = req.query.idprofile;
    database.profile.findOne({ _id: idprofile }, async (err, dataID) => {
      if(dataID){
        res.render("../views/chitiet.ejs", {
          profile: dataID,
          idcus : req.session.userid,
          ghinho: req.session.ghinho,
          fullname: req.session.fullname,
          login: login,
          notification : ""
        });
      }
      else{
         let dataIDres = await database.profile.findOne({Idrestaurant : idprofile}); // lọc theo id restaurant
         if(dataIDres)
         {
          res.render("../views/chitiet.ejs", {
            profile: dataIDres,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : ""
          });
         }
         else{
            res.redirect("/");
         }
      }
    });
  } else {
    res.redirect("/");
  }
});

router.post("/rate", async (req, res) => {
  let login ="";
  if(req.session.userid)
  {
    login = 'yes';
  }
  if(req.isAuthenticated())
  {
    login = 'passport';
  }
  let rate = parseInt(req.body.star);
  let idprofile = req.body.idprofile;
  let idRes = req.body.idres;
  let result;
  let totalRate;
  if (req.isAuthenticated() || req.session.userid) {
    let customerCheck = await database.infororder.findOne({
      IdCustomer: req.session.userid,
      Idrestaurant : idRes,
      Orderstatus: "Đã xác nhận",
    });
    if (customerCheck) {
      database.profile.findOne({ _id: idprofile }, async (err, data) => {
        if (rate === 5) {
          result = data.rate5 + 1;
          totalRate =
            result + data.rate4 + data.rate3 + data.rate2 + data.rate1;
          let avgrate =
            (result * 5 +
              data.rate4 * 4 +
              data.rate3 * 3 +
              data.rate2 * 2 +
              data.rate1 * 1) /
            totalRate;
          let tFavrate = avgrate.toFixed(1);
          await database.profile.update(
            { _id: idprofile },
            { rate5: result, avgrate: tFavrate, totalRate: totalRate }
          );
          let dataNew  = await database.profile.findOne({_id : idprofile}); // khi cập nhật xong thì lấy ra data mới
          res.render("../views/chitiet.ejs", {  
            profile: dataNew,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : "Bạn đã đánh giá thành công"   // trả lại thông báo thành công cho người dùng
          });
        } else if (rate === 4) {
          result = data.rate4 + 1;
          totalRate =
            data.rate5 + result + data.rate3 + data.rate2 + data.rate1;
          let avgrate =
            (data.rate5 * 5 +
              result * 4 +
              data.rate3 * 3 +
              data.rate2 * 2 +
              data.rate1 * 1) /
            totalRate;
          let tFavrate = avgrate.toFixed(1);
          await database.profile.update(
            { _id: idprofile },
            { rate4: result, avgrate: tFavrate, totalRate: totalRate }
          );
          let dataNew  = await database.profile.findOne({_id : idprofile});
          res.render("../views/chitiet.ejs", {
            profile: dataNew,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : "Bạn đã đánh giá thành công"
          });
        } else if (rate === 3) {
          result = data.rate3 + 1;
          totalRate =
            data.rate5 + data.rate4 + result + data.rate2 + data.rate1;
          let avgrate =
            (data.rate5 * 5 +
              data.rate4 * 4 +
              result * 3 +
              data.rate2 * 2 +
              data.rate1 * 1) /
            totalRate;
          let tFavrate = avgrate.toFixed(1);
          await database.profile.update(
            { _id: idprofile },
            { rate3: result, avgrate: tFavrate, totalRate: totalRate }
          );
          let dataNew  = await database.profile.findOne({_id : idprofile});
          res.render("../views/chitiet.ejs", {
            profile: dataNew,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : "Bạn đã đánh giá thành công"
          });
        } else if (rate === 2) {
          result = data.rate2 + 1;
          totalRate =
            data.rate5 + data.rate4 + data.rate3 + result + data.rate1;
          let avgrate =
            (data.rate5 * 5 +
              data.rate4 * 4 +
              data.rate3 * 3 +
              result * 2 +
              data.rate1 * 1) /
            totalRate;
          let tFavrate = avgrate.toFixed(1);
          await database.profile.update(
            { _id: idprofile },
            { rate2: result, avgrate: tFavrate, totalRate: totalRate }
          );
          let dataNew  = await database.profile.findOne({_id : idprofile});
          res.render("../views/chitiet.ejs", {
            profile: dataNew,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : "Bạn đã đánh giá thành công"
          });
        } else {
          result = data.rate1 + 1;
          totalRate =
            data.rate5 + data.rate4 + data.rate3 + data.rate2 + result;
          let avgrate =
            (data.rate5 * 5 +
              data.rate4 * 4 +
              data.rate3 * 3 +
              data.rate2 * 2 +
              result * 1) /
            totalRate;
          let tFavrate = avgrate.toFixed(1);
          await database.profile.update(
            { _id: idprofile },
            { rate1: result, avgrate: tFavrate, totalRate: totalRate }
          );
          let dataNew  = await database.profile.findOne({_id : idprofile});
          res.render("../views/chitiet.ejs", {
            profile: dataNew,
            idcus : req.session.userid,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            login: login,
            notification : "Bạn đã đánh giá thành công"
          });
        }
      });
    } else {
      let data = await database.profile.findOne({_id :idprofile});
      res.render("../views/chitiet.ejs", {
        profile: data,
        idcus : req.session.userid,
        ghinho: req.session.ghinho,
        fullname: req.session.fullname,
        login: login,
        notification : "Chỉ được đánh giá khi đã đặt nhà hàng" // khi không thành công thì trả lại thông báo
      });
    }
  } else {
    res.redirect("/login");
  }
});
router.get("/search", async (req, res) => {
  let login ="";
  if(req.session.userid)
  {
    login = 'yes';
  }
  if(req.isAuthenticated())
  {
    login = 'passport';
  }
  let dataSearch = [];
  let data = await database.profile.find();
  let query = req.query.q.toLowerCase();
  data.forEach((i)=>{
    if(i.Name.toLowerCase().indexOf(query) > -1 || i.Address.toLowerCase().indexOf(query) > -1 )
          dataSearch.push(i);
  })
  res.render("../views/home.ejs", {
    profiles: dataSearch,
    fullname: req.session.fullname,
    ghinho: req.session.ghinho,
    login: login,
    sorttype: "",
    next: "",
    back: "",
  });
});

router.post("/search" , async (req,res)=>{
  let query = req.body.query.toLowerCase();
  let data = await database.profile.find();
  let dataSearch = data.filter(i => i.Name.toLowerCase().indexOf(query) > -1 || i.Address.toLowerCase().indexOf(query) > -1)
  res.json(dataSearch);
})

router.post("/ghinho", async (req, res) => {
  let idprofile = req.body.idprofile;
  let temp = 0 ; //tạo biến đếm (nó sẽ tăng khi ghi nhớ của người dùng đã có );
  let data = await database.profile.findOne({_id : idprofile});

  if(!req.session.ghinho.length)
  {
    req.session.ghinho.push(data);  // nếu ghi nhớ rỗng thì push data vào
  }
  else{
    req.session.ghinho.forEach((i)=>{
      if(i._id == data._id)
      {
           temp ++;         // trùng sẽ tăng biến đếm
      }
    })
    if(temp === 0)
    {
      req.session.ghinho.push(data);    // nếu không trùng thì sẽ thêm vào session ghi nhớ không thì sẽ không thêm
    }
  }
  res.json(req.session.ghinho);
});
router.post("/removeone", (req, res) => {
  let index = parseInt(req.body.index);
  req.session.ghinho.splice(index, 1);
  res.json(req.session.ghinho);
});
router.post("/removeall", (req, res) => {
  req.session.ghinho = [];
  res.redirect("/");
});

router.get("/forgotpass", (req, res) => {
  res.render("../views/forgotpassuser.ejs", { error: [] });
});
router.post("/forgotpass", (req, res) => {
  let error = [];
  let email = req.body.email;
  database.account.findOne({ username: email }, (err, data) => {
    if (!data) {
      error.push("Không tìm thấy email bạn vừa nhập");
      res.render("../views/forgotpassuser.ejs", { error: error });
    } else {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: "namkhangnguyendang@gmail.com",
          pass: "Babyboy_99",
        },
      });
      const optionmailforgot = {
        from: "namkhangnguyendang@gmail.com",
        to: data.username,
        subject: "Forgot Password from Wedding Restaurant",
        text: "You recieved message from " + "namkhangnguyendang@gmail.com",
        html: `<p><a href="http://localhost:3216/successforgot?id=${data._id}">Đặt lại mật khẩu</a> </p>`,
      };
      transporter.sendMail(optionmailforgot, (err) => {
        if (err) {
          console.log(err);
        } else {
          error.push("Đã xác thực thành công.Hãy kiểm tra lại email của bạn")
          res.render("../views/forgotpassuser.ejs", { error: error });
        }
      });
    }
  });
});

router.get("/successforgot", (req, res) => {
  let id = req.query.id;
  database.account.findOne({ _id: id }, (err, data) => {
    if (data) {
      res.render("../views/changepassuser.ejs", { id: data._id , notification : [] });
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/changepassword" , (req,res)=>{   // dùng để chuyển hướng người dùng về lại trang /restaurant (tránh việc f5 trang post bị lỗi)
  res.redirect("/");
})

router.post("/changepassword", async (req, res) => {
  let id = req.body.id;
  let notification = [];
  let {password  ,repassword} = req.body;
  let hashpass = await bcypt.hash(password, 10);
  if(!password || !repassword)
  {
    notification.push("vUi lòng không để trống các trường");
  }
  if(password != repassword)
  {
    notification.push("2 mật khẩu vừa nhập không khớp");
  }
  if(notification.length)
  {
       res.render("../views/changepassuser.ejs", { id: id , notification : notification });
  }
  else{
    database.account.update({ _id: id }, { password: hashpass }, (err) => {
      if (err) {
        console.log(err);
      } else {
        notification.push("Bạn vừa đổi mật khẩu thành công");
        res.render("../views/changepassuser.ejs", { id: id , notification : notification });
      }
    });
  }  

});

router.get("/updatepass", (req, res) => {
  let login;
  if (req.session.userid && !req.isAuthenticated()) {
    login = 'yes';
    res.render("../views/updatepass.ejs", { error: [] , login : login ,fullname : req.session.fullname , ghinho : req.session.ghinho });
  } else {
    res.redirect("/");
  }
});

router.post("/updatepass", async (req, res) => {
  if (req.session.userid) {
    let { nowpassword, newpassword, repassword } = req.body;
    let error = [];
    if (!nowpassword || !newpassword ) {
      error.push("Vui lòng không để trống các cột");
    }
    if (newpassword.length < 7 ) {
      error.push("Mật khẩu phải có độ dài trên 6 ký tự");
    }
    if (repassword != newpassword) {
      error.push("Mật khẩu nhập lại không trùng khớp");
    }
    if (error.length) {
      res.render("../views/updatepass.ejs", { error: error ,login : 'yes' ,fullname : req.session.fullname , ghinho : req.session.ghinho });
    }
    else{
    let data = await database.account.findOne({ _id: req.session.userid });
    bcypt.compare(nowpassword, data.password, async (err, result) => {
      if (result === true) {
        let hashnewpass = await bcypt.hash(newpassword, 10);
        await database.account.update(
          { _id: req.session.userid },
          { password: hashnewpass }
        );
        error.push("Bạn đã đổi mật khẩu thành công");
        res.render("../views/updatepass.ejs", { error: error, login : 'yes' ,fullname : req.session.fullname , ghinho : req.session.ghinho });
      } else {
        error.push("Mật khẩu hiện tại không đúng");
        res.render("../views/updatepass.ejs", { error: error, login : 'yes' ,fullname : req.session.fullname , ghinho : req.session.ghinho });
      }
    });
  }
  } else {
    res.redirect("/");
  }
});

router.get("/myorder", (req, res) => {
  let login = "" ;
  if (req.isAuthenticated() || req.session.userid) {
    if(req.isAuthenticated()){
      login = 'passport';
    }
    else{
      login = 'yes';
    }

    database.infororder.find(
      { IdCustomer: req.session.userid },
      (err, data) => {
        res.render("../views/myorder.ejs", {
          infor: data,
          ghinho: req.session.ghinho,
          fullname: req.session.fullname,
          login: login,
          stripePublicKey : stripePublicKey
        });
      }
    );
  } else {
    res.redirect("/login");
  }
});


router.post("/payment" , (req,res)=>{
  stripe.charges.create({
    amount: req.body.price,
    currency: 'usd',
    description : 'giao dich de qua',
    source: req.body.stripeTokenId
 
  }).then(function() {
    console.log('Charge Successful')
    res.json({ message: 'Bạn vừa thanh toán thành công <3' })
  }).catch(function() {
    console.log('Charge Fail')
    res.status(500).end()
  })
})

router.get("/createorder", async (req, res) => {
  let login ="";
  if (req.session.userid && req.query.idprofile) {
      login = 'yes';
      let dataCus;
      if(req.isAuthenticated()){
        login = 'passport';
      }
      let dataCusFb = await database.accountface.findOne({id : req.session.userid});
      let dataCusGm = await database.accountgmail.findOne({id : req.session.userid});
      if(dataCusFb)
      {
        dataCus = dataCusFb;
      }
      else if(dataCusGm)
      {
        dataCus = dataCusGm;
      }
      else{
        dataCus = await database.account.findOne({_id : req.session.userid});
      }
      let Division = req.query.Division;
      let dataVc = await database.voucher.findOne({
        IdCustomer: req.session.userid,
      });
      if (dataVc) {
        database.profile.findOne({ _id: req.query.idprofile }, (err, dataf) => {
          res.render("../views/createorder.ejs", {
            error: [],
            profile: dataf,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            dataCus : dataCus,
            idvoucher: dataVc._id,
            voucher: dataVc.VoucherCode,
            Division: Division,
            reduction: dataVc.Reduction,
            login: login,
          });
        });
      } else {
        let voucher = shortid.generate();
        let reduction = 10;   //parseInt(Math.random() * 5 + 5);
        let date = new Date();
        let getmonth = parseInt(date.getMonth()) + 1;
        let monthend = parseInt(getmonth) + 1;
        let yearend = parseInt(date.getFullYear());
        if (monthend > 12) {
          monthend = 1;
          yearend = yearend + 1;
        }
        let timenow = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${getmonth}/${date.getFullYear()}`;
        let timeend = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${monthend}/${yearend}`;
        let datacr = await database.voucher.create({
          IdCustomer: req.session.userid,
          VoucherCode: voucher,
          Reduction: reduction,
          TimeStart: timenow,
          TimeEnd: timeend,
          StatusVoucher: "Chưa sử dụng",
        });
        database.profile.findOne({ _id: req.query.idprofile }, (err, data) => {
          res.render("../views/createorder.ejs", {
            error: [],
            profile: data,
            ghinho: req.session.ghinho,
            fullname: req.session.fullname,
            dataCus : dataCus,
            idvoucher: datacr._id,
            Division: Division,
            voucher: datacr.VoucherCode,
            reduction: datacr.Reduction,
            login: login,
          });
        });
      }
    } 
  else {
    res.redirect("/login");
  }
});

router.post("/createorder", async (req, res) => {
      let dataCus;
      let login = '';
      if(req.isAuthenticated()){
        login = 'passport';
      }
      let dataCusFb = await database.accountface.findOne({id : req.session.userid});
      let dataCusGm = await database.accountgmail.findOne({id : req.session.userid});
      if(dataCusFb)
      {
        dataCus = dataCusFb;
      }
      else if(dataCusGm)
      {
        dataCus = dataCusGm;
      }
      else{
        login = 'yes';
        dataCus = await database.account.findOne({_id : req.session.userid});
      }
  let error = [];
  let date = new Date();
  let getmonth = parseInt(date.getMonth()) + 1;
  let timenow = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${getmonth}/${date.getFullYear()}`;
  let {
    Idprofile,
    CustomerName,
    CustomerEmail,
    CustomerAddress,
    CustomerPhone,
    Idvoucher,
    VoucherCode,
    Redution,
    Note,
    Idrestaurant,
    Division,
    NameRestaurant,
    RestaurantAddress,
    PriceTotal,
    PricePay,
  } = req.body;
  let data = await database.profile.findOne({ _id: Idprofile });
  let CustomerPrice = parseInt(req.body.CustomerPrice);
  let CustomerCapacity = parseInt(req.body.CustomerCapacity);
  let PriceMin = parseInt(req.body.PriceMin);
  let PriceMax = parseInt(req.body.PriceMax);
  let Capacity = parseInt(req.body.Capacity);
  if (
    !CustomerName ||
    !CustomerEmail ||
    !CustomerAddress ||
    !CustomerPhone ||
    !CustomerPrice ||
    !CustomerCapacity
  ) {
    error.push("Vui lòng không để trộng cột *");
  }
  if(CustomerPhone.length > 11 || CustomerPhone.length < 10){
    error.push("Vui lòng kiểm tra lại cột số điện thoại");
  }
  if (CustomerPrice > PriceMax || CustomerPrice < PriceMin) {
    error.push("Vui lòng kiểm tra lại giá suất của nhà hàng");
  }
  if (CustomerCapacity > Capacity) {
    error.push("Vui lòng kiểm tra lại sức chứa của nhà hàng");
  }
  /*Hiển thị thông báo cho người dùng nhập lại và giữ nguyên thông tin nhà hàng và voucher đã tạo*/
  if (error.length) {
    res.render("../views/createorder.ejs", {
      error: error,
      fullname: req.session.fullname,
      profile: data,
      login: login,
      ghinho: req.session.ghinho,
      idvoucher: Idvoucher,
      Division: Division,
      voucher: VoucherCode,
      reduction: Redution,
      dataCus : dataCus
    });
  } else {
    database.infororder.create(
      {
        CustomerName,
        CustomerEmail,
        CustomerAddress,
        CustomerPhone,
        CustomerPrice,
        CustomerCapacity,
        Idvoucher,
        VoucherCode,
        Redution,
        Note,
        Idrestaurant,
        IdCustomer: req.session.userid,
        NameRestaurant,
        Division,
        RestaurantAddress,
        PriceTotal,
        PricePay,
        Orderstatus: "Chờ xác nhận",
        Timeorder: timenow,
      },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/myorder");
        }
      }
    );
  }
});

router.get("/chatonline", async (req, res) => {
  let login = "";
  if (req.session.userid) {
    login = "yes";
    if(req.isAuthenticated()){
      login = 'passport';
    }
  
    let idcus = req.query.idcus;
    let idres = req.query.idres;
    let datares = await database.accountRes.findOne({_id : idres});
    let data = await database.chat.findOne({IdCustomer : idcus , IdRestaurant : idres});
      res.render("../views/chat.ejs", {
        chat: data,
        idres : idres ,
        resinformation : datares,
        ghinho: req.session.ghinho,
        userID: req.session.userid,
        fullname: req.session.fullname,
        login: login,
      });
    }
   else{
  res.redirect("/");
}
    
});

router.get("/listchat" , async (req,res) =>{
  let login = "";
  let dataCus ;
  if(req.session.userid)
  {
      login = 'yes';
      if(req.isAuthenticated()){
        login = 'passport';
      }
      let dataFace = await database.accountface.findOne({id : req.session.userid});
      let dataGmail = await database.accountgmail.findOne({id :  req.session.userid});
      if(dataFace)
      {
        dataCus = dataFace;
      }
      else if(dataGmail){
        dataCus = dataGmail;
      }
      else{
        dataCus = await database.account.findOne({_id : req.session.userid});
      }
      let data  = await database.chat.find({IdCustomer : req.session.userid});
    res.render("../views/listchatforcus.ejs" , { login : login , fullname : req.session.fullname ,dataCus : dataCus, ghinho : req.session.ghinho , listchat : data});
  }
  else{
    res.redirect("/login");
  }
})

router.get("/policy",middleware.notImportant, (req, res) => {
  
  res.render("../views/policy.ejs" , {fullname : req.session.fullname , login : res.locals.login, ghinho : req.session.ghinho});
});

router.get("/news",middleware.notImportant, async (req, res) => {
  if(!req.session.ghinho)
  {
    req.session.ghinho = [];
  }

  let topNew =  (await database.profile.find()).reverse().slice(0,5);
  let topFive =  (await database.profile.find().sort({avgrate : -1})).slice(0,5);
  let dataTD = await database.news.find({type : "Tuyển dụng"});
  let dataNH = await database.news.find({type : "Tin nhà hàng"});

  res.render("../views/news.ejs", {
    login: res.locals.login,
    ghinho: req.session.ghinho,
    fullname: req.session.fullname,
    dataTD : dataTD ,
    dataNH : dataNH,
    topFive : topFive,
    topNew : topNew
  });
});

router.get("/chatbot" , (req,res)=>{
  res.render("../views/chatbot.ejs");
})

router.get("/logout", async (req, res) => {
  res.clearCookie("userid");
  req.logout();
  await req.session.destroy();
  res.redirect("/");
});

/* router.get("/test" , async (req,res)=>{
  let idprofile = "5f3cb459db4aac2e7c352531";
  let data = await database.profile.findOne({_id : idprofile});
  res.json(data);
})

router.post("/test" , async (req,res)=>{
  let idprofile = req.body.idprofile;
  let data = await database.profile.findOne({_id : idprofile});
  res.json(data);
}) */

router.get("/test" , async (req,res)=>{
  let id = req.query.idprofile;
  let data = await database.profile.findOne({_id  : id});
  res.json(data);
})


module.exports = router;
