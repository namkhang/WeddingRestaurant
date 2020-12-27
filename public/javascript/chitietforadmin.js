var price = document.getElementById("price");
var capacity = document.getElementById("capacity");
var capacityIP = document.getElementById("capacityIP");
var capacityBIP = document.getElementById("capacityBIP");
var priceminIP = document.getElementById("priceminIP");
var pricemaxIP = document.getElementById("pricemaxIP");
var priceminBIP = document.getElementById("priceminBIP");
var pricemaxBIP = document.getElementById("pricemaxBIP");
var btnDivisionA = document.getElementById("divisionA");
var btnDivisionB = document.getElementById("divisionB");
var dropdownMenuButton = document.getElementById("dropdownMenuButton");
var imgtest = document.getElementById("imgjs");
$(document).ready(function(){
    $('.img').attr('src',imgjs.value);
    $( 'img').click(function(){
		var getImg = $(this).attr('src');
		console.log(getImg);
        $('.img').attr('src', getImg);
    });
});



btnDivisionA.onclick = ()=>{
    price.innerText = `${priceminIP.value} (VND/suất) - ${pricemaxIP.value} (VND/suất)`;
    capacity.innerText = `${capacityIP.value} khách`;
    dropdownMenuButton.innerText = "A";
}

btnDivisionB.onclick = ()=>{
    price.innerText = `${priceminBIP.value} (VND/suất) - ${pricemaxBIP.value} (VND/suất)`;
    capacity.innerText = `${capacityBIP.value} khách`;
    dropdownMenuButton.innerText = "B";
}