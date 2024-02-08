import {
  methods,
  Route,
  type ApiRequest,
  type ApiResponse,
} from "@sapphire/plugin-api";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Route.Options>({
  route: "v1/cache",
})
export default class CacheRoute extends Route {
  public [methods.GET](_req: ApiRequest, res: ApiResponse) {
    return res.json(this.container.webCache.cache);
  }
}
