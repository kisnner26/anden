import SwiftUI

/// cerrar sesión y datos de la compilación
struct AjustesVista: View {
    @EnvironmentObject private var modelo: ModeloApp
    @State private var confirmando = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Micro("Ajustes")
            Text("\(modelo.reservas.count) \(modelo.reservas.count == 1 ? "boleto vigente" : "boletos vigentes")")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(Tema.crema)
            Micro("Servidor · \(Configuracion.host.isEmpty ? "sin configurar" : "conectado")")
            Spacer(minLength: 4)
            Button(role: .destructive) { confirmando = true } label: {
                Text("Cerrar sesión").frame(maxWidth: .infinity)
            }
            .confirmationDialog("¿Cerrar sesión en el reloj?", isPresented: $confirmando) {
                Button("Cerrar sesión", role: .destructive) { modelo.salir() }
                Button("Cancelar", role: .cancel) {}
            }
        }
    }
}
