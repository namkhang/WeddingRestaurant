var giohang = document.getElementById("myModal");
var btncart = document.getElementsByClassName("cart")[0];
var close = document.getElementsByClassName("close")[0];
var close_footer = document.getElementsByClassName("close-footer")[0];
giohang.style.display = "none";
btncart.onclick = ()=>{
    giohang.style.display = "block";
}
close.onclick = ()=>{
    giohang.style.display = "none";
}
close_footer.onclick = ()=>{
    giohang.style.display = "none";
}
