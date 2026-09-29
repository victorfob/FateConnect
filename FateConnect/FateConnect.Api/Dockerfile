FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY FateConnect.Api.csproj ./
RUN dotnet restore

COPY . ./
# Segredo, e não `ARG`: o valor do `ARG` sai impresso no log do build e fica
# gravado no histórico da imagem.
RUN --mount=type=secret,id=sixlabors_license \
    license_file=/run/secrets/sixlabors_license; \
    if [ -s "$license_file" ]; then \
        license="-p:SixLaborsLicenseFile=$license_file"; \
    fi \
    && dotnet publish FateConnect.Api.csproj -c Release -o /app --no-restore $license

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

RUN mkdir -p /app/wwwroot/uploads && chown -R $APP_UID:$APP_UID /app/wwwroot

USER $APP_UID

ENTRYPOINT ["dotnet", "FateConnect.Api.dll"]
