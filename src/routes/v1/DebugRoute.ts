import {
  methods,
  Route,
  type ApiRequest,
  type ApiResponse,
} from "@sapphire/plugin-api";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<Route.Options>({
  route: "v1/debug",
})
export default class DebugRoute extends Route {
  public [methods.POST](req: ApiRequest, res: ApiResponse) {
    if (req.headers.authorization !== "sauceysucks100") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { code } = req.body as { code: string };
    try {
      const output = eval(code);

      return res.json({ output });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
