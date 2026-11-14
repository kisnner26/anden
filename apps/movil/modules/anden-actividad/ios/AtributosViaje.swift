import ActivityKit
import Foundation

/// Mismo contenido que modules/anden-actividad/ios/AtributosViaje.swift: los dos destinos deben coincidir.
struct AtributosViaje: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var puntoEncuentro: String
    var estado: String
  }

  var destino: String
  var salida: Date
}
