function isDelete(){
    let form = document.getElementById("form");
    form.addEventListener("submit" , (e)=>{
            var r = confirm("Bạn có chắc chắn muốn xóa!");
            if(r === false){
                e.preventDefault();
            }
        }) 


}
isDelete();