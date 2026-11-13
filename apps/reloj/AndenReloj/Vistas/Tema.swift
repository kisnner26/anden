import SwiftUI

/// los colores de Andén en el reloj: negro, crema y un solo ámbar
enum Tema {
    static let ambar = Color(red: 0.95, green: 0.71, blue: 0.20)
    static let crema = Color(red: 0.96, green: 0.95, blue: 0.92)
    static let suave = Color(red: 0.55, green: 0.54, blue: 0.52)
    static let linea = Color.white.opacity(0.14)
}

/// etiqueta diminuta en mayúsculas con mucho espacio entre letras, como en el resto de la app
struct Micro: View {
    let texto: String
    init(_ texto: String) { self.texto = texto }
    var body: some View {
        Text(texto.uppercased())
            .font(.system(size: 10, weight: .medium, design: .monospaced))
            .tracking(1.4)
            .foregroundStyle(Tema.suave)
    }
}
