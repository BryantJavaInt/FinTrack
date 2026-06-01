@REM Maven wrapper for Windows
@echo off
setlocal EnableExtensions EnableDelayedExpansion

set MAVEN_WRAPPER_PROPERTIES=%~dp0.mvn\wrapper\maven-wrapper.properties

for /f "tokens=2 delims==" %%a in ('findstr /i "distributionUrl" "%MAVEN_WRAPPER_PROPERTIES%"') do (
    set DISTRIBUTION_URL=%%a
)

set DISTS_DIR=%USERPROFILE%\.m2\wrapper\dists

REM Find mvn.cmd in any apache-maven subfolder matching the major version
set MAVEN_BIN=
for /d %%d in ("%DISTS_DIR%\apache-maven-3.9*") do (
    if exist "%%d\bin\mvn.cmd" (
        if "!MAVEN_BIN!"=="" set MAVEN_BIN=%%d\bin\mvn.cmd
    )
)

if "!MAVEN_BIN!"=="" (
    echo Downloading Maven from !DISTRIBUTION_URL!...
    if not exist "!DISTS_DIR!" mkdir "!DISTS_DIR!"
    set TMP_ZIP=%TEMP%\maven-dist.zip
    powershell -Command "Invoke-WebRequest -Uri '!DISTRIBUTION_URL!' -OutFile '!TMP_ZIP!' -UseBasicParsing"
    powershell -Command "Expand-Archive -Path '!TMP_ZIP!' -DestinationPath '!DISTS_DIR!\' -Force"
    del "!TMP_ZIP!"
    for /d %%d in ("%DISTS_DIR%\apache-maven-3.9*") do (
        if exist "%%d\bin\mvn.cmd" (
            if "!MAVEN_BIN!"=="" set MAVEN_BIN=%%d\bin\mvn.cmd
        )
    )
)

if "!MAVEN_BIN!"=="" (
    echo ERROR: Maven binary not found after download. Check network and try again.
    exit /b 1
)

call "!MAVEN_BIN!" %*