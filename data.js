export const campusData = {
  mapaCentro: [-21.5440, -64.7223],
  mapaZoom: 17,

  facultades: [
    {
      id: "accesos",
      nombre: "Accesos Principales",
      descripcion: "Entradas al Campus El Tejar",
      bloques: [
        { id: "entrada_principal", nombre: "Entrada Principal", descripcion: "Acceso sobre la Av. Universitaria.", coordenadas: [-21.542120, -64.722057], nodoFachadaId: "entrada_principal" },
        { id: "entrada_espana", nombre: "Entrada España", descripcion: "Acceso por calle España.", coordenadas: [-21.544550, -64.723625], nodoFachadaId: "entrada_espana" }
      ]
    },
    {
      id: "tecnologia",
      nombre: "Facultad de Ciencias y Tecnología",
      descripcion: "Ingenierías y laboratorios.",
      bloques: [
        { id: "ing_informatica", nombre: "Ingeniería Informática", descripcion: "Bloque de Informática.", coordenadas: [-21.545470, -64.722335], nodoFachadaId: "ing_informatica" },
        { id: "ing_civil_delante", nombre: "Ingeniería Civil", descripcion: "Bloque de Civil.", coordenadas: [-21.543750, -64.721990], nodoFachadaId: "ing_civil_delante" },
        // Coordenada ajustada a la izquierda (Oeste) para que no tape a camino_3
        { id: "lab_suelos_antiguo", nombre: "Lab. de Suelos (Antiguo)", descripcion: "Laboratorio de Suelos.", coordenadas: [-21.543310, -64.722525], nodoFachadaId: "lab_suelos_antiguo" }
      ]
    },
    {
      id: "agronomia",
      nombre: "Facultad de Ciencias Agrícolas",
      descripcion: "Agronomía y Forestal.",
      bloques: [
        { id: "ciencias_agricolas_y_forestales", nombre: "Ciencias Agrícolas", descripcion: "Aulas de Agronomía.", coordenadas: [-21.542812, -64.721745], nodoFachadaId: "ciencias_agricolas_y_forestales" }
      ]
    },
    {
      id: "otros",
      nombre: "Otros Edificios",
      descripcion: "Servicios e Institutos",
      bloques: [
        { id: "dtic_delante", nombre: "DTIC", descripcion: "Departamento de Tecnologías de Información y Comunicación.", coordenadas: [-21.544800, -64.722260], nodoFachadaId: "dtic_delante" }
      ]
    }
  ],

  recorrido360: {
    "camino_1": { imagen: "/fotos360/camino_1.jpeg", coordenadas: [-21.542400, -64.722080], yawInicial: 75, enlaces: [ { targetId: "camino_2", pitch: 0, yaw: 70 }, { targetId: "entrada_principal", pitch: 0, yaw: -110 }, { targetId: "ciencias_agricolas_y_forestales", pitch: 0, yaw: 0 } ] },
    "camino_2": { imagen: "/fotos360/camino_2.jpeg", coordenadas: [-21.542928, -64.722190], yawInicial: 180, enlaces: [ { targetId: "camino_1", pitch: 0, yaw: 0 }, { targetId: "camino_3", pitch: 0, yaw: 180 }, { targetId: "ciencias_agricolas_y_forestales", pitch: 0, yaw: 60 }, { targetId: "camino_9", pitch: 0, yaw: 115 } ] },
    "camino_3": { imagen: "/fotos360/camino_3.jpeg", coordenadas: [-21.543359, -64.722288], yawInicial: 180, enlaces: [ { targetId: "camino_2", pitch: 0, yaw: 0 }, { targetId: "lab_suelos_antiguo", pitch: 0, yaw: -90 }, { targetId: "ing_civil_detras", pitch: 0, yaw: -175 } ] },
    "camino_4": { imagen: "/fotos360/camino_4.jpeg", coordenadas: [-21.544230, -64.722464], yawInicial: 10, enlaces: [ { targetId: "ing_civil_detras", pitch: 0, yaw: 180 }, { targetId: "camino_5", pitch: 0, yaw: -90 }, { targetId: "dtic_detras", pitch: 0, yaw: 5 } ] },
    "camino_5": { imagen: "/fotos360/camino_5.jpeg", coordenadas: [-21.544286, -64.722121], yawInicial: -80, enlaces: [ { targetId: "camino_4", pitch: 0, yaw: 5 }, { targetId: "ing_civil_delante", pitch: 0, yaw: 90 }, { targetId: "dtic_delante", pitch: 0, yaw: -80 } ] },
    "camino_6": { imagen: "/fotos360/camino_6.jpeg", coordenadas: [-21.545150, -64.722300], yawInicial: -165, enlaces: [ { targetId: "dtic_delante", pitch: 0, yaw: 5 }, { targetId: "ing_informatica", pitch: 0, yaw: -165 }, { targetId: "camino_7", pitch: 0, yaw: -65 } ] },
    "camino_7": { imagen: "/fotos360/camino_7.jpeg", coordenadas: [-21.545053, -64.722637], yawInicial: 100, enlaces: [ { targetId: "dtic_detras", pitch: 0, yaw: -90 }, { targetId: "camino_6", pitch: 0, yaw: 15 }, { targetId: "camino_8", pitch: 0, yaw: -160 } ] },
    "camino_8": { imagen: "/fotos360/camino_8.jpeg", coordenadas: [-21.544626, -64.723500], yawInicial: 180, enlaces: [ { targetId: "camino_7", pitch: 0, yaw: 180 }, { targetId: "entrada_espana", pitch: 0, yaw: 0 } ] },
    "camino_9": { imagen: "/fotos360/camino_9.jpeg", coordenadas: [-21.543158, -64.721834], yawInicial: 0, enlaces: [ { targetId: "ciencias_agricolas_y_forestales", pitch: 0, yaw: 150 }, { targetId: "camino_2", pitch: 0, yaw: 100 }, { targetId: "ing_civil_delante", pitch: 0, yaw: 0 } ] },
    "ciencias_agricolas_y_forestales": { imagen: "/fotos360/ciencias_agricolas_y_forestales.jpeg", coordenadas: [-21.542812, -64.721745], yawInicial: 0, enlaces: [ { targetId: "camino_1", pitch: 0, yaw: -140 }, { targetId: "camino_2", pitch: 0, yaw: 165 }, { targetId: "camino_9", pitch: 0, yaw: 115 } ] },
    "dtic_delante": { imagen: "/fotos360/dtic_delante.jpeg", coordenadas: [-21.544786, -64.722296], yawInicial: 10, enlaces: [ { targetId: "camino_5", pitch: 0, yaw: 105 }, { targetId: "camino_6", pitch: 0, yaw: -80 }, { targetId: "dtic_detras", pitch: 0, yaw: 10 } ] },
    "dtic_detras": { imagen: "/fotos360/dtic_detras.jpeg", coordenadas: [-21.544686, -64.722555], yawInicial: 90, enlaces: [ { targetId: "camino_4", pitch: 0, yaw: -90 }, { targetId: "camino_7", pitch: 0, yaw: 90 }, { targetId: "dtic_delante", pitch: 0, yaw: 0 } ] },
    "entrada_espana": { imagen: "/fotos360/entrada_espana.jpeg", coordenadas: [-21.544566, -64.723720], yawInicial: 50, enlaces: [ { targetId: "camino_8", pitch: 0, yaw: 60 } ] },
    "entrada_principal": { imagen: "/fotos360/entrada_principal.jpeg", coordenadas: [-21.542120, -64.722057], yawInicial: -175, enlaces: [ { targetId: "camino_1", pitch: 0, yaw: -175 } ] },
    "ing_civil_delante": { imagen: "/fotos360/ing_civil_delante.jpeg", coordenadas: [-21.543728, -64.722013], yawInicial: 0, enlaces: [ { targetId: "camino_5", pitch: 0, yaw: -88 }, , { targetId: "camino_9", pitch: 0, yaw: 90 }, { targetId: "ing_civil_detras", pitch: 0, yaw: 0} ] },
    "ing_civil_detras": { imagen: "/fotos360/ing_civil_detras.jpeg", coordenadas: [-21.543680, -64.722352], yawInicial: 100, enlaces: [ { targetId: "camino_3", pitch: 0, yaw: -85 }, { targetId: "camino_4", pitch: 0, yaw: 95 },  { targetId: "ing_civil_delante", pitch: 0, yaw: 10 } ] },
    "ing_informatica": { imagen: "/fotos360/ing_informatica.jpeg", coordenadas: [-21.545411, -64.722380], yawInicial: 0, enlaces: [ { targetId: "camino_6", pitch: 0, yaw: -175 } ] },
    "lab_suelos_antiguo": { imagen: "/fotos360/lab_suelos_antiguo.jpeg", coordenadas: [-21.543310, -64.722525], yawInicial: 0, enlaces: [ { targetId: "camino_3", pitch: 0, yaw:180 } ] }
  }
};