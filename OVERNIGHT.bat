@echo off
title OVERNIGHT WOLF MODE - cold-case-club
cd /d "%~dp0"
echo ============================================
echo   OVERNIGHT WOLF MODE - cold-case-club
echo   CK is asleep. Opus quality. Token-stingy.
echo ============================================
echo.
echo Type "go" and press Enter.
echo.
claude --dangerously-skip-permissions --append-system-prompt-file OVERNIGHT_PROMPT.txt
pause
