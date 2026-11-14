import ExpoModulesCore
#if canImport(FoundationModels)
import FoundationModels
#endif

/// Puente entre la app y el modelo de Apple Intelligence que corre en el teléfono.
/// Nada de lo que se pregunta sale del dispositivo.
public class AndenIAModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AndenIA")

    /// Mientras el modelo consulta una herramienta (salidas, boletos, ciudad) la app lo muestra.
    Events("onParcial", "onHerramienta")

    /// Si se puede usar el modelo en este teléfono:
    /// disponible, sistema-antiguo, no-compatible, apagada, no-lista o idioma-no-soportado.
    AsyncFunction("disponibilidad") { () -> String in
      return AndenIAModule.estado()
    }

    /// Deja lista la sesión (carga el modelo) para que la primera respuesta no tarde.
    AsyncFunction("precalentar") { (conversacion: String, instrucciones: String) -> Bool in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *), AndenIAModule.estado() == "disponible" {
        ConversacionesAnden.compartido.sesion(conversacion, instrucciones: instrucciones).prewarm()
        return true
      }
      #endif
      return false
    }

    /// Olvida lo hablado en una conversación.
    AsyncFunction("olvidar") { (conversacion: String) -> Bool in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        ConversacionesAnden.compartido.olvidar(conversacion)
        return true
      }
      #endif
      return false
    }

    /// Conversa con herramientas y respuesta estructurada, en streaming.
    AsyncFunction("conversar") { (conversacion: String, peticion: String, instrucciones: String, datosJson: String, pregunta: String, promise: Promise) in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        let estado = AndenIAModule.estado()
        guard estado == "disponible" else {
          promise.reject(Exception(name: "ERR_ANDEN_IA_NO_DISPONIBLE", description: estado))
          return
        }
        if let datos = try? JSONDecoder().decode(DatosAnden.self, from: Data(datosJson.utf8)) {
          AlmacenAnden.compartido.datos = datos
        }
        AlmacenAnden.compartido.alUsarHerramienta = { [weak self] herramienta in
          self?.sendEvent("onHerramienta", ["id": peticion, "herramienta": herramienta])
        }
        Task {
          do {
            let final = try await conversarConModelo(
              conversacion: conversacion, peticion: peticion,
              instrucciones: instrucciones, pregunta: pregunta,
              alParcial: { [weak self] parcial in
                self?.sendEvent("onParcial", ["id": peticion, "json": parcial])
              }
            )
            promise.resolve(final)
          } catch {
            promise.reject(Exception(name: "ERR_ANDEN_IA_RESPUESTA", description: error.localizedDescription))
          }
        }
        return
      }
      #endif
      promise.reject(Exception(name: "ERR_ANDEN_IA_NO_DISPONIBLE", description: "sistema-antiguo"))
    }

    /// Responde una pregunta con instrucciones y datos que pone la app; cada pregunta es una sesión nueva.
    AsyncFunction("responder") { (instrucciones: String, pregunta: String, promise: Promise) in
      #if canImport(FoundationModels)
      if #available(iOS 26.0, *) {
        let estado = AndenIAModule.estado()
        guard estado == "disponible" else {
          promise.reject(Exception(name: "ERR_ANDEN_IA_NO_DISPONIBLE", description: estado))
          return
        }
        Task {
          do {
            let sesion = LanguageModelSession(model: SystemLanguageModel.default, instructions: instrucciones)
            let respuesta = try await sesion.respond(to: pregunta)
            promise.resolve(respuesta.content)
          } catch {
            promise.reject(Exception(name: "ERR_ANDEN_IA_RESPUESTA", description: error.localizedDescription))
          }
        }
        return
      }
      #endif
      promise.reject(Exception(name: "ERR_ANDEN_IA_NO_DISPONIBLE", description: "sistema-antiguo"))
    }
  }

  static func estado() -> String {
    #if canImport(FoundationModels)
    if #available(iOS 26.0, *) {
      let modelo = SystemLanguageModel.default
      switch modelo.availability {
      case .available:
        return modelo.supportsLocale() ? "disponible" : "idioma-no-soportado"
      case .unavailable(let motivo):
        switch motivo {
        case .deviceNotEligible: return "no-compatible"
        case .appleIntelligenceNotEnabled: return "apagada"
        case .modelNotReady: return "no-lista"
        @unknown default: return "no-compatible"
        }
      @unknown default:
        return "no-compatible"
      }
    }
    #endif
    return "sistema-antiguo"
  }
}
