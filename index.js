#! /usr/bin/env node

const { exec } = require('child_process');
const path = require('path')
const os = require('os');
const fs = require('fs');

const name = process.argv[2];
if(!name || name.match(/[<>:"\/\\|?*\x00-\x1F]/)) {
  return console.log(`
    Invalid directory name
    Useage: create-express-skeleton name-of-your-app
  `);
}

const url = 'https://github.com/glanderson42/express-rest-skeleton'

function runCommand(command) {
  var run = exec(command);

  return new Promise((resolve) => {
    run.stdout.on('data', (data) => {
      console.log(data.toString());
    });
  
    run.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  
    run.on('exit', (code) => {
      resolve();
    })
  })
}

console.log(`Cloning ${url}`);
runCommand(`git clone ${url} ${name}`)
  .then(() => {
    console.log(`Removing ${name}/.git`);
    if(os.platform() !== 'win32') {
      return runCommand(`rm -rf ${name}/.git`);
    }
    return runCommand(`rmdir /S /Q ${name}\\.git`);
  }).then(() => {
    console.log(`Install dependencies...`);
    return runCommand(`cd ${name} && npm install`);
  }).then(() => {
    return runCommand('echo "Done!"');
  }).then(() => {
    const packageJson = require(path.resolve(`./${name}/package.json`));
    packageJson.repository = {};
    packageJson.bugs = {};
    packageJson.homepage = "";
    packageJson.author = "";
    packageJson.name = `${name}`;
    packageJson.repository = {};
    fs.writeFileSync(path.resolve(`./${name}/package.json`), JSON.stringify(packageJson, null, 4));
  }).then(() => {
    console.log('           Installation done! ✔️     ');
    console.log('======================================');
    console.log('You can type the following npm scripts')
    console.log(`cd ${name} && npm run dev # to run application in dev`);
    console.log(`cd ${name} && npm start # to run in production`);
    console.log(`cd ${name} && npm test # to run tests`);
    console.log(`cd ${name} && npm lint # run eslint`);
    process.exit(0);
  });
