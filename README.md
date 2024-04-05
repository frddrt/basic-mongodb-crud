# BasicMongodbCrud

This repository contains a set of common utilities for creating CRUD (Create, Read, Update, Delete) routes and controllers using MongoDb with TypeScript.

## Installation

```shell
$ npm install @ferracinitec/basic-mongodb-crud
```

## Importing

```JavaScript
import basicMongodbCrud from '@ferracinitec/basic-mongodb-crud'
```
or
```JavaScript
import { CreateCommonController, createCommonRoute } from '@ferracinitec/basic-mongodb-crud'
```

## Example

This example provides a URL `<your site>/mobile` with the HTTP verbs GET (all records using `/` or `/[id]` for a specific one), POST, PUT, DELETE, COPY, and PATCH.

```JavaScript
import express from 'express'
import basicMongodbCrud from '@ferracinitec/basic-mongodb-crud'
import { MongoClient } from "mongodb"

// Create a public router
const publicRouter = express.Router()

// Connect to MongoDB
const params = new URLSearchParams()

params.append("retryWrites", "true")
params.append("w", "majority")

const { DBHOST, DBPORT, DATABASE, COLLECTION } = process.env
const uri = `mongodb://${DBHOST}:${DBPORT}/?${params.toString()}`
const dbClient = new MongoClient(uri)
const mobile: Collection<Document> = dbClient.db(DATABASE).collection(COLLECTION)

// Create a controller and define a route for GET, POST, PUT, DELETE.
const mobileController = basicMongodbCrud.create(publicRouter, '/mobile', mobile)
```

or

```JavaScript
import express from 'express'
import { CreateCommonController, createCommonRoute } from '@ferracinitec/basic-mongodb-crud'
import { MongoClient } from "mongodb"

// Create a public router
const publicRouter = express.Router()

// Connect to MongoDB
const params = new URLSearchParams()

params.append("retryWrites", "true")
params.append("w", "majority")

const { DBHOST, DBPORT, DATABASE, COLLECTION } = process.env
const uri = `mongodb://${DBHOST}:${DBPORT}/?${params.toString()}`
const dbClient = new MongoClient(uri)
const mobile: Collection<Document> = dbClient.db(DATABASE).collection(COLLECTION)

// Create a controller
const mobileController = new CreateCommonController(mobile)

// Define a route for GET, POST, PUT, DELETE
createCommonRoute(publicRouter, '/mobile', mobileController)
```

## Custom Controller

To create a custom controller, you should extend the CreateCommonController class and override the following methods:

- **verbGetMiddleware**: Executed after the _find_ in _verbGet_, receiving an array with mongodb models. The data can be modified and must be returned.
- **verbGetByIdMiddleware**: Same as the _verbGetMiddleware_, but executed in _verbGetById_ and receives and returns a single model.
- **preUpdateMiddleware**: Before the update in _verbPut_. Receives the ID and the parameters. Must return the parameters to update.
- **postUpdateMiddleware**: After the update in _verbPut_. Receives the updated model to execute other actions. Must return a model.
- **postInsertMiddleware**: After the insert in _verbPost_. Receives the new model to execute other actions. Must return a model.
- **verbGet**: Returns an array with the documents searched according to the provided filter.
- **verbGetById**: Returns a single model, according to the ID given in the URL.
- **verbPost**: Inserts a new model, according to the parameters in the body.
- **verbPut**: Updates a model found according to the ID given in the URL with data in the body.
- **verbDelete**: Deletes a model found according to the ID given in the URL.
- **verbCopy**: Does nothing. Needs implementation.
- **verbPatch**: Does nothing. Needs implementation.

## Documentation

### HTTP Verb GET

#### A filter can be executed by passing any field of the document in a URL.

```javascript
const token = 'a Bearer token'
const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)

const config = {
	method: 'get',
	mode: 'cors',
	headers: headers,
	redirect: 'follow'
}

const params = new URLSearchParams()
params.append('manufacturer', 'motorola')

const url = `http://localhost/mobile?${params.toString()}`
fetch(url, config)
.then(response => response.json())
.then(data => {
	...
})
.catch(error => console.log('[getDevices]', error))
```

#### Regular expressions can be used like this:

```javascript
const token = 'a Bearer token'
const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)

const config = {
	method: 'get',
	mode: 'cors',
	headers: headers,
	redirect: 'follow'
}

const params = new URLSearchParams()
params.append('manufacturer__regex', '[Mm]otorola')

const url = `http://localhost/mobile?${params.toString()}`
fetch(url, config)
.then(response => response.json())
.then(data => {
	...
})
.catch(error => console.log('[getDevices]', error))
```

#### Also JSON-specific commands:

```javascript
const token = 'a Bearer token'
const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)

const config = {
	method: 'get',
	mode: 'cors',
	headers: headers,
	redirect: 'follow'
}

const params = new URLSearchParams()
params.append('manufacturer__json', JSON.stringify({
	"$in": [
		"motorola",
		"apple"
	]
}))

const url = `http://localhost/mobile?${params.toString()}`
fetch(url, config)
.then(response => response.json())
.then(data => {
	...
})
.catch(error => console.log('[getDevices]', error))
```

<!-- #### To populate submodels, use `__populate`:

```javascript
const token = 'a Bearer token'
const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)

const config = {
	method: 'get',
	mode: 'cors',
	headers: headers,
	redirect: 'follow'
}

const params = new URLSearchParams()
params.append('manufacturer', 'motorola')
params.append('__populate', JSON.stringify([
	{path: "models"}
]))

const url = `http://localhost/mobile?${params.toString()}`
fetch(url, config)
.then(response => response.json())
.then(data => {
	...
})
.catch(error => console.log('[getDevices]', error))
``` -->

#### Also use
- `__fields` to determine a list of fields to display;
- `__sort` for sorting results
- `__limit` to limit the number of results.

#### To retrieve a specific document

Pass the document ID in the URL.

```javascript
const token = 'a Bearer token'
const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)

const config = {
	method: 'get',
	mode: 'cors',
	headers: headers,
	redirect: 'follow'
}

const url = `http://localhost/mobile/${device._id}`
fetch(url, config)
.then(response => response.json())
.then(data => {
	...
})
.catch(error => console.log('[getDevices]', error))
```

### HTTP Verb POST

To create a new document, perform a POST request to the URL and pass the document in the request body.

```javascript
const url = 'http://localhost/mobile'
const token = 'a Bearer token'

const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)
headers.append('Content-Type', 'application/json')

const config = {
	method: 'post',
	mode: 'cors',
	headers: headers,
	redirect: 'follow',
	body: JSON.stringify({
		manufacture: 'motorola',
		model: 'Moto Gx',
	})
}

fetch(url, config)
.then(response => response.json())
.then(data => setDevice(data))
.catch(error => console.log('[saveDeviceInfo]', error))
```

### HTTP Verb PUT

To update a document, perform a PUT request to the URL, passing the document ID in URL and the fields to be updated in the request body.

```javascript
const id = device._id
const url = `http://localhost/mobile/${id}`
const token = 'a Bearer token'

const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)
headers.append('Content-Type', 'application/json')

const config = {
	method: 'put',
	mode: 'cors',
	headers: headers,
	redirect: 'follow',
	body: JSON.stringify({
		model: 'Moto Gxyz',
	})
}

fetch(url, config)
.then(response => response.json())
.then(data => setDevice(data))
.catch(error => console.log('[saveDeviceInfo]', error))
```

### HTTP Verb DELETE

To delete a document, perform a DELETE request to the URL passing the document ID in the URL.

```javascript
const id = device._id
const url = `http://localhost/mobile/${id}`
const token = 'a Bearer token'

const headers: Headers = new Headers()
headers.append('Authorization', `Bearer ${token}`)
headers.append('Content-Type', 'application/json')

const config = {
	method: 'delete',
	mode: 'cors',
	headers: headers,
	redirect: 'follow',
}

fetch(url, config)
.then(response => response.json())
.then(data => setDevice(data))
.catch(error => console.log('[saveDeviceInfo]', error))
```
