import Foundation

/// la dirección y la clave pública del servidor, que entran al compilar desde Config/Secrets.xcconfig
enum Configuracion {
    static let host = valor("AndenSupabaseHost")
    static let clave = valor("AndenSupabaseClave")
    static var base: URL? { host.isEmpty ? nil : URL(string: "https://\(host)") }

    private static func valor(_ llave: String) -> String {
        (Bundle.main.object(forInfoDictionaryKey: llave) as? String) ?? ""
    }
}
