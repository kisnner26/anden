# Tesis de graduación: plan

Documento vivo. Cada decisión que cambie se anota al final, en "Decisiones", con su fecha.

## Título provisional

Predicción de demanda y de llegada con redes neuronales en un sistema de transporte interlocal: diseño, implementación y evaluación sobre la plataforma Andén.

## Planteamiento

El transporte interlocal en Nicaragua se organiza con horarios fijos que no reflejan la demanda real: hay salidas que se llenan y otras que salen casi vacías, y la hora de llegada que ve el pasajero es una estimación estática. Andén ya captura, desde el teléfono del pasajero y del conductor, las señales necesarias para medirlo (ocupación por salida, ubicación del bus, hora real de salida). Falta convertir esos datos en predicciones útiles y comprobar si las redes neuronales mejoran de verdad a los métodos clásicos en este contexto, donde los datos son pocos.

## Pregunta de investigación

¿En qué medida un modelo basado en redes neuronales mejora, frente a modelos estadísticos y de aprendizaje automático clásico, la predicción (a) de la ocupación de una salida y (b) de la hora de llegada de un bus interlocal, cuando se entrena con los datos que genera una plataforma de reservas de tamaño pequeño?

## Hipótesis

- H1. Una red recurrente o convolucional temporal reduce el error absoluto medio de la ocupación por salida frente al promedio histórico por ruta, día y hora.
- H2. Con pocos datos, el modelo clásico (gradiente boosting) iguala o supera a la red; la red solo gana si se le agregan representaciones por ruta y calendario. Esta hipótesis se plantea para poder reportar un resultado honesto sea cual sea.
- H3. Un modelo de llegada que usa la trayectoria GPS reciente corrige la estimación estática en al menos un porcentaje a definir con los datos del piloto.

## Objetivos

General: diseñar, implementar y evaluar un sistema de predicción con redes neuronales integrado a una plataforma de transporte interlocal, expuesto mediante una API propia.

Específicos:
1. Diseñar la API de Andén (contratos, seguridad, versionado) y migrar de forma gradual la lógica que hoy vive en el teléfono y en Supabase.
2. Construir la canalización de datos: telemetría, ocupación e historial de salidas, con control de calidad y anonimización.
3. Entrenar y comparar modelos de ocupación y de llegada contra al menos tres referencias (promedio histórico, estacional ingenuo, gradiente boosting).
4. Integrar los modelos ganadores al servicio y a la app, midiendo latencia y costo de inferencia.
5. Evaluar con un piloto real (una o dos cooperativas) y con pruebas de carga y de seguridad.

## Alcance y límites

Entra: ocupación por salida, hora de llegada, API, canalización de datos, piloto pequeño.
No entra (se menciona como trabajo futuro): precios dinámicos (las tarifas las fija la norma del MTI), reconocimiento de choques con redes (faltan datos etiquetados y hay riesgo ético), entrenar modelos de lenguaje propios (el asistente usa el modelo del teléfono y se evalúa, no se entrena).

## Metodología

Design Science Research para construir el artefacto, con las fases CRISP-DM para el trabajo con datos.

Evaluación de modelos:
- División por tiempo, nunca aleatoria; validación con origen móvil (rolling origin).
- Métricas: MAE, RMSE y sMAPE para ocupación; MAE en minutos y percentil 90 del error para llegada; para clasificación de "se llena", AUC-PR.
- Comparación estadística entre modelos (prueba de Diebold-Mariano) y repeticiones con semillas distintas para las redes.
- Todo experimento queda registrado (parámetros, datos, semilla, métrica) para poder repetirlo.

Calidad del sistema: atributos de ISO/IEC 25010 (rendimiento, seguridad, fiabilidad, mantenibilidad), pruebas de carga y revisión contra OWASP ASVS.

## Datos

Fuente real: el piloto. Se necesita ya el acuerdo con una o dos cooperativas y con sus conductores, porque los datos tardan en acumularse y las redes no se pueden evaluar sin ellos.

Mientras tanto: un simulador de demanda y de tráfico, calibrado con lo poco que haya, que sirve para probar la canalización y preentrenar. Los resultados con datos simulados se reportan aparte y nunca se mezclan con los reales.

Datos personales: se guardan solo identificadores seudónimos; la ubicación se agrega o se recorta cuando sale de la ruta; el piloto lleva consentimiento escrito. Revisar con el tutor la ley nicaragüense de protección de datos personales vigente antes de empezar.

## Cronograma (7 meses, a ajustar con el calendario de la universidad)

| Mes | Foco | Entregable |
| --- | --- | --- |
| 1 (nov-dic) | Tutor, planteamiento, arquitectura de la API, esquema de telemetría | Protocolo de tesis y documento de arquitectura |
| 2 (dic-ene) | API v1, canalización de datos, simulador | API con pruebas, datos simulados |
| 3 (ene-feb) | Arranque del piloto, modelos de referencia | Primeras mediciones reales y baselines |
| 4 (feb-mar) | Redes v1 y experimentos | Informe de experimentos |
| 5 (mar-abr) | Servir modelos en la API, mostrar predicciones en la app | Integración de punta a punta |
| 6 (abr-may) | Evaluación en el piloto, carga y seguridad | Resultados y análisis |
| 7 (may-jun) | Redacción y defensa | Documento final |

## Riesgos

- Pocos datos reales: se mitiga con piloto temprano, modelos con pocos parámetros y simulador, y reportando honestamente si la red no gana.
- Piloto que no arranca: plan B con datos simulados y públicos, aclarando la limitación en el documento.
- Alcance excesivo: la tesis es predicción de ocupación y llegada más la API; todo lo demás es trabajo futuro.
- Privacidad: minimizar datos desde el diseño.

## Estructura del documento final

1. Introducción. 2. Marco teórico. 3. Estado del arte. 4. Metodología. 5. Diseño y arquitectura. 6. Implementación. 7. Experimentos y resultados. 8. Discusión. 9. Conclusiones y trabajo futuro. Anexos: contratos de la API, esquema de datos, protocolo del piloto.

## Decisiones

- 2026-11-14. Enfoque: predicción de ocupación y de llegada. Datos: piloto con cooperativa más simulador al inicio. Backend: se sigue sobre Supabase (base de datos, cuentas y tiempo real) y se agregan servicios propios encima.
