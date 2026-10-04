set shell := ["bash", "-uc"]

[no-cd]
dev:
    docker-compose -f docker-compose.dev.yml up --build

[no-cd]
tests:
    docker-compose -f docker-compose.test.yml up unit --build --abort-on-container-exit
