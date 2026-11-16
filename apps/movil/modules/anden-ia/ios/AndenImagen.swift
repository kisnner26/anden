import Foundation
import UIKit
#if canImport(ImagePlayground)
import ImagePlayground
#endif

/// Crea ilustraciones con Image Playground, que corre en el teléfono. Solo se usa cuando la persona lo pide:
/// la imagen queda en la caché de la app y se comparte desde la hoja del sistema.
enum AndenImagen {
  #if canImport(ImagePlayground)
  /// el motivo del error en una palabra que la app sabe explicar
  @available(iOS 18.4, *)
  static func motivo(_ error: Error) -> String {
    if let fallo = error as? ImageCreator.Error {
      switch fallo {
      case .notSupported: return "no-compatible"
      case .unavailable: return "no-lista"
      case .unsupportedLanguage: return "idioma-no-soportado"
      case .backgroundCreationForbidden: return "en-segundo-plano"
      case .creationCancelled: return "cancelada"
      default: return "fallo"
      }
    }
    return "fallo"
  }
  #endif

  /// "disponible" si el teléfono puede crear imágenes; cualquier otra cosa es el motivo
  static func estado() async -> String {
    #if canImport(ImagePlayground)
    if #available(iOS 18.4, *) {
      do {
        _ = try await ImageCreator()
        return "disponible"
      } catch {
        return motivo(error)
      }
    }
    #endif
    return "sistema-antiguo"
  }

  /// una postal ilustrada de la ciudad; devuelve la ruta del PNG, o "error:" y el motivo si no se pudo crear
  static func crearPostal(ciudad: String, descripcion: String) async -> String {
    #if canImport(ImagePlayground)
    if #available(iOS 18.4, *) {
      do {
        let creador = try await ImageCreator()
        let estilo = creador.availableStyles.first(where: { $0 == .illustration }) ?? creador.availableStyles.first
        guard let estilo else { return "error:no-lista" }
        // los conceptos van en inglés: es el idioma con el que Image Playground rinde mejor en cualquier teléfono
        let conceptos: [ImagePlaygroundConcept] = [
          .text("illustrated travel postcard of \(ciudad), Nicaragua"),
          .text(descripcion),
        ]
        for try await imagen in creador.images(for: conceptos, style: estilo, limit: 1) {
          guard let datos = UIImage(cgImage: imagen.cgImage).pngData() else { return "error:fallo" }
          let carpeta = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
          let archivo = carpeta.appendingPathComponent("postal-\(UUID().uuidString).png")
          try datos.write(to: archivo)
          return archivo.path
        }
        return "error:fallo"
      } catch {
        return "error:\(motivo(error))"
      }
    }
    #endif
    return "error:sistema-antiguo"
  }
}
