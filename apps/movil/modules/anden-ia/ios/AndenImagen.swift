import Foundation
import UIKit
#if canImport(ImagePlayground)
import ImagePlayground
#endif

/// Crea ilustraciones con Image Playground, que corre en el teléfono. Se usa la hoja del sistema
/// (ImagePlaygroundViewController): es lo que Apple pide desde iOS 27, y la persona ve y elige la imagen
/// antes de compartirla. Queda en la caché de la app.
enum AndenImagen {
  /// "disponible" si Image Playground se puede abrir ahora; si no, el motivo
  static func estado() async -> String {
    #if canImport(ImagePlayground)
    if #available(iOS 18.1, *) {
      return await MainActor.run {
        ImagePlaygroundViewController.isAvailable ? "disponible" : "no-lista"
      }
    }
    #endif
    return "sistema-antiguo"
  }

  /// abre Image Playground con la ciudad ya escrita; devuelve la ruta del PNG elegido, o "error:" y el motivo
  static func crearPostal(ciudad: String, descripcion: String) async -> String {
    #if canImport(ImagePlayground)
    if #available(iOS 18.1, *) {
      return await withCheckedContinuation { continuacion in
        Task { @MainActor in
          guard ImagePlaygroundViewController.isAvailable else {
            continuacion.resume(returning: "error:no-lista")
            return
          }
          guard let presentador = presentadorSuperior() else {
            continuacion.resume(returning: "error:fallo")
            return
          }
          let delegado = DelegadoPostal(continuacion: continuacion)
          DelegadoPostal.activo = delegado
          let hoja = ImagePlaygroundViewController()
          // los conceptos van en inglés: es el idioma con el que Image Playground rinde mejor en cualquier teléfono
          hoja.concepts = [
            .text("illustrated travel postcard of \(ciudad), Nicaragua"),
            .text(descripcion),
          ]
          hoja.delegate = delegado
          presentador.present(hoja, animated: true)
        }
      }
    }
    #endif
    return "error:sistema-antiguo"
  }

  /// la pantalla más arriba, desde la que se presenta la hoja
  @MainActor
  static func presentadorSuperior() -> UIViewController? {
    let escena = UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first { $0.activationState == .foregroundActive }
    var actual = escena?.windows.first(where: { $0.isKeyWindow })?.rootViewController
    while let presentada = actual?.presentedViewController { actual = presentada }
    return actual
  }
}

#if canImport(ImagePlayground)
@available(iOS 18.1, *)
@MainActor
final class DelegadoPostal: NSObject, ImagePlaygroundViewController.Delegate {
  /// el delegado de la hoja es débil: se guarda mientras la hoja está abierta
  static var activo: DelegadoPostal?
  private var continuacion: CheckedContinuation<String, Never>?

  init(continuacion: CheckedContinuation<String, Never>) {
    self.continuacion = continuacion
  }

  private func terminar(_ resultado: String) {
    continuacion?.resume(returning: resultado)
    continuacion = nil
    DelegadoPostal.activo = nil
  }

  func imagePlaygroundViewController(_ imagePlaygroundViewController: ImagePlaygroundViewController, didCreateImageAt imageURL: URL) {
    let carpeta = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    let archivo = carpeta.appendingPathComponent("postal-\(UUID().uuidString).\(imageURL.pathExtension.isEmpty ? "png" : imageURL.pathExtension)")
    do {
      try FileManager.default.copyItem(at: imageURL, to: archivo)
      imagePlaygroundViewController.dismiss(animated: true) { self.terminar(archivo.path) }
    } catch {
      imagePlaygroundViewController.dismiss(animated: true) { self.terminar("error:fallo") }
    }
  }

  func imagePlaygroundViewControllerDidCancel(_ imagePlaygroundViewController: ImagePlaygroundViewController) {
    imagePlaygroundViewController.dismiss(animated: true) { self.terminar("error:cancelada") }
  }
}
#endif
