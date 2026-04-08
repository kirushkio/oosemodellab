@echo off
set PATH=%LOCALAPPDATA%\Programs\Git\cmd;%PATH%
cd /d c:\Users\23cs131\kirushoose

git config user.email "student@example.com"
git config user.name "kirushkio"
git add -A
git commit -m "Initial commit - FoodBridge Food Waste Redistribution System"
git branch -M main
git remote add origin https://github.com/kirushkio/oosemodellab.git
git push -u origin main
