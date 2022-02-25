## 1 Development Setup
- you need to install the platform to be able to update and test code.

### Windows
- Install nodejs 12.20.0 [Windows 64](https://nodejs.org/download/release/v12.20.0/node-v12.20.0-win-x64.zip), [Windows 32](https://nodejs.org/download/release/v12.20.0/node-v12.20.0-win-x86.zip), [Mac](https://nodejs.org/download/release/v12.20.0/node-v12.20.0.pkg), [Linux](node-v12.20.0-linux-x64.tar.gz), [Using Package Manager](https://nodejs.org/en/download/package-manager/#nvm)

- Install
```bash
npm install -g webpack-cli
npm install
```

- Run
```bash
npm start
```

- To change port number

edit package.json at
```json
...
   "scripts": {
      "start": "webpack-dev-server --port 9001 --history-api-fallback --mode=development",
...
```

- Reinstall
```bash
rm -rf .\node_modules\
npm install
```


### Mac OS

- Clone the repository
  ```
  cd ~ #replace with preferred directory
  git clone gitlab@git.cs.rit.edu:lz3519/awesome-data-mining.git
  cd awesome-data-mining
  ```

- Install Homebrew
  ```
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- Install Homebrew for x86 on M1
  ```
  arch -x86_64 zsh
  cd /usr/local && mkdir homebrew
  sudo curl -L https://github.com/Homebrew/brew/tarball/master | sudo tar xz --strip 1 -C homebrew
  sudo chown -R <your user> homebrew # replace <your user>
  ```

- Install Nodejs 14 (LTS)
  ```
  brew install node@14
  ```

- Install Mongodb 5 # on x86_64
  ```
  brew tap mongodb/brew
  brew install mongodb-community@5.0
  brew services start mongodb/brew/mongodb-community
  ```

- Install Mongodb 5 # on M1
  ```
  arch -x86_64 /usr/local/homebrew/bin/brew tap mongodb/brew
  arch -x86_64 /usr/local/homebrew/bin/brew install mongodb-community@5.0
  alias brew86='/usr/local/homebrew/bin/brew'
  brew86 services start mongodb/brew/mongodb-community
  ```
  
- Create a virtualenv environment and install required python packages
  ```
  python3 -m venv venv/
  source env/bin/activate
  pip install --upgrade pip
  pip install -r requirements.mac.txt
  ```

- Store credentials for flask
  ```
  cp backend/.env.template backend/.env
  # fill up this file with your credentialss
  ```

- Launch Flask
  ```
  export ENV_FILE_LOCATION=./.env
  export FLASK_APP=backend/app.py
  npm install pm2
  pm2 start "flask run --host=0.0.0.0 --port=9000"
  ```

- Compile and start React App
  ```
  npm install
  npm run build
  pm2 serve build 8000 --spa
  # npm start # non-pm2 alternative
  ```

### IDE: VSCode
To to start backend development environment (flask):
- create and enter an python venv https://flask.palletsprojects.com/en/1.1.x/installation/#installation
- Install
```bash
pip install -r requirements.txt
```
- if using VSCode, use this launch configuration
```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Flask",
            "type": "python",
            "request": "launch",
            "module": "flask",
            "env": {
                "FLASK_APP": "backend/app.py",
                "FLASK_ENV": "development",
                "FLASK_DEBUG": "1"
            },
            "args": [
                "run",
                "--no-debugger",
                "--port=9000"
            ],
            "jinja": true
        }
    ]
}
```
- on windows, open a terminal and run
```powershell
$env:FLASK_APP="backend\app.py";flask run
```



## 2 Deployment
This is for Re-deploying a previously deployed system. We assume the system is already setup with pm2.

- Enter the directory storing the application
```bash
/home/lz3519/data_mining_main/awesome-data-mining
```
- Get up-to-date code from the repository. You need to have git already setup for your account, including setting up your keypair to log into RIT's repository.
```bash
git pull
```
- Install python packages if needed.
```
source backend/venv/bin/activate
pip install ...
```
- Build the frontend to generate a static code
```
npm run-script build
```
- Restart your frontend and backend daemons
```
pm2 restart all
```
- Check status of running daemons
```
pm2 ls
```

- Check the logs. You can diagnose errors reading the logs. 
```
pm2 logs
```





## 3 Troubleshooting / Advanced

### Overall Debugging
- Use logs. Logs are your main source of debugging.
```
pm2 logs
```

### Python Missing packages
- Read the logs and identify missing packages. Install python packages as needed:
```
source backend/venv/bin/activate
pip install <package-name>
```

###Node Missing packages
- Read the logs and identify missing packages. Install Node packages as needed:
```
npm install <package-name>
```
### Common permission issues 
- fix the permissions.
```
sudo chown -R xz1753.pm2  ~/.nvm/
sudo chgrp -R pm2 /var/pm2daemon/.pm2/
sudo chgrp -R admins /home/lz3519/data_mining_main/awesome-data-mining/.git
```

### New admin users
- Remember the users are responsable for what they do! Administering the code base requires effective root access via sudo, so always think twice before trying any major changes.

1. Check if the user doesn't already exist, add the user, add it to the admin groups
```
getent passwd  
sudo adduser cz3348 
sudo getent group
sudo addgroup cz3348 pm2
sudo addgroup cz3348 admins
sudo addgroup cz3348 sudo
```

2. Copy a valid nvm configuration to the new user (just pick any previously configured user). Dont forget to fix the permissions. In this example we are creating the user cz3348 and copying from ecl7037.
```
cd /home/cz3348/
sudo cp -r ~/.nvm/ .
cd /home/cz3348/
sudo chown -R cz3348.pm2 .nvm/
```

3. Copy a valid bashrc and profile from another user.
```
  914  sudo cp .bashrc /home/cz3348/
  915  sudo cp .profile /home/cz3348/
```
  4. Make sure the pm2daemon is fixed as well. Every now and then it loses the group permissions.
```
cd /var/pm2daemon/
sudo chgrp -R pm2 pm2daemon 
```

5. Copy your key pair over the network to the server and fix permissions, I suggest using PSCP on Windows or SCP on Linux/Mac. Make sure to save it under ~/.ssh/. Also, this key files need to be configured in the repository on git.cs.rit.edu.
```
<copy the files from your local machine to the server, lets say they are called id_rsa and id_rsa.pub, using pscp/scp>
sudo chown -R cz3348.cz3348 .ssh
sudo su -
cd /home/cz3348/.ssh
chmod 600 id_rsa
chmod 644 id_rsa.pub 
```

### MongoDB installation as a service
```
sudo systemctl status mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```
or:
```
sudo update-rc.d mongod enable
sudo update-rc.d mongod defaults
```

### PM2 installation as a service
- Check if it is already installed as a service
```
systemctl status pm2-ecl7037.service
```

- Create and save pm2 instance
```
cd /home/lz3519/data_mining_main/awesome-data-mining/
pm2 serve build 8000 --spa
source backend/venv/bin/activate
pm2 start "export ENV_FILE_LOCATION=./.env;export FLASK_APP=backend/app.py;flask run --host=0.0.0.0"
pm2 save
```

- Create a system.d service
You might need to replace the user home directory that is creating the service. Below examples used 'ecl7037' as the home user, but any user can be used. Also notice that the name of the service will be automatically generated based on the user that is invoking this command, so you might need to adjust the second line with the correct service name.
```
sudo env PATH=$PATH:/home/ecl7037/.nvm/versions/node/v15.10.0/bin PM2_HOME=/var/pm2daemon /home/ecl7037/.nvm/versions/node/v15.10.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ecl7037 --hp /var/pm2daemon
systemctl status pm2-ecl7037.service
```






### Database and Gmail credentials
- ```.\backend\.env``` is ignored in git so you need to have a '.env' file with the valid credentials

### PM2 usage if the system-wide PM2 is not to be used.
We recommend you use PM2 system-wide because it will reload all needed services after a server reboot. But in case you want to not use it. Here are some tips on how to use PM2 (not recommended).
- Download or update the project using git
- Frontend
    - ```npm run build```
    - If application does not exist in pm2 ```pm2 serve build 8000 --spa```
    - If application exists in pm2 ```pm2 restart <id>```
    - Show applications status ```pm2 ls```
- Backend
    - ```export ENV_FILE_LOCATION=./.env```
    - ```export FLASK_APP=backend/app.py```
    - If application does not exist in pm2 ```pm2 start "flask run --host=0.0.0.0"```
    - If application exists in pm2 ```pm2 restart "flask run --host=0.0.0.```

### How to save list of used python packages
```
pip freeze|less
```

### How to save list of used npm packages
It should be already saved for you at "package.json". But you can also use:
```
npm list
```

### How to save list of used ubuntu packages
```
dpkg -l
```

### Manually controlling services (not recommended)
```
#PM2_HOME=/var/pm2daemon/.pm2  
#set|grep PM2
pm2 serve build 8000 --spa
source backend/venv/bin/activate
pm2 start "export ENV_FILE_LOCATION=./.env;export FLASK_APP=backend/app.py;flask run --host=0.0.0.0"
sudo service mongod start
#service mongod status
sudo chmod -R 777 /var/pm2daemon/
```

### MongoDB DATABASE backup
```
mongodump --host localhost --port 27017 --db data_science_learning_platform_database
mv dump dump-<date>
```

### MongoDB DATABASE restore. STOP IF YOU ARE NOT SURE. THIS MIGHT POTENTIALLY BREAK THE APPLICATION.
(In this case, **** represents UserDefinedName for the database > mydb dump/db_name > this will import dump db into mydb)
```
mongorestore --host localhost --port 27017 --db **** dump/db_name
```


### MongoDB Backup and restore for all databases. STOP IF YOU ARE NOT SURE. THIS MIGHT POTENTIALLY BREAK THE APPLICATION.

- Backup all databases:
```
mongodump --host localhost --port 27017
```

- Restore all databases:
```
mongorestore --host localhost --port 27017  dump
```

### system-wide dataset creation
1. add the dataset (using the web interface)
2. run mongo client and figure out the file id
```
mongo
use data_science_learning_platform_database
```
3. show current datasets and identify the entry "_id" of the dataset you want to add.
```
db.files.find({},{_id:1, "user_id":1, "file_name":1, "desc":1})
```
example output:
```
{ "_id" : ObjectId("6060b80b0de5e66e49f2ddec"), "user_id" : "6058cd964d75b21584ceb034", "file_name" : "Rochester_Racial_Background_1850-2019.csv", "desc" : "Default desc" }
{ "_id" : ObjectId("606245780de5e66e49f2dded"), "user_id" : "604fe0e24d75b21584ceb027", "file_name" : "Mall_Customers.csv", "desc" : "Default desc" }
{ "_id" : ObjectId("60637a9b0de5e66e49f2ddee"), "user_id" : "6053ccb44d75b21584ceb02b", "file_name" : "acs2017_county_data.csv", "desc" : "Default desc" }
{ "_id" : ObjectId("606b548d0de5e66e49f2ddef"), "user_id" : "604fe0e24d75b21584ceb027", "file_name" : "RRB_converted.csv", "desc" : "Default desc" }
{ "_id" : ObjectId("606b58870de5e66e49f2ddf0"), "user_id" : "6058cd964d75b21584ceb034", "file_name" : "RRB_converted.csv", "desc" : "Default desc" }
{ "_id" : ObjectId("606b58ff0de5e66e49f2ddf1"), "user_id" : "6058cd964d75b21584ceb034", "file_name" : "Rochester_Racial_Background_1850-2019_check.csv", "desc" : "Default desc" }
```

4. Change the user of the dataset entry in mongo db. Replace <entry id> with the id you found in the previous step.
```
db.files.update({"_id":ObjectId("<entry id>")},{$set:{user_id:ObjectId("617765736f6d6561646d696e")}})
```
for example, this would be the update for the object 611da2733da068c3cfe68c86:
```
db.files.update({"_id":ObjectId("611da2733da068c3cfe68c86")},{$set:{user_id:ObjectId("617765736f6d6561646d696e")}})
```

5. For the for each dataset, make sure you have a single dataset entry in the database. If you have more than one, remove redundant ones, because this can cause issues in the backend. 

6. edit ./src/component/home/index.jsx
around line 34, look for const "filenames"
this is an example entry for a dataset:
```
const filenames = [
  {
    id: 0,
    filename: "Mall_Customers_clustering.csv",
    type: "Clustering",
    description: "Clustering dataset",
    method: "Unsupervised"
  },
<other entries>
]
```
