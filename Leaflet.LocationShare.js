
L.LocShare = {}
var LS = L.LocShare
LS.Send = {}
LS.Send.Marker = {}
LS.Send.Popup = L.responsivePopup().setContent(`
  <div>
    <input id="sendText" type="text" style="border-color:#a7a7a7;border:solid;border-width:2px;border-radius:5px;height:30px;" size="30" onkeyup="L.LocShare.Send.UpdateMessage( this )" placeholder="Enter your message"/>
  </div>
  <div style="text-align:center">
    <i class="link-icon fas fa-link fa-2x" onclick="copyPrompt()"></i>
    <i class="link-icon fab fa-facebook fa-2x" onclick="shareFb()"></i>
    <i class="link-icon fab fa-twitter fa-2x" onclick="shareTw()"></i>
    <i class="link-icon fab fa-linkedin fa-2x" onclick="shareIn()"></i>
    <i class="link-icon fab fa-whatsapp fa-2x" onclick="shareWA()"></i>
    <i class="link-icon fas fa-sms fa-2x" onclick="shareSMS()"></i>
  </div>
`);
LS.Receive = {}
LS.Receive.Marker = {}
LS.Receive.Popup = L.popup()
var sendIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/CliffCloud/Leaflet.LocationShare/master/dist/images/IconMapSend.png",
  iconSize:     [50, 50], // size of the icon
  iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
})

receiveIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/CliffCloud/Leaflet.LocationShare/master/dist/images/IconMapReceive.png",
  iconSize:     [50, 50], // size of the icon
  iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
  popupAnchor:  [0, -30] // point from which the popup should open relative to the iconAnchor
})

L.Map.addInitHook(function () {
  this.sharelocationControl = new L.Control.ShareLocation();
  this.addControl(this.sharelocationControl);
  this.whenReady( function(){
    populateMarker(this);
  })
});

L.Control.ShareLocation = L.Control.extend({
    options: {
        position: 'topleft',
        title: 'share location'
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        this.link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        this.link.title = this.options.title;
        var userIcon = L.DomUtil.create('img' , 'img-responsive' , this.link);
        userIcon.src = 'https://raw.githubusercontent.com/CliffCloud/Leaflet.LocationShare/master/dist/images/IconLocShare.png';
        userIcon.alt = '';
        userIcon.setAttribute('role', 'presentation');
        this.link.href = '#';
        this.link.setAttribute('role', 'button');

        L.DomEvent.on(this.link, 'click', this._click, this);

        return container;
    },

    _click: function (e) {
      L.DomEvent.stopPropagation(e);
      L.DomEvent.preventDefault(e);
      placeMarker( this._map )
    },
});

populateMarker = function (selectedMap) {
  // replace the line below with the results of any Url parser
  var intermediate = getJsonFromUrl()
  if ( isFinite(intermediate.lat) && isFinite(intermediate.lng) ){
    LS.Receive.message = intermediate.M
    LS.Receive.lat = + intermediate.lat 
    console.log( intermediate.lat )
    LS.Receive.lng = + intermediate.lng 
    console.log( intermediate.lng )
    var text = '<table><tr><td><p>' + LS.Receive.message + '</p></td><td><p>Lat: ' + LS.Receive.lat + '</p><p>Lng: ' + LS.Receive.lng + '</p></td></tr></table>'
//    LS.Receive.Popup.setContent(LS.Receive.message)
    LS.Receive.Marker = L.marker( [ LS.Receive.lat , LS.Receive.lng] , {icon:receiveIcon})
    console.log( LS.Receive.Marker._latlng )
    LS.Receive.Marker.bindPopup(LS.Receive.message) 
    LS.Receive.Marker.addTo(selectedMap)
    LS.Receive.Marker.openPopup()
    console.log(window.parent.history);
    window.parent.history.pushState({}, '', window.parent.location.pathname);
  } 
}

function getJsonFromUrl () {
  var params = {}
  params.query = location.search.substr(1);
  params.parsed = decodeURIComponent( params.query )
  params.data = params.parsed.split("&");
  params.result = {};
  for(var i=0; i<params.data.length; i++) {
    var item = params.data[i].split("=");
    params.result[item[0]] = item[1];
  }
  // This will return all of the data in the query parameters in object form
  // getJsonFromUrl() only splits on ampersand and equals -- jquery can do better
  // But so could you!! submit a pull request if you've got one!
  return params.result;
}


function generateLink() {
  return window.parent.location.origin + window.parent.location.pathname + '?' + 
    'lat' + '=' + LS.Send.lat + '&' +
    'lng' + '=' + LS.Send.lng + '&' +
    'M' + '=' +  (LS.Send.Message !== undefined ? LS.Send.Message : "") +
    window.location.hash;
}

function copyPrompt() {
  window.prompt("Send this location with: Ctrl+C, Enter", generateLink());
}

function shareFb() {
  window.open('https://www.facebook.com/sharer.php?u=' + encodeURIComponent(generateLink()) + '&redirect_url=' + window.parent.location.href, '_blank');
}

function shareTw() {
  window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(generateLink()), '_blank');
}

function shareIn() {
  window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(generateLink()), '_blank');
}

function shareWA() {
  window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(generateLink()), '_blank');
}

function shareSMS() {
  window.open('sms:?body=' + encodeURIComponent(generateLink()));
}

function placeMarker( selectedMap ){
//  var test = LS.Send.Marker._latlng
//  if ( isFinite(test.lat) && isFinite(test.lng) ){
    if (!LS.Send.Marker._latlng ) {
      console.log('if (!LS.Send.Marker._latlng ) { passed!  line 95')
      LS.Send.Marker = L.marker( selectedMap.getCenter() , {draggable: true,icon: sendIcon} );
      setSendValues( selectedMap.getCenter() )
      LS.Send.Marker.on('dragend', function(event) {
        setSendValues( event.target.getLatLng());
        LS.Send.Marker.openPopup();
      });
      LS.Send.Marker.bindPopup(LS.Send.Popup);
      LS.Send.Marker.addTo(selectedMap);
    } else {
      LS.Send.Marker.setLatLng( selectedMap.getCenter() )
    }
    //selectedMap.setView( location , 16 )
    LS.Send.Marker.openPopup();
//  }
};

LS.Send.UpdateMessage = function( text ){
  var encodedForUrl = encodeURIComponent( text.value );
  LS.Send.Message = encodedForUrl
}

function setSendValues( result ){
  LS.Send.lat = result.lat;
  LS.Send.lng = result.lng; 
}
  
