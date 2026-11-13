import SwiftUI

struct RaizVista: View {
    @StateObject private var modelo = ModeloApp()

    var body: some View {
        Group {
            switch modelo.fase {
            case .ingreso:
                IngresoVista()
            case .cargando:
                ProgressView().tint(Tema.ambar)
            case .listo:
                TabView {
                    ViajeVista()
                    BoletoVista()
                    BusVista()
                }
                .tabViewStyle(.verticalPage)
            }
        }
        .environmentObject(modelo)
        .task(id: modelo.fase == .ingreso) {
            if modelo.fase != .ingreso { await modelo.vigilar() }
        }
    }
}
