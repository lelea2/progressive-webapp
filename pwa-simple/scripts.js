(() => {
  const HIDDEN_CLASS = 'app-popover--hidden';
  const DANCE_IMAGES = [
    'totoro1.gif',
    'totoro2.gif',
    'totoro3.gif',
    'totoro4.gif',
    'totoro5.gif',
    'totoro6.gif'
  ];

  const popover = document.querySelector('.app-popover');
  const image = popover.querySelector('.app-popover__image');
  const closeButton = document.querySelector('.app-popover__close');
  const openButton = document.querySelector('.button');

  const getRandomIndex = arr => Math.floor(Math.random() * arr.length);

  openButton.addEventListener('click', event => {
    image.src = `./images/${DANCE_IMAGES[getRandomIndex(DANCE_IMAGES)]}`;
    popover.classList.remove(HIDDEN_CLASS);
  });

  closeButton.addEventListener('click', event => {
    popover.classList.add(HIDDEN_CLASS);
  });
})();
