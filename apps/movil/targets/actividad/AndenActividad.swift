import ActivityKit
import SwiftUI
import WidgetKit

@main
struct AndenActividadBundle: WidgetBundle {
  var body: some Widget {
    ActividadDelViaje()
  }
}

// MARK: - Identidad: la paleta de Andén

private enum Paleta {
  static let ambar = Color(red: 1.0, green: 0.70, blue: 0.12)
  static let ambarClaro = Color(red: 1.0, green: 0.82, blue: 0.40)
  static let ambarProfundo = Color(red: 0.88, green: 0.55, blue: 0.0)
  static let carbon = Color(red: 0.07, green: 0.07, blue: 0.06)
  static let carbonClaro = Color(red: 0.13, green: 0.12, blue: 0.10)
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

private func simbolo(de fase: String) -> String {
  switch fase {
  case "abordando": return "figure.walk.arrival"
  case "atrasado": return "exclamationmark.triangle.fill"
  case "ruta": return "road.lanes"
  case "llego": return "checkmark.seal.fill"
  default: return "clock.fill"
  }
}

private func esperando(_ fase: String) -> Bool {
  fase == "espera" || fase == "abordando" || fase == "atrasado"
}

/// en la isla dinámica no cabe el código entero: se muestran los últimos siete signos, como "4PPX+HC"
private func corto(_ punto: String) -> String {
  punto.isEmpty ? "por confirmar" : String(punto.suffix(7))
}

// MARK: - La mascota: el microbús Rumbo dibujado a mano

/// Rumbo, el microbús ámbar con la cara en el parabrisas; sus ojos miran hacia donde va el viaje
private struct MarcaRumbo: View {
  var tamano: CGFloat
  var tono: Color = Paleta.ambar
  var contento: Bool = true

  var body: some View {
    let ancho = tamano
    let alto = tamano * 0.86
    ZStack {
      // sombra en el suelo
      Ellipse()
        .fill(Color.black.opacity(0.35))
        .frame(width: ancho * 0.72, height: alto * 0.08)
        .offset(y: alto * 0.47)
      // cuerpo
      RoundedRectangle(cornerRadius: ancho * 0.17, style: .continuous)
        .fill(
          LinearGradient(
            colors: [tono.opacity(1), tono.opacity(0.78)], startPoint: .top, endPoint: .bottom)
        )
        .overlay(
          RoundedRectangle(cornerRadius: ancho * 0.17, style: .continuous)
            .stroke(Paleta.ambarProfundo.opacity(0.9), lineWidth: max(1, ancho * 0.03))
        )
        .frame(width: ancho * 0.86, height: alto * 0.66)
        .offset(y: -alto * 0.07)
      // franja
      Capsule()
        .fill(Paleta.ambarProfundo.opacity(0.5))
        .frame(width: ancho * 0.72, height: alto * 0.05)
        .offset(y: alto * 0.17)
      // parabrisas
      RoundedRectangle(cornerRadius: ancho * 0.1, style: .continuous)
        .fill(Paleta.carbon)
        .frame(width: ancho * 0.72, height: alto * 0.34)
        .offset(y: -alto * 0.2)
      // brillo del parabrisas
      Capsule()
        .fill(Color.white.opacity(0.14))
        .frame(width: ancho * 0.28, height: alto * 0.04)
        .offset(x: -ancho * 0.16, y: -alto * 0.32)
      // ojos
      HStack(spacing: ancho * 0.12) {
        Ojo(diametro: ancho * 0.15)
        Ojo(diametro: ancho * 0.15)
      }
      .offset(y: -alto * 0.2)
      // sonrisa
      if contento {
        Capsule()
          .trim(from: 0, to: 1)
          .fill(Color.white.opacity(0.85))
          .frame(width: ancho * 0.14, height: alto * 0.035)
          .offset(y: -alto * 0.05)
      }
      // ruedas
      HStack(spacing: ancho * 0.34) {
        Rueda(diametro: ancho * 0.22)
        Rueda(diametro: ancho * 0.22)
      }
      .offset(y: alto * 0.36)
      // luces
      Circle()
        .fill(Paleta.ambarClaro)
        .frame(width: ancho * 0.07, height: ancho * 0.07)
        .offset(x: ancho * 0.36, y: alto * 0.12)
    }
    .frame(width: ancho, height: alto)
  }
}

private struct Ojo: View {
  var diametro: CGFloat
  var body: some View {
    ZStack {
      Circle().fill(Color.white).frame(width: diametro, height: diametro)
      Circle().fill(Paleta.carbon).frame(width: diametro * 0.46, height: diametro * 0.46)
        .offset(x: diametro * 0.14)
    }
  }
}

private struct Rueda: View {
  var diametro: CGFloat
  var body: some View {
    ZStack {
      Circle().fill(Paleta.carbon).frame(width: diametro, height: diametro)
      Circle().fill(Paleta.crema.opacity(0.85)).frame(width: diametro * 0.38, height: diametro * 0.38)
    }
  }
}

// MARK: - Piezas compartidas

/// la etiqueta de en qué momento está el viaje
private struct PildoraDeFase: View {
  let fase: String
  var body: some View {
    let tono = color(de: fase)
    HStack(spacing: 4) {
      Image(systemName: simbolo(de: fase)).font(.system(size: 10, weight: .bold))
      Text(texto(de: fase)).font(.system(size: 11, weight: .bold, design: .rounded))
    }
    .foregroundStyle(tono)
    .padding(.horizontal, 8)
    .padding(.vertical, 3)
    .background(Capsule().fill(tono.opacity(0.18)))
    .overlay(Capsule().stroke(tono.opacity(0.35), lineWidth: 0.8))
  }
}

/// el camino de la salida: un punto, una barra que se llena con el tiempo y la meta; el bus viaja encima
private struct CaminoDeSalida: View {
  let contexto: ActivityViewContext<AtributosViaje>

  var body: some View {
    let tono = color(de: contexto.state.fase)
    let espera = esperando(contexto.state.fase)
    VStack(spacing: 6) {
      HStack(spacing: 8) {
        Circle().fill(tono).frame(width: 8, height: 8)
          .overlay(Circle().stroke(Paleta.carbon, lineWidth: 2))
        Group {
          if espera && contexto.attributes.desde < contexto.attributes.salida {
            ProgressView(
              timerInterval: contexto.attributes.desde...contexto.attributes.salida,
              countsDown: false
            ) {
              EmptyView()
            } currentValueLabel: {
              EmptyView()
            }
          } else {
            ProgressView(value: contexto.state.fase == "llego" ? 1 : 0.55)
          }
        }
        .tint(tono)
        .scaleEffect(y: 1.7)
        Image(systemName: "flag.checkered.2.crossed")
          .font(.system(size: 13, weight: .bold))
          .foregroundStyle(contexto.state.fase == "llego" ? Paleta.verde : tono.opacity(0.85))
      }
    }
  }
}

/// el punto de encuentro, como una ficha con el Plus Code en letra de máquina
private struct FichaDePunto: View {
  let punto: String
  var body: some View {
    HStack(spacing: 5) {
      Image(systemName: "mappin.and.ellipse").font(.system(size: 11, weight: .bold))
        .foregroundStyle(Paleta.ambar)
      Text(corto(punto))
        .font(.system(size: 12, weight: .semibold, design: .monospaced))
        .foregroundStyle(Paleta.crema)
    }
    .padding(.horizontal, 9)
    .padding(.vertical, 4)
    .background(Capsule().fill(Color.white.opacity(0.08)))
    .overlay(Capsule().stroke(Color.white.opacity(0.12), lineWidth: 0.8))
  }
}

/// la cuenta regresiva hacia la salida, grande y sin que haya que actualizar nada: el sistema la mueve sola
private struct Cuenta: View {
  let contexto: ActivityViewContext<AtributosViaje>
  var tamano: CGFloat = 30
  var body: some View {
    let tono = color(de: contexto.state.fase)
    if esperando(contexto.state.fase) {
      VStack(alignment: .trailing, spacing: 0) {
        Text("SALE EN")
          .font(.system(size: 9, weight: .heavy, design: .rounded))
          .tracking(1.4)
          .foregroundStyle(Paleta.crema.opacity(0.55))
        Text(contexto.attributes.salida, style: .timer)
          .font(.system(size: tamano, weight: .heavy, design: .rounded).monospacedDigit())
          .foregroundStyle(contexto.state.fase == "atrasado" ? Paleta.rojo : Paleta.crema)
          .multilineTextAlignment(.trailing)
          .frame(maxWidth: 112, alignment: .trailing)
          .minimumScaleFactor(0.7)
          .lineLimit(1)
      }
    } else {
      Image(systemName: simbolo(de: contexto.state.fase))
        .font(.system(size: tamano * 0.9, weight: .bold))
        .foregroundStyle(tono)
    }
  }
}

/// el fondo de la pantalla de bloqueo: carbón con un resplandor ámbar que cambia de color con el momento del viaje
private struct FondoAnden: View {
  let tono: Color
  var body: some View {
    ZStack {
      LinearGradient(
        colors: [Paleta.carbonClaro, Paleta.carbon], startPoint: .topLeading, endPoint: .bottomTrailing)
      RadialGradient(
        colors: [tono.opacity(0.32), .clear], center: .topLeading, startRadius: 4, endRadius: 190)
      RadialGradient(
        colors: [Paleta.ambarProfundo.opacity(0.14), .clear], center: .bottomTrailing, startRadius: 4,
        endRadius: 150)
    }
  }
}

// MARK: - La actividad

struct ActividadDelViaje: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: AtributosViaje.self) { contexto in
      let tono = color(de: contexto.state.fase)
      ZStack {
        FondoAnden(tono: tono)
        VStack(spacing: 14) {
          HStack(alignment: .center, spacing: 12) {
            MarcaRumbo(tamano: 58, tono: tono == Paleta.gris ? Paleta.ambar : Paleta.ambar)
            VStack(alignment: .leading, spacing: 3) {
              Text("ANDÉN")
                .font(.system(size: 9, weight: .heavy, design: .rounded))
                .tracking(2)
                .foregroundStyle(Paleta.ambar)
              Text("\(contexto.attributes.origen) → \(contexto.attributes.destino)")
                .font(.system(size: 19, weight: .heavy, design: .rounded))
                .foregroundStyle(Paleta.crema)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
              PildoraDeFase(fase: contexto.state.fase)
            }
            Spacer(minLength: 4)
            Cuenta(contexto: contexto)
          }
          CaminoDeSalida(contexto: contexto)
          HStack {
            FichaDePunto(punto: contexto.state.puntoEncuentro)
            Spacer()
            Text(contexto.state.estado)
              .font(.system(size: 12, weight: .medium, design: .rounded))
              .foregroundStyle(Paleta.crema.opacity(0.7))
              .lineLimit(1)
              .contentTransition(.opacity)
          }
        }
        .padding(16)
      }
      .activityBackgroundTint(Paleta.carbon)
      .activitySystemActionForegroundColor(Paleta.ambar)
    } dynamicIsland: { contexto in
      let tono = color(de: contexto.state.fase)
      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          HStack(spacing: 8) {
            MarcaRumbo(tamano: 40)
            VStack(alignment: .leading, spacing: 2) {
              Text(contexto.attributes.destino)
                .font(.system(size: 16, weight: .heavy, design: .rounded))
                .foregroundStyle(Paleta.crema)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
              PildoraDeFase(fase: contexto.state.fase)
            }
          }
          .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Cuenta(contexto: contexto, tamano: 26)
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          VStack(spacing: 10) {
            CaminoDeSalida(contexto: contexto)
            HStack {
              FichaDePunto(punto: contexto.state.puntoEncuentro)
              Spacer()
              Label(contexto.attributes.origen, systemImage: "arrow.turn.down.right")
                .font(.system(size: 11, weight: .semibold, design: .rounded))
                .foregroundStyle(Paleta.crema.opacity(0.65))
            }
          }
          .padding(.horizontal, 4)
          .padding(.top, 2)
        }
      } compactLeading: {
        HStack(spacing: 3) {
          MarcaRumbo(tamano: 24)
        }
        .padding(.leading, 2)
      } compactTrailing: {
        if esperando(contexto.state.fase) {
          Text(contexto.attributes.salida, style: .timer)
            .font(.system(size: 14, weight: .heavy, design: .rounded).monospacedDigit())
            .foregroundStyle(tono)
            .frame(maxWidth: 50)
            .minimumScaleFactor(0.7)
        } else {
          Image(systemName: simbolo(de: contexto.state.fase))
            .font(.system(size: 13, weight: .bold))
            .foregroundStyle(tono)
        }
      } minimal: {
        MarcaRumbo(tamano: 22)
      }
      .keylineTint(tono)
    }
  }
}
