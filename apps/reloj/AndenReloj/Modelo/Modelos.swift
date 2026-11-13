import Foundation

/// lo que el reloj sabe de un boleto: viene de la tabla `boletos`, con el detalle dentro de `contenido`
struct Boleto: Decodable, Identifiable {
    struct Contenido: Decodable {
        struct Detalle: Decodable { let codigo: String? }
        struct Resumen: Decodable { let destino: String?; let plus: Bool? }
        let boleto: Detalle?
        let resumen: Resumen?
    }
    let boletoId: String
    let viajeId: String
    let asiento: Int
    let estado: String
    let contenido: Contenido?

    var id: String { boletoId }
    var codigo: String { contenido?.boleto?.codigo ?? boletoId }

    enum CodingKeys: String, CodingKey {
        case boletoId = "boleto_id", viajeId = "viaje_id", asiento, estado, contenido
    }
}

/// un viaje publicado por el conductor
struct Viaje: Decodable, Identifiable {
    let id: String
    let rutaId: String
    let servicio: String
    let placa: String
    let anden: Int
    let salida: Date
    let estado: String
    let salioEn: Date?

    enum CodingKeys: String, CodingKey {
        case id, servicio, placa, anden, salida, estado
        case rutaId = "ruta_id", salioEn = "salio_en"
    }
}

/// la última posición que transmitió el bus
struct Transmision: Decodable {
    let lat: Double?
    let lng: Double?
}

/// un viaje del pasajero junto con su boleto
struct Reserva: Identifiable {
    let boleto: Boleto
    let viaje: Viaje
    var id: String { boleto.id }
}
