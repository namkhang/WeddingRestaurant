var socket = io("http://localhost:3216");
var btnRemove = document.getElementsByClassName("btn-danger");
for(let i = 0 ; i< btnRemove.length ; i++){
    btnRemove[i].onclick = ()=>{
        socket.emit("join-room" , btnRemove[i].value);
        socket.emit("destroy-order" , btnRemove[i].value);
    }   
  
}