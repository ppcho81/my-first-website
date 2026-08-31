// ===== Favorite Pokemon Cards =====
// To add a real card: take a photo, save it in the images/cards folder,
// then add a new object to the CARDS list below with that image's path
// and the card's details. "favorites" can list any mix of "M" (Micah),
// "Z" (Zachariah), and "H" (Howie) -- a card can belong to more than one!

const CARDS = [
  {
    name: "Charizard",
    image: "images/cards/placeholder.svg",
    era: "Vintage (WOTC)",
    region: "Kanto",
    rarity: "Rare Holo",
    set: "Base Set (1999)",
    details: "1st Edition Shadowless -- the card that started the whole collection.",
    favorites: ["M", "H"],
  },
  {
    name: "Umbreon VMAX",
    image: "images/cards/placeholder.svg",
    era: "Sword & Shield",
    region: "Johto",
    rarity: "Alternate Art Secret Rare",
    set: "Evolving Skies",
    details: "Micah's prized pull straight out of a booster box.",
    favorites: ["M"],
  },
  {
    name: "Pikachu",
    image: "images/cards/placeholder.svg",
    era: "Scarlet & Violet",
    region: "Kanto",
    rarity: "Common",
    set: "151",
    details: "Zachariah's favorite, because Pikachu is his favorite Pokemon.",
    favorites: ["Z"],
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
