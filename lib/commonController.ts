/**
 * @author Frederico Ferracini Duarte
 * @since 2022-06-01 12:29:20
 */

import { Request, Response } from "express"
import { Collection, Document, Filter, FindOneAndUpdateOptions, FindOptions, ObjectId } from "mongodb"

export default class CreateCommonController<T extends Document> {
	Model: Collection<T>
	reservedKeys: Array<string>

	constructor (Model: Collection<T>) {
		this.Model = Model

		this.reservedKeys = ['__fields', '__populate', '__sort', '__limit', '__skip', 'on']

		this.verbGetMiddleware = this.verbGetMiddleware.bind(this)
		this.verbGetByIdMiddleware = this.verbGetByIdMiddleware.bind(this)
		this.preUpdateMiddleware = this.preUpdateMiddleware.bind(this)
		this.postUpdateMiddleware = this.postUpdateMiddleware.bind(this)
		this.postInsertMiddleware = this.postInsertMiddleware.bind(this)
		this.verbGet = this.verbGet.bind(this)
		this.verbGetById = this.verbGetById.bind(this)
		this.verbPost = this.verbPost.bind(this)
		this.verbPut = this.verbPut.bind(this)
		this.verbDelete = this.verbDelete.bind(this)
		this.verbCopy = this.verbCopy.bind(this)
		this.modifiers = this.modifiers.bind(this)
		this.buildFilter = this.buildFilter.bind(this)
	}

	verbGetMiddleware(models: any): any { return models }
	verbGetByIdMiddleware(model: any): any { return model }
	preUpdateMiddleware(id: string, param: any) { return param }
	postUpdateMiddleware(updateJson: any, model: any) { return model }
	postInsertMiddleware(insertJson: any, model: any) { return model }

	modifiers(query: any) {
		return {
			fields: JSON.parse(query.__fields || '[]'),
			populate: JSON.parse(query.__populate || '[]'),
			sort: JSON.parse(query.__sort || '{}'),
			limit: Number(query.__limit || '0'),
			skip: Number(query.__skip || '0'),
		}
	}

	buildFilter(query: any) {
		const filter: any = {}

		for (const key in query) {
			if (!this.reservedKeys.includes(key)) {
				if (/__regex$/.test(key)) {
					filter[key.replace(/__regex$/, '')] = {'$regex': new RegExp(query[key].replace(/\//g, ''))}
				} else if (/__json$/.test(key)) {
					filter[key.replace(/__json$/, '')] = JSON.parse(query[key])
				} else {
					filter[key] = query[key]
				}
			}
		}

		return filter
	}

    verbGet(request: Request, response: Response) {
		const {query} = request
		const filter = this.buildFilter(query)
		const {fields, populate, sort, limit, skip} = this.modifiers(query)

		const options: FindOptions<T> = {
			projection: fields,
			limit: limit,
			skip: skip,
			sort: sort,
		}

        const cursor = this.Model.find(filter, options)

		cursor.toArray()
		.then(models => this.verbGetMiddleware(models))
        .then(models => response.json(models))
        .catch(error => response.json({error}))
    }

	verbGetById(request: Request, response: Response) {
		const {query} = request
		const id = request.params.id
		const {fields, populate, sort, limit, skip} = this.modifiers(query)
		const filter: Filter<Document> = {_id: new ObjectId(id)}

		const options: FindOptions<Document> = {
			projection: fields,
			limit: limit,
			skip: skip,
			sort: sort,
		}

		this.Model.findOne(filter, options)
		.then(this.verbGetByIdMiddleware)
        .then(model => response.json(model))
        .catch(error => response.json({error}))
	}

	verbPost(request: Request, response: Response) {
		const param = request.body
		const isArray = Array.isArray(param)
		const models = isArray ? param : [param]

		this.Model.insertMany(models)
		.then(model => this.postInsertMiddleware(models, model))
		.then(model => response.json(model))
        .catch(error => response.json({error}))
	}

	verbPut(request: Request, response: Response) {
		const id = request.params.id
		const param = request.body
		const newParam = this.preUpdateMiddleware(id, param)
		const {fields, populate} = this.modifiers(param)
		const filter: Filter<Document> = {_id: new ObjectId(id)}

		const options: FindOneAndUpdateOptions = {
			projection: fields,
			returnDocument: 'after',
			upsert: true,
		}

		this.Model.findOneAndUpdate(filter, {$set: newParam}, options)
		.then(model => this.postUpdateMiddleware(newParam, model))
		.then(model => response.json(model))
		.catch(error => response.json({error}))
	}

	verbDelete(request: Request, response: Response) {
		const id = request.params.id
		const filter: Filter<Document> = {_id: new ObjectId(id)}

		this.Model.deleteOne(filter)
		.then(model => response.json(model))
		.catch(error => response.json({error}))
	}

	verbCopy(request: Request, response: Response) {
	}

	verbPatch(request: Request, response: Response) {
	}
}
