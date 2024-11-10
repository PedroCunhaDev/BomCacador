let folderPath = "./assets/backgrounds/";

if (screen.width < 767) {
  folderPath = folderPath.concat('mobile/');
}

function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const randomImage = getRandomInt(11); 

const bg = document.getElementById("bg");

bg.style.backgroundImage = "radial-gradient(rgba(0, 0, 0, .5), rgba(0, 0, 0, .6)), url(" + folderPath + randomImage + ".jpg)";
bg.style.backgroundSize = 'cover';

bg.style.animation = 'gradientAnimation 1s';

const message = document.getElementById('message');
const username = getCookie('username');

if (username) {
  const anchor = document.createElement('a');
  anchor.id = 'username';
  anchor.textContent = username;
  anchor.href = './p/conta.html';
  message.textContent = 'Olá novamente, ';
  message.appendChild(anchor);
}

const slogan = document.getElementById("slogan");

let slogans = [
  "Domine a Arte da Caça: Teste os seus Conhecimentos, Brilhe no Exame!",
  "Estude com Confiança, Caçe com Segurança: Prepare-se Aqui!",
  "Dê o Tiro Certo: Estude, Aprenda e obtenha a sua Carta de Caçador!",
  "Da Teoria à Prática: A sua Jornada Rumo à Carta de Caçador Começa Aqui!",
];

const randomSlogan = getRandomInt(4);

slogan.textContent = slogans[randomSlogan];

var odometer = new Odometer({
  el: document.getElementById('odometer'),
  value: 0
});

odometer.render();

var currentValue = 0;
  currentValue += 506; // Alterar para número de questões no JSON

  function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function handleScroll() {
  if (isElementInViewport(odometer.el)) {
    odometer.update(currentValue);
    removeEventListener("scroll", handleScroll);
  }
}

addEventListener("scroll", handleScroll);