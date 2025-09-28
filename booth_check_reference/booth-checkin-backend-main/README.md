# Booth Check-in Backend

The Booth Check-in Backend project is a server system that manages the check-in process at events.

## Requirements

- node >= 16.20.2

## Usage

1. Clone project
2. Create `.env` file, copy content from [.env.example](./.env.example) to `.env` file and config in `.env`:

- Config Runtime Environment

```bash
HOST=localhost
PORT=3456
```

- Config Project

```bash
APP_NAME=Booth Check-in
# server domain name
APP_URL_API=http://localhost:3456
# primary client domain name
APP_URL_CLIENT=http://localhost:3000
# other client domain name
# Eg: ["http://localhost:3001", "http://localhost:3002"]
OTHER_URLS_CLIENT=
# primary secret key
SECRET_KEY=
# expressed in seconds or a string describing a time span
# Eg: 60, 2 days, 10h, 7d
LOGIN_EXPIRE_IN=7d
# maximum number of requests per minute
REQUESTS_LIMIT_PER_MINUTE=100
```

- Config MongoDb Database

```bash
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_AUTH_SOURCE=admin
```

- Config Email

```bash
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false # true if MAIL_PORT = 465
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=no-reply@gmail.com
MAIL_FROM_NAME=Booth Check-in
```

- Config third party service

```bash
# API Face recognize
FACE_RECOGNIZE_API_URL=
FACE_RECOGNIZE_API_KEY=
FACE_RECOGNIZE_CONTENT_LIMIT=2mb
```

3. Install package & setup

```bash
npm install
```

4. Initialize data (Required for new database)

```bash
npm run seed
```

> Note: By default we will use [this account](#default-account) as the **Super Admin**.
> If you want to change it, please set two environment variables **SUPER_ADMIN_EMAIL** and **SUPER_ADMIN_PASSWORD**.
>
> - On Win32 systems (Windows)
>   ```bash
>   set SUPER_ADMIN_EMAIL=admin@zent.vn
>   set SUPER_ADMIN_PASSWORD=Z3ntSoft@D3v
>   npm run seed
>   ```
> - On Posix systems (Linux, macOS)
>   ```bash
>   export SUPER_ADMIN_EMAIL=admin@zent.vn
>   export SUPER_ADMIN_PASSWORD=Z3ntSoft@D3v
>   npm run seed
>   ```
> - Or add these two variables to the `.env` file

5. Runs the app

```bash
npm run start
```

6. Builds the app for production to the `build` folder

```bash
npm run build
```

7. Runs the app on `production` mode

```bash
node build/main.js
```

##### Default account

```yaml
Email: admin@zent.vn
Password: Z3ntSoft@D3v
```

## API Documentation

This project uses Swagger for API documentation. After starting the application, you can access the Swagger UI at:

```
http://localhost:3456/api-docs
```

For more details on using the Swagger documentation, see [docs/swagger.md](docs/swagger.md).

## Credits

[ZentSoft](https://zentsoft.com).
