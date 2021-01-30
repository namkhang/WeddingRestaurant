let image = document.getElementById("image");
let fileupload = document.getElementById("fileupload");

function readImage(inputFile) {
    if (inputFile.files && inputFile.files[0]) {
      let reader = new FileReader();
      reader.onload = function(e){
        console.log(e);
       image.src = e.target.result;
      } 
      console.log("da vao");
      reader.readAsDataURL(inputFile.files[0]);
    }
}

  fileupload.onchange = function(){
    readImage(this);
  }