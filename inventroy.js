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
  console.log(vehicles)
  const html = (vehicle) => `
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
  const car_list_box = document.getElementById('car-list-box')

  vehicles.forEach((vehicle) => {
    car_list_box.insertAdjacentHTML('beforeEnd', html(vehicle))
  })
}

fetchVehicles()
