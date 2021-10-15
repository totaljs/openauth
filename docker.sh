echo "BUILDING"
docker-compose build

echo "TAGGING"
docker tag opensocial_web totalplatform/opensocial:latest

echo "PUSHING"
docker push totalplatform/opensocial:latest

echo "DONE"