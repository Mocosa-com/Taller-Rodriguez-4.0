<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/699c90bc-9406-4d02-9099-0b7e1c41fa41

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Arquitectura MVC

El frontend sigue una separación MVC adaptada a React:

- `src/models/`: tipos, datos iniciales y reglas de negocio puras, como la autenticación.
- `src/controllers/`: hooks que coordinan estado, eventos y persistencia entre el modelo y las vistas.
- `src/views/`: punto de entrada único para las pantallas visibles de la aplicación.
- `src/components/`: implementación visual de cada pantalla y sus componentes reutilizables.
- `src/App.tsx`: composición principal y coordinación de los módulos del taller.

Para añadir un módulo nuevo, coloca la regla de negocio en `models`, el estado y las acciones en `controllers`, y la interfaz en `components`; después expórtala desde `views/index.ts`.
