# Multi-stage build
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build
RUN apk add --no-cache curl
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q
COPY src src
RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
RUN addgroup -S fintrack && adduser -S fintrack -G fintrack
COPY --from=builder /build/target/*.jar app.jar
USER fintrack
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
