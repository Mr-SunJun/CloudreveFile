set CGO_ENABLED=0
set GOOS=windows
set GOARCH=amd64
go build -a -o cloudreve.exe -ldflags "-s -w"