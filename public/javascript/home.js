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
var search = document.getElementById("search");
var row = document.getElementById("row");
var userId = document.getElementById("userid");

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


function result(){
    let dataSearch = {query : search.value}
    fetch("http://localhost:3216/search" ,{ method : 'POST' ,  headers : {
        "Content-Type": "application/json",
    },
        body : JSON.stringify(dataSearch)
    }
    )
    .then(result => result.json())
    .then((data) =>{
        let dataStar ;
        row.innerHTML = "";
        data.forEach((i)=>{
            if(i.avgrate  > 4.7 && i.avgrate <= 5.0){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
            </div>`;
            }
            else if(i.avgrate  > 4.35 && i.avgrate <= 4.65){
                dataStar = `  <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 3.7 && i.avgrate <= 4.35){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 3.35 && i.avgrate <= 3.7){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 2.7 && i.avgrate <= 3.35){
                dataStar = `  <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 2.35 && i.avgrate <= 2.7){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 1.7 && i.avgrate <= 2.35){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate  > 1.35 && i.avgrate <= 1.7){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="home-product-item__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`;
            }
            else if(i.avgrate > 0.7 && i.avgrate  <= 1.35){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`
            }
            else if(i.avgrate  > 0.35 && i.avgrate <= 0.7){
                dataStar = ` <div class="home-product-item__rating">
                <i class="home-product-item__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`
            }   
            else{
                dataStar = ` <div class="home-product-item__rating">
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
                <i class="__star-gold fas fa-star-half-alt"></i>
            </div>`
            }

            row.innerHTML += `<div class="col-3 banner-item" >
            <div class="wapitem">
                <a class="waptop" href="/chitiet?idprofile=<%-i._id%>" >
                    <img class="img-item"src=${i.Image} class="img-responsive lazy" alt="#">
                </a>
                <div class="wapfooter">
                    <a href="/chitiet?idprofile=${i._id}" target="">${i.Name}</a>
                    <p class="text-address notranslate">${i.Address}</p>
                    <p class="text-money notranslate">${i.hotline}</p>

                </div>
                ${dataStar}
                    <div class="home-product-item__text">
                        <span>${i.avgrate}/5 (${i.totalRate}) </span>
                    </div>
                </div>
                <div class="wapbooking">		
                        <button class="disabled-booking btnMemory" type="submit" value="${i._id}" style="background: rgb(221, 221, 221);">Ghi nhớ</button>
                </div>
            </div>
        </div>`
        })
    } )
    .catch(err => console.log(err))
}

for(let i = 0 ; i < btnMemory.length ; i ++){
    let btnClick = btnMemory[i];
    btnClick.onclick = ()=>{
        let data = {idprofile : btnClick.value};
        fetch("http://localhost:3216/ghinho" ,{
            method : 'POST' ,
            headers:{
            'Content-Type': 'application/json',
            },
            body : JSON.stringify(data) 
        })
        .then(result => result.json())
        .then((data)=>{
            count.innerText = data.length;
                ghinho.innerHTML = "";
                data.forEach((i,index)=>{
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
        .catch(err => console.log(err)) ;

       /*  $.ajax({
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
            }) */
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

 socket.emit("join-room" , userId.value);
 socket.on("server-destroy" , (data)=>{
    alert(data);
 })