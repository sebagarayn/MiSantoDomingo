# MiSantoDomingo

## Identificacion de los integrantes del equipo
Sebastian Garay
Vicente Olguin
Ignacio Maureira
## Distribucion de responsabilidades
### Sebastian Garay 

Responsabilidad: Arquitectura, componentes estructurales, lógica de enrutamiento y control de calidad.

### Tareas EP1:
Configurar la estructura de carpetas (pages/, components/, routes/, services/, types/).

Implementar React Router con separación de rutas públicas y protegidas por rol, incluyendo redirecciones automáticas obligatorias (ej. usuario no autenticado redirigido a Login).

Programar contratos de datos (interfaces TypeScript) y servicios simulados (mocks) basados en promesas.

Implementar las 4 vistas mínimas en código (IonPage, IonHeader, IonContent, IonTabs, IonMenu) asegurando funcionamiento responsivo en móvil y escritorio.

Validar y mezclar los Pull Requests en la rama fronten

### Benjamin Lazcano

Responsabilidad: Requerimientos (EP 1.1), investigación de usuarios (EP 1.2), arquitectura de información (EP 1.4) y README.md (3.1).

### Tareas EP1:
Requerimientos (EP 1.1): Matriz de 7 Requerimientos Funcionales (RF) y 5 No Funcionales (RNF) con ID, Nombre y Descripción. Restricción: Ningún RF puede ser Login ni Registro.

Investigación (EP 1.2): Justificación del problema con fuentes secundarias citadas y 2 proto-personas, diferenciando explícitamente la evidencia de los supuestos hipotéticos.

Arquitectura UX (EP 1.4): Definición de task flows, jerarquía de vistas, puntos críticos y la justificación técnica (usabilidad, eficiencia, claridad y escalabilidad).

README.md (3.1): Redactar la documentación completa en Markdown con los 11 puntos obligatorios (instalación, ejecución, tecnologías, tablas, enlaces y multimedia)

### Vicente Olguin

Responsabilidad: Prototipado manual en Figma del flujo de gestión del funcionario, versión web (EP 1.3).

### Tareas EP1:
Diseñar las pantallas de Login y Registro (versión web) con estados de validación, mensajes de error (correo incorrecto, cuenta inexistente, contraseñas no coincidentes) y campos de seguridad de contraseña.

Diseñar el Dashboard (RF-10): panel de indicadores en tiempo real — reclamos ingresados, tiempo promedio de respuesta y reclamos vencidos, con filtro por rango de fechas.

Diseñar la pantalla de Gestión de reclamos (RF-06): listado tabular con filtros combinables por categoría, unidad responsable y días restantes de plazo.

Diseñar el Detalle del reclamo, incluyendo las acciones de Derivar (RF-07, con selección de unidad destino y observación) y Cerrar reclamo (RF-08, con respuesta formal), más las pantallas de resultado (éxito y error de conexión).

Diseñar la pantalla de Reportes (RF-11): selector de rango de fechas, métricas del período (tiempo promedio, % resuelto, total) y descarga en formato PDF/CSV.

### Ignacio Maureira

Responsabilidad: Prototipado manual en Figma del flujo completo del vecino, versión móvil (EP 1.3).

### Tareas EP1:
Diseñar las pantallas de Login, Registro y recuperación de contraseña (olvidé mi contraseña → código de verificación → cambio de contraseña), con sus estados de error.

Diseñar el menú de reclamos (elegir entre "Ingresar un reclamo" o "Consultar un reclamo") como punto de entrada tras iniciar sesión.

Diseñar el flujo de Ingresar un reclamo (RF-01): selección de categoría, descripción, dirección y adjuntar fotografía (cámara, archivos, galería o Google Drive), terminando en una pantalla de confirmación con el folio generado automáticamente (RF-02).

Diseñar el flujo de Consultar un reclamo (RF-03): búsqueda por folio, manejo del caso "folio no encontrado", y detalle con estado, plazo de respuesta restante (RF-04) e historial cronológico de avances.

Diseñar la pantalla de Mis reclamos: listado personal con estado y días restantes de cada reclamo.

Diseñar la pantalla de Calificación de respuesta (RF-09): visible solo cuando el reclamo está resuelto, con escala de estrellas y la respuesta formal visible.

Diseñar el menú de Perfil (datos personales, idioma, apariencia, seguridad, centro de ayuda, términos y condiciones, cerrar sesión) y el menú de Notificaciones (RF-05), con historial de actualizaciones por reclamo y opción de borrarlas.


## Problema o necesidad que aborda
Tiempos de respuesta prolongados o falta de soluciones efectivas a los reclamos y
solicitudes que los ciudadanos ingresan al municipio, generando frustración.
## Justificacion del problema y caracterizacion de los usuarios objetivos
La propuesta nace a partir del análisis del reporte comunal de Santo Domingo (Censo de Población y Vivienda 2017 y 2024, INE). Al comparar ambos períodos se observa que el grupo etario de 45 a 64 años es el más numeroso de la comuna (26,6% de la población comunal en 2024), y que el grupo de 65 años o más presenta un crecimiento sostenido entre 2017 y 2024 (de 1.457 a 2.474 personas, pasando de 13,4% a 18,8% de la población comunal). Este comportamiento demográfico es consistente con un proceso de envejecimiento poblacional que ya supera el promedio regional (16,6%) y nacional (14%) en ese tramo etario.
Este contexto es relevante porque los canales actuales de gestión de reclamos municipales (atención presencial y telefónica en la Oficina de Informaciones, Reclamos y Sugerencias, OIRS) no entregan trazabilidad al vecino: una vez ingresado un reclamo, la persona no tiene forma autónoma de saber en qué estado se encuentra ni qué unidad lo está gestionando. Cuando el reclamo pasa por más de una unidad municipal (según lo descrito en el Art. 42 del manual de ordenanzas), esta falta de visibilidad se agrava tanto para el vecino como para el propio funcionario, generando reclamos duplicados, pérdida de antecedentes y desgaste en la atención.
Si este problema no se aborda, las consecuencias esperables son: abandono del proceso de reclamo por parte del vecino (especialmente si los pasos son largos o poco claros), sobrecarga de los canales presenciales y telefónicos, pérdida de trazabilidad entre unidades municipales, y baja capacidad de la municipalidad para priorizar y medir su gestión de reclamos mediante indicadores.

Dado que el grupo etario predominante y de mayor crecimiento en la comuna corresponde a adultos medios y adultos mayores, la solución debe diseñarse pensando prioritariamente en este perfil de usuario —y no en un usuario joven "digital nativo"— sin dejar de lado al funcionario municipal que gestiona la contraparte del proceso.
## Grupos de usuarios objetivo
El sistema considera dos grupos de usuarios, correspondientes a los dos roles definidos para la aplicación:

-Vecino/Vecina (adulto medio – adulto mayor)

-Funcionario municipal (encargado de gestión de reclamos, OIRS)

## 1. Vecino/Vecina
Características generales: de acuerdo con los datos censales de la comuna, se estima para este grupo un nivel de experiencia tecnológica medio a bajo. Gran parte de las personas de este tramo etario utiliza aplicaciones básicas (por ejemplo, WhatsApp), pero no está necesariamente familiarizada con formularios extensos, procesos con múltiples pasos, o interfaces con alta densidad de información.

Necesidad principal: de carácter informativa — saber "qué está pasando" con su reclamo. Si el procedimiento resulta tedioso o poco claro, el riesgo esperado es el abandono del proceso.

Contexto de uso: cualquier lugar con conexión a internet, principalmente a través del celular, en momentos no planificados (por ejemplo, al recordar que tiene un reclamo pendiente).

Objetivos/tareas dentro del sistema: ingresar un reclamo, consultar su estado, y ser notificado ante cambios, sin depender de llamadas o visitas presenciales.

Accesibilidad, seguridad y privacidad: se requiere texto legible y lenguaje simple (RNF-01), y dado que el sistema recopila datos personales, estos deben ser protegidos adecuadamente (RNF-03).

## 2. Funcionario municipal
Características generales: se asume un nivel de experiencia tecnológica media-alta, con uso diario de herramientas de oficina como correo electrónico y planillas.

Necesidad principal: revisar y priorizar un volumen alto de reclamos de forma simultánea, sin perder trazabilidad cuando un reclamo es derivado entre distintas unidades (Art. 42 del manual de ordenanzas).

Contexto de uso: jornada laboral, en oficina municipal, principalmente desde computador de escritorio.

Objetivos/tareas dentro del sistema: visualizar reclamos pendientes, filtrar por plazo vencido o próximo a vencer, derivar, responder y cerrar reclamos.

Accesibilidad, seguridad y privacidad: al tratarse de un rol con permisos de gestión y acceso a datos de vecinos, sus acciones (derivar, cerrar, responder) deben quedar protegidas mediante autenticación con verificación de rol (RNF-03), impidiendo que un vecino acceda a estas funciones.

## Roles considerados en el sistema
Vecino/Vecina	Usuario que ingresa y hace seguimiento a sus reclamos.

Funcionario municipal	Usuario que gestiona, deriva y responde los reclamos ingresados.

## Proto-personas
Nota: los perfiles a continuación son proto-personas construidas mediante investigación documental (Censo de Población y Vivienda 2017–2024, INE, comuna de Santo Domingo) y supuestos razonados por el equipo. No corresponden a resultados obtenidos de usuarios reales, sino a una caracterización preliminar que será validada en etapas posteriores del proyecto.

### Proto-persona 1 — Vecina
Rol: Vecina

Perfil: Maria (nombre ficticio), 58 años, dueña de casa experiencia tegnologica media-baja

Necesidad principal: Saber si su reclamo esta siendo atendido 

Objetivo de uso: Ingresar el reclamo una vez y consultarlo sin tener que llamar o ir presencialmente

Frustracion: Llama a la municipalidad y no se le puede confirmar en qué estado está su reclamo, por falta de coordinación, demoras o mala gestión

Funcionalidades que usaria:Ingresar reclamo, consultar por folio, recibir notificaciones de cambio de estado

Dispositivo/contexto : 	Celular Android de gama media, con uso en cualquier lugar con conexión a internet


### Proto-persona 2 — Funcionario municipal
Rol:Funcionario municipal

Perfil: 	Felipe (nombre ficticio), 32 años, encargado de OIRS, gestiona decenas de reclamos diarios, experiencia tecnológica media-alta

Necesidad principal:Priorizar y derivar reclamos sin perder trazabilidad entre unidades

Objetivo de uso: Ver todos los reclamos pendientes, filtrar por plazo vencido/próximo a vencer, responder

Frustración: Reclamos duplicados o traspapelados entre direcciones distintas

Funcionalidades que usaría: Panel de gestión, filtros, derivación, cierre con respuesta, dashboard de indicadores

Dispositivo/contexto: Computador de escritorio, oficina municipal


### Supuestos utilizados para construir los perfiles
-Se asume que María no ha usado antes una aplicación municipal digital, por lo que su primera experiencia debe ser autoexplicativa.

-Se asume que María dispone de un celular Android con conexión intermitente, pero no necesariamente de computador en casa.

-Se asume que Felipe trabaja con computador de escritorio fijo en la oficina municipal y no gestiona reclamos desde su celular.

-Se asume que Felipe ya está familiarizado con sistemas de gestión documental municipal (Art. 42 del manual), por lo que su curva de aprendizaje de la aplicación es menor que la de un vecino.

-Se asume que ambos roles priorizan la claridad del estado del reclamo por sobre funciones avanzadas o de personalización.

### Fuente de datos demográficos: Censo de Población y Vivienda 2017 y 2024, INE — Reporte comunal de Santo Domingo, punto 1.4 "Población por grupos de edad".
## Requerimientos del proyecto
El ítem 1.1 explícitamente dice:”Estas funcionalidades están fuera de inicio se sesión o registrarse ya que deben estar inmersas en la propuesta.” Por lo que se asume todo tipo de requerimiento de agregar usuario, ingresar usuario, ingreso de datos etc.

Considerando que un proyecto tiene más requerimientos funcionales, se enfatiza en la principal problemática.

## Requerimientos funcionales
RF-01: El sistema deberá permitir que el vecino ingrese un reclamo indicando categoría (selección de lista predefinida), descripción (texto libre, máximo 500 caracteres), ubicación (dirección) y, opcionalmente, una fotografía (formato jpg o png, máximo 5 MB).

RF-02: El sistema deberá generar automáticamente un número de folio único y alfanumérico (ej. SD-2026-000123) para cada reclamo ingresado, sin duplicados, mostrado al usuario inmediatamente después del envío

RF-03: El sistema deberá permitir que el vecino consulte el estado y el historial de su reclamo mediante una búsqueda por número de folio, sin requerir inicio de sesión, mostrando el estado actual y la fecha de cada cambio

RF-04: El sistema deberá calcular automáticamente, desde la fecha de ingreso, los días restantes del plazo legal de 20 días corridos (prorrogable a 30)

RF-05: El sistema deberá notificar al usuario dentro de la aplicación cada vez que el estado de su reclamo cambie, indicando el nuevo estado y la fecha del cambio, y manteniendo un historial de notificaciones disponible en su perfil.

Nota de diseño: El sistema contempla dos vías de consulta para el vecino: (a) consulta rápida por folio sin necesidad de cuenta (RF-03), pensada para minimizar la barrera de entrada; y (b) una cuenta opcional que permite ver el historial completo de reclamos propios y recibir notificaciones (RF-05). Esto responde al perfil de baja experiencia tecnológica de María, evitando forzar un registro obligatorio para una consulta simple.

RF-06: El sistema deberá permitir que el funcionario liste y filtre los reclamos por categoría, unidad responsable y rango de días restantes, pudiendo combinar estos filtros entre sí.

RF-07: El sistema deberá permitir que el funcionario derive un reclamo a otra unidad municipal, seleccionando la unidad destino y registrando una observación obligatoria en el historial.

RF-08: El sistema deberá permitir que el funcionario cierre un reclamo ingresando obligatoriamente una respuesta formal en texto libre, cambiando automáticamente el estado a "Resuelto" y dejando la respuesta visible para el vecino.

RF-09: El sistema deberá permitir que el vecino califique, en una escala de 1 a 5, la respuesta recibida, una única vez por reclamo, y solo cuando este se encuentre en estado "Resuelto".

RF-10: El sistema deberá mostrar al funcionario un panel con el tiempo promedio de respuesta en días, la cantidad de reclamos vencidos, y la posibilidad de filtrar estos indicadores por rango de fechas.

RF-11: El sistema deberá permitir que el funcionario genere un informe periódico (mensual o por rango de fechas) con la cantidad de reclamos ingresados, el tiempo promedio de respuesta por categoría y el porcentaje de reclamos resueltos dentro del plazo legal, descargable en formato PDF o CSV. 

## Requerimientos no funcionales

RNF-01 (Usabilidad): La interfaz deberá cumplir un estándar de lenguaje simple y tipografía legible (tamaño mínimo 16px, sin tecnicismos), permitiendo que el ingreso de un reclamo se complete en 3 minutos o menos sin ayuda externa.

RNF-02 (Rendimiento): El formulario de ingreso de reclamo, incluida la carga de 
fotografía, deberá funcionar de forma aceptable en conexión 3G/intermitente, 
mostrando retroalimentación visual de progreso durante la subida.

RNF-03 (Seguridad): El sistema deberá restringir el acceso a las funciones según el rol del usuario, permitiendo que cada tipo de usuario acceda únicamente a las funcionalidades que le correspondan.

RNF-04 (Usabilidad): Las acciones principales del vecino (ingresar reclamo, 
consultar por folio) deberán estar accesibles en máximo 2 toques desde la 
pantalla de inicio, con elementos interactivos de mínimo 44x44 px.

RNF-05 (Trazabilidad): Todo cambio de estado o derivación entre unidades 
municipales deberá quedar registrado con fecha, hora y responsable, visible 
en el historial del reclamo.

RNF-06 (Compatibilidad): La aplicación deberá funcionar correctamente en las últimas dos versiones de Chrome y Safari, y como app móvil en Android 10 o superior e iOS 15.

## Instrucciones de instalación y configuración

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/sebagarayn/MiSantoDomingo.git

   ```

2. Cambiar a la rama de desarrollo:
   cd MiSantoDomingo
   git checkout frontend

3. Instalar las dependencias:
   npm install

# Instrucciones de ejecución y uso

Para levantar el entorno de desarrollo local
npm run dev

(o ionic serve si se prefiere usar la CLI de Ionic)

Una vez iniciado, abrir el navegador en la URL que indique la terminal (por defecto http://localhost:5173 o similar).

# Mockups
### Link para mockups app web

Vicente Olguin :

### Link para mockups app movil

Ignacio Maureira:
