import Foundation

/// cada cuánto conviene volver a leer del servidor: seguido cuando el bus va en camino o está por salir y de a poco
/// cuando falta mucho, para que el reloj no gaste batería ni datos mirando algo que no cambia
enum RitmoDeLectura {
    static let enCamino: Duration = .seconds(20)
    static let porSalir: Duration = .seconds(30)
    static let cercano: Duration = .seconds(60)
    static let lejano: Duration = .seconds(180)
    static let sinReservas: Duration = .seconds(300)

    /// la espera hasta la próxima lectura según el viaje que importa; nil si no hay ninguno
    static func espera(salida: Date?, salio: Bool, ahora: Date = Date()) -> Duration {
        guard let salida else { return sinReservas }
        if salio { return enCamino }
        let falta = salida.timeIntervalSince(ahora)
        if falta <= 30 * 60 { return porSalir }
        if falta <= 2 * 3600 { return cercano }
        return lejano
    }
}
