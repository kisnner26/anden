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
          Text("Andén \(contexto.state.anden)")
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
          Text("Andén \(contexto.state.anden)").font(.title3.bold())
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
        Text("A\(contexto.state.anden)").bold()
      } compactTrailing: {
        Text(contexto.attributes.salida, style: .timer)
          .monospacedDigit()
          .frame(maxWidth: 48)
      } minimal: {
        Text("\(contexto.state.anden)").bold()
      }
    }
  }
}
