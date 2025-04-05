import { format } from "@custom-types/format";
import { ResultResponse } from "@utils/result";

export interface Idownloader {
    download(url:string, format?:format): Promise<ResultResponse<string,Error>>
}