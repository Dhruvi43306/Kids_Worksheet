
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project file
COPY ["kids-app.csproj", "./"]

# Restore NuGet packages
RUN dotnet restore "kids-app.csproj"

# Copy remaining backend source code
COPY . .

# Build and publish
RUN dotnet publish "kids-app.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Expose Render web service port
EXPOSE 10000

# Copy published application
COPY --from=build /app/publish .

# Start ASP.NET Core application
CMD ["sh", "-c", "dotnet kids-app.dll --urls http://0.0.0.0:${PORT:-10000}"]
