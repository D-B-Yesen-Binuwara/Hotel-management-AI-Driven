# Deploying a MERN stack app on Netlify and Render

**Due date: 8th August 2025**

Before using the guide make sure you complete the project until the level we have done till 13th September (Session 16) and have all the environment variables required to run our app with you.

**Front-end**

```jsx
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BACKEND_URL=

// We will add these after the initial deployment when we do the stripe integration. 
VITE_STRIPE_PUBLISHABLE_KEY=

```

**Back-end**

```jsx
MONGODB_URL=

CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

OPENAI_API_KEY=

// We will add these after the initial deployment when we do the stripe integration.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Deploying the Front-end

### Step 1: Preparing the front-end for deployment

1. We are going to connect to the hosted back-end, therefore we need to modify the API  baseUrl to match the that of the back-end API url. (We will be setting this url for backend in the deployment steps). Therefore update it as follows.

```jsx
VITE_BACKEND_URL=https://aidf-5-back-end-manupa.onrender.com
```

Note that the your name has been included as part of the url to identify it as yours. Use your own name.

1. We will be deploying the front-end on Netlify as a Single Page Application. But when we visit different routes in the app Netlify will try to find separate HTML files for each route. Therefore we need to tell Netlify to redirect all the requests to the `index.html` file. In order to do that we should add a file named _redirects into the Vite public folder. You can refer to the Session 18 codebase to see how we have done that.

```bash
/*  /index.html 200 
```

![image.png](image.png)

1. Make sure the build command has been included correctly in the  `package.json` file as follows.

```jsx
"scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
```

1. Also make sure you create 2 separate repositories for your front-end and the back-end and in each repository is pushed to Github and the final  code is available on the main branch of the repository.

## Step 2: Deploying the FE to Netlify

1. Go to [Netlify's website](https://www.netlify.com/) and **sign up** or **log in** using GitHub.

![image.png](image%201.png)

1. Once logged in, navigate to **"Sites"** and click **"Add new site"** → **"Import an existing project.**

![image.png](image%202.png)

1. Then select Github, you will be asked to authorize Netlify via Github. 

![image.png](image%203.png)

1. Once that’s done, Netlify will show your repositories like a list, select the Repository with the front-end code.

![image.png](image%204.png)

1. Then on the next step setup the build settings as follows.

![image.png](image%205.png)

1. Provide the site name as follows.

Make sure you replace the last part with your own name. Here I have added my own name at the end.

**aidf-5-front-end-manupa**

1. Then comes the time to setup the front-end environment variables.

![image.png](image%206.png)

Click on `Add environment variables` button and put the env variables in our local .env file into it.

1. Click on Deploy. and then you will get the following view  

![image.png](image%207.png)

Now you will be able to see your front-end live on the url shown in green. But data won’t be there as we didn’t deploy the back-end yet.

Check if the FE URL is correctly generated in the format [https://fed-2-front-end-manupa.netlify.app](https://fed-2-front-end-manupa.netlify.app/)

## Deploying the Back-end

### Step 1: Preparing the back-end for deployment

1. Make sure the `package.json` file contain the correct CLI commads to build and start the back-end.

Here the commands have been setup for `npm run build` and `npm run start` commands needed to deploy the back-end.

```jsx
"scripts": {
    "dev": "nodemon src/index.ts",
    "seed": "ts-node src/seed.ts",
    "build": "npm install && tsc",
    "start": "node ./dist/index.js"
  },
```

1. The tsconfig should be as follows

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "lib": ["esnext"],
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "ts-node": {
    "files": true
  }
}

```

1. When we deploy the back-end on Render they will inject a port internally to the environment variables to listen. So adjust the `index.ts` file as follows.

![image.png](image%208.png)

1. Since we are using Clerk as out Auth provider and Typescript in our back-end, we need to add Clerk related type information to the back-end. We do that by creating a `globals.d.ts` file inside the src folder as follows.

![image.png](image%209.png)

```jsx
/// <reference types="@clerk/express/env" />

export {};

// Create a type for the roles
export type Role = "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  } 
}
```

Refer to the main branch codebase to and see how to set this up.

1. Since requests to this back-end will be coming from our new front-end URL we need to allow that URL in the CORS middleware.  So set the relevant ENV variable as follows

```jsx
FRONTEND_URL=https://aidf-5-front-end-manupa.netlify.app
```

### Step 2: Deploying the Back-end on Render

1. Go to [Render](https://render.com/) and **sign up** or **log in** using GitHub.

![image.png](image%2010.png)

1. Click **"+ Add New"** and select **"Web Service"**.

![image.png](image%2011.png)

1. Then select the Github repository where you have included your back-end. and Click `Connect`

![image.png](image%2012.png)

1. Then on the deploy settings page provide the name for the back-end that we discussed earlier.

**fed-2-back-end-manupa**

1. Then configure the delpoy settings as follows 

![image.png](image%2013.png)

- Important: Make sure the region you have selected is `Singapore(Southeast, Asia) because this is the closest region to Sri Lanka. Otherwise our requests would take a significant amount of time resolve.

1. Select the instance type as `Free` this is the details of the machine where your node app would be running.

![image.png](image%2014.png)

1. Then add the back-end environment variables as we have them on our local env,

![image.png](image%2015.png)

1. Then click on deploy to deploy the back-end.

1. Then you will be redirected to the Render Dashboard for your project.

![image.png](image%2016.png)

1. Now the back-end should also be deployed at the URL we specified.

Finally, you will be able to observe both the URLs are available on the web and you can refer to mine as follows.

[https://aidf-5-front-end-manupa.netlify.app/](https://aidf-5-front-end-manupa.netlify.app/)

[https://aidf-5-back-end-manupa.onrender.com](https://aidf-5-back-end-manupa.onrender.com/)

### Note:

- While in the process of setting up the front-end and the back-end deployment there’s another thing that Render and Netlify has done for us. That’s CI/CD(Continuous Integration and Continuous Deployment).
- You will notice that every time we push a commit to the back-end or the front-end Render and Netlify will redeploy our project with the latest updates. This is CI/CD.

 

![image.png](image%2017.png)

![image.png](image%2018.png)