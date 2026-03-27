import { Injectable } from "@nestjs/common";
import { Query, Router } from "nestjs-trpc";
import { z } from "zod";
import { notificationSchema } from "./notifications.schemas";
import { NotificationsService } from "./notifications.service";

@Injectable()
@Router()
export class NotificationsRouter {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Query({ output: z.array(notificationSchema) })
	getAll() {
		return this.notificationsService.findAll();
	}
}
