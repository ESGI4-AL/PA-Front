# Student Project Manager - Frontend

This repository contains the front-end code for a comprehensive Student Project Management System. The application provides interfaces for both teachers and students to manage educational projects, deliverables, reports, and evaluations.

## Project setup
```bash
$ npm install
```
## Compile and run the project
```bash
$ npm start
```
## Run tests
```bash
$ npm test
```
```bash
$ npm run test:watch
```
```bash
$ npm run test:coverage
```

## .env Configuration
To run the project locally, create a .env file at the root of the project:

/.env

With the following content:

VITE_API_URL=http://localhost:3000/api

Note: This file is ignored by Git (.gitignore) — it should never be committed to the repository.
In production, this variable is automatically provided by Railway.

## How to use shadcn/ui components

To add a component use the command below with the name of the component you want to add.

```bash
$ npx shadcn@latest add componentName
```

exemple :
```bash
$ npx shadcn@latest add breadcrumb
```

checkout the doc:
https://ui.shadcn.com/docs/installation

## Built with
[![React][React.js]][React-url] [![Tailwind CSS][Tailwind.css]][Tailwind-url]

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
aa