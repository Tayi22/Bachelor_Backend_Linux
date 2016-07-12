cd batchFiles
start database.bat
timeout /t 5
start mongo.bat
start inspector.bat
cd ..
babel --presets es2015,stage-0 --watch ./src --out-dir ./out
pause