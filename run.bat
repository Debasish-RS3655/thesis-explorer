@echo off
title Article Finder backend
echo Starting Thesis Explorer backend.
start "C:\Program Files\Google\Chrome\Application\chrome.exe" http://127.0.0.1:3000/file/frontend.html
node backend.js
exit
