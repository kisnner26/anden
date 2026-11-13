import Foundation

struct SesionGuardada: Codable {
    var accessToken: String
    var refreshToken: String
    var usuarioId: String
    var expira: Date
}
