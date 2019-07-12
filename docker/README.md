This docker container uses Docker Compose. Here are quick commands to insall Docker and
Docker Compose on an Ubuntu 18.04 system:

#### Install Docker
```
sudo apt-get install -y software-properties-common
curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh
sudo usermod -aG docker ${USER}
```

#### Install Docker Compose
```
sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

You need to customize the [startup.sh](startup.sh) bash shell script with the IP
address for your full node and Insight API.

You can build this container with this command:
`docker-compose build`

You can then launch this container with:
`docker-compose up -d`
