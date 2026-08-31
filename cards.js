// ===== Favorite Pokemon Cards =====
// To add a real card: take a photo, save it in the images/cards folder,
// then add a new object to the CARDS list below with that image's path
// and the card's details. "favorites" can list any mix of "M" (Micah),
// "Z" (Zachariah), and "H" (Howie) -- a card can belong to more than one!

const CARDS = [
  {
    name: "Jessie & James",
    image: "images/cards/P1.webp",
    era: "Sun & Moon",
    region: "N/A (Trainer card)",
    rarity: "Full Art Secret Rare",
    set: "Hidden Fates (2019), #68/68",
    details: "PSA 10 Gem Mint -- Team Rocket's discard-2 Supporter card.",
    favorites: ["H"],
  },
  {
    name: "Mega Dragonite ex",
    image: "images/cards/P2.webp",
    era: "Modern (2026)",
    region: "Johto",
    rarity: "Mega Hyper Rare",
    set: "ASC EN, #295/217",
    details: "PSA 9 Mint -- Stage 2 Mega Evolution ex with 370 HP, the Sky Transport ability, and the Ryuno Glide attack.",
    favorites: ["M", "Z", "H"],
  },
];

const FAVORITE_NAMES = {
  M: "Micah",
  Z: "Zachariah",
  H: "Howie",
};

const cardsGrid = document.getElementById("cardsGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

// Build one card tile from a card's data
function createCardElement(card) {
  const article = document.createElement("article");
  article.className = "card-item";
  article.dataset.favorites = card.favorites.join(",");

  const photo = document.createElement("div");
  photo.className = "card-photo";
  const img = document.createElement("img");
  img.src = card.image;
  img.alt = card.name;
  photo.appendChild(img);

  const info = document.createElement("div");
  info.className = "card-info";

  const heading = document.createElement("h3");
  heading.textContent = card.name;
  info.appendChild(heading);

  const detailsList = document.createElement("dl");
  detailsList.className = "card-details";
  [
    ["Era", card.era],
    ["Region", card.region],
    ["Rarity", card.rarity],
    ["Set / Pack", card.set],
    ["Notes", card.details],
  ].forEach(function ([label, value]) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    detailsList.appendChild(row);
  });
  info.appendChild(detailsList);

  const favWrap = document.createElement("div");
  favWrap.className = "card-favorites";
  ["M", "Z", "H"].forEach(function (initial) {
    const badge = document.createElement("span");
    const isFavorite = card.favorites.includes(initial);
    badge.className = "fav-badge fav-" + initial.toLowerCase() + (isFavorite ? " active" : "");
    badge.textContent = initial;
    badge.title = FAVORITE_NAMES[initial] + (isFavorite ? " likes this card" : "");
    favWrap.appendChild(badge);
  });
  info.appendChild(favWrap);

  article.appendChild(photo);
  article.appendChild(info);
  return article;
}

function renderCards() {
  cardsGrid.innerHTML = "";
  CARDS.forEach(function (card) {
    cardsGrid.appendChild(createCardElement(card));
  });
}

// Filtering: show only cards that include the selected person's initial
function applyFilter(initial) {
  const items = cardsGrid.querySelectorAll(".card-item");
  items.forEach(function (item) {
    const favorites = item.dataset.favorites.split(",");
    const show = initial === "all" || favorites.includes(initial);
    item.hidden = !show;
  });
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    button.classList.add("active");
    applyFilter(button.dataset.filter);
  });
});

renderCards();

// ---------- "Add a Card" form ----------
// This doesn't save anywhere by itself (the site has no database) --
// it just builds the code for a new CARDS entry so it's easy to copy
// into cards.js by hand.
const addCardForm = document.getElementById("addCardForm");
const addCardOutput = document.getElementById("addCardOutput");
const cardCodeOutput = document.getElementById("cardCodeOutput");
const copyCodeButton = document.getElementById("copyCodeButton");
const copyStatus = document.getElementById("copyStatus");

// Escape quotes/backslashes so the text drops safely into a JS string literal
function escapeForCode(text) {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function buildCardSnippet(data) {
  const favoritesCode = data.favorites.map(function (initial) {
    return '"' + initial + '"';
  }).join(", ");

  return (
    "  {\n" +
    '    name: "' + escapeForCode(data.name) + '",\n' +
    '    image: "images/cards/' + escapeForCode(data.image) + '",\n' +
    '    era: "' + escapeForCode(data.era) + '",\n' +
    '    region: "' + escapeForCode(data.region) + '",\n' +
    '    rarity: "' + escapeForCode(data.rarity) + '",\n' +
    '    set: "' + escapeForCode(data.set) + '",\n' +
    '    details: "' + escapeForCode(data.details) + '",\n' +
    "    favorites: [" + favoritesCode + "],\n" +
    "  },"
  );
}

if (addCardForm) {
  addCardForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const favorites = Array.from(
      addCardForm.querySelectorAll('input[name="favorite"]:checked')
    ).map(function (checkbox) {
      return checkbox.value;
    });

    const imageFilename = document.getElementById("cardImage").value.trim() || "placeholder.svg";

    const snippet = buildCardSnippet({
      name: document.getElementById("cardName").value.trim(),
      image: imageFilename,
      era: document.getElementById("cardEra").value.trim(),
      region: document.getElementById("cardRegion").value.trim(),
      rarity: document.getElementById("cardRarity").value.trim(),
      set: document.getElementById("cardSet").value.trim(),
      details: document.getElementById("cardDetails").value.trim(),
      favorites: favorites,
    });

    cardCodeOutput.value = snippet;
    addCardOutput.hidden = false;
    copyStatus.textContent = "";
    addCardOutput.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  copyCodeButton.addEventListener("click", function () {
    cardCodeOutput.select();
    navigator.clipboard
      .writeText(cardCodeOutput.value)
      .then(function () {
        copyStatus.textContent = "Copied!";
      })
      .catch(function () {
        copyStatus.textContent = "Couldn't auto-copy -- text is selected, press Ctrl+C.";
      });
  });
}
