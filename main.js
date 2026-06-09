import { campusData } from './data.js';

// ==========================================================================
// Variables Globales
// ==========================================================================
let mainMap = null;
let mainTileLayer = null;
let panoViewer = null;
let minimap = null;
let minimapTileLayer = null;
let minimapMarkers = {};
let currentNodeId = null;
const mainMapMarkers = {};

// Geolocalización en Tiempo Real
let isTracking = false;
let watchId = null;
let userMarker = null;
let userMinimapMarker = null;

// ==========================================================================
// Elementos del DOM
// ==========================================================================
const facultadesListEl = document.getElementById('facultades-list');
const searchInputEl = document.getElementById('search-input');
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebarEl = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mapViewSection = document.getElementById('map-view');
const panoViewSection = document.getElementById('pano-view');
const exitPanoBtn = document.getElementById('exit-pano-btn');
const currentBlockTitle = document.getElementById('current-block-title');
const currentNodeTitle = document.getElementById('current-node-title');
const panoMinimapContainer = document.getElementById('pano-minimap-container');
const toggleMinimapBtn = document.getElementById('toggle-minimap-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const locateUserBtn = document.getElementById('locate-user-btn');

// ==========================================================================
// Funciones Auxiliares
// ==========================================================================
function obtenerNombreDestino(targetId) {
  let nombre = "Avanzar"; 
  
  if (targetId.startsWith('camino_') || targetId.endsWith('_detras')) {
    return nombre; 
  }

  campusData.facultades.forEach(fac => {
    fac.bloques.forEach(b => {
      if (b.nodoFachadaId === targetId) {
        nombre = b.nombre;
      }
    });
  });
  
  return nombre;
}

// ==========================================================================
// 1. Inicialización de la Aplicación
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMainMap();
  renderSidebar();
  setupEventListeners();

  if (window.innerWidth > 768) {
    sidebarEl.classList.add('open');
    const icon = menuToggleBtn.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-xmark';
  }
});

// ==========================================================================
// 2. Lógica de Temas (Modo Claro por Defecto)
// ==========================================================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeButtonIcon(newTheme);
  updateMapTiles();
}

function updateThemeButtonIcon(theme) {
  if (themeToggleBtn) {
    const icon = themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }
}

function updateMapTiles() {
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    
  if (mainTileLayer) mainTileLayer.setUrl(tileUrl);
  if (minimapTileLayer) minimapTileLayer.setUrl(tileUrl);
}

// ==========================================================================
// 3. Inicialización del Mapa Principal (2D)
// ==========================================================================
function initMainMap() {
  mainMap = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView(campusData.mapaCentro, campusData.mapaZoom);

  L.control.zoom({ position: 'bottomright' }).addTo(mainMap);

  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  mainTileLayer = L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(mainMap);

  const fachadasIds = new Set(); 

  campusData.facultades.forEach(facultad => {
    facultad.bloques.forEach(bloque => {
      
      if (bloque.nodoFachadaId) {
        fachadasIds.add(bloque.nodoFachadaId); 
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="custom-pin" id="pin-${bloque.id}">
            <i class="fa-solid fa-location-dot"></i>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker(bloque.coordenadas, { icon: customIcon }).addTo(mainMap);
      
      const hasNodes = bloque.nodoFachadaId && campusData.recorrido360[bloque.nodoFachadaId];
      // Popup limpio sin icono de gafas
      const buttonHtml = hasNodes 
        ? `<button class="btn-popup btn-entrar-360" data-fachada-id="${bloque.nodoFachadaId}">
             Visualizar
           </button>`
        : `<button class="btn-popup btn-secondary" style="cursor: not-allowed; opacity: 0.6;" disabled>
             Sin Vista 360 disponible
           </button>`;

      marker.bindPopup(`
        <div class="map-popup-card">
          <h3>${bloque.nombre}</h3>
          <p>${bloque.descripcion}</p>
          ${buttonHtml}
        </div>
      `);
      mainMapMarkers[bloque.id] = marker;
    });
  });

  Object.entries(campusData.recorrido360).forEach(([id, nodo]) => {
    
    if (fachadasIds.has(id)) return;

    const dotIcon = L.divIcon({
      className: 'streetview-dot-container',
      html: `<div class="streetview-dot"></div>`,
      iconSize: [16, 16], 
      iconAnchor: [8, 8]
    });

    const dotMarker = L.marker(nodo.coordenadas, { icon: dotIcon }).addTo(mainMap);
    
    dotMarker.on('click', () => {
      enterStreetView(id);
    });
  });
}

// ==========================================================================
// 4. Renderizado y Lógica del Sidebar
// ==========================================================================
function renderSidebar() {
  facultadesListEl.innerHTML = '';

  campusData.facultades.forEach(facultad => {
    const facultadLi = document.createElement('li');
    facultadLi.className = 'facultad-item';
    facultadLi.id = `fac-item-${facultad.id}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'facultad-header';
    headerDiv.innerHTML = `
      <div class="facultad-title-wrapper">
        <i class="fa-solid fa-graduation-cap facultad-icon"></i>
        <span class="facultad-name">${facultad.nombre}</span>
      </div>
      <i class="fa-solid fa-chevron-down chevron"></i>
    `;

    const bloquesUl = document.createElement('ul');
    bloquesUl.className = 'bloques-list';

    facultad.bloques.forEach(bloque => {
      const bloqueLi = document.createElement('li');
      bloqueLi.className = 'bloque-item';
      bloqueLi.dataset.blockId = bloque.id;
      
      // Sidebar limpio: Sin icono VR rojo
      bloqueLi.innerHTML = `<span>${bloque.nombre}</span>`;
      
      bloqueLi.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.bloque-item').forEach(el => el.classList.remove('active'));
        bloqueLi.classList.add('active');
        focusBlockOnMap(bloque.id);
        if (window.innerWidth <= 768) closeSidebar();
      });

      bloquesUl.appendChild(bloqueLi);
    });

    headerDiv.addEventListener('click', () => {
      const isActive = facultadLi.classList.contains('active');
      document.querySelectorAll('.facultad-item').forEach(item => {
        if (item !== facultadLi) item.classList.remove('active');
      });
      if (isActive) facultadLi.classList.remove('active');
      else facultadLi.classList.add('active');
    });

    facultadLi.appendChild(headerDiv);
    facultadLi.appendChild(bloquesUl);
    facultadesListEl.appendChild(facultadLi);
  });
}

function focusBlockOnMap(blockId) {
  const marker = mainMapMarkers[blockId];
  if (marker) {
    const coords = marker.getLatLng();
    mainMap.flyTo(coords, 18, { duration: 1.5, easeLinearity: 0.25 });
    setTimeout(() => { marker.openPopup(); }, 1100);
  }
}

// ==========================================================================
// 5. Configuración de Eventos de Interfaz
// ==========================================================================
function setupEventListeners() {
  menuToggleBtn.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (locateUserBtn) locateUserBtn.addEventListener('click', toggleGeolocation);
  exitPanoBtn.addEventListener('click', exitStreetView);
  toggleMinimapBtn.addEventListener('click', () => {
    panoMinimapContainer.classList.toggle('collapsed');
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-entrar-360');
    if (btn) {
      const fachadaId = btn.dataset.fachadaId;
      if (fachadaId) enterStreetView(fachadaId);
    }
  });

  setupSearch();
}

function setupSearch() {
  searchInputEl.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    campusData.facultades.forEach(facultad => {
      const facLi = document.getElementById(`fac-item-${facultad.id}`);
      let hasVisibleBlocks = false;
      const bloquesItems = facLi.querySelectorAll('.bloque-item');
      bloquesItems.forEach((item, index) => {
        const bloque = facultad.bloques[index];
        const nameMatches = bloque.nombre.toLowerCase().includes(query);
        const descMatches = bloque.descripcion.toLowerCase().includes(query);
        if (nameMatches || descMatches || query === '') {
          item.style.display = 'flex';
          hasVisibleBlocks = true;
        } else {
          item.style.display = 'none';
        }
      });
      const facMatches = facultad.nombre.toLowerCase().includes(query) || facultad.descripcion.toLowerCase().includes(query);
      if (facMatches || hasVisibleBlocks || query === '') {
        facLi.style.display = 'block';
        if (query !== '' && hasVisibleBlocks) facLi.classList.add('active');
        else if (query === '') facLi.classList.remove('active');
      } else {
        facLi.style.display = 'none';
        facLi.classList.remove('active');
      }
    });
  });
}

function toggleSidebar() {
  sidebarEl.classList.toggle('open');
  const isOpen = sidebarEl.classList.contains('open');
  const icon = menuToggleBtn.querySelector('i');
  if (icon) icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  if (window.innerWidth <= 768) {
    if (isOpen) sidebarOverlay.classList.remove('hidden');
    else sidebarOverlay.classList.add('hidden');
  }
}

function closeSidebar() {
  sidebarEl.classList.remove('open');
  const icon = menuToggleBtn.querySelector('i');
  if (icon) icon.className = 'fa-solid fa-bars';
  sidebarOverlay.classList.add('hidden');
}

function toggleGeolocation() {
  if (isTracking) {
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
    isTracking = false;
    locateUserBtn.classList.remove('active');
    if (userMarker) { mainMap.removeLayer(userMarker); userMarker = null; }
    if (userMinimapMarker && minimap) { minimap.removeLayer(userMinimapMarker); userMinimapMarker = null; }
  } else {
    if (!navigator.geolocation) { alert("Tu navegador no soporta geolocalización."); return; }
    locateUserBtn.classList.add('active');
    isTracking = true;
    watchId = navigator.geolocation.watchPosition(
      (position) => { updateUserLocationMarker([position.coords.latitude, position.coords.longitude]); },
      (error) => { console.error(error); alert("Error de geolocalización."); isTracking = false; locateUserBtn.classList.remove('active'); },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }
}

function updateUserLocationMarker(latLng) {
  const userIcon = L.divIcon({ className: 'custom-user-marker', html: '<div class="user-location-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
  if (!userMarker) {
    userMarker = L.marker(latLng, { icon: userIcon }).addTo(mainMap);
    userMarker.bindTooltip("Tu ubicación actual", { direction: 'top', offset: [0, -5] });
    mainMap.flyTo(latLng, 18);
  } else {
    userMarker.setLatLng(latLng);
  }
  if (minimap) createUserMinimapMarker(latLng);
}

function createUserMinimapMarker(latLng) {
  const userIcon = L.divIcon({ className: 'custom-user-marker', html: '<div class="user-location-pin"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
  if (!userMinimapMarker) {
    userMinimapMarker = L.marker(latLng, { icon: userIcon }).addTo(minimap);
    userMinimapMarker.bindTooltip("Tu ubicación actual", { direction: 'top', offset: [0, -5] });
  } else {
    userMinimapMarker.setLatLng(latLng);
  }
}

// ==========================================================================
// 6. Lógica de Red Global 360 (Pannellum)
// ==========================================================================
function enterStreetView(nodeId) {
  const nodo = campusData.recorrido360[nodeId];
  if (!nodo) return;

  currentNodeId = nodeId;

  if (sidebarEl.classList.contains('open')) closeSidebar();

  mapViewSection.classList.replace('active-view', 'inactive-view');
  panoViewSection.classList.replace('inactive-view', 'active-view');
  menuToggleBtn.classList.add('hidden');

  let blockTitle = "Recorrido Campus El Tejar";
  campusData.facultades.forEach(fac => {
    fac.bloques.forEach(b => {
      if (b.nodoFachadaId === nodeId) blockTitle = b.nombre;
    });
  });
  currentBlockTitle.textContent = blockTitle;
  
  load360Scene(nodeId);
  initPanoMinimap();
}

function load360Scene(nodeId) {
  const nodo = campusData.recorrido360[nodeId];
  if (!nodo) return;

  // --- Lógica Dinámica del Título y Botón Volver ---
  const isPathNode = nodeId.startsWith('camino_') || nodeId.endsWith('_detras');
  const titleElement = document.getElementById('current-block-title');
  
  if (titleElement) {
    if (isPathNode) {
      // Si es camino, solo ocultamos el texto, el botón Volver sigue vivo
      titleElement.style.display = 'none'; 
    } else {
      // Si es un edificio, mostramos el texto y lo actualizamos dinámicamente
      titleElement.style.display = 'block';
      let blockTitle = "Recorrido Campus El Tejar";
      campusData.facultades.forEach(fac => {
        fac.bloques.forEach(b => {
          if (b.nodoFachadaId === nodeId) blockTitle = b.nombre;
        });
      });
      titleElement.textContent = blockTitle;
    }
  }

  // Desactivamos completamente el texto rojo del "Nodo: X"
  if (currentNodeTitle) {
    currentNodeTitle.style.display = 'none';
  }

  if (panoViewer) {
    try { panoViewer.destroy(); } catch (e) {}
    panoViewer = null;
  }

  // --- CREAR HOTSPOTS DE SUELO DINÁMICAMENTE ---
  const hotspotsData = (nodo.enlaces || []).map(enlace => {
    return {
      pitch: enlace.pitch || -25, // -25 los tira hacia el suelo
      yaw: enlace.yaw || 0,       // Hacia dónde apunta (Norte, Sur, etc.)
      type: "custom",
      cssClass: "custom-floor-hotspot",
      createTooltipArgs: enlace.targetId,
      createTooltipFunc: function(hotSpotDiv, args) {
        // 1. Darle la función de clic para cambiar de foto
        hotSpotDiv.addEventListener('click', () => {
          change360Node(args);
        });
        
        // 2. Crear el texto flotante leyendo el nombre real del destino
        const tooltip = document.createElement('span');
        tooltip.className = 'hotspot-tooltip';
        tooltip.innerText = obtenerNombreDestino(args);
        hotSpotDiv.appendChild(tooltip);
      }
    };
  });

  // Crear viewer de Pannellum CON hotSpots nativos
  panoViewer = pannellum.viewer('panorama', {
    type: 'equirectangular',
    panorama: nodo.imagen,
    autoLoad: true,
    yaw: nodo.yawInicial || 0,
    pitch: nodo.pitchInicial || 0,
    showControls: false,
    compass: false,
    hotSpots: hotspotsData // ¡Aquí le pasamos nuestras flechas!
  });
}

function renderNavigationHUD(enlaces) {
  let hudContainer = document.getElementById('nav-hud-container');
  if (!hudContainer) {
    hudContainer = document.createElement('div');
    hudContainer.id = 'nav-hud-container';
    hudContainer.className = 'nav-hud-container';
    const panoView = document.getElementById('pano-view');
    if (panoView) panoView.appendChild(hudContainer);
  }
  hudContainer.innerHTML = ''; 

  if (!enlaces || enlaces.length === 0) return;

  enlaces.forEach((enlace) => {
    const btn = document.createElement('button');
    btn.className = 'hud-nav-btn';
    btn.dataset.targetId = enlace.targetId;

    // MAGIA AQUI: Usamos la función auxiliar para los nombres
    const text = enlace.text || obtenerNombreDestino(enlace.targetId);
    
    let iconClass = 'fa-solid fa-arrow-up'; 
    const lowerText = text.toLowerCase();
    if (lowerText.includes('atrás') || lowerText.includes('atras') || lowerText.includes('volver') || lowerText.includes('salir')) {
      iconClass = 'fa-solid fa-arrow-down';
    } else if (lowerText.includes('izquierda') || lowerText.includes('oeste')) {
      iconClass = 'fa-solid fa-arrow-left';
    } else if (lowerText.includes('derecha') || lowerText.includes('este')) {
      iconClass = 'fa-solid fa-arrow-right';
    } else if (lowerText.includes('norte') || lowerText.includes('avanzar') || lowerText.includes('adelante') || lowerText.includes('entrar') || lowerText.includes('subir')) {
      iconClass = 'fa-solid fa-arrow-up';
    } else if (lowerText.includes('sur') || lowerText.includes('bajar')) {
      iconClass = 'fa-solid fa-arrow-down';
    }

    btn.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${text}</span>
    `;

    btn.addEventListener('click', () => {
      change360Node(enlace.targetId);
    });

    hudContainer.appendChild(btn);
  });
}

function change360Node(targetNodeId) {
  currentNodeId = targetNodeId;
  load360Scene(targetNodeId);
  updateMinimapState();
}

function initPanoMinimap() {
  if (minimap) {
    minimap.remove();
    minimap = null;
    minimapMarkers = {};
  }

  const activeNode = campusData.recorrido360[currentNodeId];

  minimap = L.map('pano-minimap', {
    zoomControl: false,
    attributionControl: false
  }).setView(activeNode.coordenadas, 18);

  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  minimapTileLayer = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(minimap);

  Object.entries(campusData.recorrido360).forEach(([id, nodo]) => {
    const isCurrent = id === currentNodeId;
    const markerDom = document.createElement('div');
    markerDom.className = `mini-pin ${isCurrent ? 'active' : ''}`;
    
    const miniIcon = L.divIcon({
      className: 'custom-minimap-marker',
      html: markerDom,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const marker = L.marker(nodo.coordenadas, { icon: miniIcon }).addTo(minimap);
    marker.on('click', () => { if (id !== currentNodeId) change360Node(id); });
    minimapMarkers[id] = marker;
  });

  if (isTracking && userMarker) createUserMinimapMarker(userMarker.getLatLng());

  setTimeout(() => {
    if (minimap) {
      minimap.invalidateSize();
      const node = campusData.recorrido360[currentNodeId];
      if (node) minimap.setView(node.coordenadas, 18);
    }
  }, 200);
}

function updateMinimapState() {
  if (!minimap) return;
  Object.entries(minimapMarkers).forEach(([id, marker]) => {
    const element = marker.getElement();
    if (element) {
      const pinDiv = element.querySelector('.mini-pin');
      if (pinDiv) {
        if (id === currentNodeId) pinDiv.classList.add('active');
        else pinDiv.classList.remove('active');
      }
    }
  });
  const activeNode = campusData.recorrido360[currentNodeId];
  if (activeNode) minimap.panTo(activeNode.coordenadas);
}

function exitStreetView() {
  if (panoViewer) {
    try { panoViewer.destroy(); } catch (e) { console.error(e); }
    panoViewer = null;
  }
  if (userMinimapMarker && minimap) { minimap.removeLayer(userMinimapMarker); userMinimapMarker = null; }
  if (minimap) { minimap.remove(); minimap = null; minimapMarkers = {}; }

  menuToggleBtn.classList.remove('hidden');
  panoViewSection.classList.replace('active-view', 'inactive-view');
  mapViewSection.classList.replace('inactive-view', 'active-view');
}