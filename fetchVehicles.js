async function fetchVehicles() {
    const dealerId = '1';
    const apiUrl = 'https://dealers-website-hub-api.azurewebsites.net';
    const dealerApiToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImtpcmFrb3N5YW5kYXZpZGRldkBnbWFpbC5jb20iLCJzdWIiOjEsImRlYWxlcnNoaXAiOjEsInJvbGUiOiJERUFMRVJfQURNSU4iLCJpYXQiOjE2ODE4MzAyODIsImV4cCI6MTY4MTkxNjY4Mn0.jGifLS5ezj43hqJVrbFeFRlyDg1_j4MESQMdPC5tAyQ';
    try {
        const response = await fetch(`${apiUrl}/api/vehicles?idDealership=${dealerId}`, {
            headers: {
                'Authorization': `Bearer ${dealerApiToken}`,
            },
        });
        const vehicles = await response.json();
        displayVehicles(vehicles.results);
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
    }
}
function displayVehicles(vehicles) {
    const vehicleListElement = document.getElementById("vehicle-list");
    vehicles.forEach((vehicle) => {
        const vehicleCardDiv = document.createElement("div");
        vehicleCardDiv.classList.add("vehicle-card");
        const vehicleCardLink = document.createElement("a");
        vehicleCardLink.href = `vehicle-details.html?id=${vehicle.idVehicle}`;
        vehicleCardLink.classList.add("vehicle-card-link");
        vehicleCardDiv.appendChild(vehicleCardLink);
        if (vehicle.images && vehicle.images.length > 0) {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("vehicle-image");
            const img = document.createElement("img");
            img.src = vehicle.images[0].url;
            img.alt = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
            imgContainer.appendChild(img);
            vehicleCardLink.appendChild(imgContainer);
        }
        vehicleCardLink.innerHTML += `
    <div class="vehicle-details">
      <h3>${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim ? vehicle.trim : ""}</h3>
      <p>Price: $${vehicle.price} | Mileage: ${vehicle.mileage}</p>
      <button class="contact-us">Contact Us</button>
      <button class="schedule-test-drive">Schedule a Test Drive</button>
    </div>
  `;
        vehicleListElement.appendChild(vehicleCardDiv);
    });
}
window.fetchVehicles = fetchVehicles;
fetchVehicles();
//# sourceMappingURL=fetchVehiclesTemplate.js.map