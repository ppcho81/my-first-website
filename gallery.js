// Photo gallery viewer: click a thumbnail to show it bigger up top
const viewerImage = document.getElementById("viewerImage");
const thumbs = document.querySelectorAll(".thumb");

thumbs.forEach(function (thumb) {
  thumb.addEventListener("click", function () {
    // Swap the big viewer image
    viewerImage.src = thumb.dataset.full;
    viewerImage.alt = thumb.alt;

    // Highlight the selected thumbnail
    thumbs.forEach(function (t) {
      t.classList.remove("active");
    });
    thumb.classList.add("active");
  });
});
