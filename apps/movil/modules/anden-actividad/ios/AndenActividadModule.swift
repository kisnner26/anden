import ExpoModulesCore
#if canImport(ActivityKit)
import ActivityKit
#endif

public class AndenActividadModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AndenActividad")

    // true si el sistema permite Live Activities para la app
    AsyncFunction("disponible") { (promise: Promise) in
      #if canImport(ActivityKit)
      if #available(iOS 16.2, *) {
        promise.resolve(ActivityAuthorizationInfo().areActivitiesEnabled)
        return
      }
      #endif
      promise.resolve(false)
    }

    // inicia la actividad del viaje y devuelve su identificador
    AsyncFunction("iniciar") { (destino: String, salidaMs: Double, anden: Int, estado: String, promise: Promise) in
      #if canImport(ActivityKit)
      if #available(iOS 16.2, *) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
          promise.reject("ERR_ANDEN_ACTIVIDAD_NO_DISPONIBLE", "Las actividades en vivo están apagadas para Andén.")
          return
        }
        let salida = Date(timeIntervalSince1970: salidaMs / 1000)
        let atributos = AtributosViaje(destino: destino, salida: salida)
        let estadoInicial = AtributosViaje.ContentState(anden: anden, estado: estado)
        do {
          let actividad = try Activity.request(
            attributes: atributos,
            content: .init(state: estadoInicial, staleDate: salida.addingTimeInterval(3600)),
            pushType: nil
          )
          promise.resolve(actividad.id)
        } catch {
          promise.reject("ERR_ANDEN_ACTIVIDAD_INICIO", error.localizedDescription)
        }
        return
      }
      #endif
      promise.reject("ERR_ANDEN_ACTIVIDAD_NO_DISPONIBLE", "Este sistema no admite actividades en vivo.")
    }

    AsyncFunction("actualizar") { (id: String, anden: Int, estado: String, promise: Promise) in
      #if canImport(ActivityKit)
      if #available(iOS 16.2, *) {
        Task {
          guard let actividad = Activity<AtributosViaje>.activities.first(where: { $0.id == id }) else {
            promise.resolve(false)
            return
          }
          await actividad.update(.init(state: .init(anden: anden, estado: estado), staleDate: nil))
          promise.resolve(true)
        }
        return
      }
      #endif
      promise.resolve(false)
    }

    AsyncFunction("terminar") { (id: String, promise: Promise) in
      #if canImport(ActivityKit)
      if #available(iOS 16.2, *) {
        Task {
          for actividad in Activity<AtributosViaje>.activities where actividad.id == id {
            await actividad.end(nil, dismissalPolicy: .immediate)
          }
          promise.resolve(nil)
        }
        return
      }
      #endif
      promise.resolve(nil)
    }
  }
}
