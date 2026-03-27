import { Injectable } from "@nestjs/common";
import { Input, Query, Router } from "nestjs-trpc";
import { paginationInputSchema } from "../../shared/trpc/pagination.schemas";
import type { GetAllNotificationsInput } from "./notifications.schemas";
import { paginatedNotificationsSchema } from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@Injectable()
@Router()
export class NotificationsRouter {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Query({ input: paginationInputSchema, output: paginatedNotificationsSchema })
	getAll(@Input() input: GetAllNotificationsInput) {
		return this.notificationsService.findAll(input);
	}
}
