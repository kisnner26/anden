import Foundation
import SwiftUI

/// el estado que ven todas las pantallas: la sesión, las reservas y dónde va el bus
@MainActor
final class ModeloApp: ObservableObject {
    enum Fase { case ingreso, cargando, listo }

    @Published var fase: Fase
    @Published var reservas: [Reserva] = []
    @Published var avanceBus: Double?
    @Published var mensaje: String?
    @Published var entrando = false

    private let cliente = ClienteAnden()

    init() {
        fase = cliente.tieneSesion ? .cargando : .ingreso
    }

    /// el próximo viaje que importa: el que está en camino o, si no, el que sale primero
    var proxima: Reserva? {
        reservas.first { $0.viaje.salioEn != nil } ?? reservas.first
    }

    func entrar(usuario: String, clave: String) async {
        entrando = true
        mensaje = nil
        do {
            try await cliente.entrar(usuario: usuario.trimmingCharacters(in: .whitespaces), clave: clave)
            fase = .cargando
            await refrescar()
        } catch ErrorAnden.credenciales {
            mensaje = "Usuario o contraseña incorrectos."
        } catch ErrorAnden.sinServidor {
            mensaje = "Falta la dirección del servidor en la compilación."
        } catch {
            mensaje = "Sin conexión. Probá de nuevo."
        }
        entrando = false
    }

    func salir() {
        cliente.salir()
        reservas = []
        avanceBus = nil
        fase = .ingreso
    }

    func refrescar() async {
        guard cliente.tieneSesion else { fase = .ingreso; return }
        do {
            reservas = try await cliente.reservas()
            mensaje = nil
            await actualizarBus()
            fase = .listo
        } catch ErrorAnden.credenciales {
            salir()
        } catch {
            // con datos viejos es mejor seguir mostrándolos que vaciar la pantalla
            if fase == .cargando { fase = .listo }
            mensaje = "Sin conexión."
        }
    }

    private func actualizarBus() async {
        guard let r = proxima, r.viaje.salioEn != nil, let ruta = Ruta(id: r.viaje.rutaId),
              let t = try? await cliente.transmision(viajeId: r.viaje.id), let lat = t.lat, let lng = t.lng
        else { avanceBus = nil; return }
        avanceBus = ruta.avance(lat: lat, lng: lng)
    }

    /// vuelve a leer cada 20 s mientras la app está abierta
    func vigilar() async {
        while !Task.isCancelled {
            await refrescar()
            try? await Task.sleep(for: .seconds(20))
        }
    }
}
