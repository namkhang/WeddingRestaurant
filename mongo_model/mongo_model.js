var mongoose = require("mongoose");
var Schema = mongoose.Schema ;
 var accountuser = new Schema({
     username : String , 
     password : String, 
     fullname : String ,  
     phone : String , 
     address : String , 
     gender : String , 
     birthday : String,
     image : String
 })
 var accountface = new Schema({
     id :String ,
     fullname : String , 
     username : String,
     phone : String , 
     address : String , 
     gender : String , 
     birthday : String,
     image : String
 })
var accountgmail = new Schema({
    id :String ,
     fullname : String , 
     username : String,
     phone : String , 
     address : String , 
     gender : String , 
     birthday : String ,
     image : String
})
var profileres = new Schema({
    Name : String ,
    Idrestaurant : String ,
    Address : String ,
    Description : String ,
    PriceMin : Number,
    PriceMax :  Number,
    Capacity : Number,
    PriceMinB : Number,
    PriceMaxB : Number,
    CapacityB : Number,
    Image  : String ,
    TimeFree : String ,
    Image1  : String ,
    Image2  : String ,
    Image3  : String ,
    Image4  : String ,
    Image5  : String ,
    rate5 : Number ,
    rate4 : Number ,
    rate3 : Number ,
    rate2 : Number,
    rate1 : Number ,
    avgrate : Number,
    totalRate : Number,
    hotline : String
})
var accountRestaurant = new Schema({
    username : String ,
    password : String ,
    phone : String,
    fullname : String,
    status : String
})
var accountad = new Schema({
    username : String , 
    password : String ,
})
var infororder = new Schema({
    CustomerName : String ,
    CustomerEmail : String ,
    CustomerAddress : String ,
    CustomerPhone : String ,
    Note : String ,
    Division : String,
    CustomerCapacity : String ,
    CustomerPrice : String,
    Idrestaurant : String ,
    IdCustomer  : String ,
    NameRestaurant : String ,
    RestaurantAddress : String,
    PriceTotal : String ,
    Idvoucher : String ,
    VoucherCode : String,
    Redution : String ,
    PricePay : String ,
    Orderstatus : String ,
    Timeorder : String,


})
var voucher = new Schema({
    IdCustomer : String ,
    VoucherCode : String ,
    Reduction :  String,
    TimeStart : String ,
    TimeEnd : String ,
    StatusVoucher : String
})

var chatonline  = new Schema({
    userID : String,
    Name : String ,
    ChatContent : String
})

var chat  = new Schema({
    IdCustomer : String,
    IdRestaurant : String ,
    CusName : String,
    imageCus : String,
    imageRes : String,
    ResName : String,
    Chat : Array
})

var news = new Schema({
    title : String,
    time : String ,
    type : String,
    Content : String ,
    image : String

})
 module.exports.account =   mongoose.model("useraccounts" , accountuser);
 module.exports.accountface = mongoose.model("accountface" , accountface);
 module.exports.accountgmail =  mongoose.model("accountgmail" , accountgmail);
 module.exports.profile = mongoose.model("profilesrestaurants" , profileres);
 module.exports.accountRes = mongoose.model("accountRestaurants" , accountRestaurant);
 module.exports.accountad = mongoose.model("accountadmins" , accountad);
 module.exports.infororder = mongoose.model("infororder" , infororder);
module.exports.voucher = mongoose.model("vouchers" , voucher);
module.exports.chatonline = mongoose.model("chatonline" , chatonline);
module.exports.chat = mongoose.model("chats" , chat);
module.exports.news = mongoose.model("news" , news);

