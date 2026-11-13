import SwiftUI

struct IngresoVista: View {
    @EnvironmentObject private var modelo: ModeloApp
    @State private var usuario = ""
    @State private var clave = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                Micro("Andén")
                Text("Entrá a tu cuenta.")
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(Tema.crema)
                TextField("Usuario o teléfono", text: $usuario)
                    .textContentType(.username)
                SecureField("Contraseña", text: $clave)
                    .textContentType(.password)
                if let m = modelo.mensaje {
                    Text(m).font(.footnote).foregroundStyle(.red)
                }
                Button {
                    Task { await modelo.entrar(usuario: usuario, clave: clave) }
                } label: {
                    Text(modelo.entrando ? "Entrando…" : "Entrar")
                        .frame(maxWidth: .infinity)
                }
                .tint(Tema.ambar)
                .buttonStyle(.borderedProminent)
                .disabled(usuario.isEmpty || clave.isEmpty || modelo.entrando)
            }
        }
    }
}
