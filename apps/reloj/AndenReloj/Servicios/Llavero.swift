import Foundation
import Security

/// guarda la sesión en el llavero del reloj para no pedir la contraseña cada vez
enum Llavero {
    private static let servicio = "com.kisnner.anden.reloj"

    static func guardar(_ datos: Data, cuenta: String) {
        let consulta: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: servicio,
            kSecAttrAccount as String: cuenta,
        ]
        SecItemDelete(consulta as CFDictionary)
        var nuevo = consulta
        nuevo[kSecValueData as String] = datos
        nuevo[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlock
        SecItemAdd(nuevo as CFDictionary, nil)
    }

    static func leer(cuenta: String) -> Data? {
        let consulta: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: servicio,
            kSecAttrAccount as String: cuenta,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var resultado: AnyObject?
        guard SecItemCopyMatching(consulta as CFDictionary, &resultado) == errSecSuccess else { return nil }
        return resultado as? Data
    }

    static func borrar(cuenta: String) {
        let consulta: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: servicio,
            kSecAttrAccount as String: cuenta,
        ]
        SecItemDelete(consulta as CFDictionary)
    }
}
