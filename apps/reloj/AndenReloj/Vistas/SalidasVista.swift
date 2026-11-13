import SwiftUI

/// las próximas salidas de la terminal, con las que ya tenés reservadas marcadas
struct SalidasVista: View {
    @EnvironmentObject private var modelo: ModeloApp

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                Micro("Salidas")
                if modelo.salidas.isEmpty {
                    Text("No hay salidas publicadas ahora.")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Tema.crema)
                }
                ForEach(modelo.salidas) { v in
                    fila(v)
                    Divider().overlay(Tema.linea)
                }
            }
        }
    }

    private func fila(_ v: Viaje) -> some View {
        let tengo = modelo.reservas.contains { $0.viaje.id == v.id }
        return HStack(alignment: .firstTextBaseline) {
            Text(v.salida, format: .dateTime.hour().minute())
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .foregroundStyle(tengo ? Tema.ambar : Tema.crema)
            VStack(alignment: .leading, spacing: 1) {
                Text(Ruta(id: v.rutaId)?.nombre ?? "Viaje")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Tema.crema)
                    .minimumScaleFactor(0.7)
                Micro("Andén \(v.anden) · \(v.servicio)\(tengo ? " · tuyo" : "")")
            }
        }
    }
}
