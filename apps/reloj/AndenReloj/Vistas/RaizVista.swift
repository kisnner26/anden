import SwiftUI

struct RaizVista: View {
    @StateObject private var modelo = ModeloApp()
    @Environment(\.scenePhase) private var fase

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
                    SalidasVista()
                    EncomiendasVista()
                    AsistenteVista()
                    AjustesVista()
                }
                .tabViewStyle(.verticalPage)
            }
        }
        .environmentObject(modelo)
        // solo vigila con la app a la vista; al volver a la muñeca arranca de nuevo y lee al instante
        .task(id: "\(modelo.fase == .ingreso)-\(fase == .active)") {
            if modelo.fase != .ingreso && fase == .active { await modelo.vigilar() }
        }
    }
}
