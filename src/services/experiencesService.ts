import { createCrudService } from "./crudService";

export const experiencesService = createCrudService("experiences", {
  orderBy: "start_time",
  ascending: false,
});
