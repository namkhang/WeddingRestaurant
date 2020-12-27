var socket = io("http://localhost:3216");
var giohang = document.getElementById("myModal");
var btncart = document.getElementsByClassName("cart")[0];
var close = document.getElementsByClassName("close")[0];
var close_footer = document.getElementsByClassName("close-footer")[0];
var username = document.getElementById("username");
var dangxuat = document.getElementById("dangxuat");
var dropdownMenuButton = document.getElementById("dropdownMenuButton");
var sorttype = document.getElementById("sorttype");
var count = document.getElementById("count");
var ghinho = document.getElementById("ghinho");
var btnMemory = document.getElementsByClassName("btnMemory");

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

for(let i = 0 ; i < btnMemory.length ; i ++){
    let btnClick = btnMemory[i];
    btnClick.onclick = ()=>{
        $.ajax({
            url : "http://localhost:3216/ghinho",
            type : "post",
            data : {
                    idprofile : btnClick.value
            },
            dataType:"json",
            }).done((result) =>{
                count.innerText = result.length;
                ghinho.innerHTML = "";
                result.forEach((i,index)=>{
                    ghinho.innerHTML += `<div class="cart-row">
                    <div class="cart-item cart-column">
                        <img class="cart-item-image"
                            src=${i.Image}
                            width="100" height="100">
                        <span class="cart-item-title">${i.Name}</span>
                    </div>
                    <span class="cart-price
                        cart-column" >${i.hotline}</span>   
                        <a href="/chitiet?idprofile=${i._id}"><input type="submit" class="btn btn-remove" value="Chi tiết nhà hàng" ></input></a>	
                             <div style="margin-left: 10px;">
                            
                            <button type="submit" class="btn btn-remove btnRemoveMemo" value="${index}" >Xóa ghi nhớ này</button>
                            </div>
                </div>`;
                })
                removeMemo();
            })
    }
}
function removeMemo()  // dùng để cập nhật lại btnRemoveMemo vì ban đầu kh có session nó sẽ là mảng rỗng (vì btn xóa ghi nhớ chỉ dc tạo khi click thêm giỏ hàng nên js gọi mảng btnRemoveMemo không hoạt động )
{
    let btnRemoveMemo = document.getElementsByClassName("btnRemoveMemo");
    for(let i = 0 ; i < btnRemoveMemo.length ; i ++){
        let btnClickRm  = btnRemoveMemo[i];
        btnClickRm.onclick = ()=>{
           $.ajax({
                url : "http://localhost:3216/removeone",
                type : "post",
                dataType : "json",
                data : {
                    index : btnClickRm.value
                }
           }).done((result)=>{
            count.innerText = result.length;
            ghinho.innerHTML = "";
            result.forEach((i,index)=>{
                ghinho.innerHTML += `<div class="cart-row">
                <div class="cart-item cart-column">
                    <img class="cart-item-image"
                        src=${i.Image}
                        width="100" height="100">
                    <span class="cart-item-title">${i.Name}</span>
                </div>
                <span class="cart-price
                    cart-column" >${i.hotline}</span>   
                    <a href="/chitiet?idprofile=${i._id}"><input type="submit" class="btn btn-remove" value="Chi tiết nhà hàng" ></input></a>	
                 <div style="margin-left: 10px;">
                        
                        <button type="submit" class="btn btn-remove btnRemoveMemo" value="${index}" >Xóa ghi nhớ này</button>
                 </div>
            </div>`;
            })
            removeMemo(); // mỗi lần xóa xong thì cập nhật lại (nút bấm xóa)
           })
        }
    }
}
removeMemo(); //để update lại mỗi lần người dùng f5