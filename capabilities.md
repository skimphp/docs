# Extension Capabilities

Canonical capability vocabulary:

```text
auth               user authentication (credentials)
oauth              third-party OAuth / social login
session-auth       session-based authentication
token-auth         API token authentication
csrf               CSRF protection
rate-limiting      request rate limiting
email-verification email verification flow
password-reset     password reset flow
2fa                two-factor authentication
queues             background job queues
broadcasting       real-time event broadcasting
file-storage       file upload and storage
search             full-text search
payments           payment processing
notifications      multi-channel notifications
```

Unknown capabilities are allowed so packages can experiment ahead of the framework vocabulary. `php skim ext:list` reports unknown capability names as warnings.
