const go = new Go();
// https://www.lias-lab.fr/ftppublic/recherche/fetch.wasm
WebAssembly.instantiateStreaming(
	fetch("server.wasm"),
	go.importObject
).then((result) => {
	go.run(result.instance);
})

document.querySelector("#method").addEventListener("change", (e) => {
	switch(e.target.value) {
		case "get": 
			const opt1 = createOption("Get photos", "photos")
			const opt2 = createOption("Get random photo", "random")
			const opt3 = createOption("Get photo by id", "photo_by_id")
			const opt4 = createOption("Search Photos", "search")

			document.querySelector("#request").append(opt1, opt2, opt3, opt4)
			break
		default :
			console.log(e.target.value)
	}
})

document.querySelector("#request").addEventListener("change", (e) => {
	if(e.target.value === "photo_by_id") {
		document.querySelector("#div-photo-id").classList.toggle("hide-me")
		document.querySelector("#div-search").classList.add("hide-me")
	} else if(e.target.value === "search") {
		document.querySelector("#div-search").classList.toggle("hide-me")
		document.querySelector("#div-photo-id").classList.add("hide-me")
	} else {
		document.querySelector("#div-photo-id").classList.add("hide-me")
		document.querySelector("#div-search").classList.add("hide-me")
	}
})


document.querySelector("form").addEventListener("submit", async (e) => {
	e.preventDefault()

	// get method
	const method = document.querySelector("#method").value

	// get request
	const request = document.querySelector("#request").value

	// get photo id ?
	let photo_id = ""
	if (request === "photo_by_id") {
		photo_id = document.querySelector("#photo_id").value.trim()
	}

	// get search term ?
	let search = ""
	if (request === "search") {
		search = document.querySelector("#search").value.trim()
	}

	try {
		// call go method
		const resp = await getData(method, request, photo_id, search)
		let data = await resp.json()

		console.log(data)

		if(data.hasOwnProperty("total")) data = data.results

		if(data.hasOwnProperty("errors")) throw data.errors[0]

		if (!Array.isArray(data)) data = [...new Array(data)]
		
		if (data.length > 0) {
			responses.innerHTML = ""
			document.querySelector("#errors").innerHTML = ""
			displayData(data, null)
		}
	} catch (error) {
		responses.innerHTML = ""
		document.querySelector("#errors").innerHTML = 
		`<div class="alert alert-danger" role="alert">
  			${error}
		</div>`
	}
})


// Utils function

const displayData = (data, message) => {
	if (message) {
		responses.textContent = message
		return;
	} else {

		data.map(photo => {
			const cardPhoto = createCard(photo)
			responses.append(cardPhoto)
		})
	}
}

let data = []
const responses = document.querySelector("#data")
if(data.length <= 0) displayData([], "No data to be displayed")

const createCard = (photo) => {
	const card = document.createElement("div")
	card.classList.add("card", "my-2")
	card.style.padding = "0"
	card.style.width = "32.5%"

	const img = document.createElement("img")
	img.classList.add("card-img-top")
	img.style.height = "200px"
	img.style.width = "100%"
	img.setAttribute("src", photo.links.download)
	img.setAttribute("alt", photo.alt_description)
	card.append(img)

	const cardBody = document.createElement("div")
	cardBody.classList.add("card-body")
	card.append(cardBody)

	const cardTitle = document.createElement("h5")
	cardTitle.classList.add("card-title")
	cardTitle.textContent = `Posted by: ${photo.user.name}`
	cardBody.append(cardTitle)

	const cardText = document.createElement("p")
	cardText.classList.add("card-text")
	cardText.textContent = `Photo Id: ${photo.id} \n Updated at: ${photo.updated_at}`
	cardBody.append(cardText)

	return card
}

const createOption = (optionText, optionValue) => {
	const opt = document.createElement("option")
	opt.textContent = optionText
	opt.setAttribute("value", optionValue)
	return opt
}