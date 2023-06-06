package main

import (
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"syscall/js"
)

func getData() js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) interface{} {
		method := args[0].String()
		request := args[1].String()
		photo_id := args[2].String()
		search := args[3].String()

		// Handler for the Promise
		// We need to return a Promise because HTTP requests are blocking in Go
		handler := js.FuncOf(func(this js.Value, args []js.Value) interface{} {
			resolve := args[0]

			// Run this code asynchronously
			go func() {

				requestUrl := "https://api.unsplash.com/"

				if request == "search" {
					requestUrl += "search/"
				}

				if method == "get" {
					requestUrl += "photos/"
				}

				if request == "random" {
					requestUrl += "random/"
				} else if request == "photo_by_id" {
					requestUrl += photo_id
				}

				params := url.Values{}
				params.Set("client_id", "5htNoqiPyfIQv5DYPZKYisjzLvFVbv3xRea8kytZwJU")
				if request == "search" {
					params.Set("query", search)
				}

				u, _ := url.ParseRequestURI(requestUrl)
				u.RawQuery = params.Encode()
				urlStr := u.String()

				client := &http.Client{}
				r, _ := http.NewRequest(method, urlStr, nil) // URL-encoded payload
				// r.Header.Add("Content-Type", "application/x-www-form-urlencoded")
				// r.Header.Add("Accept", "application/sparql-results+json")
				r.Header.Add("Accept-Version", "v1")

				res, err := client.Do(r)
				if err != nil {
					log.Fatalln(err)
				}
				defer res.Body.Close()

				// Read the response body
				dataBody, err := ioutil.ReadAll(res.Body)
				if err != nil {
					log.Fatalln(err)
				}

				// dataBody := apiHttp.requestAPI(method, request, photo_id, requestUrl)

				// "dataBody" is a byte slice, so we need to convert it to a JS Uint8Array object
				arrayConstructor := js.Global().Get("Uint8Array")
				dataJS := arrayConstructor.New(len(dataBody))
				js.CopyBytesToJS(dataJS, dataBody)

				// Create a Response object and pass the data
				responseConstructor := js.Global().Get("Response")
				response := responseConstructor.New(dataJS)

				// Resolve the Promise
				resolve.Invoke(response)
			}()

			// The handler of a Promise doesn't return any value
			return nil
		})

		// Create and return the Promise object
		promiseConstructor := js.Global().Get("Promise")
		return promiseConstructor.New(handler)
	})
}

func main() {
	c := make(chan int)

	js.Global().Set("getData", getData())

	<-c
}
