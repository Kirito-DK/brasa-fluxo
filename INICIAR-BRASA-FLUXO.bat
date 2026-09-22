@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale Node.js 20 ou superior.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)
echo.
echo Brasa Fluxo iniciado. Abra o endereco exibido abaixo.
echo.
call npm run dev
pause
