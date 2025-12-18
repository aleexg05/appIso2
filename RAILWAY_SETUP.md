# Desplegar en Railway con persistencia

## Pasos para desplegar:

1. **Instala Railway CLI** (si no lo tienes):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login en Railway**:
   ```bash
   railway login
   ```

3. **Inicializa el proyecto**:
   ```bash
   railway init
   ```

4. **Despliega**:
   ```bash
   railway up
   ```

5. **IMPORTANTE - Configurar volumen persistente**:
   - Ve a tu proyecto en Railway Dashboard: https://railway.app/dashboard
   - Click en tu servicio
   - Ve a la pestaña **"Variables"**
   - Añade estas variables:
     - `NODE_ENV` = `production`
     - `PORT` = `3000`
   
6. **Configurar volumen (CRÍTICO)**:
   - En el dashboard, ve a **"Settings"**
   - Scroll hasta **"Volumes"**
   - Click en **"+ New Volume"**
   - Mount Path: `/app`
   - Tamaño: 1GB
   - Click **"Add"**

7. **Obtén tu URL**:
   ```bash
   railway domain
   ```

## Verificar que funciona:
- Accede a tu URL
- Crea un estudiante
- **Reinicia el servicio** desde el dashboard
- Verifica que el estudiante sigue ahí

## Alternativa rápida (sin CLI):
1. Ve a https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Conecta tu repositorio
4. Railway detectará automáticamente Node.js
5. Sigue los pasos 6-7 de arriba para configurar el volumen
