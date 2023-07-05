async function fetchVehicleDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get('id');
    if (!vehicleId) {
        console.error('Vehicle ID not provided');
        return;
    }
    const dealerApiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ';
    const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net';
    try {
        const response = await fetch(`${apiUrl}/api/vehicles/${vehicleId}`, {
            headers: {
                'Authorization': `Bearer ${dealerApiToken}`,
            },
        });
        const vehicle = await response.json();
        displayVehicleDetails(vehicle);
    }
    catch (error) {
        console.error('Error fetching vehicle details:', error);
    }
}
function displayVehicleDetails(vehicle) {
    if (!vehicle) {
        console.error('No vehicle data received');
        return;
    }
    const vehicleImages = document.querySelector('.vehicle-images');
    if (vehicle.images) {
        vehicle.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image.url;
            img.alt = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            vehicleImages.appendChild(img);
        });
    }
    const basicInfo = document.querySelector('.basic-info');
    basicInfo.innerHTML = `
      <h2>${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim ? vehicle.trim : ''}</h2>
      <p>VIN: ${vehicle.vin}</p>
      <p>Stock Number: ${vehicle.stockNumber}</p>
      <p>Exterior Color: ${vehicle.exteriorColor}</p>
      <p>Interior Color: ${vehicle.interiorColor}</p>
      <p>Transmission: ${vehicle.transmission}</p>
      <p>Mileage: ${vehicle.mileage}</p>
    `;
    const features = document.querySelector('.features');
    features.innerHTML = '<h3>Features</h3>';
    const ul = document.createElement('ul');
    vehicle.options.forEach(option => {
        const li = document.createElement('li');
        li.textContent = option.value;
        ul.appendChild(li);
    });
    features.appendChild(ul);
    const pricing = document.querySelector('.pricing');
    pricing.innerHTML = `
      <h3>Price: $${vehicle.price.toLocaleString()}</h3>
      <p>${vehicle.legalDisclaimer}</p>
    `;
    const contactDealer = document.querySelector('.contact-dealer');
    contactDealer.innerHTML = `
      <h3>Contact Dealer</h3>
      <p>Phone: (555) 123-4567</p>
      <p>Email: info@yourdealership.com</p>
    `;
}
window.fetchVehicleDetails = fetchVehicleDetails;
fetchVehicleDetails();
//# sourceMappingURL=fetchVehicleDataTemplate.js.map