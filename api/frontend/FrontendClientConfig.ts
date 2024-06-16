import { ComponentMetadata } from "./FrontendPlugin";

export interface FrontendClientConfig {
    name?: string;
    servers?: string[];
    editors?: ComponentMetadata[];
    graphics?: ComponentMetadata[];
    identify?: boolean;
}