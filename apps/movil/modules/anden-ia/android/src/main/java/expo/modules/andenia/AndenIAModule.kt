package expo.modules.andenia

import com.google.mlkit.genai.common.FeatureStatus
import com.google.mlkit.genai.prompt.Generation
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch

/** Gemini Nano por ML Kit GenAI: mismo contrato que el módulo de iOS (disponibilidad y responder) */
class AndenIAModule : Module() {
  private val modelo by lazy { Generation.getClient() }

  override fun definition() = ModuleDefinition {
    Name("AndenIA")

    AsyncFunction("disponibilidad") Coroutine { ->
      try {
        when (modelo.checkStatus()) {
          FeatureStatus.AVAILABLE -> "disponible"
          FeatureStatus.DOWNLOADABLE -> {
            // el modelo se baja una vez; mientras tanto la app dice que se está preparando
            appContext.backgroundCoroutineScope.launch {
              try {
                modelo.download().collect { }
              } catch (_: Exception) {
              }
            }
            "no-lista"
          }
          FeatureStatus.DOWNLOADING -> "no-lista"
          else -> "no-compatible"
        }
      } catch (_: Exception) {
        "no-compatible"
      }
    }

    AsyncFunction("responder") Coroutine { instrucciones: String, pregunta: String ->
      if (modelo.checkStatus() != FeatureStatus.AVAILABLE) {
        throw CodedException("ERR_ANDEN_IA_NO_DISPONIBLE", "Gemini Nano no está listo en este teléfono.", null)
      }
      try {
        // la API no tiene instrucciones de sistema separadas: van antes de la pregunta
        val respuesta = modelo.generateContent("$instrucciones\n\nPregunta: $pregunta")
        respuesta.candidates.firstOrNull()?.text?.trim().orEmpty()
      } catch (e: Exception) {
        throw CodedException("ERR_ANDEN_IA_RESPUESTA", e.message ?: "Gemini no pudo responder.", e)
      }
    }
  }
}
