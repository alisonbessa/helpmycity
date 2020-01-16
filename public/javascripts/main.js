function startMap() {

  // São Paulo's coordinates
  const saoPaulo = { lat: -23.5505199,  lng: -46.6333094 };

  // Initialize the map
  const map = new google.maps.Map(document.getElementById('map'), 
    {
      zoom: 13,
      center: saoPaulo
    }
  );


  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const user_location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      // Center map with user location
      map.setCenter(user_location);

    }, function () {
      console.log('Error in the geolocation service.');
    });
  } else {
    console.log('Browser does not support geolocation.');
  }
}
startMap();


/* 

main.js --> busca endereços e traz coordenadas lat/long:
const geocoder = new google.maps.Geocoder();
// Ao sair do campo 'address' popula os campos do formulário id='Latitude' e id='Longitude' no formulario
const placeAddress = document.getElementById('placeAddress')
if (placeAddress) {
  placeAddress.addEventListener('focusout', function () {
    geocodeAddress(geocoder);
  });
}
function geocodeAddress(geocoder) {
  let address = document.getElementById('placeAddress').value;
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === 'OK') {
      // console.log(results)
      document.getElementById('placeLatitude').value = results[0].geometry.location.lat();
      document.getElementById('placeLongitude').value = results[0].geometry.location.lng();
    } else {
      // alert('Geocode was not successful for the following reason: ' + status);
      alert('Digite um endereço válido');
    }
  });
}







*/