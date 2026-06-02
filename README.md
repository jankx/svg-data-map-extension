# SVG Data Map Extension

## Development & Testing

This extension is built with React (Vite) and PHP (Jankx Framework). It is set up as a standalone project within the themes extension directory.

### Prerequisites

- Node.js 18+
- Composer
- PHP 7.4+

### Installation

1. `npm install`
2. `composer install`

### Building

To build the assets for production:
```bash
npm run build
```

### Running Tests

#### PHP Unit Tests
```bash
vendor/bin/phpunit
```

#### React Unit Tests (Vitest)
```bash
npm run test
```

### CI/CD
A GitHub Actions workflow is provided in `.github/workflows/ci.yml` that automatically runs both PHP and JS tests on push.
