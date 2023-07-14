async function fetchVehicleDetails() {
  const urlParams = new URLSearchParams(window.location.search)
  const vehicleId = urlParams.get('id')
  if (!vehicleId) {
    console.error('Vehicle ID not provided')
    return
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
    console.log(vehicle)
    displayVehicle(vehicle)
    displayVehicleDetails(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle details:', error)
  }
}

function displayVehicle(vehicle) {
  const html = `
  <div class="hero-banner-u my-4">
  <div class="certified-text">LCT AUTO LLC CERTIFIED</div>
  <div class="car-main-body">
    <div class="car-fixed-title">
      <div class="car-title-left">
        <div>
          <h2 class="car-title-new">${vehicle.year} ${vehicle.make} ${
    vehicle.model
  }</h2>
          <div class="car-term-miles">
            <span class="block m:inline">${vehicle.engineShape}</span>
            <span class="">•</span>
            <span data-qa="mileage">${vehicle.mileage?.toLocaleString()} miles</span>
          </div>
        </div>
      </div>
    </div>
    <div class="car-fixed-price">
      <div class="flex">
        <div class="car-title-col">
          <div class="price car-price hero-bar">
            <span class="old-price"> $5,200.00</span
            ><span class="new-price">${vehicle.price?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            })}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="car-fixed-btn hide-in-mobile">
      <a
        href="https://lctautollc.com/wp/cars/?car_body_style=suv"
        class="view-more-btn"
        type="button"
        >View More Cars</a
      >
      <button
        data-toggle="modal"
        data-target="#shedule_test_drive"
        type="button"
      >
        Get Started
      </button>
    </div>
  </div>
</div>

<div class="car-gallery-images">
  ${
    vehicle.images?.length >= 3
      ? `<div class="gallery-preview-images">
    <div class="grid-view row-gap">
      <div class="relative">
        <div class="sc-cbf9113b-5 cjnLvy grid-view">
          <div class="position-relative">
            <div role="button" class="h-100">
              <img
                class="gallery-image click-to-slick"
                data-slic="0"
                src=${vehicle.images && vehicle.images[0]?.url}
                alt=""
              />
            </div>
          </div>
          <div role="button">
            <img
              class="gallery-image click-to-slick"
              data-slic="1"
              src=${vehicle.images && vehicle.images[1]?.url}
              alt=""
            />
          </div>
          <div class="position-relative">
            <div role="button" tabindex="0" class="h-100">
              <img
                class="gallery-image click-to-slick"
                data-slic="2"
                src=${vehicle.images && vehicle.images[1]?.url}
                alt=""
              />
              <div class="total-car-images-btn position-absolute" onclick="MorePhotos(this)"
              >
                +16 <span class="elementor-hidden-mobile">Photos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`
      : `<img role="button" onclick="MorePhotos(this)" src=${vehicle.images[0]?.url} class="single-image" />`
  }

  <!-- cars -->
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
</div>
  `
  document.getElementById('car-details').insertAdjacentHTML('beforeend', html)
}

function displayVehicleDetails(vehicle) {
  displayFirstTabVehicleDetails(vehicle)
  displaySecondTabFeaturesAndOptions(vehicle)
}

function displayFirstTabVehicleDetails(vehicle) {
  const html = `
  <ul class="car-attributes mb-0">
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
  </ul>
  <div class="row fuel-effeincy">
    <div class="col-lg-6 col-md-6 brder p-3">
      <div id="" class="cd-vehicle-fuel-efficiency">
        <div class="details-form contact-2 details-weight">
          <div class="fuel-efficiency-detail fuel-efficiency2">
            <div class="heading">
              <h6>Fuel Economy Rating</h6>
            </div>
            <div class="row align-items-end">
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
              <div class="col-sm-12 mt-3 actual">
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
              <h6>Vehicle History Report</h6>
            </div>
            <div class="row">
              <div
                class="col-4 d-flex align-items-center justify-content-end"
              >
                <div class="carvax-logo">
                  <img
                    src="/images/crafax.png"
                    alt="Carfax Logo"
                    width="70"
                  />
                </div>
              </div>
              <div class="col-8">
                <h5>Get a Free Vehicle History Report</h5>
                <p>Backed by Federal Vehicle Title Data</p>
              </div>
            </div>
            <div class="col-xs-12 mt-0 text-center">
              <div class="get-report-btn">
                <a
                  target="_blank"
                  href="http://www.carfax.com/VehicleHistory/p/Report.cfx?partner=DVW_1&amp;vin=4S2CK58YX44313428"
                  type="button"
                  >Get My Free Report</a
                >
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
    .insertAdjacentHTML('beforeend', html)
}

function displaySecondTabFeaturesAndOptions(vehicle) {
  const yes = `<i class="fas fa-check"></i>`
  const no = `<i class="fa-solid fa-xmark"></i>`

  html = `
  <div class="masonry-main cd-vehicle-features">
              <ul class="list-style-1 list-col-3">
              ${vehicle.options
                .map(
                  (option) =>
                    `<li>
                  ${option.installed ? yes : no}
                  ${option.label}
                  </li>`
                )
                .join('')}
              </ul>
            </div>
  `
  document
    .getElementById('profile-tab-details')
    .insertAdjacentHTML('beforeend', html)
}

function MorePhotos(element) {
  BigPicture({
    el: element,
    gallery: '#gallery',
  })
}
// Call the API on window load
window.onload = function () {
  // Call the API with the extracted data
  fetchVehicleDetails()
}
