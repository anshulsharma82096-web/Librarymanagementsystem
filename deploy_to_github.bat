@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   ALEXANDRIA AI - GITHUB DEPLOYMENT WIZARD
echo ======================================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Git is not detected in your system PATH.
    echo.
    echo Please install Git for Windows using one of the following methods:
    echo   1. Official Installer: https://git-scm.com/download/win
    echo   2. GitHub Desktop (Recommended GUI): https://desktop.github.com/
    echo   3. PowerShell (Run as Administrator): winget install Git.Git
    echo.
    echo After installing, restart this script to push your repository to GitHub.
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed!
echo.

if not exist .git (
    echo [*] Initializing local Git repository...
    git init
    git add .
    git commit -m "Initial commit: Alexandria AI Library Recommendation & Navigation Platform"
    git branch -M main
    echo [OK] Local repository created and files committed.
) else (
    echo [*] Existing Git repository detected. Staging changes...
    git add .
    git commit -m "Update: Alexandria AI platform assets and deployment configs"
)

echo.
echo ----------------------------------------------------------------------
echo Next Step: Link to your GitHub Repository
echo ----------------------------------------------------------------------
echo 1. Go to https://github.com/new and create a new repository
echo    (e.g., named 'alexandria-library-ai', Public or Private)
echo 2. Do NOT initialize with README or .gitignore (we already created them!)
echo 3. Copy the repository URL (e.g., https://github.com/username/alexandria-library-ai.git)
echo.

set /p REPO_URL="Enter your GitHub Repository URL (or press Enter to skip): "

if not "%REPO_URL%"=="" (
    git remote remove origin >nul 2>nul
    git remote add origin %REPO_URL%
    echo [*] Pushing to GitHub main branch...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo [SUCCESS] Your repository is now live on GitHub!
        echo Repository URL: %REPO_URL%
        echo.
        echo To enable FREE Live Web Hosting on GitHub Pages:
        echo   1. Go to your repo on GitHub: Settings ^> Pages
        echo   2. Under 'Build and deployment' ^> Source, select 'GitHub Actions'
        echo   3. Your app will automatically deploy to a public URL:
        echo      https://^<your-username^>.github.io/^<repo-name^>/
        echo.
        echo For Full-Stack Python Cloud Hosting:
        echo   Connect this repo to Render.com (uses included render.yaml)
    ) else (
        echo.
        echo [!] Push encountered an authentication or network error.
        echo Please ensure you are logged in to GitHub via 'gh auth login' or your personal access token.
    )
) else (
    echo.
    echo Local repository is ready. You can manually push anytime with:
    echo   git remote add origin ^<your-github-url^>
    echo   git push -u origin main
)

echo.
pause
