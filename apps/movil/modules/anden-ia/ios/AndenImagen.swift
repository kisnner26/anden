import Foundation
import UIKit
#if canImport(ImagePlayground)
import ImagePlayground
#endif

/// Crea ilustraciones con Image Playground, que corre en el teléfono. Solo se usa cuando la persona lo pide:
/// la imagen queda en la caché de la app y se comparte desde la hoja del sistema.
enum AndenImagen {
  /// "disponible" si el teléfono puede crear imágenes; cualquier otra cosa es el motivo
  static func estado() async -> String {
    #if canImport(ImagePlayground)
    if #available(iOS 18.4, *) {
      do {
        _ = try await ImageCreator()
        return "disponible"
      } catch {
        return "no-disponible"
      }
    }
    #endif
    return "sistema-antiguo"
  }

  /// una postal ilustrada de la ciudad; devuelve la ruta del PNG o nil si no se pudo crear
  static func crearPostal(ciudad: String, descripcion: String) async -> String? {
    #if canImport(ImagePlayground)
    if #available(iOS 18.4, *) {
      do {
        let creador = try await ImageCreator()
        let estilo = creador.availableStyles.first(where: { $0 == .illustration }) ?? creador.availableStyles.first
        guard let estilo else { return nil }
        let conceptos: [ImagePlaygroundConcept] = [
          .text("postal ilustrada de \(ciudad), Nicaragua"),
          .text(descripcion),
        ]
        for try await imagen in creador.images(for: conceptos, style: estilo, limit: 1) {
          guard let datos = UIImage(cgImage: imagen.cgImage).pngData() else { return nil }
          let carpeta = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
          let archivo = carpeta.appendingPathComponent("postal-\(UUID().uuidString).png")
          try datos.write(to: archivo)
          return archivo.path
        }
      } catch {
        return nil
      }
    }
    #endif
    return nil
  }
}
