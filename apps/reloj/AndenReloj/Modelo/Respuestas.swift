import Foundation

/// responde preguntas sobre tus viajes con reglas sobre tus datos reales; no usa un modelo de lenguaje
enum Respuestas {
    static func responder(_ pregunta: String, reservas: [Reserva], salidas: [Viaje], avance: Double?, ahora: Date = Date()) -> String {
        let q = pregunta.folding(options: .diacriticInsensitive, locale: Locale(identifier: "es")).lowercased()
        let proxima = reservas.first { $0.viaje.salioEn != nil } ?? reservas.first

        func tiene(_ palabras: String...) -> Bool { palabras.contains { q.contains($0) } }

        if tiene("salidas", "viajes hay", "que hay", "horarios") {
            guard !salidas.isEmpty else { return "No hay salidas publicadas ahora." }
            let tres = salidas.prefix(3).map { "\(hora($0.salida)) a \(Ruta(id: $0.rutaId)?.destino.nombre ?? "?")" }
            return "Próximas salidas: " + tres.joined(separator: ", ") + "."
        }
        guard let r = proxima else { return "No tenés boletos vigentes. Reservá desde Andén en el iPhone." }
        let ruta = Ruta(id: r.viaje.rutaId)
        let destino = ruta?.destino.nombre ?? "tu destino"

        if tiene("anden", "punto", "subo", "encuentro") {
            guard let p = r.viaje.puntoEncuentro, !p.isEmpty else { return "El conductor todavía no confirmó el punto de encuentro." }
            return "Tu bus a \(destino) sale del punto \(p). Abrilo en el mapa desde Andén en el iPhone."
        }
        if tiene("asiento") { return "Tu asiento es el \(r.boleto.asiento)." }
        if tiene("codigo", "boleto") { return "Tu código de boleto es \(r.boleto.codigo.map(String.init).joined(separator: " "))." }
        if tiene("placa") { return "La placa del bus es \(r.viaje.placa)." }
        if tiene("donde", "camino", "falta", "llega", "cerca") {
            if let a = avance, let ruta {
                let km = Int((ruta.kilometros * (1 - a)).rounded())
                return "Tu bus va al \(Int((a * 100).rounded())) por ciento del camino a \(destino), faltan unos \(km) kilómetros."
            }
            return r.viaje.salioEn == nil ? "Tu bus todavía no sale." : "El bus no está transmitiendo su posición."
        }
        // cualquier otra pregunta, sale/hora/cuándo, cae en la salida del próximo viaje
        if let salio = r.viaje.salioEn {
            return "Tu bus a \(destino) salió hace \(minutos(ahora.timeIntervalSince(salio)))."
        }
        let falta = r.viaje.salida.timeIntervalSince(ahora)
        if falta <= 0 { return "Tu bus a \(destino) está por salir, en el punto \(r.viaje.puntoCorto)." }
        return "Tu bus a \(destino) sale a las \(hora(r.viaje.salida)), en \(minutos(falta)), en el punto \(r.viaje.puntoCorto)."
    }

    private static func hora(_ f: Date) -> String {
        let d = DateFormatter()
        d.locale = Locale(identifier: "es")
        d.dateFormat = "h:mm a"
        return d.string(from: f)
    }

    private static func minutos(_ segundos: TimeInterval) -> String {
        let m = max(0, Int(segundos / 60))
        if m < 60 { return "\(m) minutos" }
        return "\(m / 60) h \(m % 60) min"
    }
}
