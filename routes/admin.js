var express = require("express");
var router = express.Router();
var bcypt = require("bcrypt");
var nodemailer = require("nodemailer");
var multer = require("multer");
var validator = require("email-validator");
const { log } = require("debug");

var database = require("../mongo_model/mongo_model");
var upload = multer({ dest: "./public/upload" });

router.get("/", async (req, res) => {
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
  if (req.session.adminid) {
    if (req.query.sorttype === "new") {
      database.profile.find({}, (err, data) => {
        res.render("../views/homeadmin.ejs", {
          profiles: data.reverse().slice(start, end),
          sorttype: "new",
          page: page,
          next: next,
          back: back,
        });
      });
    } else if (req.query.sorttype === "rate") {
      let data = await database.profile.find().sort({ avgrate: -1 });
      res.render("../views/homeadmin.ejs", {
        profiles: data.slice(start, end),
        ghinho: req.session.ghinho,
        sorttype: "rate",
        page: page,
        next: next,
        back: back,
      });
    } else {
      database.profile.find({}, (err, data) => {
        res.render("../views/homeadmin.ejs", {
          profiles: data.slice(start, end),
          ghinho: req.session.ghinho,
          sorttype: "",
          page: page,
          next: next,
          back: back,
        });
      });
    }
  } else {
    res.render("../views/loginadmin.ejs", { error: [], username: "" });
  }
});

router.post("/", async (req, res) => {
  let { username, password } = req.body;
  let error = [];
  database.accountad.findOne({ username: username }, (err, dataf) => {
    if (dataf) {
      bcypt.compare(password, dataf.password, (err, result) => {
        if (result === true) {
          res.cookie("adminid", dataf._id, { signed: true });
          req.session.adminid = dataf._id;
          res.redirect("/admin");
        } else {
          error.push("Tên đăng nhập hoặc mật khẩu không đúng");
          res.render("../views/loginadmin.ejs", {
            error: error,
            username: username,
          });
        }
      });
    } else {
      error.push("Tên đăng nhập hoặc mật khẩu không đúng");
      username = "";
      res.render("../views/loginadmin.ejs", {
        error: error,
        username: username,
      });
    }
  });
});

router.get("/acceptres", async (req, res) => {
  if (req.session.adminid) {
    let data = await database.accountRes.find({status : "Waiting"});
    res.render("../views/acceptres.ejs", { data: data });
  } else {
    res.redirect("/restaurant");
  }
});

router.post("/acceptres", async (req, res) => {
  let idacceptres = req.body.idacceptres;
  await database.accountRes.updateOne({_id : idacceptres} , {status : "Confirm"});
  let dataccept = await database.accountRes.findOne({
    _id: idacceptres,
  });

  let transporter = nodemailer.createTransport({
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
  let optionmail = {
    from: "namkhangnguyendang@gmail.com",
    to: dataccept.username,
    subject: "Xác nhận đăng ký thành công",
    text: "You recieved message from " + "namkhangnguyendang@gmail.com",
    html:
      "<p>Chúc bạn một ngày tốt lành mọi thắc mắc hay phàn nàn về website của chúng tối xin liên hệ tới gmail này</p>",
  };
  await transporter.sendMail(optionmail);
  res.redirect("/admin/acceptres");
});

router.post("/remove-reswaiting", async (req, res) => {
  let id = req.body.idacceptres;
  await database.accountRes.remove({ _id: id });
  res.redirect("/admin/acceptres");
});

router.get("/updatepass", (req, res) => {
  if (req.session.adminid) {
    res.render("../views/updatepassforad.ejs", { error: [] });
  } else {
    res.redirect("/admin");
  }
});

router.post("/updatepass", async (req, res) => {
  if (req.session.adminid) {
    let { nowpassword, newpassword, repassword } = req.body;
    let error = [];
    if (!nowpassword) {
      error.push("Mật khẩu hiện tại không được để trống");
    }
    if (!newpassword) {
      error.push("Mật khẩu mới không được để trống");
    }
    if (repassword != newpassword) {
      error.push("Mật khẩu nhập lại không trùng khớp");
    }
    if (error.length) {
      res.render("../views/updatepassforad.ejs", { error: error });
    }
    else{
    let data = await database.accountad.findOne({ _id: req.session.adminid });
    bcypt.compare(nowpassword, data.password, async (err, result) => {
      if (result === true) {
        let hashnewpass = await bcypt.hash(newpassword, 10);
        await database.accountad.update(
          { _id: req.session.adminid },
          { password: hashnewpass }
        );
        res.redirect("/admin");
      } else {
        error.push("Mật khẩu hiện tại không đúng");
        res.render("../views/updatepassforad.ejs", { error: error });
      }
    });
  } 
}
  else {
    res.redirect("/admin");
  }
});

router.get("/chitiet", async  (req, res) => {
  if (req.session.adminid && req.query.idprofile) {
      let idprofile = req.query.idprofile;
      let data_id = await database.profile.findOne({_id : idprofile });
      if(data_id)
      {
        res.render("../views/chitietforadmin.ejs", { profile: data_id });
      }
      else{
          let dataidres = await database.profile.findOne({Idrestaurant : idprofile});
          if(dataidres)
          {
            res.render("../views/chitietforadmin.ejs", { profile: dataidres });  
          }
          else{
            res.redirect("/admin");
          }
      }
  }
  else{
    res.redirect("/admin");
  }
});
router.get("/search", (req, res) => {
  if (req.session.adminid) {
    let query = req.query.q.toLowerCase();
    let result = [];
    database.profile.find({}, (err, data) => {
      data.forEach((i) => {
        if (
          i.Name.toLowerCase().indexOf(query) > -1 ||
          i.Address.toLowerCase().indexOf(query) > -1
        ) {
          result.push(i);
        }
      });
      res.render("../views/homeadmin.ejs", {
        profiles: result,
        page: "",
        sorttype: "",
        next: " ",
        back: " ",
      });
    });
  } else {
    res.redirect("/admin");
  }
});

router.post("/xoabaidang", (req, res) => {
  let idpost = req.body.idprofile;
  database.profile.remove({ _id: idpost }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("da xoa");
      res.redirect("/admin");
    }
  });
});

router.get("/checkinfor" , async (req,res)=>{
  if(req.session.adminid)
  {
    let idcus = req.query.idcus; 
    let dataFb = await database.accountface.findOne({id : idcus});
    let dataGm = await database.accountgmail.findOne({id : idcus});
    if(dataFb){
      res.render("../views/checkinforforad.ejs" , { fullname : dataFb.fullname, profile : dataFb});
    }
    else if(dataGm){
      res.render("../views/checkinforforad.ejs" , { fullname : dataGm.fullname , profile : dataGm});
    }
    else{
      let data = await database.account.findOne({_id : idcus});
      if(data)
      {
        res.render("../views/checkinforforad.ejs" , { fullname : data.fullname , profile : data});
      }
      else{
        res.redirect("/admin")
      }
      
    }  

  }
  else{
    res.redirect("/admin");
  }
})

router.get("/accountcus-management", (req, res) => {
  if (req.session.adminid) {
    database.account.find({}, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render("../views/accountcusmanagement.ejs", { accountcus: data });
      }
    });
  } else {
    res.redirect("/admin");
  }
});

router.get("/edit-cus", async (req, res) => {
  if (req.session.adminid) {
    if (req.query.idcus) {
      let idcus = req.query.idcus;
      let data = await database.account.findOne({ _id: idcus });
      res.render("../views/admineditcus.ejs", { cus: data ,error : []});
    } else {
      res.redirect("/admin");
    }
  } else {
    res.redirect("/admin");
  }
});

router.post("/edit-cus",upload.single("image"), async (req, res) => {
  let image = "";
  let error = [];
  let { idcus, username, password, fullname , phone,address,gender,birthday } = req.body;
  let data = await database.account.findOne({ _id: idcus });
    if(req.file)
    {
       image = req.file.path.substring(6);
    }
    if(!username)
    {
      error.push("Vui lòng không để trống trường username");
    }
    if(!fullname)
    {
      error.push("Vui lòng không để trống trường fullname");
    }
    if(validator.validate(username) === false)
    {
      error.push("Email không đúng định dạng");
    }
    if(error.length){
      res.render("../views/admineditcus.ejs", { cus: data ,error : error});
    }
    else{
      if(!password)
      {
        await database.account.update(
          { _id: idcus },
          { username: username,fullname: fullname,phone : phone , address : address , gender :gender , birthday : birthday,image : image }
        );
      }
      else{
        let hashpass = await bcypt.hash(password, 10);
        await database.account.update(
          { _id: idcus },
          { username: username, password: hashpass, fullname: fullname,phone : phone , address : address , gender :gender , birthday : birthday,image : image }
        );
      }
      res.redirect(`/admin/edit-cus?idcus=${idcus}`);
    }

});

router.post("/remove-accountcus", async (req, res) => {
  let idaccountcus = req.body.idaccountcus;
  await database.account.remove({ _id: idaccountcus });
  res.redirect("/admin/accountcus-management");
});

router.get("/accountface-management" , async (req,res)=>{
  if(req.session.adminid)
  {
        let data = await database.accountface.find();
        res.render("../views/accountfacemanagement.ejs" , {accountface : data });
  }
  else{
    res.redirect("/admin");
  }
})

router.get("/edit-accountface" , async (req,res)=>{
  if(req.session.adminid)
  {    
      let error = [];
      let idcus = req.query.idcus;
      let data = await database.accountface.findOne({id : idcus});
      res.render("../views/admineditaccountfb.ejs" , {cus : data , error : []});
  }
  else{
    res.redirect("/admin");
  }
})

router.post("/edit-accountface" ,upload.single("image"), async (req,res)=>{
  if(req.session.adminid)
  {
      let image = "";
      let error = [];
      let {idcus,username , fullname ,phone, address , gender,birthday} = req.body;
      let data = await database.accountface.findOne({id : idcus});
       if(req.file)
       {
        image = req.file.path.substring(6);
       }
    if(!username)
    {
      error.push("Vui lòng không để trống trường username");
    }
    if(!fullname)
    {
      error.push("Vui lòng không để trống trường fullname");
    }
    if(validator.validate(username) === false)
    {
      error.push("Email không đúng định dạng");
    }
    if(error.length){
      res.render("../views/admineditaccountfb.ejs", { cus: data ,error : error});
    }
    else{
      await database.accountface.update({id : idcus} , {username : username , fullname : fullname , address:address ,phone : phone, gender:gender, birthday : birthday ,image:image});
      res.redirect(`/admin/edit-accountface?idcus=${idcus}`);
    }
     
  }
  else{
    res.redirect("/admin");
  }
})

router.post("/remove-accountface" , async (req,res)=>{
  if(req.session.adminid)
  {
      let idcus = req.body.idcus;
      await database.accountface.remove({id  : idcus});
      res.redirect("/admin/accountface-management");
  }
  else{
      res.redirect("/admin");
  }
})

router.get("/accountgmail-management" , async (req,res)=>{
  if(req.session.adminid)
  {
        let data = await database.accountgmail.find();
        res.render("../views/accountgmailmanagement.ejs" , {accountgmail : data});
  }
  else{
    res.redirect("/admin");
  }
})

router.get("/edit-accountgmail", async (req,res)=>{
  if(req.session.adminid)
  {   
      let idcus = req.query.idcus;
      let data = await database.accountgmail.findOne({id : idcus});
      res.render("../views/admineditaccountgm.ejs" , {cus : data , error : []});
  }
  else{
      res.redirect("/admin");
  }
})

router.post("/edit-accountgmail" ,upload.single("image") , async (req,res)=>{
  if(req.session.adminid)
  {
      let image ="";
      let error = [];
      let {idcus,username , fullname ,phone, address , gender,birthday} = req.body;
      let data = await database.accountgmail.findOne({id : idcus});
      if(req.file)
      {
        image = req.file.path.substring(6);
      }
    if(!username)
    {
      error.push("Vui lòng không để trống trường username");
    }
    if(!fullname)
    {
      error.push("Vui lòng không để trống trường fullname");
    }
    if(validator.validate(username) === false)
    {
      error.push("Email không đúng định dạng");
    }
    if(error.length){
      res.render("../views/admineditaccountgm.ejs", { cus: data ,error : error});
    }
    else{
      await database.accountgmail.update({id : idcus} , {username : username , fullname : fullname , address:address ,phone : phone, gender:gender, birthday : birthday, image : image});
      res.redirect(`/admin/edit-accountgmail?idcus=${idcus}`);
    }
      
  }
  else{
    res.redirect("/admin");
  }
})

router.post("/remove-accountgmail" , async (req,res)=>{
  if(req.session.adminid)
  {
      let idcus = req.body.idcus;
      await database.accountgmail.remove({id  : idcus});
      res.redirect("/admin/accountgmail-management");
  }
  else{
      res.redirect("/admin");
  }
})


router.get("/accountres-management", (req, res) => {
  if (req.session.adminid) {
    database.accountRes.find({}, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render("../views/accountresmanagement.ejs", { accountres: data });
      }
    });
  } else {
    res.redirect("/admin");
  }
});

router.get("/edit-res", async (req, res) => {
  if (req.session.adminid) {
    if (req.query.idres) {
      let idres = req.query.idres;
      let data = await database.accountRes.findOne({ _id: idres });
      res.render("../views/admineditres.ejs", { res: data , error : [] });
    } else {
      res.redirect("/admin");
    }
  } else {
    res.redirect("/admin");
  }
});

router.post("/edit-res", async (req, res) => {
  let error = [];
  let { idres, username, password, fullname, phone } = req.body;
  let data = await database.accountRes.findOne({ _id: idres });
  if(!username)
  {
    error.push("Vui lòng không để trống trường username");
  }
  if(!fullname)
  {
    error.push("Vui lòng không để trống trường fullname");
  }
  if(validator.validate(username) === false)
  {
    error.push("Email không đúng định dạng");
  }
  if(error.length){
    res.render("../views/admineditres.ejs", { res: data ,error : error});
  }
  else{
    if(!password)
    {
    await database.accountRes.update(
      { _id: idres },
      { username: username, phone: phone, fullname: fullname }
    );
    }
    else{
    let hashpass = await bcypt.hash(password, 10);
    await database.accountRes.update(
      { _id: idres },
      { username: username, password: hashpass, phone: phone, fullname: fullname }
    );
    }
  
  res.redirect("/admin/accountres-management");
}
});

router.post("/remove-accountres", async (req, res) => {
  let idaccountres = req.body.idaccountres;
  await database.profile.remove({ Idrestaurant: idaccountres });
  await database.accountRes.remove({ _id: idaccountres });
  await database.infororder.remove({Idrestaurant : idaccountres });
  res.redirect("/admin/accountres-management");
});
router.get("/order-management", (req, res) => {
  if (req.session.adminid) {
    database.infororder.find({}, (err, data) => {
      res.render("../views/ordermanagement.ejs", { infor: data });
    });
  } else {
    res.redirect("/admin");
  }
});

router.get("/edit-order", async (req, res) => {
  if (req.session.adminid) {
    if (req.query.idorder) {
      let idorder = req.query.idorder;
      let data = await database.infororder.findOne({ _id: idorder });
      res.render("../views/admineditorder.ejs", { data: data , error : [] });
    } else {
      res.redirect("/admin");
    }
  } else {
    res.redirect("/admin");
  }
});

router.post("/edit-order", async (req, res) => {
  let idorder = req.body.idorder;
  let error = [];
  let data = await database.infororder.findOne({ _id: idorder });
  let {
    CustomerName,
    CustomerEmail,
    CustomerAddress,
    CustomerPhone,
    Note,
    Division,
    CustomerCapacity,
    CustomerPrice,
    Idrestaurant,
    IdCustomer,
    NameRestaurant,
    RestaurantAddress,
    PriceTotal,
    Idvoucher,
    VoucherCode,
    Redution,
    PricePay,
    Orderstatus,
    Timeorder,
  } = req.body;

  if(!CustomerEmail ||!CustomerName ||!CustomerAddress ||!CustomerPhone ||!CustomerCapacity ||!CustomerPrice ||!Idrestaurant ||!IdCustomer ||!Idvoucher || !Division || !PriceTotal )
  {
    error.push("Vui lòng không để trống các trường");
  }
  if(validator.validate(CustomerEmail) === false)
  {
    error.push("Email không đúng định dạng");
  }
  if(error.length){
    res.render("../views/admineditorder.ejs", { data: data ,error : error});
  }
  else{
    await database.infororder.update(
      { _id: idorder },
      {
        CustomerName,
        CustomerEmail,
        CustomerAddress,
        CustomerPhone,
        Note,
        Division,
        CustomerCapacity,
        CustomerPrice,
        Idrestaurant,
        IdCustomer,
        NameRestaurant,
        RestaurantAddress,
        PriceTotal,
        Idvoucher,
        VoucherCode,
        Redution,
        PricePay,
        Orderstatus,
        Timeorder,
      }
    );
    res.redirect("/admin/order-management");
  }
  
});

router.post("/removeorder", (req, res) => {
  let idorder = req.body.idorder;
  database.infororder.remove({ _id: idorder }, (err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/admin/order-management");
    }
  });
});

router.get("/voucher-management", async (req, res) => {
  if (req.session.adminid) {
    let data = await database.voucher.find();
    res.render("../views/vouchermanagement.ejs", { voucher: data });
  } else {
    res.redirect("/admin");
  }
});

router.get("/edit-voucher" , async (req,res)=>{
 if(req.session.adminid)
 {  
   let idvoucher  = req.query.idvoucher;
   let voucher = await database.voucher.findOne({_id : idvoucher});
    res.render("../views/admineditvoucher.ejs" , {voucher : voucher , error : []}); 
 }
 else{
   res.redirect("/admin");
 }
})

router.post("/edit-voucher" , async (req,res)=>{
  let error = [];
  let {idvoucher  , VoucherCode , Reduction , TimeStart,TimeEnd,StatusVoucher} = req.body;
  let voucher = await database.voucher.findOne();
  if(!VoucherCode || !Reduction || !TimeStart || !TimeEnd || !StatusVoucher)
  {
    error.push("Vui lòng không để trống các trường");
  }
  if(VoucherCode.indexOf("@") > -1 || VoucherCode.indexOf("!") > -1 || VoucherCode.indexOf("#") > -1 || VoucherCode.indexOf("$") > -1 || VoucherCode.indexOf("%") > -1|| VoucherCode.indexOf("^") > -1|| VoucherCode.indexOf("&") > -1 || VoucherCode.indexOf("*") > -1 || VoucherCode.indexOf("(") > -1|| VoucherCode.indexOf(")") > -1)
  {
    error.push("Voucher Code vui lòng không nhập ký tự đặc biệt");
  }
  if(VoucherCode.length < 9 ){
    error.push("Độ dài của Voucher Code không hợp lệ");
  }
  if(error.length){
    res.render("../views/admineditvoucher.ejs", { voucher: voucher ,error : error});
  }
  else{
    await database.voucher.update({_id : idvoucher} , {VoucherCode : VoucherCode , Reduction : Reduction , TimeStart : TimeStart , TimeEnd : TimeEnd , StatusVoucher : StatusVoucher});
    res.redirect("/admin/voucher-management");
  
  }
})

router.post("/remove-voucher", async (req, res) => {
  var idvoucher = req.body.idvoucher;
  await database.voucher.remove({ _id: idvoucher });
  res.redirect("/admin/voucher-management");
});



router.get("/policy", (req, res) => {
  if(req.session.adminid)
  {
    res.render("../views/policyforadmin.ejs");
  }
  else{
    res.redirect("/admin");
  }
});

router.get("/news", async (req, res) => {
  if(req.session.adminid)
  {
    let topNew =  (await database.profile.find()).reverse().slice(0,5);
    let topFive =  (await database.profile.find().sort({avgrate : -1})).slice(0,5);
    let dataTD = await database.news.find({type : "Tuyển dụng"});
    let dataNH = await database.news.find({type : "Tin nhà hàng"}); 
    res.render("../views/newsforadmin.ejs" , {fullname : 'Admin' ,  dataTD : dataTD ,  dataNH : dataNH, topFive :topFive , topNew : topNew});
  }
  else{
    res.redirect("/admin");
  }
});

router.get("/postnews", (req,res)=>{
  if(req.session.adminid)
  {
      res.render("../views/postnewsforadmin.ejs");
  }
  else{
    res.redirect("/admin");
  }
})

router.post("/postnews" , upload.single("image"), async(req,res)=>{
  let image = "";
  if(req.file){
    image = req.file.path.substr(6);
  }
  let date = new Date();
  let now = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} `;
  console.log(now);
  let {title , type,Content} = req.body;
  await database.news.create({title : title , type : type , time : now , image : image,Content : Content});
  res.redirect("/admin/news");
})

router.get("/news-management" , async (req,res)=>{
    if(req.session.adminid)
    {
      let data = await database.news.find();
      res.render("../views/newsmanagement.ejs" , {news : data});
    }
    else{
      res.redirect("/admin");
    }
  })

  router.get("/edit-news" , async (req,res)=>{
      if(req.session.adminid)
      {
          let idnews = req.query.idnews;
          let data = await database.news.findOne({_id : idnews});
          res.render("../views/admineditnews.ejs" , {news : data});
      }
      else{
        res.redirect("/admin");
      }
  })

  router.post("/edit-news" ,upload.single("image"), async(req,res)=>{
     let image = "";
     let idnews = req.body.idnews;
     if(req.file){
      image = req.file.path.substring(6);
     }
     let {title , type ,time ,Content} = req.body;
     await database.news.update({_id : idnews} , {title : title , type : type , time : time , Content : Content , image : image});
     res.redirect(`/admin/edit-news?idnews=${idnews}`);
  })

  router.post("/remove-news" , async (req,res)=>{
    let idnews = req.body.idnews;
    await database.news.remove({_id : idnews});
    res.redirect("/admin/news-management");

  })

router.get("/chat-management" , async (req,res)=>{
  if(req.session.adminid)
  {
    let data = await database.chat.find();
    res.render("../views/chatmanagement.ejs" , {chat : data});
  }
  else{
    res.redirect("/admin");
  }
})

router.get("/check-chatcontent" , async (req,res) =>{
    if(req.session.adminid)
    {
        let idchat = req.query.idchat;
        let data = await database.chat.findOne({_id : idchat});
        res.render("../views/chatforadmin.ejs" , {chat : data});

    }
    else{
      res.redirect("/admin");
    }

})

router.post("/remove-chat" , async (req,res)=>{
  let idchat = req.body.idchat;
  await database.chat.remove({_id : idchat});
  res.redirect("/admin/chat-management");

})

router.get("/logout", async (req, res) => {
  await res.clearCookie("adminid");
  await req.session.destroy();
  res.redirect("/admin");
});
module.exports = router;
