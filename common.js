/**
 * ---------------------------------------------------
 *                     RANGE                         -
 * ---------------------------------------------------
 */

const range = document.querySelectorAll('.range-slider span input')
let gap = 0

range.forEach((input) => {
  input.addEventListener('input', (e) => {

    let progress = e.target.parentElement.parentElement.querySelector(
      '.progress'
    );

    let inputValue = e.target.parentElement.parentElement.parentElement.querySelectorAll('.numberVal input')
    const actualValue = e.target.parentElement.parentElement.parentElement.querySelector('.actualvalue input')


    const isPrice = actualValue.classList.contains('myPrice')

    let newData = e.target.parentElement.parentElement.querySelectorAll('span input')


    let minRange = parseInt(newData[0].value)
    let maxRange = parseInt(newData[1].value)

    console.log(minRange, maxRange, gap)

    if (maxRange - minRange < gap) {
      if (e.target.className === 'range-min') {
        newData[0].value = maxRange - gap
      } else {
        newData[1].value = minRange + gap
      }
    } else {
      progress.style.left =
        ((minRange - newData[0].min) / (newData[0].max - newData[0].min)) * 100 + '%'
      progress.style.right =
        100 -
        ((maxRange - newData[0].min) / (newData[0].max - newData[0].min)) * 100 +
        '%'

      inputValue[0].value = minRange
      inputValue[1].value = maxRange

      if (isPrice) {

        actualValue.value = `${minRange.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        })} - ${maxRange.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        })}`

      }
      else {

        actualValue.value = `${minRange} - ${maxRange}`
      }
    }
  })
})


/**
 * ---------------------------------------------------
 *                      CUSTOM SELECT                -
 * ---------------------------------------------------
 */
function showCustomSelect() {
  var x, i, j, l, ll, selElmnt, a, b, c
  /*look for any elements with the class "custom-select":*/
  x = document.getElementsByClassName('custom-select')
  l = x.length
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName('select')[0]
    ll = selElmnt.length
    /*for each element, create a new DIV that will act as the selected item:*/

    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement('DIV')
    a.setAttribute('class', 'select-selected')
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML
    x[i].appendChild(a)
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement('DIV')
    b.setAttribute('class', 'select-items select-hide')

    for (j = 1; j < ll; j++) {
      /*for each option in the original select element,
      create a new DIV that will act as an option item:*/
      c = document.createElement('DIV')
      c.innerHTML = selElmnt.options[j].innerHTML
      c.addEventListener('click', function (e) {
        /*when an item is clicked, update the original select box,
          and the selected item:*/
        var y, i, k, s, h, sl, yl
        s = this.parentNode.parentNode.getElementsByTagName('select')[0]
        sl = s.length
        h = this.parentNode.previousSibling
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i
            h.innerHTML = this.innerHTML
            y = this.parentNode.getElementsByClassName('same-as-selected')
            yl = y.length
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute('class')
            }
            this.setAttribute('class', 'same-as-selected')
            break
          }
        }
        s.dispatchEvent(new Event('change'))
        h.click()
      })
      b.appendChild(c)
    }
    x[i].appendChild(b)
    a.addEventListener('click', function (e) {
      /*when the select box is clicked, close any other select boxes,
        and open/close the current select box:*/
      e.stopPropagation()
      closeAllSelect(this)
      this.nextSibling.classList.toggle('select-hide')
      this.classList.toggle('select-arrow-active')
    })
  }
  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
    except the current select box:*/
    var x,
      y,
      i,
      xl,
      yl,
      arrNo = []
    x = document.getElementsByClassName('select-items')
    y = document.getElementsByClassName('select-selected')
    xl = x.length
    yl = y.length
    for (i = 0; i < yl; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i)
      } else {
        y[i].classList.remove('select-arrow-active')
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide')
      }
    }
  }
  /*if the user clicks anywhere outside the select box,
  then close all select boxes:*/
  document.addEventListener('click', closeAllSelect)
}



/**
 * ---------------------------------------------------
 *                TO TOP CAR                         -
 * ---------------------------------------------------
 */
function reveal() {
  var reveals = document.querySelectorAll('.reveal')
  const YValueToShow = 450

  for (var i = 0; i < reveals.length; i++) {
    if (window.scrollY > YValueToShow) {
      reveals[i].classList.add('active')
    } else {
      reveals[i].classList.remove('active')
    }
  }
}

window.addEventListener('scroll', reveal)

/**
 * ---------------------------------------------------
 *                  NAV SEARCH                       -
 * ---------------------------------------------------
 */

function HandleSearch(event) {
  const value = event.target.value
  const searchIcon = document.getElementById('nav-search')
  const loadingIcon = document.getElementById('nav-loader')

  const showLoader = () => {
    searchIcon.classList.add('d-none')
    loadingIcon.classList.remove('d-none')
  }

  const hideLoader = () => {
    searchIcon.classList.remove('d-none')
    loadingIcon.classList.add('d-none')
  }

  if (value.length < 3) {
    hideLoader()
    document.getElementById('vehicle-list').innerHTML = ''
    return false
  }

  showLoader()

  // Call the API here
  fetchVehicles(value).then((res) => {
    hideLoader()
  })
}

async function fetchVehicles(value) {
  const dealerId = '1'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'
  try {
    const response = await fetch(
      `${apiUrl}/api/vehicles?idDealership=${dealerId}&query=${value}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )
    const vehicles = await response.json()
    console.log(vehicles.results)
    displayVehicles(vehicles.results)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

function displayVehicles(vehicles) {
  const vehicle = (item) => `
  <div
  class="d-flex align-items-center mt-3 dropdown-item
  style="cursor: pointer"
>
  <img
    src=${item.images[0]?.url}
    style="width: 40px; height: 40px; object-fit: cover;"
  />
  <div class="ms-3">${item.year} ${item.model}</div>
</div>
  `
  const html = vehicles.map((item) => vehicle(item)).join('')

  document.getElementById('vehicle-list').insertAdjacentHTML('beforeend', html)
}

/**
 * ---------------------------------------------------
 *            FOOTER FORM SUBSCRIBER                 -
 * ---------------------------------------------------
 */

function Subscribe(event) {
  event.preventDefault()
  event.stopPropagation()
  const value = document.getElementById('subscriber_email').value

  const subscriber_text = document.getElementById('subscriber-text')
  const subscriber_loader = document.getElementById('subscriber-loader')
  const subscriber_error = document.getElementById('subscriber-error')

  subscriber_error.innerHTML = ''

  if (!value) return (subscriber_error.innerHTML = 'Please add email address')

  const showLoader = () => {
    subscriber_text.classList.add('d-none')
    subscriber_loader.classList.remove('d-none')
  }

  const hideLoader = () => {
    subscriber_text.classList.remove('d-none')
    subscriber_loader.classList.add('d-none')
  }

  showLoader()
  // handle API here

  hideLoader()

  return (subscriber_error.innerHTML = 'Something went worng while subscribing')
}

/**
 * ---------------------------------------------------
 *                 PAGE LOADER                       -
 * ---------------------------------------------------
 */

function PageLoader(show) {
  if (show) document.getElementById('page-loader').classList.remove('d-none')
  else document.getElementById('page-loader').classList.add('d-none')
}

/**
 * ---------------------------------------------------
 *                 FINANCE FORM                      -
 * ---------------------------------------------------
 */

const finance = {}

function HandleInputValues(event) {
  const { name, value } = event.target
  finance[name] = value
}

function calculateMonthlyPayment(event) {
  event.stopPropagation()
  event.preventDefault()

  // Calculate the loan amount after deducting the down payment
  var principal = finance.loanAmount - finance.downPayment

  // Convert the annual interest rate to a monthly rate
  var monthlyInterestRate = finance.interestRate / (12 * 100)

  // Calculate the monthly payment using the formula for a fixed-rate mortgage
  var numerator =
    principal *
    monthlyInterestRate *
    Math.pow(1 + monthlyInterestRate, finance.periodInMonths)
  var denominator =
    Math.pow(1 + monthlyInterestRate, finance.periodInMonths) - 1
  var monthlyPayment = numerator / denominator

  // Round the monthly payment to two decimal places
  monthlyPayment = Math.round(monthlyPayment * 100) / 100

  document.getElementById('payment_result').innerHTML =
    monthlyPayment.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    }) + '<sup>/mo</sup>'
}

function ResetForm(event) {
  event.stopPropagation()
  event.preventDefault()
  const form = document.getElementById('finance_form')
  form.reset()
}

/**
 * ---------------------------------------------------
 *                 SCROLL TOP                        -
 * ---------------------------------------------------
 */

function scrollToTop() {
  // Scroll to the top of the page with smooth behavior
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}

/**
 * ---------------------------------------------------
 *              CAMEL CASE SEPERATOR                 -
 * ---------------------------------------------------
 */
function separateCamelCase(input) {

  if (!input) return ''
  return input.replace(/([a-z])([A-Z])/g, '$1 $2')
}





/**
 * ---------------------------------------------------
 *              CAMEL CASE CONVERT                 -
 * ---------------------------------------------------
 */
function toCamelCase(inputString) {
  const words = inputString.split(' ');
  const camelCaseWords = [words[0].toLowerCase()];

  for (let i = 1; i < words.length; i++) {
    camelCaseWords.push(words[i][0].toUpperCase() + words[i].slice(1).toLowerCase());
  }

  return camelCaseWords.join('');
}

/**
/**
 * ---------------------------------------------------
 *              CAR SEARCH FILTERS                   -
 * ---------------------------------------------------
 */
async function fetchFilters() {
  const dealerId = '1'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'
  try {
    const response = await fetch(
      `${apiUrl}/api/vehicles/findFilters?idDealership=${dealerId}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )
    return await response.json()
  } catch (error) {
    console.error('Error fetching filters:', error)
    return
  }
}
