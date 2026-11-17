FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY ["kids-app.csproj", "./"]

RUN dotnet restore "kids-app.csproj"

COPY . .

RUN dotnet publish "kids-app.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet kids-app.dll --urls http://0.0.0.0:${PORT:-10000}"]
