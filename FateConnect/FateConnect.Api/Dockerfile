FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY FateConnect.Api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish FateConnect.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

RUN mkdir -p /app/wwwroot/uploads && chown -R $APP_UID:$APP_UID /app/wwwroot

USER $APP_UID

ENTRYPOINT ["dotnet", "FateConnect.Api.dll"]
