let fileInput = document.querySelector(".file-input"),
  droparea = document.querySelector(".file-drop-area"),
  fileName = document.querySelector(".file-msg");
const fullYear = document.querySelector(".fullyear");

// highlight drag area
fileInput.addEventListener("dragenter focus click", function () {
  droparea.addClass("is-active");
});

// back to normal state
fileInput.addEventListener("dragleave blur drop", function () {
  droparea.removeClass("is-active");
});

// change inner text
fileInput.addEventListener("change", function (e) {
  let textContainer = e.target.files[0].name;
  fileName.innerHTML = textContainer;
});

// replace fullyear
let date = new Date();
fullYear.innerText = `${date.getFullYear()}. `;
