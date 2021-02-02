### How to start frontend development environment
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

- To change portal number

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

### How to start backend development environment (flask)
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
- if using any terminal, run

windows
```powershell
$env:FLASK_APP="backend\app.py";flask run
```

others checkout
https://flask.palletsprojects.com/en/1.1.x/quickstart/