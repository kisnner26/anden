import SwiftUI

/// los paquetes que enviaste y en qué punto van
struct EncomiendasVista: View {
    @EnvironmentObject private var modelo: ModeloApp

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                Micro("Encomiendas")
                if modelo.encomiendas.isEmpty {
                    Text("No enviaste paquetes.")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(Tema.crema)
                }
                ForEach(modelo.encomiendas) { e in
                    fila(e)
                    Divider().overlay(Tema.linea)
                }
            }
        }
    }

    private func fila(_ e: Encomienda) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(e.contenido?.descripcion ?? "Paquete")
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Tema.crema)
                .lineLimit(1)
            Text("\(e.contenido?.origen ?? "?") → \(e.contenido?.destino ?? "?")")
                .font(.system(size: 11))
                .foregroundStyle(Tema.suave)
            Text(e.estadoTexto)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(e.activa ? Tema.ambar : e.estado == "entregada" ? Tema.crema : .red)
            if e.estado == "rechazada", let m = e.motivo, !m.isEmpty {
                Text(m).font(.system(size: 11)).foregroundStyle(Tema.suave)
            }
            if let c = e.contenido?.codigo { Micro(c) }
        }
    }
}
