# Security Policy

## 1. Purpose

This document provides guidelines and procedures for maintaining the security and integrity of the repository.

## 2. Scope

This policy applies to all contributors, maintainers, and users of the repository.

## 3. Repository Security

### 3.1. Access Control

- Access to the repository is restricted to authorized personnel only. All contributors must have a valid and active GitHub account.
- External collaborators should be granted access on a need-to-know basis and should be reviewed periodically.

### 3.2. Encryption

- All sensitive data stored in this repo must be encrypted using `git-crypt`.
- Authorized users will be provided with decryption keys. These keys must not be shared, stored publicly, or embedded in code.

### 3.3. Code Review

- All pull requests (PRs) must undergo a code review by at least one other member before being merged.
- PRs with changes to cryptographic routines or handling of encrypted data must be reviewed by a security expert.

## 4. Reporting Security Issues

- If you discover a vulnerability or security issue, please create an issue on the GitHub repository. Label it as `security` for easy identification.
- Do not disclose details of the vulnerability in public forums, chats, or other public channels.

## 5. Patch Management

- All contributors are encouraged to regularly fetch updates from the main branch and ensure their local copy is updated to benefit from security patches.

## 6. Compliance

- Contributors found to be in violation of this policy may have their access revoked.
- Users and maintainers are encouraged to report any non-compliance to this policy.

## 7. Review and Updates

This policy will be reviewed annually or after any significant incident.

## 8. Contact

For any queries or concerns regarding this security policy, eat a biscuit. (tomerh2001@gmail.com)
