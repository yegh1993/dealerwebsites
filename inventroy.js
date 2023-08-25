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
  applyFiltersFromURL();
  updateUIWithFilters();
  simulateTyping();
});

const filters = {}
var initialPageNumber = 1
var itemsPerPage = 12
var sortBy = 'name'
var sortingOrder = 'asc'
var local_vehicles = []
var isQueryParams = false
var totalCount = 0;

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


//Updating Page With URLs
function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  let filtersFromURL = {};
  for (let [key, value] of params.entries()) {
    if (filtersFromURL[key]) {
      filtersFromURL[key].push(value);
    } else {
      filtersFromURL[key] = [value];
    }
  }
  return filtersFromURL;
}

function applyFiltersFromURL() {
  const filtersFromURL = getFiltersFromURL();
  Object.assign(filters, filtersFromURL);
  SearchInventory();
}

function updateUIWithFilters() {
  for (let [key, values] of Object.entries(filters)) {
    values.forEach(value => {
      const inputElement = document.querySelector(`[data-id="${key}"][value="${value}"]`);
      if (inputElement) inputElement.checked = true;
    });
  }
}

async function handleInputChange(event) {
  console.log("Input changed!");  // This should be logged every time a filter changes
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

function searchByKeywords(event) {
  const keyWord = event.target.value;

  if (keyWord.length > 0) {
    document.getElementById('inventory-clear-icon').classList.remove('d-none')
  } else {
    document.getElementById('inventory-clear-icon').classList.add('d-none')
  }
}

function clearSearch() {
  document.getElementById('inventorySearchInput').value = ''
  document.getElementById('inventory-clear-icon').classList.add('d-none')
}



async function SearchInventory() {
  await fetchVehicles()
  return
}

async function removeFilter(key, value) {
  if (filters[key].includes(value)) {
    filters[key].splice(filters[key].indexOf(value), 1);

    if (filters[key].length == 0) {
      delete filters[key]
    }
  }

  await fetchVehicles()
  displaySelectedFilter()

  const inputElement = document.querySelector(`[value="${value}"]:checked`)
  if (inputElement) inputElement.checked = false;

  resetRangeFilter(key)
}

async function ResetFilter() {
  Object.keys(filters).forEach((key) => {
    const checkedInputsList = document.querySelectorAll(`[data-id="${separateCamelCase(key)}"]:checked`)

    if (checkedInputsList.length > 0) {
      for (let i = 0; i < checkedInputsList.length; i++) {
        checkedInputsList[i].checked = false;
      }
    }
    resetRangeFilter(key)

    delete filters[key]
  })

  await fetchVehicles()
  displaySelectedFilter()
}

function resetRangeFilter(key) {
  switch (key) {
    case 'price':
      let priceMinRange = document.querySelector(`.priceValMin`)
      let priceMaxRange = document.querySelector(`.priceValMax`)
      let priceProgress = priceMinRange.parentElement.parentElement.querySelector('.progress');
      let priceActualValue = document.querySelector(`#filterByPrice .actual-value input`)

      priceMinRange.value = priceMinRange.min
      priceMaxRange.value = priceMaxRange.max

      priceProgress.style.left = '0%'
      priceProgress.style.right = '0.82%'

      priceActualValue.value = `${parseInt(priceMinRange.min).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      })} - ${parseInt(priceMaxRange.max).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      })}`
      break;
    case 'mileage':
      let mileageMinRange = document.querySelector(`.mileageValMin`)
      let mileageMaxRange = document.querySelector(`.mileageValMax`)
      let mileageProgress = mileageMinRange.parentElement.parentElement.querySelector('.progress');
      let mileageActualValue = document.querySelector(`#filterByMileage .actual-value input`);

      mileageMinRange.value = mileageMinRange.min
      mileageMaxRange.value = mileageMaxRange.max

      mileageProgress.style.left = '0%'
      mileageProgress.style.right = '0.82%'

      mileageActualValue.value = `${mileageMinRange.min} - ${mileageMaxRange.max}`
      break;
    case 'year':
      let yearMinRange = document.querySelector(`.yearValMin`)
      let yearMaxRange = document.querySelector(`.yearValMax`)
      let yearProgress = yearMinRange.parentElement.parentElement.querySelector('.progress');
      let yearActualValue = document.querySelector(`#filterByYear .actual-value input`);

      yearMinRange.value = yearMinRange.min
      yearMaxRange.value = yearMaxRange.max

      yearProgress.style.left = '0%'
      yearProgress.style.right = '0.82%'

      yearActualValue.value = `${yearMinRange.min} - ${yearMaxRange.max}`
      break;
  }
}

async function FilterPrice() {
  filters['price'] = [document.querySelector('.price-value').value];
  await fetchVehicles()
  displaySelectedFilter()
}

async function FilterMileage() {
  filters['mileage'] = [`${document.querySelector('.mileageValMin').value} - ${document.querySelector('.mileageValMax').value}`];
  await fetchVehicles()
  displaySelectedFilter()
}

async function FilterYear() {
  filters['year'] = [`${document.querySelector('.yearValMin').value} - ${document.querySelector('.yearValMax').value}`];
  await fetchVehicles()
  displaySelectedFilter()
}


function getQueryString() {

  let str = Object.entries(filters)
    .map(([label, value]) => {
      const key = label.replace(' ', '')
      if (arrTypes.includes(key))
        return value.map(val => '&' + key + '=' + val).join('');
      return '&' + key + '=' + value
    })
    .join('')

  if (filters['price']) {
    const price = filters['price'][0].split('-');
    str = str + '&minPrice=' + Number(price[0].replace('$', '').split(',').join('')) + '&maxPrice=' + Number(price[1].replace('$', '').split(',').join(''))
  }

  if (filters['mileage']) {
    const mileage = filters['mileage'][0].split('-');
    str = str + '&minMileage=' + Number(mileage[0]) + '&maxMileage=' + Number(mileage[1])
  }

  if (filters['year']) {
    const year = filters['year'][0].split('-');
    str = str + '&minYear=' + Number(year[0]) + '&maxYear=' + Number(year[1])
  }

  return str
}

let currentPage = 1;

async function fetchVehicles(page = 1) {
  const queryString = getQueryString()
  const dealerId = '1';
  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net';
  const dealerApiToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ';
  const skip = (page - 1) * itemsPerPage;

  try {
    const response = await fetch(
      `${apiUrl}/api/vehicles/search?idDealership=${dealerId}&limit=${itemsPerPage}&skip=${skip}${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${dealerApiToken}`,
        },
      }
    );
    const vehicles = await response.json();
    if (vehicles?.results) local_vehicles = [...vehicles.results];
    totalCount = vehicles.total

    sortItem();
    updatePaginationButtons(page, vehicles.total);
    return;
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return;
  }
}

function updatePaginationButtons(page, totalVehicles) {
  const paginationButtons = document.getElementById("pagination-buttons");
  const totalPages = Math.ceil(totalVehicles / itemsPerPage);
  let paginationHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    paginationHTML += `<li${i === page ? ' class="active"' : ''}>${i}</li>`;
  }

  if (page < totalPages) {
    paginationHTML += '<li>Next</li>';
  }

  paginationButtons.innerHTML = paginationHTML;

  // Update the URL with the current page number only if it's greater than 1
  if (page > 1) {
    window.history.pushState({}, '', '?page=' + page);
  } else {
    // Remove the page query parameter if the current page is 1
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.split('?')[0];
    window.history.pushState({}, '', baseUrl);
  }
}


function changeItemsPerPage(event) {
  itemsPerPage = parseInt(event.target.value, 10);
  fetchVehicles(currentPage);
}

//Smooth transition to the top of the grid when pages clicked
document.getElementById('pagination-buttons').addEventListener('click', function (event) {
  if (event.target.tagName === 'LI') {
    window.scrollTo({
      top: document.querySelector('.breadcrumb-content').offsetTop,
      behavior: 'smooth'
    });
  }
});

// Load the first page of vehicles
fetchVehicles(currentPage);

// Add event listeners to the pagination buttons
document.getElementById("pagination-buttons").addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const text = event.target.textContent;
    if (text === "Next") {
      currentPage++;
    } else {
      currentPage = parseInt(text, 10);
    }
    fetchVehicles(currentPage);
  }
});




function displaySelectedFilter() {
  const getHtml = ([label, values]) => `
  ${values
      .map((value) => `<div class="d-flex align-items-center selected-filter-item" onclick="removeFilter('${label}', '${value}')">
                <div>${value}</div>
               <i class="fa-solid fa-xmark"></i>
              </div>`)
      .join('')}`;

  const html = Object.entries(filters)
    .map((item) => getHtml(item))
    .join('');

  if (Object.keys(filters).length > 0) {
    document.getElementById('vehiclesFilters').classList.remove('d-none');
  } else {
    document.getElementById('vehiclesFilters').classList.add('d-none');
  }

  const clearAllHandle = `<div class="d-flex"><a onclick="ResetFilter()" class="clear-filters" href="javascript:;">Clear All</a></div>`;

  document.getElementById('selected-filters').innerHTML = html.concat('', clearAllHandle);

  updateURLWithFilters();  // Call this at the end of the function
}

//Updating URLs when filters applied
function updateURLWithFilters() {
  const queryString = getQueryString();
  let refinedParams = {};

  // Split the query string into individual parameters
  const params = new URLSearchParams(queryString);

  // Iterate over each parameter
  for (let [key, value] of params.entries()) {
      if (key === "year") {
          refinedParams['minYear'] = value.split(" - ")[0];
          refinedParams['maxYear'] = value.split(" - ")[1];
      } else if (key === "mileage") {
          refinedParams['minMileage'] = value.split(" - ")[0];
          refinedParams['maxMileage'] = value.split(" - ")[1];
      } else if (key === "price") {
          const prices = value.replace(/[$,]/g, '').split(" - ");
          refinedParams['minPrice'] = prices[0];
          refinedParams['maxPrice'] = prices[1];
      } else {
          // For checkbox filters
          if (!refinedParams[key]) {
              refinedParams[key] = [];
          }
          if (Array.isArray(refinedParams[key])) {
              refinedParams[key].push(value);
          }
      }
  }

  // Convert the refinedParams object back to a query string format
  const refinedQueryString = Object.entries(refinedParams).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
          return value.map(v => `${key}=${v}`);
      } else {
          return `${key}=${value}`;
      }
  }).join('&');

  // Construct the new URL
  const newURL = window.location.origin + window.location.pathname + "?" + refinedQueryString;
  console.log("New URL:", newURL);  // Log the new URL
  window.history.pushState({ path: newURL }, '', newURL);
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

  document.getElementById('found-vehicle-count').innerHTML = totalCount

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
  <div class="col-sm-6 col-lg-4 col-md-6 col-xl-3 mt-3">
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

  // Get the idVehicle from the card element
  const card = event.target.closest('.col-sm-6');
  const idVehicle = card.querySelector('a').getAttribute('href').split('=')[1];
  console.log('idVehicle:', idVehicle);

  // Retrieve the vehicle information from the vehicle card using the correct class 'car-name'
  const vehicleTitleElement = card.querySelector('.car-name');
  if (vehicleTitleElement) {
    const vehicleTitle = vehicleTitleElement.textContent.trim();
    console.log('vehicleTitle:', vehicleTitle);

    // Create the modal using our function from step 1
    const modalHTML = generateModalHTML(idVehicle, vehicleTitle); // Pass the vehicleTitle as the second parameter
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv);

    // Display the modal
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();

    // Remove the modal from the page once it's closed
    document.getElementById('scheduleModal').addEventListener('hidden.bs.modal', function () {
      this.remove();
    });
  } else {
    console.error('Unable to retrieve vehicle title from vehicle card');
  }
}







let schedule = {};

function handleScheduleInputChange(event) {
  const { name, value } = event.target
  schedule[name] = value

  console.log('handleScheduleInputChange called with name:', name, 'and value:', value);
  console.log('Updated schedule:', schedule);
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
  const parent = event.target.parentElement;
  const icon = parent.firstElementChild;
  const textarea = parent.nextElementSibling;
  const isHidden = textarea.classList.contains('d-none');

  if (isHidden) {
    icon.classList.remove('fa-plus');
    icon.classList.add('fa-minus');
    textarea.classList.remove('d-none');
  } else {
    icon.classList.add('fa-plus');
    icon.classList.remove('fa-minus');
    textarea.classList.add('d-none');
  }
}


function generateModalHTML(idVehicle, vehicleTitle) {
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
                      <input type="hidden" name="idVehicle" value="${idVehicle}" />
                      <div>
                          <span class="ms-0">Hello my name is</span>
                          <input class="custom-input" type="text" name="firstName" placeholder="First name" oninput="handleScheduleInputChange(event)" required pattern="[A-Za-z]{2,}" title="Please enter a valid first name" />
                          <input class="custom-input" type="text" name="lastName" placeholder="Last name" oninput="handleScheduleInputChange(event)" required pattern="[A-Za-z]{2,}" title="Please enter a valid last name" />
                          <span>and I'd like to request more details for <b id="vehicle-title">${vehicleTitle}</b>. I'm in the</span>
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
                          <textarea class="custom-input" name="comment" placeholder="" oninput="handleScheduleInputChange(event)"></textarea>
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



async function scheduleTestDrive(event) {
  console.log("scheduleTestDrive function called");
  event.stopPropagation()
  event.preventDefault()

  console.log("local_vehicle:", local_vehicle); // Add this line

  document.getElementById('message-loader').classList.remove('d-none')

  const form = event.target;
  const formData = new FormData(form);
  const idVehicle = Number(formData.get('idVehicle')); // Convert to number
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const zip = formData.get('zip');
  const phone = formData.get('phone');
  const comment = formData.get('comment');
  const emailConsent = formData.get('emailConsent') === 'on';

  const payload = {
    firstName: firstName,
    lastName: lastName,
    emailAddress: email,
    emailConsent: emailConsent,
    zip: zip,
    phoneNumber: phone.replace(/\D/g, ''), // Reformat phone number
    comments: comment,
    vehicleId: idVehicle, // Now a number
    dealershipId: 1
  };

  console.log("payload:", payload); // Add this line

  const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net';
  const SaaSApiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ';

  const controller = new AbortController();
  const signal = controller.signal;

  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SaaSApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: signal
  };

  const fetchPromise = fetch(
    `${apiUrl}/api/leads/info-request`,
    requestOptions
  );

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      controller.abort();
      reject(new Error('Request timed out'));
    }, 10000)
  );

  Promise.race([fetchPromise, timeoutPromise])
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res;
    })
    .then((res) => {
      console.log('response', res)
      document.getElementById('schedule_form_success').innerHTML =
        'Successfully submitted! We will be in touch with you shortly.'
      document.getElementById('message-loader').classList.add('d-none')
    })
    .catch((err) => {
      console.error(err);
      document.getElementById('schedule_form_error').innerHTML =
        'Something went wrong. Please Text or Call us directly.'
      document.getElementById('message-loader').classList.add('d-none')
    })
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

let rangeData = {};

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

  document.getElementById('filtersAccordion').insertAdjacentHTML('beforeend', html)

  rangeData.minPrice = Math.min(...price)
  rangeData.maxPrice = Math.max(...price);

  rangeData.minYear = Math.min(...year)
  rangeData.maxYear = Math.max(...year);

  rangeData.minMileage = Math.min(...mileage)
  rangeData.maxMileage = Math.max(...mileage);

  const priceActualData = document.getElementById('price-actual-value')
  priceActualData.setAttribute('value', `${rangeData.minPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })} - ${rangeData.maxPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  })}`)

  const yearActualData = document.getElementById('year-actual-value')
  yearActualData.setAttribute('value', `${rangeData.minYear} - ${rangeData.maxYear}`)

  const mileageActualData = document.getElementById('mileage-actual-value')
  mileageActualData.setAttribute('value', `${rangeData.minMileage} - ${rangeData.maxMileage}`)

  handleRangeData('.priceValMin', '.priceValMax', rangeData.minPrice, rangeData.maxPrice)
  handleRangeData('.yearValMin', '.yearValMax', rangeData.minYear, rangeData.maxYear)
  handleRangeData('.mileageValMin', '.mileageValMax', rangeData.minMileage, rangeData.maxMileage)

}

//TODO: need to optimize
function handleRangeData(minSelector, maxSelector, minData, maxData) {
  const rangeMin = document.querySelectorAll(minSelector)
  const rangeMax = document.querySelectorAll(maxSelector)

  for (let index = 0; index < rangeMin.length; index++) {
    const element = rangeMin[index];
    element.setAttribute('value', minData)
    element.setAttribute('min', minData)
    element.setAttribute('max', maxData)
  }

  for (let index = 0; index < rangeMax.length; index++) {
    const element = rangeMax[index];
    element.setAttribute('value', maxData)
    element.setAttribute('min', minData)
    element.setAttribute('max', maxData)
  }
}


setTimeout(function () {
  handleRangeData('.priceValMin', '.priceValMax', rangeData.minPrice, rangeData.maxPrice)
  handleRangeData('.yearValMin', '.yearValMax', rangeData.minYear, rangeData.maxYear)
  handleRangeData('.mileageValMin', '.mileageValMax', rangeData.minMileage, rangeData.maxMileage)
}, 2000);

function updateItems(label, option) {
  if (option != null) {
    const colorContent = (label, option) => `<div class="d-flex  justify-content-between">
              <div class="form-check f-checkbox">
                <input class="form-check-input f-checkbox-input" type="checkbox" id="${label}_${option}" data-id="${separateCamelCase(label)}" name="${label}" value="${option}" onchange="handleInputChange(event)" >
                <label class="form-check-label" for="${label}_${option}">${option}</label>
              </div>
              <div class="f-color-item" style="${colorPiker(option)}"></div>
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
                <input class="form-check-input f-checkbox-input" type="checkbox" id="${label}_${option}" data-id="${separateCamelCase(label)}" name="${label}" value="${option}" onchange="handleInputChange(event)" >
                <label class="form-check-label" for="${label}_${option}">${option}</label>
              </div>`
    }
  }
}

function colorPiker(colorName) {
  switch (colorName.toLowerCase()) {
    case 'burgundy':
      return 'background-color: #800020';
      break;
    case 'white':
      return 'background-color: #fff; border:1px solid #d8d8d8';
      break;
    case 'other':
      return 'background-color: #E91E63; box-shadow: inset -8px 6px 6px 0px rgb(33 150 243 / 84%);'
      break;
    default:
      return 'background-color:' + colorName.toLowerCase()
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
