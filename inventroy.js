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
    displayVehicles(vehicles.results)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
  }
}

function displayVehicles(vehicles) {
  var initialPageNumber = 1
  var itemsPerPage = 12
  displayItems(initialPageNumber, itemsPerPage)
  generatePaginationButtons(vehicles.length, itemsPerPage, initialPageNumber)

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
          <span class="new-price">${parseFloat(vehicle.price || 0).toFixed(
            2
          )}</span>
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
          <div class="col-6 car-prop-value">In Store</div>
        </div>
        <div class="d-flex justify-content-between mt-4">
          <a href="/vdp.html" class="custom-btn-light custom-btn-detail">
            <i class="fa-solid fa-link me-1"></i>
            Detail
          </a>
          
  
          <button class="custom-btn-light custom-btn-detail">
            <i class="fa-solid fa-play me-1"></i>
            Video
          </button>
          </div>
        </div>
      </div>
    </div>
    `
  }

  function displayItems(pageNumber, itemsPerPage) {
    const startIndex = (pageNumber - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const itemsToDisplay = vehicles.slice(startIndex, endIndex)

    const car_list_box = document.getElementById('car-list-box')
    car_list_box.innerHTML = ''

    for (let i = 0; i < itemsToDisplay.length; i++) {
      car_list_box.insertAdjacentHTML('beforeend', getHTML(itemsToDisplay[i]))
    }

    const paginationButtons = document.querySelectorAll(
      '#pagination-buttons li'
    )
    paginationButtons.forEach(function (button) {
      button.classList.remove('active')
    })
    paginationButtons[pageNumber - 1]?.classList.add('active')
  }

  function generatePaginationButtons(totalItems, itemsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const paginationButtons = document.getElementById('pagination-buttons')
    paginationButtons.innerHTML = ''

    const maxVisibleButtons = 4 // Maximum number of visible buttons
    const totalVisibleButtons = Math.min(totalPages, maxVisibleButtons) // Total number of visible buttons

    const startButton = Math.max(
      1,
      currentPage - Math.floor(totalVisibleButtons / 2)
    )
    const endButton = Math.min(
      totalPages,
      startButton + totalVisibleButtons - 1
    )

    if (currentPage > Math.floor(totalVisibleButtons / 2) + 1) {
      const backButton = document.createElement('li')
      backButton.textContent = 'Back'
      backButton.addEventListener('click', function () {
        const previousPage = currentPage - 1
        displayItems(previousPage, itemsPerPage)
        generatePaginationButtons(totalItems, itemsPerPage, previousPage)
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
        displayItems(pageNumber, itemsPerPage)
        generatePaginationButtons(totalItems, itemsPerPage, pageNumber)
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
          displayItems(nextPage, itemsPerPage)
          generatePaginationButtons(totalItems, itemsPerPage, nextPage)
        }
      })
      paginationButtons.appendChild(nextButton)
    }
  }
}

fetchVehicles()
