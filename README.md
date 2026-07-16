# Dr. Jorge Cambrón · Tricología y Restauración Capilar

Sitio estático de la clínica de tricología del Dr. Jorge Cambrón Barrales.
Medicina capilar y restauración estética personalizada, con consultorios en
Morelia, Guadalajara y León.

Diseño basado en el proyecto de Claude Design
["Tricología Cambrón — Design System"](https://claude.ai/design/p/3d230687-0450-48aa-96e3-7665eef082e9).

## Estructura

- `index.html` — landing principal (hero con canvas animado, método, tratamientos, resultados, doctor, ubicaciones, testimonios, FAQ, agenda).
- `aviso-de-privacidad.html` — aviso LFPDPPP (enlazado desde el formulario).
- `assets/css/` — tokens del design system + estilos de la landing.
- `assets/js/` — animación del hero (canvas) + interacciones (formulario → WhatsApp).
- `assets/antes-y-despues/` — casos reales recortados; originales de Instagram en `original-instagram/`.
- `assets/logo/` — ícono folicular oficial, favicon y apple-touch-icon.
- `robots.txt`, `sitemap.xml`, `llms.txt` — SEO y descubrimiento por IA.

## ⚠️ Al mudar a dominio propio

Buscar y reemplazar `https://paulettecb.github.io/drjorgecambr-n-tricolog-a`
por el dominio real en estos 4 archivos:

1. `index.html` — canonical, `og:url`, `og:image` y las URLs del JSON-LD.
2. `sitemap.xml` — las dos etiquetas `<loc>`.
3. `robots.txt` — la línea `Sitemap:`.
4. `llms.txt` — los enlaces de la sección "Páginas".

Nada más requiere cambios: el resto del sitio usa rutas relativas.

## Datos pendientes

- Correo del responsable para derechos ARCO (aviso de privacidad).
- Sede y dirección en León.
- Horario semanal de atención por sede.
