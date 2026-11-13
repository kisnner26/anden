import SwiftUI
import WidgetKit

struct Entrada: TimelineEntry {
    let date: Date
    let datos: Instantanea
}

struct Proveedor: TimelineProvider {
    func placeholder(in context: Context) -> Entrada {
        Entrada(date: .now, datos: Instantanea(ruta: "Managua → Boaco", destino: "Boaco", salida: .now.addingTimeInterval(1800), anden: 2, asiento: 12))
    }

    func getSnapshot(in context: Context, completion: @escaping (Entrada) -> Void) {
        completion(Entrada(date: .now, datos: context.isPreview ? placeholder(in: context).datos : Instantanea.cargar()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entrada>) -> Void) {
        let datos = Instantanea.cargar()
        completion(Timeline(entries: [Entrada(date: .now, datos: datos)], policy: .after(.now.addingTimeInterval(15 * 60))))
    }
}

struct VistaComplicacion: View {
    @Environment(\.widgetFamily) private var familia
    let entrada: Entrada

    private var d: Instantanea { entrada.datos }
    private var ambar: Color { Color(red: 0.95, green: 0.71, blue: 0.20) }

    var body: some View {
        switch familia {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                if let s = d.salida {
                    VStack(spacing: 0) {
                        Text(s, format: .dateTime.hour().minute()).font(.system(size: 15, weight: .semibold, design: .rounded))
                        Text(d.salio ? "EN RUTA" : "ANDÉN \(d.anden)").font(.system(size: 8, weight: .medium)).foregroundStyle(ambar)
                    }
                } else {
                    Text("—")
                }
            }
        case .accessoryInline:
            if let s = d.salida {
                Text("\(d.destino) \(s.formatted(.dateTime.hour().minute())) · andén \(d.anden)")
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
                    Text(s, format: .dateTime.hour().minute()).font(.system(size: 22, weight: .semibold, design: .rounded)).foregroundStyle(ambar)
                    Text(d.salio ? "En camino" : "Andén \(d.anden) · asiento \(d.asiento)").font(.system(size: 11))
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
        .description("La hora y el andén de tu próximo viaje.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline, .accessoryCorner])
    }
}

@main
struct AndenRelojWidgets: WidgetBundle {
    var body: some Widget {
        ComplicacionViaje()
    }
}
