var giohang = document.getElementById("myModal");
var btncart = document.getElementsByClassName("cart")[0];
var close = document.getElementsByClassName("close")[0];
var close_footer = document.getElementsByClassName("close-footer")[0];
var btnPayment = document.getElementsByClassName("btn-payment");
var idStripe = document.getElementById("idStripe");
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


for(let i = 0 ; i< btnPayment.length ; i++){
    btnPayment[i].onclick = ()=>{
      var stripeHandler =  StripeCheckout.configure({
            key: idStripe.value,
            locale: 'en',
            token : function(token){
                console.log(token);
                fetch('/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        stripeTokenId: token.id,
                        price : (parseInt(btnPayment[i].value) / 25000) //đổi sang dola
                    })
                }).then(function(res) {
                    return res.json()
                }).then(function(data) {
                    alert(data.message)
                }).catch(function(error) {
                    console.error(error)
                })
            }
        })
        stripeHandler.open({
            amount : (parseInt(btnPayment[i].value) / 25000) // đổi sang dola (đây là phần hiển thị dưới khung nhập thẻ visa)
        });
    }
}