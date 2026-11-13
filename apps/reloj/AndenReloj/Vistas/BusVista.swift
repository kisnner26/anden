import SwiftUI

/// dónde va el bus del próximo viaje en su corredor, con su posición real
struct BusVista: View {
    @EnvironmentObject private var modelo: ModeloApp

    var body: some View {
        if let r = modelo.proxima, let ruta = Ruta(id: r.viaje.rutaId) {
            VStack(alignment: .leading, spacing: 8) {
                Micro("Bus en camino")
                if let avance = modelo.avanceBus {
                    Text("\(Int((avance * 100).rounded())) %")
                        .font(.system(size: 36, weight: .light, design: .rounded))
                        .foregroundStyle(Tema.ambar)
                    carretera(avance: avance)
                    HStack {
                        Text(ruta.origen.nombre)
                        Spacer()
                        Text(ruta.destino.nombre)
                    }
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Tema.crema)
                    Micro("Faltan ≈ \(Int((ruta.kilometros * (1 - avance)).rounded())) km")
                } else {
                    Text(r.viaje.salioEn == nil ? "Todavía no sale." : "El bus no está transmitiendo su posición.")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Tema.crema)
                    Micro(ruta.nombre)
                }
            }
        } else {
            SinViaje(mensaje: modelo.mensaje)
        }
    }

    private func carretera(avance: Double) -> some View {
        GeometryReader { g in
            let x = g.size.width * avance
            ZStack(alignment: .leading) {
                Capsule().fill(Tema.linea).frame(height: 6)
                Capsule().fill(Tema.ambar).frame(width: max(6, x), height: 6)
                Circle().fill(Tema.ambar).frame(width: 14, height: 14)
                    .overlay(Circle().stroke(Color.black, lineWidth: 3))
                    .offset(x: min(max(0, x - 7), g.size.width - 14))
            }
            .frame(maxHeight: .infinity)
        }
        .frame(height: 20)
    }
}
