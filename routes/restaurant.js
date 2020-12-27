var express = require("express");
var router = express.Router();
var passport = require("passport");
var bcypt = require("bcrypt");
var validator = require("email-validator");
var nodemailer = require("nodemailer");
var multer = require("multer");
var { log } = require("debug");

var db = require("../mongo_model/mongo_model");
var upload = multer({ dest: "./public/upload" });

/* GET users listing. */
router.get("/", async function (req, res) {
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
  if (req.session.resid) {
    if (req.query.sorttype === "new") {
      db.profile.find({}, (err, data) => {
        res.render("../views/homeres.ejs", {
          profiles: data.reverse().slice(start, end),
          fullname: req.session.fullname,
          sorttype: "new",
          next: next,
          back: back,
        });
      });
    } else if (req.query.sorttype === "rate") {
      let data = await db.profile.find().sort({ avgrate: -1 });
      res.render("../views/homeres.ejs", {
        profiles: data.slice(start, end),
        fullname: req.session.fullname,
        sorttype: "rate",
        next: next,
        back: back,
      });
    } else {
      db.profile.find({}, (err, data) => {
        res.render("../views/homeres.ejs", {
          profiles: data.slice(start, end),
          fullname: req.session.fullname,
          sorttype: "",
          next: next,
          back: back,
        });
      });
    }
  } else {
    res.render("../views/loginforres.ejs", { error: [], username: "" });
  }
});

router.get("/registerforres", (req, res) => {
  res.render("../views/registerforres.ejs", {
    error: [],
    username: "",
    fullname: "",
    phone: "",
  });
});
router.post("/registerforres", async (req, res) => {
  let error = [];
  let { username, password, repassword, fullname, phone } = req.body;
  let hash = await bcypt.hash(password, 10);
  let parsePhone = parseInt(phone);
  if (!fullname ||!phone || !username || !password ) {
    error.push("Vui lòng không để trống các trường");
  }
  if (password.length < 7) {
    error.push("Mật khẩu phải có nhiều hơn 6 ký tự");
  }
  if (phone.length < 10 || phone.length > 21 || isNaN(parsePhone)) {
    error.push("Số điện thoại không đúng");
    phone = "";
  }
  if (validator.validate(username) === false) {
    error.push("Email không đúng định dạng");
    username = "";
  }
  if (password != repassword) {
    error.push("Mật khẩu xác nhận không khớp ");
  }
  if (error.length) {
    res.render("../views/registerforres.ejs", {
      error: error,
      username: username,
      fullname: fullname,
      phone: phone,
    });
  } else {
    db.accountRes.findOne({ username: username }, (err, data) => {
      if (data) {
        error.push("Username đã tồn tại ");
        username = "";
        res.render("../views/registerforres.ejs", {
          error: error,
          username: username,
          fullname: fullname,
          phone: phone,
        });
      } else {
        db.accountRes.create(
          { username, password: hash, phone, fullname , status : "Waiting" },
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              error.push("Bạn đã đăng ký thành công.Xin vui lòng đợi bên admin xác nhận (hãy kiểm tra mail thường xuyên nhé :)");
              res.render("../views/registerforres.ejs", {
                error: error,
                username: username,
                fullname: fullname,
                phone: phone,
              });
            }
          }
        );
      }
    });
  }
});
router.post("/", async (req, res) => {
  let { username, password } = req.body;
  let error = [];
  db.accountRes.findOne({ username: username , status : "Confirm" }, (err, data) => {
    if (data) {
      bcypt.compare(password, data.password, (err, result) => {
        if (result === true) {
          req.session.resid = data._id;
          res.cookie("resid", data._id);
          req.session.fullname = data.fullname;
          res.redirect("/restaurant");
        } else {
          error.push("Mật khẩu không đúng");
          res.render("../views/loginforres.ejs", {
            error: error,
            username: username,
          });
        }      });
    } else {
      error.push("Tên đăng nhập hoặc tài khoản của bạn đang chờ xác nhận");
      username = "";
      res.render("../views/loginforres.ejs", {
        error: error,
        username: username,
      });
    }
  });
});

router.get("/checkinfor" , async (req,res)=>{ 
      if(req.session.resid && req.query.idcus){
          let idcus = req.query.idcus; 
          let dataFb = await db.accountface.findOne({id : idcus});
          let dataGm = await db.accountgmail.findOne({id : idcus});
          if(dataFb){
            res.render("../views/checkinforcus.ejs" , { fullname : dataFb.fullname, profile : dataFb});
          }
          else if(dataGm){
            res.render("../views/checkinforcus.ejs" , { fullname : dataGm.fullname , profile : dataGm});
          }
          else{
            let data = await db.account.findOne({_id : idcus});
            if(data)
            {
              res.render("../views/checkinforcus.ejs" , { fullname : data.fullname , profile : data});
            }
            else{
              res.redirect("/restaurant");
            }
           
          }  
      }
      else{
        res.redirect("/restaurant");
      }     
})

router.get("/chitiet", (req, res) => {
  if (req.session.resid) {
    if (req.query.idprofile) {
      var idprofile = req.query.idprofile;
      db.profile.findOne({ _id: idprofile }, (err, data) => {
        res.render("../views/chitietforres.ejs", { profile: data ,fullname : req.session.fullname , notification : ""});
      });
    } else {
      res.redirect("/restaurant");
    }
  } else {
    res.redirect("/restaurant");
  }
});

router.get("/search", (req, res) => {
  if (req.session.resid) {
    let query = req.query.q.toLowerCase();
    let result = [];
    db.profile.find({}, (err, data) => {
      data.forEach((i) => {
        if (
          i.Name.toLowerCase().indexOf(query) > -1 ||
          i.Address.toLowerCase().indexOf(query) > -1
        ) {
          result.push(i);
        }
      });
      res.render("../views/homeres.ejs", {
        profiles: result,
        fullname: req.session.fullname,
        sorttype: "",
        next: "",
        back: "",
      });
    });
  } else {
    res.redirect("/restaurant");
  }
});

router.get("/forgotpass", (req, res) => {
  res.render("../views/forgotpassres.ejs", { error: [] });
});
router.post("/forgotpass", (req, res) => {
  let error = [];
  let email = req.body.email;
  db.accountRes.findOne({ username: email }, (err, data) => {
    if (!data) {
      error.push("Không tìm thấy email bạn vừa nhập");
      res.render("../views/forgotpassres.ejs", { error: error });
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
        html: `<p><a href="http://localhost:3216/restaurant/successforgot?id=${data._id}">Xác nhận quên mật khẩu </a> </p>`,
      };
      transporter.sendMail(optionmailforgot, (err) => {
        if (err) {
          console.log(err);
        } else {
          error.push("Đã xác thực thành công.Hãy kiểm tra lại email của bạn");
          res.render("../views/forgotpassres.ejs", { error: error });
        }
      });
    }
  });
});
router.get("/successforgot", (req, res) => {
  let id = req.query.id;
  db.accountRes.findOne({ _id: id }, (err, data) => {
    if (data) {
      res.render("../views/changepassres.ejs", { id: data._id , notification : [] });
    } else {
      res.redirect("/restaurant");
    }
  });
});

router.get("/changepassword" , (req,res)=>{   // dùng để chuyển hướng người dùng về lại trang /restaurant (tránh việc f5 trang post bị lỗi)
  res.redirect("/restaurant");
})

router.post("/changepassword", async (req, res) => {
  let id = req.body.id;
  let notification = [];
  let {password, repassword} = req.body;

  let hashpass = await bcypt.hash(password, 10);
  if(!password || !repassword)
  {
    notification.push("Vui lòng không để trống các trường");
  }
  if(password != repassword)
  {
    notification.push("Hai mật khẩu bạn vừa nhập không khớp");
  }
  if(notification.length)
  {
    res.render("../views/changepassres.ejs", { id: id , notification :notification });
  }
  else{
    db.accountRes.update({ _id: id }, { password: hashpass }, (err) => {
      if (err) {
        console.log(err);
      } else {
        notification.push("Bạn vừa đổi mật khẩu thành công");
        res.render("../views/changepassres.ejs", { id: id , notification : notification });
      }
    });
  }

});

router.get("/updatepass", (req, res) => {
  if (req.session.resid) {
    res.render("../views/updatepassforres.ejs", { error: [] , fullname : req.session.fullname });
  } else {
    res.redirect("/restaurant");
  }
});

router.post("/updatepass", async (req, res) => {
  if (req.session.resid) {
    let { nowpassword, newpassword, repassword } = req.body;
    let error = [];
    if (!nowpassword || !newpassword ) {
      error.push("Vui lòng không để trống các trường");
    }
    if (repassword != newpassword) {
      error.push("Mật khẩu nhập lại không trùng khớp");
    }
    if (error.length) {
      res.render("../views/updatepassforres.ejs", { error: error ,fullname : req.session.fullname});
    }
    else{
    let data = await db.accountRes.findOne({ _id: req.session.resid });
    bcypt.compare(nowpassword, data.password, async (err, result) => {
      if (result === true) {
        let hashnewpass = await bcypt.hash(newpassword, 10);
        await db.accountRes.update(
          { _id: req.session.resid },
          { password: hashnewpass }
        );
        error.push("Bạn đã đổi mật khẩu thành công");
        res.render("../views/updatepassforres.ejs", { error: error , fullname : req.session.fullname});
      } else {
        error.push("Mật khẩu hiện tại không đúng");
        res.render("../views/updatepassforres.ejs", { error: error , fullname : req.session.fullname});
      }
    });
  }
 } else {
    res.redirect("/restaurant");
  }
});

router.get("/updatepost", (req, res) => {
  if (req.session.resid) {
    db.profile.findOne({ Idrestaurant: req.session.resid }, (err, data) => {
      res.render("../views/updatepost.ejs", {
        profile: data,
        fullname: req.session.fullname,
        error : []
      });
    });
  } else {
    res.redirect("/restaurant");
  }
});

router.post("/updatepost", upload.array("image"), async (req, res) => {
  let data = await db.profile.findOne({Idrestaurant : req.session.resid});
  let error = [];
  let { Name, Address, TimeFree, Description, hotline } = req.body;
  let PriceMin = parseInt(req.body.PriceMin);
  let PriceMax = parseInt(req.body.PriceMax);
  let Capacity = parseInt(req.body.Capacity);
  let PriceMinB = parseInt(req.body.PriceMinB);
  let PriceMaxB = parseInt(req.body.PriceMaxB);
  let CapacityB = parseInt(req.body.CapacityB);
  let parsePhone = parseInt(hotline);
  let Image;
  let Image1;
  let Image2;
  let Image3;
  let Image4;
  let Image5;
  if (!req.files.length) {
    Image = "";
    Image1 = "";
    Image2 = "";
    Image3 = "";
    Image4 = "";
    Image5 = "";
  } else if (req.files.length === 1) {
    Image = req.files[0].path.substring(6);
  } else if (req.files.length === 2) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
  } else if (req.files.length === 3) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
  } else if (req.files.length === 4) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
  } else if (req.files.length === 5) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
    Image4 = req.files[4].path.substring(6);
  } else {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
    Image4 = req.files[4].path.substring(6);
    Image5 = req.files[5].path.substring(6);
  }
  if(!Name || !Address || !TimeFree || !Description || !hotline ||  !PriceMin  ||  !PriceMax ||  !Capacity ) 
  {
    error.push("Vui lòng không để trống các trường")
  } 
  if(isNaN(PriceMin) || isNaN(PriceMax) || isNaN(Capacity) || isNaN(PriceMinB) || isNaN(PriceMaxB) || isNaN(CapacityB))
  {
    error.push("Cột đơn giá không đúng định dạng")
  }
  if(isNaN(parsePhone)){
    error.push("Cột điện thoại không đúng định dạng")
  }
  if(error.length)
  {
      res.render("../views/updatepost.ejs" , {profile : data , fullname : req.session.fullname , error : error});
  }
  else{
    await db.profile.update(
      { Idrestaurant: req.session.resid },
      {
        Name,
        PriceMin,
        PriceMax,
        Capacity,
        PriceMinB,
        PriceMaxB,
        CapacityB,
        Address,
        TimeFree,
        Description,
        hotline,
        Image,
        Image1,
        Image2,
        Image3,
        Image4,
        Image5,
      }
    );
    await db.chat.update({IdRestaurant : req.session.resid} , {imageRes : Image});
  }

  res.redirect("/restaurant/updatepost");
});

router.post("/removepost", async (req, res) => {
  await db.profile.remove({ Idrestaurant: req.session.resid });
  res.redirect("/restaurant");
});

router.get("/post", (req, res) => {
  if (req.session.resid) {
    db.profile.find({ Idrestaurant: req.session.resid }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render("../views/post.ejs", {
          profile: data,
          fullname: req.session.fullname,
          error : []
        });
      }
    });
  } else {
    res.redirect("/restaurant");
  }
});

router.post("/post", upload.array("image"), async (req, res) => {
  let data = await db.profile.find({Idrestaurant : req.session.resid});
  let { Name, Address, TimeFree, Description, hotline } = req.body;
  let PriceMin = parseInt(req.body.PriceMin);
  let PriceMax = parseInt(req.body.PriceMax);
  let Capacity = parseInt(req.body.Capacity);
  let PriceMinB = parseInt(req.body.PriceMinB);
  let PriceMaxB = parseInt(req.body.PriceMaxB);
  let CapacityB = parseInt(req.body.CapacityB);
  let parsePhone = parseInt(hotline);
  let error = [];
  let Image;
  let Image1;
  let Image2;
  let Image3;
  let Image4;
  let Image5;
  if (!req.files.length) {
    Image = "";
    Image1 = "";
    Image2 = "";
    Image3 = "";
    Image4 = "";
    Image5 = "";
  } else if (req.files.length === 1) {
    Image = req.files[0].path.substring(6);
  } else if (req.files.length === 2) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
  } else if (req.files.length === 3) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
  } else if (req.files.length === 4) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
  } else if (req.files.length === 5) {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
    Image4 = req.files[4].path.substring(6);
  } else {
    Image = req.files[0].path.substring(6);
    Image1 = req.files[1].path.substring(6);
    Image2 = req.files[2].path.substring(6);
    Image3 = req.files[3].path.substring(6);
    Image4 = req.files[4].path.substring(6);
    Image5 = req.files[5].path.substring(6);
  }
  if(!Name || !Address || !TimeFree || !Description || !hotline ||  !PriceMin  ||  !PriceMax ||  !Capacity) 
  {
    error.push("Vui lòng không để trống các trường");
  } 
  if(isNaN(PriceMin) || isNaN(PriceMax) || isNaN(Capacity) || isNaN(PriceMinB) || isNaN(PriceMaxB) || isNaN(CapacityB))
  {
    error.push("Cột đơn giá hoặc sức chứa không đúng định dạng");
  }
  if(isNaN(parsePhone)){
    error.push("Cột số điện thoại không đúng định dạng");
  }
  if(hotline.length < 10 || hotline.length > 21 ){
    error.push("Độ dài số điện thoại không hợp lệ");
  }
  if(error.length)
  {
      res.render("../views/post.ejs" , {profile : data , fullname : req.session.fullname , error : error});
  }
  else{
    db.profile.create(
      {
        Name,
        Idrestaurant: req.session.resid,
        PriceMin,
        PriceMax,
        Capacity,
        PriceMinB,
        PriceMaxB,
        CapacityB,
        Address,
        TimeFree,
        Description,
        hotline,
        Image,
        Image1,
        Image2,
        Image3,
        Image4,
        Image5,
        rate1: 0,
        rate2: 0,
        rate3: 0,
        rate4: 0,
        rate5: 0,
        avgrate : 0.0,
        totalRate : 0,
      },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          res.redirect(`/restaurant?sorttype=new`);
        }
      }
    );
  }
 
});

router.get("/myorder", (req, res) => {
  if (req.session.resid) {
    db.infororder.find({ Idrestaurant: req.session.resid }, (err, data) => {
      res.render("../views/myorderforres.ejs", {
        infor: data,
        fullname: req.session.fullname,
      });
    });
  } else {
    res.redirect("/restaurant");
  }
});

router.post("/acceptorder", async (req, res) => {
  let idorder = req.body.idorder;
  let customerEmail = req.body.customeremail;
  let idvoucher = req.body.idvoucher;
  await db.voucher.update({ _id: idvoucher }, { StatusVoucher: "Đã sử dụng" });
  db.infororder.update(
    { _id: idorder },
    { Orderstatus: "Đã xác nhận" },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        const transporterss = nodemailer.createTransport({
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
        const optionmaillaccess = {
          from: "namkhangnguyendang@gmail.com",
          to: customerEmail,
          subject: "Đơn hàng của bạn đã được xác nhận",
          text: "You recieved message from " + "namkhangnguyendang@gmail.com",
          html: `<p> <a href="http://localhost:3216/">Hãy kiểm tra lại đơn hàng trên hệ thống của chúng tôi </a> </p>`,
        };
        transporterss.sendMail(optionmaillaccess, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("đã gửi thư");
            res.redirect("/restaurant/myorder");
          }
        });
      }
    }
  );
});

router.post("/removeorder", (req, res) => {
  let idorder = req.body.idorder;
  db.infororder.update(
    { _id: idorder },
    { Orderstatus: "Đơn hàng đã bị hủy" },
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/restaurant/myorder");
      }
    }
  );
});

router.get("/listchat" ,async (req,res)=>{
  if(req.session.resid)
  {
    let dataRes = await db.profile.findOne({Idrestaurant : req.session.resid});
    let data  = await db.chat.find({IdRestaurant : req.session.resid});
    res.render("../views/listchatforres.ejs" , {fullname : req.session.fullname , dataRes : dataRes ,listchat : data});
  }
  else{
    res.redirect("/restaurant");
  }
})

router.get("/chatonline", async (req, res) => {
  if (req.session.resid) {
    let dataCus;
    let idcus = req.query.idcus;
    let idres = req.query.idres;
    let data = await db.chat.findOne({IdCustomer : idcus , IdRestaurant : idres});
    let dataCusFb = await db.accountface.findOne({id :  req.query.idcus});
    let dataCusGm = await db.accountgmail.findOne({id :  req.query.idcus});
      if(dataCusFb)
      {
        dataCus = dataCusFb;
      }
      else if(dataCusGm)
      {
        dataCus = dataCusGm;
      }
      else{
        
        dataCus = await db.account.findOne({_id :  req.query.idcus});
      }
    res.render("../views/chatforres.ejs", {
      chat: data,
      idcus : idcus,
      cusinformation : dataCus,
      fullname: req.session.fullname,
      userID: req.session.resid,
    });
  } else {
    res.redirect("/restaurant");
  }
});
router.get("/policy" , (req,res)=>{
  if(req.session.resid){
    res.render("../views/policyforres.ejs" , {fullname : req.session.fullname});
  }
  else{
    res.redirect("/restaurant");
  }

})

router.get("/news" , async (req,res)=>{
  if(req.session.resid)
  {
    let topNew =  (await db.profile.find()).reverse().slice(0,5);
    let topFive =  (await db.profile.find().sort({avgrate : -1})).slice(0,5);
    let dataTD = await db.news.find({type : "Tuyển dụng"});
    let dataNH = await db.news.find({type : "Tin nhà hàng"});
    res.render("../views/newsforres.ejs" , {fullname : req.session.fullname ,  dataTD : dataTD ,  dataNH : dataNH , topFive :topFive , topNew : topNew});
  }
  else{
    res.redirect("/restaurant");
  }

})

router.get("/logout", async (req, res) => {
  res.clearCookie("resid");
  await req.session.destroy();
  res.redirect("/restaurant");
});
module.exports = router;
