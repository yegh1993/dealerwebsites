const outputDiv = document.getElementById('typingOutput');
const messages = [
  "Discover Your Next Ride Here!",
  "Drive Plano's Best Selection 🚗",
  "Elegant Choices, Affordable Prices!",
  "Ready for the Road? So Are We!",
  "Turn Heads in Plano, TX!",
  "Financing Made Easy for You!",
  "Upgrade Your Drive Today!",
  "Why Wait? Find Your Dream Car Now!"
];
let currentMessageIndex = 0;

function simulateTyping() {
  setTimeout(() => {
    typeNextCharacter();
  }, 500);
}

const typingDelay = 40;  // Reduced delay for faster typing
const deletionDelay = typingDelay / 5;  // 5 times faster deletion

function typeNextCharacter(index = 0) {
  const message = messages[currentMessageIndex];

  if (index < message.length) {
    outputDiv.textContent += message[index];
    setTimeout(() => {
      typeNextCharacter(index + 1);
    }, typingDelay);  // using the typingDelay
  } else {
    // Wait for a moment after the full message is written out
    setTimeout(() => {
      deleteCharacter(message.length - 1);
    }, 2000);  // 2 second delay before starting deletion
  }
}

function deleteCharacter(index) {
  if (index >= 0) {
    outputDiv.textContent = outputDiv.textContent.slice(0, index);
    setTimeout(() => {
      deleteCharacter(index - 1);
    }, deletionDelay);  // using the deletionDelay
  } else {
    currentMessageIndex = (currentMessageIndex + 1) % messages.length;
    setTimeout(simulateTyping, 1);  // 1 seconds before starting the next message
  }
}

document.addEventListener('DOMContentLoaded', function () {
  simulateTyping();
});

const filters = {}
var initialPageNumber = 1
var itemsPerPage = 12
var sortBy = 'name'
var sortingOrder = 'asc'
var local_vehicles = []
var isQueryParams = false

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



function handleInputChange(event) {
  const key = toCamelCase(event.target.dataset.id)
  const value = event.target.value;

  if (filters.hasOwnProperty(key)) {
    if (!filters[key].includes(value)) {
      filters[key].push(value);
    } else {
      filters[key].splice(filters[key].indexOf(value), 1);

      if (filters[key].length == 0) {
        delete filters[key]
      }
    }
  } else {
    filters[key] = [value]
  }

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

async function removeFilter(key, value) {
  if (filters[key].includes(value)) {
    filters[key].splice(filters[key].indexOf(value), 1);

    if (filters[key].length == 0) {
      delete filters[key]
    }
  }

  Loader(true)
  await fetchVehicles()
  Loader(false)
  displaySelectedFilter()

  const inputElement = document.querySelector(`[value="${value}"]:checked`)
  if (inputElement) inputElement.checked = false;
}

async function ResetFilter() {
  Object.keys(filters).forEach((key) => {
    const checkedInputsList = document.querySelectorAll(`[data-id="${separateCamelCase(key)}"]:checked`)

    if (checkedInputsList.length > 0) {
      for (let i = 0; i < checkedInputsList.length; i++) {
        checkedInputsList[i].checked = false;
      }
    }
    delete filters[key]
  })

  Loader(true)
  await fetchVehicles()
  Loader(false)
  displaySelectedFilter()
}

async function FilterPrice() {
  filters['Min Price'] = document.querySelector('.priceValMin').value
  filters['Max Price'] = document.querySelector('.priceValMax').value
  Loader(true)
  await fetchVehicles()
  displaySelectedFilter()
  Loader(false)
}


async function FilterMileage() {
  filters['Min Mileage'] = document.querySelector('.mileageValMin').value
  filters['Max Mileage'] = document.querySelector('.mileageValMax').value
  Loader(true)
  await fetchVehicles()
  displaySelectedFilter()
  Loader(false)
}
async function FilterYear() {
  filters['Min Year'] = document.querySelector('.yearValMin').value
  filters['Max Year'] = document.querySelector('.yearValMax').value
  Loader(true)
  await fetchVehicles()
  displaySelectedFilter()
  Loader(false)
}


function getQueryString() {

  let str = Object.entries(filters)
    .map(([label, value]) => {
      const key = label.replace(' ', '')
      if (arrTypes.includes(key))
        return value.map(val => '&' + key + '=' + val).join('') + '&' + key + '=' + '';
      return '&' + key + '=' + value
    })
    .join('')

  if (filters['Min Price']) str = str + '&minPrice=' + filters['Min Price']
  if (filters['Max Price']) str = str + '&maxPrice=' + filters['Max Price']

  if (filters['Min Mileage']) str = str + '&minMileage=' + filters['Min Mileage']
  if (filters['Max Mileage']) str = str + '&maxMileage=' + filters['Max Mileage']

  if (filters['Min Year']) str = str + '&minYear=' + filters['Min Year']
  if (filters['Max Year']) str = str + '&maxYear=' + filters['Max Year']

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
  const getHtml = ([label, values]) => `
  ${values
      .map((value) => `<div class="d-flex align-items-center selected-filter-item" onclick="removeFilter('${label}', '${value}')">
                <div>${value}</div>
               <i class="fa-solid fa-xmark"></i>
              </div>`)
      .join('')}`

  const html = Object.entries(filters)
    .map((item) => getHtml(item))
    .join('')

  if (Object.keys(filters).length > 0) {
    document.getElementById('vehiclesFilters').classList.remove('d-none')
  } else {
    document.getElementById('vehiclesFilters').classList.add('d-none')
  }

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

  document.getElementById('found-vehicle-count').innerHTML = local_vehicles.length

  if (local_vehicles.length) {
    displayItems(initialPageNumber)
    generatePaginationButtons(local_vehicles.length, initialPageNumber)
  } else
    document.getElementById('car-list-box').innerHTML =
      '<div class="text-center"><b>No Vehicle Found</b></div>'

  generateStructuredData();
}

async function generateStructuredData() {
  const dealershipName = "LCT Auto";
  const dealershipLocation = "Plano, TX";

  const offersList = local_vehicles.map((vehicle, index) => {
    const itemCondition = (vehicle.condition === "NEW") ? "NewCondition" : "UsedCondition";
    const year = new Date(vehicle.dateInStock).getFullYear();

    // Construct the description
    const vehicleName = `${year} ${vehicle.make} ${vehicle.model}`;
    const description = `Used ${vehicleName} for sale - $${vehicle.price}, ${vehicle.mileage} mi sold by ${dealershipName} in ${dealershipLocation}`;

    // Calculate priceValidUntil date
    const dateInStock = new Date(vehicle.dateInStock);
    const priceValidUntil = new Date(dateInStock);
    priceValidUntil.setMonth(priceValidUntil.getMonth() + 3);

    const offer = {
      "@context": "https://schema.org",
      "@type": "Offer",
      "availability": "InStock",
      "price": vehicle.price,
      "priceCurrency": "USD",
      "url": vehicle.link || `https://lctautollc.com/vdp.html?id=${vehicle.idVehicle}`,
      "@id": `https://lctautollc.com/vdp.html?id=${vehicle.idVehicle}`,
      "priceValidUntil": priceValidUntil.toISOString(),
      "itemOffered": {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "bodyType": vehicle.bodyStyle,
        "brand": {
          "@context": "https://schema.org",
          "@type": "Brand",
          "name": vehicle.make
        },
        "description": description,
        "model": vehicle.model,
        "name": vehicleName,
        "mpn": vehicleName,
        "sku": vehicle.stockNumber,
        "vehicleModelDate": year,
        "itemCondition": itemCondition,
        "mileageFromOdometer": {
          "@context": "https://schema.org",
          "@type": "QuantitativeValue",
          "value": vehicle.mileage,
          "unitCode": "SMI"
        },
        "image": vehicle.images.length > 0 ? vehicle.images[0].url : "",
        "color": vehicle.exteriorColor,
        "vehicleIdentificationNumber": vehicle.vin,
        "driveWheelConfiguration": vehicle.driveTrain,
        "fuelType": vehicle.fuelType,
        "vehicleTransmission": vehicle.transmission,
        "vehicleEngine": {
          "@type": "EngineSpecification",
          "name": vehicle.engineShape
        },
        "offers": {
          "@id": `https://lctautollc.com/vdp.html?id=${vehicle.idVehicle}`
        }
      }
    };
    return offer;
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "name": "Pickup Trucks",
    "mpn": "Pickup Trucks",
    "sku": "bg5",
    "bodyType": "Pickup Trucks",
    "description": "Pickup Trucks For Sale",
    "offers": {
      "@context": "https://schema.org",
      "@type": "AggregateOffer",
      "highPrice": Math.max(...offersList.map(offer => offer.price)),
      "lowPrice": Math.min(...offersList.map(offer => offer.price)),
      "priceCurrency": "USD",
      "offerCount": offersList.length,
      "offers": offersList
    }
  };

  document.getElementById("structured-data").textContent = JSON.stringify(structuredData, null, 2);
}


function getHTML(vehicle) {
  const imageScrollerHtml = vehicle.images.map((image, index) => `
  <img src="${image.url}" class="vehicle-image" data-index="${index}" ${index !== 0 ? 'style="display: none;"' : ''}>
`).join('');

  // Calculate the old price
  const oldPrice = vehicle.price * 1.18;

  return `
  <div class="col-sm-6 col-lg-4 mt-3">
    <a href="/vdp.html?id=${vehicle.idVehicle}">
      <div class="car-item">
        <div class="vehicle-images">
          <button class="prev-image" onclick="event.preventDefault(); event.stopPropagation(); changeImage(event, -1)"><i class="fas fa-arrow-left"></i></button>
          ${imageScrollerHtml}
          <button class="next-image" onclick="event.preventDefault(); event.stopPropagation(); changeImage(event, 1)"><i class="fas fa-arrow-right"></i></button>
        </div>
        <div class="car-item-content">
          <div class="car-name">${vehicle.year} ${vehicle.make} ${vehicle.model}</div>
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
          ${vehicle.video
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
  `;
}

let isTransitioning = false;

function changeImage(event, direction) {
  if (isTransitioning) {
    return; // Exit the function if a transition is already in progress
  }

  isTransitioning = true; // Set the flag to indicate that a transition is in progress

  event.stopPropagation(); // Prevent the click event from propagating to the parent anchor tag

  const imagesContainer = event.target.parentElement.parentElement; // Select the parent container of the images
  console.log('Images container:', imagesContainer);

  const images = imagesContainer.getElementsByClassName('vehicle-image');
  console.log('Images:', images);

  let currentIndex = -1;
  for (let i = 0; i < images.length; i++) {
    console.log(`Image ${i} display: ${images[i].style.display}`);
    if (images[i].style.display !== 'none') {
      currentIndex = i;
      break;
    }
  }

  console.log(`Current index: ${currentIndex}`);
  if (currentIndex === -1) {
    console.error('Error: No image is currently displayed.');
    return;
  }

  const newIndex = (currentIndex + direction + images.length) % images.length;
  console.log(`New index: ${newIndex}`);

  if (!images[newIndex]) {
    console.error(`Error: No image found at index ${newIndex}.`);
    return;
  }

  // Position the new image correctly before the transition starts
  images[newIndex].style.transform = direction === 1 ? 'translateX(100%)' : 'translateX(-100%)';
  images[newIndex].style.display = 'block';

  // Add the smooth scrolling effect
  setTimeout(() => {
    images[currentIndex].style.transform = direction === 1 ? 'translateX(-100%)' : 'translateX(100%)';
    images[newIndex].style.transform = 'translateX(0%)';
  }, 50); // Wait a short time to ensure the new image is positioned correctly

  // Hide the current image after the transition has completed
  setTimeout(() => {
    images[currentIndex].style.display = 'none';
    isTransitioning = false; // Reset the flag to indicate that the transition has completed
  }, 550); // Wait for the transition to complete
}





function showRequestInfoModal(event) {
  // Stop the button from doing its default behavior
  event.preventDefault();

  // Create the modal using our function from step 1
  const modalHTML = generateModalHTML();
  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = modalHTML;
  document.body.appendChild(modalDiv);

  // Display the modal
  const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
  modal.show();

  // Remove the modal from the page once it's closed
  $('#scheduleModal').on('hidden.bs.modal', function() {
      this.remove();
  });
}

function handleInputChange(event) {
  const { name, value } = event.target
  schedule[name] = value
  console.log(schedule)
}

function toggleErrorClass(element, condition) {
  if (condition) {
    element.classList.add('input-error');
  } else {
    element.classList.remove('input-error');
  }
}

function formatZIPCode(event) {
  // Remove non-digits
  event.target.value = event.target.value.replace(/\D/g, "");
  // Limit to 5 digits
  event.target.value = event.target.value.slice(0, 5);
}

function validateZIPCode(event) {
  const zip = event.target.value;
  const regex = /^\d{5}$/; // Matches 5-digit ZIP codes

  if (!regex.test(zip)) {
    event.target.style.borderColor = 'red';
  } else {
    event.target.style.borderColor = ''; // Reset border color to default
  }
}

function validateEmail(event) {
  const email = event.target.value;
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  if (!regex.test(email)) {
    event.target.style.borderColor = 'red';
  } else {
    event.target.style.borderColor = ''; // Reset border color to default
  }
}

function formatPhoneNumber(event) {
  // Remove non-digits
  let phoneNumber = event.target.value.replace(/\D/g, "");
  // Limit to 10 digits
  phoneNumber = phoneNumber.slice(0, 10);
  // Format as (123) 456-7890
  if (phoneNumber.length > 6) {
    phoneNumber = "(" + phoneNumber.slice(0, 3) + ") " + phoneNumber.slice(3, 6) + "-" + phoneNumber.slice(6);
  } else if (phoneNumber.length > 3) {
    phoneNumber = "(" + phoneNumber.slice(0, 3) + ") " + phoneNumber.slice(3);
  } else if (phoneNumber.length > 0) {
    phoneNumber = "(" + phoneNumber;
  }
  event.target.value = phoneNumber;
}

function validatePhoneNumber(event) {
  const phone = event.target.value;
  const regex = /^\(\d{3}\) \d{3}-\d{4}$/;

  if (!regex.test(phone)) {
    event.target.style.borderColor = 'red';
  } else {
    event.target.style.borderColor = ''; // Reset border color to default
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

function generateModalHTML() {
  return `
  <!-- Request More Info Modal -->
  <div class="modal fade" id="scheduleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
          <div class="modal-content">
              <div class="modal-header d-flex align-items-center">
                  <h1 class="modal-title" id="exampleModalLabel">Request More Info</h1>
                  <span data-bs-dismiss="modal" aria-label="Close" class="close">&times;</span>
              </div>
              <div class="modal-body">
                  <form id="schedule_form" onsubmit="scheduleTestDrive(event)" class="row g-3 px-0">
                      <div>
                          <span class="ms-0">Hello my name is</span>
                          <input class="custom-input" type="text" name="firstName" placeholder="First name" oninput="handleInputChange(event)" required pattern="[A-Za-z]{2,}" title="Please enter a valid first name" />
                          <input class="custom-input" type="text" name="lastName" placeholder="Last name" oninput="handleInputChange(event)" required pattern="[A-Za-z]{2,}" title="Please enter a valid last name" />
                          <span>and I'd like to request more details for <b id="vehicle-title"></b>. I'm in the</span>
                          <input class="custom-input" type="text" name="zip" placeholder="ZIP Code" oninput="formatZIPCode(event)" onfocusout="validateZIPCode(event)" required />
                          <span>area. You can reach me by email at</span>
                          <input class="custom-input" type="email" name="email" placeholder="Email Address" onfocusout="validateEmail(event)" required />
                          <span class="text-danger" id="email_error"></span>
                          <span>or by phone at</span>
                          <input class="custom-input" type="text" name="phone" placeholder="123-456-7890(optional)" oninput="formatPhoneNumber(event)" onfocusout="validatePhoneNumber(event)" />
                          <br>
                          <br>
                          <span>Thank you!</span>
                      </div>
                      <div onclick="ToggleComment(event)" style="cursor: pointer" class="mt-5 text-end">
                          <i class="fa-solid"></i>
                          <span>Add Comment</span>
                      </div>
                      <div class="d-none">
                          <textarea class="custom-input" name="comment" placeholder="" oninput="handleInputChange(event)"></textarea>
                      </div>
                      <div>
                          <input class="form-check-input" type="checkbox" value="" id="emailConsent" oninput="handleEmailConsentToggle(event)" />
                          <label class="form-check-label" for="emailConsent">Email me new listings for my search</label>
                      </div>
                      <div class="d-flex">
                          <button type="submit" class="custom-btn-primary custom-btn-primary-2 w-100">
                              <img src="/cd_loader.svg" id="message-loader" class="d-none" />
                              Send Message
                          </button>
                      </div>
                      <div class="text-success" id="schedule_form_success"></div>
                      <div class="text-danger" id="schedule_form_error"></div>
                  </form>
              </div>
          </div>
      </div>
  </div>
  `;
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
  const getHtml = (label, options) => `<div class="f-accordion-item">
        <div class="f-accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#${label}" aria-expanded="false" aria-controls="${label}">
          <div class="heading">
            ${separateCamelCase(label)}
          </div>
        </div>
        <div id="${label}" class="collapse" aria-labelledby="${label}">
          <div class="f-accordion-body">
           ${options
      .map((option) => updateItems(label, option))
      .join('')}
          </div>
        </div>
      </div>
    </div>`

  const { year, mileage, price, ...rest } = filters
  const html = Object.entries(rest)
    .map(([label, options]) => getHtml(label, options))
    .join('')


  const sortedPrice = price.sort((a, b) => a - b)
  const minPrice = sortedPrice[0]
  const maxPrice = sortedPrice[sortedPrice.length - 1]

  document.getElementById('filtersAccordion').insertAdjacentHTML('beforeend', html)
  const rangeMin = document.querySelectorAll('.priceValMin')
  const rangeMax = document.querySelectorAll('.priceValMax')

  for (let index = 0; index < rangeMin.length; index++) {
    const element = rangeMin[index];
    element.setAttribute('value', minPrice)
    element.setAttribute('min', minPrice)
    element.setAttribute('max', maxPrice)
  }



  for (let index = 0; index < rangeMax.length; index++) {
    const element = rangeMax[index];
    element.setAttribute('value', maxPrice)
    element.setAttribute('min', minPrice)
    element.setAttribute('max', maxPrice)
  }

  const dealerSliderAmount1 = document.getElementById('dealer-slider-amount-1')
  dealerSliderAmount1.setAttribute('value', `${minPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })} - ${maxPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })}`)

  // same for year
  const sortedYear = year.sort((a, b) => a - b)
  const minYear = sortedYear[0]
  const maxYear = sortedYear[sortedYear.length - 1]

  const rangeMinYear = document.querySelectorAll('.yearValMin')
  const rangeMaxYear = document.querySelectorAll('.yearValMax')

  for (let index = 0; index < rangeMinYear.length; index++) {
    const element = rangeMinYear[index];
    element.setAttribute('value', minYear)
    element.setAttribute('min', minYear)
    element.setAttribute('max', maxYear)
  }

  for (let index = 0; index < rangeMaxYear.length; index++) {
    const element = rangeMaxYear[index];
    element.setAttribute('value', maxYear)
    element.setAttribute('min', minYear)
    element.setAttribute('max', maxYear)
  }

  const year1 = document.getElementById('year-1')
  year1.setAttribute('value', `${minYear} - ${maxYear}`)

  // same for mileage
  const sortedMileage = mileage.sort((a, b) => a - b)
  const minMileage = sortedMileage[0]
  const maxMileage = sortedMileage[sortedMileage.length - 1]

  const rangeMinMileage = document.querySelectorAll('.mileageValMin')
  const rangeMaxMileage = document.querySelectorAll('.mileageValMax')

  for (let index = 0; index < rangeMinMileage.length; index++) {
    const element = rangeMinMileage[index];
    element.setAttribute('value', minMileage)
    element.setAttribute('min', minMileage)
    element.setAttribute('max', maxMileage)
  }

  for (let index = 0; index < rangeMaxMileage.length; index++) {
    const element = rangeMaxMileage[index];
    element.setAttribute('value', maxMileage)
    element.setAttribute('min', minMileage)
    element.setAttribute('max', maxMileage)
  }

  const mileage1 = document.getElementById('mileage-1')

  mileage1.setAttribute('value', `${minMileage} - ${maxMileage}`)

}

function updateItems(label, option) {
  if (option != null) {
    const colorContent = (label, option) => `<div class="d-flex  justify-content-between">
              <div class="form-check f-checkbox">
                <input class="form-check-input f-checkbox-input" type="checkbox" id="${option}" data-id="${separateCamelCase(label)}" name="${label}" value="${option}" onchange="handleInputChange(event)" >
                <label class="form-check-label" for="${option}">${option}</label>
              </div>
              <div class="f-color-item" style="background-color: ${colorPiker(option)}"></div>
            </div>`

    switch (label) {
      case 'exteriorColor':
        return colorContent(label, option)
        break;
      case 'interiorColor':
        return colorContent(label, option)
        break;
      default:
        return `<div class="form-check f-checkbox">
                <input class="form-check-input f-checkbox-input" type="checkbox" id="${option}" data-id="${separateCamelCase(label)}" name="${label}" value="${option}" onchange="handleInputChange(event)" >
                <label class="form-check-label" for="${option}">${option}</label>
              </div>`
    }
  }
}

function colorPiker(colorName) {
  switch (colorName) {
    case 'Burgundy':
      return '#800020';
      break;
    default:
      return colorName
  }
}

window.addEventListener('load', async () => {

  const queryParams = new URLSearchParams(window.location.search)
  isQueryParams = queryParams.size
  // If you want to get all the parameters and their values as an object
  queryParams.forEach((value, key) => {
    filters[key] = [value]
  })

  PageLoader(true)
  displaySelectedFilter()
  await fetchVehicles()
  const serverFilters = await fetchFilters()

  console.log('Server Filters', serverFilters)
  displayFilters(serverFilters)
  showCustomSelect()
  PageLoader(false)
})
