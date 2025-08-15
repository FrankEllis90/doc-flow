@echo off
echo Pushing to GitHub repository doc-flow...
cd /d "C:\Users\1Fran\OneDrive\Documents\GitHub\Scribe_AI\peppercorn-kb-builder"
git status
echo.
echo Remote repository:
git remote -v
echo.
echo Pushing to origin main...
git push -u origin main
pause