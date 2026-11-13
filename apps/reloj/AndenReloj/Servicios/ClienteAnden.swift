import Foundation

/// habla con Supabase por REST: sin el SDK, que el reloj no necesita para leer unas pocas tablas
final class ClienteAnden {
    private let sesionURL = URLSession(configuration: .ephemeral)
    private(set) var sesion: SesionGuardada?

    init() {
        if let datos = Llavero.leer(cuenta: "sesion"), let s = try? JSONDecoder().decode(SesionGuardada.self, from: datos) {
            sesion = s
        }
    }

    var tieneSesion: Bool { sesion != nil }

    // MARK: acceso

    /// entra con el usuario o teléfono y la contraseña; el servidor resuelve el correo interno igual que en el teléfono
    func entrar(usuario: String, clave: String) async throws {
        let correo: String = try await rpc("correo_de_acceso", cuerpo: ["p_identificador": usuario], conToken: false)
        let r: RespuestaToken = try await pedir(
            "auth/v1/token", consulta: [URLQueryItem(name: "grant_type", value: "password")],
            metodo: "POST", cuerpo: ["email": correo, "password": clave], conToken: false,
            fallaCredenciales: true)
        guardar(r)
    }

    func salir() {
        sesion = nil
        Llavero.borrar(cuenta: "sesion")
    }

    private func renovarSiHaceFalta() async throws {
        guard let s = sesion else { throw ErrorAnden.credenciales }
        guard s.expira.timeIntervalSinceNow < 60 else { return }
        do {
            let r: RespuestaToken = try await pedir(
                "auth/v1/token", consulta: [URLQueryItem(name: "grant_type", value: "refresh_token")],
                metodo: "POST", cuerpo: ["refresh_token": s.refreshToken], conToken: false,
                fallaCredenciales: true)
            guard sesion != nil else { throw ErrorAnden.credenciales }
            guardar(r)
        } catch ErrorAnden.credenciales {
            salir()
            throw ErrorAnden.credenciales
        }
    }

    private func guardar(_ r: RespuestaToken) {
        let s = SesionGuardada(
            accessToken: r.accessToken, refreshToken: r.refreshToken, usuarioId: r.user.id,
            expira: Date().addingTimeInterval(TimeInterval(r.expiresIn)))
        sesion = s
        if let datos = try? JSONEncoder().encode(s) { Llavero.guardar(datos, cuenta: "sesion") }
    }

    // MARK: lecturas

    /// los boletos vigentes del pasajero, con su viaje, ordenados por salida
    func reservas() async throws -> [Reserva] {
        try await renovarSiHaceFalta()
        guard let uid = sesion?.usuarioId else { throw ErrorAnden.credenciales }
        let boletos: [Boleto] = try await tabla(
            "boletos",
            [("select", "boleto_id,viaje_id,asiento,estado,contenido"), ("estado", "eq.vigente"), ("creado_por", "eq.\(uid)")])
        guard !boletos.isEmpty else { return [] }
        let lista = boletos.map { "\"\($0.viajeId)\"" }.joined(separator: ",")
        let viajes: [Viaje] = try await tabla(
            "viajes",
            [("select", "id,ruta_id,servicio,placa,anden,salida,estado,salio_en"), ("id", "in.(\(lista))")])
        return boletos.compactMap { b in
            guard let v = viajes.first(where: { $0.id == b.viajeId }), v.estado != "cancelado" else { return nil }
            return Reserva(boleto: b, viaje: v)
        }.sorted { $0.viaje.salida < $1.viaje.salida }
    }

    func transmision(viajeId: String) async throws -> Transmision? {
        try await renovarSiHaceFalta()
        let filas: [Transmision] = try await tabla(
            "transmisiones", [("select", "lat,lng"), ("viaje_id", "eq.\(viajeId)")])
        return filas.first
    }

    // MARK: base

    private func tabla<T: Decodable>(_ nombre: String, _ filtros: [(String, String)]) async throws -> [T] {
        try await pedir("rest/v1/\(nombre)", consulta: filtros.map { URLQueryItem(name: $0.0, value: $0.1) })
    }

    private func rpc<T: Decodable>(_ nombre: String, cuerpo: [String: String], conToken: Bool = true) async throws -> T {
        try await pedir("rest/v1/rpc/\(nombre)", metodo: "POST", cuerpo: cuerpo, conToken: conToken)
    }

    private func pedir<T: Decodable>(
        _ ruta: String, consulta: [URLQueryItem] = [], metodo: String = "GET",
        cuerpo: [String: String]? = nil, conToken: Bool = true, fallaCredenciales: Bool = false
    ) async throws -> T {
        guard let base = Configuracion.base else { throw ErrorAnden.sinServidor }
        var comps = URLComponents(url: base.appendingPathComponent(ruta), resolvingAgainstBaseURL: false)
        if !consulta.isEmpty { comps?.queryItems = consulta }
        guard let url = comps?.url else { throw ErrorAnden.sinServidor }
        var pedido = URLRequest(url: url)
        pedido.httpMethod = metodo
        pedido.timeoutInterval = 15
        pedido.setValue(Configuracion.clave, forHTTPHeaderField: "apikey")
        pedido.setValue("Bearer \(conToken ? (sesion?.accessToken ?? Configuracion.clave) : Configuracion.clave)", forHTTPHeaderField: "Authorization")
        if let cuerpo {
            pedido.setValue("application/json", forHTTPHeaderField: "Content-Type")
            pedido.httpBody = try JSONEncoder().encode(cuerpo)
        }
        let datos: Data
        let respuesta: URLResponse
        do { (datos, respuesta) = try await sesionURL.data(for: pedido) } catch { throw ErrorAnden.sinRed }
        let codigo = (respuesta as? HTTPURLResponse)?.statusCode ?? 0
        if fallaCredenciales && (codigo == 400 || codigo == 401) { throw ErrorAnden.credenciales }
        guard (200..<300).contains(codigo) else { throw ErrorAnden.servidor(codigo) }
        let decodificador = JSONDecoder()
        decodificador.dateDecodingStrategy = .custom { d in
            let texto = try d.singleValueContainer().decode(String.self)
            if let fecha = Fechas.iso(texto) { return fecha }
            throw DecodingError.dataCorrupted(.init(codingPath: d.codingPath, debugDescription: "fecha inválida"))
        }
        return try decodificador.decode(T.self, from: datos)
    }

    private struct RespuestaToken: Decodable {
        struct Usuario: Decodable { let id: String }
        let accessToken: String
        let refreshToken: String
        let expiresIn: Int
        let user: Usuario
        enum CodingKeys: String, CodingKey {
            case accessToken = "access_token", refreshToken = "refresh_token", expiresIn = "expires_in", user
        }
    }
}
