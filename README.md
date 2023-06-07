# ue_veille
### Prerequisites :
- Go : 1.20

## Cloning
```console
you@ue_veille$ git clone https://github.com/SamDz16/ue_veille
``` 
## Cd to main directory
```console
you@ue_veille$ cd ue_veille/main
```

## Compiling
```console
you@ue_veille$ GOOS=js GOARCH=wasm go build -o ../assets/server.wasm
```
## Starting server
```console
you@ue_veille$ cd .. && go run ./server/server.go
```
## Go to : http://localhost:3000

Enjoy!
