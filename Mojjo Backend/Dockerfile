# =====================================================================
# Stage 1: Base Runtime Environment (Hardened & Lightweight)
# =====================================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

ENV ASPNETCORE_URLS=http://+:5000 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_EnableDiagnostics=0

# Install curl for container orchestration health checks
USER root
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Pre-create runtime directories and grant ownership to non-root 'app' user
RUN mkdir -p /app/logs /app/wwwroot/uploads && \
    chown -R app:app /app

# =====================================================================
# Stage 2: SDK Build & Dependency Layer Caching
# =====================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files first for optimal Docker layer caching
COPY ["src/Mojjo.Domain/Mojjo.Domain.csproj", "src/Mojjo.Domain/"]
COPY ["src/Mojjo.Application/Mojjo.Application.csproj", "src/Mojjo.Application/"]
COPY ["src/Mojjo.Infrastructure/Mojjo.Infrastructure.csproj", "src/Mojjo.Infrastructure/"]
COPY ["src/Mojjo.Api/Mojjo.Api.csproj", "src/Mojjo.Api/"]

# Restore packages in an isolated layer
RUN dotnet restore "src/Mojjo.Api/Mojjo.Api.csproj"

# Copy all source files
COPY . .

# Compile solution
WORKDIR "/src/src/Mojjo.Api"
RUN dotnet build "Mojjo.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

# =====================================================================
# Stage 3: Optimization & Release Publishing
# =====================================================================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Mojjo.Api.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    /p:UseAppHost=false

# =====================================================================
# Stage 4: Production Final Runtime Image
# =====================================================================
FROM base AS final
WORKDIR /app
COPY --from=publish --chown=app:app /app/publish .

# Run under secure unprivileged non-root user
USER app

# Container Health Probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health/live || exit 1

ENTRYPOINT ["dotnet", "Mojjo.Api.dll"]
