import AVFoundation
import SwiftUI

/// preguntale a Andén por dictado y te contesta en voz alta con lo que sabe de tus viajes
struct AsistenteVista: View {
    @EnvironmentObject private var modelo: ModeloApp
    @State private var pregunta = ""
    @State private var respuesta: String?
    private let voz = AVSpeechSynthesizer()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                Micro("Preguntale a Andén")
                TextField("¿A qué hora sale?", text: $pregunta)
                    .submitLabel(.send)
                    .onSubmit(responder)
                if let respuesta {
                    Text(respuesta)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(Tema.crema)
                        .padding(8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Tema.ambar.opacity(0.16), in: RoundedRectangle(cornerRadius: 10))
                } else {
                    Text("Probá: andén, asiento, dónde va mi bus, salidas.")
                        .font(.footnote)
                        .foregroundStyle(Tema.suave)
                }
                Micro("Responde con tus datos, sin modelo de lenguaje")
            }
        }
    }

    private func responder() {
        guard !pregunta.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let texto = Respuestas.responder(pregunta, reservas: modelo.reservas, salidas: modelo.salidas, avance: modelo.avanceBus)
        respuesta = texto
        pregunta = ""
        voz.stopSpeaking(at: .immediate)
        let frase = AVSpeechUtterance(string: texto)
        frase.voice = AVSpeechSynthesisVoice(language: "es-MX")
        voz.speak(frase)
    }
}
