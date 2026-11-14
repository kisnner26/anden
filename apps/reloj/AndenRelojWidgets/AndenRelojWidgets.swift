import SwiftUI
import WidgetKit

struct Entrada: TimelineEntry {
    let date: Date
    let datos: Instantanea
}

struct Proveedor: TimelineProvider {
    func placeholder(in context: Context) -> Entrada {
        Entrada(date: .now, datos: Instantanea(ruta: "Managua → Boaco", destino: "Boaco", salida: .now.addingTimeInterval(1800), punto: "4PPX+HC", asiento: 12))
    }

    func getSnapshot(in context: Context, completion: @escaping (Entrada) -> Void) {
        completion(Entrada(date: .now, datos: context.isPreview ? placeholder(in: context).datos : Instantanea.cargar()))
    }

    /// una entrada cada cinco minutos durante la próxima hora: así el anillo avanza hacia la salida sin que el reloj se despierte más
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entrada>) -> Void) {
        let datos = Instantanea.cargar()
        let entradas = (0..<12).map { Entrada(date: .now.addingTimeInterval(Double($0) * 300), datos: datos) }
        completion(Timeline(entries: entradas, policy: .after(.now.addingTimeInterval(3600))))
    }
}

struct VistaComplicacion: View {
    @Environment(\.widgetFamily) private var familia
    let entrada: Entrada

    private var d: Instantanea { entrada.datos }
    private var ambar: Color { Color(red: 0.95, green: 0.71, blue: 0.20) }
    private var verde: Color { Color(red: 0.44, green: 0.81, blue: 0.59) }

    /// qué tan cerca está la salida, de 0 a 1: se empieza a llenar tres horas antes y queda llena al salir
    private var fraccion: Double {
        guard let s = d.salida else { return 0 }
        if d.salio { return 1 }
        let faltan = s.timeIntervalSince(entrada.date) / 60
        if faltan > 180 { return 0 }
        if faltan <= 0 { return 1 }
        return 1 - faltan / 180
    }

    private var tono: Color { d.salio ? verde : ambar }

    var body: some View {
        switch familia {
        case .accessoryCircular:
            if let s = d.salida {
                Gauge(value: fraccion) {
                    Image(systemName: "bus.fill")
                } currentValueLabel: {
                    Text(s, format: .dateTime.hour().minute()).font(.system(size: 13, weight: .semibold, design: .rounded)).minimumScaleFactor(0.6)
                }
                .gaugeStyle(.accessoryCircularCapacity)
                .tint(tono)
            } else {
                ZStack {
                    AccessoryWidgetBackground()
                    Text("—")
                }
            }
        case .accessoryInline:
            if let s = d.salida {
                Text("\(d.destino) \(s.formatted(.dateTime.hour().minute())) · punto \(d.punto)")
            } else {
                Text("Andén: sin viaje")
            }
        case .accessoryCorner:
            Text(d.salida.map { $0.formatted(.dateTime.hour().minute()) } ?? "—")
                .font(.system(size: 18, weight: .semibold, design: .rounded))
                .widgetLabel(d.hayViaje ? d.destino : "Sin viaje")
        default:
            VStack(alignment: .leading, spacing: 1) {
                if let s = d.salida {
                    Text(d.ruta).font(.system(size: 12, weight: .semibold)).minimumScaleFactor(0.7)
                    Text(s, format: .dateTime.hour().minute()).font(.system(size: 22, weight: .semibold, design: .rounded)).foregroundStyle(tono)
                    Text(d.salio ? "En camino" : "Punto \(d.punto) · asiento \(d.asiento)").font(.system(size: 11))
                    ProgressView(value: fraccion).tint(tono)
                } else {
                    Text("Andén").font(.system(size: 13, weight: .semibold))
                    Text("Sin viajes vigentes").font(.system(size: 11))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct ComplicacionViaje: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AndenViaje", provider: Proveedor()) { entrada in
            VistaComplicacion(entrada: entrada)
                .containerBackground(.black, for: .widget)
        }
        .configurationDisplayName("Próximo viaje")
        .description("La hora y el punto de encuentro de tu próximo viaje.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}

@main
struct AndenRelojWidgets: WidgetBundle {
    var body: some Widget {
        ComplicacionViaje()
    }
}
