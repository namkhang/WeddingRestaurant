
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