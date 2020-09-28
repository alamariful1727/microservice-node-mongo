# Microservice : Node.js , MongoDB, Docker

### Prerequisites

You should install `Docker` first.

### Installing

- `git clone https://github.com/alamariful1727/microservice-node-mongo.git`
- `cd microservice-node-mongo`

### Start App

Use any one of this command.

- `docker-compose up`
- `docker-compose -f "docker-compose.yml" up -d --build`

### Docker commands

Show

- `docker ps -a = show all active containers`
- `docker ps = show active containers`
- `docker images = show all images`

Run in Background

- `docker container run -d -p 8080:80 --name latest-official-nginx nginx`

Run in Interactive mode

- `docker container run -it -p 8080:80 --name latest-official-nginx nginx`

Remove docker container rm CONTAINER NAME / CONTAINER ID

- `docker container rm latest-official-nginx`
- `docker container rm c3b7`

Remove forcefully

- `docker container rm c3b7 -f`

## Authors

- **Ariful Alam** - _Full Stack Developer_
