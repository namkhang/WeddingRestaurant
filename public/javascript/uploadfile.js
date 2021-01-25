let image = document.getElementById("image");
let fileupload = document.getElementById("fileupload");

function readImage(input) {
    if (input.files && input.files[0]) {
      let reader = new FileReader();
      reader.onload = function(e){
        image.setAttribute('src' ,e.target.result );
      } 
      console.log("da vao");
      reader.readAsDataURL(input.files[0]);
    }
}

  fileupload.onchange = function(){
    readImage(this);
  }