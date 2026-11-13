import Foundation

/// las tres terminales de Andén y cómo se llama cada ruta; los mismos datos que usa la app del teléfono
enum Terminal: String {
    case boaco, juigalpa, managua

    var nombre: String {
        switch self {
        case .boaco: "Boaco"
        case .juigalpa: "Juigalpa"
        case .managua: "Managua"
        }
    }

    var lat: Double {
        switch self {
        case .boaco: 12.4693
        case .juigalpa: 12.1062
        case .managua: 12.1364
        }
    }

    var lng: Double {
        switch self {
        case .boaco: -85.6597
        case .juigalpa: -85.3636
        case .managua: -86.2514
        }
    }
}

struct Ruta {
    let origen: Terminal
    let destino: Terminal

    /// de «rut_may_boa» saca origen y destino; nil si el identificador no tiene esa forma
    init?(id: String) {
        let codigos: [String: Terminal] = ["boa": .boaco, "jui": .juigalpa, "may": .managua]
        let partes = id.split(separator: "_").map(String.init)
        guard partes.count >= 3, let o = codigos[partes[1]], let d = codigos[partes[2]] else { return nil }
        origen = o
        destino = d
    }

    var nombre: String { "\(origen.nombre) → \(destino.nombre)" }

    /// qué tanto del camino recorrió un punto, de 0 a 1, de origen a destino
    func avance(lat: Double, lng: Double) -> Double {
        let dx = destino.lng - origen.lng
        let dy = destino.lat - origen.lat
        let t = ((lng - origen.lng) * dx + (lat - origen.lat) * dy) / (dx * dx + dy * dy)
        return min(1, max(0, t))
    }

    /// kilómetros aproximados de la carretera: la línea recta más un 25 % por las curvas
    var kilometros: Double {
        let r = { (g: Double) in g * .pi / 180 }
        let h = pow(sin(r(destino.lat - origen.lat) / 2), 2)
            + cos(r(origen.lat)) * cos(r(destino.lat)) * pow(sin(r(destino.lng - origen.lng) / 2), 2)
        return 12742 * asin(sqrt(h)) * 1.25
    }
}
