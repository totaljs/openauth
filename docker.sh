echo "BUILDING"
docker-compose build

echo "TAGGING"
docker tag openauth_web totalplatform/openauth:latest

echo "PUSHING"
docker push totalplatform/openauth:latest

echo "DONE"