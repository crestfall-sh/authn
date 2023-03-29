# for redis
sudo sysctl vm.overcommit_memory=1

# start the containers, optional --detach
sudo docker compose up --build --force-recreate

# delete the volumes
rm -rf ./volumes/
