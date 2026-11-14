import Foundation
import Security

/// lo que la app le deja a la complicación: el próximo viaje. las cuentas gratuitas de Apple no pueden usar
/// app groups, así que se comparte por el llavero: la app y la extensión declaran el mismo grupo.
struct Instantanea: Codable, Equatable {
    var ruta = ""
    var destino = ""
    var salida: Date?
    var salio = false
    var punto = ""
    var asiento = 0
    var actualizada = Date.distantPast

    var hayViaje: Bool { salida != nil }

    private static let servicio = "anden.reloj.instantanea"

    private static var consulta: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: servicio, kSecAttrAccount as String: "proximo"]
    }

    static func cargar() -> Instantanea {
        var q = consulta
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var salida: AnyObject?
        guard SecItemCopyMatching(q as CFDictionary, &salida) == errSecSuccess, let datos = salida as? Data,
              let i = try? JSONDecoder().decode(Instantanea.self, from: datos) else { return Instantanea() }
        return i
    }

    func guardar() {
        guard let datos = try? JSONEncoder().encode(self) else { return }
        SecItemDelete(Self.consulta as CFDictionary)
        var nuevo = Self.consulta
        nuevo[kSecValueData as String] = datos
        nuevo[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(nuevo as CFDictionary, nil)
    }
}
