import ActivityKit
import SwiftUI
import WidgetKit

@main
struct AndenActividadBundle: WidgetBundle {
  var body: some Widget {
    ActividadDelViaje()
  }
}

struct ActividadDelViaje: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: AtributosViaje.self) { contexto in
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 4) {
          Text("Bus a \(contexto.attributes.destino)")
            .font(.headline)
          Text(contexto.state.estado)
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 4) {
          Text("Punto \(corto(contexto.state.puntoEncuentro))")
            .font(.title2.bold())
          Text(contexto.attributes.salida, style: .timer)
            .font(.subheadline.monospacedDigit())
            .multilineTextAlignment(.trailing)
        }
      }
      .padding()
      .activityBackgroundTint(Color(red: 0.07, green: 0.07, blue: 0.06))
      .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { contexto in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Text("Punto \(corto(contexto.state.puntoEncuentro))").font(.title3.bold())
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(contexto.attributes.salida, style: .timer)
            .monospacedDigit()
            .frame(maxWidth: 80)
        }
        DynamicIslandExpandedRegion(.bottom) {
          Text("\(contexto.attributes.destino) · \(contexto.state.estado)")
            .font(.subheadline)
        }
      } compactLeading: {
        Text(corto(contexto.state.puntoEncuentro)).bold()
      } compactTrailing: {
        Text(contexto.attributes.salida, style: .timer)
          .monospacedDigit()
          .frame(maxWidth: 48)
      } minimal: {
        Text(corto(contexto.state.puntoEncuentro)).bold()
      }
    }
  }
}

/// en la isla dinámica no cabe el código entero: se muestran los últimos siete signos, como "4PPX+HC"
private func corto(_ punto: String) -> String {
    punto.isEmpty ? "—" : String(punto.suffix(7))
}
