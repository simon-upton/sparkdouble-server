<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/simon-upton/sparkdouble-server">
    <img src="https://i.ibb.co/n0zXNVC/sparkdoublelong.png" alt="SparkDouble Long Logo">
  </a>

  <h3 align="center">SparkDouble Server</h3>

  <p align="center">
    The backend/bot for the <a href="https://github.com/simon-upton/sparkdouble-extension">SparkDouble Chrome extension</a>, relaying Magic: The Gathering cards using Express.js and LevelDB through the Discord.js API.
    <br />
    <!-- TODO: replace URLs with Chrome extension page and Discord bot invite link  -->
    <h3 style="text-align: center;"><a href="https://example.com">Invite Discord bot</a> - <a href="https://example.com">Install Chrome extension</a></h3>
    <a href="https://github.com/simon-upton/sparkdouble-server/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    ·
    <a href="https://github.com/simon-upton/sparkdouble-server/issues/new?labels=enhancement&template=feature_request.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<!-- <details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details> -->

<!-- ABOUT THE PROJECT -->

## About SparkDouble

<div align="center">
  <img src="https://i.ibb.co/vXSK3YH/Sequence01-3-downscaled66-optimized.gif" alt="Sequence01-3-downscaled66-optimized" border="0">
</div>

<!-- TODO: replace URLs with Chrome extension page and Discord bot invite link  -->

The SparkDouble [Chrome extension](https://example.com) and [Discord bot](https://example.com) lets users **instantly share cards from popular Magic: The Gathering websites** such as [EDHREC](https://edhrec.com/) and [Scryfall](https://scryfall.com/) to their Discord servers.

Intended to be easy to set up and forget about, users can send Magic cards to their friends by pressing a keyboard shortcut, without ever leaving their browser or struggling against the correct channel/command/card name combination to showcase that new card you're talking about (how many Jace variants could there possibly be?!) This means you could discuss new card pickups, recently released cards, or (my favorite) collaborate on decklists without the pain of (for example)

The Chrome extension utilizes this Discord.js bot and Express.js/LevelDB backend to quickly relay cards from users to their desired Discord servers.

### Built With

[![TypeScript][Typescript.js]][Typescript-url]
[![NodeJS][Node.js]][NodeJS-url]
[![Express][Express.js]][Express-url]
[![LevelDB][LevelDB.db]][LevelDB-url]
[![Discord][Discord.com]][Discord-url]
[![Docker][Docker.com]][Docker-url]
[![ESLint][ESLint.js]][ESLint-url]
[![Prettier][Prettier.js]][Prettier-url]

<!-- GETTING STARTED -->

## Getting Started

### If you just want to use SparkDouble, install the [Chrome extension](https://example.com) and the [Discord bot](https://example.com), and follow the few setup steps.

To get a local copy for development or self hosting, follow these steps.

### Prerequisites

- npm/Node.js, [Install here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  ```sh
  npm install npm@latest -g
  ```
- Docker, [Install here](https://docs.docker.com/engine/install/)

### Installation

#### Development

This project uses Typescript alongside a development Docker container which hot builds and reloads the code located in the `src` directory. Here's how you can get started:

1. Create an "Application" and get a Discord bot token [here](https://discord.com/developers/applications). This Discord "Application" should probably solely be created for development.
2. Clone the repo.
   ```sh
   git clone https://github.com/simon-upton/sparkdouble-server.git
   ```
3. Install necessary npm packages. (you may be able to skip this step depending on what tools you already have installed on your system/if you only intend to work within the Docker container)
   ```sh
   npm install
   ```
4. Put ONLY your API key in a `.txt` file named `BOT_TOKEN_DEV.txt`, located in the root directory of the project. This token will be pulled into the Docker container as a [secret](https://docs.docker.com/compose/use-secrets/) later.
   ```sh
   cd {REPO_PATH_HERE}
   echo "{DISCORD_DEV_TOKEN_HERE}" > BOT_TOKEN_DEV.txt
   ```
5. Using `docker compose up` will spin up a container from the development compose file (`compose.yaml`).
   ```sh
   docker compose up
   ```
6. Your container should now hot build and reload your changes in `src` on the host machine!

#### Self-hosting

In the spirit of open source, if you're interested in hosting your own version, you can do so by following these steps:

❖ Here's an example Docker compose file for running the service:

```Dockerfile
services:
  server:
    image: sparkdouble-server
    build:
      context: .
    environment:
      NODE_ENV: production
    secrets:
      - BOT_TOKEN
    volumes:
      - secretsdb:/usr/src/app/secretsdb/
    ports:
      - 25565:25565
    restart: unless-stopped
secrets:
  BOT_TOKEN:
    file: ./BOT_TOKEN.txt
volumes:
  secretsdb:
```

([File](https://github.com/simon-upton/sparkdouble-server/blob/cdc7f08f800df31c6d5f7558bc60ff5f1d8e3b9d/compose.prod.yaml))

❖ Here's how you can build the image yourself:

1. Create an "Application" and get a Discord bot token [here](https://discord.com/developers/applications).
2. Clone the repo.
   ```sh
   git clone https://github.com/simon-upton/sparkdouble-server.git
   ```
3. Install necessary npm packages. (you may be able to skip this step depending on what tools you already have installed on your system)
   ```sh
   npm install
   ```
4. Put ONLY your API key in a `.txt` file named `BOT_TOKEN.txt`, located in the root directory of the project. This token will be pulled into the Docker container as a [secret](https://docs.docker.com/compose/use-secrets/) later.
   ```sh
   cd {REPO_PATH_HERE}
   echo "{DISCORD_TOKEN_HERE}" > BOT_TOKEN.txt
   ```
5. Run the production Docker image. _If you'd like to force Docker to build from local instead of attempting to pull from the public Docker registry first, you can append the `--build` option to the command below._
   ```sh
   docker compose -f compose.prod.yaml up -d
   ```
6. Your production container should now be running and exposed on port `25565` (this can be configured in `compose.prod.yaml` and `index.ts`). Enjoy!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

To get started as a user, install the [Chrome extension](https://example.com) and the [Discord bot](https://example.com), and follow the few setup steps.

<!-- ROADMAP -->

## Roadmap

- [ ] Secure API endpoints to allow only Magic images
- [ ] Secure endpoints using OAuth info gathered from the extension
- [ ] Add unit tests
- [ ] Consider migrating from LevelDB -> SQLite or Postgres

See the [open issues](https://github.com/simon-upton/sparkdouble-server/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Any contributions/help offered are much appreciated. Thank you! :)

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](https://github.com/simon-upton/sparkdouble-server/blob/cdc7f08f800df31c6d5f7558bc60ff5f1d8e3b9d/LICENSE) for more information.

<!-- CONTACT -->

## Contact

Simon Upton - simon@uptonhome.com

Project Link: [https://github.com/simon-upton/sparkdouble-server](https://github.com/simon-upton/sparkdouble-server)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

<!-- ## Acknowledgments -->

[Typescript.js]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://github.com/microsoft/TypeScript
[Node.js]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[NodeJS-url]: https://nodejs.org/
[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://github.com/expressjs/express
[LevelDB.db]: https://img.shields.io/badge/LevelDB-006400?style=for-the-badge&logo=buffer
[LevelDB-url]: https://github.com/google/leveldb
[Discord.com]: https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white
[Discord-url]: https://discord.com/
[Docker.com]: https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[ESLint.js]: https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white
[ESLint-url]: https://github.com/eslint/eslint
[Prettier.js]: https://img.shields.io/badge/Prettier-D39E35?style=for-the-badge&logo=prettier&logoColor=white
[Prettier-url]: https://github.com/prettier/prettier
