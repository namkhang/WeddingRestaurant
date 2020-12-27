var socket = io("http://localhost:3216");
var btn = document.getElementById("sent");
var username = document.getElementById("name");
var message = document.getElementById("message");
var khungchat = document.getElementById("khungchat");
var useronline = document.getElementById("useronline");
var userid = document.getElementById("userid");
var dangxuat = document.getElementById("dangxuat");
var idcus  = document.getElementById("idcus");
var cusname  = document.getElementById("cusname");

btn.onclick = () => {
  if(!message.value){
    alert("Xin hãy nhập vào ô chat bên dưới :(");
  }
  else{
    socket.emit("sent-message" , {IdCustomer : idcus.value ,IdRestaurant : userid.innerHTML,CusName :cusname.value,ResName : username.innerHTML, idsent : userid.innerHTML,Name : username.innerHTML ,chatcontent : message.value});
    message.value = "";
}
};

socket.emit("join-room" , userid.innerHTML);
/* socket.emit("user-online", username.innerHTML); */

socket.on("sever-sent-message", (data) => {
  if(data.IdCustomer == idcus.value && data.IdRestaurant == userid.innerHTML){
    let html = "";
    khungchat.innerHTML = "";
    data.Chat.forEach((i)=>{
      if(i.idsent == userid.innerHTML)
      {
       html = `
        <div class="row no-gutters" >
        <div class="col-md-3 offset-md-9">
            <div class="chat-bubble chat-right">
              <span style="color: black; font-weight: bold;">${i.Name}</span>
              <br />
            ${i.chatcontent}
            </div>
        </div>
        </div>`;
        khungchat.innerHTML += html ;
      }
      else{
     html = `
        <div class="row no-gutters" >
            <div class="col-md-3 ">
                <div class="chat-bubble chat-left">
                  <span style="color: black; font-weight: bold;">${i.Name}</span>
                  <br />
                    ${i.chatcontent}
                </div>
            </div>
      </div>`;
        khungchat.innerHTML += html ;
      }
    })
  }
    
});

/* socket.on("server-sentonline", (data) => {
  useronline.innerHTML = "";
  data.forEach((i) => {
    let html = `<div class="friend-drawer friend-onhover">
    <div class="text">
      <h6>${i}</h6>
    </div>
    <span class="time text-muted small">Đang online</span>
  </div>`;
    useronline.innerHTML += html;
  });
});

 dangxuat.onclick = () => {
  socket.emit("user-logout", username.innerHTML);
};

socket.on("server-sent-logout", (data) => {
  useronline.innerHTML = "";
  data.forEach((i) => {
    let html = `<div class="friend-drawer friend-onhover">
    <div class="text">
      <h6>${i}</h6>
    </div>
    <span class="time text-muted small">Đang online</span>
  </div>`;
    useronline.innerHTML += html;
  });
}); 
 socket.emit("client-join-room" , "5fa29549e6ed4c1a8c4d3c7c");  */

function sent() {
  if(!message.value){
    alert("Xin hãy nhập vào ô chat bên dưới :(");
  }
  else{
    socket.emit("sent-message" , {IdCustomer : idcus.value ,IdRestaurant : userid.innerHTML,CusName :cusname.value,ResName : username.innerHTML, idsent : userid.innerHTML,Name : username.innerHTML ,chatcontent : message.value});
    message.value = "";
  }
}
