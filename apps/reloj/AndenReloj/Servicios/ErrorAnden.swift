import Foundation

enum ErrorAnden: Error {
    case sinServidor
    case credenciales
    case sinRed
    case servidor(Int)
}
