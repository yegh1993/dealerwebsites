const filters = {}
var initialPageNumber = 1
var itemsPerPage = 12
var sortBy = 'name'
var sortingOrder = 'asc'
var local_vehicles = []

function handleInputChange(event) {
  console.log(event)
  const key = event.target.name
  const value = event.target.value
  filters[key] = value
  SearchInventory()
  displaySelectedFilter()
}

function Loader(show) {
  if (show) {
    document.getElementById('filter-loader').classList.remove('d-none')
  } else {
    document.getElementById('filter-loader').classList.add('d-none')
  }
}

async function SearchInventory() {
  Loader(true)
  await fetchVehicles()
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
    if (inputElement) inputElement.nextElementSibling.innerHTML = key
    delete filters[key]
  })

  Loader(true)
  await fetchVehicles()
  Loader(false)
  displaySelectedFilter()
}

async function FilterPrice() {
  filters['Min Price'] = inputValue[0].value
  filters['Max Price'] = inputValue[1].value
  Loader(true)
  await fetchVehicles()
  displaySelectedFilter()
  Loader(false)
}

function getQueryString() {
  const arrTypes = [
    'bodyStyle',
    'condition',
    'driveTrain',
    'engineShape',
    'fuelType',
    'interiorColor',
    'exteriorColor',
    'make',
    'model',
    'transmission',
    'availability',
  ]

  let str = Object.entries(filters)
    .map(([label, value]) => {
      const key = label.replace(' ', '')
      if (arrTypes.includes(key))
        return '&' + key + '=' + value + '&' + key + '='
      return '&' + key + '=' + value
    })
    .join('')

  if (filters['Min Price']) str = str + '&minPrice=' + filters['Min Price']
  if (filters['Max Price']) str = str + '&maxPrice=' + filters['Max Price']

  return str
}

async function fetchVehicles() {
  const queryString = getQueryString()
  const dealerId = '1'
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net'
  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ'
  try {
    const response = await fetch(
      `${apiUrl}/api/vehicles/search?idDealership=${dealerId}${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    )
    const vehicles = await response.json()
    if (vehicles?.results) local_vehicles = [...vehicles.results]
    sortItem()
    return
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return
  }
}

function displaySelectedFilter() {
  const getHtml = ([label, value]) => `
  <div class="d-flex align-items-center selected-filter-item" onclick="removeFilter('${label}')">
                <i class="fa-regular fa-circle-xmark me-3"></i>
                <div class="me-2 text-capitalize">${label}:&nbsp;</div>
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

  if (local_vehicles.length) {
    displayItems(initialPageNumber)
    generatePaginationButtons(local_vehicles.length, initialPageNumber)
  } else
    document.getElementById('car-list-box').innerHTML =
      '<div class="text-center"><b>No Vehicle Found</b></div>'
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
      height:165px;"
    >
    <!-- <span class="used-tag">Used</span> -->
    ${vehicle.status == 'SOLD' ? '<span class="sold-tag"></span>' : ''}
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

function displayFilters(filters) {
  const getHtml = (label, options) => `<div class="mt-3 mb-2 custom-select">
  <select class="select-box"  
  onchange="handleInputChange(event)"
  name="${separateCamelCase(label)}"
  >
    <option value="0">${separateCamelCase(label)}</option>                 
    ${options
      .map((option) => `<option value="${option}">${option}</option>`)
      .join('')}
  </select>
</div>
  `

  const html = Object.entries(filters)
    .map(([label, options]) => getHtml(label, options))
    .join('')

  document.getElementById('filter-list').insertAdjacentHTML('beforeend', html)
}

window.addEventListener('load', async () => {
  const queryParams = new URLSearchParams(window.location.search)

  // If you want to get all the parameters and their values as an object
  queryParams.forEach((value, key) => {
    filters[key] = value
  })

  PageLoader(true)
  displaySelectedFilter()
  await fetchVehicles()
  const serverFilters = await fetchFilters()
  displayFilters(serverFilters)
  showCustomSelect()
  PageLoader(false)
})
