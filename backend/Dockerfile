# Use OpenJDK 21
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy toàn bộ code backend vào container
COPY . .

# Make mvnw executable
RUN chmod +x mvnw

# Build project using Maven Wrapper
RUN ./mvnw clean package -DskipTests

# Final image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy jar từ stage build
COPY --from=build /app/target/*.jar app.jar

# Expose port Spring Boot
EXPOSE 8080

# Run app
ENTRYPOINT ["java", "-jar", "app.jar"]

