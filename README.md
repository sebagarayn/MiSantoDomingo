# MiSantoDomingo

## Descripción general del sistema

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
