# Stage 1: Build stage with OpenJDK 26
FROM eclipse-temurin:26-jdk AS builder
WORKDIR /workspace

# Copy Gradle wrapper and build definitions
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew

# Pre-fetch dependencies (fail-fast on network or resolution errors)
RUN ./gradlew dependencies --no-daemon

# Copy application source code
COPY src src

# Build production executable JAR (tests run separately in pre-deploy checks)
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Minimal runtime container
FROM eclipse-temurin:26-jre
WORKDIR /app

# Run as non-root user for container security
RUN groupadd -r spring && useradd -r -g spring spring

# Copy compiled artifact
COPY --from=builder /workspace/build/libs/*.jar app.jar

USER spring:spring

EXPOSE 8080

# Spring Boot reads Render PORT directly via application.properties (server.port=${PORT:8080})
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
