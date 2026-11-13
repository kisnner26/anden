Pod::Spec.new do |s|
  s.name           = 'AndenIA'
  s.version        = '1.0.0'
  s.summary        = 'Apple Intelligence en Andén: el modelo del teléfono para el asistente'
  s.description    = 'Puente a Foundation Models. El modelo corre en el teléfono; las preguntas no salen de él.'
  s.license        = 'MIT'
  s.author         = 'Andén'
  s.homepage       = 'https://github.com/kisnner26/anden'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/kisnner26/anden.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  # FoundationModels existe desde iOS 26: se enlaza en débil para que la app siga abriendo en versiones anteriores
  s.weak_frameworks = 'FoundationModels'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
