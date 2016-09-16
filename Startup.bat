IF NOT EXIST /data (
	md data
	cd data
	md db
	cd ..
)
cd batchFiles
start database.bat
cd ..
babel --presets es2015,stage-0 --watch ./src --out-dir ./out
pause