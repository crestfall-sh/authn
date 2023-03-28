# authn

#### Completed

- PostgreSQL dependency
- PostgREST dependency
- Redis dependency
- Loading of .env files into process.env
- Redis client connection test
- PostgREST JWT test

#### Planned

- Sign-up with Email
- Sign-in with Email
- Verify with Email
- Recover with Email
- Sign-up with Phone
- Sign-in with Phone
- Verify with Phone
- Recover with Phone

#### Notes

- This API returns the verification code and recovery code as-is.
- This API does not send emails or sms.
- A separate API can be configured for supporting notification providers for email and sms (e.g. Amazon SES, SNS, Mailgun, Sendgrid, etc.)
- This API must also have the JWT's issuer, audience.

#### License

MIT