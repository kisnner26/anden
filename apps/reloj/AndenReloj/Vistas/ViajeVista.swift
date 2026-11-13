import SwiftUI

/// el próximo viaje con cuenta atrás hasta la salida
struct ViajeVista: View {
    @EnvironmentObject private var modelo: ModeloApp

    var body: some View {
        if let r = modelo.proxima {
            TimelineView(.periodic(from: .now, by: 15)) { contexto in
                contenido(r, ahora: contexto.date)
            }
        } else {
            SinViaje(mensaje: modelo.mensaje)
        }
    }

    private func contenido(_ r: Reserva, ahora: Date) -> some View {
        let ruta = Ruta(id: r.viaje.rutaId)
        return VStack(alignment: .leading, spacing: 4) {
            Micro(r.viaje.salioEn == nil ? "Próximo viaje" : "En camino")
            Text(ruta?.nombre ?? "Viaje")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Tema.crema)
                .minimumScaleFactor(0.7)
            Spacer(minLength: 2)
            Text(r.viaje.salida, format: .dateTime.hour().minute())
                .font(.system(size: 44, weight: .light, design: .rounded))
                .foregroundStyle(Tema.ambar)
            Text(cuentaAtras(r.viaje, ahora: ahora))
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Tema.crema)
            barra(r.viaje, ahora: ahora)
            Spacer(minLength: 2)
            HStack {
                dato("Andén", "\(r.viaje.anden)")
                Spacer()
                dato("Asiento", "\(r.boleto.asiento)")
                Spacer()
                dato("Bus", r.viaje.placa)
            }
        }
    }

    /// se llena durante la última hora antes de la salida
    @ViewBuilder
    private func barra(_ v: Viaje, ahora: Date) -> some View {
        if v.salioEn == nil {
            let avance = min(1, max(0, 1 - v.salida.timeIntervalSince(ahora) / 3600))
            GeometryReader { g in
                ZStack(alignment: .leading) {
                    Capsule().fill(Tema.linea)
                    Capsule().fill(Tema.ambar).frame(width: max(4, g.size.width * avance))
                }
            }
            .frame(height: 4)
        }
    }

    private func dato(_ titulo: String, _ valor: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Micro(titulo)
            Text(valor).font(.system(size: 13, weight: .semibold, design: .monospaced)).foregroundStyle(Tema.crema)
        }
    }

    /// «Sale en 42 min», «Sale en 1 h 05 min», «Salió hace 5 min»
    private func cuentaAtras(_ v: Viaje, ahora: Date) -> String {
        if let salio = v.salioEn {
            return "Salió hace \(formato(ahora.timeIntervalSince(salio)))"
        }
        let falta = v.salida.timeIntervalSince(ahora)
        return falta <= 0 ? "Por salir" : "Sale en \(formato(falta))"
    }

    private func formato(_ segundos: TimeInterval) -> String {
        let minutos = max(0, Int(segundos / 60))
        if minutos < 60 { return "\(minutos) min" }
        return String(format: "%d h %02d min", minutos / 60, minutos % 60)
    }
}

struct SinViaje: View {
    let mensaje: String?
    var body: some View {
        VStack(spacing: 6) {
            Micro("Sin viajes")
            Text("No tenés boletos vigentes.")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Tema.crema)
                .multilineTextAlignment(.center)
            Text("Reservá desde Andén en el iPhone.")
                .font(.footnote)
                .foregroundStyle(Tema.suave)
                .multilineTextAlignment(.center)
            if let mensaje { Micro(mensaje) }
        }
    }
}
