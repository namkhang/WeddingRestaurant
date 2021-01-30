module.exports.notImportant = (req,res,next)=>{
    let login = "";
  if(!req.session.ghinho)
  {
    req.session.ghinho = [];
  }
  if(req.session.userid)
  {
    login = 'yes';
  }
  if(req.isAuthenticated()){
    login = 'passport';
  }
   res.locals.login = login;
   next();
}