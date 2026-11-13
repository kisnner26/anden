import SwiftUI

/// el código del boleto grande, para mostrarlo al subir sin sacar el teléfono
struct BoletoVista: View {
    @EnvironmentObject private var modelo: ModeloApp

    var body: some View {
        if let r = modelo.proxima {
            VStack(alignment: .leading, spacing: 6) {
                Micro("Boleto")
                Text(r.boleto.codigo)
                    .font(.system(size: 30, weight: .semibold, design: .monospaced))
                    .foregroundStyle(Tema.ambar)
                    .minimumScaleFactor(0.4)
                    .lineLimit(2)
                    .frame(maxWidth: .infinity, alignment: .leading)
                Spacer(minLength: 2)
                HStack {
                    dato("Asiento", "\(r.boleto.asiento)")
                    Spacer()
                    dato("Andén", "\(r.viaje.anden)")
                }
                Text(Ruta(id: r.viaje.rutaId)?.nombre ?? "")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(Tema.suave)
            }
        } else {
            SinViaje(mensaje: modelo.mensaje)
        }
    }

    private func dato(_ titulo: String, _ valor: String) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Micro(titulo)
            Text(valor).font(.system(size: 20, weight: .semibold, design: .monospaced)).foregroundStyle(Tema.crema)
        }
    }
}
