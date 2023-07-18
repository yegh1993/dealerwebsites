/**
 * ---------------------------------------------------
 *                     RANGE                         -
 * ---------------------------------------------------
 */

const range = document.querySelectorAll('.range-slider span input')
progress = document.querySelector('.range-slider .progress')
let gap = 0.1
const inputValue = document.querySelectorAll('.numberVal input')
const priceValue = document.getElementById('dealer-slider-amount-1')

range.forEach((input) => {
  input.addEventListener('input', (e) => {
    let minRange = parseInt(range[0].value)
    let maxRange = parseInt(range[1].value)

    if (maxRange - minRange < gap) {
      if (e.target.className === 'range-min') {
        range[0].value = maxRange - gap
      } else {
        range[1].value = minRange + gap
      }
    } else {
      progress.style.left = (minRange / range[0].max) * 100 + '%'
      progress.style.right = 100 - (maxRange / range[1].max) * 100 + '%'
      inputValue[0].value = minRange
      inputValue[1].value = maxRange
      priceValue.value = `$${minRange} - $${maxRange}`
    }
  })
})

/**
 * ---------------------------------------------------
 *                     SWIPER                        -
 * ---------------------------------------------------
 */

const swiper = new Swiper('.swiper', {
  // Optional parameters
  loop: true,

  // If we need pagination
  // pagination: {
  //   el: '.swiper-pagination',
  // },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  // scrollbar: {
  //   el: '.swiper-scrollbar',
  // },
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // when window width is >= 1024px
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },

    // when window width is >= 1440px
    1440: {
      slidesPerView: 4,
      spaceBetween: 40,
    },
  },
})

const swiper_review = new Swiper('.swiper-review', {
  // Optional parameters
  loop: true,
  autoplay: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  // navigation: {
  //   nextEl: '.swiper-button-next',
  //   prevEl: '.swiper-button-prev',
  // },

  // And if we need scrollbar
  // scrollbar: {
  //   el: '.swiper-scrollbar',
  // },
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    // when window width is >= 768px
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    // when window width is >= 1024px
    1024: {
      slidesPerView: 3,
      spaceBetween: 30,
    },

    // when window width is >= 1440px
    // 1440: {
    //   slidesPerView: 4,
    //   spaceBetween: 40,
    // },
  },
})

const swiper_cover = new Swiper('.swiper-cover', {
  // Optional parameters
  loop: true,
  autoplay: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },
  autoplay: {
    delay: 5000,
  },
})

/**
 * ---------------------------------------------------
 *                TEXT - ANIMATION - CAR 5           -
 * ---------------------------------------------------
 */

var textWrapper = document.querySelector('.cars-five-sub-head')
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
)

anime
  .timeline({ loop: true })
  .add({
    targets: '.cars-five-sub-head .letter',
    translateY: [-400, 0],
    easing: 'easeOutExpo',
    duration: 1400,
    delay: (el, i) => 60 * i,
    autoplay: true,
  })
  .add({
    targets: '.cars-five-sub-head',
    opacity: 0,
    duration: 1400,
    easing: 'easeOutExpo',
    delay: 1500,
    autoplay: true,
  })

var textWrapper = document.querySelector('.cars-five-head')
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
)
anime
  .timeline({ loop: true })
  .add({
    targets: '.cars-five-head .letter',
    translateY: [-400, 0],
    easing: 'easeOutExpo',
    duration: 1400,
    delay: (el, i) => 60 * i,
    autoplay: true,
  })
  .add({
    targets: '.cars-five-head',
    opacity: 0,
    duration: 1400,
    easing: 'easeOutExpo',
    delay: 1500,
    autoplay: true,
  })

/**
 * ---------------------------------------------------
 *                TEXT - ANIMATION - CAR 2           -
 * ---------------------------------------------------
 */

var textWrapper = document.querySelector('.cars-two-sub-head')
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
)

anime
  .timeline({ loop: true })
  .add({
    targets: '.cars-two-sub-head .letter',
    translateY: [-400, 0],
    easing: 'easeOutExpo',
    duration: 1400,
    delay: (el, i) => 60 * i,
    autoplay: true,
  })
  .add({
    targets: '.cars-two-sub-head',
    opacity: 0,
    duration: 1400,
    easing: 'easeOutExpo',
    delay: 1500,
    autoplay: true,
  })

var textWrapper = document.querySelector('.cars-two-head')
textWrapper.innerHTML = textWrapper.textContent.replace(
  /\S/g,
  "<span class='letter'>$&</span>"
)
anime
  .timeline({ loop: true })
  .add({
    targets: '.cars-two-head .letter',
    translateY: [-400, 0],
    easing: 'easeOutExpo',
    duration: 1400,
    delay: (el, i) => 60 * i,
    autoplay: true,
  })
  .add({
    targets: '.cars-two-head',
    opacity: 0,
    duration: 1400,
    easing: 'easeOutExpo',
    delay: 1500,
    autoplay: true,
  })
