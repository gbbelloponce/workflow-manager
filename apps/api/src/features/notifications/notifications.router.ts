import { Injectable } from "@nestjs/common";
import { Input, Query, Router } from "nestjs-trpc";
import type { GetAllNotificationsInput } from "./notifications.schemas";
import {
	getAllNotificationsInputSchema,
	paginatedNotificationsSchema,
} from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@Injectable()
@Router()
export class NotificationsRouter {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Query({
		input: getAllNotificationsInputSchema,
		output: paginatedNotificationsSchema,
	})
	getAll(@Input() input: GetAllNotificationsInput) {
		return this.notificationsService.findAll(input);
	}
}
