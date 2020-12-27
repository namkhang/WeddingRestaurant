var socket = io("http://localhost:3216");
var username = document.getElementById("username");
var dangxuat = document.getElementById("dangxuat");
var dropdownMenuButton = document.getElementById("dropdownMenuButton");
var sorttype = document.getElementById("sorttype");

dangxuat.onclick = () =>{
    socket.emit("user-logout" , username.value );
  }

  if(sorttype.value == "" || !sorttype.value)
  {
      dropdownMenuButton.innerText = "Cũ nhất";
  }
  else if(sorttype.value == "new")
  {
      dropdownMenuButton.innerText = "Mới nhất";
  }
  else{
      dropdownMenuButton.innerText = "Đánh giá tốt nhất";
  }