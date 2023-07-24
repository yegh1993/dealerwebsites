const filters = {}
const finance = {}
var initialPageNumber = 1
var itemsPerPage = 12
var sortBy = 'name'
var sortingOrder = 'asc'
var local_vehicles

function handleInputChange(event) {
  const key = event.target.name
  const value = event.target.value
  filters[key] = value
  SearchInventory(value)
  displaySelectedFilter()
}

function Loader(show) {
  if (show) {
    document.getElementById('filter-loader').classList.remove('d-none')
  } else {
    document.getElementById('filter-loader').classList.add('d-none')
  }
}

async function SearchInventory(value) {
  Loader(true)
  await fetchVehicles(value)
  Loader(false)
  return
}

async function removeFilter(key) {
  delete filters[key]
  Loader(true)
  await fetchVehicles()
  Loader(false)
  displaySelectedFilter()

  const inputElement = document.querySelector(`[name="${key}"]`)
  inputElement.nextElementSibling.innerHTML = key
}

async function ResetFilter() {
  Object.keys(filters).forEach((key) => {
    const inputElement = document.querySelector(`[name="${key}"]`)
    inputElement.nextElementSibling.innerHTML = key
    delete filters[key]
  })

  Loader(true)
  await fetchVehicles()
  Loader(false)
  displaySelectedFilter()
}

async function fetchVehicles() {
  const dealerId = '1'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'
  try {
    const response = await fetch(
      `${apiUrl}/api/vehicles?idDealership=${dealerId}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )
    const vehicles = await response.json()
    console.log(vehicles.results)
    local_vehicles = [...vehicles.results]
    sortItem()
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

function displaySelectedFilter() {
  const getHtml = ([label, value]) => `
  <div class="d-flex align-items-center selected-filter-item" onclick="removeFilter('${label}')">
                <i class="fa-regular fa-circle-xmark me-3"></i>
                <div class="me-2">${label} &nbsp;:&nbsp;</div>
                <div>${value}</div>
              </div>
  `

  const html = Object.entries(filters)
    .map((item) => getHtml(item))
    .join('')

  document.getElementById('selected-filters').innerHTML = html
}

function changeItemsPerPage(event) {
  itemsPerPage = parseInt(event.target.value)
  displayVehicles()
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
  displayVehicles()
}

function changeSortOrder(event) {
  console.log(sortingOrder)
  if (sortingOrder == 'asc') {
    sortingOrder = 'desc'
    event.target.classList.remove('asc')
    event.target.classList.add('desc')
    return sortItem()
  }
  if (sortingOrder == 'desc') {
    sortingOrder = 'asc'
    event.target.classList.remove('desc')
    event.target.classList.add('asc')
    return sortItem()
  }
}

function changeSorting(event) {
  sortBy = event.target.value
  sortItem()
}

function displayVehicles() {
  document.getElementById(
    'vehicle-found'
  ).innerHTML = `${local_vehicles.length} Vehicles Matching`

  displayItems(initialPageNumber)
  generatePaginationButtons(local_vehicles.length, initialPageNumber)
}

function getHTML(vehicle) {
  return `
  <div class="col-md-4 mt-3">
  <div class="car-item">
    <div
      style="width:100%;
      background: url('${
        vehicle.images ? vehicle.images[0]?.url : '/images/car7.jpeg'
      }') center center no-repeat;
      background-size:cover;
      height:165px;"
    ></div>
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
        class="d-flex justify-content-between mt-3 car-props"
      >
        <div class="col-6 car-prop">Mileage</div>
        <div class="col-6 car-prop-value">${vehicle.mileage}</div>
      </div>
      <div
        class="d-flex justify-content-between mb-3 car-props"
      >
        <div class="col-6 car-prop">Availablity</div>
        <div class="col-6 car-prop-value">${
          vehicle.status == 'ACTIVE' ? 'In Store' : 'N/A'
        }</div>
      </div>
      <div class="d-flex justify-content-between mt-4">
        <a href="/vdp.html?id=${
          vehicle.idVehicle
        }" class="custom-btn-light custom-btn-detail">
          <i class="fa-solid fa-link me-1"></i>
          Detail
        </a>
        

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
  </div>
  `
}

function displayItems(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const itemsToDisplay = local_vehicles.slice(startIndex, endIndex)

  console.log('Display Items', itemsPerPage)

  const car_list_box = document.getElementById('car-list-box')
  car_list_box.innerHTML = ''

  for (let i = 0; i < itemsToDisplay.length; i++) {
    car_list_box.insertAdjacentHTML('beforeend', getHTML(itemsToDisplay[i]))
  }

  const paginationButtons = document.querySelectorAll('#pagination-buttons li')
  paginationButtons.forEach(function (button) {
    button.classList.remove('active')
  })
  paginationButtons[pageNumber - 1]?.classList.add('active')
}

function generatePaginationButtons(totalItems, currentPage) {
  console.log('Pagination Button', itemsPerPage)
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const paginationButtons = document.getElementById('pagination-buttons')
  paginationButtons.innerHTML = ''

  const maxVisibleButtons = 4 // Maximum number of visible buttons
  const totalVisibleButtons = Math.min(totalPages, maxVisibleButtons) // Total number of visible buttons

  const startButton = Math.max(
    1,
    currentPage - Math.floor(totalVisibleButtons / 2)
  )
  const endButton = Math.min(totalPages, startButton + totalVisibleButtons - 1)

  if (currentPage > Math.floor(totalVisibleButtons / 2) + 1) {
    const backButton = document.createElement('li')
    backButton.textContent = 'Back'
    backButton.addEventListener('click', function () {
      const previousPage = currentPage - 1
      displayItems(previousPage)
      generatePaginationButtons(totalItems, previousPage)
    })
    paginationButtons.appendChild(backButton)
  }

  if (currentPage > Math.floor(totalVisibleButtons / 2) + 1) {
    var ellipsisStart = document.createElement('li')
    ellipsisStart.textContent = '...'
    ellipsisStart.disabled = true
    paginationButtons.appendChild(ellipsisStart)
  }

  for (let i = startButton; i <= endButton; i++) {
    const button = document.createElement('li')
    button.textContent = i
    button.addEventListener('click', function () {
      var pageNumber = parseInt(this.textContent)
      displayItems(pageNumber)
      generatePaginationButtons(totalItems, pageNumber)
    })
    if (i === currentPage) {
      button.classList.add('active')
    }
    paginationButtons.appendChild(button)
  }

  if (endButton < totalPages) {
    var ellipsisEnd = document.createElement('li')
    ellipsisEnd.textContent = '...'
    ellipsisEnd.disabled = true
    paginationButtons.appendChild(ellipsisEnd)
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement('li')
    nextButton.textContent = 'Next'
    nextButton.addEventListener('click', function () {
      const nextPage = currentPage + 1
      if (nextPage <= totalPages) {
        displayItems(nextPage)
        generatePaginationButtons(totalItems, nextPage)
      }
    })
    paginationButtons.appendChild(nextButton)
  }
}

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

window.addEventListener('load', () => {
  const queryParams = new URLSearchParams(window.location.search)

  // If you want to get all the parameters and their values as an object
  queryParams.forEach((value, key) => {
    filters[key] = value
  })

  displaySelectedFilter()
  fetchVehicles()
})
