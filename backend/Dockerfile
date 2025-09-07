# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy toàn bộ code backend vào container
COPY . .

# Make mvnw executable
RUN chmod +x mvnw

# Build project using Maven Wrapper
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Cài timezone
RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && echo "Asia/Ho_Chi_Minh" > /etc/timezone \
    && apk del tzdata

ENV TZ=Asia/Ho_Chi_Minh

# Copy jar từ stage build
COPY --from=build /app/target/*.jar app.jar

# Tạo thư mục uploads trong container
RUN mkdir -p /app/uploads

# Expose port Spring Boot
EXPOSE 8080

# Mount volume để lưu uploads
VOLUME /app/uploads

# Run app với timezone VN
ENTRYPOINT ["java", "-Duser.timezone=Asia/Ho_Chi_Minh", "-jar", "app.jar"]
