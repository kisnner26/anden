import Foundation

enum Fechas {
    /// los formateadores son caros de crear: se arman una vez y se reutilizan en cada fecha que llega del servidor
    private static let conFracciones: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let sinFracciones: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()

    static func iso(_ texto: String) -> Date? {
        conFracciones.date(from: texto) ?? sinFracciones.date(from: texto)
    }
}
