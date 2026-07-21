
Starting ASTRO

cd /Users/danfoster01/Documents/Websites/terminusmaximus
npm run dev

http://localhost:4321



~/make_thumbnails.sh

~/make_web_images.sh


- GIT, SHORT VERSION

cd /Users/danfoster01/Documents/Websites/terminusmaximus

git switch main
git pull --ff-only

git add .
git commit -m "Lucius homepage"
git push origin main




-- GIT, LONG VERSION

cd /Users/danfoster01/Documents/Websites/terminusmaximus

git remote -v
git switch main
git pull --ff-only
git status --short

git add .
git diff --cached

git commit -m "Lucius homepage"
git push origin main




Replay Library

cd /Users/danfoster01/Documents/Websites/ReplayLibrary

python3 -m streamlit run app.py --server.port 8501

http://localhost:8501



Old GIT:
git add . && git commit -m "Replay Library JSON update" && git push
