# page-change-notifier

> Get notified on Discord when a page changes

## Install

### Build the docker image

```bash
docker build -t page-change-notifier .
```

### Persist database in Docker

When using docker create an empty data.db file on the host machine before the first run:

```sh
# TODO: find better way to persist database
touch data.db
```

### Run the docker container

```bash
docker run -d --name page-change-notifier \
  -v $(pwd)/data.db:/usr/src/app/data.db \
  page-change-notifier
```

## Environment variables

See [.env.example](.env.example) for the required environment variables.
