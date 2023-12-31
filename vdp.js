let showComment = true
let schedule = {}
let local_vehicle = {}
const filters = {}
var initialPageNumber = 1
var itemsPerPage = 12
var sortBy = 'name'
var sortingOrder = 'asc'
var local_vehicles = []

async function fetchVehicleDetails() {
  PageLoader(true)
  const urlParams = new URLSearchParams(window.location.search)
  const vehicleId = urlParams.get('id')
  if (!vehicleId) {
    console.error('Vehicle ID not provided')
    return (window.location.href = '/')
  }

  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  try {
    const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}`, {
      headers: {
        Authorization: `Bearer ${dealerApiToken}`,
      },
    })
    const vehicle = await response.json()
    local_vehicle = vehicle
    displayVehicle(vehicle)
    displayVehicleDetails(vehicle)
    displayStickyTop(vehicle)
    //displayPayOnce(vehicle)
    calculateMonthlyPaymentVehicle(vehicle)
    PageLoader(false)

    fetchVehicles()
  } catch (error) {
    console.error('Error fetching vehicle details:', error)
    PageLoader(false)
  }
}

function displayStickyTop(vehicle) {
  const html = `
  <div class="car-fixed-title flex-row align-items-center justify-content-between">
  <div class="car-title-left">
    <div>
      <p class="sc-1647e4d6-1 DclM">${vehicle.year} ${vehicle.make} ${
    vehicle.model
  }</p>
      <p class="sc-1647e4d6-1 DclM hide-in-mobile">${vehicle.trim}</p>
    </div>
  </div>
  <div class="car-fixed-btn d-block d-md-none mt-2">
  ${
    vehicle.status == 'ACTIVE'
      ? ` <button
    type="button"
    data-bs-toggle="modal"
    data-bs-target="#scheduleModal"
  >
    Get Started
  </button>`
      : ''
  }
 
</div>
</div>
<div class="car-fixed-price">
  <div class="flex">
    <div class="car-flex-col">
      <div class="price car-price fixed-bar">
      <!-- <span class="old-price"> $5,200.00</span
        > -->
        <span class="new-price"> ${vehicle.price?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}</span>
      </div>
      <p class="car-flex-miles hide-in-mobile">${vehicle.mileage?.toLocaleString()} miles</p>
    </div>
  </div>
</div>
  `

  document.getElementById('sticky-top').insertAdjacentHTML('afterbegin', html)
}

function displayVehicle(vehicle) {
  const cover_images = [...vehicle.images]

  const getGridAreas = () => {
    if (cover_images.length < 2) return "'sideA main sideB' 'sideA main sideB'"
    if (cover_images.length < 3) return "'main sideA' 'main sideA'"
    if (cover_images.length >= 3) return "'main main sideA' 'main main sideB'"
  }
  const carTitle = vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model
  document.getElementById('active_car_title').innerHTML = carTitle

  const html = `
  <div class="hero-banner-u">
  <div class="certified-text">LCT AUTO LLC CERTIFIED</div>
  <div class="car-main-body">
    <div class="car-fixed-title">
      <div class="car-title-left">
        <div>
          <h2 class="car-title-new">${carTitle}</h2>
          <div class="car-term-miles">
            <span class="block m:inline">${vehicle.trim}</span>
            <span class="d-none d-md-block">•</span>
            <span data-qa="mileage">${vehicle.mileage?.toLocaleString()} miles</span>
          </div>
        </div>
      </div>
    </div>
    <div class="car-fixed-price d-block d-md-flex">
      <div class="flex justify-content-end">
        <div class="car-title-col">
          <div class="price car-price hero-bar">
            <!-- <span class="old-price"> $5,200.00</span> -->
            <span class="new-price">${vehicle.price?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}</span>
          </div>
        </div>
      </div>
      <div class="car-fixed-btn d-block d-md-none text-end">
      ${
        vehicle.status == 'ACTIVE'
          ? `
          <a
        href="/inventory.html?bodyStyle=${vehicle.bodyStyle}"
        class="view-more-btn me-0 mt-2"
        type="button"
      >View More Cars</a
      >
          <button
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#scheduleModal"
      class="mt-3"
    >
      Get Started
    </button>`
          : ''
      }

    </div >
      </div >
    <div class="car-fixed-btn hide-in-mobile">
      <a
        href="/inventory.html?bodyStyle=${vehicle.bodyStyle}"
        class="view-more-btn"
        type="button"
      >View More Cars</a
      >
      ${
        vehicle.status == 'ACTIVE'
          ? `<button
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#scheduleModal"
    >
      Get Started
    </button>`
          : ''
      }
     
    </div>
  </div >
</div >

<div class="car-gallery-images">
  <div class="gallery-preview-images">
  <div class="grid-view row-gap">
    <div class="position-relative">
      <div class="grid-view grid-area" style="
        grid-template-areas: ${getGridAreas()};
        position: relative;
      ">
        <img
            class="gallery-image click-to-slick"
            style="filter: blur(10px); position: absolute; padding: 5px"
            data-slic="0"
            src=${cover_images[0]?.url}
            alt=""
         />
      ${cover_images
        .map((item, idx) =>
          idx < 3
            ? `
          <div role="button" onclick="MorePhotos(this)" class="h-100 item${idx}" style="
          position: relative;
          z-index: 1;
          ">
          <img
              class="gallery-image click-to-slick"
              data-slic="0"
              src=${item?.url}
              alt=""
            />
          </div>`
            : ''
        )
        .join('')}
          <div class="total-car-images-btn position-absolute" onclick="MorePhotos(this)"
          >
            ${
              cover_images.length - 3 > 0 ? '+' + (cover_images.length - 3) : ''
            } <span class="elementor-hidden-mobile">Photos</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- Added Call and Text buttons -->
<div class="contact-buttons">
    <a href="javascript:void(0)" id="callButton" onclick="handleCallClick()">
        <i class="fas fa-phone"></i> Call
    </a>
    <button id="textButton" onclick="handleTextClick()">
        <i class="fas fa-comment"></i> Text
    </button>
</div>



  <!--cars -->
    <div id="gallery" style="display: none">
      ${vehicle.images
        ?.map(
          (item) => `<img
      src=${item.url}
      data-bp=${item.url}
      alt="2004 Isuzu Rodeo 3.5L S 2WD"
    />`
        )
        .join('')}
    </div>
</div >
    `
  document.getElementById('car-details').insertAdjacentHTML('beforeend', html)

  document
    .getElementsByTagName('title')[0]
    .insertAdjacentHTML(
      'beforeend',
      `${vehicle.year} ${vehicle.make} ${vehicle.model} `
    )

  document
    .getElementById('vehicle-title')
    .insertAdjacentHTML(
      'beforeend',
      `${vehicle.year} ${vehicle.make} ${vehicle.model} `
    )

  if (vehicle.status !== 'ACTIVE') {
    document.getElementById('car-sold').classList.remove('d-none')
    document.getElementById('myBtn').classList.add('d-none')
  } else document.getElementById('car-sold').classList.add('d-none')
}

function displayVehicleDetails(vehicle) {
  displayFirstTabVehicleDetails(vehicle)
  displaySecondTabFeaturesAndOptions(vehicle)
}

function displayFirstTabVehicleDetails(vehicle) {
  const html = `
    <ul class="car-attributes mb-0" >
    <li class="car_year">
      <span class="car-year">Year</span>
      <strong class="text-right">${vehicle.year}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Make</span>
      <strong class="text-right">${vehicle.make}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Model</span>
      <strong class="text-right">${vehicle.model}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Trim</span>
      <strong class="text-right">${vehicle.trim}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Availability</span>
      <strong class="text-right">${
        vehicle.status === 'ACTIVE' ? 'In Store' : 'N/A'
      }</strong>
    </li>
    <li class="car_year">
      <span class="car-year">VIN Number</span>
      <strong class="text-right">${vehicle.vin}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Stock Number</span>
      <strong class="text-right">${vehicle.stockNumber}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Body Style</span>
      <strong class="text-right">${vehicle.bodyStyle}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Condition</span>
      <strong class="text-right">${vehicle.condition}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Drivetrain</span>
      <strong class="text-right">${vehicle.driveTrain}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Engine</span>
      <strong class="text-right">${vehicle.engineShape}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Transmission</span>
      <strong class="text-right">${vehicle.transmission}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Exterior Color</span>
      <strong class="text-right">${vehicle.exteriorColor}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Interior Color</span>
      <strong class="text-right">${vehicle.interiorColor}</strong>
    </li>
    <li class="car_year">
      <span class="car-year">Fuel Type</span>
      <strong class="text-right">${vehicle.fuelType}</strong>
    </li>
  </ul >
    <div class="row fuel-effeincy">
      <div class="col-lg-6 col-md-6 brder p-3">
        <div id="" class="cd-vehicle-fuel-efficiency">
          <div class="details-form contact-2 details-weight">
            <div class="fuel-efficiency-detail fuel-efficiency2">
              <div class="heading">
                <h4>Fuel Economy Rating</h4>
              </div>
              <div class="row align-items-end mt-4">
                <div class="col-4">
                  <label>City</label>
                  <span class="city_mpg">18</span>
                </div>
                <div class="col-4">
                  <i class="fa-solid fa-gas-pump fa-3x"></i>
                </div>
                <div class="col-4">
                  <label>Highway</label>
                  <span class="highway_mpg">23</span>
                </div>
                <div class="col-sm-12 mt-4 actual">
                  Actual rating will vary with options, driving
                  conditions, driving habits and vehicle condition
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="colo-lg-6 col-md-6 p-3">
        <div id="" class="cd-vehicle-fuel-efficiency">
          <div class="details-form contact-2 details-weight">
            <div class="fuel-efficiency-detail fuel-efficiency2">
              <div class="heading">
                <h4>Vehicle History Report</h4>
              </div>
              <div class="row justify-content-center mt-4 mb-3">
  <div class="col-4" style="text-align: left; width: 90px;">
    <div class="carvax-logo">
      <img src="/crafax.png" alt="Carfax Logo" width="90">
    </div>
  </div>
  <div class="col-8 d-flex justify-content-center align-items-center flex-column text-center">
  <h6>Get a Free Vehicle History Report</h6>
  <p>Backed by Federal Vehicle Title Data</p>
  </div>
</div>
              <div class="col-xs-12 mt-0 text-center">
                <div class="get-report-btn">
                <button type="button" data-bs-toggle="modal" data-bs-target="#reportModal">Get My Free Report</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
  document
    .getElementById('vehicle-tab-details')
    ?.insertAdjacentHTML('beforeend', html)

  document
    .getElementById('vehicle-accordion-details')
    ?.insertAdjacentHTML('beforeend', html)
}

function displaySecondTabFeaturesAndOptions(vehicle) {
  const yes = `<i i class="fas fa-check" ></i > `
  const no = `<i i class="fa-solid fa-xmark" ></i > `

  html = `
    <div class="masonry-main cd-vehicle-features" >
      <ul class="list-style-1 list-col-3">
        ${vehicle.options
          .filter((option) => option.installed)
          .map(
            (option) =>
              `<li>
                  ${option.installed ? yes : no}
                  ${option.label}
                  </li>`
          )
          .join('')}
      </ul>
            </div >
    `
  document
    .getElementById('profile-tab-details')
    .insertAdjacentHTML('beforeend', html)

  document
    .getElementById('profile-accordion-details')
    .insertAdjacentHTML('beforeend', html)
}

//Get My Free Report Form Handling
document.addEventListener('DOMContentLoaded', function () {
  const reportForm = document.getElementById('reportForm')
  const submitButton = document.getElementById('submitReportForm')
  const consentCheckbox = document.getElementById('consentCheckbox') // Added this line

  // Disable the submit button by default
  submitButton.disabled = true

  // Listen for input changes on the form
  reportForm.addEventListener('input', function () {
    const formData = new FormData(reportForm)
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const checkbox = consentCheckbox.checked

    // Enable the submit button only if all fields are filled and checkbox is checked
    if (firstName && lastName && email && checkbox) {
      submitButton.disabled = false
    } else {
      submitButton.disabled = true
    }

    // Added this block for checkbox styling
    if (consentCheckbox.disabled) {
      consentCheckbox.style.opacity = '0.5'
      consentCheckbox.style.cursor = 'not-allowed'
    } else {
      consentCheckbox.style.opacity = ''
      consentCheckbox.style.cursor = ''
    }
    // End of added block
  })

  // Attach event listener to "Get My Free Report" submit button
  submitButton.addEventListener('click', function () {
    // Collect form data
    const formData = new FormData(reportForm)
    // Do something with formData, like sending it to a server
    // ...

    // Then show the report
    window.open(
      'http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DVW_1&vin=' +
        vehicle.vin,
      '_blank'
    )

    // Close the modal
    var myModal = new bootstrap.Modal(document.getElementById('reportModal'))
    myModal.hide()
  })
})

async function handleCallClick() {
  // Use a "tel:" link to initiate the call
  const dealerNumber = '1234567890' // Replace with the actual dealer number
  window.location.href = `tel:${dealerNumber}`

  // Send the information to the backend for statistics
  try {
    await fetch(`${apiUrl}/api/callEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dealerApiToken}`,
      },
      body: JSON.stringify({ vehicleId: local_vehicle.id, eventType: 'call' }),
    })
  } catch (error) {
    console.error('Error sending call event:', error)
  }
}

async function handleTextClick() {
  // Construct the natural inquiry message with the exterior color
  const textContent = `Hi, I came across the ${local_vehicle.exteriorColor} ${local_vehicle.year} ${local_vehicle.make} ${local_vehicle.model} on your website. Is it still available?`

  // Open the default text app with the inquiry message
  window.open(`sms:?&body=${encodeURIComponent(textContent)}`)

  // Send the information to the backend for statistics
  try {
    await fetch(`${apiUrl}/api/textEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dealerApiToken}`,
      },
      body: JSON.stringify({ vehicleId: local_vehicle.id, eventType: 'text' }),
    })
  } catch (error) {
    console.error('Error sending text event:', error)
  }
}

/*function displayPayOnce(vehicle) {
  const price = vehicle.price || 0
  const tax = price * 0.072
  const total = price + tax

  const html = `
    <div class="table-price">
  <p class="table-price-p">${total.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })}</p>
  <p class="t-body-m">&nbsp;</p>
</div >
<ul class="price-list-table">
  <li class="taxable-list">
    <span>Vehicle Price</span><span>${price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })}</span>
  </li>
  <li class="taxable-list">
    <span>Tax, Title, Registration</span><span>${tax.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })}</span>
  </li>
</ul>
<ul class="price-list-total">
  <li class="taxable-list">
    <span>Total Cash Price</span>
    <span>${total.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })}</span>
  </li>
</ul>
  `

  document.getElementById('pay-once').insertAdjacentHTML('afterbegin', html)
}
*/

function MorePhotos(element) {
  BigPicture({
    el: element,
    gallery: '#gallery',
  })
}

function handleInputChange(event) {
  const { name, value } = event.target
  schedule[name] = value
  console.log(schedule)
}

function toggleErrorClass(element, condition) {
  if (condition) {
    element.classList.add('input-error')
  } else {
    element.classList.remove('input-error')
  }
}

function formatZIPCode(event) {
  // Remove non-digits
  event.target.value = event.target.value.replace(/\D/g, '')
  // Limit to 5 digits
  event.target.value = event.target.value.slice(0, 5)
}

function validateZIPCode(event) {
  const zip = event.target.value
  const regex = /^\d{5}$/ // Matches 5-digit ZIP codes

  if (!regex.test(zip)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function validateEmail(event) {
  const email = event.target.value
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

  if (!regex.test(email)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function formatPhoneNumber(event) {
  // Remove non-digits
  let phoneNumber = event.target.value.replace(/\D/g, '')
  // Limit to 10 digits
  phoneNumber = phoneNumber.slice(0, 10)
  // Format as (123) 456-7890
  if (phoneNumber.length > 6) {
    phoneNumber =
      '(' +
      phoneNumber.slice(0, 3) +
      ') ' +
      phoneNumber.slice(3, 6) +
      '-' +
      phoneNumber.slice(6)
  } else if (phoneNumber.length > 3) {
    phoneNumber = '(' + phoneNumber.slice(0, 3) + ') ' + phoneNumber.slice(3)
  } else if (phoneNumber.length > 0) {
    phoneNumber = '(' + phoneNumber
  }
  event.target.value = phoneNumber
}

function validatePhoneNumber(event) {
  const phone = event.target.value
  const regex = /^\(\d{3}\) \d{3}-\d{4}$/

  if (!regex.test(phone)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function toggleErrorClass(element, condition) {
  if (condition) {
    element.classList.add('input-error')
  } else {
    element.classList.remove('input-error')
  }
}

function formatZIPCode(event) {
  // Remove non-digits
  event.target.value = event.target.value.replace(/\D/g, '')
  // Limit to 5 digits
  event.target.value = event.target.value.slice(0, 5)
}

function validateZIPCode(event) {
  const zip = event.target.value
  const regex = /^\d{5}$/ // Matches 5-digit ZIP codes

  if (!regex.test(zip)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function validateEmail(event) {
  const email = event.target.value
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

  if (!regex.test(email)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function formatPhoneNumber(event) {
  // Remove non-digits
  let phoneNumber = event.target.value.replace(/\D/g, '')
  // Limit to 10 digits
  phoneNumber = phoneNumber.slice(0, 10)
  // Format as (123) 456-7890
  if (phoneNumber.length > 6) {
    phoneNumber =
      '(' +
      phoneNumber.slice(0, 3) +
      ') ' +
      phoneNumber.slice(3, 6) +
      '-' +
      phoneNumber.slice(6)
  } else if (phoneNumber.length > 3) {
    phoneNumber = '(' + phoneNumber.slice(0, 3) + ') ' + phoneNumber.slice(3)
  } else if (phoneNumber.length > 0) {
    phoneNumber = '(' + phoneNumber
  }
  event.target.value = phoneNumber
}

function validatePhoneNumber(event) {
  const phone = event.target.value
  const regex = /^\(\d{3}\) \d{3}-\d{4}$/

  if (!regex.test(phone)) {
    event.target.style.borderColor = 'red'
  } else {
    event.target.style.borderColor = '' // Reset border color to default
  }
}

function handleEmailConsentToggle(event) {
  const { id, checked } = event.target
  schedule[id] = checked
  console.log(schedule)
}

function ToggleComment(event) {
  const parent = event.target.parentElement
  const icon = parent.firstElementChild
  const textarea = parent.nextElementSibling
  if (showComment) {
    icon.classList.remove('fa-plus')
    icon.classList.add('fa-minus')
    textarea.classList.remove('d-none')
  } else {
    icon.classList.add('fa-plus')
    icon.classList.remove('fa-minus')
    textarea.classList.add('d-none')
  }
  showComment = !showComment
}

function calculateMonthlyPaymentVehicle(vehicle) {
  const price = vehicle.price || 0
  const tax = price * 0.1
  const total = price + tax

  const loadAmount = total
  const downPayment = 0
  const monthlyPeriod = 69
  const interestRate = [18.98, 27.54]

  const monthlyPayments = interestRate.map((rate) => {
    // Calculate the loan amount after deducting the down payment
    var principal = loadAmount - downPayment

    // Convert the annual interest rate to a monthly rate
    var monthlyInterestRate = rate / (12 * 100)

    // Calculate the monthly payment using the formula for a fixed-rate mortgage
    var numerator =
      principal *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, monthlyPeriod)
    var denominator = Math.pow(1 + monthlyInterestRate, monthlyPeriod) - 1
    var monthlyPayment = numerator / denominator

    // Round the monthly payment to two decimal places
    monthlyPayment = Math.round(monthlyPayment * 100) / 100
    return monthlyPayment.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  })

  document
    .getElementById('pay-monthly')
    .insertAdjacentHTML(
      'beforeend',
      `${monthlyPayments[0]} - ${monthlyPayments[1]} `
    )
}

async function scheduleTestDrive(event) {
  console.log('scheduleTestDrive function called')
  event.stopPropagation()
  event.preventDefault()

  document.getElementById('message-loader').classList.remove('d-none')

  const payload = {
    ...schedule,
    vehicleId: local_vehicle.idVehicle,
    leadType: 'Info Request',
    leadSource: 'Dealer Website',
  }

  const dealerId = '1'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  const SaaSApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${dealerApiToken} `,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }

  fetch(
    `${apiUrl} /api/leads / dealership - website - leads / info - request`,
    requestOptions
  )
    .then((res) => {
      console.log('response', res)
      document.getElementById('schedule_form_success').innerHTML =
        'successfully registered'
      document.getElementById('message-loader').classList.add('d-none')
    })
    .catch((err) => {
      document.getElementById('schedule_form_error').innerHTML =
        'something went wrong while registering'
      document.getElementById('message-loader').classList.add('d-none')
    })
}

// const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'

// NOTE: You should avoid storing sensitive tokens in your code. Use environment variables or secure storage.
// const dealerApiToken = 'YOUR_SECURE_TOKEN_HERE'

async function fetchVehicles() {
  const dealerId = '1'

  try {
    // Note: URLSearchParams doesn't natively support array parameters,
    // so we have to handle them manually.
    // let paramsString = `idDealership=${dealerId}`
    // paramsString += `&minPrice=${Math.round(local_vehicle.price / 2)}`
    // paramsString += `&maxPrice=${Math.round(local_vehicle.price * 1.5)}`

    // Handle bodyStyle as an array.
    if (local_vehicle.bodyStyle) {
      paramsString += `&bodyStyle[]=${local_vehicle.bodyStyle}`
    }

    // You can add other styles to this array if needed.
    // paramsString += '&bodyStyle[]=' // Empty value.

    // Handle availability as an array.
    // paramsString += '&availability[]=In Store'
    // paramsString += '&availability[]=' // Empty value.

    const response = await fetch(
      `${apiUrl}/api/vehicles/search?${paramsString}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API returned with status code: ${response.status}`)
    }

    const vehicles = await response.json()

    if (vehicles?.results) {
      local_vehicles = vehicles.results.filter(
        (item) => item.idVehicle !== local_vehicle.idVehicle
      )
    }

    sortItem()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

function sortItem() {
  const sortedVehicle = local_vehicles.sort((a, b) => {
    if (sortingOrder == 'asc') {
      if (sortBy == 'createdAt' || sortBy == 'updatedAt')
        return new Date(a[sortBy]) - new Date(b[sortBy])
      return a[sortBy] - b[sortBy]
    }
    if (sortingOrder == 'desc') {
      if (sortBy == 'createdAt' || sortBy == 'updatedAt')
        return new Date(b[sortBy]) - new Date(a[sortBy])
      return b[sortBy] - a[sortBy]
    }
  })
  local_vehicles = sortedVehicle
  displayItems()
}

function getHTML(vehicle) {
  return `
  <div class="col-sm-6 col-lg-4 mt-3">
  <a href="/vdp.html?id=${vehicle.idVehicle}">
  <div class="car-item">
    <div
      style="width:100%;
      position:relative;
      background: url('${
        vehicle.images ? vehicle.images[0]?.url : '/car7.jpeg'
      }') center center no-repeat;
      background-size:cover;
      padding-bottom: 75%;"
    >
    <!-- <span class="used-tag">Used</span> -->
    ${
      vehicle.status == 'SOLD' || vehicle.status == 'ARCHIVED'
        ? '<span class="sold-tag"></span>'
        : ''
    }
    </div>
    <div class="car-item-content">
      <div class="car-name">${vehicle.year} ${vehicle.make} ${
    vehicle.model
  }</div>
      <div class="car-price">
        <span class="old-price">$14,000.00</span>
        <span class="new-price">
        ${vehicle.price?.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })}
        </span>
      </div>
      <div
        class="d-flex justify-content-between mt-2 car-props"
      >
        <div class="col-6 car-prop">Mileage</div>
        <div class="col-6 car-prop-value">${vehicle.mileage}</div>
      </div>
      <div
        class="d-flex justify-content-between mb-2 car-props"
      >
        <div class="col-6 car-prop">Availablity</div>
        <div class="col-6 car-prop-value">${
          vehicle.status == 'ACTIVE' ? 'In Store' : 'N/A'
        }</div>
      </div>
      <div class="d-flex justify-content-between mt-2" >
        <span  class="custom-btn-light custom-btn-detail">
          <i class="fa-solid fa-link me-1"></i>
          Detail
        </span>
        

        ${
          vehicle.video
            ? `<button class="custom-btn-light custom-btn-detail">
          <i class="fa-solid fa-play me-1"></i>
          Video
        </button>`
            : ''
        }
        </div>
      </div>
    </div>
    </a>
    </div>
  `
}

function displayItems() {
  const itemsToDisplay = local_vehicles.slice(0, 3)

  const car_list_box = document.getElementById('car-list-box')
  car_list_box.innerHTML = ''

  for (let i = 0; i < itemsToDisplay.length; i++) {
    car_list_box.insertAdjacentHTML('beforeend', getHTML(itemsToDisplay[i]))
  }
}

const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'

// NOTE: You should avoid storing sensitive tokens in your code. Use environment variables or secure storage.
const dealerApiToken = 'YOUR_SECURE_TOKEN_HERE'

async function fetchVehicles() {
  const dealerId = '1'

  try {
    // Note: URLSearchParams doesn't natively support array parameters,
    // so we have to handle them manually.
    let paramsString = `idDealership=${dealerId}`
    paramsString += `&minPrice=${Math.round(local_vehicle.price / 2)}`
    paramsString += `&maxPrice=${Math.round(local_vehicle.price * 1.5)}`

    // Handle bodyStyle as an array.
    if (local_vehicle.bodyStyle) {
      paramsString += `&bodyStyle[]=${local_vehicle.bodyStyle}`
    }

    // You can add other styles to this array if needed.
    paramsString += '&bodyStyle[]=' // Empty value.

    // Handle availability as an array.
    paramsString += '&availability[]=In Store'
    paramsString += '&availability[]=' // Empty value.

    const response = await fetch(
      `${apiUrl}/api/vehicles/search?${paramsString}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API returned with status code: ${response.status}`)
    }

    const vehicles = await response.json()

    if (vehicles?.results) {
      local_vehicles = vehicles.results.filter(
        (item) => item.idVehicle !== local_vehicle.idVehicle
      )
    }

    console.log('API, local vehicles', local_vehicles.length)

    sortItem()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

function sortItem() {
  const sortedVehicle = local_vehicles.sort((a, b) => {
    if (sortingOrder == 'asc') {
      if (sortBy == 'createdAt' || sortBy == 'updatedAt')
        return new Date(a[sortBy]) - new Date(b[sortBy])
      return a[sortBy] - b[sortBy]
    }
    if (sortingOrder == 'desc') {
      if (sortBy == 'createdAt' || sortBy == 'updatedAt')
        return new Date(b[sortBy]) - new Date(a[sortBy])
      return b[sortBy] - a[sortBy]
    }
  })
  local_vehicles = sortedVehicle
  displayItems()
}

function getHTML(vehicle) {
  const imageScrollerHtml = vehicle.images
    .map(
      (image, index) => `
  <img src="${image.url}" class="vehicle-image" data-index="${index}" ${
        index !== 0 ? 'style="display: none;"' : ''
      }>
`
    )
    .join('')

  // Calculate the old price
  const oldPrice = vehicle.price * 1.18

  return `
  <div class="col-sm-6 col-md-6 col-lg-4 mt-3">
    <a href="/vdp.html?id=${vehicle.idVehicle}">
      <div class="car-item">
        <div class="vehicle-images">
          <button class="prev-image" onclick="event.preventDefault(); event.stopPropagation(); changeImage(event, -1)"><i class="fas fa-arrow-left"></i></button>
          ${imageScrollerHtml}
          <button class="next-image" onclick="event.preventDefault(); event.stopPropagation(); changeImage(event, 1)"><i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="car-item-content">
          <div class="car-name">${vehicle.year} ${vehicle.make} ${
    vehicle.model
  }</div>
          <div class="car-price">
            <span class="old-price">
              ${oldPrice.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
            <span class="new-price">
              ${vehicle.price?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          </div>
          <div class="d-flex justify-content-between mt-2 car-props">
            <div class="car-prop-icon"><i class="fas fa-tachometer-alt icon"></i></div>
            <div class="car-prop-value">${vehicle.mileage.toLocaleString()} mi</div>
          </div>
          <div class="d-flex justify-content-between mb-2 car-props">
            <div class="car-prop-icon"><i class="fas fa-map-marker-alt icon"></i>Plano, TX</div>
            <div class="car-prop-value"></div>
          </div>
          <div class="flex-container">
            <div class="flex-item">
              <a href="tel:(4692866875)" class="phone-link">(469) 286-6875</a>
            </div>
            <a href="#" class="btn btn-sm request-info-btn" onclick="showRequestInfoModal(event)">Request Info</a>
          </div>
          ${
            vehicle.video
              ? `<button class="custom-btn-light custom-btn-detail">
                  <i class="fa-solid fa-play me-1"></i>
                  Video
                </button>`
              : ''
          }
        </div>
      </div>
    </a>
  </div>
  `
}

function displayItems(index = 0) {
  const itemsToDisplay = local_vehicles.slice(0, index + 3)

  const car_list_box = document.getElementById('car-list-box')
  car_list_box.innerHTML = ''

  console.log(itemsToDisplay.length, local_vehicles.length)

  if (itemsToDisplay.length == local_vehicles.length)
    document.getElementById('view-more-btn').classList.add('d-none')

  for (let i = 0; i < itemsToDisplay.length; i++) {
    car_list_box.insertAdjacentHTML('beforeend', getHTML(itemsToDisplay[i]))
  }
}

function viewMore() {
  const viewedItems = document.getElementById('car-list-box').children.length
  // console.log(viewedItems, local_vehicles.length) we can handle condition here when it viewed list completed
  displayItems(viewedItems)
}

// Call the API on window load
window.onload = async function () {
  // Call the API with the extracted data
  fetchVehicleDetails()

  function animateTop() {
    var reveals = document.querySelectorAll('.animateTopbar')
    const YValueToShow = 450

    for (var i = 0; i < reveals.length; i++) {
      if (window.scrollY > YValueToShow) {
        reveals[i].classList.add('active')
      } else {
        reveals[i].classList.remove('active')
      }
    }
  }

  window.addEventListener('scroll', animateTop)

  // const tooltipTriggerList = document.querySelectorAll(
  //   '[data-bs-toggle="tooltip"]'
  // )
  // const tooltipList = [...tooltipTriggerList].map(
  //   (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  // )

  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  )

  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      template: document.getElementById(tooltipTriggerEl.dataset.bsTitle)
        .innerHTML,
      html: true,
    })
  })
}

// const swiper_review = new Swiper('.swiper-review', {
//   // Optional parameters
//   // loop: true,
//   // autoplay: true,
//   slidesPerView: 1,

//   // If we need pagination
//   pagination: {
//     el: '.swiper-pagination',
//   },
// })

// <!-- Section K -->
// <div class="section-k">
//   <div class="container text-center">
//     <!-- Slider main container -->
//     <div class="swiper-review swiper mt-5">
//       <!-- Additional required wrapper -->
//       <div class="swiper-wrapper">
//         <!-- Slides -->
//         <div class="swiper-slide">
//           <div class="position-relative">
//             <div
//               class="grid-view grid-area"
//               style="
//                 grid-template-areas: 'main main sideA' 'main main sideB';
//                 position: relative;
//               "
//             >
//               <img
//                 class="gallery-image click-to-slick"
//                 style="
//                   filter: blur(10px);
//                   position: absolute;
//                   padding: 5px;
//                 "
//                 data-slic="0"
//                 src="car-cover-5.png"
//                 alt=""
//               />
//               <div
//                 role="button"
//                 onclick="MorePhotos(this)"
//                 class="h-100 item0"
//                 style="position: relative; z-index: 1"
//               >
//                 <img
//                   class="gallery-image click-to-slick"
//                   data-slic="0"
//                   src="car-cover-2.png"
//                   alt=""
//                 />
//               </div>
//               <div
//                 role="button"
//                 onclick="MorePhotos(this)"
//                 class="h-100 item${idx}"
//                 style="position: relative; z-index: 1"
//               >
//                 <img
//                   class="gallery-image click-to-slick"
//                   data-slic="0"
//                   src="car-cover-2.png"
//                   alt=""
//                 />
//               </div>
//               <div
//                 role="button"
//                 onclick="MorePhotos(this)"
//                 class="h-100 item${idx}"
//                 style="position: relative; z-index: 1"
//               >
//                 <img
//                   class="gallery-image click-to-slick"
//                   data-slic="0"
//                   src="car-cover-2.png"
//                   alt=""
//                 />
//               </div>
//               <div
//                 class="total-car-images-btn position-absolute"
//                 onclick="MorePhotos(this)"
//               >
//                 <span class="elementor-hidden-mobile">Photos</span>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div class="swiper-slide">
//           <div class="client-review-wrap">
//             <div class="client-car-wrap">
//               <img
//                 class="client-car"
//                 width="100%"
//                 src="/slider_car.png"
//               />
//             </div>
//           </div>
//         </div>
//         <div class="swiper-slide">
//           <div class="client-review-wrap">
//             <div class="client-car-wrap">
//               <img
//                 class="client-car"
//                 width="100%"
//                 src="/slider_car.png"
//               />
//             </div>
//           </div>
//         </div>
//         <div class="swiper-slide">
//           <div class="client-review-wrap">
//             <div class="client-car-wrap">
//               <img
//                 class="client-car"
//                 width="100%"
//                 src="/slider_car.png"
//               />
//             </div>
//           </div>
//         </div>
//         <div class="swiper-slide">
//           <div class="client-review-wrap">
//             <div class="client-car-wrap">
//               <img
//                 class="client-car"
//                 width="100%"
//                 src="/slider_car.png"
//               />
//             </div>
//           </div>
//         </div>
//         <div class="swiper-slide">
//           <div class="client-review-wrap">
//             <div class="client-car-wrap">
//               <img
//                 class="client-car"
//                 width="100%"
//                 src="/slider_car.png"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//       <!-- If we need pagination -->
//       <div class="swiper-pagination"></div>
//     </div>
//   </div>
// </div>
