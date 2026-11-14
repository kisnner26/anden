import ActivityKit
import Foundation

/// Mismo contenido que targets/actividad/AtributosViaje.swift: los dos destinos deben coincidir.
struct AtributosViaje: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var puntoEncuentro: String
    var estado: String
    /// en qué momento está el viaje: espera, abordando, atrasado, ruta o llego; define el color y el dibujo
    var fase: String
  }

  var destino: String
  var salida: Date
  var origen: String
  /// desde cuándo se llena la barra que avanza hacia la salida
  var desde: Date
}
