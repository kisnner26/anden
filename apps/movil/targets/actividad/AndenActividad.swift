import ActivityKit
import SwiftUI
import WidgetKit

@main
struct AndenActividadBundle: WidgetBundle {
  var body: some Widget {
    ActividadDelViaje()
  }
}

/// el color de cada momento del viaje: ámbar mientras espera, verde al abordar o ir en ruta, rojo si se atrasa
private func color(de fase: String) -> Color {
  switch fase {
  case "abordando": return Color(red: 0.44, green: 0.81, blue: 0.59)
  case "atrasado": return Color(red: 1.0, green: 0.42, blue: 0.34)
  case "ruta": return Color(red: 0.36, green: 0.78, blue: 0.85)
  case "llego": return Color(white: 0.62)
  default: return Color(red: 1.0, green: 0.70, blue: 0.12)
  }
}

private func texto(de fase: String) -> String {
  switch fase {
  case "abordando": return "Abordando"
  case "atrasado": return "Atrasado"
  case "ruta": return "En ruta"
  case "llego": return "Llegó"
  default: return "A tiempo"
  }
}

/// en la isla dinámica no cabe el código entero: se muestran los últimos siete signos, como "4PPX+HC"
private func corto(_ punto: String) -> String {
  punto.isEmpty ? "—" : String(punto.suffix(7))
}

/// la barra que se va llenando hacia la hora de salida; una vez que el bus sale queda llena
private struct BarraDeRuta: View {
  let contexto: ActivityViewContext<AtributosViaje>

  var body: some View {
    let tono = color(de: contexto.state.fase)
    let enEspera = contexto.state.fase == "espera" || contexto.state.fase == "abordando" || contexto.state.fase == "atrasado"
    HStack(spacing: 8) {
      Image(systemName: "mappin.circle.fill").foregroundStyle(tono.opacity(0.6))
      if enEspera && contexto.attributes.desde < contexto.attributes.salida {
        ProgressView(timerInterval: contexto.attributes.desde...contexto.attributes.salida, countsDown: false) {
          EmptyView()
        } currentValueLabel: {
          EmptyView()
        }
        .tint(tono)
      } else {
        ProgressView(value: contexto.state.fase == "llego" ? 1 : 0.5)
          .tint(tono)
      }
      Image(systemName: "flag.checkered").foregroundStyle(tono)
    }
  }
}

struct ActividadDelViaje: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: AtributosViaje.self) { contexto in
      let tono = color(de: contexto.state.fase)
      VStack(spacing: 12) {
        HStack(alignment: .center, spacing: 12) {
          ZStack {
            Circle().fill(tono.opacity(0.2)).frame(width: 44, height: 44)
            Image(systemName: "bus.fill").font(.title3).foregroundStyle(tono)
          }
          VStack(alignment: .leading, spacing: 2) {
            Text("\(contexto.attributes.origen) → \(contexto.attributes.destino)")
              .font(.headline)
              .lineLimit(1)
              .minimumScaleFactor(0.8)
            Text(texto(de: contexto.state.fase))
              .font(.caption.weight(.semibold))
              .foregroundStyle(tono)
          }
          Spacer()
          if contexto.state.fase == "espera" || contexto.state.fase == "abordando" || contexto.state.fase == "atrasado" {
            Text(contexto.attributes.salida, style: .timer)
              .font(.title2.monospacedDigit().weight(.semibold))
              .multilineTextAlignment(.trailing)
              .frame(maxWidth: 96, alignment: .trailing)
          }
        }
        BarraDeRuta(contexto: contexto)
        HStack {
          Label("Punto \(corto(contexto.state.puntoEncuentro))", systemImage: "location.fill")
            .font(.caption)
            .foregroundStyle(.secondary)
          Spacer()
          Text(contexto.state.estado)
            .font(.caption)
            .foregroundStyle(.secondary)
            .lineLimit(1)
        }
      }
      .padding()
      .activityBackgroundTint(Color(red: 0.07, green: 0.07, blue: 0.06))
      .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { contexto in
      let tono = color(de: contexto.state.fase)
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 8) {
            Image(systemName: "bus.fill").foregroundStyle(tono)
            VStack(alignment: .leading, spacing: 0) {
              Text(contexto.attributes.destino).font(.headline).lineLimit(1)
              Text(texto(de: contexto.state.fase)).font(.caption2.weight(.semibold)).foregroundStyle(tono)
            }
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(contexto.attributes.salida, style: .timer)
            .font(.title3.monospacedDigit().weight(.semibold))
            .frame(maxWidth: 84, alignment: .trailing)
        }
        DynamicIslandExpandedRegion(.center) {
          EmptyView()
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 8) {
            BarraDeRuta(contexto: contexto)
            HStack {
              Label("Punto \(corto(contexto.state.puntoEncuentro))", systemImage: "location.fill")
                .font(.caption)
              Spacer()
              Text(contexto.attributes.origen).font(.caption2).foregroundStyle(.secondary)
            }
          }
        }
      } compactLeading: {
        Image(systemName: "bus.fill").foregroundStyle(tono)
      } compactTrailing: {
        if contexto.state.fase == "espera" || contexto.state.fase == "abordando" || contexto.state.fase == "atrasado" {
          Text(contexto.attributes.salida, style: .timer)
            .monospacedDigit()
            .frame(maxWidth: 48)
            .foregroundStyle(tono)
        } else {
          Text(texto(de: contexto.state.fase)).font(.caption2.weight(.bold)).foregroundStyle(tono)
        }
      } minimal: {
        Image(systemName: "bus.fill").foregroundStyle(tono)
      }
      .keylineTint(tono)
    }
  }
}
