// Grab the button from the page
const contactButton = document.getElementById("contactButton");

// When the button is clicked, open the user's email app
// with a new message already addressed to the NaCho Family
contactButton.addEventListener("click", function () {
  window.location.href = "mailto:nachofam16@gmail.com?subject=Hello%20NaCho%20Family!";
});
