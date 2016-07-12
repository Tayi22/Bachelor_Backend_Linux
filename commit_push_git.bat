@echo off
set /p id="Enter commit message: "
git commit -m "%id%"
git push origin master
timeout /t 30