import ActivityKit
import SwiftUI
import WidgetKit

@main
struct AndenActividadBundle: WidgetBundle {
  var body: some Widget {
    ActividadDelViaje()
  }
}

// MARK: - Paleta de Andén

private enum Paleta {
  static let ambar = Color(red: 1.0, green: 0.70, blue: 0.12)
  static let carbon = Color(red: 0.07, green: 0.07, blue: 0.06)
  static let crema = Color(red: 0.96, green: 0.93, blue: 0.86)
  static let verde = Color(red: 0.44, green: 0.81, blue: 0.59)
  static let rojo = Color(red: 1.0, green: 0.42, blue: 0.34)
  static let azul = Color(red: 0.36, green: 0.78, blue: 0.85)
  static let gris = Color(white: 0.62)
}

/// el color de cada momento del viaje: ámbar mientras espera, verde al abordar, azul en ruta, rojo si se atrasa
private func color(de fase: String) -> Color {
  switch fase {
  case "abordando": return Paleta.verde
  case "atrasado": return Paleta.rojo
  case "ruta": return Paleta.azul
  case "llego": return Paleta.gris
  default: return Paleta.ambar
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

private func esperando(_ fase: String) -> Bool {
  fase == "espera" || fase == "abordando" || fase == "atrasado"
}

/// el vehículo de la persona: el mismo dibujo que se ve en la app, ya sea un bus o su vehículo de Plus
private struct Vehiculo: View {
  let id: String
  var ancho: CGFloat
  var body: some View {
    Image("veh_\(id)")
      .resizable()
      .scaledToFit()
      .frame(width: ancho, height: ancho * 0.58)
  }
}

/// la barra fina del viaje: hacia la salida mientras espera y hacia la llegada una vez en ruta
private struct BarraDelViaje: View {
  let contexto: ActivityViewContext<AtributosViaje>
  var body: some View {
    let tono = color(de: contexto.state.fase)
    Group {
      if contexto.state.fase == "llego" {
        ProgressView(value: 1.0)
      } else if esperando(contexto.state.fase) && contexto.attributes.desde < contexto.attributes.salida {
        ProgressView(
          timerInterval: contexto.attributes.desde...contexto.attributes.salida, countsDown: false
        ) {
          EmptyView()
        } currentValueLabel: {
          EmptyView()
        }
      } else if contexto.attributes.salida < contexto.attributes.llegada {
        ProgressView(
          timerInterval: contexto.attributes.salida...contexto.attributes.llegada, countsDown: false
        ) {
          EmptyView()
        } currentValueLabel: {
          EmptyView()
        }
      } else {
        ProgressView(value: 0.5)
      }
    }
    .tint(tono)
  }
}

/// lo que cuenta ahora: el tiempo que falta para salir o, ya en camino, la hora de llegada
private struct Cuenta: View {
  let contexto: ActivityViewContext<AtributosViaje>
  var tamano: CGFloat = 20
  var body: some View {
    if esperando(contexto.state.fase) {
      Text(contexto.attributes.salida, style: .timer)
        .font(.system(size: tamano, weight: .bold, design: .rounded).monospacedDigit())
        .foregroundStyle(contexto.state.fase == "atrasado" ? Paleta.rojo : Paleta.crema)
        .multilineTextAlignment(.trailing)
        .frame(maxWidth: 96, alignment: .trailing)
        .minimumScaleFactor(0.6)
        .lineLimit(1)
    } else {
      Text(contexto.attributes.llegada, style: .time)
        .font(.system(size: tamano, weight: .bold, design: .rounded).monospacedDigit())
        .foregroundStyle(Paleta.crema)
        .frame(maxWidth: 110, alignment: .trailing)
        .minimumScaleFactor(0.6)
        .lineLimit(1)
    }
  }
}

/// la línea de abajo del título: en qué momento va y a qué hora se espera la llegada
private struct Subtitulo: View {
  let contexto: ActivityViewContext<AtributosViaje>
  var body: some View {
    HStack(spacing: 5) {
      Circle().fill(color(de: contexto.state.fase)).frame(width: 7, height: 7)
      Text(texto(de: contexto.state.fase))
        .foregroundStyle(color(de: contexto.state.fase))
      if esperando(contexto.state.fase) {
        Text("· llega \(contexto.attributes.llegada, style: .time)")
          .foregroundStyle(Paleta.crema.opacity(0.65))
      }
    }
    .font(.system(size: 12, weight: .semibold, design: .rounded))
    .lineLimit(1)
  }
}

// MARK: - La actividad

struct ActividadDelViaje: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: AtributosViaje.self) { contexto in
      VStack(spacing: 10) {
        HStack(alignment: .center, spacing: 12) {
          Vehiculo(id: contexto.attributes.vehiculo, ancho: 58)
          VStack(alignment: .leading, spacing: 3) {
            Text("\(contexto.attributes.origen) → \(contexto.attributes.destino)")
              .font(.system(size: 16, weight: .bold, design: .rounded))
              .foregroundStyle(Paleta.crema)
              .lineLimit(1)
              .minimumScaleFactor(0.6)
            Subtitulo(contexto: contexto)
          }
          Spacer(minLength: 4)
          Cuenta(contexto: contexto)
        }
        BarraDelViaje(contexto: contexto)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 14)
      .activityBackgroundTint(Paleta.carbon)
      .activitySystemActionForegroundColor(Paleta.ambar)
    } dynamicIsland: { contexto in
      let tono = color(de: contexto.state.fase)
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Vehiculo(id: contexto.attributes.vehiculo, ancho: 54)
            .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Cuenta(contexto: contexto, tamano: 22)
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.center) {
          Text(contexto.attributes.destino)
            .font(.system(size: 16, weight: .bold, design: .rounded))
            .foregroundStyle(Paleta.crema)
            .lineLimit(1)
            .minimumScaleFactor(0.6)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 8) {
            Subtitulo(contexto: contexto)
            BarraDelViaje(contexto: contexto)
          }
          .padding(.horizontal, 4)
        }
      } compactLeading: {
        Vehiculo(id: contexto.attributes.vehiculo, ancho: 30)
      } compactTrailing: {
        if esperando(contexto.state.fase) {
          Text(contexto.attributes.salida, style: .timer)
            .font(.system(size: 14, weight: .bold, design: .rounded).monospacedDigit())
            .foregroundStyle(tono)
            .frame(maxWidth: 50)
            .minimumScaleFactor(0.7)
        } else {
          Text(contexto.attributes.llegada, style: .time)
            .font(.system(size: 12, weight: .bold, design: .rounded))
            .foregroundStyle(tono)
            .frame(maxWidth: 50)
            .minimumScaleFactor(0.6)
        }
      } minimal: {
        Vehiculo(id: contexto.attributes.vehiculo, ancho: 26)
      }
      .keylineTint(tono)
    }
  }
}
