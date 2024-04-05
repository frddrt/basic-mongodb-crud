/**
 * @author Frederico Ferracini Duarte
 * @since 2022-06-01 12:25:57
 */

import { Router } from "express"
import CreateCommonController from "./commonController"

export default (router: Router, route: string, controller: CreateCommonController) => {
	const {
		verbGet,
		verbPost,
		verbPut,
		verbDelete,
		verbGetById,
		verbCopy,
		verbPatch
	} = controller
	const routeWithId = `${route}/:id`

	if (verbGet) router.get(route, verbGet)
	if (verbGetById) router.get(routeWithId, verbGetById)
	if (verbPost) router.post(route, verbPost)
	if (verbPut) router.put(routeWithId, verbPut)
	if (verbDelete) router.delete(routeWithId, verbDelete)
	if (verbCopy) router.copy(route, verbCopy)
	if (verbPatch) router.patch(routeWithId, verbPatch)
}
