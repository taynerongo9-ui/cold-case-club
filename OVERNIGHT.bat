@echo off
title OVERNIGHT WOLF MODE - cold-case-club
cd /d "%~dp0"
echo Starting overnight Wolf mode for cold-case-club...
echo CK is asleep. The Wolf takes over.
echo.
claude --dangerously-skip-permissions --append-system-prompt-file OVERNIGHT_PROMPT.txt
pause
