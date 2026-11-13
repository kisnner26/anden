import Foundation

enum Fechas {
    static func iso(_ texto: String) -> Date? {
        let con = ISO8601DateFormatter()
        con.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let f = con.date(from: texto) { return f }
        let sin = ISO8601DateFormatter()
        sin.formatOptions = [.withInternetDateTime]
        return sin.date(from: texto)
    }
}
