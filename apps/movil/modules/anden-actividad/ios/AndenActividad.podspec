Pod::Spec.new do |s|
  s.name           = 'AndenActividad'
  s.version        = '1.0.0'
  s.summary        = 'Live Activity del viaje: bus, andén y cuenta atrás en la pantalla de bloqueo y el reloj'
  s.description    = 'Puente a ActivityKit. Todo se muestra desde el teléfono, sin servidor de notificaciones.'
  s.license        = 'MIT'
  s.author         = 'Andén'
  s.homepage       = 'https://github.com/kisnner26/anden'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/kisnner26/anden.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.weak_frameworks = 'ActivityKit'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }
end
