var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var db = require("./mongo_model/mongo_model");

mongoose.connect("mongodb://localhost:27017/WeddingRestaurant", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

/* mongoose.connect("mongodb+srv://HerokuFirst:khang123456@herokudeploy.tfoiu.mongodb.net/WeddingRestaurant?retryWrites=true&w=majority" ,{ useNewUrlParser: true ,useUnifiedTopology: true }); */

var userRouter = require("./routes/users");
var resRouter = require("./routes/restaurant");
var adminRouter = require("./routes/admin");
const { log } = require("console");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('namkhangnguyendang'));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRouter);
app.use("/restaurant", resRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

var server = require("http").createServer(app);
server.listen(process.env.PORT || 3216);
var io = require("socket.io")(server);

var userOnline = [];

io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("join-room" , (data)=>{
    socket.join(data);
    socket.room = data;
  })

  socket.on("sent-message", async (data) => {
    let dataCus;
    let dataold = await db.chat.findOne({IdCustomer : data.IdCustomer , IdRestaurant : data.IdRestaurant});
    let dataFace = await db.accountface.findOne({id : data.IdCustomer});
    let dataGmail = await db.accountgmail.findOne({id : data.IdCustomer});
    if(dataFace)
    {
      dataCus = dataFace;
    }
    else if(dataGmail){
      dataCus = dataGmail;
    }
    else{
      dataCus = await db.account.findOne({_id : data.IdCustomer});
    }
    let dataRes = await db.profile.findOne({Idrestaurant : data.IdRestaurant });
    if(dataold)
    {
      let date = new Date();
      let getmonth = parseInt(date.getMonth()) + 1;
      let chatNew = dataold.Chat;
      let timenow = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${getmonth}/${date.getFullYear()}`;
      chatNew.push({idsent : data.idsent , Name : data.Name , chatcontent : data.chatcontent , time : timenow});
      await db.chat.updateOne({IdCustomer : data.IdCustomer , IdRestaurant : data.IdRestaurant} , {Chat : chatNew});
      let newData = await db.chat.findOne({IdCustomer : data.IdCustomer , IdRestaurant : data.IdRestaurant});
      io.sockets.in(socket.room).emit("sever-sent-message" , newData);
    }
    else{
      let date = new Date();
      let getmonth = parseInt(date.getMonth()) + 1;
      let timenow = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${getmonth}/${date.getFullYear()}`;
      let Chat = [{idsent : data.idsent , Name : data.Name , chatcontent : data.chatcontent , time : timenow}];
      let newData = await db.chat.create({IdRestaurant : data.IdRestaurant , IdCustomer : data.IdCustomer , CusName : data.CusName , ResName : data.ResName , imageCus : dataCus.image ,imageRes : dataRes.Image, Chat : Chat});
   /*    let newData = await db.chat.findOne({IdCustomer : data.IdCustomer , IdRestaurant : data.IdRestaurant}); */
      io.sockets.in(socket.room).emit("sever-sent-message" , newData);
    }
    
   /*  db.chatonline.create(
      { userID : data.userid, Name: data.name, ChatContent: data.chatcontent },
       (err, datacr) => {
        io.sockets.emit("sever-sent-message", datacr);
      }
    ); */
  });

/*   socket.on("user-online", (data) => {
    if (userOnline.indexOf(data) > -1) {
      io.sockets.emit("server-sentonline", userOnline);
    } else {
      userOnline.push(data);
      io.sockets.emit("server-sentonline", userOnline);
    }
  }); */

/*   socket.on("sent-message-res", (data) => {
    db.chatonline.create(
      { userID : data.userid, Name: data.name, ChatContent: data.chatcontent },
      (err, datacr) => {
        io.sockets.in(socket.room).emit("sever-sent-message", datacr);
        io.sockets.emit("sever-sent-message",datacr);
      }
    );
  }); */

 /*  socket.on("sent-message-admin", (data) => {
    db.chatonline.create(
      { userID : data.userid, Name: data.name, ChatContent: data.chatcontent },
      (err, datacr) => {
        /io.sockets.in(socket.room).emit("sever-sent-message", datacr); 
        io.sockets.emit("sever-sent-message",datacr);
      }
    );
  }); */

/*   socket.on("user-logout", (data) => {
    let index = userOnline.indexOf(data);
    userOnline.splice(index, 1);
    socket.broadcast.emit("server-sent-logout", userOnline);
  }); */

 /*  socket.on("client-join-room" , (data)=>{
    socket.join(data);
    socket.room = data;
  }) */

});
module.exports = app;
