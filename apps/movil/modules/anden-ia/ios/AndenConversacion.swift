import Foundation
#if canImport(FoundationModels)
import FoundationModels
#endif

/// Lo que Andén sabe de verdad: salidas, boletos y fichas de ciudad. La app lo manda antes de cada
/// pregunta y las herramientas del modelo lo consultan; el modelo nunca inventa estos datos.
struct SalidaAnden: Codable, Sendable {
  let id: String
  let origen: String
  let destino: String
  let linea: String
  let libres: Int
  let tarifa: Int?
}

struct DatosAnden: Codable, Sendable {
  var salidas: [SalidaAnden]
  var boletos: [String]
  var fichas: [String: String]
  /// tarifas por trayecto y servicio
  var tarifas: [String]? = nil
  /// quién es la persona y qué tiene en marcha
  var personal: [String]? = nil
  var encomiendas: [String]? = nil
}

final class AlmacenAnden: @unchecked Sendable {
  static let compartido = AlmacenAnden()
  private let candado = NSLock()
  private var guardados = DatosAnden(salidas: [], boletos: [], fichas: [:])
  private var aviso: (@Sendable (String) -> Void)?

  var datos: DatosAnden {
    get { candado.lock(); defer { candado.unlock() }; return guardados }
    set { candado.lock(); guardados = newValue; candado.unlock() }
  }

  var alUsarHerramienta: (@Sendable (String) -> Void)? {
    get { candado.lock(); defer { candado.unlock() }; return aviso }
    set { candado.lock(); aviso = newValue; candado.unlock() }
  }

  func avisar(_ herramienta: String) { alUsarHerramienta?(herramienta) }
}

func plano(_ texto: String) -> String {
  texto.folding(options: [.diacriticInsensitive, .caseInsensitive], locale: nil)
    .trimmingCharacters(in: .whitespacesAndNewlines)
}

#if canImport(FoundationModels)

/// una salida que la app ya mostró; las herramientas nunca devuelven identificadores internos
@available(iOS 26.0, *)
struct BuscarSalidas: Tool {
  let name = "buscarSalidas"
  let description = "Busca las salidas reales de buses de Andén. Usala antes de decir horarios, tarifas, asientos libres o puntos de encuentro. Todos los filtros son opcionales: si no estás seguro, dejalos vacíos y se devuelven las próximas salidas."

  @Generable
  struct Arguments {
    @Guide(description: "Ciudad de destino (Managua, Boaco o Juigalpa). Texto vacío si no importa; no escribas otra cosa que no sea una ciudad.")
    var destino: String
    @Guide(description: "Ciudad de origen (Managua, Boaco o Juigalpa). Texto vacío si no importa.")
    var origen: String
    @Guide(description: "true solo si la persona pidió expresamente salidas con asientos libres.")
    var soloConAsientos: Bool
  }

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let todas = AlmacenAnden.compartido.datos.salidas
    // un filtro que no es una ciudad conocida se ignora: así "próximos" o "viajes" nunca vacían la lista
    let ciudades = Set(todas.flatMap { [plano($0.destino), plano($0.origen)] })
    let destino = plano(arguments.destino)
    let origen = plano(arguments.origen)
    let usarDestino = ciudades.contains(destino)
    let usarOrigen = ciudades.contains(origen)
    var encontradas = todas.filter { salida in
      (!usarDestino || plano(salida.destino) == destino)
        && (!usarOrigen || plano(salida.origen) == origen)
        && (!arguments.soloConAsientos || salida.libres > 0)
    }
    var aviso = ""
    if encontradas.isEmpty && !todas.isEmpty {
      encontradas = todas
      aviso = "No hay salidas con ese filtro exacto. Estas son las próximas salidas que existen:\n"
    }
    if encontradas.isEmpty { return "La app no tiene salidas próximas cargadas." }
    return aviso + encontradas.prefix(6).map(\.linea).joined(separator: "\n")
  }
}

@available(iOS 26.0, *)
struct SalidaMasBarata: Tool {
  let name = "salidaMasBarata"
  let description = "Devuelve la salida con la tarifa más baja que todavía tiene asientos, opcionalmente hacia una ciudad."

  @Generable
  struct Arguments {
    @Guide(description: "Ciudad de destino. Texto vacío para cualquier destino.")
    var destino: String
  }

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let todas = AlmacenAnden.compartido.datos.salidas
    let destino = plano(arguments.destino)
    let usar = todas.contains { plano($0.destino) == destino }
    let candidata = todas
      .filter { $0.tarifa != nil && $0.libres > 0 && (!usar || plano($0.destino) == destino) }
      .min { ($0.tarifa ?? .max) < ($1.tarifa ?? .max) }
    return candidata?.linea ?? "No hay salidas con tarifa disponible."
  }
}

@available(iOS 26.0, *)
struct TarifaDeRuta: Tool {
  let name = "tarifaDeRuta"
  let description = "Dice cuánto cuesta el boleto de un trayecto, por servicio (ordinario o expreso). Usala cuando pregunten por precios."

  @Generable
  struct Arguments {
    @Guide(description: "Ciudad de destino, por ejemplo Boaco. Texto vacío para ver todas las tarifas.")
    var destino: String
  }

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let tarifas = AlmacenAnden.compartido.datos.tarifas ?? []
    let destino = plano(arguments.destino)
    let filtradas = destino.isEmpty ? tarifas : tarifas.filter { plano($0).contains("a \(destino),") }
    let lista = filtradas.isEmpty ? tarifas : filtradas
    return lista.isEmpty ? "No hay tarifas cargadas." : lista.joined(separator: "\n")
  }
}

@available(iOS 26.0, *)
struct MisBoletos: Tool {
  let name = "misBoletos"
  let description = "Devuelve los boletos vigentes de la persona: destino, hora, asiento, punto de encuentro, bus y chofer."

  @Generable
  struct Arguments {}

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let boletos = AlmacenAnden.compartido.datos.boletos
    return boletos.isEmpty ? "La persona no tiene boletos vigentes." : boletos.joined(separator: "\n")
  }
}

@available(iOS 26.0, *)
struct MisEncomiendas: Tool {
  let name = "misEncomiendas"
  let description = "Devuelve las encomiendas de la persona con su estado."

  @Generable
  struct Arguments {}

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let lista = AlmacenAnden.compartido.datos.encomiendas ?? []
    return lista.isEmpty ? "La persona no tiene encomiendas." : lista.joined(separator: "\n")
  }
}

@available(iOS 26.0, *)
struct MiContexto: Tool {
  let name = "miContexto"
  let description = "Dice quién es la persona, qué fecha y hora es, qué boleto tiene, si va en un viaje, su viaje habitual y sus encomiendas."

  @Generable
  struct Arguments {}

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let lineas = AlmacenAnden.compartido.datos.personal ?? []
    return lineas.isEmpty ? "No hay datos de la persona." : lineas.joined(separator: "\n")
  }
}

@available(iOS 26.0, *)
struct FichaDeCiudad: Tool {
  let name = "fichaDeCiudad"
  let description = "Datos verificados de una ciudad de la red de Andén (Managua, Boaco, Juigalpa): qué es, qué visitar. Usala para recomendaciones; no agregues lugares que no estén en la ficha."

  @Generable
  struct Arguments {
    @Guide(description: "Nombre de la ciudad: Managua, Boaco o Juigalpa.")
    var ciudad: String
  }

  func call(arguments: Arguments) async throws -> String {
    AlmacenAnden.compartido.avisar(name)
    let buscada = plano(arguments.ciudad)
    let ficha = AlmacenAnden.compartido.datos.fichas.first { plano($0.key) == buscada }
    return ficha?.value ?? "No hay ficha de esa ciudad."
  }
}

/// lo que el modelo devuelve; la app solo muestra salidas y boletos que existen de verdad
@available(iOS 26.0, *)
@Generable
struct RespuestaAnden {
  @Guide(description: "La respuesta en español, cercana, de una a cuatro frases. Horarios, tarifas, asientos y puntos de encuentro solo los de los datos. Sin identificadores ni números entre corchetes.")
  var texto: String
  @Guide(description: "Los números entre corchetes [n] de hasta 3 salidas de la lista que apoyan la respuesta, por ejemplo [2, 5]. Solo números, nunca texto. Lista vacía si no aplica.")
  var salidas: [Int]
  @Guide(description: "Ciudad de la que habla la respuesta: Managua, Boaco o Juigalpa. Texto vacío si no aplica.")
  var ciudad: String
  @Guide(description: "true solo si la respuesta trata de los boletos de la persona.")
  var mostrarBoletos: Bool
  @Guide(description: "De 0 a 3 preguntas cortas que la persona podría hacer a continuación.")
  var seguimientos: [String]
}

@available(iOS 26.0, *)
final class ConversacionesAnden: @unchecked Sendable {
  static let compartido = ConversacionesAnden()
  private let candado = NSLock()
  private var sesiones: [String: LanguageModelSession] = [:]

  func sesion(_ id: String, instrucciones: String, nueva: Bool = false) -> LanguageModelSession {
    candado.lock(); defer { candado.unlock() }
    if !nueva, let existente = sesiones[id] { return existente }
    let sesion = LanguageModelSession(
      model: SystemLanguageModel.default,
      tools: [BuscarSalidas(), SalidaMasBarata(), TarifaDeRuta(), MisBoletos(), MisEncomiendas(), MiContexto(), FichaDeCiudad()],
      instructions: instrucciones
    )
    sesiones[id] = sesion
    return sesion
  }

  func olvidar(_ id: String) {
    candado.lock(); sesiones[id] = nil; candado.unlock()
  }
}

@available(iOS 26.0, *)
func resumenParcial(_ id: String, _ contenido: RespuestaAnden.PartiallyGenerated) -> String {
  let cuerpo: [String: Any] = [
    "id": id,
    "texto": contenido.texto ?? "",
    "salidas": contenido.salidas ?? [],
    "ciudad": contenido.ciudad ?? "",
    "mostrarBoletos": contenido.mostrarBoletos ?? false,
    "seguimientos": contenido.seguimientos ?? [],
  ]
  let datos = (try? JSONSerialization.data(withJSONObject: cuerpo)) ?? Data("{}".utf8)
  return String(decoding: datos, as: UTF8.self)
}

/// responde una pregunta dentro de una conversación; emite parciales mientras escribe
@available(iOS 26.0, *)
func conversarConModelo(
  conversacion: String,
  peticion: String,
  instrucciones: String,
  pregunta: String,
  alParcial: @escaping @Sendable (String) -> Void
) async throws -> String {
  var reintento = false
  while true {
    let sesion = ConversacionesAnden.compartido.sesion(conversacion, instrucciones: instrucciones, nueva: reintento)
    do {
      var ultimo = ""
      let flujo = sesion.streamResponse(to: pregunta, generating: RespuestaAnden.self)
      for try await instantanea in flujo {
        ultimo = resumenParcial(peticion, instantanea.content)
        alParcial(ultimo)
      }
      return ultimo
    } catch let fallo as LanguageModelSession.GenerationError {
      // la conversación llenó la memoria del modelo: se empieza una nueva y se reintenta una vez
      if case .exceededContextWindowSize = fallo, !reintento {
        reintento = true
        continue
      }
      throw fallo
    }
  }
}

#endif
