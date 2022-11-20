import util from "util";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = util.promisify(require("request"));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const callRpc = async (url: string, method: string, params?: any) => {
  const options = {
    method: "POST",
    url,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  };
  const res = await request(options);
  return JSON.parse(res.body).result;
};
