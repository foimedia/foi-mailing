# FOI Mailing

Small docker-ready express server to handle Mailgun mailing subscriptions.

---

## Configuration

### Environment variables

 - `APP_BASE` - App base path
 - `MAILGUN_DOMAIN` - Your Mailgun domain
 - `MAILGUN_API_KEY` - Your Mailgun api key
 - `MAILGUN_PUBLIC_API_KEY` - Your Mailgun public api key
 - `MAILGUN_MAILING_LIST` - Your Mailgun mailing list
 - `WHITELIST_DOMAINS` - Comma-separated list of CORS allowed domains

## Usage

### API Endpoints

#### POST /subscribe

Subscribes user to mailing list.

**Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "custom_variable": "goes to mailgun variables"
}
```

#### POST /validate

Mailgun email validation.

**Body**

```json
{
  "email": "john@example.com"
}
```
