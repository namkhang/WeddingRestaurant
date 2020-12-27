var socket = io("http://localhost:3216");
var dangxuat = document.getElementById("dangxuat");
var dropdownMenuButton = document.getElementById("dropdownMenuButton");
var sorttype = document.getElementById("sorttype");

dangxuat.onclick = () =>{
    socket.emit("user-logout" , "Admin");
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

  
function isDelete(){
    let form = document.getElementsByClassName("form");
    for(let i =0 ; i< form.length ; i++)
    {
        let iEvent = form[i];
        iEvent.addEventListener("submit" , (e)=>{
            var r = confirm("Bạn có chắc chắn muốn xóa!");
            if(r === false){
                e.preventDefault();
            }
        }) 
    }

}
isDelete();