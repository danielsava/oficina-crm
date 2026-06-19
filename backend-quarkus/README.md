# code-with-quarkus

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Banco Docker 

```shell script
    docker run -d --name postgres -p 5432:5432 -e POSTGRES_DB=postgres -e POSTGRES_PASSWORD=123456 postgres 
```

## Banco: Docker Compose

Resumo dos principais comandos do Docker Compose:

 - **docker compose build**: constrói as imagens dos serviços definidos no arquivo docker-compose.yml
 - **docker compose up**: sobe os containers, cria a rede e os volumes nomeados, como postgres_data
 - **docker compose stop**: só para os containers
 - **docker compose down**: para e remove os containers
 - **docker compose down -v**: para, remove os containers e também remove os volumes nomeados, como postgres_data

Especificando o nome do arquivo docker-compose.yml:

 - docker compose -f compose-postgres.yml build

 - docker compose -f compose-postgres.yml up -d
 - docker compose -f compose-postgres.yml stop
 - docker compose -f compose-postgres.yml start

 - docker compose -f compose-postgres.yml ps
 - docker compose -f compose-postgres.yml logs

 - docker compose -f compose-postgres.yml down
 - docker compose -f compose-postgres.yml down -v


## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.


## Packaging and running the application

The application can be packaged using:

```shell script

# Package default. Gera o artefato (JAR ou native, se configurado)
./mvnw package

# Skip Tests (compila os arquivos de testes, mas não executa)
./mvnw package -DskipTests 

# Não compila, e não executa
./mvnw package -Dmaven.test.skip=true

# Usando o CLI do Quarkus
quarkus build -DskipTests

# Maven
mvn clean install -DskipTests

mvn clean install -Dmaven.test.skip=true
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/code-with-quarkus-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation utilizing build time processing and Vert.x. This extension is not compatible with the quarkus-resteasy extension, or any of the extensions that depend on it.
- Hibernate ORM ([guide](https://quarkus.io/guides/hibernate-orm)): Define your persistent model with Hibernate ORM and Jakarta Persistence
- Blaze-Persistence ([guide](https://quarkus.io/guides/blaze-persistence)): Advanced SQL support for JPA and Entity-Views as efficient DTOs

## Provided Code

### Hibernate ORM

Create your first JPA entity

[Related guide section...](https://quarkus.io/guides/hibernate-orm)


### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)
